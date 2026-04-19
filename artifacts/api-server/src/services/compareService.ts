// Compare service — single source of truth for "yours vs theirs" agreement
// math. Used by the auth-gated /api/genome/compare route AND the public
// /api/genome/dna/public/compare/:sigA/:sigB route.
//
// Privacy invariants enforced here (not just at the UI):
//   1. theirs.demographics is ALWAYS null when theirs.format === 'anonymous'.
//      The engine slices the demographic prefix off anonymous signatures
//      anyway, but we double-check here so the privacy boundary holds even
//      if a future engine bug lets demographic data leak through.
//   2. yours.demographics is never returned by this service — the caller
//      already knows their own demographics; we don't need to echo them
//      back in compare payloads.

import {
  decodeSignature,
  beliefSegmentToScores,
  parseDemographicPrefix,
  DIMENSIONS,
  type DecodedSignature,
} from '@belief-genome/engine';

export type AgreementBucket = 'strong' | 'mild' | 'moderate' | 'strong_diff' | 'none';

export interface CompareSidePublic {
  signature: string;
  format: 'anonymous' | 'signed';
  shareableName: string | null;
  note: string | null;
  dimensionScores: Record<number, number>;
  dimensionsCovered: number;
  demographics: ReturnType<typeof parseDemographicPrefix> | null;
}

export interface CompareSideOwn {
  dimensionScores: Record<number, number>;
  totalResponses: number;
  dimensionsCovered: number;
  overallConfidence: number;
}

export interface PerDimComparison {
  yours: number | null;
  theirs: number | null;
  delta: number | null;
  agreement: AgreementBucket;
}

export interface PerCatComparison {
  label: string;
  range: { start: number; end: number };
  totalDims: number;
  shared: number;
  agree: number;
  mild: number;
  moderate: number;
  strongDiff: number;
  agreementRatio: number | null;
}

export interface ComparisonSummary {
  totalShared: number;
  totalAgree: number;
  overallAlignment: number | null;
  perDim: Record<number, PerDimComparison>;
  perCat: Record<string, PerCatComparison>;
  topAlignment: string | null;
  topDivergence: string | null;
}

export interface CompareResult {
  yours: CompareSideOwn | null;          // null in public mode
  theirs: CompareSidePublic;
  comparison: ComparisonSummary | null;  // null in public-only single-side mode
}

// Bucket a delta into one of the five agreement zones. Thresholds match the
// desktop spec exactly — do not adjust without coordinating with desktop.
export function bucketAgreement(yours: number | null | undefined, theirs: number | null | undefined): AgreementBucket {
  if (yours == null || theirs == null) return 'none';
  const d = Math.abs(yours - theirs);
  if (d <= 1) return 'strong';
  if (d <= 3) return 'mild';
  if (d <= 5) return 'moderate';
  return 'strong_diff';
}

/**
 * Decode a signature and produce the public-facing "their side" payload.
 * Demographics are forcibly nulled for anonymous signatures (defense in depth).
 *
 * Throws on invalid signature so the caller can map to a 404. Caller may
 * supply optional library metadata (shareableName, note) when the signature
 * came from a known_dnas row.
 */
export function buildTheirSide(
  signature: string,
  meta?: { shareableName?: string | null; note?: string | null },
): CompareSidePublic {
  const decoded = decodeSignature(signature);
  if (!decoded.valid || !decoded.format) {
    throw new Error('compareService.buildTheirSide: invalid signature');
  }
  return buildTheirSideFromDecoded(decoded, meta);
}

export function buildTheirSideFromDecoded(
  decoded: DecodedSignature,
  meta?: { shareableName?: string | null; note?: string | null },
): CompareSidePublic {
  if (!decoded.valid || !decoded.format) {
    throw new Error('compareService.buildTheirSideFromDecoded: decoded must be valid');
  }
  const dimensionScores = beliefSegmentToScores(decoded.beliefSegment);
  // Privacy: anonymous => demographics MUST be null.
  const demographics = decoded.format === 'signed' && decoded.fullDna
    ? parseDemographicPrefix(decoded.fullDna)
    : null;
  return {
    signature: decoded.signature,
    format: decoded.format,
    shareableName: meta?.shareableName ?? null,
    note: meta?.note ?? null,
    dimensionScores,
    dimensionsCovered: Object.keys(dimensionScores).length,
    demographics,
  };
}

/**
 * Compute the per-dimension and per-category alignment summary between two
 * dimension-score maps. Pure function — no DB or auth coupling.
 */
export function computeComparison(
  yours: Record<number, number>,
  theirs: Record<number, number>,
): ComparisonSummary {
  const perDim: Record<number, PerDimComparison> = {};
  let totalShared = 0;
  let totalAgree = 0;

  // Per-category accumulators keyed by cat key (e.g. 'epistemology').
  const catAcc: Record<string, {
    label: string; start: number; end: number; totalDims: number;
    shared: number; agree: number; mild: number; moderate: number; strongDiff: number;
  }> = {};

  for (const dim of DIMENSIONS) {
    const y = yours[dim.id];
    const t = theirs[dim.id];
    const yVal = (y === undefined || y === null) ? null : y;
    const tVal = (t === undefined || t === null) ? null : t;
    const delta = (yVal != null && tVal != null) ? Math.abs(yVal - tVal) : null;
    const bucket = bucketAgreement(yVal, tVal);
    perDim[dim.id] = { yours: yVal, theirs: tVal, delta, agreement: bucket };

    if (!catAcc[dim.cat]) {
      catAcc[dim.cat] = {
        label: dim.cat, start: dim.id, end: dim.id, totalDims: 0,
        shared: 0, agree: 0, mild: 0, moderate: 0, strongDiff: 0,
      };
    }
    const acc = catAcc[dim.cat];
    acc.totalDims++;
    acc.start = Math.min(acc.start, dim.id);
    acc.end = Math.max(acc.end, dim.id);

    if (bucket !== 'none') {
      acc.shared++;
      totalShared++;
      if (bucket === 'strong')      { acc.agree++; totalAgree++; }
      else if (bucket === 'mild')        acc.mild++;
      else if (bucket === 'moderate')    acc.moderate++;
      else if (bucket === 'strong_diff') acc.strongDiff++;
    }
  }

  const perCat: Record<string, PerCatComparison> = {};
  for (const [k, a] of Object.entries(catAcc)) {
    perCat[k] = {
      label: a.label,
      range: { start: a.start, end: a.end },
      totalDims: a.totalDims,
      shared: a.shared,
      agree: a.agree,
      mild: a.mild,
      moderate: a.moderate,
      strongDiff: a.strongDiff,
      agreementRatio: a.shared > 0 ? Math.round((a.agree / a.shared) * 100) : null,
    };
  }

  const overallAlignment = totalShared > 0 ? Math.round((totalAgree / totalShared) * 100) : null;

  // Top alignment / divergence — only categories with >= 3 shared dims qualify.
  // Ties resolved by deterministic key sort so output is stable.
  const eligible = Object.entries(perCat).filter(([, c]) => c.shared >= 3);

  let topAlignment: string | null = null;
  let topAlignmentScore = -1;
  for (const [k, c] of eligible) {
    const score = c.agreementRatio ?? -1;
    if (score > topAlignmentScore || (score === topAlignmentScore && (topAlignment === null || k < topAlignment))) {
      topAlignment = k;
      topAlignmentScore = score;
    }
  }

  let topDivergence: string | null = null;
  let topDivergenceScore = -1;
  for (const [k, c] of eligible) {
    const score = c.shared > 0 ? (c.moderate + c.strongDiff) / c.shared : -1;
    if (score > topDivergenceScore || (score === topDivergenceScore && (topDivergence === null || k < topDivergence))) {
      topDivergence = k;
      topDivergenceScore = score;
    }
  }

  return {
    totalShared,
    totalAgree,
    overallAlignment,
    perDim,
    perCat,
    topAlignment,
    topDivergence,
  };
}
