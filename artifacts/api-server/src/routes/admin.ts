import { Router, type IRouter } from "express";
import { eq, desc, sql, and, ilike } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { db, blogPostsTable, subscribersTable, earlyBirdTable, adminUsersTable, siteSettingsTable, mediaTable } from "@workspace/db";
import { ObjectStorageService } from "../lib/objectStorage";
import {
  CreateBlogPostBody,
  UpdateBlogPostBody,
  ListAdminBlogPostsQueryParams,
  ListSubscribersQueryParams,
  ListEarlyBirdQueryParams,
  UpdateSettingsBody,
  ChangeAdminPasswordBody,
} from "@workspace/api-zod";
import { requireAuth } from "../middlewares/auth";

const router: IRouter = Router();

router.use("/admin", requireAuth as any);

router.get("/admin/stats", async (_req, res): Promise<void> => {
  const [subCount] = await db.select({ count: sql<number>`count(*)::int` }).from(subscribersTable);
  const [ebCount] = await db.select({ count: sql<number>`count(*)::int` }).from(earlyBirdTable);
  const [postCount] = await db.select({ count: sql<number>`count(*)::int` }).from(blogPostsTable);
  const [pubCount] = await db.select({ count: sql<number>`count(*)::int` }).from(blogPostsTable).where(eq(blogPostsTable.status, "published"));
  const [draftCount] = await db.select({ count: sql<number>`count(*)::int` }).from(blogPostsTable).where(eq(blogPostsTable.status, "draft"));

  const recentSubs = await db.select().from(subscribersTable).orderBy(desc(subscribersTable.createdAt)).limit(5);
  const recentPosts = await db.select().from(blogPostsTable).orderBy(desc(blogPostsTable.createdAt)).limit(5);

  res.json({
    totalSubscribers: subCount?.count ?? 0,
    totalEarlyBird: ebCount?.count ?? 0,
    totalPosts: postCount?.count ?? 0,
    publishedPosts: pubCount?.count ?? 0,
    draftPosts: draftCount?.count ?? 0,
    recentSubscribers: recentSubs,
    recentPosts: recentPosts.map(p => ({ ...p, hashtags: p.hashtags ?? [] })),
  });
});

function calculateReadTime(body: string | null | undefined): number {
  if (!body) return 1;
  const wordCount = body.split(/\s+/).length;
  return Math.max(1, Math.ceil(wordCount / 200));
}

router.get("/admin/blog", async (req, res): Promise<void> => {
  const params = ListAdminBlogPostsQueryParams.safeParse(req.query);
  const page = params.success ? params.data.page ?? 1 : 1;
  const limit = params.success ? params.data.limit ?? 25 : 25;
  const search = params.success ? params.data.search : undefined;
  const status = params.success ? params.data.status : undefined;
  const offset = (page - 1) * limit;

  const conditions = [];
  if (search) {
    conditions.push(
      sql`(${blogPostsTable.title} ILIKE ${'%' + search + '%'} OR ${blogPostsTable.body} ILIKE ${'%' + search + '%'} OR ${blogPostsTable.slug} ILIKE ${'%' + search + '%'})`
    );
  }
  if (status) {
    conditions.push(eq(blogPostsTable.status, status));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const [countResult] = await db.select({ count: sql<number>`count(*)::int` }).from(blogPostsTable).where(whereClause);
  const total = countResult?.count ?? 0;

  const posts = await db.select().from(blogPostsTable).where(whereClause).orderBy(desc(blogPostsTable.createdAt)).limit(limit).offset(offset);

  res.json({
    posts: posts.map(p => ({ ...p, hashtags: p.hashtags ?? [] })),
    total,
    page,
    totalPages: Math.ceil(total / limit),
  });
});

router.post("/admin/blog", async (req, res): Promise<void> => {
  const parsed = CreateBlogPostBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const readTimeMins = calculateReadTime(parsed.data.body);
  const publishedAt = parsed.data.status === "published" ? (parsed.data.publishedAt ? new Date(parsed.data.publishedAt) : new Date()) : null;

  const [post] = await db
    .insert(blogPostsTable)
    .values({
      title: parsed.data.title,
      slug: parsed.data.slug,
      excerpt: parsed.data.excerpt || null,
      body: parsed.data.body || null,
      featuredImage: parsed.data.featuredImage || null,
      hashtags: parsed.data.hashtags || [],
      status: parsed.data.status || "draft",
      publishedAt,
      readTimeMins,
      isPrivate: parsed.data.isPrivate ?? false,
      customCss: parsed.data.customCss || null,
      customJs: parsed.data.customJs || null,
    })
    .returning();

  res.status(201).json({ ...post, hashtags: post.hashtags ?? [] });
});

router.get("/admin/blog/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid ID" });
    return;
  }

  const [post] = await db.select().from(blogPostsTable).where(eq(blogPostsTable.id, id));
  if (!post) {
    res.status(404).json({ error: "Post not found" });
    return;
  }
  res.json({ ...post, hashtags: post.hashtags ?? [] });
});

router.patch("/admin/blog/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid ID" });
    return;
  }

  const parsed = UpdateBlogPostBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const updateData: any = { ...parsed.data };
  if (parsed.data.body) {
    updateData.readTimeMins = calculateReadTime(parsed.data.body);
  }
  if (parsed.data.status === "published" && !parsed.data.publishedAt) {
    const [existing] = await db.select().from(blogPostsTable).where(eq(blogPostsTable.id, id));
    if (existing && !existing.publishedAt) {
      updateData.publishedAt = new Date();
    }
  }
  if (parsed.data.publishedAt) {
    updateData.publishedAt = new Date(parsed.data.publishedAt);
  }

  const [post] = await db.update(blogPostsTable).set(updateData).where(eq(blogPostsTable.id, id)).returning();
  if (!post) {
    res.status(404).json({ error: "Post not found" });
    return;
  }
  res.json({ ...post, hashtags: post.hashtags ?? [] });
});

router.delete("/admin/blog/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid ID" });
    return;
  }

  const [post] = await db.delete(blogPostsTable).where(eq(blogPostsTable.id, id)).returning();
  if (!post) {
    res.status(404).json({ error: "Post not found" });
    return;
  }
  res.sendStatus(204);
});

router.patch("/admin/blog/:id/toggle-status", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid ID" });
    return;
  }

  const [existing] = await db.select().from(blogPostsTable).where(eq(blogPostsTable.id, id));
  if (!existing) {
    res.status(404).json({ error: "Post not found" });
    return;
  }

  const newStatus = existing.status === "published" ? "draft" : "published";
  const publishedAt = newStatus === "published" && !existing.publishedAt ? new Date() : existing.publishedAt;

  const [post] = await db
    .update(blogPostsTable)
    .set({ status: newStatus, publishedAt })
    .where(eq(blogPostsTable.id, id))
    .returning();

  res.json({ ...post, hashtags: post?.hashtags ?? [] });
});

router.get("/admin/subscribers", async (req, res): Promise<void> => {
  const params = ListSubscribersQueryParams.safeParse(req.query);
  const page = params.success ? params.data.page ?? 1 : 1;
  const limit = params.success ? params.data.limit ?? 25 : 25;
  const source = params.success ? params.data.source : undefined;
  const search = params.success ? params.data.search : undefined;
  const offset = (page - 1) * limit;

  const conditions = [];
  if (source) conditions.push(eq(subscribersTable.source, source));
  if (search) {
    conditions.push(
      sql`(${subscribersTable.name} ILIKE ${'%' + search + '%'} OR ${subscribersTable.email} ILIKE ${'%' + search + '%'})`
    );
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const [countResult] = await db.select({ count: sql<number>`count(*)::int` }).from(subscribersTable).where(whereClause);
  const total = countResult?.count ?? 0;

  const subscribers = await db
    .select()
    .from(subscribersTable)
    .where(whereClause)
    .orderBy(desc(subscribersTable.createdAt))
    .limit(limit)
    .offset(offset);

  res.json({ subscribers, total, page, totalPages: Math.ceil(total / limit) });
});

router.delete("/admin/subscribers/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid ID" });
    return;
  }

  const [sub] = await db.delete(subscribersTable).where(eq(subscribersTable.id, id)).returning();
  if (!sub) {
    res.status(404).json({ error: "Subscriber not found" });
    return;
  }
  res.sendStatus(204);
});

router.patch("/admin/subscribers/:id/toggle-member", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid ID" });
    return;
  }

  const [existing] = await db.select().from(subscribersTable).where(eq(subscribersTable.id, id));
  if (!existing) {
    res.status(404).json({ error: "Subscriber not found" });
    return;
  }

  const [updated] = await db
    .update(subscribersTable)
    .set({ isMember: !existing.isMember })
    .where(eq(subscribersTable.id, id))
    .returning();

  res.json(updated);
});

router.get("/admin/subscribers/export", async (_req, res): Promise<void> => {
  const subscribers = await db.select().from(subscribersTable).orderBy(desc(subscribersTable.createdAt));
  const csv = ["Name,Email,Source,Signup Date,Active,Member"]
    .concat(subscribers.map(s => `"${s.name || ""}","${s.email}","${s.source || ""}","${s.createdAt.toISOString()}","${s.isActive}","${s.isMember}"`))
    .join("\n");
  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", "attachment; filename=subscribers.csv");
  res.send(csv);
});

router.get("/admin/earlybird", async (req, res): Promise<void> => {
  const params = ListEarlyBirdQueryParams.safeParse(req.query);
  const page = params.success ? params.data.page ?? 1 : 1;
  const limit = params.success ? params.data.limit ?? 25 : 25;
  const offset = (page - 1) * limit;

  const [countResult] = await db.select({ count: sql<number>`count(*)::int` }).from(earlyBirdTable);
  const total = countResult?.count ?? 0;

  const entries = await db.select().from(earlyBirdTable).orderBy(desc(earlyBirdTable.createdAt)).limit(limit).offset(offset);

  res.json({ entries, total, page, totalPages: Math.ceil(total / limit) });
});

router.delete("/admin/earlybird/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid ID" });
    return;
  }

  const [entry] = await db.delete(earlyBirdTable).where(eq(earlyBirdTable.id, id)).returning();
  if (!entry) {
    res.status(404).json({ error: "Entry not found" });
    return;
  }
  res.sendStatus(204);
});

router.get("/admin/earlybird/export", async (_req, res): Promise<void> => {
  const entries = await db.select().from(earlyBirdTable).orderBy(desc(earlyBirdTable.createdAt));
  const csv = ["Name,Email,Signup Date"]
    .concat(entries.map(e => `"${e.name || ""}","${e.email}","${e.createdAt.toISOString()}"`))
    .join("\n");
  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", "attachment; filename=earlybird.csv");
  res.send(csv);
});

router.get("/admin/settings", async (_req, res): Promise<void> => {
  const settings = await db.select().from(siteSettingsTable);
  const settingsObj: Record<string, string> = {};
  settings.forEach(s => { settingsObj[s.key] = s.value || ""; });
  res.json({
    tagline: settingsObj.tagline || "Who Are You? — The only question that has ever really mattered.",
    appDownloadUrl: settingsObj.appDownloadUrl || "",
    twitterUrl: settingsObj.twitterUrl || "",
    linkedinUrl: settingsObj.linkedinUrl || "",
    githubUrl: settingsObj.githubUrl || "",
    founderPhotoUrl: settingsObj.founderPhotoUrl || "",
    bookCoverUrl: settingsObj.bookCoverUrl || "",
  });
});

router.patch("/admin/settings", async (req, res): Promise<void> => {
  const parsed = UpdateSettingsBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const entries = Object.entries(parsed.data).filter(([_, v]) => v !== undefined);
  for (const [key, value] of entries) {
    await db
      .insert(siteSettingsTable)
      .values({ key, value: value as string })
      .onConflictDoUpdate({ target: siteSettingsTable.key, set: { value: value as string } });
  }

  const settings = await db.select().from(siteSettingsTable);
  const settingsObj: Record<string, string> = {};
  settings.forEach(s => { settingsObj[s.key] = s.value || ""; });
  res.json({
    tagline: settingsObj.tagline || "Who Are You? — The only question that has ever really mattered.",
    appDownloadUrl: settingsObj.appDownloadUrl || "",
    twitterUrl: settingsObj.twitterUrl || "",
    linkedinUrl: settingsObj.linkedinUrl || "",
    githubUrl: settingsObj.githubUrl || "",
    founderPhotoUrl: settingsObj.founderPhotoUrl || "",
    bookCoverUrl: settingsObj.bookCoverUrl || "",
  });
});

router.post("/admin/change-password", async (req, res): Promise<void> => {
  const parsed = ChangeAdminPasswordBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request" });
    return;
  }

  const userId = req.user!.userId;
  const [user] = await db.select().from(adminUsersTable).where(eq(adminUsersTable.id, userId));
  if (!user) {
    res.status(400).json({ error: "User not found" });
    return;
  }

  const valid = await bcrypt.compare(parsed.data.currentPassword, user.passwordHash);
  if (!valid) {
    res.status(400).json({ error: "Current password is incorrect" });
    return;
  }

  const newHash = await bcrypt.hash(parsed.data.newPassword, 12);
  await db.update(adminUsersTable).set({ passwordHash: newHash }).where(eq(adminUsersTable.id, userId));
  res.json({ message: "Password changed successfully" });
});

router.get("/admin/media", async (req, res): Promise<void> => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const offset = (page - 1) * limit;

  const [items, countResult] = await Promise.all([
    db.select().from(mediaTable).orderBy(desc(mediaTable.createdAt)).limit(limit).offset(offset),
    db.select({ count: sql<number>`count(*)::int` }).from(mediaTable),
  ]);

  res.json({
    items,
    total: countResult[0]?.count || 0,
    page,
    totalPages: Math.ceil((countResult[0]?.count || 0) / limit),
  });
});

router.post("/admin/media", async (req, res): Promise<void> => {
  const { filename, objectPath, contentType, size, alt } = req.body;
  if (!filename || !objectPath || !contentType || !size) {
    res.status(400).json({ error: "Missing required fields" });
    return;
  }

  const [media] = await db.insert(mediaTable).values({
    filename,
    objectPath,
    contentType,
    size,
    alt: alt || null,
  }).returning();

  res.json(media);
});

router.delete("/admin/media/:id", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id);
  const [media] = await db.select().from(mediaTable).where(eq(mediaTable.id, id));
  if (!media) {
    res.status(404).json({ error: "Media not found" });
    return;
  }

  await db.delete(mediaTable).where(eq(mediaTable.id, id));
  res.json({ message: "Media deleted" });
});

export default router;
