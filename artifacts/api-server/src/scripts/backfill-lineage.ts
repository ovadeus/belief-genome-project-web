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

// Exported so tests can drive the same code path the CLI does without
// triggering process.exit. The CLI wrapper at the bottom of the file
// preserves the original `pnpm tsx ...` entry point.
export interface BackfillResult {
  inserted: number;
  skippedUsers: number;
  skippedResponses: number;
  elapsedMs: number;
}

export async function runBackfillLineage(opts: { userId?: number } = {}): Promise<BackfillResult> {
  const start = Date.now();
  console.log('[backfill-lineage] starting');

  // Distinct user ids with at least one response. When opts.userId is set
  // (test driver) we narrow to that single user so the backfill doesn't
  // touch unrelated production data.
  const userRows = opts.userId != null
    ? [{ userId: opts.userId }]
    : await db
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

    // Find which (response_id, dimension_id) pairs already have lineage so
    // we can skip them. We track at the PAIR level — not per-response —
    // because a previous run could have crashed mid-response after writing
    // some of its impacts but not all. Skipping at response granularity
    // would permanently lose the missing impacts. Pair-level granularity
    // matches the unique index on (response_id, dimension_id).
    const existingLineage = await db
      .select({ responseId: beliefLineage.responseId, dimensionId: beliefLineage.dimensionId })
      .from(beliefLineage)
      .where(sql`${beliefLineage.userId} = ${userId}`);
    const pairKey = (r: number, d: number) => `${r}:${d}`;
    const lineagePairSet = new Set<string>(
      existingLineage.map(r => pairKey(r.responseId, r.dimensionId)),
    );

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

      // Filter out only the (response, dim) pairs that already exist.
      // Anything missing — including partial-failure leftovers from a
      // previous run — gets queued for insert.
      let alreadyHadAll = true;
      for (const i of impacts) {
        if (lineagePairSet.has(pairKey(r.id, i.dimensionId))) continue;
        alreadyHadAll = false;
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
      if (alreadyHadAll && impacts.length > 0) totalSkippedResponses++;
    }

    if (inserts.length === 0) {
      totalSkippedUsers++;
    }

    if (inserts.length > 0) {
      // ON CONFLICT DO NOTHING is the belt to the pair-set's suspenders —
      // protects against a parallel live ingest writing the same pair while
      // this backfill is mid-flight (the unique index enforces it).
      const CHUNK = 1000;
      for (let i = 0; i < inserts.length; i += CHUNK) {
        await db
          .insert(beliefLineage)
          .values(inserts.slice(i, i + CHUNK))
          .onConflictDoNothing({
            target: [beliefLineage.responseId, beliefLineage.dimensionId],
          });
      }
      totalInserted += inserts.length;
      console.log(`[backfill-lineage] user=${userId} inserted=${inserts.length} (responses=${rows.length}, prior_lineage_pairs=${lineagePairSet.size})`);
    }
  }

  const elapsed = Date.now() - start;
  console.log(
    `[backfill-lineage] DONE inserted=${totalInserted} ` +
    `skipped_users=${totalSkippedUsers} skipped_responses=${totalSkippedResponses} ` +
    `elapsed_ms=${elapsed}`,
  );
  return {
    inserted: totalInserted,
    skippedUsers: totalSkippedUsers,
    skippedResponses: totalSkippedResponses,
    elapsedMs: elapsed,
  };
}

// CLI entry point — preserve the original behaviour: run the full backfill
// then exit. Tests should import runBackfillLineage directly instead.
const isMain = (() => {
  try {
    return import.meta.url === `file://${process.argv[1]}`;
  } catch {
    return false;
  }
})();

if (isMain) {
  runBackfillLineage()
    .then(() => process.exit(0))
    .catch(err => {
      console.error('[backfill-lineage] FAILED', err);
      process.exit(1);
    });
}
