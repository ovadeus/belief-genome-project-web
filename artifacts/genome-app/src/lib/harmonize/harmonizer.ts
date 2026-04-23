// Harmonizer — orchestrates sequencing, scheduling, and listener notification.
//
// Public factory: createHarmonizer(cells, opts).
// The engine has no React deps so it can be imported by the Electron port
// verbatim; only the hook/UI layer needs to be re-implemented per platform.

import { buildSequence } from './sequence';
import { createMusicboxSynth, type Synth } from './musicbox-synth';
import type {
  Harmonizer,
  HarmonizerCell,
  HarmonizerOptions,
  HarmonizerState,
  SequenceEvent,
} from './types';

export function createHarmonizer(
  cells: ReadonlyArray<HarmonizerCell>,
  opts: HarmonizerOptions = {},
): Harmonizer {
  const cellMs = opts.cellMs ?? 500;
  const rowPauseMs = opts.rowPauseMs ?? 180;
  const masterGain = opts.masterGain ?? 0.9;

  let ctx: AudioContext | null = null;
  let synth: Synth | null = null;
  let state: HarmonizerState = 'idle';
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  let destroyed = false;

  const tickListeners = new Set<(dimId: number) => void>();
  const stateListeners = new Set<(s: HarmonizerState) => void>();

  function setState(next: HarmonizerState): void {
    if (state === next) return;
    state = next;
    stateListeners.forEach(cb => cb(next));
  }

  function clearTimer(): void {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
  }

  async function ensureAudio(): Promise<void> {
    if (!ctx) {
      // SafariWebkit fallback — minimal constructor lookup
      const Ctor: typeof AudioContext =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext!;
      ctx = new Ctor();
    }
    if (ctx.state === 'suspended') await ctx.resume();
    if (!synth) synth = createMusicboxSynth(ctx, masterGain);
  }

  async function play(): Promise<void> {
    if (destroyed || state === 'playing') return;
    await ensureAudio();
    if (destroyed) return; // user destroyed during async resume

    const sequence: SequenceEvent[] = buildSequence(cells);
    if (sequence.length === 0) return;

    setState('playing');
    let i = 0;

    const step = (): void => {
      if (destroyed || state !== 'playing' || i >= sequence.length) {
        if (state === 'playing') setState('idle');
        return;
      }
      const event = sequence[i];

      // Visual tick fires now; audio is scheduled ~10ms ahead inside the
      // synth so they perceptually land together.
      tickListeners.forEach(cb => {
        try { cb(event.dimId); } catch { /* listener errors must not stop playback */ }
      });
      synth!.pluck(event);

      const next = sequence[i + 1];
      const isRowBreak = !!next && next.catKey !== event.catKey;
      const delay = cellMs + (isRowBreak ? rowPauseMs : 0);
      i += 1;
      timeoutId = setTimeout(step, delay);
    };

    step();
  }

  function stop(): void {
    clearTimer();
    if (synth) synth.silence();
    setState('idle');
  }

  function destroy(): void {
    destroyed = true;
    clearTimer();
    if (synth) {
      try { synth.silence(); } catch { /* noop */ }
    }
    if (ctx) {
      ctx.close().catch(() => { /* noop */ });
    }
    ctx = null;
    synth = null;
    tickListeners.clear();
    stateListeners.clear();
    state = 'idle';
  }

  return {
    play,
    stop,
    destroy,
    getState: () => state,
    onCellTick(cb) {
      tickListeners.add(cb);
      return () => { tickListeners.delete(cb); };
    },
    onStateChange(cb) {
      stateListeners.add(cb);
      return () => { stateListeners.delete(cb); };
    },
  };
}
