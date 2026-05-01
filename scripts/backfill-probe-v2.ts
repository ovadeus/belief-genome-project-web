// One-shot back-fill for `belief_responses.probe_v2` (and `probes.probe_v2`).
//
// For every row whose probe_v2 is NULL, look the row's probeText / statement
// up in PROBE_BANK_V2 and, if there's an exact text match, populate the
// probe_v2 metadata blob. Most legacy responses pre-date the V2 bank and
// have no text overlap — that's expected per spec, those rows simply stay
// null and contribute amplitude (not phase) to coherence.
//
// Usage:
//   pnpm --filter @workspace/scripts run backfill:probev2 -- --dry-run
//   pnpm --filter @workspace/scripts run backfill:probev2
//
// Idempotent: a second run finds no NULL→V2 candidates and exits 0.

import { db } from '@workspace/db';
import { beliefResponses, probes } from '@workspace/db/schema';
import { getProbeV2ByText, extractProbeV2Meta } from '@belief-genome/engine';
import { eq, and, isNull, sql } from 'drizzle-orm';

const DRY_RUN = process.argv.includes('--dry-run') || process.argv.includes('--dry');

type Counts = {
  scanned: number;
  matched: number;
  updated: number;
  skipped: number;
};

async function backfillTable(label: 'belief_responses' | 'probes') {
  const counts: Counts = { scanned: 0, matched: 0, updated: 0, skipped: 0 };

  if (label === 'belief_responses') {
    const rows = await db
      .select({ id: beliefResponses.id, text: beliefResponses.probeText })
      .from(beliefResponses)
      .where(isNull(beliefResponses.probeV2));
    counts.scanned = rows.length;

    for (const r of rows) {
      const v2 = getProbeV2ByText(r.text);
      if (!v2) { counts.skipped++; continue; }
      counts.matched++;

      if (DRY_RUN) continue;
      await db
        .update(beliefResponses)
        .set({ probeV2: extractProbeV2Meta(v2) })
        .where(and(eq(beliefResponses.id, r.id), isNull(beliefResponses.probeV2)));
      counts.updated++;
    }
  } else {
    const rows = await db
      .select({ id: probes.id, text: probes.statement })
      .from(probes)
      .where(isNull(probes.probeV2));
    counts.scanned = rows.length;

    for (const r of rows) {
      const v2 = getProbeV2ByText(r.text);
      if (!v2) { counts.skipped++; continue; }
      counts.matched++;

      if (DRY_RUN) continue;
      await db
        .update(probes)
        .set({ probeV2: extractProbeV2Meta(v2) })
        .where(and(eq(probes.id, r.id), isNull(probes.probeV2)));
      counts.updated++;
    }
  }

  return counts;
}

async function main() {
  console.log(`[backfill-probe-v2] ${DRY_RUN ? 'DRY RUN — ' : ''}starting`);

  const br = await backfillTable('belief_responses');
  console.log(
    `[belief_responses]  scanned=${br.scanned}  matched=${br.matched}  ` +
    `updated=${br.updated}  unmatched=${br.skipped}`,
  );

  const pr = await backfillTable('probes');
  console.log(
    `[probes]            scanned=${pr.scanned}  matched=${pr.matched}  ` +
    `updated=${pr.updated}  unmatched=${pr.skipped}`,
  );

  // Final shape report so it's obvious how much of the DB is V2-aware now.
  const [{ br_total, br_v2 }] = await db.execute<{ br_total: number; br_v2: number }>(sql`
    SELECT
      COUNT(*)::int                                    AS br_total,
      COUNT(*) FILTER (WHERE probe_v2 IS NOT NULL)::int AS br_v2
    FROM belief_responses
  `).then((r: any) => r.rows ?? r);
  const [{ pr_total, pr_v2 }] = await db.execute<{ pr_total: number; pr_v2: number }>(sql`
    SELECT
      COUNT(*)::int                                    AS pr_total,
      COUNT(*) FILTER (WHERE probe_v2 IS NOT NULL)::int AS pr_v2
    FROM probes
  `).then((r: any) => r.rows ?? r);

  console.log(
    `[final] belief_responses ${br_v2}/${br_total} V2-aware  ` +
    `probes ${pr_v2}/${pr_total} V2-aware`,
  );

  process.exit(0);
}

main().catch((e) => {
  console.error('[backfill-probe-v2] failed:', e);
  process.exit(1);
});
