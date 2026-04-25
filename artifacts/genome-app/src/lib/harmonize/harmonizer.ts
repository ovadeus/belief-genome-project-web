// Harmonizer — orchestrates bed + overlay sequencing, scheduling, and listener
// notification.
//
// Public factory: createHarmonizer(cells, opts).
// The engine has no React deps so it can be imported by the Electron port
// verbatim; only the hook/UI layer needs to be re-implemented per platform.
//
// Playback model:
// 1. On play(), build a DNA-derived bed arrangement from the same cells.
// 2. Start the bed (faded in over ~1.5s).
// 3. Step through the overlay sequence at cellMs per event, with rowPauseMs
//    between cells of different categories.
// 4. On natural end, call synth.stopAll('natural') — bed eases over ~1.2s and
//    reverb tails ~2s, total ~3s "exhale."
// 5. On user stop(), call synth.stopAll('user') — gentle 800ms fade.

import { buildSequence } from './sequence';
import { buildBedArrangement } from './bed-arrangement';
import { createMusicboxSynth } from './musicbox-synth';
import type {
  Harmonizer,
  HarmonizerCell,
  HarmonizerOptions,
  HarmonizerState,
  SequenceEvent,
  Synth,
} from './types';

export function createHarmonizer(
  cells: ReadonlyArray<HarmonizerCell>,
  opts: HarmonizerOptions = {},
): Harmonizer {
  const cellMs = opts.cellMs ?? 240;
  const rowPauseMs = opts.rowPauseMs ?? 80;
  const masterGain = opts.masterGain ?? 0.9;

  let ctx: AudioContext | null = null;
  let synth: Synth | null = null;
  let state: HarmonizerState = 'idle';
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  let endGraceId: ReturnType<typeof setTimeout> | null = null;
  let destroyed = false;

  const tickListeners = new Set<(dimId: number) => void>();
  const stateListeners = new Set<(s: HarmonizerState) => void>();

  function setState(next: HarmonizerState): void {
    if (state === next) return;
    state = next;
    stateListeners.forEach(cb => cb(next));
  }

  function clearTimers(): void {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
    if (endGraceId !== null) {
      clearTimeout(endGraceId);
      endGraceId = null;
    }
  }

  async function ensureAudio(): Promise<void> {
    if (!ctx) {
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
    if (destroyed) return;

    const sequence: SequenceEvent[] = buildSequence(cells);
    if (sequence.length === 0) return;

    // Total overlay runtime drives the bed arrangement length so the bed
    // ends exactly when the last note hits.
    const totalRuntimeMs =
      sequence.length * cellMs +
      // approximate row breaks — over-estimate slightly so the bed never
      // ends before the overlay does.
      Math.max(0, Math.round(sequence.length / 12)) * rowPauseMs;
    const arrangement = buildBedArrangement(cells, totalRuntimeMs);
    synth!.startBed(arrangement);

    setState('playing');
    let i = 0;

    const step = (): void => {
      if (destroyed || state !== 'playing') {
        return;
      }
      if (i >= sequence.length) {
        // Natural end — long fade with reverb tail.
        if (synth) synth.stopAll('natural');
        // Hold 'playing' state through the tail. UX semantic chosen:
        // a BGP press DURING the natural fade is treated as "stop now"
        // (interrupts the long fade with the user's 800ms fade — feels
        // responsive). After state flips to 'idle' the next BGP press
        // starts a fresh playback. We deliberately do NOT support
        // "re-press = restart from top" — that would fight the fade and
        // create a momentary thunk.
        endGraceId = setTimeout(() => {
          endGraceId = null;
          if (state === 'playing') setState('idle');
        }, 3200);
        return;
      }
      const event = sequence[i];

      tickListeners.forEach(cb => {
        try { cb(event.dimId); } catch { /* listener errors must not stop playback */ }
      });
      synth!.playOverlayEvent(event);

      const next = sequence[i + 1];
      const isRowBreak = !!next && next.catKey !== event.catKey;
      const delay = cellMs + (isRowBreak ? rowPauseMs : 0);
      i += 1;
      timeoutId = setTimeout(step, delay);
    };

    step();
  }

  function stop(): void {
    clearTimers();
    if (synth) synth.stopAll('user');
    setState('idle');
  }

  function destroy(): void {
    destroyed = true;
    clearTimers();
    if (synth) {
      try { synth.stopAll('user'); } catch { /* noop */ }
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
