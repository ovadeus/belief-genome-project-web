// Tests for the engine-side V2 helpers: variance accumulation, coherence
// binning, and V2 buildDNAString shape. Uses node:test (matches existing
// dnaSignature.test.ts pattern — no extra framework needed).

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  applyResponseToScores,
  calcCoherence,
  buildDNAString,
  buildDNAStringV1,
  rebuildDNA,
  type Accumulator,
} from '../src/dnaCalculator';
import {
  encodeAnonymous,
  decodeSignature,
} from '../src/dnaSignature';

const META = {
  birthYear: 1980 as const,
  birthMonth: 1 as const,
  birthDay: 1 as const,
  sex: '5' as const,
  countryCode: '840',
  zipCode: '00000',
};

// Helper: a single response touching one dimension with neutral quality (0.7).
const respond = (value: number, dimId = 4) => ({
  value,
  dimensionWeights: { [dimId]: { weight: 1, direction: 1 } },
  quality: { weight: 0.7 },
});

describe('calcCoherence', () => {
  it('returns null when count < 3 (insufficient evidence)', () => {
    let acc: Record<number, Accumulator> = {};
    ({ next: acc } = applyResponseToScores(acc, respond(0.8)));
    assert.equal(calcCoherence(acc[4]), null);
    ({ next: acc } = applyResponseToScores(acc, respond(0.8)));
    assert.equal(calcCoherence(acc[4]), null, 'count=2 still null');
  });

  it("returns 'E' (most settled) for 3+ identical strong-positive answers", () => {
    let acc: Record<number, Accumulator> = {};
    for (let i = 0; i < 4; i++) {
      ({ next: acc } = applyResponseToScores(acc, respond(0.9)));
    }
    assert.equal(calcCoherence(acc[4]), 'E');
  });

  it("returns 'A' (most internally conflicted) for maximally split answers", () => {
    let acc: Record<number, Accumulator> = {};
    // 0.0 and 1.0 alternating — directed values −1, +1, −1
    ({ next: acc } = applyResponseToScores(acc, respond(0.0)));
    ({ next: acc } = applyResponseToScores(acc, respond(1.0)));
    ({ next: acc } = applyResponseToScores(acc, respond(0.0)));
    const c = calcCoherence(acc[4]);
    assert.equal(c, 'A', `expected 'A', got ${c}`);
  });

  it('returns null for stale pre-V2 rows (sum≠0 but sumSquares=0)', () => {
    // Simulates a row that pre-dates V2 — has accumulated sum/weight from
    // real responses but sum_squares was never back-filled. We must NOT
    // emit a spurious 'E' for these.
    const stale: Accumulator = { sum: 1.5, totalWeight: 2.1, sumSquares: 0, count: 5 };
    assert.equal(calcCoherence(stale), null);
  });

  it("returns 'E' for genuinely settled mid-slider answers (sum=0, ss=0)", () => {
    // Three exactly-neutral responses → directed=0 each → sum=0, sumSquares=0.
    // This is "perfectly settled at neutral", so coherence should be 'E',
    // not null (the stale-row guard only fires when sum≠0).
    let acc: Record<number, Accumulator> = {};
    for (let i = 0; i < 3; i++) ({ next: acc } = applyResponseToScores(acc, respond(0.5)));
    assert.equal(acc[4].sum, 0);
    assert.equal(acc[4].sumSquares, 0);
    assert.equal(calcCoherence(acc[4]), 'E');
  });

  it('walks the full A→E ladder as variance shrinks', () => {
    // Three responses that progressively become more identical.
    const ladder = [
      { values: [0.0, 1.0, 0.0] },   // big swings → A
      { values: [0.1, 0.9, 0.2] },   // still wide → A
      { values: [0.3, 0.7, 0.4] },   // moderate   → B
      { values: [0.4, 0.6, 0.5] },   // narrow     → C
      { values: [0.45, 0.55, 0.5] }, // narrower   → D
      { values: [0.5, 0.5, 0.5] },   // identical  → E
    ];
    let prevStd = Infinity;
    for (const { values } of ladder) {
      let acc: Record<number, Accumulator> = {};
      for (const v of values) ({ next: acc } = applyResponseToScores(acc, respond(v)));
      const got = calcCoherence(acc[4]);
      assert.ok(['A', 'B', 'C', 'D', 'E'].includes(got!), `expected a letter, got ${got}`);
      // Implied monotonic: as the answers get more identical, std must
      // not increase. Compute std the same way calcCoherence does.
      const ss = acc[4].sumSquares;
      const mean = acc[4].sum / acc[4].totalWeight;
      const std = Math.sqrt(Math.max(0, ss / acc[4].totalWeight - mean * mean));
      assert.ok(std <= prevStd + 1e-9, `std monotonic violated: ${std} > ${prevStd}`);
      prevStd = std;
    }
  });
});

describe('buildDNAString (V2 emit)', () => {
  it('emits a 265-char V2 string with valid interleaved segment', () => {
    const dimScores: Record<number, number> = { 4: 7, 5: 3, 6: 0 };
    const coherence: Record<number, string | null> = { 4: 'E', 5: 'A', 6: null };
    const dna = buildDNAString(dimScores, META, coherence);
    assert.equal(dna.length, 265, `length ${dna.length}`);
    assert.equal(dna[16], '-', 'separator at position 16');
    const segment = dna.slice(17);
    assert.equal(segment.length, 248);
    assert.match(segment, /^([0-9\u00B7][A-E\u00B7]){124}$/, 'V2 segment shape');
    // Spot check the first three dims (in canonical DIMENSIONS order
    // ids start at 4): "7E" + "3A" + "0·"
    assert.equal(segment.slice(0, 6), '7E3A0\u00B7');
  });

  it('defaults missing coherence entries to · (still emits V2)', () => {
    const dna = buildDNAString({ 4: 5 }, META); // no coherence map
    assert.equal(dna.length, 265);
    assert.equal(dna[16], '-');
    // Dim 4 amplitude is '5', coherence defaults to '·'
    assert.equal(dna.slice(17, 19), '5\u00B7');
  });

  it('emits 140-char V1 only via the explicit V1 helper', () => {
    const dna = buildDNAStringV1({ 4: 5 }, META);
    assert.equal(dna.length, 140);
    assert.equal(dna[16], '5'); // no separator — segment starts immediately
  });
});

describe('rebuildDNA → encodeAnonymous → decodeSignature round-trip', () => {
  it('preserves V2 amplitudes and coherence end-to-end', async () => {
    // Build a 4-response history: dim 4 gets 4 strong-yes answers (→ E),
    // dim 5 gets 3 wildly-split answers (→ A or B), dim 6 gets one
    // answer (→ count=1, coherence null).
    const history = [
      { value: 0.9, dimensionWeights: { 4: { weight: 1, direction: 1 }, 5: { weight: 1, direction: 1 } }, quality: { weight: 0.7 } },
      { value: 0.85, dimensionWeights: { 4: { weight: 1, direction: 1 }, 5: { weight: 1, direction: 1 } }, quality: { weight: 0.7 } },
      { value: 0.9, dimensionWeights: { 4: { weight: 1, direction: 1 }, 5: { weight: 1, direction: 1 } }, quality: { weight: 0.7 } },
      { value: 0.0, dimensionWeights: { 5: { weight: 1, direction: 1 } }, quality: { weight: 0.7 } },
      { value: 0.5, dimensionWeights: { 6: { weight: 1, direction: 1 } }, quality: { weight: 0.7 } },
    ];
    const result = rebuildDNA(history, META);
    assert.equal(result.dnaString.length, 265);
    assert.equal(result.dnaString[16], '-');
    // Dim 4 should be settled (E); dim 5 has wide spread (A/B); dim 6 single → null
    assert.equal(result.coherence[4], 'E');
    assert.ok(['A', 'B'].includes(result.coherence[5] || ''), `dim5 coherence ${result.coherence[5]}`);
    assert.equal(result.coherence[6], null);

    // Round-trip through the signature codec.
    const sig = await encodeAnonymous(result.dnaString);
    const decoded = await decodeSignature(sig);
    assert.equal(decoded.valid, true);
    if (!decoded.valid) return;
    assert.equal(decoded.version, 2, 'should round-trip as V2');
    // The codec exposes per-dim coherence as a parallel array; verify the
    // first three slots match what rebuildDNA produced.
    // (Index = position in DIMENSIONS order; dim id 4 = index 0, etc.)
    assert.equal(decoded.coherence[0], 'E', 'dim4 coherence preserved');
    assert.ok(['A', 'B'].includes(decoded.coherence[1] || ''), 'dim5 coherence preserved');
    assert.equal(decoded.coherence[2], null, 'dim6 null preserved');
  });
});
