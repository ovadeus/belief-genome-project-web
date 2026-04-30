// Per-user library of imported DNA signatures.
// Mount at: app.use('/api/genome/known-dnas', genomeAuth, genomeKnownDnasRouter)

import { Router, type IRouter, type Request, type Response } from 'express';
import { db, knownDnas } from '@workspace/db';
import { decodeSignature, parseSignatureFromAnyInput } from '@belief-genome/engine';
import { and, desc, eq } from 'drizzle-orm';

const router: IRouter = Router();

// ── Per-user, per-route in-memory rate limit: 60 req / minute / user ─────────
// Same minimal pattern used elsewhere in this codebase. Keyed by userId+route
// so /parse and /add don't share a budget.
const rl: Record<string, number[]> = {};
function rateLimit(key: string, max: number, windowMs: number): boolean {
  const now = Date.now();
  const arr = (rl[key] ||= []);
  while (arr.length && arr[0] < now - windowMs) arr.shift();
  if (arr.length >= max) return false;
  arr.push(now);
  return true;
}

function userId(req: Request): number {
  return (req as any).genomeUser.userId;
}

// GET /api/genome/known-dnas — list current user's library, newest first
router.get('/', async (req, res) => {
  const uid = userId(req);
  const rows = await db
    .select()
    .from(knownDnas)
    .where(eq(knownDnas.userId, uid))
    .orderBy(desc(knownDnas.importedAt));
  res.json({ entries: rows });
});

// POST /api/genome/known-dnas — add to library (upsert on (user_id, signature))
// Body: { signature, format?, shareableName?, note?, exportedAt?, exportedFrom?, source }
router.post('/', async (req, res) => {
  const uid = userId(req);

  if (!rateLimit(`add:${uid}`, 60, 60_000)) {
    return res.status(429).json({ error: 'rate_limited' });
  }

  const { signature, shareableName, note, exportedAt, exportedFrom, source } = req.body || {};
  if (typeof signature !== 'string') {
    return res.status(400).json({ error: 'signature_required' });
  }

  const decoded = await decodeSignature(signature);
  if (!decoded.valid) {
    return res.status(400).json({ error: 'invalid_signature' });
  }

  const allowedSources = new Set(['file', 'paste', 'url']);
  const src = typeof source === 'string' && allowedSources.has(source) ? source : 'paste';

  const exportedAtDate = (() => {
    if (!exportedAt) return null;
    const d = new Date(exportedAt);
    return isNaN(d.getTime()) ? null : d;
  })();

  // Upsert via SELECT-then-INSERT/UPDATE — keeps it portable across drizzle
  // versions and gives us the deduped flag for the UI.
  const existing = await db
    .select()
    .from(knownDnas)
    .where(and(eq(knownDnas.userId, uid), eq(knownDnas.signature, decoded.signature)))
    .limit(1);

  if (existing.length) {
    const row = existing[0];
    const updated = await db
      .update(knownDnas)
      .set({
        shareableName: typeof shareableName === 'string' && shareableName.trim()
          ? shareableName.trim().slice(0, 80)
          : row.shareableName,
        note: typeof note === 'string' && note.trim()
          ? note.trim().slice(0, 500)
          : row.note,
        exportedAt: exportedAtDate ?? row.exportedAt,
        exportedFrom: typeof exportedFrom === 'string' ? exportedFrom.slice(0, 32) : row.exportedFrom,
        source: src,
      })
      .where(eq(knownDnas.id, row.id))
      .returning();
    return res.json({ entry: updated[0], deduped: true });
  }

  const inserted = await db
    .insert(knownDnas)
    .values({
      userId: uid,
      signature: decoded.signature,
      format: decoded.format,
      shareableName: typeof shareableName === 'string' && shareableName.trim()
        ? shareableName.trim().slice(0, 80) : null,
      note: typeof note === 'string' && note.trim() ? note.trim().slice(0, 500) : null,
      exportedAt: exportedAtDate,
      exportedFrom: typeof exportedFrom === 'string' ? exportedFrom.slice(0, 32) : null,
      source: src,
    })
    .returning();

  return res.json({ entry: inserted[0], deduped: false });
});

// DELETE /api/genome/known-dnas/:id — remove an entry. Per-user check inline.
router.delete('/:id', async (req, res) => {
  const uid = userId(req);
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) return res.status(400).json({ error: 'invalid_id' });

  const result = await db
    .delete(knownDnas)
    .where(and(eq(knownDnas.id, id), eq(knownDnas.userId, uid)))
    .returning({ id: knownDnas.id });

  if (!result.length) return res.status(404).json({ error: 'not_found' });
  return res.json({ ok: true });
});

// POST /api/genome/known-dnas/parse — validate any-shape input without storing.
// Body: { text }. Returns { valid: true, parsed: {...} } or { valid: false }.
router.post('/parse', async (req: Request, res: Response) => {
  const uid = userId(req);
  if (!rateLimit(`parse:${uid}`, 60, 60_000)) {
    return res.status(429).json({ error: 'rate_limited' });
  }

  const { text } = req.body || {};
  if (typeof text !== 'string') {
    return res.json({ valid: false });
  }

  const parsed = await parseSignatureFromAnyInput(text);
  if (!parsed) return res.json({ valid: false });

  // Don't echo fullDna in the parse response — it would leak the signed-side
  // demographic prefix to anyone who pastes a string. The Add step re-decodes
  // server-side from `signature` anyway. `dimensionsCovered` is derived from
  // the engine's already-parsed amplitudes array (works for V1 and V2).
  let dimensionsCovered = 0;
  for (const v of parsed.amplitudes) if (v !== null) dimensionsCovered++;

  return res.json({
    valid: true,
    parsed: {
      format: parsed.format,
      version: parsed.version,
      signature: parsed.signature,
      shareableName: parsed.shareableName,
      note: parsed.note,
      exportedAt: parsed.exportedAt,
      exportedFrom: parsed.exportedFrom,
      fileFormat: parsed.fileFormat,
      dimensionsCovered,
    },
  });
});

export default router;
