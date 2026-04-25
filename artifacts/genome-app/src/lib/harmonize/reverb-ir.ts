// Synthesized impulse response for ConvolverNode — no audio assets shipped.
//
// Generates a ~2.2-second hall-style decay: white noise multiplied by an
// exponential envelope, with mild stereo decorrelation (left & right channels
// use independent random sources) so the reverb has a sense of width.
//
// Tail length and decay shape are tuned to feel like a small recital hall:
// long enough to be obviously "spacious," short enough to not muddy the
// 240-ms-per-cell overlay track.

const DEFAULT_DURATION_S = 2.2;
const DEFAULT_DECAY = 3.5; // higher = faster decay; 3.5 ≈ -60dB at end

export function createReverbImpulse(
  ctx: BaseAudioContext,
  durationSeconds: number = DEFAULT_DURATION_S,
  decay: number = DEFAULT_DECAY,
): AudioBuffer {
  const sampleRate = ctx.sampleRate;
  const length = Math.max(1, Math.floor(durationSeconds * sampleRate));
  const buffer = ctx.createBuffer(2, length, sampleRate);

  for (let ch = 0; ch < 2; ch++) {
    const data = buffer.getChannelData(ch);
    for (let i = 0; i < length; i++) {
      // Exponential decay envelope: 1.0 at i=0 → near-zero at i=length-1.
      const env = Math.pow(1 - i / length, decay);
      data[i] = (Math.random() * 2 - 1) * env;
    }
  }

  return buffer;
}
