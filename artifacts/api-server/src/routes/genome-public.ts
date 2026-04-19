import { Router, type IRouter } from 'express';
import rateLimit from 'express-rate-limit';
import crypto from 'crypto';
import { db, dnaShareEvents } from '@workspace/db';
import { decodeSignature, beliefSegmentToScores, parseDemographicPrefix, DIMENSIONS } from '@belief-genome/engine';
import { buildTheirSide, computeComparison } from '../services/compareService';

// Pre-compute the public dimensions payload once at module load. The
// dimension catalog is static, so we don't need a per-request DB lookup
// or auth check for share-page viewers.
const PUBLIC_DIMENSIONS = {
  dimensions: DIMENSIONS.map(d => ({ id: d.id, name: d.name, cat: d.cat })),
};

// --- Salted, non-reversible IP hashing ---------------------------------------
// We require an env-provided salt in production; in dev we fall back to a
// per-process random salt and log a single warning. Per-process means hashes
// are stable for the lifetime of the dev server but reset on restart — fine
// for local development analytics.
let SALT = process.env.IP_HASH_SALT;
if (!SALT) {
  SALT = crypto.randomBytes(32).toString('hex');
  // eslint-disable-next-line no-console
  console.warn('[genome-public] IP_HASH_SALT not set — using per-process random salt. Set IP_HASH_SALT in production for stable, non-reversible hashes.');
}
const FINAL_SALT: string = SALT;

function hashIp(ip: string | undefined): string | null {
  if (!ip) return null;
  return crypto.createHash('sha256').update(ip + FINAL_SALT).digest('hex').slice(0, 64);
}

// --- Rate limit: 30 requests / minute / IP -----------------------------------
const shareLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'rate_limited', retryAfter: 60 },
});

const router: IRouter = Router();

router.use(shareLimiter);

// GET /api/genome/dna/public/dimensions
// Public, unauthenticated dimension catalog for the share page renderer.
// Defined BEFORE the /:signature route so it isn't shadowed by the param.
router.get('/dimensions', (_req, res) => {
  res.json(PUBLIC_DIMENSIONS);
});

// GET /api/genome/dna/public/:signature
// Public, unauthenticated. Returns enough data to render the strip + a
// minimal demographic block for signed signatures only.
router.get('/:signature', async (req, res) => {
  const { signature } = req.params;
  const decoded = decodeSignature(signature);

  if (!decoded.valid) {
    // Generic 404 — never leak why decoding failed (would help URL tampering)
    return res.status(404).json({ error: 'not_found' });
  }

  // Validate that all decoded dim ids exist in our dimension catalog. Any
  // unknown id means the signature was minted against a different (likely
  // future) version of the engine; we reject rather than silently drop dims.
  const dimensionScores = beliefSegmentToScores(decoded.beliefSegment);
  const validDimIds = new Set(DIMENSIONS.map(d => d.id));
  for (const idStr of Object.keys(dimensionScores)) {
    const id = parseInt(idStr, 10);
    if (!validDimIds.has(id)) {
      return res.status(404).json({ error: 'not_found' });
    }
  }

  // Fire-and-forget analytics insert. Never block the response on it.
  const utm = {
    source: typeof req.query.utm_source === 'string' ? req.query.utm_source.slice(0, 64) : null,
    medium: typeof req.query.utm_medium === 'string' ? req.query.utm_medium.slice(0, 64) : null,
    campaign: typeof req.query.utm_campaign === 'string' ? req.query.utm_campaign.slice(0, 64) : null,
  };
  const ip = (req.headers['x-forwarded-for']?.toString().split(',')[0] || req.ip || '').trim();
  db.insert(dnaShareEvents).values({
    signature,
    kind: 'view',
    utmSource: utm.source,
    utmMedium: utm.medium,
    utmCampaign: utm.campaign,
    ipHash: hashIp(ip),
  }).catch((err: unknown) => {
    // eslint-disable-next-line no-console
    console.warn('[genome-public] analytics insert failed:', err);
  });

  // Build payload. Demographics are ONLY ever included for 'signed' format —
  // engine guarantees beliefSegment is identical in both cases.
  const payload: Record<string, unknown> = {
    format: decoded.format,
    dimensionScores,
    dimensionCount: Object.keys(dimensionScores).length,
  };

  if (decoded.format === 'signed' && decoded.fullDna) {
    payload.demographics = parseDemographicPrefix(decoded.fullDna);
  }

  return res.json(payload);
});

// GET /api/genome/dna/public/compare/:sigA/:sigB
// Public, unauthenticated two-side compare. Same rate limit + 404 semantics
// as the single-DNA route. Both sides decoded server-side; demographics
// included only for whichever side is 'signed'.
router.get('/compare/:sigA/:sigB', async (req, res) => {
  const { sigA, sigB } = req.params;

  let sideA, sideB;
  try {
    sideA = buildTheirSide(sigA);
    sideB = buildTheirSide(sigB);
  } catch {
    return res.status(404).json({ error: 'not_found' });
  }

  const validDimIds = new Set(DIMENSIONS.map(d => d.id));
  for (const ids of [Object.keys(sideA.dimensionScores), Object.keys(sideB.dimensionScores)]) {
    for (const idStr of ids) {
      if (!validDimIds.has(parseInt(idStr, 10))) {
        return res.status(404).json({ error: 'not_found' });
      }
    }
  }

  const utm = {
    source: typeof req.query.utm_source === 'string' ? req.query.utm_source.slice(0, 64) : null,
    medium: typeof req.query.utm_medium === 'string' ? req.query.utm_medium.slice(0, 64) : null,
    campaign: typeof req.query.utm_campaign === 'string' ? req.query.utm_campaign.slice(0, 64) : null,
  };
  const ip = (req.headers['x-forwarded-for']?.toString().split(',')[0] || req.ip || '').trim();
  db.insert(dnaShareEvents).values({
    signature: sigA,
    signatureB: sigB,
    kind: 'compare_view',
    utmSource: utm.source,
    utmMedium: utm.medium,
    utmCampaign: utm.campaign,
    ipHash: hashIp(ip),
  }).catch((err: unknown) => {
    // eslint-disable-next-line no-console
    console.warn('[genome-public] compare-view analytics insert failed:', err);
  });

  const comparison = computeComparison(sideA.dimensionScores, sideB.dimensionScores);
  return res.json({ sideA, sideB, comparison });
});

// POST /api/genome/dna/public/:signature/share-click
// Records that someone clicked a "share to X" button on the public page.
// Rate-limited via the same 30/min limiter.
router.post('/:signature/share-click', async (req, res) => {
  const { signature } = req.params;
  const decoded = decodeSignature(signature);
  if (!decoded.valid) return res.status(404).json({ error: 'not_found' });

  const ip = (req.headers['x-forwarded-for']?.toString().split(',')[0] || req.ip || '').trim();
  try {
    await db.insert(dnaShareEvents).values({
      signature,
      kind: 'share_click',
      ipHash: hashIp(ip),
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('[genome-public] share-click insert failed:', err);
  }
  return res.json({ ok: true });
});

export default router;
