// One-shot backfill — generates belief_lineage rows for every existing
// belief_response that doesn't already have lineage. Idempotent: skips
// responses whose ids already appear in belief_lineage, so it's safe to
// re-run after partial failures.
//
// Run: pnpm --filter @workspace/api-server tsx src/scripts/backfill-lineage.ts
//
// What it does NOT do: recompute dimension_scores. Those are already correct
// from prior writes; backfill only fills in the missing provenance trail.

import { db } from '@workspace/db';
import { beliefResponses, beliefLineage } from '@workspace/db/schema';
import { applyResponseToScores } from '@belief-genome/engine';
import type { Accumulator } from '@belief-genome/engine';
import { sql } from 'drizzle-orm';

async function main() {
  const start = Date.now();
  console.log('[backfill-lineage] starting');

  // Distinct user ids with at least one response.
  const userRows = await db
    .selectDistinct({ userId: beliefResponses.userId })
    .from(beliefResponses);
  console.log(`[backfill-lineage] found ${userRows.length} users with responses`);

  let totalInserted = 0;
  let totalSkippedUsers = 0;
  let totalSkippedResponses = 0;

  for (const { userId } of userRows) {
    // Pull every response for this user in chronological order. The replay
    // walk only produces correct lineage if responses are processed in the
    // same order they were originally written.
    const rows = await db
      .select({
        id: beliefResponses.id,
        value: beliefResponses.value,
        dimensionWeights: beliefResponses.dimensionWeights,
        quality: beliefResponses.quality,
        createdAt: beliefResponses.createdAt,
      })
      .from(beliefResponses)
      .where(sql`${beliefResponses.userId} = ${userId}`)
      .orderBy(beliefResponses.createdAt, beliefResponses.id);

    if (rows.length === 0) continue;

    // Find which response ids already have lineage so we can skip them.
    // We can't just "if any exist, skip user" because a partial run may have
    // covered the first N responses but not the rest.
    const existingLineage = await db
      .select({ responseId: beliefLineage.responseId })
      .from(beliefLineage)
      .where(sql`${beliefLineage.userId} = ${userId}`);
    const lineageSet = new Set<number>(existingLineage.map(r => r.responseId));

    if (lineageSet.size === rows.length) {
      totalSkippedUsers++;
      continue;
    }

    // Replay every response through the engine — even ones that already have
    // lineage — because we need the running accumulator to be correct when we
    // hit the first missing response. Only the missing rows actually get
    // inserted at the end.
    const accMap: Record<number, Accumulator> = {};
    const inserts: Array<typeof beliefLineage.$inferInsert> = [];

    for (const r of rows) {
      const dimensionWeights = (r.dimensionWeights ?? {}) as Record<string, { direction: number; weight: number }>;
      const quality = (r.quality ?? { weight: 0.7 }) as { weight?: number };

      const { next, impacts } = applyResponseToScores(accMap, {
        value: r.value,
        dimensionWeights,
        quality,
      });
      for (const dimIdStr of Object.keys(next)) {
        accMap[parseInt(dimIdStr, 10)] = next[parseInt(dimIdStr, 10)];
      }

      if (lineageSet.has(r.id)) {
        totalSkippedResponses++;
        continue;
      }

      for (const i of impacts) {
        inserts.push({
          userId,
          responseId: r.id,
          dimensionId: i.dimensionId,
          scoreBefore: i.scoreBefore,
          scoreAfter: i.scoreAfter,
          delta: i.delta,
          confidenceBefore: i.confidenceBefore,
          confidenceAfter: i.confidenceAfter,
          createdAt: r.createdAt,
        });
      }
    }

    if (inserts.length > 0) {
      const CHUNK = 1000;
      for (let i = 0; i < inserts.length; i += CHUNK) {
        await db.insert(beliefLineage).values(inserts.slice(i, i + CHUNK));
      }
      totalInserted += inserts.length;
      console.log(`[backfill-lineage] user=${userId} inserted=${inserts.length} (responses=${rows.length}, prior_lineage=${lineageSet.size})`);
    }
  }

  const elapsed = Date.now() - start;
  console.log(
    `[backfill-lineage] DONE inserted=${totalInserted} ` +
    `skipped_users=${totalSkippedUsers} skipped_responses=${totalSkippedResponses} ` +
    `elapsed_ms=${elapsed}`,
  );
  process.exit(0);
}

main().catch(err => {
  console.error('[backfill-lineage] FAILED', err);
  process.exit(1);
});
