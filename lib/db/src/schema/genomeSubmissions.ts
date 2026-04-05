import { pgTable, text, serial, integer, timestamp, json, boolean, index } from 'drizzle-orm/pg-core';

export const genomeSubmissions = pgTable('genome_submissions', {
  id:               serial('id').primaryKey(),
  anonymousKey:     text('anonymous_key').notNull().unique(),
  dnaString:        text('dna_string').notNull(),
  demographicPrefix: text('demographic_prefix'),
  century:          integer('century'),
  birthYear:        integer('birth_year'),
  birthMonth:       integer('birth_month'),
  birthDay:         integer('birth_day'),
  gender:           text('gender'),
  countryCode:      text('country_code'),
  zipCode:          text('zip_code'),
  beliefValues:     json('belief_values').$type<Record<string, number | null>>(),
  dimensionsExplored: integer('dimensions_explored').default(0),
  isTestData:       boolean('is_test_data').default(false).notNull(),
  submittedAt:      timestamp('submitted_at').defaultNow().notNull(),
  updatedAt:        timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
  index('idx_gs_is_test_data').on(table.isTestData),
  index('idx_gs_country_code').on(table.countryCode),
  index('idx_gs_gender').on(table.gender),
  index('idx_gs_birth_year').on(table.birthYear),
  index('idx_gs_submitted_at').on(table.submittedAt),
]);
