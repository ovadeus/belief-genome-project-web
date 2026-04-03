import { pgTable, text, serial, integer, timestamp, json } from 'drizzle-orm/pg-core';

export const genomeAnalyses = pgTable('genome_analyses', {
  id:            serial('id').primaryKey(),
  userId:        integer('user_id').notNull(),
  analysisText:  text('analysis_text').notNull(),
  tags:          json('tags').$type<string[]>().notNull(),
  generatedAt:   timestamp('generated_at').defaultNow().notNull(),
});
