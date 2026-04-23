// C major pentatonic centered on C5 (score = 5, the green "Balanced" middle).
//
// Pentatonic was chosen because it stays consonant under any jump pattern —
// adjacent cells in a 124-dim DNA strip can move from score 0 to score 9
// arbitrarily and still sound musical. Diatonic or chromatic scales would
// produce constant dissonance under random jumps.
//
// Below center → lower pitch (Falses), above center → higher pitch (Trues).

export const PITCH_TABLE: ReadonlyArray<number> = [
  261.63, // 0  C4  — Absolute False
  293.66, // 1  D4  — Absolute False
  329.63, // 2  E4  — False
  392.00, // 3  G4  — False
  440.00, // 4  A4  — Balanced (low)
  523.25, // 5  C5  — Balanced (mid)  ← anchor
  587.33, // 6  D5  — Balanced (high)
  659.25, // 7  E5  — True
  783.99, // 8  G5  — True
  880.00, // 9  A5  — Absolute True
];

export const MIDDLE_FREQ = PITCH_TABLE[5];

/** Anti-monotony threshold: variations begin once a score has repeated this many times. */
export const MONOTONY_RUN_THRESHOLD = 3;

/**
 * Three deterministic variations cycled in order once a run reaches the
 * threshold. The pattern repeats: sharp → minor third down → octave up → sharp …
 */
export const VARIATION_FACTORS: ReadonlyArray<number> = [
  Math.pow(2, 1 / 12),  // semitone up (sharp)
  Math.pow(2, -3 / 12), // minor third down
  2,                    // octave up
];
