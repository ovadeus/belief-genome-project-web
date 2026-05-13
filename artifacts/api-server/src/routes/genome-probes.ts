// Belief Genome probe delivery and response routes
// Mount at: app.use('/api/genome/probes', genomeAuth, genomeProbesRouter)

import { Router, Request, Response } from 'express';
import { db } from '@workspace/db';
import { probes, beliefResponses, dimensionScores, beliefLineage } from '@workspace/db/schema';
import { applyResponseToScores } from '@belief-genome/engine';
import type { Accumulator } from '@belief-genome/engine';
import { eq, and, sql, inArray } from 'drizzle-orm';
import { computePairPosition } from '../lib/pair-position';
import {
  PROBE_BANK, QUALITY_PRESETS, DIMENSIONS,
  buildDimensionWeights, assignProbeQuality,
  getProbeFromBank, pickCategory, getProbeForDimension,
} from '@belief-genome/engine';
import { fetchNewsProbes } from '@belief-genome/engine';
import {
  PROBE_BANK_V2, pickV2ProbeExcluding, extractProbeV2Meta,
  buildDimensionWeightsV2, getProbeV2ByText,
} from '@belief-genome/engine';
import type { ProbeV2Meta } from '@belief-genome/engine';

const router = Router();

// ── Queue management (inline — no separate probeQueue import needed) ──

const QUEUE_TARGETS = { bank: 40, news: 20 };
const REFILL_THRESHOLDS = { bank: 15, news: 6 };
const SOURCE_WEIGHTS = { bank: 40, news: 35 };

async function queueStats(userId: number) {
  const bankCount = await db
    .select({ count: sql<number>`count(*)` })
    .from(probes)
    .where(and(eq(probes.userId, userId), eq(probes.source, 'bank'), eq(probes.delivered, false)));
  const newsCount = await db
    .select({ count: sql<number>`count(*)` })
    .from(probes)
    .where(and(eq(probes.userId, userId), sql`${probes.source} LIKE 'news:%'`, eq(probes.delivered, false)));
  return {
    bank: Number(bankCount[0]?.count || 0),
    news: Number(newsCount[0]?.count || 0),
  };
}

// Refill the bank-queue from probeBankV2.json. Each queued row carries the
// V2 framing-pair metadata so phase-residual coherence can be recovered when
// the user answers. The legacy PROBE_BANK is no longer used for refill —
// only V2 probes give us the pair_id / orientation that coherence needs.
async function refillBank(userId: number) {
  const stats = await queueStats(userId);
  const count = QUEUE_TARGETS.bank - stats.bank;
  if (count <= 0) return 0;

  const usedResponses = await db
    .select({ text: beliefResponses.probeText })
    .from(beliefResponses)
    .where(eq(beliefResponses.userId, userId));
  const queuedProbes = await db
    .select({ text: probes.statement })
    .from(probes)
    .where(eq(probes.userId, userId));
  const excludeTexts = new Set<string>([
    ...usedResponses.map(r => r.text),
    ...queuedProbes.map(p => p.text),
  ]);

  let added = 0;
  for (let i = 0; i < count; i++) {
    const probe = pickV2ProbeExcluding(excludeTexts);
    if (!probe) break;  // user has burned through all 1488 V2 probes

    excludeTexts.add(probe.text);
    const dimWeights = buildDimensionWeightsV2(probe);
    const probeV2Meta = extractProbeV2Meta(probe);
    // V2 probes are rich-quality by construction; map their expected_loading
    // through a DIRECT-equivalent quality preset (they're hand-authored
    // single-claim statements, akin to QUALITY_PRESETS.DIRECT).
    const quality = {
      ...QUALITY_PRESETS.DIRECT,
      source: 'bank',
      assignedAt: new Date().toISOString(),
    };

    await db.insert(probes).values({
      userId,
      statement: probe.text,
      category: probe.category,
      source: 'bank',
      dimensionWeights: dimWeights,
      quality,
      probeV2: probeV2Meta,
    });
    added++;
  }
  return added;
}

async function refillNews(userId: number, force = false) {
  const stats = await queueStats(userId);
  if (!force && stats.news >= REFILL_THRESHOLDS.news) return 0;

  try {
    const newsProbes = await fetchNewsProbes();
    const queuedProbes = await db
      .select({ text: probes.statement })
      .from(probes)
      .where(eq(probes.userId, userId));
    const existingTexts = queuedProbes.map(p => p.text);

    let added = 0;
    for (const p of newsProbes) {
      if (!p.statement || existingTexts.includes(p.statement)) continue;
      const dimWeights = p.dims?.length
        ? buildDimensionWeights(p as any)
        : buildDimensionWeights(p.category || 'society');
      const quality = p.quality && QUALITY_PRESETS[p.quality]
        ? { ...QUALITY_PRESETS[p.quality], source: 'news', assignedAt: new Date().toISOString() }
        : assignProbeQuality('news');

      await db.insert(probes).values({
        userId, statement: p.statement, category: p.category || 'society',
        source: p.source || 'news:unknown', dimensionWeights: dimWeights, quality,
      });
      added++;
    }
    return added;
  } catch (e) {
    console.warn('News refill failed:', (e as Error).message);
    return 0;
  }
}

async function topUpQueues(userId: number) {
  const stats = await queueStats(userId);
  const jobs: Promise<number>[] = [];
  if (stats.bank < REFILL_THRESHOLDS.bank) jobs.push(refillBank(userId));
  if (stats.news < REFILL_THRESHOLDS.news) jobs.push(refillNews(userId));
  if (jobs.length > 0) await Promise.allSettled(jobs);
  return queueStats(userId);
}

// ── GET /next — dequeue next probe ──────────────────────────
router.get('/next', async (req: Request, res: Response) => {
  const { userId } = (req as any).genomeUser;
  const dimId = req.query.dimId ? parseInt(req.query.dimId as string, 10) : null;

  if (dimId && !isNaN(dimId)) {
    const usedResponses = await db
      .select({ text: beliefResponses.probeText })
      .from(beliefResponses)
      .where(eq(beliefResponses.userId, userId));
    const usedTexts = usedResponses.map(r => r.text);

    const result = getProbeForDimension(dimId, usedTexts);
    if (result) {
      const dimWeights = buildDimensionWeights(result.probe);
      const quality = result.probe.quality && QUALITY_PRESETS[result.probe.quality]
        ? { ...QUALITY_PRESETS[result.probe.quality], source: 'bank', assignedAt: new Date().toISOString() }
        : assignProbeQuality('bank');

      return res.json({
        id: null,
        statement: result.probe.text,
        category: result.category,
        source: 'bank:explore',
        targetDim: dimId,
        dimensionWeights: dimWeights,
        quality,
      });
    }
    const cat = pickCategory();
    const probe = getProbeFromBank(cat);
    const dimWeights = buildDimensionWeights(probe);
    const quality = probe.quality && QUALITY_PRESETS[probe.quality]
      ? { ...QUALITY_PRESETS[probe.quality], source: 'bank', assignedAt: new Date().toISOString() }
      : assignProbeQuality('bank');
    return res.json({
      id: null,
      statement: probe.text,
      category: cat,
      source: 'bank',
      targetDim: dimId,
      dimensionWeights: dimWeights,
      quality,
    });
  }

  // Top up queues in background on first call
  const stats = await queueStats(userId);
  if (stats.bank + stats.news < REFILL_THRESHOLDS.bank) {
    topUpQueues(userId).catch(e => console.warn('Queue top-up failed:', e));
  }

  const roll = Math.random() * 75;
  const preferBank = roll < SOURCE_WEIGHTS.bank;
  const sources = preferBank ? ['bank', 'news'] : ['news', 'bank'];

  for (const src of sources) {
    const sourceFilter = src === 'news'
      ? sql`${probes.source} LIKE 'news:%'`
      : eq(probes.source, src);

    const [probe] = await db
      .select()
      .from(probes)
      .where(and(eq(probes.userId, userId), sourceFilter, eq(probes.delivered, false)))
      .limit(1);

    if (probe) {
      await db.update(probes).set({ delivered: true, deliveredAt: new Date() }).where(eq(probes.id, probe.id));
      return res.json({
        id: probe.id,
        statement: probe.statement,
        category: probe.category,
        source: probe.source,
        dimensionWeights: probe.dimensionWeights,
        quality: probe.quality,
        // Pass V2 metadata to the client so it can echo it back on /respond
        // (the server also looks it up from the queue row as a fallback).
        probeV2: probe.probeV2 ?? null,
      });
    }
  }

  // Emergency: generate a bank probe on the fly — include weights + quality so /respond doesn't fall back to the broken legacy path
  const cat = pickCategory();
  const probe = getProbeFromBank(cat);
  const dimWeights = buildDimensionWeights(probe);
  const quality = probe.quality && QUALITY_PRESETS[probe.quality]
    ? { ...QUALITY_PRESETS[probe.quality], source: 'bank', assignedAt: new Date().toISOString() }
    : assignProbeQuality('bank');
  return res.json({
    id: null,
    statement: probe.text,
    category: cat,
    source: 'bank',
    dimensionWeights: dimWeights,
    quality,
  });
});

// ── POST /respond — submit probe response ───────────────────
router.post('/respond', async (req: Request, res: Response) => {
  const { userId } = (req as any).genomeUser;
  const {
    probeText, probeCategory, probeSource, value, confidence, note,
    dimensionWeights, quality,
    probeV2: clientProbeV2,
    skipped: clientSkipped,
  } = req.body;

  // Frontiers schemaVersion 2: skipped (non-substantive non-response) rows
  // persist with value=null and bypass engine accumulation entirely. Probe
  // text is still required so the row is meaningful for QQ analyses.
  const isSkipped = clientSkipped === true;
  if (!probeText) {
    return res.status(400).json({ error: 'probeText is required' });
  }
  if (!isSkipped && value === undefined) {
    return res.status(400).json({ error: 'value is required for substantive responses' });
  }

  // Resolve dimensionWeights AND probeV2 in one queue lookup.
  let dimWeights = dimensionWeights;
  let resolvedProbeV2: ProbeV2Meta | null = clientProbeV2 ?? null;
  if (
    !dimWeights || (typeof dimWeights === 'object' && Object.keys(dimWeights).length === 0)
    || resolvedProbeV2 == null
  ) {
    const [queued] = await db
      .select({ dimensionWeights: probes.dimensionWeights, probeV2: probes.probeV2 })
      .from(probes)
      .where(and(eq(probes.userId, userId), eq(probes.statement, probeText)))
      .limit(1);
    if (queued) {
      if (!dimWeights || (typeof dimWeights === 'object' && Object.keys(dimWeights).length === 0)) {
        if (queued.dimensionWeights && Object.keys(queued.dimensionWeights as object).length > 0) {
          dimWeights = queued.dimensionWeights;
        } else {
          return res.status(400).json({ error: 'dimensionWeights missing — refusing to save (would corrupt DNA scoring).' });
        }
      }
      if (resolvedProbeV2 == null && queued.probeV2) {
        resolvedProbeV2 = queued.probeV2 as ProbeV2Meta;
      }
    } else if (!dimWeights || (typeof dimWeights === 'object' && Object.keys(dimWeights).length === 0)) {
      return res.status(400).json({ error: 'dimensionWeights missing — refusing to save (would corrupt DNA scoring).' });
    }
  }
  // Last-resort: if we still don't have probeV2 but the text matches a V2
  // probe in the bank file, pull metadata from there. Covers ad-hoc clients.
  if (resolvedProbeV2 == null) {
    const v2 = getProbeV2ByText(probeText);
    if (v2) resolvedProbeV2 = extractProbeV2Meta(v2);
  }
  // Explore mode: if the client asked us to anchor this answer to a specific
  // dimension (the gray cell the user clicked), boost that dim's weight to 1.0
  // so it registers strongly against the targeted cell. Preserve direction.
  // Strict validation: must be a real number (not a coerced empty string),
  // must be a positive integer, and must be a known dimension id.
  const rawTarget = req.body.exploreTargetDim;
  if (rawTarget !== undefined && rawTarget !== null && rawTarget !== '') {
    const isFiniteNum = typeof rawTarget === 'number' && Number.isFinite(rawTarget);
    const isCleanIntStr = typeof rawTarget === 'string' && /^\d+$/.test(rawTarget.trim());
    if (!isFiniteNum && !isCleanIntStr) {
      return res.status(400).json({ error: 'exploreTargetDim must be a positive integer dimension id.' });
    }
    const targetId = typeof rawTarget === 'number' ? rawTarget : parseInt(rawTarget, 10);
    if (!Number.isInteger(targetId) || !DIMENSIONS.some(d => d.id === targetId)) {
      return res.status(400).json({ error: `exploreTargetDim ${rawTarget} is not a valid dimension id.` });
    }
    const key = String(targetId);
    const existingDir = (dimWeights as any)[key]?.direction ?? 1;
    (dimWeights as any)[key] = { direction: existingDir, weight: 1.0 };
  }

  const qualityObj = quality || assignProbeQuality(probeSource || 'bank');

  // Normalize value (real column, accepts 0-1; if client sent 0-9 Likert, scale).
  // For skipped rows the column is NULL — the engine excludes them from
  // qubit reconstruction and lineage.
  let normValue: number | null;
  if (isSkipped) {
    normValue = null;
  } else {
    const rawVal = typeof value === 'number' ? value : parseFloat(value);
    if (!Number.isFinite(rawVal)) {
      return res.status(400).json({ error: 'value must be a finite number' });
    }
    normValue = rawVal > 1 ? rawVal / 9 : rawVal;
    if (normValue < 0 || normValue > 1) {
      return res.status(400).json({ error: 'value out of range (expected 0-1 or 0-9)' });
    }
  }

  // Normalize confidence — schema column is INTEGER 0-100.
  // Accept 0-1 (fraction) → x100, OR 0-100, OR small Likert (1-2). Clamp + round.
  let normConfidence = 50;
  if (confidence !== undefined && confidence !== null && confidence !== '') {
    const c = typeof confidence === 'number' ? confidence : parseFloat(confidence);
    if (Number.isFinite(c)) {
      const scaled = c <= 1 ? c * 100 : (c <= 10 ? c * 10 : c);
      normConfidence = Math.max(0, Math.min(100, Math.round(scaled)));
    }
  }

  try {
    // Single transaction so the response, the dim_score upserts, and the
    // lineage rows all commit together — lineage that doesn't match the final
    // score table is worse than no lineage at all.
    await db.transaction(async (tx) => {
      const dimIds = Object.keys(dimWeights as Record<string, unknown>)
        .map(s => parseInt(s, 10))
        .filter(n => Number.isFinite(n));

      // Pre-fetch existing accumulators for the dims this response touches.
      // Use inArray (compiles to `IN (...)` with proper int binding) — raw
      // `ANY($1)` confuses node-postgres because Drizzle's sql template does
      // not cast a JS array to int[] and pg rejects the parameter type.
      const existingRows = dimIds.length === 0 ? [] : await tx
        .select()
        .from(dimensionScores)
        .where(and(
          eq(dimensionScores.userId, userId),
          inArray(dimensionScores.dimensionId, dimIds),
        ));
      const existingMap = new Map<number, typeof existingRows[number]>();
      const prevAcc: Record<number, Accumulator> = {};
      for (const row of existingRows) {
        existingMap.set(row.dimensionId, row);
        prevAcc[row.dimensionId] = {
          sum: row.weightedSum,
          totalWeight: row.totalWeight,
          sumSquares: row.sumSquares,
          count: row.count,
        };
      }

      // Compute pair_position INSIDE the transaction so concurrent /respond
      // calls for the same pair don't race to "1 + 1".
      const pairId = resolvedProbeV2?.pair_id ?? null;
      const pairPosition = await computePairPosition(userId, pairId, tx);

      // Insert the response first so we have its id for lineage rows.
      const [inserted] = await tx.insert(beliefResponses).values({
        userId,
        probeText,
        probeCategory: probeCategory || 'life',
        probeSource: probeSource || 'bank',
        dimensionWeights: dimWeights,
        value: normValue,
        confidence: normConfidence,
        note: note || null,
        quality: qualityObj,
        probeV2: resolvedProbeV2,
        pairPosition,
        skipped: isSkipped,
      }).returning({ id: beliefResponses.id, createdAt: beliefResponses.createdAt });

      // Engine is the single source of truth — both ingest and the backfill
      // script call this same function so lineage and scores cannot drift.
      // Skipped rows short-circuit inside applyResponseToScores; impacts will
      // be empty and accumulators will pass through unchanged.
      const { next, impacts } = applyResponseToScores(prevAcc, {
        value: normValue,
        dimensionWeights: dimWeights as Record<string, { direction: number; weight: number }>,
        quality: qualityObj,
        skipped: isSkipped,
      });

      // Write back updated dim_scores from the engine's `next` accumulators.
      for (const dimIdStr of Object.keys(next)) {
        const dimId = parseInt(dimIdStr, 10);
        const acc = next[dimId];
        const existing = existingMap.get(dimId);
        if (existing) {
          await tx.update(dimensionScores).set({
            weightedSum: acc.sum,
            totalWeight: acc.totalWeight,
            sumSquares: acc.sumSquares,
            count: acc.count,
            lastUpdated: new Date(),
          }).where(eq(dimensionScores.id, existing.id));
        } else {
          await tx.insert(dimensionScores).values({
            userId,
            dimensionId: dimId,
            weightedSum: acc.sum,
            totalWeight: acc.totalWeight,
            sumSquares: acc.sumSquares,
            count: acc.count,
          });
        }
      }

      // Lineage rows — one per (response, dim) pair touched by this response.
      if (impacts.length > 0) {
        await tx.insert(beliefLineage).values(impacts.map(i => ({
          userId,
          responseId: inserted.id,
          dimensionId: i.dimensionId,
          scoreBefore: i.scoreBefore,
          scoreAfter: i.scoreAfter,
          delta: i.delta,
          confidenceBefore: i.confidenceBefore,
          confidenceAfter: i.confidenceAfter,
          createdAt: inserted.createdAt,
        })));
      }
    });
  } catch (e: any) {
    // Return JSON, never let Express's HTML error page reach the client.
    const code = e?.code || 'unknown';
    const message = e?.message || String(e);
    // Log the full message + stack to server so root cause is one log line away.
    console.error(`[/respond] user=${userId} db_error code=${code} msg=${message}`);
    if (e?.stack) console.error(e.stack);
    // In production, keep the client payload opaque — raw DB messages can leak
    // schema internals. Only echo details back in dev/test for easier debugging.
    const isProd = process.env.NODE_ENV === 'production';
    const body: Record<string, unknown> = { ok: false, error: 'db_error', code };
    if (!isProd) body.message = message.slice(0, 200);
    return res.status(500).json(body);
  }

  return res.json({ ok: true });
});

export default router;
