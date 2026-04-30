// Calculates the V2 Belief DNA string from user responses
// Pure domain logic — no framework dependencies
import { DIMENSIONS } from './beliefDNA';

// ── DNA String format ────────────────────────────────────────
// 16-char demographic prefix (identical between V1 and V2):
//   Pos 0:      Century (0=1900s, 1=2000s)
//   Pos 1-2:    Birth year within century (00-99)
//   Pos 3-4:    Birth month (01-12)
//   Pos 5-6:    Birth day (01-31)
//   Pos 7:      Sex (0=F,1=M,2=Intersex,5=PNS,9=NB)
//   Pos 8-10:   Country code (ISO 3166-1 numeric, e.g. 840=US, 826=GB)
//   Pos 11-15:  Zip/postal code (5 chars, "00000" if unavailable)
//
// V2 belief segment (248 chars): for each of 124 dimensions, two chars:
//   amplitude `[0-9·]` (0-9 belief score, · if unresolved) followed by
//   coherence `[A-E·]` (A=most internally conflicted, E=most settled,
//   · when there isn't enough evidence to estimate variance).
// Full V2 DNA string: 16-prefix + `-` + 248-segment = 265 chars.
//
// V1 (140 chars, no separator, amplitudes only) is still emitted by
// `buildDNAStringV1` — kept for tests and any narrow back-compat case.

const V2_SEPARATOR = '-';

export interface Accumulator {
  sum: number;
  totalWeight: number;
  // sumSquares: Σ(directed_value^2 × effective_weight). Powers the
  // weighted-variance coherence calculation. Defaults to 0 on rows
  // that pre-date V2 — calcCoherence returns null for variance ≤ 0
  // so legacy rows surface as `·` until back-filled.
  sumSquares: number;
  count: number;
}

export interface UserMeta {
  birthYear?: string | number;
  birthMonth?: string | number;
  birthDay?: string | number;
  sex?: string;
  countryCode?: string;
  zipCode?: string;
}

export interface BeliefHistoryEntry {
  value: number;
  dimensionWeights: Record<string, { direction: number; weight: number }>;
  quality?: { weight?: number };
}

export interface DNAResult {
  dnaString: string;
  dimensionScores: Record<number, number>;
  confidence: Record<number, number>;
  // coherence: per-dimension settled-ness letter ('A'..'E') derived from
  // weighted answer variance. null when count < 3 or variance is degenerate.
  // Encoded as `·` in the V2 DNA string when null.
  coherence: Record<number, string | null>;
  totalResponses: number;
  dimensionsCovered: number;
  overallConfidence: number;
  generatedAt: string;
}

// Build the 16-char demographic prefix shared by V1 and V2.
function buildDemographicPrefix(userMeta?: UserMeta): string {
  const meta = userMeta || {};
  const byRaw = meta.birthYear || '';
  const bmRaw = meta.birthMonth || '';
  const bdRaw = meta.birthDay || '';
  const century = byRaw ? (parseInt(String(byRaw)) >= 2000 ? '1' : '0') : '0';
  const birthYear = byRaw ? String(byRaw).slice(-2).padStart(2, '0') : '00';
  const birthMonth = bmRaw ? String(parseInt(String(bmRaw))).padStart(2, '0') : '00';
  const birthDay = bdRaw ? String(parseInt(String(bdRaw))).padStart(2, '0') : '00';
  const sex = meta.sex ?? '5';

  const countryRaw = meta.countryCode || '';
  const countryCode = countryRaw ? String(countryRaw).replace(/[^0-9]/g, '').slice(0, 3).padStart(3, '0') : '000';
  const zipRaw = meta.zipCode || '';
  const zipCode = zipRaw ? String(zipRaw).replace(/[^A-Za-z0-9]/g, '').slice(0, 5).padEnd(5, '0') : '00000';

  return `${century}${birthYear}${birthMonth}${birthDay}${sex}${countryCode}${zipCode}`;
}

/**
 * Build a V2 Belief DNA string (265 chars: 16-prefix + `-` + 248-segment).
 * The segment interleaves amplitude (0-9 / `·`) and coherence (A-E / `·`)
 * for each of 124 dimensions in canonical DIMENSIONS order. Missing
 * coherence entries fall back to `·` so callers without coherence data
 * still produce a structurally valid V2 string.
 */
export function buildDNAString(
  dimensionScores: Record<number, number>,
  userMeta?: UserMeta,
  coherence?: Record<number, string | null>,
): string {
  const prefix = buildDemographicPrefix(userMeta);
  const coh = coherence || {};

  let segment = '';
  for (const dim of DIMENSIONS) {
    const score = dimensionScores[dim.id];
    if (score !== undefined && score !== null) {
      segment += Math.round(Math.min(9, Math.max(0, score))).toString();
    } else {
      segment += '\u00B7';
    }
    const c = coh[dim.id];
    segment += (c && c >= 'A' && c <= 'E') ? c : '\u00B7';
  }

  return `${prefix}${V2_SEPARATOR}${segment}`;
}

/**
 * Build the legacy V1 Belief DNA string (140 chars: 16-prefix + 124-segment,
 * amplitudes only, no separator). Kept for explicit tests and any narrow
 * back-compat use case. Production paths emit V2 via `buildDNAString`.
 */
export function buildDNAStringV1(dimensionScores: Record<number, number>, userMeta?: UserMeta): string {
  const prefix = buildDemographicPrefix(userMeta);
  let belief = '';
  for (const dim of DIMENSIONS) {
    const score = dimensionScores[dim.id];
    if (score !== undefined && score !== null) {
      belief += Math.round(Math.min(9, Math.max(0, score))).toString();
    } else {
      belief += '\u00B7';
    }
  }
  return `${prefix}${belief}`;
}

export function updateDimensionScores(
  existingScores: Record<number, Accumulator>,
  response: BeliefHistoryEntry
): Record<number, Accumulator> {
  const scores = JSON.parse(JSON.stringify(existingScores || {})) as Record<number, Accumulator>;
  const weights = response.dimensionWeights || {};

  for (const [dimIdStr, wt] of Object.entries(weights)) {
    const dimId = parseInt(dimIdStr);
    if (!scores[dimId]) {
      scores[dimId] = { sum: 0, totalWeight: 0, sumSquares: 0, count: 0 };
    } else if (scores[dimId].sumSquares === undefined) {
      // Defensive: rehydrate legacy accumulator shape from older snapshots.
      scores[dimId].sumSquares = 0;
    }
    // Convert 0-1 response value to -1 to +1 range
    const normalized = (response.value * 2) - 1;
    const directed = normalized * (wt.direction || 1);
    const qualityMult = response.quality?.weight ?? 0.7;
    const effectiveW = wt.weight * qualityMult;

    scores[dimId].sum += directed * effectiveW;
    scores[dimId].sumSquares += directed * directed * effectiveW;
    scores[dimId].totalWeight += effectiveW;
    scores[dimId].count += 1;
  }

  return scores;
}

export function calcDimensionValue(accumulator: Accumulator | null): number | null {
  if (!accumulator || accumulator.totalWeight === 0) return null;
  const avg = accumulator.sum / accumulator.totalWeight;
  return Math.round(((avg + 1) / 2) * 9);
}

// Same as calcDimensionValue but returns the raw 0-9 float (no rounding).
// Used by lineage so deltas reflect the actual underlying movement, not just
// integer-step jumps (most responses only nudge the underlying average).
export function calcDimensionValueRaw(accumulator: Accumulator | null): number | null {
  if (!accumulator || accumulator.totalWeight === 0) return null;
  const avg = accumulator.sum / accumulator.totalWeight;
  return ((avg + 1) / 2) * 9;
}

// ── Lineage / impact contract ──────────────────────────────────
// One impact per (response, dimension) pair. scoreBefore is null when this
// is the first response touching the dimension; in that case delta is taken
// relative to the 4.5 neutral midpoint of the 0-9 range so first responses
// still register a meaningful magnitude.
export interface DimensionImpact {
  dimensionId: number;
  scoreBefore: number | null;   // raw 0-9 average pre-write, or null
  scoreAfter: number;           // raw 0-9 average post-write
  delta: number;                // scoreAfter - (scoreBefore ?? 4.5)
  confidenceBefore: number;     // 0-100
  confidenceAfter: number;      // 0-100
}

// Apply ONE response to a prior accumulator map and return both the next
// accumulator state and the per-dimension impacts. This is the single source
// of truth for "what did this response do?" — both the API ingest path and
// the backfill replay use it so lineage and final scores stay in lockstep.
export function applyResponseToScores(
  prev: Record<number, Accumulator>,
  response: BeliefHistoryEntry
): { next: Record<number, Accumulator>; impacts: DimensionImpact[] } {
  const next = JSON.parse(JSON.stringify(prev || {})) as Record<number, Accumulator>;
  const impacts: DimensionImpact[] = [];
  const weights = response.dimensionWeights || {};

  for (const [dimIdStr, wt] of Object.entries(weights)) {
    const dimId = parseInt(dimIdStr);
    if (!Number.isFinite(dimId)) continue;

    const beforeAcc = next[dimId] ?? null;
    const scoreBefore = calcDimensionValueRaw(beforeAcc);
    const confidenceBefore = calcConfidence(beforeAcc);

    if (!next[dimId]) {
      next[dimId] = { sum: 0, totalWeight: 0, sumSquares: 0, count: 0 };
    } else if (next[dimId].sumSquares === undefined) {
      next[dimId].sumSquares = 0;
    }
    const normalized = (response.value * 2) - 1;
    const directed = normalized * (wt.direction || 1);
    const qualityMult = response.quality?.weight ?? 0.7;
    const effectiveW = (wt.weight ?? 0) * qualityMult;

    next[dimId].sum += directed * effectiveW;
    next[dimId].sumSquares += directed * directed * effectiveW;
    next[dimId].totalWeight += effectiveW;
    next[dimId].count += 1;

    const scoreAfter = calcDimensionValueRaw(next[dimId]);
    const confidenceAfter = calcConfidence(next[dimId]);

    // scoreAfter cannot be null here — we just inserted weight > 0.
    const after = scoreAfter ?? 4.5;
    const delta = after - (scoreBefore ?? 4.5);

    impacts.push({
      dimensionId: dimId,
      scoreBefore,
      scoreAfter: after,
      delta,
      confidenceBefore,
      confidenceAfter,
    });
  }

  return { next, impacts };
}

export function calcConfidence(accumulator: Accumulator | null): number {
  if (!accumulator) return 0;
  const coverage = Math.min(accumulator.count / 8, 1);
  const weight = Math.min(accumulator.totalWeight / 5, 1);
  const consistency = accumulator.count > 1 ? 0.7 : 0.3;
  return Math.round((coverage * 0.3 + weight * 0.4 + consistency * 0.3) * 100);
}

/**
 * Per-dimension coherence letter for V2 DNA. Measures **how internally
 * consistent** the user's answers within this dimension have been —
 * NOT the same as confidence (which measures evidence amount).
 *
 *   E = std < 0.10 (very settled, near-identical answers)
 *   D = std < 0.20
 *   C = std < 0.32
 *   B = std < 0.45
 *   A = std ≥ 0.45 (most internally conflicted)
 *   null = insufficient evidence OR stale/unmigrated row
 *
 * Std is on the directed-and-weighted answer space (range −1..+1, so
 * a std of ~0.50 already means answers cover most of the spectrum).
 *
 * Stale-row detection: any genuine accumulation with non-zero `sum`
 * must produce non-zero `sumSquares` (since both come from the same
 * directed values). The `sumSquares===0 && sum!==0` shape can ONLY
 * occur on pre-V2 rows that were never back-filled — those return
 * null. Rows with `sum===0 && sumSquares===0` are either fully
 * mid-slider answers (perfectly settled at neutral, 'E' is correct)
 * or genuinely empty — distinguishing those is impossible without
 * out-of-band metadata, but the count<3 floor catches the empty
 * case in practice.
 *
 * Floating-point cancellation can make variance go slightly negative
 * for near-identical answers — `Math.max(0, …)` clamps that so
 * std=0 → 'E' rather than NaN.
 */
export function calcCoherence(accumulator: Accumulator | null): string | null {
  if (!accumulator || accumulator.count < 3 || accumulator.totalWeight === 0) return null;
  const ss = accumulator.sumSquares ?? 0;
  // Stale-row marker: real accumulations of non-zero directed values
  // always produce sumSquares > 0. sumSquares===0 with sum!==0 means
  // the row predates V2 and was not back-filled → emit · (unknown).
  if (ss === 0 && accumulator.sum !== 0) return null;
  const mean = accumulator.sum / accumulator.totalWeight;
  const variance = Math.max(0, ss / accumulator.totalWeight - mean * mean);
  const std = Math.sqrt(variance);
  if (std < 0.10) return 'E';
  if (std < 0.20) return 'D';
  if (std < 0.32) return 'C';
  if (std < 0.45) return 'B';
  return 'A';
}

export function rebuildDNA(beliefHistory: BeliefHistoryEntry[], userMeta?: UserMeta): DNAResult {
  let accumScores: Record<number, Accumulator> = {};

  for (const entry of beliefHistory) {
    if (entry.dimensionWeights) {
      accumScores = updateDimensionScores(accumScores, entry);
    }
  }

  const dimensionScores: Record<number, number> = {};
  const confidence: Record<number, number> = {};
  const coherence: Record<number, string | null> = {};
  for (const [dimId, accum] of Object.entries(accumScores)) {
    const val = calcDimensionValue(accum);
    if (val !== null) {
      const id = parseInt(dimId);
      dimensionScores[id] = val;
      confidence[id] = calcConfidence(accum);
      coherence[id] = calcCoherence(accum);
    }
  }

  const dnaString = buildDNAString(dimensionScores, userMeta, coherence);
  const confValues = Object.values(confidence);

  return {
    dnaString,
    dimensionScores,
    confidence,
    coherence,
    totalResponses: beliefHistory.length,
    dimensionsCovered: Object.keys(dimensionScores).length,
    overallConfidence: confValues.length
      ? Math.round(confValues.reduce((s, v) => s + v, 0) / confValues.length)
      : 0,
    generatedAt: new Date().toISOString(),
  };
}

export function getWeakDimensions(beliefHistory: BeliefHistoryEntry[], count = 10): number[] {
  const { confidence, dimensionScores } = rebuildDNA(beliefHistory);
  const needs = DIMENSIONS.map(dim => ({
    dimId: dim.id,
    conf: confidence[dim.id] || 0,
    hasScore: dimensionScores[dim.id] !== undefined,
    priority: dimensionScores[dim.id] !== undefined ? (confidence[dim.id] || 0) : -1,
  }));
  needs.sort((a, b) => a.priority - b.priority);
  return needs.slice(0, count).map(n => n.dimId);
}
