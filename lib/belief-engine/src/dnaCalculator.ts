// Calculates the 140-character Belief DNA string from user responses
// Pure domain logic — no framework dependencies
import { DIMENSIONS } from './beliefDNA';

// ── DNA String format (140 characters) ────────────────────────
// Pos 0:      Century (0=1900s, 1=2000s)
// Pos 1-2:    Birth year within century (00-99)
// Pos 3-4:    Birth month (01-12)
// Pos 5-6:    Birth day (01-31)
// Pos 7:      Sex (0=F,1=M,2=Intersex,5=PNS,9=NB)
// Pos 8-10:   Country code (ISO 3166-1 numeric, e.g. 840=US, 826=GB)
// Pos 11-15:  Zip/postal code (5 chars, "00000" if unavailable)
// Pos 16-139: 124 belief dimensions (0-9 each, ·=unresolved)

export interface Accumulator {
  sum: number;
  totalWeight: number;
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
  totalResponses: number;
  dimensionsCovered: number;
  overallConfidence: number;
  generatedAt: string;
}

export function buildDNAString(dimensionScores: Record<number, number>, userMeta?: UserMeta): string {
  const meta = userMeta || {};
  const byRaw = meta.birthYear || '';
  const bmRaw = meta.birthMonth || '';
  const bdRaw = meta.birthDay || '';
  const century = byRaw ? (parseInt(String(byRaw)) >= 2000 ? '1' : '0') : '0';
  const birthYear = byRaw ? String(byRaw).slice(-2).padStart(2, '0') : '00';
  const birthMonth = bmRaw ? String(parseInt(String(bmRaw))).padStart(2, '0') : '00';
  const birthDay = bdRaw ? String(parseInt(String(bdRaw))).padStart(2, '0') : '00';
  const sex = meta.sex ?? '5';

  // Geographic identity — ISO 3166-1 numeric (3-digit)
  const countryRaw = meta.countryCode || '';
  const countryCode = countryRaw ? String(countryRaw).replace(/[^0-9]/g, '').slice(0, 3).padStart(3, '0') : '000';
  const zipRaw = meta.zipCode || '';
  const zipCode = zipRaw ? String(zipRaw).replace(/[^A-Za-z0-9]/g, '').slice(0, 5).padEnd(5, '0') : '00000';

  let belief = '';
  for (const dim of DIMENSIONS) {
    const score = dimensionScores[dim.id];
    if (score !== undefined && score !== null) {
      belief += Math.round(Math.min(9, Math.max(0, score))).toString();
    } else {
      belief += '\u00B7'; // · untrained — superposition state
    }
  }

  return `${century}${birthYear}${birthMonth}${birthDay}${sex}${countryCode}${zipCode}${belief}`;
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
      scores[dimId] = { sum: 0, totalWeight: 0, count: 0 };
    }
    // Convert 0-1 response value to -1 to +1 range
    const normalized = (response.value * 2) - 1;
    const directed = normalized * (wt.direction || 1);
    const qualityMult = response.quality?.weight ?? 0.7;
    const effectiveW = wt.weight * qualityMult;

    scores[dimId].sum += directed * effectiveW;
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

export function calcConfidence(accumulator: Accumulator | null): number {
  if (!accumulator) return 0;
  const coverage = Math.min(accumulator.count / 8, 1);
  const weight = Math.min(accumulator.totalWeight / 5, 1);
  const consistency = accumulator.count > 1 ? 0.7 : 0.3;
  return Math.round((coverage * 0.3 + weight * 0.4 + consistency * 0.3) * 100);
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
  for (const [dimId, accum] of Object.entries(accumScores)) {
    const val = calcDimensionValue(accum);
    if (val !== null) {
      dimensionScores[parseInt(dimId)] = val;
      confidence[parseInt(dimId)] = calcConfidence(accum);
    }
  }

  const dnaString = buildDNAString(dimensionScores, userMeta);
  const confValues = Object.values(confidence);

  return {
    dnaString,
    dimensionScores,
    confidence,
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
