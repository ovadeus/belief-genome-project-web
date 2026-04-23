// Sequence builder — applies the anti-monotony state machine to the input
// cells in their visual order (caller is responsible for ordering).
//
// Rule: when the same defined score repeats >= MONOTONY_RUN_THRESHOLD times
// in a row, cycle through deterministic pitch variations so the listener
// hears motion. Any score change or unexplored cell resets the run.

import type { HarmonizerCell, SequenceEvent } from './types';
import { PITCH_TABLE, MONOTONY_RUN_THRESHOLD, VARIATION_FACTORS } from './pitch-map';

export function buildSequence(cells: ReadonlyArray<HarmonizerCell>): SequenceEvent[] {
  const events: SequenceEvent[] = [];
  let prevScore: number | undefined;
  let run = 1;

  for (const cell of cells) {
    const conf = cell.conf ?? 0;

    if (cell.score === undefined) {
      events.push({ dimId: cell.dimId, catKey: cell.catKey, kind: 'tick', freq: 0, conf });
      prevScore = undefined;
      run = 1;
      continue;
    }

    if (cell.score === prevScore) run += 1;
    else run = 1;

    const baseFreq = PITCH_TABLE[cell.score] ?? PITCH_TABLE[5];
    let freq = baseFreq;
    if (run >= MONOTONY_RUN_THRESHOLD) {
      const variant = (run - MONOTONY_RUN_THRESHOLD) % VARIATION_FACTORS.length;
      freq = baseFreq * VARIATION_FACTORS[variant];
    }

    events.push({ dimId: cell.dimId, catKey: cell.catKey, kind: 'note', freq, conf });
    prevScore = cell.score;
  }

  return events;
}
