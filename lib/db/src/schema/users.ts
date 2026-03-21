// Belief Genome users — separate from admin auth
// Add to lib/db/src/schema/ alongside blog.ts, subscribers.ts, etc.

import { pgTable, text, serial, integer, real, boolean, timestamp, json, uniqueIndex } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id:           serial('id').primaryKey(),
  email:        text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  name:         text('name').notNull(),
  birthYear:    integer('birth_year'),
  birthMonth:   integer('birth_month'),
  birthDay:     integer('birth_day'),
  sex:          text('sex').default('5'),
  countryCode:  text('country_code'),
  zipCode:      text('zip_code').default('00000'),
  createdAt:    timestamp('created_at').defaultNow().notNull(),
});

export const beliefResponses = pgTable('belief_responses', {
  id:               serial('id').primaryKey(),
  userId:           integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  probeText:        text('probe_text').notNull(),
  probeCategory:    text('probe_category').notNull(),
  probeSource:      text('probe_source').notNull().default('bank'),
  dimensionWeights: json('dimension_weights').notNull(),
  primaryDim:       integer('primary_dim'),
  quality:          json('quality'),
  value:            real('value').notNull(),
  confidence:       integer('confidence').default(50),
  note:             text('note'),
  createdAt:        timestamp('created_at').defaultNow().notNull(),
});

export const probes = pgTable('probes', {
  id:               serial('id').primaryKey(),
  userId:           integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  statement:        text('statement').notNull(),
  category:         text('category').notNull(),
  source:           text('source').notNull().default('bank'),
  dimensionWeights: json('dimension_weights').notNull(),
  quality:          json('quality').notNull(),
  delivered:        boolean('delivered').default(false),
  deliveredAt:      timestamp('delivered_at'),
  createdAt:        timestamp('created_at').defaultNow().notNull(),
});

export const dimensionScores = pgTable('dimension_scores', {
  id:          serial('id').primaryKey(),
  userId:      integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  dimensionId: integer('dimension_id').notNull(),
  weightedSum: real('weighted_sum').default(0).notNull(),
  totalWeight: real('total_weight').default(0).notNull(),
  count:       integer('count').default(0).notNull(),
  lastUpdated: timestamp('last_updated').defaultNow().notNull(),
}, (table) => [
  uniqueIndex('user_dim_idx').on(table.userId, table.dimensionId),
]);

export const dnaSnapshots = pgTable('dna_snapshots', {
  id:         serial('id').primaryKey(),
  userId:     integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  dnaString:  text('dna_string').notNull(),
  snapshotAt: timestamp('snapshot_at').defaultNow().notNull(),
});
