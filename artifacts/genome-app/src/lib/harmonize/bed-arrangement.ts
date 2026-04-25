// DNA-derived bed arrangement.
//
// Builds a slow chord progression from the user's belief data:
//
// 1. Mode is selected from the GLOBAL centroid (average of all explored
//    scores). >5.5 → Lydian (bright/aspirational), 4.5–5.5 → Ionian
//    (settled/balanced), <4.5 → Aeolian (introspective). This is the only
//    place the bed reflects the user's overall "mood."
//
// 2. Each category becomes one sustained chord region whose root degree is
//    chosen by that category's average score. Confidence-weighted average so
//    one high-confidence answer doesn't get drowned by many low-conf ones.
//
// 3. Categories with zero explored cells get a "neutral" tonic chord so the
//    bed never goes silent mid-arrangement.
//
// The output is fully deterministic given the same input cells, which means
// the same DNA always sounds the same when harmonized — the user can hear
// their own progress over time.

import type {
  BedArrangement,
  BedMode,
  BedRegion,
  HarmonizerCell,
} from './types';

// One octave of base frequencies for each mode. Each array is the scale
// degrees [I, II, III, IV, V, VI, VII] in Hz.
//
// Anchored at C4 (was C3). The C3 register made the bed feel heavy /
// brooding even in Lydian. C4 sits closer to the pentatonic overlay
// and reads as "lift." Intervals unchanged so per-DNA mode/chord
// selection still produces audibly different progressions.
const SCALE_HZ: Record<BedMode, ReadonlyArray<number>> = {
  // C Lydian: C D E F# G A B  (raised 4th)
  lydian:  [261.63, 293.66, 329.63, 369.99, 392.00, 440.00, 493.88],
  // C Ionian: C D E F G A B
  ionian:  [261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88],
  // C Aeolian: C D Eb F G Ab Bb (natural minor)
  aeolian: [261.63, 293.66, 311.13, 349.23, 392.00, 415.30, 466.16],
};

// Triad templates — scale-degree offsets (0-indexed) relative to the chord root.
const TRIAD_DEGREES: ReadonlyArray<number> = [0, 2, 4];

/** Average bed-region duration. 124 cells × ~250ms ≈ 31s total runtime. */
const DEFAULT_TOTAL_MS = 30000;

function pickMode(globalCentroid: number | null): BedMode {
  if (globalCentroid === null) return 'ionian';
  if (globalCentroid > 5.5) return 'lydian';
  if (globalCentroid < 4.5) return 'aeolian';
  return 'ionian';
}

/** Map a 0–9 score to a scale-degree root index (0–6, repeating). */
function scoreToRootDegree(score: number): number {
  // 0,1 → I (degree 0)   — strong falses sit on the tonic (most "settled")
  // 2,3 → VI (degree 5)
  // 4,5 → IV (degree 3)  — balanced sits on the warm subdominant
  // 6,7 → II (degree 1)
  // 8,9 → V (degree 4)   — strong trues sit on the bright dominant
  if (score <= 1) return 0;
  if (score <= 3) return 5;
  if (score <= 5) return 3;
  if (score <= 7) return 1;
  return 4;
}

function buildTriad(mode: BedMode, rootDegree: number): number[] {
  const scale = SCALE_HZ[mode];
  return TRIAD_DEGREES.map(offset => {
    const idx = (rootDegree + offset) % scale.length;
    return scale[idx];
  });
}

/** Group cells by their catKey, preserving first-seen order. */
function groupByCategory(
  cells: ReadonlyArray<HarmonizerCell>,
): { catKey: string; cells: HarmonizerCell[] }[] {
  const order: string[] = [];
  const map = new Map<string, HarmonizerCell[]>();
  for (const cell of cells) {
    if (!map.has(cell.catKey)) {
      order.push(cell.catKey);
      map.set(cell.catKey, []);
    }
    map.get(cell.catKey)!.push(cell);
  }
  return order.map(catKey => ({ catKey, cells: map.get(catKey)! }));
}

/**
 * Confidence-weighted mean score for a category, ignoring unexplored cells.
 * Returns null if the category has no explored cells.
 */
function categoryAverage(cells: ReadonlyArray<HarmonizerCell>): number | null {
  let weighted = 0;
  let weight = 0;
  for (const c of cells) {
    if (c.score === undefined) continue;
    const w = Math.max(0.1, (c.conf ?? 0) / 100); // floor weight at 0.1
    weighted += c.score * w;
    weight += w;
  }
  if (weight === 0) return null;
  return weighted / weight;
}

function globalCentroid(cells: ReadonlyArray<HarmonizerCell>): number | null {
  let weighted = 0;
  let weight = 0;
  for (const c of cells) {
    if (c.score === undefined) continue;
    const w = Math.max(0.1, (c.conf ?? 0) / 100);
    weighted += c.score * w;
    weight += w;
  }
  if (weight === 0) return null;
  return weighted / weight;
}

export function buildBedArrangement(
  cells: ReadonlyArray<HarmonizerCell>,
  totalMs: number = DEFAULT_TOTAL_MS,
): BedArrangement {
  const mode = pickMode(globalCentroid(cells));
  const groups = groupByCategory(cells);

  if (groups.length === 0) {
    // Fully empty — return a single tonic region so callers don't have to
    // special-case "no bed."
    return {
      mode,
      regions: [{ startMs: 0, durationMs: totalMs, chordHz: buildTriad(mode, 0) }],
    };
  }

  // Each region's duration is proportional to the number of cells it covers,
  // matching the overlay timing exactly.
  const totalCells = cells.length;
  const regions: BedRegion[] = [];
  let cursor = 0;

  for (const group of groups) {
    const fraction = group.cells.length / totalCells;
    const durationMs = Math.max(1500, Math.round(totalMs * fraction));
    const avg = categoryAverage(group.cells);
    // Unexplored category: neutral tonic chord (still audible).
    const rootDegree = avg === null ? 0 : scoreToRootDegree(Math.round(avg));
    regions.push({
      startMs: cursor,
      durationMs,
      chordHz: buildTriad(mode, rootDegree),
    });
    cursor += durationMs;
  }

  return { mode, regions };
}
