import { pgTable, serial, varchar, timestamp, index } from 'drizzle-orm/pg-core';

/**
 * Lightweight, privacy-respecting analytics for DNA share links.
 *
 * `kind` accepts the strings: 'view' (someone loaded a /dna/:signature page)
 * and 'share_click' (someone clicked the Share-to-X button on /dna). Extend
 * additively — never repurpose existing values.
 *
 * `ipHash` is sha256(ip + IP_HASH_SALT) truncated to 64 hex chars.
 * The salt is server-side and rotated quarterly so hashes are non-reversible.
 */
export const dnaShareEvents = pgTable('dna_share_events', {
  id:        serial('id').primaryKey(),
  signature: varchar('signature', { length: 200 }).notNull(),
  kind:      varchar('kind', { length: 20 }).notNull(), // 'view' | 'share_click'
  utmSource: varchar('utm_source', { length: 64 }),
  utmMedium: varchar('utm_medium', { length: 64 }),
  utmCampaign: varchar('utm_campaign', { length: 64 }),
  ipHash:    varchar('ip_hash', { length: 64 }),
  ts:        timestamp('ts').defaultNow().notNull(),
}, (table) => [
  index('idx_dse_signature').on(table.signature),
  index('idx_dse_kind').on(table.kind),
  index('idx_dse_ts').on(table.ts),
]);
