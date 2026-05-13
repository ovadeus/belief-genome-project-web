// Belief Genome — Frontiers paper analytical endpoints.
//
// Mounted at /api/belief/* (vs /api/genome/*) so the per-user genome view
// surfaces stay separate from the population-level QQ-equality surfaces
// described in the Frontiers paper (Meyers 2026, Sections 6.1 & 6.5).
//
// Privacy: routes here aggregate across ALL users for QQ-equality analysis.
// We require a minimum stratum population (DEFAULT_MIN_USERS_PER_STRATUM)
// before reporting per-stratum statistics — small strata return
// `sufficient:false` with `reason:'insufficient_population'` instead of
// leaking individual respondents' positions.

import { Router, type Request, type Response } from 'express';
import { db } from '@workspace/db';
import { beliefResponses } from '@workspace/db/schema';
import { eq, and, isNotNull, sql } from 'drizzle-orm';
import {
  computeStratifiedQQ,
  type QQResponse,
  type StratumId,
} from '@belief-genome/engine';

const router: Router = Router();

// Minimum distinct users per stratum before per-stratum results are emitted.
// Below this, the stratum entry is preserved (so the UI can show "not enough
// data yet") but qq_magnitude is suppressed.
const DEFAULT_MIN_USERS_PER_STRATUM = 5;

// ── GET /qq-stats?dim=<int> ───────────────────────────────────
//
// Population-level stratified QQ-equality for one dimension. Pulls every
// non-skipped response in the database whose probeV2.primary_dim matches,
// runs the engine pipeline, and returns the five-stratum payload.
//
// Phase 1 = each respondent's FIRST substantive response on this dim
//           (used for stratum assignment).
// Phase 2 = the same set of responses (paired-complete records inside one
//           dim). The engine handles partition by pair_id + orientation.
//
// This endpoint is intentionally unauthenticated for now — the output is
// fully aggregated and contains no per-user identifiers.
router.get('/qq-stats', async (req: Request, res: Response) => {
  const dimRaw = req.query.dim ?? '4';
  const dimId = parseInt(String(dimRaw), 10);
  if (!Number.isInteger(dimId) || dimId < 1) {
    return res.status(400).json({ error: 'dim must be a positive integer' });
  }

  // Pull every substantive (non-skipped, non-null) response that carries V2
  // metadata for the requested dim. We filter on probe_v2->>'primary_dim' to
  // avoid loading the entire belief_responses table into memory.
  const rows = await db
    .select({
      userId:        beliefResponses.userId,
      value:         beliefResponses.value,
      probeV2:       beliefResponses.probeV2,
      pairPosition:  beliefResponses.pairPosition,
      skipped:       beliefResponses.skipped,
      createdAt:     beliefResponses.createdAt,
    })
    .from(beliefResponses)
    .where(and(
      eq(beliefResponses.skipped, false),
      isNotNull(beliefResponses.value),
      isNotNull(beliefResponses.probeV2),
      sql`${beliefResponses.probeV2}->>'primary_dim' = ${String(dimId)}`,
    ))
    .orderBy(beliefResponses.createdAt, beliefResponses.id);

  // Map to engine input shape. user_id is stringified so two int users with
  // the same numeric value never collide with a leading-zero edge-case.
  const responses: QQResponse[] = rows.map(r => ({
    user_id:       String(r.userId),
    value:         r.value,
    probeV2:       r.probeV2 as QQResponse['probeV2'],
    pair_position: r.pairPosition as 1 | 2 | null | undefined,
    skipped:       r.skipped,
    created_at:    (r.createdAt instanceof Date ? r.createdAt.toISOString() : String(r.createdAt)),
  }));

  // Per the paper's design: Phase 1 baseline is each respondent's FIRST
  // substantive response on the dim. computeStratifiedQQ enforces that
  // internally (keeps only the first per user). Phase 2 = the full set
  // (the engine then derives pair-complete records).
  const stratified = computeStratifiedQQ(responses, responses, dimId);

  // Privacy guard: count distinct users per stratum AFTER assignment, then
  // suppress strata below threshold.
  const userByStratum = new Map<StratumId, Set<string>>();
  // Recompute the per-user → stratum mapping using the same rule as the
  // engine so the privacy filter agrees with what's reported.
  const baselineByUser = new Map<string, number>();
  for (const r of responses) {
    if (r.value == null) continue;
    const userId = r.user_id || 'local';
    if (baselineByUser.has(userId)) continue;
    baselineByUser.set(userId, Math.round(1 + r.value * 8));
  }
  const stratumIds = Object.keys(stratified.strata) as StratumId[];
  for (const id of stratumIds) userByStratum.set(id, new Set());
  for (const [userId, baseline] of baselineByUser.entries()) {
    let id: StratumId | null = null;
    if ([1, 2, 3].includes(baseline))           id = 'resolved-low';
    else if (baseline === 4)                    id = 'near-midpoint-low';
    else if (baseline === 5)                    id = 'midpoint';
    else if (baseline === 6)                    id = 'near-midpoint-high';
    else if ([7, 8, 9].includes(baseline))      id = 'resolved-high';
    if (id) userByStratum.get(id)!.add(userId);
  }

  for (const id of stratumIds) {
    const distinct = userByStratum.get(id)!.size;
    const stratum = stratified.strata[id];
    (stratum as any).distinct_users = distinct;
    if (distinct < DEFAULT_MIN_USERS_PER_STRATUM) {
      stratum.sufficient = false;
      stratum.qq_magnitude = null;
      stratum.reason = `insufficient_population (have ${distinct}, need ${DEFAULT_MIN_USERS_PER_STRATUM})`;
    }
  }

  return res.json({
    ok: true,
    ...stratified,
    privacy: {
      min_users_per_stratum: DEFAULT_MIN_USERS_PER_STRATUM,
    },
  });
});

export default router;
