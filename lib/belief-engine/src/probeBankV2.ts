// V2 probe bank loader.
// Mirrors the desktop's `src/agents/probeBankV2.json` byte-for-byte. Loaded
// once at module init; the file is the canonical source of truth for probe
// metadata used by phase-residual coherence (pair_id / orientation / etc.).
//
// Required invariants (validated below; throws on import if violated):
//   - 12 probes per primary_dim
//   - 6 pairs per primary_dim
//   - 2 probes per pair (one canonical, one inverted)
//   - both probes in a pair share the same primary_dim
//   - pair_partner_id is reciprocal between the two probes in a pair
//   - probe ids are globally unique; pair ids are unique within a dim
//
// Loaded as a static JSON import so the same module works in Node (API
// server, tsx) and in a Vite browser bundle (genome-app). The file is
// ~727KB; bundlers tree-shake it into the consuming graph once.

import probeBankFile from './probeBankV2.json';

export type ProbeOrientation = 'canonical' | 'inverted';
export type ProbeFrameType =
  | 'standard' | 'personal' | 'societal'
  | 'edge_case' | 'rotated_concrete' | 'rotated_abstract';

export interface ProbeV2 {
  id: string;
  text: string;
  category: string;
  primary_dim: number;
  dim_name?: string;
  dim_short?: string;
  pair_id: string;
  orientation: ProbeOrientation;
  frame_type: ProbeFrameType;
  expected_loading: number;
  direction: 1 | -1;
  source?: string;
  pair_partner_id: string;
}

/**
 * The 6-field metadata blob persisted on every belief_response and probe row
 * that originated from a V2 probe. This is the canonical shape phase recovery
 * reads from. Kept narrow on purpose — the larger ProbeV2 shape carries
 * authoring metadata (text, category, frame_type) that ingest doesn't need.
 */
export interface ProbeV2Meta {
  id: string;
  primary_dim: number;
  pair_id: string;
  orientation: ProbeOrientation;
  expected_loading: number;
  pair_partner_id: string;
}

interface ProbeBankFile {
  version: string;
  generated_at: string;
  description: string;
  total_probes: number;
  probes_per_dim: number;
  pairs_per_dim: number;
  total_dims: number;
  total_pairs: number;
  probes: ProbeV2[];
}

const FILE = probeBankFile as unknown as ProbeBankFile;

export const PROBE_BANK_V2: readonly ProbeV2[] = Object.freeze(FILE.probes);
export const PROBE_BANK_V2_META = Object.freeze({
  version: FILE.version,
  generated_at: FILE.generated_at,
  total_probes: FILE.total_probes,
  total_dims: FILE.total_dims,
  total_pairs: FILE.total_pairs,
});

// ── Indexes (built once at module load) ──────────────────────────

const byId = new Map<string, ProbeV2>();
const byText = new Map<string, ProbeV2>();
const byDim = new Map<number, ProbeV2[]>();

for (const p of PROBE_BANK_V2) {
  byId.set(p.id, p);
  byText.set(p.text, p);
  if (!byDim.has(p.primary_dim)) byDim.set(p.primary_dim, []);
  byDim.get(p.primary_dim)!.push(p);
}

// ── Validation (throws on first violation) ───────────────────────

function validateProbeBankV2(): void {
  if (PROBE_BANK_V2.length !== FILE.total_probes) {
    throw new Error(`probeBankV2: header says ${FILE.total_probes} probes, file has ${PROBE_BANK_V2.length}`);
  }
  if (byId.size !== PROBE_BANK_V2.length) {
    throw new Error('probeBankV2: duplicate probe id');
  }
  if (byText.size !== PROBE_BANK_V2.length) {
    throw new Error('probeBankV2: duplicate probe text');
  }
  if (byDim.size !== FILE.total_dims) {
    throw new Error(`probeBankV2: header says ${FILE.total_dims} dims, indexed ${byDim.size}`);
  }
  for (const [dim, probes] of byDim) {
    if (probes.length !== FILE.probes_per_dim) {
      throw new Error(`probeBankV2: dim ${dim} has ${probes.length} probes, expected ${FILE.probes_per_dim}`);
    }
    const pairs = new Map<string, ProbeV2[]>();
    for (const p of probes) {
      if (!pairs.has(p.pair_id)) pairs.set(p.pair_id, []);
      pairs.get(p.pair_id)!.push(p);
    }
    if (pairs.size !== FILE.pairs_per_dim) {
      throw new Error(`probeBankV2: dim ${dim} has ${pairs.size} pairs, expected ${FILE.pairs_per_dim}`);
    }
    for (const [pid, pp] of pairs) {
      if (pp.length !== 2) throw new Error(`probeBankV2: pair ${pid} has ${pp.length} probes`);
      const orients = pp.map(x => x.orientation).sort();
      if (orients[0] !== 'canonical' || orients[1] !== 'inverted') {
        throw new Error(`probeBankV2: pair ${pid} orientations ${JSON.stringify(orients)}`);
      }
      if (pp[0].primary_dim !== pp[1].primary_dim) {
        throw new Error(`probeBankV2: pair ${pid} primary_dim mismatch`);
      }
      if (pp[0].pair_partner_id !== pp[1].id || pp[1].pair_partner_id !== pp[0].id) {
        throw new Error(`probeBankV2: pair ${pid} partner id non-reciprocal`);
      }
    }
  }
}

validateProbeBankV2();

// ── Public lookups ───────────────────────────────────────────────

export function getProbeV2ById(id: string): ProbeV2 | undefined {
  return byId.get(id);
}

export function getProbeV2ByText(text: string): ProbeV2 | undefined {
  return byText.get(text);
}

export function getDimensionProbesV2(dimId: number): readonly ProbeV2[] {
  return byDim.get(dimId) ?? [];
}

export function listV2Dimensions(): number[] {
  return [...byDim.keys()].sort((a, b) => a - b);
}

/**
 * Extract the narrow 6-field metadata blob that gets persisted on
 * belief_responses.probe_v2 and probes.probe_v2.
 */
export function extractProbeV2Meta(probe: ProbeV2): ProbeV2Meta {
  return {
    id:               probe.id,
    primary_dim:      probe.primary_dim,
    pair_id:          probe.pair_id,
    orientation:      probe.orientation,
    expected_loading: probe.expected_loading,
    pair_partner_id:  probe.pair_partner_id,
  };
}

/**
 * Build a legacy `dimensionWeights` map ({ [dimId]: { direction, weight } })
 * from a V2 probe so the rest of the ingest pipeline (which reasons in
 * dimensionWeights) doesn't need to change. V2 probes always load primarily
 * onto a single dim; we use `expected_loading` as the weight on that dim.
 */
export function buildDimensionWeightsV2(probe: ProbeV2): Record<string, { direction: number; weight: number }> {
  return {
    [String(probe.primary_dim)]: {
      direction: probe.direction === -1 ? -1 : 1,
      weight:    probe.expected_loading,
    },
  };
}

/**
 * Pick a random V2 probe whose text is not in the exclusion list. Used by
 * the probe queue refill. Returns undefined when every V2 probe has already
 * been served (1488 is plenty for any individual user).
 */
export function pickV2ProbeExcluding(excludeTexts: ReadonlySet<string>): ProbeV2 | undefined {
  // Build a candidate pool (this is small enough — 1488 — that filtering
  // up-front is cheaper than rejection sampling against a large excluded set).
  const candidates = PROBE_BANK_V2.filter(p => !excludeTexts.has(p.text));
  if (candidates.length === 0) return undefined;
  return candidates[Math.floor(Math.random() * candidates.length)];
}
