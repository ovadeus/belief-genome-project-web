// Music-box voice + effects chain. Pure Web Audio, no assets.
//
// Voice  : triangle fundamental + lower-gain sine one octave up (mimics the
//          metallic ping of a tine being plucked).
// ADSR   : attack 5ms, decay 120ms (down to sustain 0.12), release 180ms.
// Chain  : voice → highpass(700Hz) → peaking(+3dB @2.5kHz, Q=1.2) → master,
//          with a parallel short delay (70ms, feedback 0.12) for shimmer.
// Loud   : confidence-driven peak gain  =  0.25 + 0.60 * (conf/100)^0.8

import type { SequenceEvent } from './types';

export interface Synth {
  pluck(event: SequenceEvent): void;
  silence(): void;
}

export function createMusicboxSynth(ctx: AudioContext, masterGain = 0.9): Synth {
  const master = ctx.createGain();
  master.gain.value = masterGain;

  const hp = ctx.createBiquadFilter();
  hp.type = 'highpass';
  hp.frequency.value = 700;

  const peak = ctx.createBiquadFilter();
  peak.type = 'peaking';
  peak.frequency.value = 2500;
  peak.Q.value = 1.2;
  peak.gain.value = 3;

  const delay = ctx.createDelay(0.5);
  delay.delayTime.value = 0.07;
  const feedback = ctx.createGain();
  feedback.gain.value = 0.12;
  const wet = ctx.createGain();
  wet.gain.value = 0.4;

  // Dry path
  master.connect(hp);
  hp.connect(peak);
  peak.connect(ctx.destination);

  // Wet path (parallel delay)
  peak.connect(delay);
  delay.connect(feedback);
  feedback.connect(delay);
  delay.connect(wet);
  wet.connect(ctx.destination);

  const activeGains = new Set<GainNode>();

  function pluck(event: SequenceEvent): void {
    const t = ctx.currentTime + 0.01;

    if (event.kind === 'tick') {
      // Muted percussive tick for unexplored cells — short noise burst,
      // very low gain, decays fast. Keeps tempo without adding pitch.
      const len = Math.floor(ctx.sampleRate * 0.05);
      const buffer = ctx.createBuffer(1, len, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < len; i++) {
        const decay = Math.pow(1 - i / len, 4);
        data[i] = (Math.random() * 2 - 1) * decay;
      }
      const src = ctx.createBufferSource();
      src.buffer = buffer;
      const g = ctx.createGain();
      g.gain.value = 0.04;
      src.connect(g);
      g.connect(master);
      src.start(t);
      src.stop(t + 0.06);
      return;
    }

    const confClamped = Math.max(0, Math.min(100, event.conf));
    const peakGain = 0.25 + 0.60 * Math.pow(confClamped / 100, 0.8);

    const attack = 0.005;
    const decay = 0.120;
    const sustain = 0.12;
    const release = 0.180;
    const noteEnd = t + attack + decay + release + 0.05;

    const fund = ctx.createOscillator();
    fund.type = 'triangle';
    fund.frequency.value = event.freq;

    const harm = ctx.createOscillator();
    harm.type = 'sine';
    harm.frequency.value = event.freq * 2;
    const harmGain = ctx.createGain();
    harmGain.gain.value = 0.3;

    const env = ctx.createGain();
    env.gain.setValueAtTime(0, t);
    env.gain.linearRampToValueAtTime(peakGain, t + attack);
    env.gain.exponentialRampToValueAtTime(
      Math.max(peakGain * sustain, 0.0001),
      t + attack + decay,
    );
    env.gain.exponentialRampToValueAtTime(0.0001, t + attack + decay + release);

    fund.connect(env);
    harm.connect(harmGain);
    harmGain.connect(env);
    env.connect(master);

    fund.start(t);
    harm.start(t);
    fund.stop(noteEnd);
    harm.stop(noteEnd);

    activeGains.add(env);
    fund.onended = () => {
      activeGains.delete(env);
      try { env.disconnect(); } catch { /* noop */ }
    };
  }

  function silence(): void {
    const t = ctx.currentTime;
    for (const g of activeGains) {
      try {
        g.gain.cancelScheduledValues(t);
        g.gain.setValueAtTime(g.gain.value, t);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.05);
      } catch { /* node may have ended */ }
    }
    activeGains.clear();
  }

  return { pluck, silence };
}
