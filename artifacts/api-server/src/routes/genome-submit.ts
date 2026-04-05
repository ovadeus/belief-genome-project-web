import { Router, Request, Response } from 'express';
import { db } from '@workspace/db';
import { genomeSubmissions } from '@workspace/db/schema';
import { eq, sql, and, gte } from 'drizzle-orm';

const router = Router();

const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const RATE_LIMIT_MAX = 10;
const ipSubmitLog = new Map<string, number[]>();

function rateLimit(ip: string): boolean {
  const now = Date.now();
  const timestamps = (ipSubmitLog.get(ip) || []).filter(t => now - t < RATE_LIMIT_WINDOW_MS);
  if (timestamps.length >= RATE_LIMIT_MAX) return false;
  timestamps.push(now);
  ipSubmitLog.set(ip, timestamps);
  return true;
}

setInterval(() => {
  const now = Date.now();
  for (const [ip, timestamps] of ipSubmitLog.entries()) {
    const valid = timestamps.filter(t => now - t < RATE_LIMIT_WINDOW_MS);
    if (valid.length === 0) ipSubmitLog.delete(ip);
    else ipSubmitLog.set(ip, valid);
  }
}, 5 * 60 * 1000);

const VALID_GENDER_CODES = new Set(['0', '1', '2', '5', '9']);
const VALID_BELIEF_CHARS = new Set(['0','1','2','3','4','5','6','7','8','9','.']);

function validateDnaStructure(dna: string): string | null {
  if (dna.length < 16 || dna.length > 200) return 'dnaString must be between 16 and 200 characters';

  const century = dna[0];
  if (century !== '0' && century !== '1') return 'Invalid century digit (position 0)';

  const yearPart = dna.slice(1, 3);
  if (!/^\d{2}$/.test(yearPart)) return 'Invalid year digits (positions 1-2)';

  const monthPart = parseInt(dna.slice(3, 5));
  if (isNaN(monthPart) || monthPart < 1 || monthPart > 12) return 'Invalid month (positions 3-4)';

  const dayPart = parseInt(dna.slice(5, 7));
  if (isNaN(dayPart) || dayPart < 1 || dayPart > 31) return 'Invalid day (positions 5-6)';

  if (!VALID_GENDER_CODES.has(dna[7])) return 'Invalid gender code (position 7)';

  const countryCode = dna.slice(8, 11);
  if (!/^\d{3}$/.test(countryCode)) return 'Invalid country code (positions 8-10)';

  const zip = dna.slice(11, 16);
  if (!/^[\d]{5}$/.test(zip) && !/^[\dA-Z]{5}$/i.test(zip)) return 'Invalid zip code (positions 11-15)';

  for (let i = 16; i < dna.length; i++) {
    if (!VALID_BELIEF_CHARS.has(dna[i])) return `Invalid character '${dna[i]}' at position ${i}`;
  }

  return null;
}

function validateDnaPlausibility(dna: string): string | null {
  const century = parseInt(dna[0]);
  const yearInCentury = parseInt(dna.slice(1, 3));
  const birthYear = (century === 0 ? 1900 : 2000) + yearInCentury;
  const currentYear = new Date().getFullYear();

  if (birthYear < 1920 || birthYear > currentYear) return 'Implausible birth year';

  if (dna.length > 16) {
    const beliefSection = dna.slice(16);
    const allSame = beliefSection.split('').every(c => c === beliefSection[0]);
    if (allSame && beliefSection.length > 20) return 'Suspicious uniform belief pattern';

    const allZeros = beliefSection.split('').every(c => c === '0');
    const allNines = beliefSection.split('').every(c => c === '9');
    if (allZeros || allNines) return 'Suspicious extreme belief pattern';

    if (beliefSection.length >= 20) {
      const repeating = beliefSection.slice(0, 10);
      if (beliefSection.startsWith(repeating + repeating)) return 'Suspicious repeating belief pattern';
    }
  }

  return null;
}

function parseDnaString(dna: string) {
  const century = parseInt(dna[0]) || 0;
  const yearInCentury = parseInt(dna.slice(1, 3)) || 0;
  const birthYear = (century === 0 ? 1900 : 2000) + yearInCentury;
  const birthMonth = parseInt(dna.slice(3, 5)) || 0;
  const birthDay = parseInt(dna.slice(5, 7)) || 0;
  const genderCode = dna[7];
  const genderMap: Record<string, string> = { '0': 'F', '1': 'M', '2': 'Intersex', '5': 'PNS', '9': 'NB' };
  const gender = genderMap[genderCode] || 'PNS';
  const countryCode = dna.slice(8, 11);
  const zipCode = dna.slice(11, 16);

  const beliefValues: Record<string, number | null> = {};
  let dimensionsExplored = 0;
  for (let i = 16; i < 140 && i < dna.length; i++) {
    const char = dna[i];
    const dimIndex = i - 16;
    const dimId = dimIndex + 4;
    if (char === '.') {
      beliefValues[String(dimId)] = null;
    } else {
      const val = parseInt(char);
      if (!isNaN(val)) {
        beliefValues[String(dimId)] = val;
        dimensionsExplored++;
      } else {
        beliefValues[String(dimId)] = null;
      }
    }
  }

  return { century, birthYear, birthMonth, birthDay, gender, countryCode, zipCode, beliefValues, dimensionsExplored };
}

router.post('/submit', async (req: Request, res: Response) => {
  try {
    const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
    if (!rateLimit(clientIp)) {
      return res.status(429).json({ error: 'Too many submissions. Please try again later.' });
    }

    const { dnaString, demographicPrefix, anonymousKey } = req.body;

    if (!dnaString || typeof dnaString !== 'string') {
      return res.status(400).json({ error: 'dnaString is required' });
    }
    if (!anonymousKey || typeof anonymousKey !== 'string' || !/^[a-f0-9]{64}$/i.test(anonymousKey)) {
      return res.status(400).json({ error: 'anonymousKey must be a 64-character hex string' });
    }

    const structureError = validateDnaStructure(dnaString);
    if (structureError) {
      return res.status(400).json({ error: structureError });
    }

    const plausibilityError = validateDnaPlausibility(dnaString);
    if (plausibilityError) {
      return res.status(422).json({ error: plausibilityError, code: 'IMPLAUSIBLE_DATA' });
    }

    const parsed = parseDnaString(dnaString);

    const existing = await db.select({ id: genomeSubmissions.id })
      .from(genomeSubmissions)
      .where(eq(genomeSubmissions.anonymousKey, anonymousKey))
      .limit(1);

    if (existing.length > 0) {
      await db.update(genomeSubmissions)
        .set({
          dnaString,
          demographicPrefix: demographicPrefix || null,
          century: parsed.century,
          birthYear: parsed.birthYear,
          birthMonth: parsed.birthMonth,
          birthDay: parsed.birthDay,
          gender: parsed.gender,
          countryCode: parsed.countryCode,
          zipCode: parsed.zipCode,
          beliefValues: parsed.beliefValues,
          dimensionsExplored: parsed.dimensionsExplored,
          updatedAt: new Date(),
        })
        .where(eq(genomeSubmissions.anonymousKey, anonymousKey));

      return res.json({ status: 'updated', message: 'Genome submission updated successfully.' });
    } else {
      await db.insert(genomeSubmissions).values({
        anonymousKey,
        dnaString,
        demographicPrefix: demographicPrefix || null,
        century: parsed.century,
        birthYear: parsed.birthYear,
        birthMonth: parsed.birthMonth,
        birthDay: parsed.birthDay,
        gender: parsed.gender,
        countryCode: parsed.countryCode,
        zipCode: parsed.zipCode,
        beliefValues: parsed.beliefValues,
        dimensionsExplored: parsed.dimensionsExplored,
        isTestData: false,
      });

      return res.json({ status: 'created', message: 'Genome submission received. Thank you for contributing to the Belief Genome Project.' });
    }
  } catch (err: any) {
    console.error('Genome submit error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/stats', async (_req: Request, res: Response) => {
  try {
    const [totalResult] = await db.select({ count: sql<number>`count(*)::int` })
      .from(genomeSubmissions);
    const [countryResult] = await db.select({ count: sql<number>`count(distinct country_code)::int` })
      .from(genomeSubmissions);
    const [avgDims] = await db.select({ avg: sql<number>`round(avg(dimensions_explored))::int` })
      .from(genomeSubmissions);
    const [totalAll] = await db.select({ count: sql<number>`count(*)::int` }).from(genomeSubmissions);

    return res.json({
      totalSubmissions: totalResult?.count ?? 0,
      totalWithTest: totalAll?.count ?? 0,
      uniqueCountries: countryResult?.count ?? 0,
      avgDimensionsExplored: avgDims?.avg ?? 0,
    });
  } catch (err: any) {
    console.error('Genome stats error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

const PRIVACY_MINIMUM = 5;

router.get('/explore/dimensions', async (req: Request, res: Response) => {
  try {
    const { country, gender, generationStart, generationEnd } = req.query;

    let whereConditions: any[] = [];
    if (country && typeof country === 'string') {
      whereConditions.push(eq(genomeSubmissions.countryCode, country));
    }
    if (gender && typeof gender === 'string') {
      whereConditions.push(eq(genomeSubmissions.gender, gender));
    }
    if (generationStart && generationEnd) {
      whereConditions.push(gte(genomeSubmissions.birthYear, parseInt(generationStart as string)));
      whereConditions.push(sql`${genomeSubmissions.birthYear} <= ${parseInt(generationEnd as string)}`);
    }

    const whereClause = whereConditions.length > 0 ? and(...whereConditions) : undefined;

    const submissions = await db.select({
      beliefValues: genomeSubmissions.beliefValues,
    }).from(genomeSubmissions).where(whereClause);

    if (submissions.length < PRIVACY_MINIMUM) {
      return res.json({
        count: submissions.length,
        insufficientData: true,
        message: `At least ${PRIVACY_MINIMUM} submissions are required for aggregate data.`,
        dimensions: {},
      });
    }

    const dimSums: Record<string, { sum: number; count: number }> = {};
    for (const sub of submissions) {
      const values = sub.beliefValues as Record<string, number | null> | null;
      if (!values) continue;
      for (const [dimId, val] of Object.entries(values)) {
        if (val === null) continue;
        if (!dimSums[dimId]) dimSums[dimId] = { sum: 0, count: 0 };
        dimSums[dimId].sum += val;
        dimSums[dimId].count += 1;
      }
    }

    const dimensions: Record<string, { avg: number; count: number }> = {};
    for (const [dimId, { sum, count }] of Object.entries(dimSums)) {
      if (count >= PRIVACY_MINIMUM) {
        dimensions[dimId] = { avg: Math.round((sum / count) * 100) / 100, count };
      }
    }

    return res.json({ count: submissions.length, insufficientData: false, dimensions });
  } catch (err: any) {
    console.error('Explore dimensions error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/explore/countries', async (_req: Request, res: Response) => {
  try {
    const results = await db.select({
      countryCode: genomeSubmissions.countryCode,
      count: sql<number>`count(*)::int`,
    })
    .from(genomeSubmissions)
    .groupBy(genomeSubmissions.countryCode);

    const countries = results
      .filter(r => r.count >= PRIVACY_MINIMUM)
      .map(r => ({ countryCode: r.countryCode, count: r.count }));

    return res.json({ countries });
  } catch (err: any) {
    console.error('Explore countries error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/explore/generations', async (_req: Request, res: Response) => {
  try {
    const generations = [
      { label: 'Silent Generation', start: 1928, end: 1945 },
      { label: 'Baby Boomers', start: 1946, end: 1964 },
      { label: 'Generation X', start: 1965, end: 1980 },
      { label: 'Millennials', start: 1981, end: 1996 },
      { label: 'Generation Z', start: 1997, end: 2012 },
      { label: 'Generation Alpha', start: 2013, end: 2030 },
    ];

    const result = [];
    for (const gen of generations) {
      const conditions = [
        gte(genomeSubmissions.birthYear, gen.start),
        sql`${genomeSubmissions.birthYear} <= ${gen.end}`,
      ];

      const [countResult] = await db.select({ count: sql<number>`count(*)::int` })
        .from(genomeSubmissions)
        .where(and(...conditions));

      if ((countResult?.count ?? 0) >= PRIVACY_MINIMUM) {
        const submissions = await db.select({ beliefValues: genomeSubmissions.beliefValues })
          .from(genomeSubmissions)
          .where(and(...conditions));

        const dimSums: Record<string, { sum: number; count: number }> = {};
        for (const sub of submissions) {
          const values = sub.beliefValues as Record<string, number | null> | null;
          if (!values) continue;
          for (const [dimId, val] of Object.entries(values)) {
            if (val === null) continue;
            if (!dimSums[dimId]) dimSums[dimId] = { sum: 0, count: 0 };
            dimSums[dimId].sum += val;
            dimSums[dimId].count += 1;
          }
        }

        const avgBeliefs: Record<string, number> = {};
        for (const [dimId, { sum, count }] of Object.entries(dimSums)) {
          if (count >= PRIVACY_MINIMUM) {
            avgBeliefs[dimId] = Math.round((sum / count) * 100) / 100;
          }
        }

        result.push({ ...gen, count: countResult?.count ?? 0, avgBeliefs });
      }
    }

    return res.json({ generations: result });
  } catch (err: any) {
    console.error('Explore generations error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/explore/genders', async (_req: Request, res: Response) => {
  try {
    const results = await db.select({
      gender: genomeSubmissions.gender,
      count: sql<number>`count(*)::int`,
    })
    .from(genomeSubmissions)
    .groupBy(genomeSubmissions.gender);

    const genders = results
      .filter(r => r.count >= PRIVACY_MINIMUM)
      .map(r => ({ gender: r.gender, count: r.count }));

    return res.json({ genders });
  } catch (err: any) {
    console.error('Explore genders error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/lookup/:anonymousKey', async (req: Request, res: Response) => {
  try {
    const { anonymousKey } = req.params;
    if (!anonymousKey || anonymousKey.length < 16) {
      return res.status(400).json({ error: 'Invalid key' });
    }

    const [submission] = await db
      .select({
        dnaString: genomeSubmissions.dnaString,
        submittedAt: genomeSubmissions.submittedAt,
      })
      .from(genomeSubmissions)
      .where(eq(genomeSubmissions.anonymousKey, anonymousKey))
      .limit(1);

    if (!submission) {
      return res.status(404).json({ error: 'Genome not found' });
    }

    const beliefChars = (submission.dnaString || '').slice(16);
    let dimensionsCovered = 0;
    for (let i = 0; i < 124; i++) {
      const ch = beliefChars[i];
      if (ch && ch !== '·' && ch !== '.') dimensionsCovered++;
    }

    return res.json({
      dnaString: submission.dnaString,
      totalResponses: 0,
      dimensionsCovered,
      overallConfidence: dimensionsCovered > 0 ? Math.round((dimensionsCovered / 124) * 100) : 0,
      submittedAt: submission.submittedAt,
    });
  } catch (err: any) {
    console.error('Genome lookup error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
