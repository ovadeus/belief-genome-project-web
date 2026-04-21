import { Router, type IRouter, type Request, type Response } from "express";
import { eq, desc, sql, and, gt } from "drizzle-orm";
import crypto from "crypto";
import { z } from "zod";
import {
  db,
  podcastEpisodesTable,
  podcastLikesTable,
  podcastListensTable,
  podcastCommentsTable,
} from "@workspace/db";
import { requireAuth } from "../middlewares/auth";

const router: IRouter = Router();

// ─── helpers ────────────────────────────────────────────────────────────────
const IP_SALT = process.env.IP_HASH_SALT || "bgp-podcast-fallback-salt";

function ipHash(req: Request): string {
  const ip = (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim()
    || req.ip
    || "unknown";
  return crypto.createHash("sha256").update(IP_SALT + ":" + ip).digest("hex").slice(0, 32);
}

function slugify(s: string): string {
  return s.toLowerCase().trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 200) || `episode-${Date.now()}`;
}

// Spam scoring — returns "approved" | "spam" based on simple heuristics.
function classifyComment(name: string, body: string): "approved" | "spam" {
  const text = body.toLowerCase();
  // Too many URLs → spam
  const urlMatches = body.match(/https?:\/\//gi) || [];
  if (urlMatches.length > 2) return "spam";
  // BBCode link spam
  if (/\[url=/i.test(body) || /<a\s+href=/i.test(body)) return "spam";
  // Common spam keywords (very narrow list to avoid false positives)
  const spamWords = ["viagra", "casino", "porn", "xxx", "crypto pump", "nft drop", "free bitcoin"];
  if (spamWords.some(w => text.includes(w))) return "spam";
  // Excessive repetition (single char or word repeated > 30x)
  if (/(.)\1{30,}/.test(body)) return "spam";
  // Name looks like a URL
  if (/https?:\/\//i.test(name)) return "spam";
  return "approved";
}

// Common transformer that strips ipHash from comment rows before sending out.
function publicComment(c: any) {
  return {
    id: c.id,
    episodeId: c.episodeId,
    authorName: c.authorName,
    body: c.body,
    createdAt: c.createdAt,
  };
}

function publicEpisode(e: any, opts?: { liked?: boolean }) {
  return {
    id: e.id,
    slug: e.slug,
    title: e.title,
    description: e.description,
    audioUrl: e.audioObjectPath ? `/api/storage${e.audioObjectPath}` : null,
    audioFileName: e.audioFileName,
    durationSec: e.durationSec,
    coverImageUrl: e.coverImagePath ? `/api/storage${e.coverImagePath}` : null,
    tags: e.tags ?? [],
    publishedAt: e.publishedAt,
    listenCount: e.listenCount,
    downloadCount: e.downloadCount,
    likeCount: e.likeCount,
    liked: opts?.liked ?? false,
  };
}

// ════════════════════════════════════════════════════════════════════════════
// PUBLIC ROUTES  (mounted under /api by app.ts)
// ════════════════════════════════════════════════════════════════════════════

// List published episodes, newest first
router.get("/podcasts", async (_req, res): Promise<void> => {
  const eps = await db
    .select()
    .from(podcastEpisodesTable)
    .where(eq(podcastEpisodesTable.status, "published"))
    .orderBy(desc(podcastEpisodesTable.publishedAt));
  res.json({ episodes: eps.map(e => publicEpisode(e)) });
});

// Episode detail by slug
router.get("/podcasts/:slug", async (req, res): Promise<void> => {
  const slug = Array.isArray(req.params.slug) ? req.params.slug[0] : req.params.slug;
  const [ep] = await db.select().from(podcastEpisodesTable).where(eq(podcastEpisodesTable.slug, slug));
  if (!ep || ep.status !== "published") {
    res.status(404).json({ error: "Episode not found" });
    return;
  }
  // Did this IP already like it?
  const ip = ipHash(req);
  const [like] = await db.select().from(podcastLikesTable)
    .where(and(eq(podcastLikesTable.episodeId, ep.id), eq(podcastLikesTable.ipHash, ip)))
    .limit(1);
  res.json(publicEpisode(ep, { liked: !!like }));
});

// Cheap episode existence guard so unknown IDs return a clean 404 instead
// of exposing a Postgres FK error in a stack trace.
async function requireEpisode(id: number, res: Response): Promise<boolean> {
  const [ep] = await db.select({ id: podcastEpisodesTable.id })
    .from(podcastEpisodesTable)
    .where(eq(podcastEpisodesTable.id, id))
    .limit(1);
  if (!ep) { res.status(404).json({ error: "Episode not found" }); return false; }
  return true;
}

// Log a listen (5-min IP dedup)
router.post("/podcasts/:id/listen", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id as string, 10);
  if (Number.isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }
  if (!(await requireEpisode(id, res))) return;
  const ip = ipHash(req);
  const fiveMinAgo = new Date(Date.now() - 5 * 60_000);
  const [recent] = await db.select().from(podcastListensTable).where(and(
    eq(podcastListensTable.episodeId, id),
    eq(podcastListensTable.ipHash, ip),
    eq(podcastListensTable.kind, "listen"),
    gt(podcastListensTable.createdAt, fiveMinAgo),
  )).limit(1);
  if (recent) { res.json({ ok: true, deduped: true }); return; }
  await db.insert(podcastListensTable).values({ episodeId: id, ipHash: ip, kind: "listen" });
  await db.update(podcastEpisodesTable)
    .set({ listenCount: sql`${podcastEpisodesTable.listenCount} + 1` })
    .where(eq(podcastEpisodesTable.id, id));
  res.json({ ok: true });
});

// Log a download
router.post("/podcasts/:id/download", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id as string, 10);
  if (Number.isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }
  if (!(await requireEpisode(id, res))) return;
  const ip = ipHash(req);
  await db.insert(podcastListensTable).values({ episodeId: id, ipHash: ip, kind: "download" });
  await db.update(podcastEpisodesTable)
    .set({ downloadCount: sql`${podcastEpisodesTable.downloadCount} + 1` })
    .where(eq(podcastEpisodesTable.id, id));
  res.json({ ok: true });
});

// Toggle like (one per IP per episode)
router.post("/podcasts/:id/like", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id as string, 10);
  if (Number.isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }
  if (!(await requireEpisode(id, res))) return;
  const ip = ipHash(req);
  const [existing] = await db.select().from(podcastLikesTable)
    .where(and(eq(podcastLikesTable.episodeId, id), eq(podcastLikesTable.ipHash, ip)))
    .limit(1);
  if (existing) {
    await db.delete(podcastLikesTable).where(eq(podcastLikesTable.id, existing.id));
    await db.update(podcastEpisodesTable)
      .set({ likeCount: sql`GREATEST(${podcastEpisodesTable.likeCount} - 1, 0)` })
      .where(eq(podcastEpisodesTable.id, id));
    res.json({ liked: false });
    return;
  }
  await db.insert(podcastLikesTable).values({ episodeId: id, ipHash: ip });
  await db.update(podcastEpisodesTable)
    .set({ likeCount: sql`${podcastEpisodesTable.likeCount} + 1` })
    .where(eq(podcastEpisodesTable.id, id));
  res.json({ liked: true });
});

// List approved comments
router.get("/podcasts/:id/comments", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id as string, 10);
  if (Number.isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }
  const rows = await db.select().from(podcastCommentsTable)
    .where(and(eq(podcastCommentsTable.episodeId, id), eq(podcastCommentsTable.status, "approved")))
    .orderBy(desc(podcastCommentsTable.createdAt))
    .limit(200);
  res.json({ comments: rows.map(publicComment) });
});

// Submit comment — spam-proof
const CommentBody = z.object({
  authorName: z.string().min(2).max(80),
  body: z.string().min(5).max(2000),
  // Honeypot — real users never fill this. Bots fill every input.
  website: z.string().optional(),
});
router.post("/podcasts/:id/comments", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id as string, 10);
  if (Number.isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }
  const parsed = CommentBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Name (2-80 chars) and body (5-2000 chars) are required" });
    return;
  }
  // Episode must exist and be published
  const [ep] = await db.select().from(podcastEpisodesTable).where(eq(podcastEpisodesTable.id, id));
  if (!ep || ep.status !== "published") { res.status(404).json({ error: "Episode not found" }); return; }

  const ip = ipHash(req);

  // Honeypot tripped → store as spam silently (don't tell the bot)
  if (parsed.data.website && parsed.data.website.trim().length > 0) {
    await db.insert(podcastCommentsTable).values({
      episodeId: id,
      authorName: parsed.data.authorName.trim(),
      body: parsed.data.body.trim(),
      ipHash: ip,
      status: "spam",
    });
    res.json({ ok: true });
    return;
  }

  // Rate limit — max 3 comments per IP per 60s
  const oneMinAgo = new Date(Date.now() - 60_000);
  const recent = await db.select({ count: sql<number>`count(*)::int` })
    .from(podcastCommentsTable)
    .where(and(
      eq(podcastCommentsTable.ipHash, ip),
      gt(podcastCommentsTable.createdAt, oneMinAgo),
    ));
  if ((recent[0]?.count ?? 0) >= 3) {
    res.status(429).json({ error: "You're posting too quickly — please wait a moment." });
    return;
  }

  const status = classifyComment(parsed.data.authorName, parsed.data.body);
  const [row] = await db.insert(podcastCommentsTable).values({
    episodeId: id,
    authorName: parsed.data.authorName.trim(),
    body: parsed.data.body.trim(),
    ipHash: ip,
    status,
  }).returning();

  // Spam comments still return 200 so bots don't learn — but the row is hidden
  res.status(201).json(status === "spam" ? { ok: true } : { ok: true, comment: publicComment(row) });
});

// ════════════════════════════════════════════════════════════════════════════
// ADMIN ROUTES  (gated by requireAuth applied at /admin in index router)
// ════════════════════════════════════════════════════════════════════════════
const adminRouter: IRouter = Router();
adminRouter.use(requireAuth as any);

const CreateEpisodeBody = z.object({
  title: z.string().min(1).max(255),
  slug: z.string().max(255).optional(),
  description: z.string().optional().nullable(),
  audioObjectPath: z.string().optional().nullable(),
  audioFileName: z.string().optional().nullable(),
  audioMimeType: z.string().optional().nullable(),
  audioBytes: z.number().int().nonnegative().optional().nullable(),
  durationSec: z.number().int().nonnegative().optional().nullable(),
  coverImagePath: z.string().optional().nullable(),
  tags: z.array(z.string()).optional(),
  status: z.enum(["draft", "published"]).optional(),
  publishedAt: z.string().optional().nullable(),
});

// Admin list (all statuses)
adminRouter.get("/podcasts", async (_req, res): Promise<void> => {
  const eps = await db.select().from(podcastEpisodesTable).orderBy(desc(podcastEpisodesTable.createdAt));
  res.json({ episodes: eps });
});

adminRouter.post("/podcasts", async (req, res): Promise<void> => {
  const parsed = CreateEpisodeBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  let slug = (parsed.data.slug || "").trim() || slugify(parsed.data.title);
  // Guarantee slug uniqueness
  const [clash] = await db.select().from(podcastEpisodesTable).where(eq(podcastEpisodesTable.slug, slug)).limit(1);
  if (clash) slug = `${slug}-${Date.now().toString(36)}`;

  const status = parsed.data.status || "draft";
  const publishedAt = status === "published"
    ? (parsed.data.publishedAt ? new Date(parsed.data.publishedAt) : new Date())
    : null;

  const [ep] = await db.insert(podcastEpisodesTable).values({
    slug,
    title: parsed.data.title,
    description: parsed.data.description || null,
    audioObjectPath: parsed.data.audioObjectPath || null,
    audioFileName: parsed.data.audioFileName || null,
    audioMimeType: parsed.data.audioMimeType || null,
    audioBytes: parsed.data.audioBytes || null,
    durationSec: parsed.data.durationSec || null,
    coverImagePath: parsed.data.coverImagePath || null,
    tags: parsed.data.tags || [],
    status,
    publishedAt,
  }).returning();
  res.status(201).json(ep);
});

adminRouter.get("/podcasts/analytics", async (_req, res): Promise<void> => {
  const [totals] = await db.select({
    total: sql<number>`count(*)::int`,
    published: sql<number>`sum(case when status='published' then 1 else 0 end)::int`,
    drafts: sql<number>`sum(case when status='draft' then 1 else 0 end)::int`,
    listens: sql<number>`coalesce(sum(listen_count),0)::int`,
    downloads: sql<number>`coalesce(sum(download_count),0)::int`,
    likes: sql<number>`coalesce(sum(like_count),0)::int`,
  }).from(podcastEpisodesTable);

  const top = await db.select({
    id: podcastEpisodesTable.id,
    slug: podcastEpisodesTable.slug,
    title: podcastEpisodesTable.title,
    listenCount: podcastEpisodesTable.listenCount,
    downloadCount: podcastEpisodesTable.downloadCount,
    likeCount: podcastEpisodesTable.likeCount,
    publishedAt: podcastEpisodesTable.publishedAt,
  }).from(podcastEpisodesTable)
    .where(eq(podcastEpisodesTable.status, "published"))
    .orderBy(desc(podcastEpisodesTable.listenCount))
    .limit(10);

  // 30-day listen history bucketed by day
  const series = await db.execute(sql`
    SELECT date_trunc('day', created_at)::date AS date,
           sum(case when kind='listen' then 1 else 0 end)::int AS listens,
           sum(case when kind='download' then 1 else 0 end)::int AS downloads
    FROM ${podcastListensTable}
    WHERE created_at >= now() - interval '30 days'
    GROUP BY 1 ORDER BY 1
  `);
  const seriesRows = (series as any).rows ?? series;

  res.json({
    totals: totals ?? { total: 0, published: 0, drafts: 0, listens: 0, downloads: 0, likes: 0 },
    topEpisodes: top,
    series: seriesRows,
  });
});

adminRouter.get("/podcasts/comments", async (req, res): Promise<void> => {
  const status = (req.query.status as string) || "all";
  const conditions = [];
  if (status !== "all") conditions.push(eq(podcastCommentsTable.status, status));
  const where = conditions.length ? and(...conditions) : undefined;
  const rows = await db.select({
    id: podcastCommentsTable.id,
    episodeId: podcastCommentsTable.episodeId,
    authorName: podcastCommentsTable.authorName,
    body: podcastCommentsTable.body,
    status: podcastCommentsTable.status,
    createdAt: podcastCommentsTable.createdAt,
    episodeTitle: podcastEpisodesTable.title,
    episodeSlug: podcastEpisodesTable.slug,
  })
    .from(podcastCommentsTable)
    .leftJoin(podcastEpisodesTable, eq(podcastCommentsTable.episodeId, podcastEpisodesTable.id))
    .where(where)
    .orderBy(desc(podcastCommentsTable.createdAt))
    .limit(200);
  res.json({ comments: rows });
});

adminRouter.patch("/podcasts/comments/:id", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id as string, 10);
  const status = req.body?.status;
  if (Number.isNaN(id) || !["approved", "pending", "spam"].includes(status)) {
    res.status(400).json({ error: "Invalid request" });
    return;
  }
  const [row] = await db.update(podcastCommentsTable).set({ status }).where(eq(podcastCommentsTable.id, id)).returning();
  if (!row) { res.status(404).json({ error: "Not found" }); return; }
  res.json(row);
});

adminRouter.delete("/podcasts/comments/:id", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id as string, 10);
  if (Number.isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }
  await db.delete(podcastCommentsTable).where(eq(podcastCommentsTable.id, id));
  res.sendStatus(204);
});

adminRouter.get("/podcasts/:id", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id as string, 10);
  if (Number.isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }
  const [ep] = await db.select().from(podcastEpisodesTable).where(eq(podcastEpisodesTable.id, id));
  if (!ep) { res.status(404).json({ error: "Episode not found" }); return; }
  res.json(ep);
});

adminRouter.patch("/podcasts/:id", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id as string, 10);
  if (Number.isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }
  const parsed = CreateEpisodeBody.partial().safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const updateData: any = { ...parsed.data };
  if (parsed.data.publishedAt) updateData.publishedAt = new Date(parsed.data.publishedAt);
  if (parsed.data.status === "published") {
    const [existing] = await db.select().from(podcastEpisodesTable).where(eq(podcastEpisodesTable.id, id));
    if (existing && !existing.publishedAt && !parsed.data.publishedAt) {
      updateData.publishedAt = new Date();
    }
  }
  const [ep] = await db.update(podcastEpisodesTable).set(updateData).where(eq(podcastEpisodesTable.id, id)).returning();
  if (!ep) { res.status(404).json({ error: "Episode not found" }); return; }
  res.json(ep);
});

adminRouter.patch("/podcasts/:id/toggle-status", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id as string, 10);
  if (Number.isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }
  const [existing] = await db.select().from(podcastEpisodesTable).where(eq(podcastEpisodesTable.id, id));
  if (!existing) { res.status(404).json({ error: "Episode not found" }); return; }
  const newStatus = existing.status === "published" ? "draft" : "published";
  const publishedAt = newStatus === "published" && !existing.publishedAt ? new Date() : existing.publishedAt;
  const [ep] = await db.update(podcastEpisodesTable)
    .set({ status: newStatus, publishedAt })
    .where(eq(podcastEpisodesTable.id, id))
    .returning();
  res.json(ep);
});

adminRouter.delete("/podcasts/:id", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id as string, 10);
  if (Number.isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }
  await db.delete(podcastEpisodesTable).where(eq(podcastEpisodesTable.id, id));
  res.sendStatus(204);
});

export default router;
export { adminRouter as podcastAdminRouter };
