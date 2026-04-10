import { Router, type IRouter } from "express";
import { sql, desc, eq, gte, and, count } from "drizzle-orm";
import { db, pageViewsTable } from "@workspace/db";
import { requireAuth } from "../middlewares/auth";

const router: IRouter = Router();

router.post("/analytics/pageview", async (req, res): Promise<void> => {
  try {
    const { path, referrer, sessionId, screenWidth } = req.body;
    if (!path || typeof path !== "string") {
      res.status(400).json({ error: "path is required" });
      return;
    }

    const ua = req.headers["user-agent"] ?? null;

    await db.insert(pageViewsTable).values({
      path: path.slice(0, 512),
      referrer: referrer?.slice(0, 2048) || null,
      userAgent: ua?.slice(0, 2048) || null,
      sessionId: sessionId?.slice(0, 64) || null,
      screenWidth: screenWidth ? Number(screenWidth) : null,
    });

    res.json({ ok: true });
  } catch (e) {
    console.error("Analytics record error:", e);
    res.json({ ok: true });
  }
});

router.get("/admin/analytics", requireAuth as any, async (req, res): Promise<void> => {
  try {
    const days = Math.min(Number(req.query.days) || 30, 365);
    const since = new Date(Date.now() - days * 86400000);

    const [totalViews] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(pageViewsTable)
      .where(gte(pageViewsTable.viewedAt, since));

    const [uniqueSessions] = await db
      .select({ count: sql<number>`count(distinct ${pageViewsTable.sessionId})::int` })
      .from(pageViewsTable)
      .where(and(gte(pageViewsTable.viewedAt, since), sql`${pageViewsTable.sessionId} is not null`));

    const viewsByDay = await db
      .select({
        date: sql<string>`to_char(${pageViewsTable.viewedAt}, 'YYYY-MM-DD')`.as("date"),
        views: sql<number>`count(*)::int`.as("views"),
        visitors: sql<number>`count(distinct ${pageViewsTable.sessionId})::int`.as("visitors"),
      })
      .from(pageViewsTable)
      .where(gte(pageViewsTable.viewedAt, since))
      .groupBy(sql`to_char(${pageViewsTable.viewedAt}, 'YYYY-MM-DD')`)
      .orderBy(sql`to_char(${pageViewsTable.viewedAt}, 'YYYY-MM-DD')`);

    const topPages = await db
      .select({
        path: pageViewsTable.path,
        views: sql<number>`count(*)::int`.as("views"),
        visitors: sql<number>`count(distinct ${pageViewsTable.sessionId})::int`.as("visitors"),
      })
      .from(pageViewsTable)
      .where(gte(pageViewsTable.viewedAt, since))
      .groupBy(pageViewsTable.path)
      .orderBy(desc(sql`count(*)`))
      .limit(20);

    const topReferrers = await db
      .select({
        referrer: pageViewsTable.referrer,
        views: sql<number>`count(*)::int`.as("views"),
      })
      .from(pageViewsTable)
      .where(and(
        gte(pageViewsTable.viewedAt, since),
        sql`${pageViewsTable.referrer} is not null`,
        sql`${pageViewsTable.referrer} != ''`
      ))
      .groupBy(pageViewsTable.referrer)
      .orderBy(desc(sql`count(*)`))
      .limit(10);

    const deviceBreakdown = await db
      .select({
        device: sql<string>`
          case
            when ${pageViewsTable.screenWidth} < 768 then 'Mobile'
            when ${pageViewsTable.screenWidth} < 1024 then 'Tablet'
            else 'Desktop'
          end`.as("device"),
        views: sql<number>`count(*)::int`.as("views"),
      })
      .from(pageViewsTable)
      .where(and(
        gte(pageViewsTable.viewedAt, since),
        sql`${pageViewsTable.screenWidth} is not null`
      ))
      .groupBy(sql`case
            when ${pageViewsTable.screenWidth} < 768 then 'Mobile'
            when ${pageViewsTable.screenWidth} < 1024 then 'Tablet'
            else 'Desktop'
          end`)
      .orderBy(desc(sql`count(*)`));

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const [todayViews] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(pageViewsTable)
      .where(gte(pageViewsTable.viewedAt, todayStart));

    const [todayVisitors] = await db
      .select({ count: sql<number>`count(distinct ${pageViewsTable.sessionId})::int` })
      .from(pageViewsTable)
      .where(and(gte(pageViewsTable.viewedAt, todayStart), sql`${pageViewsTable.sessionId} is not null`));

    res.json({
      days,
      totalViews: totalViews?.count ?? 0,
      uniqueVisitors: uniqueSessions?.count ?? 0,
      todayViews: todayViews?.count ?? 0,
      todayVisitors: todayVisitors?.count ?? 0,
      viewsByDay,
      topPages,
      topReferrers,
      deviceBreakdown,
    });
  } catch (e) {
    console.error("Analytics query error:", e);
    res.status(500).json({ error: "Failed to fetch analytics" });
  }
});

export default router;
