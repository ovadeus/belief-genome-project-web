// Tests for qqEquality.ts — kept aligned with desktop's qqEquality.js.
// Math is byte-equivalent; if these change, fix desktop too and regenerate
// the parity fixtures in lockstep.

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  STRATA,
  stratumForBaseline,
  flipInverted,
  dichotomize,
  pairCompleteRecords,
  computeQQMagnitude,
  computeStratifiedQQ,
  type QQResponse,
  type PairCompleteRecord,
} from '../src/qqEquality';

describe('STRATA / stratumForBaseline', () => {
  it('maps each substantive 1–9 score to exactly one stratum', () => {
    assert.equal(stratumForBaseline(1), 'resolved-low');
    assert.equal(stratumForBaseline(2), 'resolved-low');
    assert.equal(stratumForBaseline(3), 'resolved-low');
    assert.equal(stratumForBaseline(4), 'near-midpoint-low');
    assert.equal(stratumForBaseline(5), 'midpoint');
    assert.equal(stratumForBaseline(6), 'near-midpoint-high');
    assert.equal(stratumForBaseline(7), 'resolved-high');
    assert.equal(stratumForBaseline(8), 'resolved-high');
    assert.equal(stratumForBaseline(9), 'resolved-high');
  });
  it('treats null/undefined/0 as excluded (non-substantive)', () => {
    assert.equal(stratumForBaseline(null), null);
    assert.equal(stratumForBaseline(undefined), null);
    assert.equal(stratumForBaseline(0), null);
  });
  it('returns null for out-of-range scores', () => {
    assert.equal(stratumForBaseline(10), null);
    assert.equal(stratumForBaseline(-1), null);
  });
  it('exposes the five canonical stratum ids', () => {
    const ids = Object.values(STRATA).map(s => s.id).sort();
    assert.deepEqual(ids, [
      'midpoint',
      'near-midpoint-high',
      'near-midpoint-low',
      'resolved-high',
      'resolved-low',
    ]);
  });
});

describe('flipInverted', () => {
  it('reflects 1–9 substantive scores through the midpoint', () => {
    assert.equal(flipInverted(1), 9);
    assert.equal(flipInverted(5), 5); // midpoint is its own mirror
    assert.equal(flipInverted(9), 1);
  });
  it('returns null for null/undefined', () => {
    assert.equal(flipInverted(null), null);
    assert.equal(flipInverted(undefined), null);
  });
});

describe('dichotomize', () => {
  it('Y for >= 6, N for <= 4, null for the midpoint', () => {
    assert.equal(dichotomize(1), 'N');
    assert.equal(dichotomize(4), 'N');
    assert.equal(dichotomize(5), null);
    assert.equal(dichotomize(6), 'Y');
    assert.equal(dichotomize(9), 'Y');
    assert.equal(dichotomize(null), null);
  });
});

describe('pairCompleteRecords', () => {
  // Helper: build a response with the minimum fields qqEquality cares about.
  const r = (
    user: string,
    pair: string,
    orient: 'canonical' | 'inverted',
    value: number | null,
    pairPos: 1 | 2 | null,
    createdAt: string,
    primaryDim = 4,
    skipped = false,
  ): QQResponse => ({
    user_id:    user,
    probeV2:    { pair_id: pair, orientation: orient, primary_dim: primaryDim },
    value,
    pair_position: pairPos,
    created_at: createdAt,
    skipped,
  });

  it('drops users who only answered one side of the pair', () => {
    const out = pairCompleteRecords([
      r('u1', 'p1', 'canonical', 0.5, 1, '2026-01-01T00:00:00Z'),
      // u1 missing the inverted partner → no record emitted.
      r('u2', 'p1', 'canonical', 0.5, 1, '2026-01-01T00:00:00Z'),
      r('u2', 'p1', 'inverted',  0.5, 2, '2026-01-01T00:00:01Z'),
    ]);
    assert.equal(out.length, 1);
    assert.equal(out[0].user_id, 'u2');
  });

  it('drops responses with value=null or skipped=true', () => {
    const out = pairCompleteRecords([
      r('u1', 'p1', 'canonical', null, 1, '2026-01-01T00:00:00Z'),
      r('u1', 'p1', 'inverted',  0.5,  2, '2026-01-01T00:00:01Z'),
      r('u2', 'p1', 'canonical', 0.5,  1, '2026-01-01T00:00:00Z', 4, true),
      r('u2', 'p1', 'inverted',  0.5,  2, '2026-01-01T00:00:01Z'),
    ]);
    assert.equal(out.length, 0);
  });

  it('maps internal 0–1 value to 1–9 substantive (no rounding)', () => {
    const out = pairCompleteRecords([
      r('u1', 'p1', 'canonical', 1.0, 1, '2026-01-01T00:00:00Z'),
      r('u1', 'p1', 'inverted',  0.0, 2, '2026-01-01T00:00:01Z'),
    ]);
    assert.equal(out.length, 1);
    // toSubstantive(v) = 1 + v*8
    assert.equal(out[0].canonical_value, 9);
    assert.equal(out[0].inverted_value, 1);
    assert.equal(out[0].first_orientation, 'canonical');
  });

  it('uses pair_position when present and falls back to created_at', () => {
    // pair_position case
    const a = pairCompleteRecords([
      r('u1', 'p1', 'canonical', 0.5, 2, '2026-01-01T00:00:01Z'), // partner
      r('u1', 'p1', 'inverted',  0.5, 1, '2026-01-01T00:00:00Z'), // first
    ]);
    assert.equal(a[0].first_orientation, 'inverted');
    // created_at fallback (both null)
    const b = pairCompleteRecords([
      r('u2', 'p1', 'canonical', 0.5, null, '2026-01-01T00:00:01Z'),
      r('u2', 'p1', 'inverted',  0.5, null, '2026-01-01T00:00:00Z'), // earlier
    ]);
    assert.equal(b[0].first_orientation, 'inverted');
  });
});

describe('computeQQMagnitude', () => {
  // Build a synthetic pair-complete dataset where canonical-first and
  // inverted-first orders produce identical Y/N joint distributions → q=0.
  const rec = (
    first: 'canonical' | 'inverted',
    canonical: number,  // 1–9 substantive
    inverted: number,
    n = 0,
  ): PairCompleteRecord => ({
    user_id:           `u${n}`,
    pair_id:           'p1',
    primary_dim:       4,
    canonical_value:   canonical,
    inverted_value:    inverted,
    first_orientation: first,
  });

  it('returns insufficient when either order has < minSamplePerOrder', () => {
    const records: PairCompleteRecord[] = [];
    for (let i = 0; i < 5; i++) records.push(rec('canonical', 8, 2, i));
    for (let i = 0; i < 5; i++) records.push(rec('inverted',  8, 2, 100 + i));
    const out = computeQQMagnitude(records);
    assert.equal(out.sufficient, false);
    assert.equal(out.qq_magnitude, null);
  });

  it('produces q≈0 when orders are statistically identical', () => {
    const records: PairCompleteRecord[] = [];
    // 30 of each order, all (canonical=8, inverted=2) → both probes resolve
    // to Y after orientation correction → no order effect.
    for (let i = 0; i < 30; i++) records.push(rec('canonical', 8, 2, i));
    for (let i = 0; i < 30; i++) records.push(rec('inverted',  8, 2, 100 + i));
    const out = computeQQMagnitude(records);
    assert.equal(out.sufficient, true);
    assert.equal(out.qq_magnitude, 0);
    assert.equal(out.qq_signed, 0);
    // All records collapse into (Y,Y) because flipInverted(2)=8 → Y.
    assert.equal(out.order1_breakdown!.p_YY, 1);
    assert.equal(out.order2_breakdown!.p_YY, 1);
  });

  it('detects an order asymmetry as a non-zero |q|', () => {
    const records: PairCompleteRecord[] = [];
    // Order1 (canonical-first): 30 records, all collapse to (Y,Y).
    for (let i = 0; i < 30; i++) records.push(rec('canonical', 8, 2, i));
    // Order2 (inverted-first): 30 records, half become (Y,N), half (Y,Y).
    // Inverted orientation; first answer is the inverted probe (value 2 →
    // flip → 8 → Y); second answer is the canonical probe.
    for (let i = 0; i < 15; i++) records.push(rec('inverted',  3, 2, 100 + i));
    for (let i = 0; i < 15; i++) records.push(rec('inverted',  8, 2, 200 + i));
    const out = computeQQMagnitude(records);
    assert.equal(out.sufficient, true);
    // Order2 produces 15 (Y,N) out of 30 → p_YN = 0.5.
    // Order1 produces 0 (Y,N) and 0 (N,Y) → q-magnitude = 0.5.
    assert.equal(out.order2_breakdown!.p_YN, 0.5);
    assert.equal(out.qq_magnitude, 0.5);
  });
});

describe('computeStratifiedQQ', () => {
  it('returns five strata, each with sample sizes', () => {
    const out = computeStratifiedQQ([], [], 4);
    assert.equal(out.dim_id, 4);
    assert.equal(out.total_pair_complete, 0);
    const ids = Object.keys(out.strata).sort();
    assert.deepEqual(ids, [
      'midpoint',
      'near-midpoint-high',
      'near-midpoint-low',
      'resolved-high',
      'resolved-low',
    ]);
    for (const s of Object.values(out.strata)) {
      assert.equal(s.sample_size, 0);
      assert.equal(s.sufficient, false);
    }
  });

  it('routes a midpoint baseliner into the midpoint stratum', () => {
    // value=0.5 internal → substantive = round(1 + 0.5*8) = 5 → midpoint.
    const phase1: QQResponse[] = [{
      user_id: 'u1',
      probeV2: { pair_id: 'p0', orientation: 'canonical', primary_dim: 4 },
      value: 0.5, created_at: '2026-01-01T00:00:00Z',
    }];
    // u1 also has a pair-complete entry on p1 — should be assigned to
    // the midpoint stratum even though they only have 1 pair (insufficient).
    const phase2: QQResponse[] = [
      { user_id: 'u1', probeV2: { pair_id: 'p1', orientation: 'canonical', primary_dim: 4 }, value: 0.9, pair_position: 1, created_at: '2026-01-02T00:00:00Z' },
      { user_id: 'u1', probeV2: { pair_id: 'p1', orientation: 'inverted',  primary_dim: 4 }, value: 0.1, pair_position: 2, created_at: '2026-01-02T00:00:01Z' },
    ];
    const out = computeStratifiedQQ(phase1, phase2, 4);
    assert.equal(out.total_pair_complete, 1);
    assert.equal(out.strata.midpoint.sample_size, 1);
    assert.equal(out.strata['resolved-low'].sample_size, 0);
  });
});
