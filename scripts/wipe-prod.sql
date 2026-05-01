-- Belief Genome Project — Production data wipe
-- Scoped to pre-V2 belief data. Preserves users table (must stay at 7 rows).
-- Single transaction: pre-counts, deletes, post-counts, COMMIT.
-- If post-counts show ANY non-zero on a wiped table, or users != 7,
-- abort by typing ROLLBACK; before letting the COMMIT land.

BEGIN;

-- Pre-wipe row counts.
-- Expected: br=771, ds=398, bl=77, dn=0, ga=10, kd=0, probes=659, users=7.
SELECT 'PRE  ' || table_name AS label, rows FROM (
  SELECT 'belief_responses' AS table_name, COUNT(*) AS rows FROM belief_responses
  UNION ALL SELECT 'dimension_scores', COUNT(*) FROM dimension_scores
  UNION ALL SELECT 'belief_lineage',   COUNT(*) FROM belief_lineage
  UNION ALL SELECT 'dna_snapshots',    COUNT(*) FROM dna_snapshots
  UNION ALL SELECT 'genome_analyses',  COUNT(*) FROM genome_analyses
  UNION ALL SELECT 'known_dnas',       COUNT(*) FROM known_dnas
  UNION ALL SELECT 'probes',           COUNT(*) FROM probes
  UNION ALL SELECT 'users',            COUNT(*) FROM users
) t ORDER BY table_name;

-- Delete in dependency order (FKs all point in to users; users untouched).
DELETE FROM belief_lineage;
DELETE FROM dimension_scores;
DELETE FROM dna_snapshots;
DELETE FROM genome_analyses;
DELETE FROM known_dnas;
DELETE FROM probes;
DELETE FROM belief_responses;

-- Post-wipe verification.
-- Every wiped table MUST be 0; users MUST still be 7.
SELECT 'POST ' || table_name AS label, rows FROM (
  SELECT 'belief_responses' AS table_name, COUNT(*) AS rows FROM belief_responses
  UNION ALL SELECT 'dimension_scores', COUNT(*) FROM dimension_scores
  UNION ALL SELECT 'belief_lineage',   COUNT(*) FROM belief_lineage
  UNION ALL SELECT 'dna_snapshots',    COUNT(*) FROM dna_snapshots
  UNION ALL SELECT 'genome_analyses',  COUNT(*) FROM genome_analyses
  UNION ALL SELECT 'known_dnas',       COUNT(*) FROM known_dnas
  UNION ALL SELECT 'probes',           COUNT(*) FROM probes
  UNION ALL SELECT 'users',            COUNT(*) FROM users
) t ORDER BY table_name;

COMMIT;
