import { pgTable, text, varchar } from "drizzle-orm/pg-core";

export const siteSettingsTable = pgTable("site_settings", {
  key: varchar("key", { length: 100 }).primaryKey(),
  value: text("value"),
});

export type SiteSetting = typeof siteSettingsTable.$inferSelect;
