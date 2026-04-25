// Music-box voice + DNA-derived ambient bed.
//
// SIGNAL FLOW:
//
//   ┌─ overlayBus ─→ HP(700) → peak(+3dB @2.5kHz) ─┐
//   │                                              ├→ dryMix ────────────→ master → dest
//   │                                              ├→ wetSend → reverb ──→ master
//   │                                              └→ delay (70ms FB)  ──→ master
//   │
//   └─ bedBus → bedDuck → LP(2200) ────────────────┐
//                                                  ├→ dryMix(0.85) ─────→ master
//                                                  └→ wetSend(0.45) → reverb → master
//
// `bedBus.gain`  : long-form automation (fade-in, fade-out, stop profile).
// `bedDuck.gain` : short-form sidechain dips on overlay note onsets only.
//
// They are kept as separate nodes so per-note ducking automation never
// cancels the long-form bed envelope (an early note used to wipe the
// fade-in by writing a setValueAtTime over it).
//
// Bed regions crossfade by overlapping in time — region N+1 actually starts
// `BED_REGION_OVERLAP_S` BEFORE region N ends, so both gain envelopes are
// linear-ramping in the same window and the sum stays at peak (no audible
// dip at the seam).
//
// stopAll('user')    : 800ms gentle ramp to silence on both buses.
// stopAll('natural') : bed eases over 1.2s, overlay tails immediately, the
//                      reverb's natural ~2s decay finishes the "exhale."

import type {
  BedArrangement,
  BedRegion,
  SequenceEvent,
  StopProfile,
  Synth,
} from './types';
import { createReverbImpulse } from './reverb-ir';

interface BedVoice {
  oscs: OscillatorNode[];
  gain: GainNode;
}

const BED_FADE_IN_S = 1.5;
const BED_FADE_OUT_S = 1.0;
const BED_REGION_OVERLAP_S = 0.8; // crossfade between regions
const BED_BASE_GAIN = 0.18;       // before ducking

const DUCK_DEPTH = 0.55;          // bed gain multiplier under a note onset
const DUCK_ATTACK_S = 0.040;
const DUCK_RELEASE_S = 0.300;

const USER_STOP_FADE_S = 0.8;
const NATURAL_BED_FADE_S = 1.2;
const NATURAL_TAIL_S = 2.0;       // additional grace for reverb to decay

export function createMusicboxSynth(ctx: AudioContext, masterGain = 0.9): Synth {
  // ── Master ────────────────────────────────────────────────────────────
  const master = ctx.createGain();
  master.gain.value = masterGain;
  master.connect(ctx.destination);

  // ── Reverb (shared by bed + overlay) ──────────────────────────────────
  const reverb = ctx.createConvolver();
  reverb.buffer = createReverbImpulse(ctx, 2.2, 3.5);
  const reverbReturn = ctx.createGain();
  reverbReturn.gain.value = 1.0;
  reverb.connect(reverbReturn);
  reverbReturn.connect(master);

  // ── Overlay bus (foreground notes) ────────────────────────────────────
  const overlayBus = ctx.createGain();
  overlayBus.gain.value = 1.0;

  const hp = ctx.createBiquadFilter();
  hp.type = 'highpass';
  hp.frequency.value = 700;
  const peak = ctx.createBiquadFilter();
  peak.type = 'peaking';
  peak.frequency.value = 2500;
  peak.Q.value = 1.2;
  peak.gain.value = 3;

  overlayBus.connect(hp);
  hp.connect(peak);

  const overlayDry = ctx.createGain();
  overlayDry.gain.value = 0.85;
  peak.connect(overlayDry);
  overlayDry.connect(master);

  const overlayWetSend = ctx.createGain();
  overlayWetSend.gain.value = 0.30;
  peak.connect(overlayWetSend);
  overlayWetSend.connect(reverb);

  // Short delay shimmer (preserved from v1).
  const delay = ctx.createDelay(0.5);
  delay.delayTime.value = 0.07;
  const feedback = ctx.createGain();
  feedback.gain.value = 0.12;
  const delayWet = ctx.createGain();
  delayWet.gain.value = 0.30;
  peak.connect(delay);
  delay.connect(feedback);
  feedback.connect(delay);
  delay.connect(delayWet);
  delayWet.connect(master);

  // ── Bed bus (DNA-derived pad) ─────────────────────────────────────────
  const bedBus = ctx.createGain();
  bedBus.gain.value = 0; // raised by startBed via fade-in

  // Dedicated duck stage so per-note dips never collide with bedBus's
  // long-form automation (fade-in / fade-out / stop profile).
  const bedDuck = ctx.createGain();
  bedDuck.gain.value = 1.0;
  bedBus.connect(bedDuck);

  const bedLP = ctx.createBiquadFilter();
  bedLP.type = 'lowpass';
  bedLP.frequency.value = 2200;
  bedLP.Q.value = 0.4;
  bedDuck.connect(bedLP);

  const bedDry = ctx.createGain();
  bedDry.gain.value = 0.85;
  bedLP.connect(bedDry);
  bedDry.connect(master);

  const bedWetSend = ctx.createGain();
  bedWetSend.gain.value = 0.45;
  bedLP.connect(bedWetSend);
  bedWetSend.connect(reverb);

  // ── State ─────────────────────────────────────────────────────────────
  const overlayActive = new Set<GainNode>();
  let bedVoices: BedVoice[] = [];
  let bedTimers: ReturnType<typeof setTimeout>[] = [];
  let bedActive = false;

  // ── Bed voicing ───────────────────────────────────────────────────────
  function spawnBedRegion(region: BedRegion, when: number): BedVoice {
    const voiceGain = ctx.createGain();
    voiceGain.gain.value = 0;
    voiceGain.connect(bedBus);

    const oscs: OscillatorNode[] = [];
    for (const freq of region.chordHz) {
      // Detuned saw pair + soft sine for warmth.
      const sawA = ctx.createOscillator();
      sawA.type = 'sawtooth';
      sawA.frequency.value = freq;
      sawA.detune.value = -7;
      const sawB = ctx.createOscillator();
      sawB.type = 'sawtooth';
      sawB.frequency.value = freq;
      sawB.detune.value = +7;
      const sine = ctx.createOscillator();
      sine.type = 'sine';
      sine.frequency.value = freq;

      const noteMix = ctx.createGain();
      noteMix.gain.value = 1 / region.chordHz.length; // even chord balance
      sawA.connect(noteMix);
      sawB.connect(noteMix);
      sine.connect(noteMix);
      noteMix.connect(voiceGain);

      sawA.start(when);
      sawB.start(when);
      sine.start(when);
      oscs.push(sawA, sawB, sine);
    }

    // Region envelope: fade in over the overlap, sustain, fade out at end.
    const peakLevel = 1.0;
    const fadeIn = Math.min(BED_REGION_OVERLAP_S, region.durationMs / 1000 / 2);
    const fadeOut = Math.min(BED_REGION_OVERLAP_S, region.durationMs / 1000 / 2);
    const sustainEnd = when + region.durationMs / 1000 - fadeOut;
    voiceGain.gain.setValueAtTime(0, when);
    voiceGain.gain.linearRampToValueAtTime(peakLevel, when + fadeIn);
    voiceGain.gain.setValueAtTime(peakLevel, sustainEnd);
    voiceGain.gain.linearRampToValueAtTime(0, when + region.durationMs / 1000);

    const stopAt = when + region.durationMs / 1000 + 0.05;
    for (const osc of oscs) osc.stop(stopAt);

    return { oscs, gain: voiceGain };
  }

  function startBed(arrangement: BedArrangement): void {
    if (bedActive) return;
    bedActive = true;

    // Bed bus fade-in.
    const t0 = ctx.currentTime + 0.02;
    bedBus.gain.cancelScheduledValues(t0);
    bedBus.gain.setValueAtTime(0, t0);
    bedBus.gain.linearRampToValueAtTime(BED_BASE_GAIN, t0 + BED_FADE_IN_S);

    // Schedule each region. Non-first regions start `BED_REGION_OVERLAP_S`
    // BEFORE the contiguous boundary so adjacent regions crossfade in the
    // same window (region N's fade-out and region N+1's fade-in are both
    // linear ramps over the same period — they sum to ~peak throughout).
    for (let idx = 0; idx < arrangement.regions.length; idx++) {
      const region = arrangement.regions[idx];
      const overlapShift = idx === 0 ? 0 : BED_REGION_OVERLAP_S;
      const startWhen = t0 + region.startMs / 1000 - overlapShift;
      const voice = spawnBedRegion(region, startWhen);
      bedVoices.push(voice);
    }
  }

  // ── Overlay voicing ───────────────────────────────────────────────────
  function playOverlayEvent(event: SequenceEvent): void {
    const t = ctx.currentTime + 0.01;

    if (event.kind === 'tick') {
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
      g.connect(overlayBus);
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
    env.connect(overlayBus);

    fund.start(t);
    harm.start(t);
    fund.stop(noteEnd);
    harm.stop(noteEnd);

    overlayActive.add(env);
    fund.onended = () => {
      overlayActive.delete(env);
      try { env.disconnect(); } catch { /* noop */ }
    };

    // Sidechain duck: dip the dedicated duck stage for ~250ms then return.
    // Automating the duck stage (rather than bedBus directly) keeps per-note
    // dips from clobbering the bed's long-form fade-in / fade-out automation.
    if (bedActive) {
      const duckStart = t;
      const duckBottom = duckStart + DUCK_ATTACK_S;
      const duckEnd = duckBottom + DUCK_RELEASE_S;
      try {
        bedDuck.gain.cancelScheduledValues(duckStart);
        bedDuck.gain.setValueAtTime(bedDuck.gain.value, duckStart);
        bedDuck.gain.linearRampToValueAtTime(DUCK_DEPTH, duckBottom);
        bedDuck.gain.linearRampToValueAtTime(1.0, duckEnd);
      } catch { /* noop */ }
    }
  }

  // ── Stop profiles ─────────────────────────────────────────────────────
  function stopAll(profile: StopProfile): void {
    const t = ctx.currentTime;

    // Always silence overlay quickly so notes don't "ring" past stop.
    for (const g of overlayActive) {
      try {
        g.gain.cancelScheduledValues(t);
        g.gain.setValueAtTime(g.gain.value, t);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.05);
      } catch { /* noop */ }
    }
    overlayActive.clear();

    if (profile === 'user') {
      // Gentle bed fade.
      try {
        bedBus.gain.cancelScheduledValues(t);
        bedBus.gain.setValueAtTime(bedBus.gain.value, t);
        bedBus.gain.linearRampToValueAtTime(0, t + USER_STOP_FADE_S);
      } catch { /* noop */ }
      // Stop bed oscillators after the fade.
      const stopAt = t + USER_STOP_FADE_S + 0.05;
      for (const v of bedVoices) {
        for (const osc of v.oscs) {
          try { osc.stop(stopAt); } catch { /* noop */ }
        }
      }
    } else {
      // Natural end: long bed fade + reverb tail grace.
      try {
        bedBus.gain.cancelScheduledValues(t);
        bedBus.gain.setValueAtTime(bedBus.gain.value, t);
        bedBus.gain.linearRampToValueAtTime(0, t + NATURAL_BED_FADE_S);
      } catch { /* noop */ }
      const stopAt = t + NATURAL_BED_FADE_S + NATURAL_TAIL_S;
      for (const v of bedVoices) {
        for (const osc of v.oscs) {
          try { osc.stop(stopAt); } catch { /* noop */ }
        }
      }
    }

    // Clear bed timers and bookkeeping. Voices clean themselves up via osc.stop.
    for (const id of bedTimers) clearTimeout(id);
    bedTimers = [];
    bedVoices = [];
    bedActive = false;
  }

  return { startBed, playOverlayEvent, stopAll };
}
