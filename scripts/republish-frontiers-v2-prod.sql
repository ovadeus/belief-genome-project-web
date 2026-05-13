-- Belief Genome Project — Frontiers schemaVersion 2 republish
-- Run this AGAINST PRODUCTION via the production database SQL panel.
-- (Do NOT run against dev — dev is already on v2.)
--
-- What it does, in one transaction:
--   1. Pre-counts (sanity check before anything is touched).
--   2. Additive schema migration on belief_responses:
--        - DROP NOT NULL on `value` (so skipped responses can persist as NULL).
--        - ADD COLUMN IF NOT EXISTS `pair_position` integer (nullable).
--        - ADD COLUMN IF NOT EXISTS `skipped` boolean NOT NULL DEFAULT false.
--   3. Scoped wipe of stale per-user math state (hybrid plan):
--        - belief_lineage  (FKs belief_responses; delete first)
--        - belief_responses
--        - dimension_scores
--        - dna_snapshots   (already 0 in prod; included for consistency)
--      PRESERVED:
--        - users              (25 rows — keeps test logins working)
--        - genome_submissions (4,764 rows — public anonymous submission archive,
--                              not FK-linked to belief_responses)
--   4. Post-counts (verification).
--
-- ABORT INSTRUCTIONS:
--   If any post-count looks wrong (users != 25, genome_submissions != 4764,
--   or any wiped table != 0), type ROLLBACK; before letting COMMIT land.
--   The whole script is wrapped in BEGIN/COMMIT so nothing persists until
--   COMMIT runs successfully.

BEGIN;

-- ─── 1. Pre-counts ────────────────────────────────────────────────────────
-- Expected (from inventory taken before run):
--   users=25, genome_submissions=4764, belief_responses=1704,
--   dimension_scores=1029, belief_lineage=1892, dna_snapshots=0.
SELECT 'PRE  ' || table_name AS label, rows FROM (
  SELECT 'users'              AS table_name, COUNT(*) AS rows FROM users
  UNION ALL SELECT 'genome_submissions', COUNT(*) FROM genome_submissions
  UNION ALL SELECT 'belief_responses',   COUNT(*) FROM belief_responses
  UNION ALL SELECT 'dimension_scores',   COUNT(*) FROM dimension_scores
  UNION ALL SELECT 'belief_lineage',     COUNT(*) FROM belief_lineage
  UNION ALL SELECT 'dna_snapshots',      COUNT(*) FROM dna_snapshots
) t ORDER BY table_name;

-- ─── 2. Additive schema migration ────────────────────────────────────────
-- Same statements as artifacts/api-server/src/scripts/migrate-frontiers-v2.ts.
-- Idempotent: safe to re-run.
ALTER TABLE belief_responses ALTER COLUMN value DROP NOT NULL;
ALTER TABLE belief_responses ADD COLUMN IF NOT EXISTS pair_position integer;
ALTER TABLE belief_responses ADD COLUMN IF NOT EXISTS skipped boolean NOT NULL DEFAULT false;

-- ─── 3. Scoped wipe (hybrid plan) ────────────────────────────────────────
-- Delete order respects FKs: lineage first (FKs responses), then responses.
-- dimension_scores and dna_snapshots are independent of each other.
DELETE FROM belief_lineage;
DELETE FROM belief_responses;
DELETE FROM dimension_scores;
DELETE FROM dna_snapshots;

-- ─── 4. Post-counts ──────────────────────────────────────────────────────
-- Required state after wipe:
--   users=25                 (UNCHANGED — must equal pre-count)
--   genome_submissions=4764  (UNCHANGED — must equal pre-count)
--   belief_responses=0
--   dimension_scores=0
--   belief_lineage=0
--   dna_snapshots=0
SELECT 'POST ' || table_name AS label, rows FROM (
  SELECT 'users'              AS table_name, COUNT(*) AS rows FROM users
  UNION ALL SELECT 'genome_submissions', COUNT(*) FROM genome_submissions
  UNION ALL SELECT 'belief_responses',   COUNT(*) FROM belief_responses
  UNION ALL SELECT 'dimension_scores',   COUNT(*) FROM dimension_scores
  UNION ALL SELECT 'belief_lineage',     COUNT(*) FROM belief_lineage
  UNION ALL SELECT 'dna_snapshots',      COUNT(*) FROM dna_snapshots
) t ORDER BY table_name;

-- Verify the schema delta took effect (run as part of the same transaction):
--   value should be is_nullable=YES; pair_position + skipped should appear.
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'belief_responses'
  AND column_name IN ('value', 'pair_position', 'skipped')
ORDER BY column_name;

COMMIT;
