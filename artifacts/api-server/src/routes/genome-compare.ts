// Auth-gated compare endpoint.
// Mount at: app.use('/api/genome', genomeAuth, genomeCompareRouter)
//
// GET /api/genome/compare?against=<idOrSignature>
//   - if `against` is purely numeric => library entry id (must belong to user)
//   - else => raw signature, validated via decodeSignature

import { Router, type IRouter, type Request, type Response } from 'express';
import { db, knownDnas, dimensionScores, beliefResponses, users } from '@workspace/db';
import { and, eq, sql } from 'drizzle-orm';
import {
  calcDimensionValue,
  calcConfidence,
  type Accumulator,
} from '@belief-genome/engine';
import { buildTheirSide, computeComparison } from '../services/compareService';

const router: IRouter = Router();

// 60/min/user rate limit
const rl: Record<number, number[]> = {};
function allow(uid: number): boolean {
  const now = Date.now();
  const arr = (rl[uid] ||= []);
  while (arr.length && arr[0] < now - 60_000) arr.shift();
  if (arr.length >= 60) return false;
  arr.push(now);
  return true;
}

router.get('/compare', async (req: Request, res: Response) => {
  const uid = (req as any).genomeUser.userId as number;

  if (!allow(uid)) return res.status(429).json({ error: 'rate_limited' });

  const against = typeof req.query.against === 'string' ? req.query.against : '';
  if (!against) return res.status(400).json({ error: 'against_required' });

  // Resolve the "theirs" signature.
  let theirSignature: string;
  let meta: { shareableName: string | null; note: string | null } = { shareableName: null, note: null };

  if (/^\d+$/.test(against)) {
    const id = parseInt(against, 10);
    const rows = await db
      .select()
      .from(knownDnas)
      .where(and(eq(knownDnas.id, id), eq(knownDnas.userId, uid)))
      .limit(1);
    if (!rows.length) return res.status(404).json({ error: 'not_found' });
    theirSignature = rows[0].signature;
    meta = { shareableName: rows[0].shareableName, note: rows[0].note };
  } else {
    theirSignature = against;
  }

  let theirs;
  try {
    theirs = await buildTheirSide(theirSignature, meta);
  } catch {
    return res.status(404).json({ error: 'not_found' });
  }

  // Build "yours" — re-derive from dimension_scores (same path as /dna).
  const [user] = await db.select({ id: users.id }).from(users).where(eq(users.id, uid));
  if (!user) return res.status(404).json({ error: 'not_found' });

  const scores = await db.select().from(dimensionScores).where(eq(dimensionScores.userId, uid));
  const yourScores: Record<number, number> = {};
  const conf: Record<number, number> = {};
  for (const s of scores) {
    const accum: Accumulator = { sum: s.weightedSum, totalWeight: s.totalWeight, count: s.count };
    const val = calcDimensionValue(accum);
    if (val !== null) {
      yourScores[s.dimensionId] = val;
      conf[s.dimensionId] = calcConfidence(accum);
    }
  }

  const [{ count: totalResponses } = { count: 0 }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(beliefResponses)
    .where(eq(beliefResponses.userId, uid));

  const confValues = Object.values(conf);
  const overallConfidence = confValues.length
    ? Math.round(confValues.reduce((s, v) => s + v, 0) / confValues.length)
    : 0;

  const yours = {
    dimensionScores: yourScores,
    totalResponses,
    dimensionsCovered: Object.keys(yourScores).length,
    overallConfidence,
  };

  const comparison = computeComparison(yourScores, theirs.dimensionScores);

  return res.json({ yours, theirs, comparison });
});

export default router;
