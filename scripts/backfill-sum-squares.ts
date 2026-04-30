// One-shot back-fill for `dimension_scores.sum_squares` (V2 DNA coherence).
//
// Replays every user's belief_responses in order through the canonical
// engine helper applyResponseToScores — the same code path that runs at
// ingest time — so the sum_squares value persisted matches what would
// have been stored if V2 had always been live. Idempotent: re-running
// produces the same result for any given response history.
//
// Usage:
//   pnpm --filter @workspace/scripts run backfill:sumsq -- --dry-run
//   pnpm --filter @workspace/scripts run backfill:sumsq
//
// --dry-run prints planned UPDATEs and exits without writing.
//
// Safety net: this script only writes sum_squares; it never touches
// weighted_sum / total_weight / count, so user score positions cannot
// drift even if the script is rerun.

import { db } from '@workspace/db';
import { beliefResponses, dimensionScores, users } from '@workspace/db/schema';
import { applyResponseToScores } from '@belief-genome/engine';
import type { Accumulator } from '@belief-genome/engine';
import { eq, and, asc } from 'drizzle-orm';

const DRY_RUN = process.argv.includes('--dry-run');

type Counts = {
  usersScanned: number;
  usersTouched: number;
  responsesReplayed: number;
  rowsUpdated: number;
  rowsSkipped: number;
};

async function main() {
  const counts: Counts = {
    usersScanned: 0,
    usersTouched: 0,
    responsesReplayed: 0,
    rowsUpdated: 0,
    rowsSkipped: 0,
  };

  const allUsers = await db.select({ id: users.id, email: users.email }).from(users);
  console.log(`[backfill-sum-squares] ${DRY_RUN ? 'DRY RUN — ' : ''}scanning ${allUsers.length} users`);

  for (const u of allUsers) {
    counts.usersScanned++;

    const responses = await db
      .select({
        value: beliefResponses.value,
        dimensionWeights: beliefResponses.dimensionWeights,
        quality: beliefResponses.quality,
      })
      .from(beliefResponses)
      .where(eq(beliefResponses.userId, u.id))
      .orderBy(asc(beliefResponses.createdAt), asc(beliefResponses.id));

    if (responses.length === 0) continue;

    // Replay through the canonical engine helper so the result is
    // bit-for-bit identical to what live ingest would have produced.
    let accMap: Record<number, Accumulator> = {};
    for (const r of responses) {
      const { next } = applyResponseToScores(accMap, {
        value: r.value,
        dimensionWeights: (r.dimensionWeights as any) || {},
        quality: (r.quality as any) || undefined,
      });
      accMap = next;
      counts.responsesReplayed++;
    }

    // Pull current rows once, then write only sum_squares per dim.
    const existing = await db
      .select({ id: dimensionScores.id, dimensionId: dimensionScores.dimensionId, sumSquares: dimensionScores.sumSquares })
      .from(dimensionScores)
      .where(eq(dimensionScores.userId, u.id));
    const byDim = new Map(existing.map(r => [r.dimensionId, r]));

    let updatedThisUser = 0;
    let skippedThisUser = 0;
    for (const [dimIdStr, acc] of Object.entries(accMap)) {
      const dimId = parseInt(dimIdStr, 10);
      const row = byDim.get(dimId);
      if (!row) {
        // Replay produced a dim that isn't persisted — skip silently;
        // this means a response touched it but no score row exists,
        // which means the row will be created on the next live update.
        skippedThisUser++;
        continue;
      }
      const target = acc.sumSquares;
      // Skip if already within float epsilon of the computed value
      // (allows safe re-runs without churn).
      if (Math.abs((row.sumSquares ?? 0) - target) < 1e-9) {
        skippedThisUser++;
        continue;
      }

      if (DRY_RUN) {
        console.log(
          `  user=${u.id} dim=${dimId}: sum_squares ${(row.sumSquares ?? 0).toFixed(6)} → ${target.toFixed(6)}`,
        );
      } else {
        await db
          .update(dimensionScores)
          .set({ sumSquares: target })
          .where(and(eq(dimensionScores.id, row.id)));
      }
      updatedThisUser++;
    }

    if (updatedThisUser > 0 || skippedThisUser > 0) {
      counts.usersTouched++;
      counts.rowsUpdated += updatedThisUser;
      counts.rowsSkipped += skippedThisUser;
      console.log(
        `[backfill-sum-squares] user=${u.id} (${u.email}): ${updatedThisUser} updated, ${skippedThisUser} skipped, ${responses.length} responses replayed`,
      );
    }
  }

  console.log('[backfill-sum-squares] done', counts);
  process.exit(0);
}

main().catch(err => {
  console.error('[backfill-sum-squares] FAILED', err);
  process.exit(1);
});
