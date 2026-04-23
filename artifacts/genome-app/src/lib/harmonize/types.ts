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
  /** Milliseconds between ticks. Default 500. */
  cellMs?: number;
  /** Extra pause inserted between two cells of different catKey. Default 180. */
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

export interface Harmonizer {
  play(): Promise<void>;
  stop(): void;
  destroy(): void;
  getState(): HarmonizerState;
  onCellTick(cb: (dimId: number) => void): () => void;
  onStateChange(cb: (s: HarmonizerState) => void): () => void;
}
