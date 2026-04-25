// Harmonize DNA — shared contracts.
//
// The audio engine is pure TypeScript with zero React imports so it can be
// reused verbatim by the Electron desktop app. Only the React adapter
// (hooks/use-harmonize.ts) and the UI wiring belong to this app.

export type HarmonizerState = 'idle' | 'playing';

export interface HarmonizerCell {
  /** Dimension id used as the data-dim-id selector for the visual glow. */
  dimId: number;
  /** Score 0–9. Undefined = unexplored cell (renders as a muted tick). */
  score?: number;
  /** Confidence 0–100. Drives note loudness. */
  conf?: number;
  /** Category key (e.g. 'epistemology'). Used to insert row-break pauses. */
  catKey: string;
}

export interface HarmonizerOptions {
  /** Milliseconds between ticks. Default 240 (tighter v2 tempo). */
  cellMs?: number;
  /** Extra pause inserted between two cells of different catKey. Default 80. */
  rowPauseMs?: number;
  /** Master gain multiplier applied to the output bus. Default 0.9. */
  masterGain?: number;
}

export type SequenceEventKind = 'note' | 'tick';

export interface SequenceEvent {
  dimId: number;
  catKey: string;
  kind: SequenceEventKind;
  /** Frequency in Hz. 0 for tick events. */
  freq: number;
  /** Confidence 0–100. */
  conf: number;
}

/** How the harmonizer should wind down — drives the synth's stop envelope. */
export type StopProfile = 'user' | 'natural';

/** Modal flavor for the bed pad, derived from the user's overall DNA centroid. */
export type BedMode = 'lydian' | 'ionian' | 'aeolian';

/**
 * One sustained chord region in the bed track. The harmonizer schedules these
 * to start at `startMs` (relative to play start) and the synth crossfades each
 * region into the next using the previous region's release time.
 */
export interface BedRegion {
  /** ms from playback start. */
  startMs: number;
  /** ms duration; the next region's startMs typically equals this region's startMs+durationMs. */
  durationMs: number;
  /** Chord voicing as a list of frequencies (Hz). 3–4 notes typical. */
  chordHz: number[];
}

/** Full DNA-derived bed arrangement. */
export interface BedArrangement {
  mode: BedMode;
  regions: BedRegion[];
}

export interface Synth {
  /** Start the bed track. Idempotent — calling twice does not stack. */
  startBed(arrangement: BedArrangement): void;
  /**
   * Play one foreground overlay event (note or tick). The bed automatically
   * ducks for ~250ms whenever a note (not a tick) is played.
   */
  playOverlayEvent(event: SequenceEvent): void;
  /**
   * Stop everything. Profile controls the fade shape:
   * - 'user'    : ~800ms gentle gain ramp on overlay+bed (toggle-off feel).
   * - 'natural' : bed eases first (~1.2s), reverb tail decays naturally for
   *               another ~2s — total ~3s "exhale" at end of sequence.
   */
  stopAll(profile: StopProfile): void;
}

export interface Harmonizer {
  play(): Promise<void>;
  stop(): void;
  destroy(): void;
  getState(): HarmonizerState;
  onCellTick(cb: (dimId: number) => void): () => void;
  onStateChange(cb: (s: HarmonizerState) => void): () => void;
}
