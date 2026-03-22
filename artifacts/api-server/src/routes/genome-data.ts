// Belief Genome data routes — DNA, profile, history
// Mount at: app.use('/api/genome', genomeAuth, genomeDataRouter)

import { Router, Request, Response } from 'express';
import { db } from '@workspace/db';
import { users, beliefResponses, dimensionScores, dnaSnapshots } from '@workspace/db/schema';
import { eq, desc } from 'drizzle-orm';
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
  let totalResponses = 0;

  for (const s of scores) {
    const accum: Accumulator = { sum: s.weightedSum, totalWeight: s.totalWeight, count: s.count };
    const val = calcDimensionValue(accum);
    if (val !== null) {
      dimScores[s.dimensionId] = val;
      confidence[s.dimensionId] = calcConfidence(accum);
    }
    totalResponses += s.count;
  }

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
    if (pct <= 10) return 'False to me';
    if (pct <= 30) return 'Unlikely true';
    if (pct <= 45) return 'Leaning false';
    if (pct <= 55) return 'Uncertain';
    if (pct <= 70) return 'Leaning true';
    if (pct <= 88) return 'Likely true';
    return 'Deeply true to me';
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
  0–10   = "False to me"        (deep rejection)
  11–30  = "Unlikely true"      (skeptical lean)
  31–45  = "Leaning false"      (soft skepticism)
  46–55  = "Uncertain"          (genuine ambivalence)
  56–70  = "Leaning true"       (soft agreement)
  71–88  = "Likely true"        (confident agreement)
  89–100 = "Deeply true to me"  (deep conviction)

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

// ── POST /analyse — AI world view summary ───────────────────
router.post('/analyse', async (req: Request, res: Response) => {
  const { userId } = (req as any).genomeUser;
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return res.status(503).json({ error: 'AI not configured (no API key)' });

  const history = await db
    .select({ probeCategory: beliefResponses.probeCategory, value: beliefResponses.value })
    .from(beliefResponses)
    .where(eq(beliefResponses.userId, userId))
    .orderBy(desc(beliefResponses.createdAt))
    .limit(200);

  if (history.length < 5) {
    return res.status(400).json({ error: 'Need at least 5 responses for analysis.' });
  }

  const CAT_SHORT: Record<string,string> = {
    philosophy:'Philosophy', religion:'Religion', psychology:'Psychology',
    relationships:'Relationships', society:'Society', economics:'Economics',
    science_tech:'Sci & Tech', politics:'Politics', life:'Life',
  };

  const buckets: Record<string, number[]> = {};
  for (const h of history) {
    const cat = h.probeCategory || 'life';
    if (!buckets[cat]) buckets[cat] = [];
    buckets[cat].push(h.value);
  }

  const summary = Object.entries(buckets).map(([cat, vals]) => {
    const avg = vals.reduce((s, v) => s + v, 0) / vals.length;
    const pct = Math.round(avg * 100);
    const lbl = pct >= 70 ? 'strongly agrees' : pct >= 55 ? 'leans true' : pct <= 30 ? 'strongly disagrees' : pct <= 45 ? 'leans false' : 'is neutral';
    return `${CAT_SHORT[cat] || cat}: ${lbl} (${pct}%, ${vals.length} responses)`;
  }).join('; ');

  try {
    const aiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        max_tokens: 400,
        messages: [{
          role: 'user',
          content: `Based on these belief response averages across categories, write a 3-sentence world view portrait for this person. Be specific, insightful, and a little philosophical. Avoid generic observations.\n\n${summary}`,
        }],
      }),
    });
    const aiData = await aiRes.json();
    const analysis = aiData.choices?.[0]?.message?.content || 'Could not generate analysis.';
    return res.json({ analysis });
  } catch (e: any) {
    return res.status(500).json({ error: 'Analysis failed: ' + e.message });
  }
});

export default router;
