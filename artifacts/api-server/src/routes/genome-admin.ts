import { Router, Request, Response } from 'express';
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

export default router;
