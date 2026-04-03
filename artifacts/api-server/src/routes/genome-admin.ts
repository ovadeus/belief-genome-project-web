import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import { db } from '@workspace/db';
import { genomeSubmissions } from '@workspace/db/schema';
import { eq, sql, and, or, ilike, desc } from 'drizzle-orm';

const router = Router();

router.get('/submissions', async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
    const offset = (page - 1) * limit;
    const search = req.query.search as string;
    const filter = req.query.filter as string;

    let conditions: any[] = [];

    if (filter === 'real') conditions.push(eq(genomeSubmissions.isTestData, false));
    if (filter === 'test') conditions.push(eq(genomeSubmissions.isTestData, true));

    if (search) {
      conditions.push(
        or(
          ilike(genomeSubmissions.anonymousKey, `%${search}%`),
          ilike(genomeSubmissions.countryCode, `%${search}%`),
          ilike(genomeSubmissions.zipCode, `%${search}%`),
          ilike(genomeSubmissions.gender, `%${search}%`),
        )
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [countResult] = await db.select({ count: sql<number>`count(*)::int` })
      .from(genomeSubmissions)
      .where(whereClause);

    const rows = await db.select({
      id: genomeSubmissions.id,
      anonymousKey: genomeSubmissions.anonymousKey,
      dnaString: genomeSubmissions.dnaString,
      gender: genomeSubmissions.gender,
      countryCode: genomeSubmissions.countryCode,
      zipCode: genomeSubmissions.zipCode,
      birthYear: genomeSubmissions.birthYear,
      dimensionsExplored: genomeSubmissions.dimensionsExplored,
      isTestData: genomeSubmissions.isTestData,
      submittedAt: genomeSubmissions.submittedAt,
    })
    .from(genomeSubmissions)
    .where(whereClause)
    .orderBy(desc(genomeSubmissions.submittedAt))
    .limit(limit)
    .offset(offset);

    return res.json({
      submissions: rows,
      total: countResult?.count ?? 0,
      page,
      limit,
    });
  } catch (err: any) {
    console.error('Admin submissions error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/submissions/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid ID' });

    await db.delete(genomeSubmissions).where(eq(genomeSubmissions.id, id));
    return res.json({ success: true });
  } catch (err: any) {
    console.error('Delete submission error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/purge-test', async (_req: Request, res: Response) => {
  try {
    const result = await db.delete(genomeSubmissions).where(eq(genomeSubmissions.isTestData, true));
    return res.json({ success: true, message: 'Test data purged' });
  } catch (err: any) {
    console.error('Purge test error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/export', async (req: Request, res: Response) => {
  try {
    const filter = req.query.filter as string;
    const search = req.query.search as string;
    let conditions: any[] = [];
    if (filter === 'real') conditions.push(eq(genomeSubmissions.isTestData, false));
    if (filter === 'test') conditions.push(eq(genomeSubmissions.isTestData, true));
    if (search) {
      conditions.push(
        or(
          ilike(genomeSubmissions.anonymousKey, `%${search}%`),
          ilike(genomeSubmissions.countryCode, `%${search}%`),
        )
      );
    }
    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const rows = await db.select().from(genomeSubmissions).where(whereClause).orderBy(desc(genomeSubmissions.submittedAt));

    const headers = ['id', 'anonymousKey', 'countryCode', 'zipCode', 'gender', 'birthYear', 'dimensionsExplored', 'isTestData', 'submittedAt', 'dnaString'];
    const csvLines = [headers.join(',')];
    for (const row of rows) {
      csvLines.push(headers.map(h => {
        const val = (row as any)[h];
        if (val instanceof Date) return val.toISOString();
        if (typeof val === 'string' && val.includes(',')) return `"${val}"`;
        return String(val ?? '');
      }).join(','));
    }

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=genome-submissions-${new Date().toISOString().split('T')[0]}.csv`);
    return res.send(csvLines.join('\n'));
  } catch (err: any) {
    console.error('Export error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

const COUNTRY_WEIGHTS: [string, number, string[]][] = [
  ['840', 40, ['10001','30301','60601','75201','90210','33101','48201','77001','85001','97201','02101','19101','43201','55401','80201']],
  ['826', 10, ['SW1A1','EC1A1','M11AE','B11BB','LS11A']],
  ['124', 8, ['K1A0B','M5V3L','V6B5K','T2P3C','H3B1A']],
  ['036', 6, ['20000','30000','40000','50000','60000']],
  ['276', 5, ['10115','20095','80331','50667','60311']],
  ['250', 4, ['75001','13001','69001','33000','31000']],
  ['356', 4, ['11001','40001','50001','60001','70001']],
  ['076', 4, ['01000','20000','30000','40000','50000']],
  ['392', 3, ['10000','53000','60000','81000','98000']],
  ['410', 3, ['03000','06000','10000','41000','61000']],
  ['484', 3, ['06600','01000','03100','44100','64000']],
  ['380', 2, ['00100','20100','50100','80100','10100']],
  ['724', 2, ['28001','08001','41001','46001','48001']],
  ['528', 2, ['10000','30000','50000','60000','70000']],
  ['752', 2, ['11120','21100','41100','50100','60100']],
  ['616', 1, ['00001','30001','50001','60001','80001']],
  ['710', 1, ['00010','20000','40000','60000','80000']],
];
const GENDER_WEIGHTS: [string, number][] = [['1',42],['0',42],['9',8],['5',6],['2',2]];
const GEN_WEIGHTS: [number, number, number][] = [[1940,1945,3],[1946,1964,12],[1965,1980,22],[1981,1996,35],[1997,2006,23],[2007,2010,5]];

function wPick<T>(items: [T, number][]): T {
  const total = items.reduce((s, [, w]) => s + w, 0);
  let r = Math.random() * total;
  for (const [item, weight] of items) { r -= weight; if (r <= 0) return item; }
  return items[items.length - 1][0];
}

router.post('/promote-test', async (req: Request, res: Response) => {
  try {
    const result = await db.update(genomeSubmissions)
      .set({ isTestData: false })
      .where(eq(genomeSubmissions.isTestData, true));
    return res.json({ success: true, message: 'Test data promoted to real submissions.' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

router.post('/seed-test', async (req: Request, res: Response) => {
  try {
    const count = Math.min(parseInt(req.body.count) || 350, 500);

    await db.delete(genomeSubmissions).where(eq(genomeSubmissions.isTestData, true));

    const genderMap: Record<string, string> = { '0': 'F', '1': 'M', '2': 'Intersex', '5': 'PNS', '9': 'NB' };
    const archetypes = [
      { center: 5, spread: 2.5, explored: 0.85 },
      { center: 3, spread: 2, explored: 0.7 },
      { center: 7, spread: 2, explored: 0.75 },
      { center: 4, spread: 3, explored: 0.6 },
      { center: 6, spread: 2, explored: 0.9 },
      { center: 5, spread: 1.5, explored: 0.95 },
      { center: 2, spread: 2, explored: 0.5 },
      { center: 8, spread: 1.5, explored: 0.65 },
    ];

    const values: any[] = [];
    for (let i = 0; i < count; i++) {
      const gen = wPick(GEN_WEIGHTS.map(([s, e, w]) => [[s, e] as [number, number], w]));
      const birthYear = gen[0] + Math.floor(Math.random() * (gen[1] - gen[0] + 1));
      const genderCode = wPick(GENDER_WEIGHTS);
      const cTotal = COUNTRY_WEIGHTS.reduce((s, [, w]) => s + w, 0);
      let cr = Math.random() * cTotal;
      let countryCode = '840', zip = '10001';
      for (const [code, weight, zips] of COUNTRY_WEIGHTS) {
        cr -= weight;
        if (cr <= 0) { countryCode = code; zip = zips[Math.floor(Math.random() * zips.length)]; break; }
      }

      const arch = archetypes[Math.floor(Math.random() * archetypes.length)];
      let beliefs = '';
      for (let j = 0; j < 124; j++) {
        if (Math.random() > arch.explored) beliefs += '.';
        else { let v = Math.round(arch.center + (Math.random() - 0.5) * 2 * arch.spread); beliefs += Math.max(0, Math.min(9, v)).toString(); }
      }

      const century = birthYear >= 2000 ? 1 : 0;
      const yy = (birthYear % 100).toString().padStart(2, '0');
      const month = (Math.floor(Math.random() * 12) + 1).toString().padStart(2, '0');
      const day = (Math.floor(Math.random() * 28) + 1).toString().padStart(2, '0');
      const paddedZip = zip.padEnd(5, '0').slice(0, 5);
      const dnaString = `${century}${yy}${month}${day}${genderCode}${countryCode}${paddedZip}${beliefs}`;
      const anonymousKey = crypto.randomBytes(32).toString('hex');

      const beliefValues: Record<string, number | null> = {};
      let dimensionsExplored = 0;
      for (let j = 0; j < 124; j++) {
        const c = beliefs[j]; const dimId = j + 4;
        if (c === '.') beliefValues[String(dimId)] = null;
        else { beliefValues[String(dimId)] = parseInt(c); dimensionsExplored++; }
      }

      const submittedAt = new Date(Date.now() - Math.floor(Math.random() * 90 * 24 * 60 * 60 * 1000));

      values.push({
        anonymousKey, dnaString,
        demographicPrefix: `${century} century · ${yy} year · ${month} month · ${day} day · ${genderCode} gender · ${countryCode} country · ${paddedZip} zip`,
        century, birthYear, birthMonth: parseInt(month), birthDay: parseInt(day),
        gender: genderMap[genderCode] || 'PNS', countryCode, zipCode: paddedZip,
        beliefValues, dimensionsExplored, isTestData: true, submittedAt, updatedAt: submittedAt,
      });
    }

    const BATCH = 50;
    for (let i = 0; i < values.length; i += BATCH) {
      await db.insert(genomeSubmissions).values(values.slice(i, i + BATCH));
    }

    return res.json({ success: true, count, message: `${count} test submissions seeded.` });
  } catch (err: any) {
    console.error('Seed test error:', err);
    return res.status(500).json({ error: err.message });
  }
});

export default router;
