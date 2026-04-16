import { db } from '@workspace/db';
import { genomeSubmissions } from '@workspace/db/schema';
import { eq, sql } from 'drizzle-orm';

async function main() {
  const [before] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(genomeSubmissions)
    .where(eq(genomeSubmissions.isTestData, true));

  const testCount = before?.count ?? 0;

  const [real] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(genomeSubmissions)
    .where(eq(genomeSubmissions.isTestData, false));

  const realCount = real?.count ?? 0;

  console.log(`[cleanup] Found ${testCount} test submissions (is_test_data = true).`);
  console.log(`[cleanup] Real submissions that will be PRESERVED: ${realCount}.`);

  if (testCount === 0) {
    console.log('[cleanup] Nothing to delete. Done.');
    process.exit(0);
  }

  const dryRun = process.argv.includes('--dry-run');
  if (dryRun) {
    console.log('[cleanup] --dry-run flag set. No deletion performed.');
    process.exit(0);
  }

  console.log(`[cleanup] Deleting ${testCount} test submissions...`);
  await db.delete(genomeSubmissions).where(eq(genomeSubmissions.isTestData, true));

  const [after] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(genomeSubmissions)
    .where(eq(genomeSubmissions.isTestData, true));

  console.log(`[cleanup] Done. Test submissions remaining: ${after?.count ?? 0}.`);
  console.log(`[cleanup] Real submissions still in DB: ${realCount}.`);
  process.exit(0);
}

main().catch((err) => {
  console.error('[cleanup] Failed:', err);
  process.exit(1);
});
