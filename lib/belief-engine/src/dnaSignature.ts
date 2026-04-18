// DNA share-link signature codec — pure module, no deps.
// Privacy invariant: callers pass the FULL 140-char DNA string to either
// encoder. Slicing is done internally so callers cannot accidentally include
// or exclude the wrong positions.
//
// Format:
//   anonymous: "a:<124-char belief segment>-<4-char checksum>"
//   signed:    "s:<140-char full DNA>-<4-char checksum>"

const FULL_DNA_LENGTH = 140;
const BELIEF_SEGMENT_LENGTH = 124;
const BELIEF_SEGMENT_START = 16;
const CHECKSUM_LENGTH = 4;

export type SignatureFormat = 'anonymous' | 'signed';

export interface DecodedSignature {
  valid: boolean;
  format: SignatureFormat | null;
  beliefSegment: string;     // always present when valid
  fullDna: string | null;    // signed only
  reason?: string;           // diagnostics for server-side logging only
}

/**
 * Pull positions 16-139 (the 124 belief dimensions) out of a full 140-char
 * DNA string. Throws if input length is wrong — never silently truncates.
 */
export function extractBeliefSegment(dnaString: string): string {
  if (typeof dnaString !== 'string' || dnaString.length !== FULL_DNA_LENGTH) {
    throw new Error(`extractBeliefSegment: expected ${FULL_DNA_LENGTH}-char DNA string, got length ${dnaString?.length}`);
  }
  return dnaString.slice(BELIEF_SEGMENT_START);
}

/**
 * Deterministic 4-char checksum: first 16 bits of FNV-1a hash, base-36.
 * Pure JS, no Web Crypto / Node crypto dependency — safe in any runtime.
 * Not cryptographic; sole purpose is to detect accidental URL mangling
 * (typos, link truncation, character substitution).
 */
export function checksum(input: string): string {
  // FNV-1a 32-bit
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  // Use unsigned 32-bit, base-36, pad/truncate to 4 chars
  const positive = h >>> 0;
  return positive.toString(36).padStart(CHECKSUM_LENGTH, '0').slice(-CHECKSUM_LENGTH);
}

/**
 * Build an anonymous share signature from the full DNA. Demographics are
 * dropped at the engine boundary — no caller can leak them through this fn.
 */
export function encodeAnonymous(dnaString: string): string {
  const segment = extractBeliefSegment(dnaString);
  return `a:${segment}-${checksum(segment)}`;
}

/**
 * Build a signed share signature including demographic prefix. The caller
 * must explicitly choose this — the calling UI is required to gate it
 * behind a click-through consent modal.
 */
export function encodeSigned(dnaString: string): string {
  if (typeof dnaString !== 'string' || dnaString.length !== FULL_DNA_LENGTH) {
    throw new Error(`encodeSigned: expected ${FULL_DNA_LENGTH}-char DNA string, got length ${dnaString?.length}`);
  }
  return `s:${dnaString}-${checksum(dnaString)}`;
}

/**
 * Decode and verify a signature. Returns { valid: false } on any structural
 * problem — checksum mismatch, length mismatch, missing prefix.
 *
 * IMPORTANT: callers should treat all decode failures identically (404 to
 * the user) so we don't leak whether the prefix or checksum was wrong —
 * that information could help a scraper craft tampered URLs.
 */
export function decodeSignature(sig: string): DecodedSignature {
  const fail = (reason: string): DecodedSignature => ({
    valid: false, format: null, beliefSegment: '', fullDna: null, reason,
  });

  if (typeof sig !== 'string' || sig.length < 6) return fail('too_short');

  const colonIdx = sig.indexOf(':');
  if (colonIdx !== 1) return fail('no_prefix');

  const prefix = sig[0];
  const rest = sig.slice(2);
  const dashIdx = rest.lastIndexOf('-');
  if (dashIdx < 0) return fail('no_checksum_separator');

  const payload = rest.slice(0, dashIdx);
  const cs = rest.slice(dashIdx + 1);
  if (cs.length !== CHECKSUM_LENGTH) return fail('checksum_length');

  if (prefix === 'a') {
    if (payload.length !== BELIEF_SEGMENT_LENGTH) return fail('payload_length_anon');
    if (checksum(payload) !== cs) return fail('checksum_mismatch_anon');
    return { valid: true, format: 'anonymous', beliefSegment: payload, fullDna: null };
  }

  if (prefix === 's') {
    if (payload.length !== FULL_DNA_LENGTH) return fail('payload_length_signed');
    if (checksum(payload) !== cs) return fail('checksum_mismatch_signed');
    return {
      valid: true,
      format: 'signed',
      beliefSegment: payload.slice(BELIEF_SEGMENT_START),
      fullDna: payload,
    };
  }

  return fail('unknown_prefix');
}

/**
 * Convert a 124-char belief segment into the dimensionScores map (dim id -> 0-9).
 * Dimension ids start at 4 (per DIMENSIONS in beliefDNA.ts). Gaps ('.' or
 * any non-digit character) are skipped — those dims remain unexplored.
 */
export function beliefSegmentToScores(segment: string): Record<number, number> {
  const out: Record<number, number> = {};
  for (let i = 0; i < segment.length; i++) {
    const ch = segment[i];
    if (ch >= '0' && ch <= '9') {
      out[i + 4] = parseInt(ch, 10);
    }
  }
  return out;
}

/**
 * Parse the demographic prefix (positions 0-15) from a signed DNA string.
 * Returns nulls for any field that's at its default placeholder value.
 */
export interface DemographicPrefix {
  century: string;       // 1 char
  birthYear: string;     // 2 chars (within century)
  birthMonth: string;    // 2 chars
  birthDay: string;      // 2 chars
  sex: string;           // 1 char
  countryCode: string;   // 3 chars (ISO 3166-1 numeric)
  zipCode: string;       // 5 chars
}

export function parseDemographicPrefix(dnaString: string): DemographicPrefix {
  if (typeof dnaString !== 'string' || dnaString.length !== FULL_DNA_LENGTH) {
    throw new Error(`parseDemographicPrefix: expected ${FULL_DNA_LENGTH}-char DNA string`);
  }
  return {
    century:     dnaString.slice(0, 1),
    birthYear:   dnaString.slice(1, 3),
    birthMonth:  dnaString.slice(3, 5),
    birthDay:    dnaString.slice(5, 7),
    sex:         dnaString.slice(7, 8),
    countryCode: dnaString.slice(8, 11),
    zipCode:     dnaString.slice(11, 16),
  };
}
