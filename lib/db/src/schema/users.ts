// Belief Genome users — separate from admin auth
// Add to lib/db/src/schema/ alongside blog.ts, subscribers.ts, etc.

import { pgTable, text, serial, integer, real, boolean, timestamp, json, jsonb, uniqueIndex, index } from 'drizzle-orm/pg-core';

// Narrow V2 framing-pair metadata persisted on probes (queue) + belief_responses.
// Mirrors the desktop's `probeV2` shape — see lib/belief-engine/src/probeBankV2.ts
// for the canonical definition. Nullable: rows that pre-date V2 or originated
// from a non-V2 source (legacy bank, news feed) carry null and contribute to
// amplitude only — phase recovery skips them, which is correct per spec.
type ProbeV2Persisted = {
  id: string;
  primary_dim: number;
  pair_id: string;
  orientation: 'canonical' | 'inverted';
  expected_loading: number;
  pair_partner_id: string;
};

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
  clientId:         text('client_id'),  // idempotency key from external clients (desktop bulk-import)
  probeText:        text('probe_text').notNull(),
  probeCategory:    text('probe_category').notNull(),
  probeSource:      text('probe_source').notNull().default('bank'),
  dimensionWeights: json('dimension_weights').notNull(),
  primaryDim:       integer('primary_dim'),
  quality:          json('quality'),
  // Frontiers schemaVersion 2: substantive belief value on 1–9 (midpoint 5
  // = superposition). NULL when the row is a non-substantive non-response
  // (skipped == true). Persisted as the original 0–1 normalized form here;
  // the 1–9 mapping is applied by the engine.
  value:            real('value'),
  confidence:       integer('confidence').default(50),
  note:             text('note'),
  // V2 framing-pair metadata. Populated when this response was elicited by
  // a probe from probeBankV2.json. Required for phase-residual coherence
  // recovery; rows with null contribute to amplitude only (correct per spec).
  probeV2:          jsonb('probe_v2').$type<ProbeV2Persisted | null>(),
  // Frontiers schemaVersion 2: which member of a framing pair was administered
  // first to this respondent. 1 = first-administered (canonical or inverted),
  // 2 = second-administered (the partner). NULL when the probe has no V2
  // metadata. Required for QQ-equality stratification.
  pairPosition:     integer('pair_position'),
  // Frontiers schemaVersion 2: non-substantive non-response flag. When true,
  // the row is preserved (so we know the probe was shown) but excluded from
  // qubit reconstruction, lineage, and QQ-equality analyses. value is NULL
  // for skipped rows.
  skipped:          boolean('skipped').default(false).notNull(),
  createdAt:        timestamp('created_at').defaultNow().notNull(),
}, (table) => [
  uniqueIndex('belief_responses_user_client_idx').on(table.userId, table.clientId),
]);

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
  // V2 framing-pair metadata captured at queue time so it can be propagated
  // to the matching belief_responses row when the user answers. Null for
  // probes from the legacy bank or news feed.
  probeV2:          jsonb('probe_v2').$type<ProbeV2Persisted | null>(),
  createdAt:        timestamp('created_at').defaultNow().notNull(),
});

export const dimensionScores = pgTable('dimension_scores', {
  id:          serial('id').primaryKey(),
  userId:      integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  dimensionId: integer('dimension_id').notNull(),
  weightedSum: real('weighted_sum').default(0).notNull(),
  totalWeight: real('total_weight').default(0).notNull(),
  // sumSquares: Σ(directed_value^2 × effective_weight). Used to derive
  // the per-dimension coherence letter (A–E) for V2 DNA signatures via
  // weighted population variance: var = sumSquares/totalWeight − (sum/totalWeight)^2.
  // Default 0 means "not yet measured" — calcCoherence treats variance ≤ 0
  // as null (emits `·`) so stale rows never claim spurious settledness.
  // Back-filled by scripts/backfill-sum-squares.ts (one-time, idempotent).
  sumSquares:  real('sum_squares').default(0).notNull(),
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

// Belief Lineage — provenance record. For every response × dimension touched,
// captures the score & confidence before/after, so users can trace exactly
// which past responses moved a given dimension's position.
export const beliefLineage = pgTable('belief_lineage', {
  id:               serial('id').primaryKey(),
  userId:           integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  responseId:       integer('response_id').notNull().references(() => beliefResponses.id, { onDelete: 'cascade' }),
  dimensionId:      integer('dimension_id').notNull(),
  // Raw 0-9 averages (before may be null when this was the first response touching the dimension).
  scoreBefore:      real('score_before'),
  scoreAfter:       real('score_after').notNull(),
  // delta = scoreAfter - (scoreBefore ?? 4.5 neutral). Sortable by ABS for "top contributors".
  delta:            real('delta').notNull(),
  confidenceBefore: integer('confidence_before').default(0).notNull(),
  confidenceAfter:  integer('confidence_after').default(0).notNull(),
  createdAt:        timestamp('created_at').defaultNow().notNull(),
}, (table) => [
  // Per-user-per-dim lookup, ordered by time (top-contributors and timeline both pivot on this).
  index('belief_lineage_user_dim_idx').on(table.userId, table.dimensionId, table.createdAt),
  // Idempotency lookup for backfill: skip responses that already have lineage rows.
  index('belief_lineage_response_idx').on(table.responseId),
  // Hard guarantee that no (response, dim) pair is double-recorded.
  uniqueIndex('belief_lineage_response_dim_idx').on(table.responseId, table.dimensionId),
]);
