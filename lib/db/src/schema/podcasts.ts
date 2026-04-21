import { pgTable, text, serial, integer, timestamp, varchar, uniqueIndex, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

// ────────────────────────────────────────────────────────────────────────────
// Episodes — one row per published or drafted podcast episode.
// Audio + cover image are stored in object storage; we keep the object paths.
// ────────────────────────────────────────────────────────────────────────────
export const podcastEpisodesTable = pgTable("podcast_episodes", {
  id: serial("id").primaryKey(),
  slug: varchar("slug", { length: 255 }).unique().notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  audioObjectPath: varchar("audio_object_path", { length: 500 }),
  audioFileName: varchar("audio_file_name", { length: 255 }),
  audioMimeType: varchar("audio_mime_type", { length: 100 }),
  audioBytes: integer("audio_bytes"),
  durationSec: integer("duration_sec"),
  coverImagePath: varchar("cover_image_path", { length: 500 }),
  tags: text("tags").array().default([]),
  status: varchar("status", { length: 20 }).notNull().default("draft"),  // draft | published
  publishedAt: timestamp("published_at", { withTimezone: true }),
  listenCount: integer("listen_count").notNull().default(0),
  downloadCount: integer("download_count").notNull().default(0),
  likeCount: integer("like_count").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

// ────────────────────────────────────────────────────────────────────────────
// Likes — one per (episode, ip-hash). Toggle endpoint inserts/deletes.
// ────────────────────────────────────────────────────────────────────────────
export const podcastLikesTable = pgTable("podcast_likes", {
  id: serial("id").primaryKey(),
  episodeId: integer("episode_id").notNull().references(() => podcastEpisodesTable.id, { onDelete: "cascade" }),
  ipHash: varchar("ip_hash", { length: 64 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => ({
  uniqEpIp: uniqueIndex("podcast_likes_ep_ip").on(t.episodeId, t.ipHash),
}));

// ────────────────────────────────────────────────────────────────────────────
// Listens — one row per play attempt. Used for analytics; the episodes
// table's denormalised listenCount is the cheap aggregate. We rate-limit
// inserts to one row per (episode, ip) per 5 min to avoid replay inflation.
// ────────────────────────────────────────────────────────────────────────────
export const podcastListensTable = pgTable("podcast_listens", {
  id: serial("id").primaryKey(),
  episodeId: integer("episode_id").notNull().references(() => podcastEpisodesTable.id, { onDelete: "cascade" }),
  ipHash: varchar("ip_hash", { length: 64 }),
  kind: varchar("kind", { length: 20 }).notNull().default("listen"),  // listen | download
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => ({
  byEpisode: index("podcast_listens_episode").on(t.episodeId),
  byCreated: index("podcast_listens_created").on(t.createdAt),
}));

// ────────────────────────────────────────────────────────────────────────────
// Comments — spam-proof public comments.
//   status: approved | pending | spam
//   ipHash: stored for rate limiting + admin moderation only (never exposed)
//   honeypot tripped → status="spam" silently
// ────────────────────────────────────────────────────────────────────────────
export const podcastCommentsTable = pgTable("podcast_comments", {
  id: serial("id").primaryKey(),
  episodeId: integer("episode_id").notNull().references(() => podcastEpisodesTable.id, { onDelete: "cascade" }),
  authorName: varchar("author_name", { length: 80 }).notNull(),
  body: text("body").notNull(),
  ipHash: varchar("ip_hash", { length: 64 }).notNull(),
  status: varchar("status", { length: 20 }).notNull().default("approved"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => ({
  byEpisode: index("podcast_comments_episode").on(t.episodeId),
}));

export const insertPodcastEpisodeSchema = createInsertSchema(podcastEpisodesTable).omit({
  id: true, createdAt: true, updatedAt: true, listenCount: true, downloadCount: true, likeCount: true,
});
export type InsertPodcastEpisode = z.infer<typeof insertPodcastEpisodeSchema>;
export type PodcastEpisode = typeof podcastEpisodesTable.$inferSelect;
export type PodcastComment = typeof podcastCommentsTable.$inferSelect;
