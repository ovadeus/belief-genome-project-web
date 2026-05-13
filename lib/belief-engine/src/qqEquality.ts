// QQ-equality computation for paired-framing probes.
//
// TypeScript port of desktop's `src/agents/qqEquality.js` — kept intentionally
// byte-equivalent in math so web and desktop emit identical statistics for
// shared fixtures. If you need to fix a bug here, fix it on desktop too and
// regenerate parity fixtures in lockstep.
//
// Implements the stratified extension of Wang, Solloway, Shiffrin, and
// Busemeyer (2014, PNAS) proposed in Meyers, "Belief in Superposition"
// (Frontiers 2026, Section 6).
//
// ── What this computes ────────────────────────────────────────────────
//
// Wang et al.'s parameter-free QQ equality states that, under quantum
// probability rules, for two related questions Q1 and Q2 with binary
// outcomes administered in randomized orders across a sample:
//
//   q  =  [ P(Y,N | order1) + P(N,Y | order1) ]
//       − [ P(Y,N | order2) + P(N,Y | order2) ]
//     ≈  0
//
// where order1 = Q1-then-Q2, order2 = Q2-then-Q1, Y = "agree-pole" answer,
// N = "disagree-pole" answer. The |q| MAGNITUDE is the statistic; classical
// probability can produce systematic non-zero values, quantum probability
// predicts q ≈ 0 within sampling tolerance.
//
// For BGP framing pairs:
//   Q1 = canonical probe of dimension d  (e.g. "X is true")
//   Q2 = inverted   probe of dimension d  (e.g. "X is false")
//   order1 = canonical served first to the respondent
//   order2 = inverted   served first to the respondent
//
// Substantive responses are on the 1–9 belief range. To form binary outcomes
// we orientation-correct the inverted response (i' = 10 − i) so both probes
// report on the same underlying belief direction, then dichotomize at the
// superposition midpoint:
//   Y  (agree-pole)    ↔  score >= 6
//   N  (disagree-pole) ↔  score <= 4
//   excluded            ↔  score == 5 (the midpoint itself — see below)
//
// ── Midpoint exclusion at this step ───────────────────────────────────
// A respondent who answered 5 on either probe contributes a SUPERPOSITION
// signal to the per-respondent A–E phase-coherence reading. They are
// excluded from THIS particular dichotomized statistic because the
// dichotomy is between resolved-poles only. However, midpoint-answerers
// are NOT thrown away — they appear in the STRATIFIED analysis below,
// where the Phase-1 baseline score determines the analytical stratum.
//
// ── Non-response exclusion ─────────────────────────────────────────────
// Per the paper Section 6.2, responses coded 0 (non-substantive non-
// response — recorded here as response.value === null / skipped === true)
// are excluded from all QQ-based computations and qubit reconstructions.
//
// ── Stratified extension (the paper's central test, Section 6.1) ──────
// Respondents are sorted into strata on the basis of their Phase 1
// baseline substantive score:
//   resolved-low      stratum:  baseline ∈ {1, 2, 3}
//   near-midpoint-low stratum:  baseline == 4
//   midpoint          stratum:  baseline == 5   ← the cognitively active state
//   near-midpoint-high stratum: baseline == 6
//   resolved-high     stratum:  baseline ∈ {7, 8, 9}
// (Respondents coded 0 in Phase 1 are excluded from stratification.)
//
// Phase 2 paired responses are then attributed back to the respondent's
// Phase 1 stratum, and the QQ magnitude is computed within each stratum.
// The superposition interpretation predicts the midpoint stratum will
// exhibit a systematically larger QQ magnitude than the weighted average
// of its adjacent strata.

export type StratumId =
  | 'resolved-low'
  | 'near-midpoint-low'
  | 'midpoint'
  | 'near-midpoint-high'
  | 'resolved-high';

export interface StratumDef {
  id: StratumId;
  baseline: number[];
}

export const STRATA: Record<
  'RESOLVED_LOW' | 'NEAR_MIDPOINT_LOW' | 'MIDPOINT' | 'NEAR_MIDPOINT_HIGH' | 'RESOLVED_HIGH',
  StratumDef
> = {
  RESOLVED_LOW:        { id: 'resolved-low',        baseline: [1, 2, 3] },
  NEAR_MIDPOINT_LOW:   { id: 'near-midpoint-low',   baseline: [4]       },
  MIDPOINT:            { id: 'midpoint',            baseline: [5]       }, // ← the paper's predicted-distinct stratum
  NEAR_MIDPOINT_HIGH:  { id: 'near-midpoint-high',  baseline: [6]       },
  RESOLVED_HIGH:       { id: 'resolved-high',       baseline: [7, 8, 9] },
};

export function stratumForBaseline(score: number | null | undefined): StratumId | null {
  if (score == null || score === 0) return null; // non-response excluded
  for (const k of Object.keys(STRATA) as Array<keyof typeof STRATA>) {
    if (STRATA[k].baseline.includes(score)) return STRATA[k].id;
  }
  return null;
}

// Orientation-correct an inverted probe response so it speaks in the same
// direction as a canonical probe. Substantive range is 1–9 with midpoint 5;
// reflection through the midpoint flips disagree↔agree.
export function flipInverted(score: number | null | undefined): number | null {
  if (score == null) return null;
  return 10 - score;
}

export type DichotomizedOutcome = 'Y' | 'N' | null;

// Dichotomize an orientation-corrected substantive response into the
// binary outcome required by Wang et al.'s QQ formulation. Returns:
//   'Y' (agree-pole)    if score >= 6
//   'N' (disagree-pole) if score <= 4
//   null                if score == 5 (superposition — excluded from THIS
//                        dichotomized stat; still counted in stratification)
export function dichotomize(score: number | null | undefined): DichotomizedOutcome {
  if (score == null) return null;
  if (score >= 6)    return 'Y';
  if (score <= 4)    return 'N';
  return null; // exact midpoint
}

// ── Input/output types ────────────────────────────────────────────────

export interface QQResponseProbeV2 {
  pair_id: string;
  orientation: 'canonical' | 'inverted';
  primary_dim: number;
}

export interface QQResponse {
  user_id?: string;
  probeV2: QQResponseProbeV2 | null | undefined;
  value: number | null;       // 0–1 internal; null = non-response
  pair_position?: 1 | 2 | null;
  skipped?: boolean;
  created_at: string | Date;
  primary_dim?: number;
}

export interface PairCompleteRecord {
  user_id: string;
  pair_id: string;
  primary_dim: number;
  canonical_value: number;     // 1–9 substantive
  inverted_value: number;      // 1–9 substantive
  first_orientation: 'canonical' | 'inverted';
}

// Group raw paired-probe responses by (user_id, pair_id) and return only
// pair-complete records — users who answered BOTH probes of the same pair.
export function pairCompleteRecords(responses: QQResponse[]): PairCompleteRecord[] {
  const byUserPair = new Map<string, QQResponse[]>();
  for (const r of responses) {
    if (!r.probeV2 || !r.probeV2.pair_id) continue;
    if (r.value == null || r.skipped === true) continue; // non-response excluded
    const userId = r.user_id || 'local';
    const key = `${userId}::${r.probeV2.pair_id}`;
    const arr = byUserPair.get(key) || [];
    arr.push(r);
    byUserPair.set(key, arr);
  }

  const out: PairCompleteRecord[] = [];
  for (const [, arr] of byUserPair.entries()) {
    // Need exactly one canonical and one inverted, both substantive.
    const canonical = arr.find(r => r.probeV2!.orientation === 'canonical');
    const inverted  = arr.find(r => r.probeV2!.orientation === 'inverted');
    if (!canonical || !inverted) continue;

    // Convert the engine's internal 0–1 value to the 1–9 substantive range.
    // Mirrors dnaCalculator.calcDimensionValue's mapping for a single response.
    const toSubstantive = (v: number) => 1 + v * 8;

    // Determine first orientation from pair_position metadata. If absent on
    // legacy rows, fall back to created_at ordering.
    let firstOrientation: 'canonical' | 'inverted';
    if (canonical.pair_position === 1)      firstOrientation = 'canonical';
    else if (inverted.pair_position === 1)  firstOrientation = 'inverted';
    else firstOrientation = (new Date(canonical.created_at) < new Date(inverted.created_at))
                            ? 'canonical' : 'inverted';

    out.push({
      user_id:           canonical.user_id || 'local',
      pair_id:           canonical.probeV2!.pair_id,
      primary_dim:       canonical.probeV2!.primary_dim,
      canonical_value:   toSubstantive(canonical.value as number),
      inverted_value:    toSubstantive(inverted.value as number),
      first_orientation: firstOrientation,
    });
  }
  return out;
}

export interface OrderBreakdown {
  n_total: number;
  n_effective: number;
  midpoint_excluded: number;
  p_YN: number;
  p_NY: number;
  p_YY: number;
  p_NN: number;
}

export interface QQMagnitudeResult {
  qq_magnitude: number | null;
  qq_signed?: number;
  sample_size: number;
  order1_n: number;
  order2_n: number;
  order1_breakdown?: OrderBreakdown;
  order2_breakdown?: OrderBreakdown;
  sufficient: boolean;
  reason?: string;
}

export interface ComputeQQOpts {
  minSamplePerOrder?: number;
}

// Core QQ-magnitude calculation over a collection of pair-complete records.
export function computeQQMagnitude(
  pairComplete: PairCompleteRecord[],
  opts: ComputeQQOpts = {},
): QQMagnitudeResult {
  const minSamplePerOrder = opts.minSamplePerOrder || 30;

  const order1: PairCompleteRecord[] = []; // canonical-first records
  const order2: PairCompleteRecord[] = []; // inverted-first records
  for (const rec of pairComplete) {
    if (rec.first_orientation === 'canonical') order1.push(rec);
    else                                       order2.push(rec);
  }

  if (order1.length < minSamplePerOrder || order2.length < minSamplePerOrder) {
    return {
      qq_magnitude: null,
      sample_size:  pairComplete.length,
      order1_n:     order1.length,
      order2_n:     order2.length,
      sufficient:   false,
      reason:       `Need at least ${minSamplePerOrder} samples per order; have ${order1.length} canonical-first and ${order2.length} inverted-first.`,
    };
  }

  // For each order, classify each respondent's (first_answer, second_answer)
  // as a dichotomized (Y/N, Y/N) pair, after orientation-correcting the
  // inverted probe's response so both probes speak in the same direction.
  function classify(records: PairCompleteRecord[], firstOrient: 'canonical' | 'inverted'): OrderBreakdown {
    let YN = 0, NY = 0, YY = 0, NN = 0, excluded = 0, total = 0;
    for (const r of records) {
      const canonical_dich = dichotomize(r.canonical_value);
      const inverted_dich  = dichotomize(flipInverted(r.inverted_value));
      const first  = firstOrient === 'canonical' ? canonical_dich : inverted_dich;
      const second = firstOrient === 'canonical' ? inverted_dich  : canonical_dich;
      total++;
      if (first == null || second == null) { excluded++; continue; }
      if (first === 'Y' && second === 'N') YN++;
      else if (first === 'N' && second === 'Y') NY++;
      else if (first === 'Y' && second === 'Y') YY++;
      else if (first === 'N' && second === 'N') NN++;
    }
    const n_effective = YN + NY + YY + NN;
    return {
      n_total: total,
      n_effective,
      midpoint_excluded: excluded,
      p_YN: n_effective > 0 ? YN / n_effective : 0,
      p_NY: n_effective > 0 ? NY / n_effective : 0,
      p_YY: n_effective > 0 ? YY / n_effective : 0,
      p_NN: n_effective > 0 ? NN / n_effective : 0,
    };
  }

  const o1 = classify(order1, 'canonical');
  const o2 = classify(order2, 'inverted');

  // Wang et al.'s q-statistic — symmetric-difference form.
  const q = (o1.p_YN + o1.p_NY) - (o2.p_YN + o2.p_NY);

  return {
    qq_magnitude:     Math.abs(q),
    qq_signed:        q,
    sample_size:      pairComplete.length,
    order1_n:         order1.length,
    order2_n:         order2.length,
    order1_breakdown: o1,
    order2_breakdown: o2,
    sufficient:       true,
  };
}

export interface StratifiedQQResult {
  dim_id: number;
  strata: Record<StratumId, QQMagnitudeResult & { stratum: StratumId }>;
  total_pair_complete: number;
  computed_at: string;
}

// Stratified computation — the paper's central test (Section 6.1).
export function computeStratifiedQQ(
  phase1Responses: QQResponse[],
  phase2Responses: QQResponse[],
  dimId: number,
  opts: ComputeQQOpts = {},
): StratifiedQQResult {
  // Phase 1: derive baseline-stratum per user for the target dim.
  const baselineByUser = new Map<string, number>();
  for (const r of phase1Responses) {
    if (r.value == null || r.skipped === true) continue;
    const dim = (r.probeV2 && r.probeV2.primary_dim) || r.primary_dim;
    if (dim !== dimId) continue;
    const userId = r.user_id || 'local';
    // Keep only each user's FIRST substantive response per the paper's design.
    if (baselineByUser.has(userId)) continue;
    const substantive = Math.round(1 + (r.value as number) * 8);
    baselineByUser.set(userId, substantive);
  }

  // Phase 2: pair-complete records on the target dim.
  const pairComplete = pairCompleteRecords(phase2Responses)
    .filter(rec => rec.primary_dim === dimId);

  // Stratify pair-complete records by their user's Phase 1 baseline stratum.
  const byStratum: Partial<Record<StratumId, PairCompleteRecord[]>> = {};
  for (const rec of pairComplete) {
    const baseline = baselineByUser.get(rec.user_id);
    const stratum  = stratumForBaseline(baseline);
    if (!stratum) continue;
    (byStratum[stratum] = byStratum[stratum] || []).push(rec);
  }

  // Compute QQ magnitude per stratum.
  const strata = {} as StratifiedQQResult['strata'];
  for (const stratum of Object.values(STRATA).map(s => s.id)) {
    const records = byStratum[stratum] || [];
    strata[stratum] = {
      stratum,
      ...computeQQMagnitude(records, opts),
    };
  }

  return {
    dim_id:              dimId,
    strata,
    total_pair_complete: pairComplete.length,
    computed_at:         new Date().toISOString(),
  };
}
