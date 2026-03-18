import { pgTable, serial, timestamp, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const earlyBirdTable = pgTable("early_bird", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 255 }).unique().notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertEarlyBirdSchema = createInsertSchema(earlyBirdTable).omit({ id: true, createdAt: true });
export type InsertEarlyBird = z.infer<typeof insertEarlyBirdSchema>;
export type EarlyBird = typeof earlyBirdTable.$inferSelect;
