import { Router, type IRouter } from "express";
import { eq, desc, sql, ilike, and, ne, arrayContains } from "drizzle-orm";
import { db, blogPostsTable } from "@workspace/db";
import {
  ListBlogPostsQueryParams,
  ListBlogPostsResponse,
  GetBlogPostParams,
  GetBlogPostResponse,
  GetRelatedPostsParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/blog", async (req, res): Promise<void> => {
  const params = ListBlogPostsQueryParams.safeParse(req.query);
  const page = params.success ? params.data.page ?? 1 : 1;
  const limit = params.success ? params.data.limit ?? 10 : 10;
  const hashtag = params.success ? params.data.hashtag : undefined;
  const search = params.success ? params.data.search : undefined;
  const offset = (page - 1) * limit;

  const conditions = [eq(blogPostsTable.status, "published")];
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
  res.json(GetBlogPostResponse.parse({ ...post, hashtags: post.hashtags ?? [] }));
});

router.get("/blog/:slug/related", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.slug) ? req.params.slug[0] : req.params.slug;
  const [post] = await db.select().from(blogPostsTable).where(eq(blogPostsTable.slug, raw));
  if (!post) {
    res.json([]);
    return;
  }

  let related = [];
  if (post.hashtags && post.hashtags.length > 0) {
    related = await db
      .select()
      .from(blogPostsTable)
      .where(
        and(
          eq(blogPostsTable.status, "published"),
          ne(blogPostsTable.id, post.id),
          sql`${blogPostsTable.hashtags} && ${sql.raw(`ARRAY[${post.hashtags.map(t => `'${t.replace(/'/g, "''")}'`).join(",")}]::text[]`)}`
        )
      )
      .orderBy(desc(blogPostsTable.publishedAt))
      .limit(3);
  }

  res.json(related.map(p => ({ ...p, hashtags: p.hashtags ?? [] })));
});

export default router;
