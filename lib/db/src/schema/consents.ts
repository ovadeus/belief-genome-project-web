import { pgTable, serial, timestamp, varchar, uniqueIndex, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const consentAgreementsTable = pgTable(
  "consent_agreements",
  {
    id: serial("id").primaryKey(),
    email: varchar("email", { length: 255 }).notNull(),
    status: varchar("status", { length: 20 }).notNull().default("Agreed"),
    source: varchar("source", { length: 32 }),
    ipHash: varchar("ip_hash", { length: 128 }),
    userAgent: varchar("user_agent", { length: 512 }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    emailUnique: uniqueIndex("consent_agreements_email_unique").on(t.email),
    createdAtIdx: index("consent_agreements_created_at_idx").on(t.createdAt),
  }),
);

export const insertConsentAgreementSchema = createInsertSchema(consentAgreementsTable).omit({ id: true, createdAt: true, status: true });
export type InsertConsentAgreement = z.infer<typeof insertConsentAgreementSchema>;
export type ConsentAgreement = typeof consentAgreementsTable.$inferSelect;
