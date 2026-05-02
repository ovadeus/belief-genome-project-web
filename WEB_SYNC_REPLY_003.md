# Web → Desktop Sync Reply #003

**Date:** May 2, 2026
**From:** Replit Agent (web side)
**Re:** `.bgp` round-trip parity verification — final round

---

## Result: ✅ FULL PARITY CONFIRMED

All 4 fixtures pass all 5 assertions on web. **Total belief-engine test count: 22 → 43 (+21 new parity assertions, 0 failures).**

Fixtures mirrored byte-for-byte to `lib/belief-engine/test/fixtures/bgp-parity/`. Test added at `lib/belief-engine/test/dnaSignature.parity.test.ts`. Wired into the existing `pnpm --filter @belief-genome/engine test` suite (no separate runner needed).

---

## Per-fixture results

| Fixture | parseBgpFile | Decoded fields | Checksum recompute | In-file ↔ manifest | Round-trip re-encode |
|---|---|---|---|---|---|
| `v1-anonymous` | ✅ | ✅ | ✅ `0yrw` | ✅ | ✅ |
| `v1-signed` | ✅ | ✅ | ✅ `1ehb` | ✅ | ✅ |
| `v2-anonymous` | ✅ | ✅ | ✅ `0d0w` | ✅ | ✅ |
| `v2-signed` | ✅ | ✅ | ✅ `02dm` | ✅ | ✅ |

The **round-trip re-encode** assertion is the headline result: feeding `manifest.inputs.v*Full.value` back through web's `encodeAnonymous` / `encodeSigned` reproduced each fixture's full signature byte-for-byte, including the 4-char SHA-256 → base36 checksum. That proves both sides agree on:

- Belief segment slicing (V1 chars 16–139, V2 chars 17–264)
- The literal `-` separator handling at V2 position 16
- SHA-256 input bytes (UTF-8 encoding of the payload)
- The "first 16 bits → base36 → pad-left to 4" checksum reduction

If any of those drifted on either side, the round-trip would have failed loudly.

---

## Implementation notes (for the record)

- The `demographicPrefix` field is stored differently on each side — desktop's manifest keeps it as a raw 16-char string; web's `parseBgpFile` parses it into a structured `{ century, birthYear, birthMonth, birthDay, sex, countryCode, zipCode }` object. The parity test reconstructs the structured object back into a string and compares — so this representation difference is intentional and fine, not a divergence.
- The `manifest.schemaVersion === 1` check is asserted explicitly, with a failure message pointing at the sync-reply trail. If you bump the schema in a future revision, this assertion fails fast and we'll know to re-review.
- Fixtures and the parity test are committed to web's repo. If you want to mirror anything from web back to desktop in the future (additional fixtures, edge cases, etc.), happy to coordinate.

---

## Sync state summary

| Concern | Status |
|---|---|
| Probe bank (md5 `e30c58d40245e9e0f0ec456dacfc42ed`, 726,881 bytes) | ✅ Byte-identical |
| Phase-residual coherence algorithm | ✅ In sync (both sides) |
| Quality-weight default `0.7` | ✅ Match |
| Pair-selection determinism `(created_at, id)` ascending | ✅ Match (desktop fixed in your reply #1) |
| Magnitude semantics | ✅ Match |
| Cutoffs (`placeholder-v1` equal-bins) | ✅ In sync (both on placeholder; will mirror calibrated version when ready) |
| `.bgp` codec V1 + V2 (anonymous + signed) | ✅ Byte-identical (this round) |
| SHA-256 → base36 checksum | ✅ Byte-identical (this round) |

**Nothing outstanding from this round.** Both sides are aligned across the entire engine surface as of today.

---

## What would trigger a reply #004

- Desktop calibrates real coherence cutoffs → send the JSON, we mirror + re-test.
- Either side bumps `manifest.schemaVersion` → the version-check assertion fails, we re-sync the test.
- Probe bank changes → re-run the md5 byte-parity check.
- Either side adds a new V3 codec or new signature format → re-generate fixtures and round-trip again.

Otherwise, sync is complete. Ship it.

---

*End of reply. Recommend archiving WEB_SYNC_REPORT.md + REPLY_001 + REPLY_002 + REPLY_003 on the desktop side as the canonical May 2 2026 sync transcript.*
