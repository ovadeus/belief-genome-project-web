// React adapter around the framework-agnostic Harmonize engine.
//
// Recreates the harmonizer when the input cells change (so a freshly-loaded
// genome plays the new scores). The flash callback is held in a ref so
// callers can pass an inline arrow function without forcing engine recreation.

import { useCallback, useEffect, useRef, useState } from 'react';
import { createHarmonizer } from '../lib/harmonize/harmonizer';
import type { Harmonizer, HarmonizerCell, HarmonizerState } from '../lib/harmonize/types';

export function useHarmonize(
  cells: ReadonlyArray<HarmonizerCell>,
  onCellFlash: (dimId: number) => void,
): { state: HarmonizerState; play: () => Promise<void>; stop: () => void } {
  const [state, setState] = useState<HarmonizerState>('idle');
  const harmonizerRef = useRef<Harmonizer | null>(null);
  const onFlashRef = useRef(onCellFlash);
  onFlashRef.current = onCellFlash;

  useEffect(() => {
    // rowPauseMs:0 — overlay flows seamlessly across category boundaries.
    // The bed regions still crossfade via BED_REGION_OVERLAP_S so chord
    // changes remain smooth even without the per-cell gap. The default 80ms
    // gap read as a hiccup once the overlay was re-voiced as a sustained
    // celesta in v2.1 (see musicbox-synth comment block).
    const h = createHarmonizer(cells, { rowPauseMs: 0 });
    h.onStateChange(setState);
    h.onCellTick(id => onFlashRef.current(id));
    harmonizerRef.current = h;
    return () => {
      h.destroy();
      harmonizerRef.current = null;
    };
  }, [cells]);

  const play = useCallback(async () => {
    await harmonizerRef.current?.play();
  }, []);

  const stop = useCallback(() => {
    harmonizerRef.current?.stop();
  }, []);

  return { state, play, stop };
}
