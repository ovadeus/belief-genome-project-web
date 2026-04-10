import { pgTable, serial, varchar, timestamp, text, integer, index } from "drizzle-orm/pg-core";

export const pageViewsTable = pgTable("page_views", {
  id: serial("id").primaryKey(),
  path: varchar("path", { length: 512 }).notNull(),
  referrer: text("referrer"),
  userAgent: text("user_agent"),
  country: varchar("country", { length: 2 }),
  sessionId: varchar("session_id", { length: 64 }),
  screenWidth: integer("screen_width"),
  viewedAt: timestamp("viewed_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index("idx_page_views_path").on(table.path),
  index("idx_page_views_viewed_at").on(table.viewedAt),
  index("idx_page_views_session_path").on(table.sessionId, table.path),
]);

export type PageView = typeof pageViewsTable.$inferSelect;
