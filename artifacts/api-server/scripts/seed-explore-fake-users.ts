/**
 * CLI wrapper around src/lib/seedExploreData.ts.
 * Run locally with:
 *   pnpm --filter @workspace/api-server exec tsx ./scripts/seed-explore-fake-users.ts
 *
 * To seed the PRODUCTION database, call the admin endpoint instead:
 *   POST https://<your-domain>/api/admin/seed-explore-data
 *   (requires admin login)
 */

import { seedExploreData } from '../src/lib/seedExploreData';

async function main() {
  console.log('[seed] Starting...');
  const result = await seedExploreData({ wipeFirst: true });
  console.log(`[seed] Wiped:    ${result.wiped}`);
  console.log(`[seed] Inserted: ${result.inserted}  (${result.usersPerWeek}/week × ${result.weeks} weeks)`);
  console.log(`\n[seed] Archetype distribution:`);
  for (const [a, n] of Object.entries(result.archetypeCounts).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${a.padEnd(38)} ${String(n).padStart(5)}`);
  }
  console.log('[seed] Done.');
  process.exit(0);
}

main().catch((err) => { console.error('[seed] Failed:', err); process.exit(1); });
