import { Router, type IRouter, type Request } from "express";
import { eq, desc, sql, ilike, and, ne, arrayContains, or } from "drizzle-orm";
import jwt from "jsonwebtoken";
import { db, blogPostsTable } from "@workspace/db";
import {
  ListBlogPostsQueryParams,
  ListBlogPostsResponse,
  GetBlogPostParams,
  GetBlogPostResponse,
  GetRelatedPostsParams,
} from "@workspace/api-zod";

const ADMIN_JWT_SECRET = process.env.JWT_SECRET || "whoo-ru-secret-key-change-in-production";
const GENOME_JWT_SECRET = process.env.GENOME_JWT_SECRET || process.env.JWT_SECRET || "";

function isAuthenticated(req: Request): boolean {
  const adminToken = req.cookies?.token;
  if (adminToken) {
    try {
      jwt.verify(adminToken, ADMIN_JWT_SECRET);
      return true;
    } catch {}
  }

  const genomeToken = req.headers.authorization?.replace("Bearer ", "") || req.cookies?.genome_token;
  if (genomeToken) {
    try {
      jwt.verify(genomeToken, GENOME_JWT_SECRET);
      return true;
    } catch {}
  }

  return false;
}

const router: IRouter = Router();

router.get("/blog", async (req, res): Promise<void> => {
  const params = ListBlogPostsQueryParams.safeParse(req.query);
  const page = params.success ? params.data.page ?? 1 : 1;
  const limit = params.success ? params.data.limit ?? 10 : 10;
  const hashtag = params.success ? params.data.hashtag : undefined;
  const search = params.success ? params.data.search : undefined;
  const offset = (page - 1) * limit;

  const authed = isAuthenticated(req);

  const conditions = [eq(blogPostsTable.status, "published")];
  if (!authed) {
    conditions.push(eq(blogPostsTable.isPrivate, false));
  }
  if (hashtag) {
    conditions.push(arrayContains(blogPostsTable.hashtags, [hashtag]));
  }
  if (search) {
    conditions.push(
      sql`(${blogPostsTable.title} ILIKE ${'%' + search + '%'} OR ${blogPostsTable.body} ILIKE ${'%' + search + '%'})`
    );
  }

  const whereClause = and(...conditions);

  const [countResult] = await db.select({ count: sql<number>`count(*)::int` }).from(blogPostsTable).where(whereClause);
  const total = countResult?.count ?? 0;

  const posts = await db
    .select()
    .from(blogPostsTable)
    .where(whereClause)
    .orderBy(desc(blogPostsTable.publishedAt))
    .limit(limit)
    .offset(offset);

  const response = ListBlogPostsResponse.parse({
    posts: posts.map(p => ({
      ...p,
      hashtags: p.hashtags ?? [],
    })),
    total,
    page,
    totalPages: Math.ceil(total / limit),
  });
  res.json(response);
});

router.get("/blog/:slug", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.slug) ? req.params.slug[0] : req.params.slug;
  const [post] = await db.select().from(blogPostsTable).where(eq(blogPostsTable.slug, raw));
  if (!post || post.status !== "published") {
    res.status(404).json({ error: "Post not found" });
    return;
  }

  if (post.isPrivate && !isAuthenticated(req)) {
    res.status(404).json({ error: "Post not found" });
    return;
  }

  res.json(GetBlogPostResponse.parse({ ...post, hashtags: post.hashtags ?? [] }));
});

router.get("/blog/:slug/related", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.slug) ? req.params.slug[0] : req.params.slug;
  const [post] = await db.select().from(blogPostsTable).where(eq(blogPostsTable.slug, raw));
  if (!post) {
    res.json([]);
    return;
  }

  const authed = isAuthenticated(req);

  let related = [];
  if (post.hashtags && post.hashtags.length > 0) {
    const relatedConditions = [
      eq(blogPostsTable.status, "published"),
      ne(blogPostsTable.id, post.id),
      sql`${blogPostsTable.hashtags} && ${sql.raw(`ARRAY[${post.hashtags.map(t => `'${t.replace(/'/g, "''")}'`).join(",")}]::text[]`)}`,
    ];
    if (!authed) {
      relatedConditions.push(eq(blogPostsTable.isPrivate, false));
    }

    related = await db
      .select()
      .from(blogPostsTable)
      .where(and(...relatedConditions))
      .orderBy(desc(blogPostsTable.publishedAt))
      .limit(3);
  }

  res.json(related.map(p => ({ ...p, hashtags: p.hashtags ?? [] })));
});

export default router;
