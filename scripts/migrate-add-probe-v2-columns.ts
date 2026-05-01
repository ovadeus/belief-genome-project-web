/**
 * One-time migration: add the `probe_v2` JSONB column to both the queue
 * (`probes`) and the ingest log (`belief_responses`) so V2 framing-pair
 * metadata can be captured at queue time and propagated through `/respond`.
 *
 * Why a hand-rolled script instead of `drizzle-kit push`:
 *   The repo carries orphan `eh_*` tables that aren't in the schema. A
 *   `db push` would happily drop them. Same precedent as the `sum_squares`
 *   add — applied via raw ALTER, not via push.
 *
 * Idempotent: uses `ADD COLUMN IF NOT EXISTS`. Safe to re-run any time;
 *   safe to run as part of every deploy as a no-op once the column exists.
 *
 * Usage:
 *   pnpm --filter @workspace/scripts run migrate:probev2:dry   # show plan only
 *   pnpm --filter @workspace/scripts run migrate:probev2       # apply
 *
 * Pairs with:
 *   - lib/db/src/schema/users.ts (the matching Drizzle column definitions)
 *   - scripts/backfill-probe-v2.ts (text-match back-fill of historical rows)
 */
import { pool } from '@workspace/db';

const DRY = process.argv.includes('--dry-run');

const STATEMENTS: Array<{ label: string; sql: string }> = [
  {
    label: 'belief_responses.probe_v2',
    sql: `ALTER TABLE "belief_responses" ADD COLUMN IF NOT EXISTS "probe_v2" jsonb;`,
  },
  {
    label: 'probes.probe_v2',
    sql: `ALTER TABLE "probes" ADD COLUMN IF NOT EXISTS "probe_v2" jsonb;`,
  },
];

async function columnExists(table: string, column: string): Promise<boolean> {
  const { rows } = await pool.query(
    `SELECT 1 FROM information_schema.columns
       WHERE table_name = $1 AND column_name = $2 LIMIT 1`,
    [table, column],
  );
  return rows.length > 0;
}

async function main() {
  console.log(`probe_v2 column migration (${DRY ? 'DRY RUN' : 'APPLY'})`);
  console.log('─'.repeat(60));

  for (const stmt of STATEMENTS) {
    const [table, column] = stmt.label.split('.');
    const present = await columnExists(table, column);
    if (present) {
      console.log(`  [skip] ${stmt.label} — already present`);
      continue;
    }
    if (DRY) {
      console.log(`  [plan] ${stmt.label}`);
      console.log(`         ${stmt.sql}`);
      continue;
    }
    console.log(`  [apply] ${stmt.label}`);
    await pool.query(stmt.sql);
    console.log(`          ok`);
  }

  console.log('─'.repeat(60));
  console.log('done');
  await pool.end();
}

main().catch(async (err) => {
  console.error('migration failed:', err);
  try { await pool.end(); } catch {}
  process.exit(1);
});
