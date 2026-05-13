// Belief Genome data routes — DNA, profile, history
// Mount at: app.use('/api/genome', genomeAuth, genomeDataRouter)

import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import { db } from '@workspace/db';
import { users, beliefResponses, dimensionScores, dnaSnapshots, genomeSubmissions, genomeAnalyses, beliefLineage } from '@workspace/db/schema';
import { eq, and, gte, desc, sql } from 'drizzle-orm';
import { DIMENSIONS, CATEGORIES } from '@belief-genome/engine';
import {
  buildDNAString, calcDimensionValue, calcConfidence,
  applyResponseToScores,
  // calcCoherence (std-based) is intentionally NOT imported here — it is
  // retained in the engine as an internal QC metric ("answer scatter") but
  // is no longer published as the user-facing coherence letter. The web app
  // mints A–E coherence the same way the desktop / Frontiers paper does:
  // phase residual within framing pairs (V2 probe metadata).
  buildCoherenceMap, calcPhaseEstimates, gradeCoherence,
} from '@belief-genome/engine';
import type { Accumulator, ProbeV2Meta } from '@belief-genome/engine';
import { loadPairCounts, nextPairPosition } from '../lib/pair-position';

const router = Router();

// ── GET /dna — compute and return DNA string ────────────────
router.get('/dna', async (req: Request, res: Response) => {
  const { userId } = (req as any).genomeUser;

  // Get user profile for metadata
  const [user] = await db.select().from(users).where(eq(users.id, userId));
  if (!user) return res.status(404).json({ error: 'User not found' });

  // Get all dimension scores
  const scores = await db.select().from(dimensionScores).where(eq(dimensionScores.userId, userId));

  // Pull every response (with V2 metadata) so we can compute phase-residual
  // coherence per dimension. Coherence is no longer derived from `sumSquares`
  // (that is internal answer-scatter QC); the user-facing A–E letters come
  // from atan2 over framing-pair residuals. Dimensions that have no completed
  // pair yet are reported as '·' by buildCoherenceMap.
  // Deterministic ordering: same input order across runs → same first-seen
  // canonical+inverted pairing inside calcPhaseEstimates. Matters when a
  // user has answered the same probe more than once (allowed: unique
  // constraint is on (user_id, client_id), not on probe_text).
  const allResponses = await db
    .select({ value: beliefResponses.value, probeV2: beliefResponses.probeV2 })
    .from(beliefResponses)
    .where(eq(beliefResponses.userId, userId))
    .orderBy(beliefResponses.createdAt, beliefResponses.id);
  const coherence = buildCoherenceMap(
    allResponses.map(r => ({ value: r.value, probeV2: r.probeV2 as ProbeV2Meta | null })),
  );

  const dimScores: Record<number, number> = {};
  const confidence: Record<number, number> = {};

  for (const s of scores) {
    const accum: Accumulator = {
      sum: s.weightedSum,
      totalWeight: s.totalWeight,
      sumSquares: s.sumSquares,
      count: s.count,
    };
    const val = calcDimensionValue(accum);
    if (val !== null) {
      dimScores[s.dimensionId] = val;
      confidence[s.dimensionId] = calcConfidence(accum);
      // Ensure every scored dim has at least a '·' placeholder so the DNA
      // serial has a coherence char in every cell that has a value.
      if (!(s.dimensionId in coherence)) coherence[s.dimensionId] = null;
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
  }, coherence);

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

// ── GET /responses/count — total response count (uncapped) ──
//
// The `/history` endpoint hard-caps at 200 rows for performance, which made
// the Dashboard "Responses" stat plateau. This endpoint returns the real
// count via a single COUNT(*) so the stat reflects actual DB state.
router.get('/responses/count', async (req: Request, res: Response) => {
  const { userId } = (req as any).genomeUser;
  const [{ count } = { count: 0 }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(beliefResponses)
    .where(eq(beliefResponses.userId, userId));
  return res.json({ count });
});

// ── GET /responses — pull belief responses (desktop sync) ───
//
// Inverse of POST /responses/bulk-import. Lets a fresh BGP Desktop install
// rehydrate from the web DB ("Pull-from-Web sync"), and lets later runs do
// incremental pulls via the `since` cursor.
//
// Auth: Bearer token via the standard genomeAuth middleware (mounted on
// the parent router). Returns this user's rows only — never another user's.
//
// Query params:
//   limit  integer, default 2000, hard cap 5000
//   since  ISO-8601 timestamp; returns rows with createdAt >= since
//
// Ordering: (createdAt ASC, id ASC). ASC matters for two reasons —
//   1. Desktop's belief engine replays rows chronologically to rebuild
//      accumulators, so the natural order is what it wants.
//   2. The `since` cursor advances forward in time, so paginating large
//      datasets is just `since = lastReceived.createdAt`.
// The id tiebreaker keeps ordering deterministic when multiple rows share
// the same createdAt millisecond.
//
// Cursor semantics — note: spec said `> since` but we use `>= since`. With
// strict `>`, two rows sharing the exact same ms at a page boundary would be
// silently dropped on the next pull. `>=` re-emits the boundary row(s); the
// desktop's per-(user, client_id) merge dedup harmlessly skips them. This
// trades one duplicate row per incremental pull for zero data loss.
//
// client_id contract:
//   The desktop dedups merges on (user, client_id). Web-created rows have
//   NULL client_ids in the DB, so we synthesize a stable `web-<rowId>` key
//   for them — same value on every pull so repeated pulls never duplicate.
//   Desktop-imported rows already have a client_id and are passed through
//   unchanged, preserving round-trip idempotency through bulk-import.
//
// Response 200:
//   { responses: [
//       { client_id, probeText, probeCategory, probeSource,
//         value, confidence, note,
//         dimensionWeights, primaryDim, quality,
//         createdAt }, ...
//     ]
//   }
const PULL_DEFAULT = 2000;
const PULL_MAX = 5000;

router.get('/responses', async (req: Request, res: Response) => {
  const { userId } = (req as any).genomeUser;

  // limit: clamp to [1, PULL_MAX]; non-numeric → default.
  const limitRaw = parseInt(req.query.limit as string, 10);
  const limit = Number.isFinite(limitRaw) && limitRaw > 0
    ? Math.min(limitRaw, PULL_MAX)
    : PULL_DEFAULT;

  // since: optional. Bad input is a caller bug, surface it as 400 instead of
  // silently returning everything (which would mask client-side errors).
  let since: Date | null = null;
  if (req.query.since !== undefined && req.query.since !== '') {
    const d = new Date(String(req.query.since));
    if (isNaN(d.getTime())) {
      return res.status(400).json({ error: 'invalid_since', detail: 'expected ISO-8601 timestamp' });
    }
    since = d;
  }

  const whereClause = since
    ? and(eq(beliefResponses.userId, userId), gte(beliefResponses.createdAt, since))
    : eq(beliefResponses.userId, userId);

  const rows = await db
    .select({
      id:               beliefResponses.id,
      clientId:         beliefResponses.clientId,
      probeText:        beliefResponses.probeText,
      probeCategory:    beliefResponses.probeCategory,
      probeSource:      beliefResponses.probeSource,
      value:            beliefResponses.value,
      confidence:       beliefResponses.confidence,
      note:             beliefResponses.note,
      dimensionWeights: beliefResponses.dimensionWeights,
      primaryDim:       beliefResponses.primaryDim,
      quality:          beliefResponses.quality,
      // Frontiers schemaVersion 2: pair_position + skipped + probeV2 are part
      // of the cross-device contract. Desktop sync round-trips them so
      // QQ-equality stratification stays consistent across clients.
      probeV2:          beliefResponses.probeV2,
      pairPosition:     beliefResponses.pairPosition,
      skipped:          beliefResponses.skipped,
      createdAt:        beliefResponses.createdAt,
    })
    .from(beliefResponses)
    .where(whereClause)
    // (createdAt, id) — id tiebreaker keeps order deterministic when
    // multiple rows share the same millisecond.
    .orderBy(beliefResponses.createdAt, beliefResponses.id)
    .limit(limit);

  // Always normalise createdAt to ISO-8601 — the pg driver can return either
  // Date or string depending on column type/options, and the wire contract
  // promises ISO. Defensive: if the parse fails, drop back to the raw value
  // rather than emit `Invalid Date`.
  const toIso = (v: unknown): string => {
    if (v instanceof Date) return v.toISOString();
    const d = new Date(v as string);
    return isNaN(d.getTime()) ? String(v) : d.toISOString();
  };

  const responses = rows.map(r => ({
    client_id:        r.clientId ?? `web-${r.id}`,
    probeText:        r.probeText,
    probeCategory:    r.probeCategory,
    probeSource:      r.probeSource,
    value:            r.value,
    confidence:       r.confidence,
    note:             r.note,
    dimensionWeights: r.dimensionWeights,
    primaryDim:       r.primaryDim,
    quality:          r.quality,
    probeV2:          r.probeV2,
    pair_position:    r.pairPosition,
    skipped:          r.skipped,
    createdAt:        toIso(r.createdAt),
  }));

  console.log(
    `[/responses] user=${userId} returned=${responses.length} ` +
    `since=${since ? since.toISOString() : 'null'} limit=${limit}`
  );

  return res.json({ responses });
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

// ── GET /lineage/:dimensionId — provenance for one dimension ─
//
// Returns every response that contributed to this dimension's score, with
// the score & confidence before/after each one. Sorted descending by absolute
// delta so the "biggest movers" are first; the client also gets the same
// list in chronological order for a timeline view.
router.get('/lineage/:dimensionId', async (req: Request, res: Response) => {
  const { userId } = (req as any).genomeUser;
  const dimensionId = parseInt(req.params.dimensionId, 10);
  if (!Number.isFinite(dimensionId)) {
    return res.status(400).json({ error: 'invalid_dimension_id' });
  }

  // Current score/confidence for header context.
  const [scoreRow] = await db
    .select()
    .from(dimensionScores)
    .where(and(eq(dimensionScores.userId, userId), eq(dimensionScores.dimensionId, dimensionId)));
  const currentAcc: Accumulator | null = scoreRow
    ? {
        sum: scoreRow.weightedSum,
        totalWeight: scoreRow.totalWeight,
        sumSquares: scoreRow.sumSquares,
        count: scoreRow.count,
      }
    : null;
  const currentScore = calcDimensionValue(currentAcc);
  const currentConfidence = calcConfidence(currentAcc);

  const dim = DIMENSIONS.find(d => d.id === dimensionId);
  // CATEGORIES is a Record<string, Category> keyed by category id, not an
  // array — use direct property access, not .find().
  const cat = dim ? CATEGORIES[dim.cat] ?? null : null;

  // Join lineage with the originating response so the client can show the
  // probe text and the user's raw answer alongside each impact.
  const rows = await db
    .select({
      id: beliefLineage.id,
      responseId: beliefLineage.responseId,
      scoreBefore: beliefLineage.scoreBefore,
      scoreAfter: beliefLineage.scoreAfter,
      delta: beliefLineage.delta,
      confidenceBefore: beliefLineage.confidenceBefore,
      confidenceAfter: beliefLineage.confidenceAfter,
      createdAt: beliefLineage.createdAt,
      probeText: beliefResponses.probeText,
      probeCategory: beliefResponses.probeCategory,
      probeSource: beliefResponses.probeSource,
      value: beliefResponses.value,
      note: beliefResponses.note,
    })
    .from(beliefLineage)
    .innerJoin(beliefResponses, eq(beliefLineage.responseId, beliefResponses.id))
    .where(and(
      eq(beliefLineage.userId, userId),
      eq(beliefLineage.dimensionId, dimensionId),
    ))
    .orderBy(beliefLineage.createdAt);

  // Top contributors = sorted by absolute delta (the magnitude of the push,
  // signed direction preserved on each row).
  const top = [...rows]
    .sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta))
    .slice(0, 10);

  return res.json({
    dimensionId,
    dimension: dim ? { id: dim.id, name: dim.name, short: dim.short, desc: dim.desc, cat: dim.cat, catLabel: cat?.label ?? null } : null,
    currentScore,
    currentConfidence,
    totalContributors: rows.length,
    top,
    timeline: rows,
  });
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
      const accum: Accumulator = {
        sum: s.weightedSum,
        totalWeight: s.totalWeight,
        sumSquares: s.sumSquares,
        count: s.count,
      };
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

  // Get all responses (now also reading `quality` so the canonical engine
  // path can apply the quality-weight multiplier — keeps /analyze in sync
  // with live ingest math and desktop parity). Deterministic ordering
  // on (createdAt, id) is required: floating-point accumulation is
  // order-sensitive, and without an explicit ORDER BY the result would
  // depend on the planner's row order — could produce sub-epsilon drift
  // between runs and break bit-identical parity guarantees.
  const responses = await db
    .select({
      probeCategory: beliefResponses.probeCategory,
      value: beliefResponses.value,
      dimensionWeights: beliefResponses.dimensionWeights,
      quality: beliefResponses.quality,
      probeV2: beliefResponses.probeV2,
    })
    .from(beliefResponses)
    .where(eq(beliefResponses.userId, userId))
    .orderBy(beliefResponses.createdAt, beliefResponses.id);

  if (responses.length === 0) {
    return res.json({ totalResponses: 0, dimensionsCovered: 0, overallConfidence: 0, dnaString: null });
  }

  // Rebuild all accumulators by replaying responses through the canonical
  // engine path. This guarantees the rebuilt scores are bit-identical to
  // what live ingest (genome-probes /respond) would have produced and to
  // what scripts/backfill-sum-squares.ts replays.
  let accumulators: Record<number, Accumulator> = {};
  for (const r of responses) {
    const weights = r.dimensionWeights as Record<string, { direction: number; weight: number }> | null;
    if (!weights) continue;
    const entry = {
      value: r.value,
      dimensionWeights: weights,
      quality: (r.quality as { weight?: number } | null) ?? undefined,
    };
    ({ next: accumulators } = applyResponseToScores(accumulators, entry));
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
        .set({ weightedSum: accum.sum, totalWeight: accum.totalWeight, sumSquares: accum.sumSquares, count: accum.count })
        .where(eq(dimensionScores.id, existing.id));
    } else {
      await db.insert(dimensionScores).values({
        userId, dimensionId: dimId,
        weightedSum: accum.sum, totalWeight: accum.totalWeight, sumSquares: accum.sumSquares, count: accum.count,
      });
    }
  }

  // Build DNA string
  const [user] = await db.select().from(users).where(eq(users.id, userId));
  const dimScores: Record<number, number> = {};
  const confidence: Record<number, number> = {};

  // Phase-residual coherence over the full reply history (V2 metadata).
  const coherence = buildCoherenceMap(
    responses.map(r => ({ value: r.value, probeV2: r.probeV2 as ProbeV2Meta | null })),
  );

  for (const [dimIdStr, accum] of Object.entries(accumulators)) {
    const dimId = parseInt(dimIdStr);
    const val = calcDimensionValue(accum);
    if (val !== null) {
      dimScores[dimId] = val;
      confidence[dimId] = calcConfidence(accum);
      if (!(dimId in coherence)) coherence[dimId] = null;
    }
  }

  const dnaString = buildDNAString(dimScores, {
    birthYear: user?.birthYear ?? undefined,
    birthMonth: user?.birthMonth ?? undefined,
    birthDay: user?.birthDay ?? undefined,
    sex: user?.sex ?? '5',
    countryCode: user?.countryCode ?? undefined,
    zipCode: user?.zipCode ?? undefined,
  }, coherence);

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
//
// Accounting contract: returns { received, merged, deduped, rejected: [...] }.
// Each rejected entry has a `reason` so the client can stop showing falsely-
// green "0 PENDING". A single bad row never kills the batch — every row is
// validated and inserted independently with its own try/catch.
//
// Dedup key normalises createdAt to an ISO string on both sides so it
// actually matches across the wire.
type SyncReject = { idx: number; reason: string; probeText?: string };

function dedupKey(probeText: string, value: number, createdAt: unknown): string {
  let iso: string;
  if (createdAt instanceof Date) iso = createdAt.toISOString();
  else if (typeof createdAt === 'string') {
    const d = new Date(createdAt);
    iso = isNaN(d.getTime()) ? createdAt : d.toISOString();
  } else iso = String(createdAt);
  return `${probeText}|${value}|${iso}`;
}

router.post('/sync', async (req: Request, res: Response) => {
  const { userId } = (req as any).genomeUser;
  const { responses: incoming } = req.body;

  if (!Array.isArray(incoming)) {
    console.log(`[/sync] user=${userId} body.responses is not an array — rejecting whole request`);
    return res.json({ received: 0, merged: 0, deduped: 0, rejected: [{ idx: -1, reason: 'body_not_array' }] });
  }

  const received = incoming.length;

  // Existing rows for dedup
  const existing = await db.select({
    probeText: beliefResponses.probeText,
    value: beliefResponses.value,
    createdAt: beliefResponses.createdAt,
  }).from(beliefResponses).where(eq(beliefResponses.userId, userId));

  const existingKeys = new Set(
    existing.map(r => dedupKey(r.probeText, r.value, r.createdAt))
  );

  let merged = 0;
  let deduped = 0;
  const rejected: SyncReject[] = [];

  // Frontiers schemaVersion 2: pre-fetch the user's existing pair-id counts
  // ONCE so we can stamp pair_position per row without an N-query loop.
  const pairCounts = await loadPairCounts(userId);

  for (let idx = 0; idx < incoming.length; idx++) {
    const r = incoming[idx] as any;
    const probeText = r.probeText ?? r.probe_text;
    const probeCategory = r.probeCategory ?? r.probe_category ?? 'life';
    const probeSource = r.probeSource ?? r.probe_source ?? 'extension';
    const dimensionWeights = r.dimensionWeights ?? r.dimension_weights;
    const createdAt = r.createdAt ?? r.created_at;
    const probeV2 = r.probeV2 ?? r.probe_v2 ?? null;
    const isSkipped = r.skipped === true;

    // Frontiers schemaVersion 2: skipped rows carry value=null. Substantive
    // rows still require a finite value.
    let value: number | null;
    if (isSkipped) {
      value = null;
    } else {
      const v = typeof r.value === 'number' ? r.value : Number(r.value);
      if (!Number.isFinite(v)) {
        rejected.push({ idx, reason: 'invalid_value', probeText });
        continue;
      }
      value = v;
    }

    // Validate
    if (!probeText || typeof probeText !== 'string') {
      rejected.push({ idx, reason: 'missing_probeText' });
      continue;
    }
    if (!dimensionWeights || typeof dimensionWeights !== 'object') {
      rejected.push({ idx, reason: 'missing_dimensionWeights', probeText });
      continue;
    }

    // Dedup
    const key = dedupKey(probeText, value, createdAt);
    if (existingKeys.has(key)) {
      deduped++;
      continue;
    }

    const pairPosition = nextPairPosition(pairCounts, probeV2?.pair_id, { userId });

    // Insert (per-row try/catch so one bad row never kills the batch)
    try {
      await db.insert(beliefResponses).values({
        userId,
        probeText,
        probeCategory,
        probeSource,
        value,
        confidence: r.confidence ?? 50,
        dimensionWeights,
        probeV2,
        pairPosition,
        skipped: isSkipped,
      });
      existingKeys.add(key);
      merged++;
    } catch (e: any) {
      rejected.push({ idx, reason: `db_error:${e?.code || e?.message || 'unknown'}`, probeText });
    }
  }

  // Summary log + sample of rejection reasons
  const reasonCounts: Record<string, number> = {};
  for (const r of rejected) reasonCounts[r.reason] = (reasonCounts[r.reason] || 0) + 1;
  const reasonsStr = Object.entries(reasonCounts).map(([k, v]) => `${k}=${v}`).join(' ') || 'none';
  console.log(
    `[/sync] user=${userId} received=${received} merged=${merged} deduped=${deduped} ` +
    `rejected=${rejected.length} (${reasonsStr})`
  );
  if (rejected.length > 0) {
    console.log(`[/sync] user=${userId} first rejects:`, JSON.stringify(rejected.slice(0, 20)));
  }

  return res.json({ received, merged, deduped, rejected });
});

// ── POST /responses/bulk-import — desktop bulk push ─────────
//
// Accepts up to 500 belief responses in a single request from the BGP
// Desktop app. Idempotent on (user_id, client_id) — re-sending the same
// chunk is safe and will report skipped counts instead of creating
// duplicates.
//
// Performance: validates and inserts in-memory, then applies dimension
// score deltas in ONE pass per affected dimension at the end (not per row).
//
// Request body:
//   {
//     responses: [
//       {
//         client_id:        string  REQUIRED  // stable uuid from desktop
//         created_at:       string  REQUIRED  // ISO-8601 timestamp
//         probe_id:         string|null
//         dimension_key:    string             // informational, not stored
//         value:            number             // accepts 0-1 OR 0-9 (Likert)
//         confidence:       number             // accepts 0-1 OR 0-100
//         dimensionWeights: { [dimId]: { weight, direction } }
//         source:           string             // e.g. "desktop"
//       },
//       ...
//     ]
//   }
//
// Response 200:
//   { ok, imported, skipped, errors: [{ index, reason }] }
const BULK_MAX = 500;

router.post('/responses/bulk-import', async (req: Request, res: Response) => {
  const { userId } = (req as any).genomeUser;
  const incoming = req.body?.responses;

  if (!Array.isArray(incoming)) {
    return res.status(400).json({ ok: false, error: 'responses must be an array' });
  }
  if (incoming.length > BULK_MAX) {
    return res.status(413).json({ ok: false, error: `batch too large: ${incoming.length} > ${BULK_MAX}` });
  }
  if (incoming.length === 0) {
    return res.json({ ok: true, imported: 0, skipped: 0, errors: [] });
  }

  // Pre-fetch existing client_ids for this user so we can dedup without
  // a per-row SELECT. The unique index on (user_id, client_id) also gives
  // us a hard-stop second line of defense at insert time.
  const existingRows = await db
    .select({ clientId: beliefResponses.clientId })
    .from(beliefResponses)
    .where(eq(beliefResponses.userId, userId));
  const seenClientIds = new Set<string>(
    existingRows.map(r => r.clientId).filter((x): x is string => !!x)
  );

  type ValidRow = {
    index: number;
    clientId: string;
    createdAt: Date;
    probeText: string;
    probeCategory: string;
    probeSource: string;
    value: number | null;       // normalized 0-1, or null for skipped rows
    confidence: number;          // 0-100
    dimensionWeights: Record<string, { weight: number; direction?: number }>;
    probeV2: ProbeV2Meta | null; // V2 framing-pair metadata
    pairPosition: 1 | 2 | null;  // which member of the pair landed first
    skipped: boolean;            // non-substantive non-response flag
  };

  const valid: ValidRow[] = [];
  const errors: Array<{ index: number; reason: string }> = [];
  let skipped = 0;

  // Frontiers schemaVersion 2: pre-load pair-id counts once for this user.
  const pairCounts = await loadPairCounts(userId);

  // Validate + dedup in-memory.
  for (let i = 0; i < incoming.length; i++) {
    const r = incoming[i] as any;

    const clientId = r.client_id ?? r.clientId;
    if (!clientId || typeof clientId !== 'string') {
      errors.push({ index: i, reason: 'missing_client_id' });
      continue;
    }
    if (seenClientIds.has(clientId)) {
      skipped++;
      continue;
    }

    const createdAtRaw = r.created_at ?? r.createdAt;
    if (!createdAtRaw) {
      errors.push({ index: i, reason: 'missing_created_at' });
      continue;
    }
    const createdAt = new Date(createdAtRaw);
    if (isNaN(createdAt.getTime())) {
      errors.push({ index: i, reason: 'invalid_created_at' });
      continue;
    }

    // Frontiers schemaVersion 2: skipped rows carry value=null and bypass
    // engine accumulation. Substantive rows still require a finite value.
    const isSkippedRow = r.skipped === true;
    let value: number | null;
    if (isSkippedRow) {
      value = null;
    } else {
      const rawValue = r.value;
      if (typeof rawValue !== 'number' || !Number.isFinite(rawValue)) {
        errors.push({ index: i, reason: 'invalid_value' });
        continue;
      }
      // Accept either 0-1 normalized or 0-9 Likert; store as 0-1.
      const v = rawValue > 1 ? rawValue / 9 : rawValue;
      if (v < 0 || v > 1) {
        errors.push({ index: i, reason: 'value_out_of_range' });
        continue;
      }
      value = v;
    }

    const dimensionWeights = r.dimensionWeights ?? r.dimension_weights;
    if (!dimensionWeights || typeof dimensionWeights !== 'object' || Object.keys(dimensionWeights).length === 0) {
      errors.push({ index: i, reason: 'missing_dimensionWeights' });
      continue;
    }

    // Confidence: accept 0-1 or 0-100, store 0-100.
    const rawConf = r.confidence;
    let confidence = 50;
    if (typeof rawConf === 'number' && Number.isFinite(rawConf)) {
      confidence = rawConf <= 1 ? Math.round(rawConf * 100) : Math.round(rawConf);
    }

    const probeText = r.probe_text ?? r.probeText ?? r.dimension_key ?? r.dimensionKey ?? `bulk:${clientId}`;
    const probeCategory = r.probe_category ?? r.probeCategory ?? 'life';
    const probeSource = r.source ?? r.probe_source ?? r.probeSource ?? 'desktop';
    const probeV2 = (r.probeV2 ?? r.probe_v2 ?? null) as ProbeV2Meta | null;
    const pairPosition = nextPairPosition(pairCounts, probeV2?.pair_id, { userId });

    valid.push({
      index: i,
      clientId,
      createdAt,
      probeText,
      probeCategory,
      probeSource,
      value,
      confidence,
      dimensionWeights,
      probeV2,
      pairPosition,
      skipped: isSkippedRow,
    });
    seenClientIds.add(clientId);
  }

  // Sort by createdAt ascending so the engine replay produces lineage rows
  // in the same chronological order they would have been written via the
  // single-response path. Identical createdAt is broken arbitrarily; ties do
  // not change the final accumulator state.
  valid.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

  let imported = 0;

  await db.transaction(async (tx) => {
    // Pre-fetch ALL existing dim_scores for this user once. The engine walk
    // below mutates an in-memory accumulator map so we never re-read mid-loop.
    const existingDimRows = await tx
      .select()
      .from(dimensionScores)
      .where(eq(dimensionScores.userId, userId));
    const existingDimMap = new Map<number, typeof existingDimRows[number]>();
    const accMap: Record<number, Accumulator> = {};
    for (const row of existingDimRows) {
      existingDimMap.set(row.dimensionId, row);
      accMap[row.dimensionId] = {
        sum: row.weightedSum,
        totalWeight: row.totalWeight,
        sumSquares: row.sumSquares,
        count: row.count,
      };
    }
    // Track which dim ids were touched so we know which to write back.
    const touchedDims = new Set<number>();
    const lineageInserts: Array<{
      userId: number;
      responseId: number;
      dimensionId: number;
      scoreBefore: number | null;
      scoreAfter: number;
      delta: number;
      confidenceBefore: number;
      confidenceAfter: number;
      createdAt: Date;
    }> = [];

    for (const v of valid) {
      try {
        // Bulk-import has no quality preset on the wire; use the historical
        // 0.7 weight so this stays bit-identical to the prior aggregation
        // behavior for the score table.
        const quality = { weight: 0.7 };
        const [inserted] = await tx.insert(beliefResponses).values({
          userId,
          clientId: v.clientId,
          probeText: v.probeText,
          probeCategory: v.probeCategory,
          probeSource: v.probeSource,
          dimensionWeights: v.dimensionWeights,
          value: v.value,
          confidence: v.confidence,
          quality,
          probeV2: v.probeV2,
          pairPosition: v.pairPosition,
          skipped: v.skipped,
          createdAt: v.createdAt, // preserve original answer time
        }).returning({ id: beliefResponses.id });
        imported++;

        // Skipped rows short-circuit inside applyResponseToScores: impacts
        // will be empty and accMap pass through unchanged. The row is still
        // persisted above so QQ analyses know the probe was administered.
        const { next, impacts } = applyResponseToScores(accMap, {
          value: v.value,
          dimensionWeights: v.dimensionWeights,
          quality,
          skipped: v.skipped,
        });
        // Mutate the running accumulator map for the next iteration.
        for (const dimIdStr of Object.keys(next)) {
          const dimId = parseInt(dimIdStr, 10);
          accMap[dimId] = next[dimId];
          touchedDims.add(dimId);
        }
        for (const i of impacts) {
          lineageInserts.push({
            userId,
            responseId: inserted.id,
            dimensionId: i.dimensionId,
            scoreBefore: i.scoreBefore,
            scoreAfter: i.scoreAfter,
            delta: i.delta,
            confidenceBefore: i.confidenceBefore,
            confidenceAfter: i.confidenceAfter,
            createdAt: v.createdAt,
          });
        }
      } catch (e: any) {
        // Most likely path here: unique index race (concurrent bulk-import).
        // Treat as skipped — caller asked for idempotent behavior.
        const code = e?.code || '';
        if (code === '23505') {
          skipped++;
        } else {
          errors.push({ index: v.index, reason: `db_error:${code || e?.message || 'unknown'}` });
        }
      }
    }

    // Write back final accumulator state — one upsert per touched dim.
    for (const dimId of touchedDims) {
      const acc = accMap[dimId];
      const existing = existingDimMap.get(dimId);
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

    // Bulk-insert lineage rows in chunks to keep parameter counts safe
    // (Postgres caps at 65535 params; 9 cols × ~7000 rows = 63k).
    const CHUNK = 1000;
    for (let i = 0; i < lineageInserts.length; i += CHUNK) {
      await tx.insert(beliefLineage).values(lineageInserts.slice(i, i + CHUNK));
    }
  });

  // Summary log + capped error sample.
  const reasonCounts: Record<string, number> = {};
  for (const e of errors) reasonCounts[e.reason] = (reasonCounts[e.reason] || 0) + 1;
  const reasonsStr = Object.entries(reasonCounts).map(([k, v]) => `${k}=${v}`).join(' ') || 'none';
  console.log(
    `[/responses/bulk-import] user=${userId} received=${incoming.length} ` +
    `imported=${imported} skipped=${skipped} errors=${errors.length} (${reasonsStr})`
  );
  if (errors.length > 0) {
    console.log(`[/responses/bulk-import] user=${userId} first errors:`, JSON.stringify(errors.slice(0, 20)));
  }

  return res.json({ ok: true, imported, skipped, errors });
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
      probeV2: beliefResponses.probeV2,
      createdAt: beliefResponses.createdAt,
    })
    .from(beliefResponses)
    .where(eq(beliefResponses.userId, userId))
    .orderBy(beliefResponses.createdAt, beliefResponses.id);

  const [user] = await db.select().from(users).where(eq(users.id, userId));

  if (responses.length === 0) {
    return res.json({
      bucket: 'week',
      from: null,
      to: null,
      dimensions: DIMENSIONS.map(d => ({ id: d.id, name: d.name, categoryKey: d.cat })),
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
  type Accum = { sum: number; totalWeight: number; sumSquares: number; count: number };
  const accum: Record<number, Accum> = {};
  const dimsByCategory: Record<string, number[]> = {};
  for (const d of DIMENSIONS) {
    if (!dimsByCategory[d.cat]) dimsByCategory[d.cat] = [];
    dimsByCategory[d.cat].push(d.id);
  }

  let respIdx = 0;
  let cumulative = 0;
  let lastBucketCumulative = 0;
  const buckets: any[] = [];

  // Running list of (value, probeV2) for phase-residual coherence — grows as
  // we consume responses, so each bucket snapshot reflects coherence as of
  // that boundary in time.
  const historyForCoherence: Array<{ value: number; probeV2: ProbeV2Meta | null }> = [];

  for (const boundary of boundaries) {
    let newInBucket = 0;
    while (respIdx < responses.length && (responses[respIdx].createdAt as Date).getTime() <= boundary) {
      const r = responses[respIdx];
      // Frontiers schemaVersion 2: skipped responses (value == null) are
      // preserved in storage but excluded from the timeline replay's
      // accumulator updates and from coherence history.
      if (r.value == null) {
        respIdx++;
        cumulative++;
        newInBucket++;
        continue;
      }
      const weights = (r.dimensionWeights as any) || {};
      const quality = (r.quality as any) || null;
      const qualityMult = quality?.weight ?? 0.7;
      const normalized = (r.value * 2) - 1;
      for (const [dimIdStr, w] of Object.entries(weights)) {
        const dimId = parseInt(dimIdStr, 10);
        const wt = w as { weight: number; direction?: number };
        if (!accum[dimId]) accum[dimId] = { sum: 0, totalWeight: 0, sumSquares: 0, count: 0 };
        const directed = normalized * (wt.direction ?? 1);
        const effectiveW = wt.weight * qualityMult;
        accum[dimId].sum += directed * effectiveW;
        accum[dimId].sumSquares += directed * directed * effectiveW;
        accum[dimId].totalWeight += effectiveW;
        accum[dimId].count += 1;
      }
      historyForCoherence.push({
        value: r.value as number,  // null filtered above (skipped rows)
        probeV2: (r.probeV2 as ProbeV2Meta | null) ?? null,
      });
      respIdx++;
      cumulative++;
      newInBucket++;
    }

    // Snapshot if anything has happened up to this point (skip empty leading buckets).
    if (cumulative === 0) {
      lastBucketCumulative = cumulative;
      continue;
    }

    // Phase-residual coherence as of this boundary.
    const phaseCoherence = buildCoherenceMap(historyForCoherence);

    const dimensionScores: Record<number, number | null> = {};
    const confidenceMap: Record<number, number> = {};
    const coherenceMap: Record<number, string | null> = {};
    let confSum = 0, confCount = 0;
    for (const [dimIdStr, a] of Object.entries(accum)) {
      const dimIdNum = parseInt(dimIdStr, 10);
      const v = calcDimensionValue(a as any);
      const c = calcConfidence(a as any);
      dimensionScores[dimIdNum] = v;
      if (v !== null) {
        confidenceMap[dimIdNum] = c;
        coherenceMap[dimIdNum] = phaseCoherence[dimIdNum] ?? null;
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
    }, coherenceMap);

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
    dimensions: DIMENSIONS.map(d => ({ id: d.id, name: d.name, categoryKey: d.cat })),
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
    const accum: Accumulator = {
      sum: s.weightedSum,
      totalWeight: s.totalWeight,
      sumSquares: s.sumSquares,
      count: s.count,
    };
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

    // Phase-residual coherence — fetch the V2-aware history and let
    // buildCoherenceMap derive the A–E letters that get baked into the
    // public signature. Deterministic ordering ensures the public serial
    // is bit-stable across re-mints when the user has duplicate answers
    // for the same probe.
    const allResponses = await db
      .select({ value: beliefResponses.value, probeV2: beliefResponses.probeV2 })
      .from(beliefResponses)
      .where(eq(beliefResponses.userId, userId))
      .orderBy(beliefResponses.createdAt, beliefResponses.id);
    const coherence = buildCoherenceMap(
      allResponses.map(r => ({ value: r.value, probeV2: r.probeV2 as ProbeV2Meta | null })),
    );

    const dimScores: Record<number, number> = {};
    for (const s of scores) {
      const accum: Accumulator = {
        sum: s.weightedSum,
        totalWeight: s.totalWeight,
        sumSquares: s.sumSquares,
        count: s.count,
      };
      const val = calcDimensionValue(accum);
      if (val !== null) {
        dimScores[s.dimensionId] = val;
        if (!(s.dimensionId in coherence)) coherence[s.dimensionId] = null;
      }
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
    }, coherence);

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

    // dnaString is V2: 16-char prefix + '-' + 248-char interleaved segment
    // ([amp][coh] per dim × 124). Walk amplitudes only here — coherence is
    // already stored separately on the dimension_scores rows.
    const beliefSegment = dnaString.slice(17);
    const beliefValues: Record<string, number | null> = {};
    let dimensionsExplored = 0;
    for (let j = 0; j < 124; j++) {
      const ch = beliefSegment[j * 2];
      const dimId = j + 4;
      if (ch === undefined || ch === '\u00B7' || ch === '.') {
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
