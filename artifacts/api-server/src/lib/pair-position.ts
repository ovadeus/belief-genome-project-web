// Helpers for stamping `pair_position` on belief_responses inserts.
//
// Frontiers schemaVersion 2 requires every response derived from a V2 framing
// pair to record which member of the pair was administered first to this user
// (1) versus the partner that completes the pair (2). Responses without V2
// metadata (legacy bank, news feed, ad-hoc text) carry NULL.
//
// Two paths use these helpers:
//   • single-shot writers (POST /respond): one db lookup per insert.
//   • bulk writers (POST /sync, POST /responses/bulk-import): pre-fetch the
//     user's existing pair-id counts in ONE query, then increment in-memory
//     for each row. Avoids N round-trips per batch.

import { sql } from 'drizzle-orm';
import { db } from '@workspace/db';

type Executor = { execute: typeof db.execute };

// Pre-load every (pair_id → count) for the user so bulk loops can stamp
// pair_position without per-row queries. Returns an empty Map when the user
// has no V2 responses yet.
export async function loadPairCounts(
  userId: number,
  conn: Executor = db,
): Promise<Map<string, number>> {
  const result = await conn.execute(sql`
    SELECT probe_v2->>'pair_id' AS pair_id, COUNT(*)::int AS n
    FROM belief_responses
    WHERE user_id = ${userId}
      AND probe_v2 IS NOT NULL
      AND probe_v2->>'pair_id' IS NOT NULL
    GROUP BY probe_v2->>'pair_id'
  `);
  const map = new Map<string, number>();
  for (const r of (result as any).rows ?? []) {
    if (r.pair_id) map.set(String(r.pair_id), Number(r.n));
  }
  return map;
}

// Stamp the next pair_position for a row and mutate the running counts map.
// Returns 1 (first member to land for this pair), 2 (second / pair completed),
// or null (no pair_id, or pair is already double-stamped — anomaly logged).
export function nextPairPosition(
  pairCounts: Map<string, number>,
  pairId: string | null | undefined,
  ctx: { userId: number } = { userId: 0 },
): 1 | 2 | null {
  if (!pairId) return null;
  const prev = pairCounts.get(pairId) ?? 0;
  pairCounts.set(pairId, prev + 1);
  if (prev === 0) return 1;
  if (prev === 1) return 2;
  // ≥3 responses for the same pair_id from one user — shouldn't happen under
  // V2 but we don't want to block the insert; surface it for investigation.
  console.warn(
    `[pair-position] user=${ctx.userId} pair_id=${pairId} now has ${prev + 1} responses — stamping null`,
  );
  return null;
}

// Single-shot convenience: do the lookup + increment in one call.
// Use only when you're inserting one response — bulk paths should use
// loadPairCounts() once and nextPairPosition() per row.
export async function computePairPosition(
  userId: number,
  pairId: string | null | undefined,
  conn: Executor = db,
): Promise<1 | 2 | null> {
  if (!pairId) return null;
  const result = await conn.execute(sql`
    SELECT COUNT(*)::int AS n
    FROM belief_responses
    WHERE user_id = ${userId}
      AND probe_v2 IS NOT NULL
      AND probe_v2->>'pair_id' = ${pairId}
  `);
  const n = Number((result as any).rows?.[0]?.n ?? 0);
  if (n === 0) return 1;
  if (n === 1) return 2;
  console.warn(
    `[pair-position] user=${userId} pair_id=${pairId} already has ${n} responses — stamping null`,
  );
  return null;
}
