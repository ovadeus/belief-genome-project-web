// Belief Genome probe delivery and response routes
// Mount at: app.use('/api/genome/probes', genomeAuth, genomeProbesRouter)

import { Router, Request, Response } from 'express';
import { db } from '@workspace/db';
import { probes, beliefResponses, dimensionScores } from '@workspace/db';
import { eq, and, sql } from 'drizzle-orm';
import {
  PROBE_BANK, QUALITY_PRESETS,
  buildDimensionWeights, assignProbeQuality,
  getProbeFromBank, pickCategory,
} from '@belief-genome/engine';
import { fetchNewsProbes } from '@belief-genome/engine';

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
  const existingTexts = [...usedResponses.map(r => r.text), ...queuedProbes.map(p => p.text)];

  const cats = Object.keys(PROBE_BANK);
  let catIdx = 0;
  let added = 0;

  for (let i = 0; i < count; i++) {
    const cat = cats[catIdx % cats.length];
    catIdx++;
    const probe = getProbeFromBank(cat, existingTexts);
    if (!probe?.text || existingTexts.includes(probe.text)) continue;

    existingTexts.push(probe.text);
    const dimWeights = buildDimensionWeights(probe);
    const quality = probe.quality && QUALITY_PRESETS[probe.quality]
      ? { ...QUALITY_PRESETS[probe.quality], source: 'bank', assignedAt: new Date().toISOString() }
      : assignProbeQuality('bank');

    await db.insert(probes).values({
      userId, statement: probe.text, category: cat,
      source: 'bank', dimensionWeights: dimWeights, quality,
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
      });
    }
  }

  // Emergency: generate a bank probe on the fly
  const cat = pickCategory();
  const probe = getProbeFromBank(cat);
  return res.json({
    id: null,
    statement: probe.text,
    category: cat,
    source: 'bank',
  });
});

// ── POST /respond — submit probe response ───────────────────
router.post('/respond', async (req: Request, res: Response) => {
  const { userId } = (req as any).genomeUser;
  const { probeText, probeCategory, probeSource, value, confidence, note, dimensionWeights, quality } = req.body;

  if (!probeText || value === undefined) {
    return res.status(400).json({ error: 'probeText and value are required' });
  }

  // Save response
  const dimWeights = dimensionWeights || buildDimensionWeights(probeCategory || 'life');
  const qualityObj = quality || assignProbeQuality(probeSource || 'bank');

  await db.insert(beliefResponses).values({
    userId,
    probeText,
    probeCategory: probeCategory || 'life',
    probeSource: probeSource || 'bank',
    dimensionWeights: dimWeights,
    value: parseFloat(value),
    confidence: confidence || 50,
    note: note || null,
    quality: qualityObj,
  });

  // Update dimension scores incrementally
  for (const [dimIdStr, wt] of Object.entries(dimWeights as Record<string, { direction: number; weight: number }>)) {
    const dimId = parseInt(dimIdStr);
    const normalized = (parseFloat(value) * 2) - 1;
    const directed = normalized * (wt.direction || 1);
    const qualityMult = qualityObj.weight ?? 0.7;
    const effectiveW = wt.weight * qualityMult;

    // Upsert dimension score
    const [existing] = await db
      .select()
      .from(dimensionScores)
      .where(and(eq(dimensionScores.userId, userId), eq(dimensionScores.dimensionId, dimId)));

    if (existing) {
      await db.update(dimensionScores).set({
        weightedSum: existing.weightedSum + (directed * effectiveW),
        totalWeight: existing.totalWeight + effectiveW,
        count: existing.count + 1,
        lastUpdated: new Date(),
      }).where(eq(dimensionScores.id, existing.id));
    } else {
      await db.insert(dimensionScores).values({
        userId,
        dimensionId: dimId,
        weightedSum: directed * effectiveW,
        totalWeight: effectiveW,
        count: 1,
      });
    }
  }

  return res.json({ ok: true });
});

export default router;
