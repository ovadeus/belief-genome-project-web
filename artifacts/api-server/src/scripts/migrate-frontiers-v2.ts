// One-shot migration for the Frontiers paper schemaVersion 2 alignment.
// Idempotent: safe to re-run.
//
// What it does:
//   1. Drops NOT NULL on belief_responses.value so skipped responses can
//      persist with value=NULL.
//   2. Adds belief_responses.pair_position (nullable integer) — which
//      member of a framing pair was administered first to this user.
//   3. Adds belief_responses.skipped (boolean default false) — non-
//      substantive non-response flag (preserved row, excluded from analyses).
//
// Run: pnpm --filter @workspace/api-server tsx src/scripts/migrate-frontiers-v2.ts
//
// Per replit.md convention: raw ALTER TABLE statements, NOT drizzle db push
// (push would drop unrelated tables outside the schema, e.g. eh_*).

import { db } from '@workspace/db';
import { sql } from 'drizzle-orm';

async function main() {
  console.log('[migrate-frontiers-v2] starting');

  await db.execute(sql`ALTER TABLE belief_responses ALTER COLUMN value DROP NOT NULL`);
  console.log('[migrate-frontiers-v2] belief_responses.value is now nullable');

  await db.execute(sql`ALTER TABLE belief_responses ADD COLUMN IF NOT EXISTS pair_position integer`);
  console.log('[migrate-frontiers-v2] belief_responses.pair_position added (or already present)');

  await db.execute(sql`ALTER TABLE belief_responses ADD COLUMN IF NOT EXISTS skipped boolean NOT NULL DEFAULT false`);
  console.log('[migrate-frontiers-v2] belief_responses.skipped added (or already present)');

  console.log('[migrate-frontiers-v2] done');
  process.exit(0);
}

main().catch((e) => {
  console.error('[migrate-frontiers-v2] fatal', e);
  process.exit(1);
});
