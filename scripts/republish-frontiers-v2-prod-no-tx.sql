-- Belief Genome Project — Frontiers schemaVersion 2 republish
-- (NO explicit BEGIN/COMMIT — for SQL consoles that auto-wrap selections in a transaction.)
--
-- Run this AGAINST PRODUCTION via the production database SQL console with
-- editing enabled. Select ALL statements, then click Run — the console will
-- wrap them in a single transaction automatically.
--
-- If any post-count is wrong, do NOT confirm/commit; the console's auto-tx
-- will roll back if any statement errors.

-- ─── 1. Pre-counts ────────────────────────────────────────────────────────
-- Expected: users=25, genome_submissions=4764, belief_responses=1704,
--           dimension_scores=1029, belief_lineage=1892, dna_snapshots=0.
SELECT 'PRE  ' || table_name AS label, rows FROM (
  SELECT 'users'              AS table_name, COUNT(*) AS rows FROM users
  UNION ALL SELECT 'genome_submissions', COUNT(*) FROM genome_submissions
  UNION ALL SELECT 'belief_responses',   COUNT(*) FROM belief_responses
  UNION ALL SELECT 'dimension_scores',   COUNT(*) FROM dimension_scores
  UNION ALL SELECT 'belief_lineage',     COUNT(*) FROM belief_lineage
  UNION ALL SELECT 'dna_snapshots',      COUNT(*) FROM dna_snapshots
) t ORDER BY table_name;

-- ─── 2. Additive schema migration ────────────────────────────────────────
ALTER TABLE belief_responses ALTER COLUMN value DROP NOT NULL;
ALTER TABLE belief_responses ADD COLUMN IF NOT EXISTS pair_position integer;
ALTER TABLE belief_responses ADD COLUMN IF NOT EXISTS skipped boolean NOT NULL DEFAULT false;

-- ─── 3. Scoped wipe (hybrid plan) ────────────────────────────────────────
DELETE FROM belief_lineage;
DELETE FROM belief_responses;
DELETE FROM dimension_scores;
DELETE FROM dna_snapshots;

-- ─── 4. Post-counts ──────────────────────────────────────────────────────
-- Required: users=25 (unchanged), genome_submissions=4764 (unchanged),
--           belief_responses=0, dimension_scores=0, belief_lineage=0, dna_snapshots=0.
SELECT 'POST ' || table_name AS label, rows FROM (
  SELECT 'users'              AS table_name, COUNT(*) AS rows FROM users
  UNION ALL SELECT 'genome_submissions', COUNT(*) FROM genome_submissions
  UNION ALL SELECT 'belief_responses',   COUNT(*) FROM belief_responses
  UNION ALL SELECT 'dimension_scores',   COUNT(*) FROM dimension_scores
  UNION ALL SELECT 'belief_lineage',     COUNT(*) FROM belief_lineage
  UNION ALL SELECT 'dna_snapshots',      COUNT(*) FROM dna_snapshots
) t ORDER BY table_name;

-- Verify schema delta:
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'belief_responses'
  AND column_name IN ('value', 'pair_position', 'skipped')
ORDER BY column_name;
