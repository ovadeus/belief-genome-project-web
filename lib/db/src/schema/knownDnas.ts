import { pgTable, serial, integer, varchar, timestamp, uniqueIndex, index } from 'drizzle-orm/pg-core';
import { users } from './users';

/**
 * A user's per-account library of imported / shared DNA signatures.
 *
 * Privacy invariants enforced server-side:
 *   - Composite unique on (user_id, signature) — server upserts on conflict
 *   - All read/write routes check user_id === req.user.id; one user can never
 *     list or delete another user's library entries
 *   - The signature column stores the engine-encoded string verbatim
 *     (a:... or s:...). Demographics for anonymous entries are PHYSICALLY
 *     absent from the signature itself — there is no separate demographic
 *     column on this table by design.
 */
export const knownDnas = pgTable('known_dnas', {
  id:             serial('id').primaryKey(),
  userId:         integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  signature:      varchar('signature', { length: 200 }).notNull(),
  format:         varchar('format', { length: 16 }).notNull(),  // 'anonymous' | 'signed'
  shareableName:  varchar('shareable_name', { length: 80 }),
  note:           varchar('note', { length: 500 }),
  exportedAt:     timestamp('exported_at'),
  exportedFrom:   varchar('exported_from', { length: 32 }),     // 'desktop' | 'web' | 'mobile' | …
  source:         varchar('source', { length: 16 }).notNull(),  // 'file' | 'paste' | 'url'
  importedAt:     timestamp('imported_at').defaultNow().notNull(),
}, (table) => [
  uniqueIndex('known_dnas_user_sig_idx').on(table.userId, table.signature),
  index('known_dnas_user_imported_idx').on(table.userId, table.importedAt),
]);
