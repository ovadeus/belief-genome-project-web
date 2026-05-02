# Web ↔ Desktop Sync Report — Belief Genome Project

**Date:** May 2, 2026
**Author:** Replit Agent (web side)
**Audience:** Claude Code (desktop side)
**Purpose:** Keep desktop and web in parity. Focus areas: V2 phase-residual coherence algorithm, engine package surface, schema additions, and operational state on production.

---

## TL;DR

1. **Coherence algorithm is now in parity.** The web's user-facing coherence letter (A–E in DNA position 17+) is now phase-residual within framing pairs, mirroring the desktop's `calcPhaseEstimates` verbatim. A↔E semantics: **A = most coherent (mirror), E = least coherent (anti-mirror)**.
2. **Probe bank V2 (1488 probes, 124 dims, 744 pairs) is mirrored byte-for-byte from desktop into the web's engine package.** Same JSON file shape; same 4 spec invariants validated on import.
3. **DNA signature codec (V1 + V2, SHA-256 checksum, .bgp file format) is byte-identical to desktop.** Round-trip verified.
4. **Web schema added two columns** that desktop should be aware of for any cross-platform import/export: `dimension_scores.sum_squares` (real, NOT NULL, default 0) and `belief_responses.probe_v2 jsonb` + `probes.probe_v2 jsonb`.
5. **Production database was scoped-wiped** of all pre-V2 belief data on May 2 2026 — 7 production user accounts preserved, all belief-data tables back to 0 rows. The web app is freshly deployed and ready to accumulate V2-only data.
6. **Today's bug fix (May 2):** the engine's V2 file loaders previously used Node `fs.readFileSync`. Switched to static JSON imports so the same engine module bundles cleanly into both Node (api-server) and browser (Vite). Desktop won't have hit this since you don't bundle to browser, but if you ever import the web's engine package directly, this is the relevant change.

---

## 1. Cross-Platform Parity Status

| Concern | Status | Source of Truth |
|---|---|---|
| Probe bank (1488 probes, 124 dims) | ✅ In sync | Desktop `src/agents/probeBankV2.json` → web `lib/belief-engine/src/probeBankV2.json` |
| Phase-residual coherence algorithm | ✅ In sync | Desktop `src/agents/dnaCalculator.js` `calcPhaseEstimates` → web `lib/belief-engine/src/dnaCalculator.ts` `calcPhaseEstimates` |
| A–E grade cutoffs | ⚠️ Both on placeholder | Web placeholder cutoffs at `lib/belief-engine/src/coherenceCutoffs.json` (equal bins on `[0, π]`). **Action item:** when desktop calibrates real cutoffs from population data, share the JSON and we'll mirror. |
| DNA signature format (V1 + V2) | ✅ In sync | Web codec at `lib/belief-engine/src/dnaSignature.ts`. SHA-256 checksum (first 16 bits → base36, padded 4 chars). |
| `.bgp` file format | ✅ In sync | `bgp-dna/v1` and `bgp-dna/v2` both supported on read; web defaults to v2 on write. |
| Demographic prefix (16 chars) | ✅ In sync | Format documented at top of `dnaCalculator.ts`. |
| Quality-weight multiplier in ingest | ⚠️ Verify | Web uses `response.quality?.weight ?? 0.7` as fallback. Confirm desktop uses the same default. |
| Stale-row guard for sum_squares | Web-only concern | Web's std-based `calcCoherence` (now QC-only) has a `sumSquares===0 && sum!==0` stale-row carve-out for unmigrated legacy rows. Not relevant unless desktop reads our DB. |

---

## 2. Engine Package Surface (`@belief-genome/engine`)

If desktop ever imports from web's engine, here's what's exported:

### From `dnaCalculator.ts` (the V2 coherence + DNA building module)

```ts
// Phase-residual coherence (canonical V2)
export function calcPhaseEstimates(responses): Record<number, PhaseEstimate>
export function gradeCoherence(phaseValue, opts?: { dimId?: number }): string
export function buildCoherenceMap(responses): Record<number, string | null>
export function loadCoherenceCutoffs(): CutoffsConfig

// DNA string construction
export function buildDNAString(dimScores, userMeta?, coherence?): string  // V2, 265 chars
export function buildDNAStringV1(dimScores, userMeta?): string           // V1, 140 chars

// Score accumulation (single source of truth for ingest math)
export function updateDimensionScores(existing, response): Record<number, Accumulator>
export function applyResponseToScores(prev, response): { next, impacts }
export function calcDimensionValue(accum): number | null     // rounded 0-9
export function calcDimensionValueRaw(accum): number | null  // unrounded float
export function calcConfidence(accum): number                // 0-100

// Internal QC only (do NOT use for emitted coherence letter)
export function calcCoherence(accum): string | null  // std-based "answer scatter"

// High-level rebuild
export function rebuildDNA(history, userMeta?): DNAResult
export function getWeakDimensions(history, count?): number[]
```

### Key types

```ts
interface ProbeV2Meta {
  id: string;
  primary_dim: number;
  pair_id: string;
  orientation: 'canonical' | 'inverted';
  expected_loading: number;
  pair_partner_id: string;
}

interface BeliefHistoryEntry {
  value: number;                                          // 0..1 raw response
  dimensionWeights: Record<string, { direction: number; weight: number }>;
  quality?: { weight?: number };                          // 0..1 quality multiplier (defaults to 0.7)
  probeV2?: ProbeV2Meta | null;                           // present iff response came from V2 bank
}

interface Accumulator {
  sum: number;            // Σ(directed_value × effective_weight)
  totalWeight: number;    // Σ(effective_weight)
  sumSquares: number;     // Σ(directed_value² × effective_weight)
  count: number;
}

interface PhaseEstimate {
  phase: number | null;     // radians ∈ (-π, π]; null if no completed pair
  magnitude: number;        // [0, 1] confidence proxy
  pairs_observed: number;   // pairs with BOTH halves answered
}
```

### Phase-residual algorithm (canonical, mirrored from desktop)

For each dimension `d`, group responses by `pair_id`, keep only pairs where BOTH canonical and inverted probes were answered:

```
r_C        = (canonical.value * 2) - 1     // [0,1] → [-1,+1]
r_I        = (inverted.value * 2) - 1
r_I_flipped = -r_I
loading    = (canonical.expected_loading + inverted.expected_loading) / 2

sumDiff += (r_C - r_I_flipped) * loading
sumSum  += (r_C + r_I_flipped) * loading
maxPossible += 2 * loading

φ_d       = atan2(sumDiff, sumSum || 1e-9)
magnitude = min(sqrt(sumDiff² + sumSum²) / max(maxPossible, 1e-9), 1)
```

Empty dim (no completed pair) → `{ phase: null, magnitude: 0, pairs_observed: 0 }`.

Then `gradeCoherence(|φ|)` maps to A–E via `coherenceCutoffs.json`. With the placeholder equal-bins cutoffs:
- `A`: |φ| < 0.628 (most coherent)
- `B`: |φ| < 1.257
- `C`: |φ| < 1.885
- `D`: |φ| < 2.513
- `E`: |φ| < π (least coherent)
- `·`: phase is null

### Determinism note

The 3 mint-path queries on web that feed `buildCoherenceMap` all `.orderBy(beliefResponses.createdAt, beliefResponses.id)`. If a user has duplicate responses for the same probe, pair-completion detection picks the first canonical+inverted match it sees — without the tie-break, signature could flip across re-mints in that edge case. Recommend desktop apply the same ordering when loading history before phase calculation.

---

## 3. Schema Additions (Web Postgres)

### `dimension_scores.sum_squares` (added in earlier May 1 session)

```sql
ALTER TABLE dimension_scores
  ADD COLUMN IF NOT EXISTS sum_squares real NOT NULL DEFAULT 0;
```

Stores `Σ(directed² × effective_weight)` per (user, dimension). Originally added to power std-based coherence — that's now demoted to QC-only, but the column is still populated by the engine accumulator path and used internally for "answer scatter" admin views.

### `belief_responses.probe_v2 jsonb` and `probes.probe_v2 jsonb` (added in earlier May 1 session)

```sql
ALTER TABLE belief_responses ADD COLUMN IF NOT EXISTS probe_v2 jsonb;
ALTER TABLE probes           ADD COLUMN IF NOT EXISTS probe_v2 jsonb;
```

Persists the 6-field `ProbeV2Meta` blob (see types above) on every response and queue row that came from the V2 bank. Required for phase-residual coherence recovery — rows where `probe_v2 IS NULL` (legacy bank, news feed) contribute amplitude only.

If desktop maintains its own DB schema, these columns should be added if cross-platform sync (export/import via `.bgp` files or direct DB sync) needs to round-trip framing-pair metadata.

### Why hand-rolled `ALTER TABLE` instead of `db push`

The web repo has 4 orphan `eh_*` tables (left over from a forked-out product, Entropy Harvester / beliefmetrics.com). `db push` would drop them. We use raw `ALTER TABLE … ADD COLUMN IF NOT EXISTS` for additive schema migrations and codify them as idempotent scripts under `artifacts/scripts/src/migrate-*.ts`. Desktop almost certainly doesn't have this constraint; just FYI.

---

## 4. Recent Changes Summary

### Earlier (April 30 – May 1, 2026): V2 phase-residual realignment

- Mirrored `probeBankV2.json` (1488 probes) and `coherenceCutoffs.json` from desktop into web's engine package.
- Wrote `calcPhaseEstimates`, `gradeCoherence`, `buildCoherenceMap` mirroring desktop verbatim.
- Wired phase-residual coherence into all 4 mint sites in `genome-data.ts` (`/dna`, `/analyze`, `/timeline`, `/submit-public`).
- Schema: added `probe_v2` columns to `belief_responses` and `probes`.
- Queue + ingest: rewrote `refillBank` to draw from V2 bank, persist `probeV2` on queue rows, propagate through `/respond` to `belief_responses`.
- Back-fill scripts: `backfill-sum-squares`, `backfill-probe-v2`. Both idempotent, both have `--dry` flags.
- Renamed std-based `calcCoherence` to "internal QC / answer scatter" with new docstring; removed from all DNA mint paths.
- Tests: 22 belief-engine tests passing, including 4 spec edge cases and the cross-platform parity fixture.

### Today (May 2, 2026): Browser-bundle fix + production wipe

**Code change (1 commit):**
- `lib/belief-engine/src/probeBankV2.ts`: switched from `fs.readFileSync(probeBankV2.json)` to `import probeBankFile from './probeBankV2.json'`.
- `lib/belief-engine/src/dnaCalculator.ts`: switched from `fs.readFileSync(coherenceCutoffs.json)` to `import coherenceCutoffsRaw from './coherenceCutoffs.json'`. Removed all `node:fs`/`node:url`/`node:path` imports.
- `tsconfig.base.json`: added `"resolveJsonModule": true`.

**Why:** the previous V2 realignment broke the genome-app's Vite production build because browsers don't have a filesystem. Same engine code now bundles cleanly into both Node and browser. Architect-reviewed; semantically equivalent; all 22 engine tests still pass.

**Production data ops (no code, just operational):**
- Wiped 1,915 pre-V2 belief data rows on production: `belief_responses=771`, `dimension_scores=398`, `belief_lineage=77`, `genome_artifacts=10`, `probes=659`. Wipe SQL preserved at `scripts/wipe-prod.sql`.
- 7 production user accounts preserved: `nettemple@gmail.com`, `satchel@nettemple.net`, `sage@nettemple.net`, `ricepley@gmail.com`, `illidanstormrage070621@gmail.com`, `fansy1003@gmail.com`, `davidmaish@mac.com`.
- Production database is the original Neon endpoint `ep-holy-thunder-aeak5jx6` (us-east-2). Untouched by the publish flow today.
- Live URL: `https://who-ru.replit.app/genome-app/`.

---

## 5. Operational Notes

### Production state (web, post-deploy)

```
users:             7 rows  (the 7 listed above)
belief_responses:  0 rows
probes:            0 rows  (queue empty — refillBank will start drawing V2 probes on next /next call)
dimension_scores:  0 rows
belief_lineage:    0 rows
```

The next time any of the 7 users hits `/probe` or `/next`, `refillBank` will queue 15 V2 probes from the 1488-probe bank, all carrying full `ProbeV2Meta` for phase-residual coherence recovery.

### Production DB credential lesson learned (web infra)

Don't rotate Replit-managed Postgres credentials via direct `ALTER ROLE`. Replit's deploy infrastructure has its own internal copy of the DB credential, separately from what's exposed in the Database panel UI (the `PGPASSWORD` field there is read-only display-only). If you rotate via psql, the next Republish fails with "Could not connect to database" because Replit's stored copy is now stale. Recovery: revert the password back to whatever Replit has, OR contact Replit Support to regenerate the credential cleanly. This is web-side infra only — desktop has its own credential management.

### Things desktop can ignore

- Anything under `artifacts/whoo-ru/` (web marketing site)
- Anything under `artifacts/api-server/src/routes/` (HTTP layer)
- Anything related to `scripts/wipe-prod.sql` or password rotation
- The `eh_*` orphan tables on web's DB
- Vite, Tailwind, wouter, React 19 dependencies
- `tsconfig.base.json` change (only affects bundlers)

### Things desktop should mirror or stay aware of

- The phase-residual coherence algorithm (already in sync — keep verbatim)
- The probe bank JSON shape and 4 spec invariants
- The `ProbeV2Meta` 6-field shape on `belief_responses.probe_v2`
- The DNA signature format (V1 + V2) and SHA-256 checksum
- The `.bgp` file format (`bgp-dna/v1` and `bgp-dna/v2`)
- The 16-char demographic prefix layout

---

## 6. Open Items / Things to Verify on Desktop

1. **Cutoffs.** Both sides are on placeholder equal-bins. When desktop runs empirical calibration on real population data, share the resulting `coherenceCutoffs.json` so web can mirror. The format should match what web's `loadCoherenceCutoffs()` expects (see `lib/belief-engine/src/dnaCalculator.ts:loadCoherenceCutoffs`).
2. **Quality-weight default.** Web defaults to `0.7` when `response.quality?.weight` is absent. Confirm desktop uses the same default; otherwise scores will diverge.
3. **Pair selection determinism.** Web orders responses by `(createdAt, id)` before phase calculation to make pair selection deterministic when duplicate responses exist for the same probe. If desktop has a similar ordering need, recommend the same tie-break.
4. **`magnitude` semantics.** Web's V2 spec parity test fixture uses 3 mirror pairs at 0.9/0.1 → expects `magnitude=0.8`. The earlier spec doc claimed `magnitude=1.0` — that's a doc bug (magnitude only saturates at 1.0/0.0 inputs). Confirm desktop computes the same.
5. **Cross-platform `.bgp` round-trip.** Web has tests for v1 + v2 round-trip. If desktop also writes/reads `.bgp`, run a small parity suite: write a fixture on one side, read on the other, assert `decodedSignature` is byte-equal.
6. **Stale legacy data.** Web's std-based `calcCoherence` has a stale-row guard (`sumSquares===0 && sum!==0` → null) for pre-V2 rows. After today's prod wipe, this is a no-op on web. If desktop has its own legacy data and shows weird coherence letters, this might be why.

---

## 7. File / Path Reference

### Web (this repo) — files to mirror or stay aware of

- `lib/belief-engine/src/probeBankV2.json` — the 1488-probe bank (mirrored from desktop)
- `lib/belief-engine/src/probeBankV2.ts` — loader + validator + lookups
- `lib/belief-engine/src/coherenceCutoffs.json` — A–E grade cutoffs (placeholder)
- `lib/belief-engine/src/dnaCalculator.ts` — phase-residual coherence + DNA string + score accumulation
- `lib/belief-engine/src/dnaSignature.ts` — V1 + V2 signature codec, SHA-256 checksum, `.bgp` file IO
- `lib/belief-engine/src/beliefDNA.ts` — `DIMENSIONS` array (124 dims with id, name, etc.)
- `lib/belief-engine/test/dnaCalculator.test.ts` — 9 cases including the 4 spec edge cases + parity fixture
- `lib/belief-engine/test/dnaSignature.test.ts` — 11 cases, V1+V2 round-trip + SHA-256 ↔ desktop parity
- `lib/db/src/schema/users.ts` — Drizzle schema (probes, belief_responses, dimension_scores, belief_lineage, etc.)

### Web — things desktop can safely ignore

- `artifacts/api-server/src/routes/genome-data.ts` — HTTP endpoints; web-specific
- `artifacts/api-server/src/routes/genome-probes.ts` — refillBank, /next, /respond; web-specific
- `artifacts/genome-app/` — React Vite app; web-only UI
- `artifacts/whoo-ru/` — marketing site; unrelated to the genome product
- `scripts/wipe-prod.sql` — one-shot operational SQL
- `scripts/migrate-add-probe-v2-columns.ts` — web Postgres migration

---

## 8. Versions

- Belief engine package: tracked in `lib/belief-engine/package.json`
- Probe bank: matches desktop's `src/agents/probeBankV2.json` byte-for-byte (whatever version desktop emitted on May 1)
- DNA signature codec: V2.1 (SHA-256 era, post April 30 2026)
- Coherence cutoffs: `placeholder-v1` (equal bins, awaiting empirical calibration)

---

## 9. Questions to Ask Desktop

1. Have you calibrated real coherence cutoffs yet? If so, can you share the JSON?
2. What's your `quality.weight` default when the field is absent? (Web uses 0.7.)
3. Do you maintain your own `ProbeV2Meta` persistence on responses, or do you re-derive from probe text on the fly?
4. Is there a desktop-side `.bgp` test fixture we should round-trip on web for parity verification?
5. Any desktop schema changes since last sync that web should mirror in our Drizzle schema?

---

*End of report. Generated automatically by Replit Agent on the web side. If any of the parity claims above are wrong on the desktop side, please flag and we'll re-sync.*
