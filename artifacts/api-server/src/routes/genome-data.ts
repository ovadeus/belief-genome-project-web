// Belief Genome data routes — DNA, profile, history
// Mount at: app.use('/api/genome', genomeAuth, genomeDataRouter)

import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import { db } from '@workspace/db';
import { users, beliefResponses, dimensionScores, dnaSnapshots, genomeSubmissions, genomeAnalyses } from '@workspace/db/schema';
import { eq, desc, sql } from 'drizzle-orm';
import { DIMENSIONS, CATEGORIES } from '@belief-genome/engine';
import { buildDNAString, calcDimensionValue, calcConfidence } from '@belief-genome/engine';
import type { Accumulator } from '@belief-genome/engine';

const router = Router();

// ── GET /dna — compute and return DNA string ────────────────
router.get('/dna', async (req: Request, res: Response) => {
  const { userId } = (req as any).genomeUser;

  // Get user profile for metadata
  const [user] = await db.select().from(users).where(eq(users.id, userId));
  if (!user) return res.status(404).json({ error: 'User not found' });

  // Get all dimension scores
  const scores = await db.select().from(dimensionScores).where(eq(dimensionScores.userId, userId));

  const dimScores: Record<number, number> = {};
  const confidence: Record<number, number> = {};

  for (const s of scores) {
    const accum: Accumulator = { sum: s.weightedSum, totalWeight: s.totalWeight, count: s.count };
    const val = calcDimensionValue(accum);
    if (val !== null) {
      dimScores[s.dimensionId] = val;
      confidence[s.dimensionId] = calcConfidence(accum);
    }
  }

  // True response count = number of probes the user actually answered
  const [{ count: totalResponses } = { count: 0 }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(beliefResponses)
    .where(eq(beliefResponses.userId, userId));

  const dnaString = buildDNAString(dimScores, {
    birthYear: user.birthYear ?? undefined,
    birthMonth: user.birthMonth ?? undefined,
    birthDay: user.birthDay ?? undefined,
    sex: user.sex ?? '5',
    countryCode: user.countryCode ?? undefined,
    zipCode: user.zipCode ?? undefined,
  });

  const confValues = Object.values(confidence);
  const overallConfidence = confValues.length
    ? Math.round(confValues.reduce((s, v) => s + v, 0) / confValues.length)
    : 0;

  return res.json({
    dnaString,
    dimensionScores: dimScores,
    confidence,
    totalResponses,
    dimensionsCovered: Object.keys(dimScores).length,
    overallConfidence,
  });
});

// ── GET /history — response history ─────────────────────────
router.get('/history', async (req: Request, res: Response) => {
  const { userId } = (req as any).genomeUser;
  const limit = Math.min(parseInt(req.query.limit as string) || 50, 200);

  const history = await db
    .select({
      id: beliefResponses.id,
      probeText: beliefResponses.probeText,
      probeCategory: beliefResponses.probeCategory,
      probeSource: beliefResponses.probeSource,
      value: beliefResponses.value,
      confidence: beliefResponses.confidence,
      note: beliefResponses.note,
      createdAt: beliefResponses.createdAt,
    })
    .from(beliefResponses)
    .where(eq(beliefResponses.userId, userId))
    .orderBy(desc(beliefResponses.createdAt))
    .limit(limit);

  return res.json(history);
});

// ── GET /profile — user profile ─────────────────────────────
router.get('/profile', async (req: Request, res: Response) => {
  const { userId } = (req as any).genomeUser;
  const [user] = await db.select({
    birthYear: users.birthYear,
    birthMonth: users.birthMonth,
    birthDay: users.birthDay,
    sex: users.sex,
    countryCode: users.countryCode,
    zipCode: users.zipCode,
  }).from(users).where(eq(users.id, userId));

  if (!user) return res.status(404).json({ error: 'User not found' });
  return res.json(user);
});

// ── PUT /profile — update profile ───────────────────────────
router.put('/profile', async (req: Request, res: Response) => {
  const { userId } = (req as any).genomeUser;
  const { name, birthYear, birthMonth, birthDay, sex, countryCode, zipCode } = req.body;

  // Validate country code — ISO 3166-1 numeric (3 digits)
  const cc = countryCode ? String(countryCode).replace(/[^0-9]/g, '').slice(0, 3).padStart(3, '0') : null;
  // Validate zip
  const zip = zipCode ? String(zipCode).replace(/[^A-Za-z0-9]/g, '').slice(0, 5) : null;

  const updateData: any = {
    birthYear: birthYear ? parseInt(birthYear) : null,
    birthMonth: birthMonth ? parseInt(birthMonth) : null,
    birthDay: birthDay ? parseInt(birthDay) : null,
    sex: sex || '5',
    countryCode: cc,
    zipCode: zip || '00000',
  };
  if (name && typeof name === 'string' && name.trim()) {
    updateData.name = name.trim();
  }

  await db.update(users).set(updateData).where(eq(users.id, userId));

  return res.json({ ok: true });
});

// ── GET /dimensions — dimension reference ───────────────────
router.get('/dimensions', (_req: Request, res: Response) => {
  return res.json({ dimensions: DIMENSIONS, categories: CATEGORIES });
});

// ── POST /snapshot — save DNA snapshot ──────────────────────
router.post('/snapshot', async (req: Request, res: Response) => {
  const { userId } = (req as any).genomeUser;
  const { dnaString } = req.body;
  if (!dnaString) return res.status(400).json({ error: 'dnaString required' });

  await db.insert(dnaSnapshots).values({ userId, dnaString });
  return res.json({ ok: true });
});

// ── POST /forecast — AI-powered belief forecaster ───────────
router.post('/forecast', async (req: Request, res: Response) => {
  const { userId } = (req as any).genomeUser;
  const { probeText } = req.body;
  if (!probeText) return res.status(400).json({ error: 'probeText required' });

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return res.status(503).json({ error: 'AI forecaster not configured (no API key)' });

  // Gather user data
  const history = await db
    .select({
      probeText: beliefResponses.probeText,
      probeCategory: beliefResponses.probeCategory,
      probeSource: beliefResponses.probeSource,
      value: beliefResponses.value,
      createdAt: beliefResponses.createdAt,
    })
    .from(beliefResponses)
    .where(eq(beliefResponses.userId, userId))
    .orderBy(desc(beliefResponses.createdAt))
    .limit(200);

  if (history.length < 5) {
    return res.status(400).json({ error: 'Need at least 5 responses before using the Forecaster.' });
  }

  // Category averages
  const CAT_ORDER = ['philosophy','religion','psychology','relationships','society','economics','science_tech','politics','life'];
  const CAT_SHORT: Record<string,string> = {
    philosophy:'Philosophy', religion:'Religion', psychology:'Psychology',
    relationships:'Relationships', society:'Society', economics:'Economics',
    science_tech:'Sci & Tech', politics:'Politics', life:'Life',
  };
  const DOMAIN_AXES: Record<string,{left:string;right:string;mid:string}> = {
    philosophy:{left:'Relativist',right:'Absolutist',mid:'Mixed epistemic'},
    religion:{left:'Secular',right:'Spiritual',mid:'Open spiritual'},
    psychology:{left:'Determinist',right:'Autonomous',mid:'Compatibilist'},
    relationships:{left:'Fluid',right:'Traditional',mid:'Contextual'},
    society:{left:'Collectivist',right:'Individualist',mid:'Balanced social'},
    economics:{left:'Progressive',right:'Market-oriented',mid:'Mixed economic'},
    science_tech:{left:'Tech-skeptic',right:'Techno-optimist',mid:'Tech-pragmatist'},
    politics:{left:'Progressive',right:'Conservative',mid:'Centrist'},
    life:{left:'Structured',right:'Spontaneous',mid:'Balanced'},
  };

  const buckets: Record<string, number[]> = {};
  for (const h of history) {
    const cat = h.probeCategory || 'life';
    if (!buckets[cat]) buckets[cat] = [];
    buckets[cat].push(h.value);
  }
  const categorySummary = CAT_ORDER
    .filter(c => buckets[c]?.length)
    .map(c => {
      const avg = buckets[c].reduce((s,v) => s+v, 0) / buckets[c].length;
      const pct = Math.round(avg * 100);
      const axis = DOMAIN_AXES[c];
      const pos = axis
        ? (pct >= 70 ? `strongly ${axis.right}` : pct >= 55 ? axis.right : pct <= 30 ? `strongly ${axis.left}` : pct <= 45 ? axis.left : axis.mid)
        : 'neutral';
      return `${CAT_SHORT[c]}: ${pos} (${pct}/100, n=${buckets[c].length})`;
    }).join('\n');

  // DNA dimension context
  const scores = await db.select().from(dimensionScores).where(eq(dimensionScores.userId, userId));
  let dnaContext = '';
  let totalDimensions = 0;
  if (scores.length) {
    const scored = scores.map(s => {
      const accum: Accumulator = { sum: s.weightedSum, totalWeight: s.totalWeight, count: s.count };
      const val = calcDimensionValue(accum);
      return val !== null ? { id: s.dimensionId, val } : null;
    }).filter(Boolean) as { id: number; val: number }[];
    totalDimensions = scored.length;
    const sorted = scored.sort((a, b) => b.val - a.val);
    const top5 = sorted.slice(0, 5).map(d => `dim-${d.id}:${d.val}/9`).join(', ');
    const bot5 = sorted.slice(-5).map(d => `dim-${d.id}:${d.val}/9`).join(', ');
    dnaContext = `Strongest dimensions: ${top5}\nWeakest dimensions: ${bot5}`;
  }

  // Recent history for context
  function beliefLabel(v: number): string {
    const pct = Math.round(v * 100);
    if (pct <= 11) return 'Absolute False';
    if (pct <= 22) return 'Deeply False';
    if (pct <= 33) return 'False';
    if (pct <= 44) return 'Leaning False';
    if (pct <= 55) return 'Uncertain';
    if (pct <= 66) return 'Leaning True';
    if (pct <= 77) return 'True';
    if (pct <= 88) return 'Deeply True';
    return 'Absolute True';
  }

  const recentHistory = history.slice(0, 40).map(h => {
    const pct = Math.round(h.value * 100);
    const lbl = beliefLabel(h.value);
    const cat = CAT_SHORT[h.probeCategory] || h.probeCategory || '?';
    return `[${cat}] "${(h.probeText || '').slice(0, 90)}" → ${lbl} (${pct}/100)`;
  }).join('\n');

  const prompt = `You are a precision belief analyst who knows this person intimately through ${history.length} probe responses collected over time.

THEIR BELIEF PROFILE
====================
Total responses: ${history.length}
Dimensions mapped: ${totalDimensions}

Category positions (0=fully false, 100=deeply true):
${categorySummary || '(no category data yet)'}

Belief genome:
${dnaContext || '(not yet calculated)'}

RECENT PROBE ANSWERS (most recent ${Math.min(history.length, 40)})
========================================================================
${recentHistory || '(no history yet)'}

NEW PROBE TO FORECAST
=====================
"${probeText}"

TASK
====
Based entirely on this person's established belief patterns — their category positions, dimension scores, historical probe answers, and belief drift — forecast exactly where they would place the slider for the new probe above.

The slider runs 0–100:
  0–11   = "Absolute False"     (deep rejection)
  12–22  = "Deeply False"       (strong rejection)
  23–33  = "False"              (clear disagreement)
  34–44  = "Leaning False"      (soft skepticism)
  45–55  = "Uncertain"          (genuine ambivalence)
  56–66  = "Leaning True"       (soft agreement)
  67–77  = "True"               (clear agreement)
  78–88  = "Deeply True"        (strong conviction)
  89–100 = "Absolute True"      (deep conviction)

Return ONLY valid JSON, nothing else:
{
  "value": <integer 0–100>,
  "label": "<exact zone label from the list above>",
  "confidence": <integer 1–5 where 1=speculative, 3=moderate, 5=high certainty>,
  "confidenceLabel": "<Speculative|Low|Moderate|High|Very High>",
  "reasoning": "<2–3 sentences explaining the prediction — reference specific patterns, categories, or probe answers from their history>",
  "keyFactors": ["<specific pattern 1>", "<specific pattern 2>", "<specific pattern 3>"]
}`;

  try {
    const aiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        max_tokens: 700,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    const aiData = await aiRes.json();
    const raw = (aiData.choices?.[0]?.message?.content || '').replace(/```(?:json)?/g, '').trim();
    const jsonStart = raw.indexOf('{');
    const jsonEnd = raw.lastIndexOf('}');
    if (jsonStart === -1 || jsonEnd === -1) throw new Error('AI returned unparseable response');

    const forecast = JSON.parse(raw.slice(jsonStart, jsonEnd + 1));

    return res.json({
      value: Math.max(0, Math.min(100, parseInt(forecast.value) || 50)),
      label: forecast.label || beliefLabel(parseInt(forecast.value || 50) / 100),
      confidence: Math.max(1, Math.min(5, parseInt(forecast.confidence) || 3)),
      confidenceLabel: forecast.confidenceLabel || 'Moderate',
      reasoning: forecast.reasoning || '',
      keyFactors: Array.isArray(forecast.keyFactors) ? forecast.keyFactors.slice(0, 3) : [],
    });
  } catch (e: any) {
    console.error('Forecaster error:', e);
    return res.status(500).json({ error: 'Forecast failed: ' + (e.message || 'Unknown error') });
  }
});

// ── POST /analyze — full DNA rebuild from all responses ─────
router.post('/analyze', async (req: Request, res: Response) => {
  const { userId } = (req as any).genomeUser;

  // Get all responses
  const responses = await db
    .select({
      probeCategory: beliefResponses.probeCategory,
      value: beliefResponses.value,
      dimensionWeights: beliefResponses.dimensionWeights,
    })
    .from(beliefResponses)
    .where(eq(beliefResponses.userId, userId));

  if (responses.length === 0) {
    return res.json({ totalResponses: 0, dimensionsCovered: 0, overallConfidence: 0, dnaString: null });
  }

  // Rebuild all accumulators from scratch
  const accumulators: Record<number, Accumulator> = {};

  for (const r of responses) {
    const weights = r.dimensionWeights as Record<string, { direction: number; weight: number }> | null;
    if (!weights) continue;

    for (const [dimIdStr, { direction, weight }] of Object.entries(weights)) {
      const dimId = parseInt(dimIdStr);
      if (isNaN(dimId)) continue;

      if (!accumulators[dimId]) {
        accumulators[dimId] = { sum: 0, totalWeight: 0, count: 0 };
      }

      const normalizedValue = (r.value - 0.5) * 2 * direction; // -1 to +1
      accumulators[dimId].sum += normalizedValue * weight;
      accumulators[dimId].totalWeight += weight;
      accumulators[dimId].count += 1;
    }
  }

  // Save rebuilt scores to database
  for (const [dimIdStr, accum] of Object.entries(accumulators)) {
    const dimId = parseInt(dimIdStr);

    // Upsert dimension score
    const existing = await db.select().from(dimensionScores)
      .where(eq(dimensionScores.userId, userId))
      .then(rows => rows.find(r => r.dimensionId === dimId));

    if (existing) {
      await db.update(dimensionScores)
        .set({ weightedSum: accum.sum, totalWeight: accum.totalWeight, count: accum.count })
        .where(eq(dimensionScores.id, existing.id));
    } else {
      await db.insert(dimensionScores).values({
        userId, dimensionId: dimId,
        weightedSum: accum.sum, totalWeight: accum.totalWeight, count: accum.count,
      });
    }
  }

  // Build DNA string
  const [user] = await db.select().from(users).where(eq(users.id, userId));
  const dimScores: Record<number, number> = {};
  const confidence: Record<number, number> = {};

  for (const [dimIdStr, accum] of Object.entries(accumulators)) {
    const dimId = parseInt(dimIdStr);
    const val = calcDimensionValue(accum);
    if (val !== null) {
      dimScores[dimId] = val;
      confidence[dimId] = calcConfidence(accum);
    }
  }

  const dnaString = buildDNAString(dimScores, {
    birthYear: user?.birthYear ?? undefined,
    birthMonth: user?.birthMonth ?? undefined,
    birthDay: user?.birthDay ?? undefined,
    sex: user?.sex ?? '5',
    countryCode: user?.countryCode ?? undefined,
    zipCode: user?.zipCode ?? undefined,
  });

  const confValues = Object.values(confidence);
  const overallConfidence = confValues.length
    ? Math.round(confValues.reduce((s, v) => s + v, 0) / confValues.length)
    : 0;

  return res.json({
    totalResponses: responses.length,
    dimensionsCovered: Object.keys(dimScores).length,
    overallConfidence,
    dnaString,
  });
});

// ── GET /sync/status — sync status overview ─────────────────
router.get('/sync/status', async (req: Request, res: Response) => {
  const { userId } = (req as any).genomeUser;

  const responses = await db
    .select({
      probeSource: beliefResponses.probeSource,
      createdAt: beliefResponses.createdAt,
    })
    .from(beliefResponses)
    .where(eq(beliefResponses.userId, userId));

  const sources = { extension: 0, web: 0, desktop: 0 };
  let lastSync: string | null = null;

  for (const r of responses) {
    const src = r.probeSource || 'web';
    if (src === 'extension') sources.extension++;
    else if (src === 'desktop') sources.desktop++;
    else sources.web++;

    if (src === 'extension' || src === 'desktop') {
      const ts = r.createdAt instanceof Date ? r.createdAt.toISOString() : String(r.createdAt);
      if (!lastSync || ts > lastSync) lastSync = ts;
    }
  }

  return res.json({
    totalResponses: responses.length,
    sources,
    lastSync,
  });
});

// ── POST /sync — merge external responses ───────────────────
router.post('/sync', async (req: Request, res: Response) => {
  const { userId } = (req as any).genomeUser;
  const { responses: incoming } = req.body;

  if (!Array.isArray(incoming)) {
    return res.json({ merged: 0 });
  }

  // Get existing to deduplicate
  const existing = await db.select({
    probeText: beliefResponses.probeText,
    value: beliefResponses.value,
    createdAt: beliefResponses.createdAt,
  }).from(beliefResponses).where(eq(beliefResponses.userId, userId));

  const existingKeys = new Set(
    existing.map(r => `${r.probeText}|${r.value}|${r.createdAt}`)
  );

  let merged = 0;
  for (const r of incoming) {
    const key = `${r.probeText || r.probe_text}|${r.value}|${r.createdAt || r.created_at}`;
    if (existingKeys.has(key)) continue;

    await db.insert(beliefResponses).values({
      userId,
      probeText: r.probeText || r.probe_text,
      probeCategory: r.probeCategory || r.probe_category || 'life',
      probeSource: r.probeSource || r.probe_source || 'extension',
      value: r.value,
      confidence: r.confidence || 2,
      dimensionWeights: r.dimensionWeights || null,
    });
    existingKeys.add(key);
    merged++;
  }

  return res.json({ merged });
});

// ── GET /timeline — belief evolution over time ──────────────
//
// Replays the user's belief_responses chronologically and snapshots
// the cumulative dimension state at each bucket boundary, so the
// client can render an evolution chart of how the user's DNA has
// shifted across days/weeks/months.
//
// Query params:
//   bucket: 'auto' | 'day' | 'week' | 'month'  (default: 'auto')
//   from:   ISO timestamp                       (default: earliest response)
//   to:     ISO timestamp                       (default: now)
//
// 'auto' picks: day if span < 60d, week if < 1y, else month — and is
// always capped to ~60 buckets to keep payload bounded.
router.get('/timeline', async (req: Request, res: Response) => {
  const { userId } = (req as any).genomeUser;
  const bucketParam = String(req.query.bucket || 'auto').toLowerCase();
  const fromQ = req.query.from ? new Date(String(req.query.from)) : null;
  const toQ = req.query.to ? new Date(String(req.query.to)) : null;

  // Pull every response in ascending order (we need full replay).
  const responses = await db
    .select({
      probeText: beliefResponses.probeText,
      probeCategory: beliefResponses.probeCategory,
      probeSource: beliefResponses.probeSource,
      dimensionWeights: beliefResponses.dimensionWeights,
      quality: beliefResponses.quality,
      value: beliefResponses.value,
      createdAt: beliefResponses.createdAt,
    })
    .from(beliefResponses)
    .where(eq(beliefResponses.userId, userId))
    .orderBy(beliefResponses.createdAt);

  const [user] = await db.select().from(users).where(eq(users.id, userId));

  if (responses.length === 0) {
    return res.json({
      bucket: 'week',
      from: null,
      to: null,
      dimensions: DIMENSIONS.map(d => ({ id: d.id, name: d.name, categoryKey: d.categoryKey })),
      buckets: [],
    });
  }

  const firstTs = (responses[0].createdAt as Date).getTime();
  const lastTs = (responses[responses.length - 1].createdAt as Date).getTime();
  const fromTs = fromQ ? fromQ.getTime() : firstTs;
  const toTs = toQ ? toQ.getTime() : Math.max(lastTs, Date.now());
  const spanMs = Math.max(toTs - fromTs, 1);
  const DAY = 86_400_000;

  // Determine bucket size in ms.
  let bucketSize: number;
  let bucketName: 'day' | 'week' | 'month';
  if (bucketParam === 'day') { bucketSize = DAY; bucketName = 'day'; }
  else if (bucketParam === 'week') { bucketSize = 7 * DAY; bucketName = 'week'; }
  else if (bucketParam === 'month') { bucketSize = 30 * DAY; bucketName = 'month'; }
  else {
    // auto
    if (spanMs < 60 * DAY) { bucketSize = DAY; bucketName = 'day'; }
    else if (spanMs < 365 * DAY) { bucketSize = 7 * DAY; bucketName = 'week'; }
    else { bucketSize = 30 * DAY; bucketName = 'month'; }
  }

  // Cap to ~60 buckets to keep payload bounded — bump bucket size if needed.
  const MAX_BUCKETS = 60;
  while (Math.ceil(spanMs / bucketSize) > MAX_BUCKETS) {
    bucketSize *= 2;
    if (bucketSize >= 30 * DAY) bucketName = 'month';
    else if (bucketSize >= 7 * DAY) bucketName = 'week';
  }

  // Build bucket boundary timestamps (inclusive end).
  const boundaries: number[] = [];
  for (let t = fromTs + bucketSize; t < toTs; t += bucketSize) boundaries.push(t);
  boundaries.push(toTs);

  // Replay responses, snapshotting at each boundary.
  type Accum = { sum: number; totalWeight: number; count: number };
  const accum: Record<number, Accum> = {};
  const dimsByCategory: Record<string, number[]> = {};
  for (const d of DIMENSIONS) {
    if (!dimsByCategory[d.categoryKey]) dimsByCategory[d.categoryKey] = [];
    dimsByCategory[d.categoryKey].push(d.id);
  }

  let respIdx = 0;
  let cumulative = 0;
  let lastBucketCumulative = 0;
  const buckets: any[] = [];

  for (const boundary of boundaries) {
    let newInBucket = 0;
    while (respIdx < responses.length && (responses[respIdx].createdAt as Date).getTime() <= boundary) {
      const r = responses[respIdx];
      const weights = (r.dimensionWeights as any) || {};
      const quality = (r.quality as any) || null;
      const qualityMult = quality?.weight ?? 0.7;
      const normalized = (r.value * 2) - 1;
      for (const [dimIdStr, w] of Object.entries(weights)) {
        const dimId = parseInt(dimIdStr, 10);
        const wt = w as { weight: number; direction?: number };
        if (!accum[dimId]) accum[dimId] = { sum: 0, totalWeight: 0, count: 0 };
        const directed = normalized * (wt.direction ?? 1);
        const effectiveW = wt.weight * qualityMult;
        accum[dimId].sum += directed * effectiveW;
        accum[dimId].totalWeight += effectiveW;
        accum[dimId].count += 1;
      }
      respIdx++;
      cumulative++;
      newInBucket++;
    }

    // Snapshot if anything has happened up to this point (skip empty leading buckets).
    if (cumulative === 0) {
      lastBucketCumulative = cumulative;
      continue;
    }

    const dimensionScores: Record<number, number | null> = {};
    const confidenceMap: Record<number, number> = {};
    let confSum = 0, confCount = 0;
    for (const [dimIdStr, a] of Object.entries(accum)) {
      const v = calcDimensionValue(a as any);
      const c = calcConfidence(a as any);
      dimensionScores[parseInt(dimIdStr, 10)] = v;
      if (v !== null) {
        confidenceMap[parseInt(dimIdStr, 10)] = c;
        confSum += c;
        confCount++;
      }
    }
    const overallConfidence = confCount > 0 ? Math.round(confSum / confCount) : 0;
    const dimensionsCovered = Object.values(dimensionScores).filter(v => v !== null).length;

    // Category averages — mean of non-null dimension scores within each category.
    const categoryAvgs: Record<string, number | null> = {};
    for (const [catKey, dimIds] of Object.entries(dimsByCategory)) {
      const vals = dimIds.map(id => dimensionScores[id]).filter((v): v is number => v !== null && v !== undefined);
      categoryAvgs[catKey] = vals.length ? +(vals.reduce((s, v) => s + v, 0) / vals.length).toFixed(2) : null;
    }

    // DNA string snapshot (uses user metadata for identity prefix; OK if same across buckets).
    const dnaCleaned: Record<number, number> = {};
    for (const [k, v] of Object.entries(dimensionScores)) {
      if (v !== null) dnaCleaned[parseInt(k, 10)] = v;
    }
    const dnaString = buildDNAString(dnaCleaned, {
      birthYear: user?.birthYear ?? undefined,
      birthMonth: user?.birthMonth ?? undefined,
      birthDay: user?.birthDay ?? undefined,
      sex: user?.sex ?? '5',
      countryCode: user?.countryCode ?? undefined,
      zipCode: user?.zipCode ?? undefined,
    });

    buckets.push({
      ts: new Date(boundary).toISOString(),
      totalResponses: cumulative,
      newResponsesInBucket: cumulative - lastBucketCumulative,
      dimensionsCovered,
      overallConfidence,
      dimensionScores,
      categoryAvgs,
      dnaString,
    });

    lastBucketCumulative = cumulative;
  }

  return res.json({
    bucket: bucketName,
    from: new Date(fromTs).toISOString(),
    to: new Date(toTs).toISOString(),
    dimensions: DIMENSIONS.map(d => ({ id: d.id, name: d.name, categoryKey: d.categoryKey })),
    buckets,
  });
});

// ── POST /analyse — AI world view portrait (Anthropic Claude) ─
const analyseRateLimit: Record<number, number> = {};

const CATEGORY_DIMENSIONS: Record<string, number[]> = {
  'Philosophy':      [4, 5, 6, 7, 8, 9, 10],
  'Religion':        [11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28],
  'Morality':        [29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41],
  'Life':            [42, 43],
  'Politics':        [44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63],
  'Family':          [64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78],
  'Economics':       [79, 80, 81, 82, 83, 84, 85, 86, 87, 88],
  'Science & Tech':  [89, 90, 91, 92, 93, 94, 95, 96, 97, 98],
  'Education':       [99, 100, 101, 102, 103, 104],
  'Health':          [105, 106, 107, 108],
  'Psychology':      [109, 110, 111, 112, 113, 114, 115, 116, 117, 118],
  'Relationships':   [119, 120, 121, 122, 123, 124, 125, 126, 127],
};

router.post('/analyse', async (req: Request, res: Response) => {
  const { userId } = (req as any).genomeUser;

  const now = Date.now();
  if (analyseRateLimit[userId] && now - analyseRateLimit[userId] < 60_000) {
    const wait = Math.ceil((60_000 - (now - analyseRateLimit[userId])) / 1000);
    return res.status(429).json({ error: `Rate limited — try again in ${wait}s` });
  }

  const { force } = req.body || {};

  if (!force) {
    const cached = await db.select().from(genomeAnalyses)
      .where(eq(genomeAnalyses.userId, userId))
      .orderBy(desc(genomeAnalyses.generatedAt))
      .limit(1);

    if (cached.length) {
      return res.json({
        status: 'ok',
        analysis: cached[0].analysisText,
        tags: cached[0].tags,
        generatedAt: cached[0].generatedAt,
        cached: true,
      });
    }
  }

  const scores = await db.select().from(dimensionScores).where(eq(dimensionScores.userId, userId));
  const dimScores: Record<number, number> = {};
  for (const s of scores) {
    const accum: Accumulator = { sum: s.weightedSum, totalWeight: s.totalWeight, count: s.count };
    const val = calcDimensionValue(accum);
    if (val !== null) dimScores[s.dimensionId] = val;
  }

  const scoredCount = Object.keys(dimScores).length;
  if (scoredCount < 5) {
    return res.status(422).json({ error: 'Not enough data to analyse — explore at least 5 dimensions first.' });
  }

  const summaryParts: string[] = [];
  for (const [catName, dimIds] of Object.entries(CATEGORY_DIMENSIONS)) {
    const vals: number[] = [];
    for (const dimId of dimIds) {
      const v = dimScores[dimId];
      if (v !== undefined && v !== 5) {
        vals.push(v);
      }
    }
    if (!vals.length) continue;
    const avg = vals.reduce((s, v) => s + v, 0) / vals.length;
    const pct = Math.round((avg / 9) * 100);
    const lbl = pct >= 70 ? 'strongly agrees' : pct >= 55 ? 'leans true' : pct <= 30 ? 'strongly disagrees' : pct <= 45 ? 'leans false' : 'is neutral';
    summaryParts.push(`${catName}: ${lbl} (${pct}%, ${vals.length} dimensions)`);
  }

  const summaryString = summaryParts.join('; ');

  const prompt = `Based on these belief response averages across categories, write a 3-sentence world view portrait for this person. Be specific, insightful, and a little philosophical. Avoid generic observations.

Data: ${summaryString}

Total dimensions scored: ${scoredCount}

End with 4-6 short descriptor tags (2-3 words each) that capture their world view, formatted as JSON at the end like: TAGS:["tag1","tag2","tag3"]`;

  try {
    const { anthropic } = await import('@workspace/integrations-anthropic-ai');
    const message = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 8192,
      messages: [{ role: 'user', content: prompt }],
    });

    const block = message.content[0];
    const rawText = block.type === 'text' ? block.text : '';

    let analysisText = rawText;
    let tags: string[] = [];

    const tagsMatch = rawText.match(/TAGS:\s*\[([^\]]+)\]/);
    if (tagsMatch) {
      analysisText = rawText.slice(0, rawText.indexOf('TAGS:')).trim();
      try {
        tags = JSON.parse(`[${tagsMatch[1]}]`);
      } catch {
        tags = tagsMatch[1].split(',').map(t => t.trim().replace(/^["']|["']$/g, ''));
      }
    }

    analyseRateLimit[userId] = Date.now();

    await db.insert(genomeAnalyses).values({
      userId,
      analysisText,
      tags,
    });

    return res.json({
      status: 'ok',
      analysis: analysisText,
      tags,
      generatedAt: new Date().toISOString(),
      cached: false,
    });
  } catch (e: any) {
    console.error('Analyse error:', e);
    return res.status(500).json({ error: 'Analysis failed: ' + (e.message || 'Unknown error') });
  }
});

const BGP_ANON_SALT = 'bgp-belief-genome-anonymous-v1';

function deriveAnonymousKey(email: string): string {
  return crypto.createHash('sha256').update(`${BGP_ANON_SALT}:${email.toLowerCase().trim()}`).digest('hex');
}

router.post('/submit-public', async (req: Request, res: Response) => {
  try {
    const { userId } = (req as any).genomeUser;

    const [user] = await db.select().from(users).where(eq(users.id, userId));
    if (!user) return res.status(404).json({ error: 'User not found' });

    const scores = await db.select().from(dimensionScores).where(eq(dimensionScores.userId, userId));

    const dimScores: Record<number, number> = {};
    for (const s of scores) {
      const accum: Accumulator = { sum: s.weightedSum, totalWeight: s.totalWeight, count: s.count };
      const val = calcDimensionValue(accum);
      if (val !== null) dimScores[s.dimensionId] = val;
    }

    if (Object.keys(dimScores).length < 5) {
      return res.status(400).json({
        error: 'Not enough data yet. Explore at least 5 belief dimensions before submitting.',
      });
    }

    const dnaString = buildDNAString(dimScores, {
      birthYear: user.birthYear ?? undefined,
      birthMonth: user.birthMonth ?? undefined,
      birthDay: user.birthDay ?? undefined,
      sex: user.sex ?? '5',
      countryCode: user.countryCode ?? undefined,
      zipCode: user.zipCode ?? undefined,
    });

    const anonymousKey = deriveAnonymousKey(user.email);

    const genderMap: Record<string, string> = { '0': 'F', '1': 'M', '2': 'Intersex', '5': 'PNS', '9': 'NB' };
    const century = dnaString[0] === '1' ? 1 : 0;
    const birthYear = user.birthYear || (century === 1 ? 2000 : 1900) + parseInt(dnaString.slice(1, 3));
    const birthMonth = parseInt(dnaString.slice(3, 5)) || 1;
    const birthDay = parseInt(dnaString.slice(5, 7)) || 1;
    const genderCode = dnaString[7];
    const gender = genderMap[genderCode] || 'PNS';
    const countryCode = dnaString.slice(8, 11);
    const zipCode = dnaString.slice(11, 16);

    const beliefs = dnaString.slice(16);
    const beliefValues: Record<string, number | null> = {};
    let dimensionsExplored = 0;
    for (let j = 0; j < beliefs.length && j < 124; j++) {
      const ch = beliefs[j];
      const dimId = j + 4;
      if (ch === '.') {
        beliefValues[String(dimId)] = null;
      } else {
        beliefValues[String(dimId)] = parseInt(ch);
        dimensionsExplored++;
      }
    }

    const demographicPrefix = `${century} century · ${dnaString.slice(1, 3)} year · ${dnaString.slice(3, 5)} month · ${dnaString.slice(5, 7)} day · ${genderCode} gender · ${countryCode} country · ${zipCode} zip`;

    const existing = await db.select({ id: genomeSubmissions.id })
      .from(genomeSubmissions)
      .where(eq(genomeSubmissions.anonymousKey, anonymousKey))
      .limit(1);

    if (existing.length > 0) {
      await db.update(genomeSubmissions)
        .set({
          dnaString,
          demographicPrefix,
          century, birthYear, birthMonth, birthDay,
          gender, countryCode, zipCode,
          beliefValues, dimensionsExplored,
          isTestData: false,
          updatedAt: new Date(),
        })
        .where(eq(genomeSubmissions.anonymousKey, anonymousKey));

      return res.json({ status: 'updated', message: 'Your genome has been updated in the public database.' });
    } else {
      await db.insert(genomeSubmissions).values({
        anonymousKey,
        dnaString,
        demographicPrefix,
        century, birthYear, birthMonth, birthDay,
        gender, countryCode, zipCode,
        beliefValues, dimensionsExplored,
        isTestData: false,
      });

      return res.json({ status: 'created', message: 'Your genome has been submitted to the public database. Thank you for contributing!' });
    }
  } catch (err: any) {
    console.error('Submit public error:', err);
    return res.status(500).json({ error: 'Failed to submit genome.' });
  }
});

router.get('/submit-public/status', async (req: Request, res: Response) => {
  try {
    const { userId } = (req as any).genomeUser;
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    if (!user) return res.status(404).json({ error: 'User not found' });

    const anonymousKey = deriveAnonymousKey(user.email);
    const existing = await db.select({
      id: genomeSubmissions.id,
      dimensionsExplored: genomeSubmissions.dimensionsExplored,
      updatedAt: genomeSubmissions.updatedAt,
    })
      .from(genomeSubmissions)
      .where(eq(genomeSubmissions.anonymousKey, anonymousKey))
      .limit(1);

    if (existing.length > 0) {
      return res.json({
        submitted: true,
        dimensionsExplored: existing[0].dimensionsExplored,
        lastUpdated: existing[0].updatedAt,
      });
    }
    return res.json({ submitted: false });
  } catch {
    return res.json({ submitted: false });
  }
});

export default router;
