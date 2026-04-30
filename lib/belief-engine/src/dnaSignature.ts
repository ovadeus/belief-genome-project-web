// DNA share-link signature codec — pure module, no third-party deps.
// Privacy invariant: callers pass the FULL DNA string (V1 140-char or
// V2 265-char) to either encoder. Slicing is done internally so callers
// cannot accidentally include or exclude the wrong positions.
//
// Format:
//   anonymous V1: "a:<124-char belief segment>-<4-char checksum>"
//   signed    V1: "s:<140-char full DNA>-<4-char checksum>"
//   anonymous V2: "a:<248-char belief segment>-<4-char checksum>"
//   signed    V2: "s:<265-char full DNA>-<4-char checksum>"
//
// V2 dimensional payload is amplitude+coherence interleaved, one pair per
// dimension: 1 char amplitude `[0-9·]` + 1 char coherence `[A-E·]`. The
// V2 full DNA carries the demographic prefix exactly like V1 (positions
// 0-15) followed by a literal `-` separator at position 16, then the
// 248-char dimensional payload at positions 17-264.

// ──────────────────────────────────────────────────────────────────────────────
//  Versioned constants
// ──────────────────────────────────────────────────────────────────────────────

export const BELIEF_SEG_LEN_V1 = 124;
export const BELIEF_SEG_LEN_V2 = 248;
export const FULL_DNA_LEN_V1 = 140;
export const FULL_DNA_LEN_V2 = 265;
export const SEPARATOR_POS = 16;
export const SEPARATOR_CHAR = '-';
export const CHECKSUM_LENGTH = 4;
export const NUM_DIMENSIONS = 124;

// Backward-compatible aliases — older imports that read these as constants
// continue to work and continue to refer to the V1 lengths.
export const BELIEF_SEG_LEN = BELIEF_SEG_LEN_V1;
export const FULL_DNA_LEN = FULL_DNA_LEN_V1;

// Internal aliases retained from the previous module shape.
const FULL_DNA_LENGTH = FULL_DNA_LEN_V1;
const BELIEF_SEGMENT_LENGTH = BELIEF_SEG_LEN_V1;
const BELIEF_SEGMENT_START = SEPARATOR_POS; // 16 for V1 (no separator char in V1)

// ──────────────────────────────────────────────────────────────────────────────
//  Types
// ──────────────────────────────────────────────────────────────────────────────

export type SignatureFormat = 'anonymous' | 'signed';
export type DnaVersion = 1 | 2;

export interface DemographicPrefix {
  century: string;       // 1 char
  birthYear: string;     // 2 chars (within century)
  birthMonth: string;    // 2 chars
  birthDay: string;      // 2 chars
  sex: string;           // 1 char
  countryCode: string;   // 3 chars (ISO 3166-1 numeric)
  zipCode: string;       // 5 chars
}

export interface DecodedSignatureValid {
  valid: true;
  format: SignatureFormat;
  version: DnaVersion;
  beliefSegment: string;                    // 124 chars (V1) or 248 chars (V2)
  amplitudes: (number | null)[];            // length 124 — parsed integers or null
  coherence: (string | null)[];             // length 124 — `A`–`E` letters or null
  fullDna: string | null;                   // signed only
  demographicPrefix: DemographicPrefix | null; // signed only
  signature: string;
}

export interface DecodedSignatureInvalid {
  valid: false;
  format: null;
  beliefSegment: '';
  amplitudes: [];
  coherence: [];
  fullDna: null;
  demographicPrefix: null;
  signature: '';
  reason: string;
}

export type DecodedSignature = DecodedSignatureValid | DecodedSignatureInvalid;

// ──────────────────────────────────────────────────────────────────────────────
//  Version detection
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Detect a full DNA string's format version. V2 detection requires both
 * the right length and the literal `-` separator at position 16; this
 * prevents a 265-char V1-shaped string (impossible by construction, but
 * defensive) from accidentally being read as V2.
 */
export function detectFullDnaVersion(dnaString: string): DnaVersion | null {
  if (typeof dnaString !== 'string') return null;
  if (dnaString.length === FULL_DNA_LEN_V1) return 1;
  if (dnaString.length === FULL_DNA_LEN_V2 && dnaString[SEPARATOR_POS] === SEPARATOR_CHAR) {
    return 2;
  }
  return null;
}

export function detectSegmentVersion(segment: string): DnaVersion | null {
  if (typeof segment !== 'string') return null;
  if (segment.length === BELIEF_SEG_LEN_V1) return 1;
  if (segment.length === BELIEF_SEG_LEN_V2) return 2;
  return null;
}

/**
 * Slice the dimensional payload out of a full DNA string. Auto-detects V1
 * (slice 16) vs V2 (slice 17, skipping the literal `-` separator). Throws
 * on unrecognized length so callers don't silently truncate.
 */
export function extractBeliefSegment(dnaString: string): string {
  const v = detectFullDnaVersion(dnaString);
  if (v === 1) return dnaString.slice(BELIEF_SEGMENT_START);
  if (v === 2) return dnaString.slice(SEPARATOR_POS + 1);
  throw new Error(
    `extractBeliefSegment: expected ${FULL_DNA_LEN_V1}- or ${FULL_DNA_LEN_V2}-char DNA string, got length ${dnaString?.length}`,
  );
}

/**
 * Walk a belief segment and return per-dimension `amplitudes` and `coherence`
 * arrays of length 124. V1 segments fill amplitudes only; coherence is all
 * `null`. V2 segments walk in `[amp, coh]` pairs.
 *
 * Invalid characters at any position become `null` for that field. Letters
 * outside `A`–`E` in coherence positions are treated as `null` (same as `·`).
 */
export function parseSegmentToDimensions(
  segment: string,
): { amplitudes: (number | null)[]; coherence: (string | null)[]; version: DnaVersion } {
  const version = detectSegmentVersion(segment);
  if (version === null) {
    throw new Error(
      `parseSegmentToDimensions: expected ${BELIEF_SEG_LEN_V1}- or ${BELIEF_SEG_LEN_V2}-char segment, got length ${segment?.length}`,
    );
  }
  const amplitudes: (number | null)[] = new Array(NUM_DIMENSIONS).fill(null);
  const coherence: (string | null)[] = new Array(NUM_DIMENSIONS).fill(null);

  if (version === 1) {
    for (let i = 0; i < NUM_DIMENSIONS; i++) {
      const ch = segment[i];
      if (ch >= '0' && ch <= '9') amplitudes[i] = parseInt(ch, 10);
    }
    return { amplitudes, coherence, version };
  }

  // V2: pairs
  for (let dim = 0; dim < NUM_DIMENSIONS; dim++) {
    const ampCh = segment[dim * 2];
    const cohCh = segment[dim * 2 + 1];
    if (ampCh >= '0' && ampCh <= '9') amplitudes[dim] = parseInt(ampCh, 10);
    if (cohCh >= 'A' && cohCh <= 'E') coherence[dim] = cohCh;
  }
  return { amplitudes, coherence, version };
}

// ──────────────────────────────────────────────────────────────────────────────
//  Checksum — SHA-256 first 16 bits → base-36, padded to 4 chars
// ──────────────────────────────────────────────────────────────────────────────
//
// Algorithm matches the BGP Mission Control desktop app
// (`src/agents/dnaSignature.js`). The two surfaces MUST produce
// byte-identical signatures for the same DNA string or the share-link
// flow breaks across products. Uses Web Crypto's `crypto.subtle.digest`,
// which is available globally in modern browsers and Node 19+ (and is
// the standard polyfill target everywhere else).

function getSubtle(): SubtleCrypto {
  const subtle = (globalThis as { crypto?: { subtle?: SubtleCrypto } }).crypto?.subtle;
  if (!subtle) {
    throw new Error(
      'Web Crypto subtle API is unavailable in this runtime. Requires a modern browser or Node >= 19.',
    );
  }
  return subtle;
}

/**
 * Deterministic 4-char checksum: first 16 bits of SHA-256 (i.e. first 4 hex
 * chars), parsed as base-16, then converted to base-36 and left-padded to
 * 4 chars. Sole purpose is detecting accidental URL mangling — typos, link
 * truncation, character substitution. Not cryptographically authenticated.
 */
export async function checksum(input: string): Promise<string> {
  const data = new TextEncoder().encode(String(input));
  const hashBuf = await getSubtle().digest('SHA-256', data);
  // Take first 2 bytes (== first 4 hex chars == first 16 bits, big-endian).
  const view = new DataView(hashBuf);
  const value = view.getUint16(0, false);
  return value.toString(36).padStart(CHECKSUM_LENGTH, '0');
}

// ──────────────────────────────────────────────────────────────────────────────
//  Encoders
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Build an anonymous share signature from a full DNA string. Demographics
 * are dropped at the engine boundary — no caller can leak them through
 * this function. Auto-detects V1 vs V2 from the input length.
 */
export async function encodeAnonymous(dnaString: string): Promise<string> {
  const segment = extractBeliefSegment(dnaString); // throws on unknown length
  return `a:${segment}-${await checksum(segment)}`;
}

/**
 * Build a signed share signature including the demographic prefix. The
 * caller (UI) is required to gate this behind a click-through consent
 * modal. Auto-detects V1 vs V2 from the input length.
 */
export async function encodeSigned(dnaString: string): Promise<string> {
  const v = detectFullDnaVersion(dnaString);
  if (v === null) {
    throw new Error(
      `encodeSigned: expected ${FULL_DNA_LEN_V1}- or ${FULL_DNA_LEN_V2}-char DNA string, got length ${dnaString?.length}`,
    );
  }
  return `s:${dnaString}-${await checksum(dnaString)}`;
}

// ──────────────────────────────────────────────────────────────────────────────
//  Decoders
// ──────────────────────────────────────────────────────────────────────────────

function invalid(reason: string): DecodedSignatureInvalid {
  return {
    valid: false,
    format: null,
    beliefSegment: '',
    amplitudes: [],
    coherence: [],
    fullDna: null,
    demographicPrefix: null,
    signature: '',
    reason,
  };
}

/**
 * Decode and verify a signature. Returns `{ valid: false, reason }` on any
 * structural problem — checksum mismatch, length mismatch, missing prefix.
 *
 * IMPORTANT: callers should treat all decode failures identically (404 to
 * the user) so they don't leak whether the prefix or checksum was wrong;
 * that information could help a scraper craft tampered URLs.
 */
export async function decodeSignature(sig: string): Promise<DecodedSignature> {
  if (typeof sig !== 'string' || sig.length < 6) return invalid('too_short');

  const colonIdx = sig.indexOf(':');
  if (colonIdx !== 1) return invalid('no_prefix');

  const prefix = sig[0];
  const rest = sig.slice(2);
  // The greedy `lastIndexOf('-')` is essential for V2 — its payload itself
  // contains a `-` at position 16, so we must peel only the trailing
  // `-XXXX` checksum off and leave the inner separator alone.
  const dashIdx = rest.lastIndexOf('-');
  if (dashIdx < 0) return invalid('no_checksum_separator');

  const payload = rest.slice(0, dashIdx);
  const cs = rest.slice(dashIdx + 1);
  if (cs.length !== CHECKSUM_LENGTH) return invalid('checksum_length');

  if (prefix === 'a') {
    const version = detectSegmentVersion(payload);
    if (version === null) return invalid('payload_length_anon');
    if ((await checksum(payload)) !== cs) return invalid('checksum_mismatch_anon');
    const { amplitudes, coherence } = parseSegmentToDimensions(payload);
    return {
      valid: true,
      format: 'anonymous',
      version,
      beliefSegment: payload,
      amplitudes,
      coherence,
      fullDna: null,
      demographicPrefix: null,
      signature: sig,
    };
  }

  if (prefix === 's') {
    const version = detectFullDnaVersion(payload);
    if (version === null) return invalid('payload_length_signed');
    if ((await checksum(payload)) !== cs) return invalid('checksum_mismatch_signed');
    const segment = version === 1 ? payload.slice(SEPARATOR_POS) : payload.slice(SEPARATOR_POS + 1);
    const { amplitudes, coherence } = parseSegmentToDimensions(segment);
    return {
      valid: true,
      format: 'signed',
      version,
      beliefSegment: segment,
      amplitudes,
      coherence,
      fullDna: payload,
      demographicPrefix: parseDemographicPrefix(payload),
      signature: sig,
    };
  }

  return invalid('unknown_prefix');
}

/**
 * Convert a belief segment into the dimensionScores map (`dim id → 0–9`).
 * Auto-detects V1 (1 char per dim) vs V2 (2-char `[amp, coh]` pairs) and
 * walks accordingly. Dimension ids start at 4 (per `DIMENSIONS` in
 * `beliefDNA.ts`). Any unparseable amplitude is silently skipped, matching
 * the previous V1-only behaviour.
 *
 * For new code, prefer `decoded.amplitudes` directly — it's always a
 * length-124 array regardless of version.
 */
export function beliefSegmentToScores(segment: string): Record<number, number> {
  const out: Record<number, number> = {};
  const version = detectSegmentVersion(segment);
  if (version === null) return out;
  if (version === 1) {
    for (let i = 0; i < segment.length; i++) {
      const ch = segment[i];
      if (ch >= '0' && ch <= '9') out[i + 4] = parseInt(ch, 10);
    }
    return out;
  }
  // V2: amplitudes live at even indices.
  for (let dim = 0; dim < NUM_DIMENSIONS; dim++) {
    const ch = segment[dim * 2];
    if (ch >= '0' && ch <= '9') out[dim + 4] = parseInt(ch, 10);
  }
  return out;
}

/**
 * Parse the demographic prefix (positions 0-15) from a signed full DNA
 * string. Accepts either V1 (140 char) or V2 (265 char) — the prefix
 * structure is identical between the two; only the dimensional payload
 * after position 16 differs.
 */
export function parseDemographicPrefix(dnaString: string): DemographicPrefix {
  const v = detectFullDnaVersion(dnaString);
  if (v === null) {
    throw new Error(
      `parseDemographicPrefix: expected ${FULL_DNA_LEN_V1}- or ${FULL_DNA_LEN_V2}-char DNA string`,
    );
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

// ──────────────────────────────────────────────────────────────────────────────
//  .bgp portable file format
// ──────────────────────────────────────────────────────────────────────────────
//
// Small JSON envelope wrapping a share signature. New files emit
// `bgp-dna/v2`; both `bgp-dna/v1` and `bgp-dna/v2` files parse on read
// (forward+backward compatibility). The `version` field tracks which
// dimensional payload format the signature inside uses.
//
// Privacy invariant: anonymous .bgp files never carry demographics. The
// engine enforces this by accepting only a pre-built signature — callers
// cannot leak demographics through this surface.

export const BGP_FORMAT_V1 = 'bgp-dna/v1' as const;
export const BGP_FORMAT_V2 = 'bgp-dna/v2' as const;
export const BGP_FORMAT = BGP_FORMAT_V2; // current default for new exports

export type BgpFormat = typeof BGP_FORMAT_V1 | typeof BGP_FORMAT_V2;
export type BgpExportSource = 'desktop' | 'web' | 'mobile' | string;

export interface BgpFile {
  format: BgpFormat;
  version: DnaVersion;             // dimensional payload version inside `signature`
  type: SignatureFormat;           // 'anonymous' | 'signed'
  signature: string;               // a:... or s:... — already encoded
  exportedAt: string;              // ISO timestamp
  exportedFrom: BgpExportSource;   // 'web' from this codebase
  shareableName?: string | null;
  note?: string | null;
}

/**
 * Build a .bgp file payload around an already-encoded signature. Emits the
 * current default format (`bgp-dna/v2`) regardless of which dimensional
 * version the signature itself uses; the inner `version` field captures
 * that. Callers must pass the signature produced by `encodeAnonymous` /
 * `encodeSigned` — this function does NOT take a raw DNA string, so it
 * cannot accidentally leak demographics through an anonymous export.
 */
export async function buildBgpFile(opts: {
  signature: string;
  shareableName?: string | null;
  note?: string | null;
  exportedFrom?: BgpExportSource;
  exportedAt?: string;
}): Promise<BgpFile> {
  const decoded = await decodeSignature(opts.signature);
  if (!decoded.valid) {
    throw new Error('buildBgpFile: invalid signature');
  }
  const file: BgpFile = {
    format: BGP_FORMAT,
    version: decoded.version,
    type: decoded.format,
    signature: opts.signature,
    exportedAt: opts.exportedAt || new Date().toISOString(),
    exportedFrom: opts.exportedFrom || 'web',
  };
  if (opts.shareableName && opts.shareableName.trim()) {
    file.shareableName = opts.shareableName.trim().slice(0, 80);
  }
  if (opts.note && opts.note.trim()) {
    file.note = opts.note.trim().slice(0, 500);
  }
  return file;
}

export interface ParsedSignature {
  valid: true;
  format: SignatureFormat;
  version: DnaVersion;
  signature: string;
  beliefSegment: string;
  amplitudes: (number | null)[];
  coherence: (string | null)[];
  fullDna: string | null;
  demographicPrefix: DemographicPrefix | null;
  // Optional metadata when the source was a .bgp file
  shareableName: string | null;
  note: string | null;
  exportedAt: string | null;
  exportedFrom: string | null;
  fileFormat: BgpFormat | null;
}

function parsedFromDecoded(decoded: DecodedSignatureValid, fileFormat: BgpFormat | null = null): ParsedSignature {
  return {
    valid: true,
    format: decoded.format,
    version: decoded.version,
    signature: decoded.signature,
    beliefSegment: decoded.beliefSegment,
    amplitudes: decoded.amplitudes,
    coherence: decoded.coherence,
    fullDna: decoded.fullDna,
    demographicPrefix: decoded.demographicPrefix,
    shareableName: null,
    note: null,
    exportedAt: null,
    exportedFrom: null,
    fileFormat,
  };
}

/**
 * Parse a .bgp JSON blob (already-stringified). Accepts both `bgp-dna/v1`
 * and `bgp-dna/v2` file formats. Returns `null` on any structural problem
 * — same minimal-error-surface rule as `decodeSignature`.
 */
export async function parseBgpFile(json: string): Promise<ParsedSignature | null> {
  let raw: unknown;
  try { raw = JSON.parse(json); } catch { return null; }
  if (!raw || typeof raw !== 'object') return null;
  const obj = raw as Record<string, unknown>;
  if (obj.format !== BGP_FORMAT_V1 && obj.format !== BGP_FORMAT_V2) return null;
  if (typeof obj.signature !== 'string') return null;

  const decoded = await decodeSignature(obj.signature);
  if (!decoded.valid) return null;

  // The 'type' field in the file should match the prefix on the signature —
  // mismatch means the file was hand-edited or corrupted. Reject it.
  if (obj.type !== decoded.format) return null;

  const result = parsedFromDecoded(decoded, obj.format as BgpFormat);
  result.shareableName = typeof obj.shareableName === 'string' ? obj.shareableName.slice(0, 80) : null;
  result.note          = typeof obj.note === 'string' ? obj.note.slice(0, 500) : null;
  result.exportedAt    = typeof obj.exportedAt === 'string' ? obj.exportedAt : null;
  result.exportedFrom  = typeof obj.exportedFrom === 'string' ? obj.exportedFrom : null;
  return result;
}

/**
 * Strip whitespace and normalize V1 placeholder characters (`*?_-`) to the
 * canonical `·`. Used only for the V1 raw-paste path so users transcribing
 * a V1 DNA by hand can use any of the common gap markers.
 */
function normalizeV1RawDna(s: string): string {
  return s.replace(/\s+/g, '').replace(/[*?_\-]/g, '·');
}

/**
 * Strip whitespace and normalize the V2 placeholder characters `*?_` (NOT
 * `-`, which is the meaningful inner separator at position 16 of a V2 full
 * DNA). Used only for the V2 raw-paste path.
 */
function normalizeV2RawDna(s: string): string {
  return s.replace(/\s+/g, '').replace(/[*?_]/g, '·');
}

const V1_RAW_DNA_CHARSET = /^[0-9·]+$/;
const V2_SEGMENT_REGEX = /^([0-9·][A-E·]){124}$/;
const V2_FULL_DNA_REGEX = /^[0-9·]{16}-([0-9·][A-E·]){124}$/;

/**
 * Universal parser. Accepts:
 *   - Raw signatures:       "a:...-abc4" or "s:...-abc4" (V1 or V2)
 *   - Share URLs:           "https://.../dna/a:...-abc4?utm=..."
 *   - Full .bgp JSON blobs: file contents pasted as text
 *   - Raw V1 belief segment: 124 chars of [0-9·] — auto-mints `a:<124>-<sum>`
 *   - Raw V1 full DNA:       140 chars of [0-9·] — auto-mints `s:<140>-<sum>`
 *   - Raw V2 belief segment: 248 chars alternating [0-9·][A-E·]
 *   - Raw V2 full DNA:       265 chars: 16-char prefix + `-` + 248-char V2 segment
 *
 * V1 paths are tested first so they short-circuit cleanly for any legacy
 * input. Returns `null` for garbage. Does NOT distinguish "wrong prefix"
 * from "bad checksum" — callers should treat both as 404.
 */
export async function parseSignatureFromAnyInput(raw: string): Promise<ParsedSignature | null> {
  if (!raw || typeof raw !== 'string') return null;
  const input = raw.trim();
  if (!input) return null;

  // Shape 1: full .bgp JSON blob
  if (input.startsWith('{')) {
    const fromJson = await parseBgpFile(input);
    if (fromJson) return fromJson;
    // If it parsed as JSON but failed validation, fall through — the user
    // might have pasted a JSON-shaped string that contains a signature.
  }

  // Shape 2: share URL — pull the first signature off the path/query.
  // Matches a:... or s:... preceded by /, ?, &, or whitespace, ended by
  // /, ?, &, #, whitespace, or string end. The `-` and `A-E` are inside
  // the character class so V2 payloads survive intact.
  const sigMatch = input.match(/(?:^|[\/?&\s])([as]:[A-Za-z0-9·\-]+?)(?=[\/?&#\s]|$)/);
  const candidate = sigMatch ? sigMatch[1] : input;

  // Shape 3: raw prefixed signature (V1 or V2)
  const decoded = await decodeSignature(candidate);
  if (decoded.valid) return parsedFromDecoded(decoded);

  // Shape 4: raw V1 paste — normalize and check.
  const v1Normalized = normalizeV1RawDna(input);
  if (V1_RAW_DNA_CHARSET.test(v1Normalized)) {
    if (v1Normalized.length === FULL_DNA_LEN_V1) {
      const minted = `s:${v1Normalized}-${await checksum(v1Normalized)}`;
      const d = await decodeSignature(minted);
      if (d.valid) return parsedFromDecoded(d);
    }
    if (v1Normalized.length === BELIEF_SEG_LEN_V1) {
      const minted = `a:${v1Normalized}-${await checksum(v1Normalized)}`;
      const d = await decodeSignature(minted);
      if (d.valid) return parsedFromDecoded(d);
    }
  }

  // Shape 5: raw V2 paste — preserve `-`, normalize `*?_` to `·`.
  const v2Normalized = normalizeV2RawDna(input);
  if (v2Normalized.length === FULL_DNA_LEN_V2 && V2_FULL_DNA_REGEX.test(v2Normalized)) {
    const minted = `s:${v2Normalized}-${await checksum(v2Normalized)}`;
    const d = await decodeSignature(minted);
    if (d.valid) return parsedFromDecoded(d);
  }
  if (v2Normalized.length === BELIEF_SEG_LEN_V2 && V2_SEGMENT_REGEX.test(v2Normalized)) {
    const minted = `a:${v2Normalized}-${await checksum(v2Normalized)}`;
    const d = await decodeSignature(minted);
    if (d.valid) return parsedFromDecoded(d);
  }

  return null;
}
