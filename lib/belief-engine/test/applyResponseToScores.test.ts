// Invariant tests for applyResponseToScores — the single source of truth
// for "what did this response do to the user's scores?". Both the API
// ingest path (POST /probes/respond) and the backfill replay
// (scripts/backfill-lineage.ts) call this function. If the math here drifts
// from calcDimensionValue, scores and lineage silently disagree and
// historical lineage rows become misleading. These tests pin the contract.

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  applyResponseToScores,
  calcDimensionValue,
  calcDimensionValueRaw,
  updateDimensionScores,
  type Accumulator,
  type BeliefHistoryEntry,
} from '../src/dnaCalculator';

const resp = (
  value: number | null,
  weights: Record<number, { direction: number; weight: number }>,
  extra: Partial<BeliefHistoryEntry> = {},
): BeliefHistoryEntry => ({
  value: value as number,
  dimensionWeights: Object.fromEntries(
    Object.entries(weights).map(([k, v]) => [k, v]),
  ),
  quality: { weight: 0.7 },
  ...extra,
});

describe('applyResponseToScores — first-response invariants', () => {
  it('scoreBefore is null on the very first response touching a dimension', () => {
    const { impacts } = applyResponseToScores({}, resp(0.9, { 4: { direction: 1, weight: 1 } }));
    assert.equal(impacts.length, 1);
    assert.equal(impacts[0].dimensionId, 4);
    assert.equal(impacts[0].scoreBefore, null,
      'first response on a dim must report scoreBefore=null');
    assert.equal(impacts[0].confidenceBefore, 0,
      'first response: confidenceBefore must be 0');
    assert.ok(impacts[0].scoreAfter > 5,
      `value=0.9 with direction=+1 should push score above midpoint 5, got ${impacts[0].scoreAfter}`);
    // delta is taken relative to the 5 superposition midpoint when scoreBefore is null
    assert.equal(impacts[0].delta, impacts[0].scoreAfter - 5);
  });

  it('a SECOND response on the same dim reports a non-null scoreBefore', () => {
    let acc: Record<number, Accumulator> = {};
    ({ next: acc } = applyResponseToScores(acc, resp(0.9, { 4: { direction: 1, weight: 1 } })));
    const { impacts } = applyResponseToScores(acc, resp(0.1, { 4: { direction: 1, weight: 1 } }));
    assert.equal(impacts.length, 1);
    assert.notEqual(impacts[0].scoreBefore, null,
      'second response must observe a non-null scoreBefore');
    assert.equal(impacts[0].delta, impacts[0].scoreAfter - impacts[0].scoreBefore!);
  });

  it('does not mutate the prior accumulator map (immutable update)', () => {
    const prev: Record<number, Accumulator> = {};
    const { next } = applyResponseToScores(prev, resp(0.9, { 4: { direction: 1, weight: 1 } }));
    assert.notEqual(next, prev, 'returns a new object');
    assert.deepEqual(prev, {}, 'prior map unchanged');
  });
});

describe('applyResponseToScores — accumulator math agrees with calcDimensionValue', () => {
  // The whole point of the engine is that both ingest paths and the
  // dashboard scoring agree. If applyResponseToScores's `next` accumulator
  // doesn't round-trip through calcDimensionValue identically, lineage
  // and the live dim_score table will silently disagree.

  it('scoreAfter rounds to the same integer calcDimensionValue produces', () => {
    let acc: Record<number, Accumulator> = {};
    let lastImpact;
    for (const v of [0.9, 0.85, 0.7, 0.95, 0.8]) {
      const out = applyResponseToScores(acc, resp(v, { 4: { direction: 1, weight: 1 } }));
      acc = out.next;
      lastImpact = out.impacts[0];
    }
    const rounded = calcDimensionValue(acc[4]);
    assert.equal(Math.round(lastImpact!.scoreAfter), rounded,
      `Math.round(scoreAfter)=${Math.round(lastImpact!.scoreAfter)} must match calcDimensionValue=${rounded}`);
    assert.equal(lastImpact!.scoreAfter, calcDimensionValueRaw(acc[4]),
      'scoreAfter must equal calcDimensionValueRaw on the resulting accumulator');
  });

  it('produces the same accumulator state as updateDimensionScores for a long sequence', () => {
    // Drift check between the two engine entry points. updateDimensionScores
    // is used for batch rebuild paths; applyResponseToScores is used for
    // ingest + backfill. They MUST produce identical accumulators given
    // the same inputs, otherwise re-rebuilds will disagree with lineage.
    const responses: BeliefHistoryEntry[] = [
      resp(0.9, { 4: { direction: 1, weight: 1 }, 5: { direction: -1, weight: 0.5 } }),
      resp(0.2, { 4: { direction: 1, weight: 0.8 } }),
      resp(0.5, { 5: { direction: 1, weight: 1.0 }, 6: { direction: 1, weight: 0.3 } }),
      resp(0.7, { 4: { direction: -1, weight: 0.6 } }),
    ];

    let viaApply: Record<number, Accumulator> = {};
    for (const r of responses) {
      ({ next: viaApply } = applyResponseToScores(viaApply, r));
    }
    let viaUpdate: Record<number, Accumulator> = {};
    for (const r of responses) {
      viaUpdate = updateDimensionScores(viaUpdate, r);
    }
    assert.deepEqual(viaApply, viaUpdate,
      'applyResponseToScores and updateDimensionScores must produce identical accumulators');
  });

  it('handles per-response quality weight correctly (no hard-coded 0.7)', () => {
    // If someone refactors and accidentally hard-codes quality, this catches it.
    const r = {
      value: 0.9,
      dimensionWeights: { 4: { direction: 1, weight: 1 } },
      quality: { weight: 0.3 },  // intentionally non-default
    };
    const { next } = applyResponseToScores({}, r);
    // effectiveW = weight * qualityMult = 1 * 0.3 = 0.3
    assert.equal(next[4].totalWeight, 0.3, 'quality weight must flow through to totalWeight');
    assert.equal(next[4].count, 1);
  });
});

describe('applyResponseToScores — multi-response monotonic before/after pairing', () => {
  it('each response: scoreAfter[n] === scoreBefore[n+1]', () => {
    let acc: Record<number, Accumulator> = {};
    const sequence = [0.9, 0.1, 0.7, 0.4, 0.8, 0.5];
    let prevAfter: number | null = null;
    for (const v of sequence) {
      const { next, impacts } = applyResponseToScores(acc, resp(v, { 4: { direction: 1, weight: 1 } }));
      assert.equal(impacts.length, 1);
      if (prevAfter !== null) {
        // The before of THIS response must equal the after of the PREVIOUS one,
        // exactly. Any drift here means lineage rows lie about the timeline.
        assert.equal(impacts[0].scoreBefore, prevAfter,
          `chain break: scoreBefore=${impacts[0].scoreBefore} but previous scoreAfter=${prevAfter}`);
      } else {
        assert.equal(impacts[0].scoreBefore, null);
      }
      prevAfter = impacts[0].scoreAfter;
      acc = next;
    }
  });

  it('one response producing impacts on multiple dims: each dim chains independently', () => {
    let acc: Record<number, Accumulator> = {};
    // Seed dim 4 only.
    ({ next: acc } = applyResponseToScores(acc, resp(0.9, { 4: { direction: 1, weight: 1 } })));
    // Now respond touching dims 4 AND 5.
    const { impacts } = applyResponseToScores(acc, resp(0.2, {
      4: { direction: 1, weight: 1 },
      5: { direction: 1, weight: 1 },
    }));
    const byDim = Object.fromEntries(impacts.map(i => [i.dimensionId, i]));
    assert.notEqual(byDim[4].scoreBefore, null, 'dim 4 already had data → before non-null');
    assert.equal(byDim[5].scoreBefore, null, 'dim 5 first time → before null');
  });

  it('confidence is monotonically non-decreasing as more responses arrive on a dim', () => {
    let acc: Record<number, Accumulator> = {};
    let prevConf = 0;
    for (let i = 0; i < 10; i++) {
      const { next, impacts } = applyResponseToScores(acc, resp(0.7, { 4: { direction: 1, weight: 1 } }));
      assert.ok(impacts[0].confidenceAfter >= prevConf,
        `confidence regressed: ${prevConf} → ${impacts[0].confidenceAfter}`);
      prevConf = impacts[0].confidenceAfter;
      acc = next;
    }
  });
});

describe('applyResponseToScores — skip / non-substantive non-response', () => {
  it('returns no impacts and does not change accumulators when skipped=true', () => {
    let acc: Record<number, Accumulator> = {};
    ({ next: acc } = applyResponseToScores(acc, resp(0.9, { 4: { direction: 1, weight: 1 } })));
    const before = JSON.parse(JSON.stringify(acc));
    const { next, impacts } = applyResponseToScores(acc, resp(null, { 4: { direction: 1, weight: 1 } }, { skipped: true }));
    assert.equal(impacts.length, 0, 'skipped responses produce zero impacts');
    assert.deepEqual(next, before, 'skipped responses must not mutate accumulators');
  });

  it('returns no impacts and does not change accumulators when value is null', () => {
    const { next, impacts } = applyResponseToScores({}, { value: null as unknown as number, dimensionWeights: { 4: { direction: 1, weight: 1 } } });
    assert.equal(impacts.length, 0);
    assert.deepEqual(next, {});
  });
});
