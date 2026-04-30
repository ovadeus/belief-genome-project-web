// Parser tests for the V2.1 dual-format DNA signature codec. Uses Node's
// built-in test runner (node:test) so we don't need a separate framework.
//
// Fixtures:
//   - V1_PREFIX is a valid 16-char demographic block (1=21st century mapping,
//     birth year 98, month 01, day 01, sex 5, country 840=US, zip 00000).
//   - V1_SEGMENT is 124 chars of `5` — every dimension answered "5".
//   - V2_SEGMENT is 124 amplitude+coherence pairs of "5C" — every dimension
//     answered amplitude 5 with coherence "C".
//   - V2_SEGMENT_WITH_GAPS replaces 4 dimensions in the middle with `··`
//     (placeholder) pairs, simulating a partially-completed DNA.

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  encodeAnonymous,
  encodeSigned,
  decodeSignature,
  parseSignatureFromAnyInput,
  buildBgpFile,
  parseBgpFile,
  checksum,
  BGP_FORMAT_V1,
  BGP_FORMAT_V2,
} from '../src/dnaSignature';

const V1_PREFIX = '1980101584000000';                                // 16 chars
const V1_SEGMENT = '5'.repeat(124);                                  // 124 chars
const V1_DNA = V1_PREFIX + V1_SEGMENT;                               // 140 chars

const V2_SEGMENT = '5C'.repeat(124);                                 // 248 chars
const V2_DNA = V1_PREFIX + '-' + V2_SEGMENT;                         // 265 chars

const V2_SEGMENT_WITH_GAPS =
  '5C'.repeat(60) + '··'.repeat(4) + '5C'.repeat(60);                // 248 chars
const V2_DNA_WITH_GAPS = V1_PREFIX + '-' + V2_SEGMENT_WITH_GAPS;     // 265 chars

describe('dnaSignature V1 paths', () => {
  it('encodes and decodes a V1 anonymous signature', async () => {
    const sig = await encodeAnonymous(V1_DNA);
    assert.match(sig, /^a:[0-9·]{124}-[0-9a-z]{4}$/);
    const decoded = await decodeSignature(sig);
    assert.equal(decoded.valid, true);
    if (!decoded.valid) return;
    assert.equal(decoded.format, 'anonymous');
    assert.equal(decoded.version, 1);
    assert.equal(decoded.beliefSegment.length, 124);
    assert.equal(decoded.amplitudes.length, 124);
    assert.equal(decoded.amplitudes[0], 5);
    assert.equal(decoded.coherence[0], null);          // V1 has no coherence
    assert.equal(decoded.fullDna, null);
    assert.equal(decoded.demographicPrefix, null);
  });

  it('encodes and decodes a V1 signed signature with demographics', async () => {
    const sig = await encodeSigned(V1_DNA);
    assert.match(sig, /^s:[0-9·]{140}-[0-9a-z]{4}$/);
    const decoded = await decodeSignature(sig);
    assert.equal(decoded.valid, true);
    if (!decoded.valid) return;
    assert.equal(decoded.format, 'signed');
    assert.equal(decoded.version, 1);
    assert.equal(decoded.fullDna, V1_DNA);
    assert.deepEqual(decoded.demographicPrefix, {
      century: '1', birthYear: '98', birthMonth: '01', birthDay: '01',
      sex: '5', countryCode: '840', zipCode: '00000',
    });
  });
});

describe('dnaSignature V2 paths', () => {
  it('encodes and decodes a V2 anonymous signature', async () => {
    const sig = await encodeAnonymous(V2_DNA);
    assert.equal(sig.startsWith('a:'), true);
    const decoded = await decodeSignature(sig);
    assert.equal(decoded.valid, true);
    if (!decoded.valid) return;
    assert.equal(decoded.format, 'anonymous');
    assert.equal(decoded.version, 2);
    assert.equal(decoded.beliefSegment.length, 248);
    assert.equal(decoded.amplitudes.length, 124);
    assert.equal(decoded.amplitudes[0], 5);
    assert.equal(decoded.coherence[0], 'C');
    assert.equal(decoded.amplitudes[123], 5);
    assert.equal(decoded.coherence[123], 'C');
    assert.equal(decoded.demographicPrefix, null);
  });

  it('encodes and decodes a V2 signed signature with demographics', async () => {
    const sig = await encodeSigned(V2_DNA);
    assert.equal(sig.startsWith('s:'), true);
    const decoded = await decodeSignature(sig);
    assert.equal(decoded.valid, true);
    if (!decoded.valid) return;
    assert.equal(decoded.format, 'signed');
    assert.equal(decoded.version, 2);
    assert.equal(decoded.fullDna, V2_DNA);
    assert.equal(decoded.beliefSegment, V2_SEGMENT);
    assert.equal(decoded.demographicPrefix?.countryCode, '840');
    assert.equal(decoded.demographicPrefix?.zipCode, '00000');
  });
});

describe('dnaSignature checksum + tamper', () => {
  it('rejects a tampered checksum', async () => {
    const sig = await encodeAnonymous(V1_DNA);
    // Flip the last char of the checksum to something different.
    const lastCh = sig.slice(-1);
    const flipped = sig.slice(0, -1) + (lastCh === 'a' ? 'b' : 'a');
    const decoded = await decodeSignature(flipped);
    assert.equal(decoded.valid, false);
    if (decoded.valid) return;
    assert.equal(decoded.reason, 'checksum_mismatch_anon');
  });

  it('matches the desktop SHA-256 → base-36 algorithm', async () => {
    // sha256("test") starts "9f86d081…" → first 4 hex chars "9f86"
    // parseInt("9f86", 16) = 40838 → (40838).toString(36) = "vie" → padded "0vie".
    // This expected value MUST stay byte-identical to what
    // `crypto.createHash('sha256').update("test").digest('hex').slice(0,4)`
    // produces on the desktop side, or cross-product share links break.
    assert.equal(await checksum('test'), '0vie');
  });
});

describe('dnaSignature raw-paste detection', () => {
  it('detects a raw 140-char V1 full DNA paste', async () => {
    const parsed = await parseSignatureFromAnyInput(V1_DNA);
    assert.notEqual(parsed, null);
    if (!parsed) return;
    assert.equal(parsed.format, 'signed');
    assert.equal(parsed.version, 1);
    assert.equal(parsed.fullDna, V1_DNA);
  });

  it('detects a raw 265-char V2 full DNA paste', async () => {
    const parsed = await parseSignatureFromAnyInput(V2_DNA);
    assert.notEqual(parsed, null);
    if (!parsed) return;
    assert.equal(parsed.format, 'signed');
    assert.equal(parsed.version, 2);
    assert.equal(parsed.fullDna, V2_DNA);
  });

  it('detects a raw V2 segment with `·` placeholders', async () => {
    const parsed = await parseSignatureFromAnyInput(V2_SEGMENT_WITH_GAPS);
    assert.notEqual(parsed, null);
    if (!parsed) return;
    assert.equal(parsed.format, 'anonymous');
    assert.equal(parsed.version, 2);
    // The 4 gap-pair dims (positions 60-63) should be null in both arrays.
    assert.equal(parsed.amplitudes[60], null);
    assert.equal(parsed.coherence[60], null);
    assert.equal(parsed.amplitudes[63], null);
    assert.equal(parsed.coherence[63], null);
    // Surrounding dims should still be parsed normally.
    assert.equal(parsed.amplitudes[59], 5);
    assert.equal(parsed.coherence[59], 'C');
    assert.equal(parsed.amplitudes[64], 5);
    assert.equal(parsed.coherence[64], 'C');
  });
});

describe('dnaSignature .bgp file round-trip', () => {
  it('parses a hand-built v1 .bgp file', async () => {
    const sig = await encodeAnonymous(V1_DNA);
    const json = JSON.stringify({
      format: BGP_FORMAT_V1,
      type: 'anonymous',
      signature: sig,
      exportedAt: '2026-01-01T00:00:00.000Z',
      exportedFrom: 'desktop',
    });
    const parsed = await parseBgpFile(json);
    assert.notEqual(parsed, null);
    if (!parsed) return;
    assert.equal(parsed.fileFormat, BGP_FORMAT_V1);
    assert.equal(parsed.version, 1);
    assert.equal(parsed.format, 'anonymous');
    assert.equal(parsed.signature, sig);
    assert.equal(parsed.exportedFrom, 'desktop');
  });

  it('round-trips a v2 .bgp file via buildBgpFile + parseBgpFile', async () => {
    const sig = await encodeSigned(V2_DNA);
    const file = await buildBgpFile({
      signature: sig,
      shareableName: 'Round-trip Test',
      note: 'V2 signed export',
      exportedFrom: 'web',
    });
    assert.equal(file.format, BGP_FORMAT_V2);
    assert.equal(file.version, 2);
    assert.equal(file.type, 'signed');

    const parsed = await parseBgpFile(JSON.stringify(file));
    assert.notEqual(parsed, null);
    if (!parsed) return;
    assert.equal(parsed.fileFormat, BGP_FORMAT_V2);
    assert.equal(parsed.version, 2);
    assert.equal(parsed.format, 'signed');
    assert.equal(parsed.shareableName, 'Round-trip Test');
    assert.equal(parsed.note, 'V2 signed export');
    assert.equal(parsed.fullDna, V2_DNA);
  });
});
