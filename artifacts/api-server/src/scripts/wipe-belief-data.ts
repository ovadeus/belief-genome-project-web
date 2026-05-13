// DESTRUCTIVE. Truncates every belief-related table.
//
// Required by Frontiers schemaVersion 2 alignment: existing test responses
// were captured under the 0–9 belief-value semantics (midpoint 4.5) and must
// not persist into the 1–9 / midpoint-5 era — partial-wipe scenarios produce
// silently-corrupt DNA strings whose serial mixes pre- and post-change math.
//
// Tables wiped (CASCADE protects against FK ordering surprises):
//   - belief_lineage         (provenance, depends on belief_responses)
//   - dimension_scores       (per-user dim accumulators, recomputable)
//   - dna_snapshots          (per-user DNA serial cache)
//   - genome_submissions     (anonymous public DNA submissions)
//   - belief_responses       (the per-response source of truth)
//
// Run: WIPE_CONFIRM=YES pnpm --filter @workspace/api-server tsx src/scripts/wipe-belief-data.ts
//
// Refuses without WIPE_CONFIRM=YES so an accidental run can't nuke prod data.

import { db } from '@workspace/db';
import { sql } from 'drizzle-orm';

async function main() {
  if (process.env.WIPE_CONFIRM !== 'YES') {
    console.error('[wipe-belief-data] refusing — set WIPE_CONFIRM=YES to proceed');
    process.exit(1);
  }
  console.log('[wipe-belief-data] starting');
  await db.execute(sql`
    TRUNCATE TABLE
      belief_lineage,
      dimension_scores,
      dna_snapshots,
      genome_submissions,
      belief_responses
    RESTART IDENTITY CASCADE
  `);
  console.log('[wipe-belief-data] truncated belief_lineage, dimension_scores, dna_snapshots, genome_submissions, belief_responses');
  process.exit(0);
}

main().catch((e) => {
  console.error('[wipe-belief-data] fatal', e);
  process.exit(1);
});
