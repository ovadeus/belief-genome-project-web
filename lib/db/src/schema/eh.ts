import {
  pgTable,
  serial,
  integer,
  text,
  timestamp,
  jsonb,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";

export const ehOrgs = pgTable(
  "eh_orgs",
  {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    plan: text("plan").notNull().default("free"),
    stripeCustomerId: text("stripe_customer_id"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [uniqueIndex("eh_orgs_slug_idx").on(t.slug)],
);

export const ehUsers = pgTable(
  "eh_users",
  {
    id: serial("id").primaryKey(),
    orgId: integer("org_id")
      .notNull()
      .references(() => ehOrgs.id, { onDelete: "cascade" }),
    email: text("email").notNull(),
    passwordHash: text("password_hash").notNull(),
    role: text("role").notNull().default("owner"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
  },
  (t) => [
    uniqueIndex("eh_users_email_idx").on(t.email),
    index("eh_users_org_idx").on(t.orgId),
  ],
);

export const ehSubscriptions = pgTable(
  "eh_subscriptions",
  {
    id: serial("id").primaryKey(),
    orgId: integer("org_id")
      .notNull()
      .references(() => ehOrgs.id, { onDelete: "cascade" }),
    stripeSubscriptionId: text("stripe_subscription_id"),
    plan: text("plan").notNull(),
    status: text("status").notNull(),
    currentPeriodEnd: timestamp("current_period_end", { withTimezone: true }),
    responseCap: integer("response_cap").notNull().default(0),
    harvesterCap: integer("harvester_cap").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    uniqueIndex("eh_subscriptions_org_idx").on(t.orgId),
    index("eh_subscriptions_stripe_idx").on(t.stripeSubscriptionId),
  ],
);

export const ehAuditLog = pgTable(
  "eh_audit_log",
  {
    id: serial("id").primaryKey(),
    orgId: integer("org_id")
      .notNull()
      .references(() => ehOrgs.id, { onDelete: "cascade" }),
    userId: integer("user_id").references(() => ehUsers.id, { onDelete: "set null" }),
    action: text("action").notNull(),
    targetType: text("target_type"),
    targetId: text("target_id"),
    metadata: jsonb("metadata"),
    occurredAt: timestamp("occurred_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    index("eh_audit_org_time_idx").on(t.orgId, t.occurredAt),
    index("eh_audit_action_idx").on(t.action),
  ],
);

export type EhOrg = typeof ehOrgs.$inferSelect;
export type EhUser = typeof ehUsers.$inferSelect;
export type EhSubscription = typeof ehSubscriptions.$inferSelect;
export type EhAuditLogEntry = typeof ehAuditLog.$inferSelect;
