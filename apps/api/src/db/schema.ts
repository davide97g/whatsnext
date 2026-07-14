import { sql } from "drizzle-orm";
import {
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const itemTypeEnum = pgEnum("item_type", ["video", "live"]);

/** Board columns, ordered left → right for display. */
export const itemStatusEnum = pgEnum("item_status", [
  "idea",
  "planned",
  "in_progress",
  "scheduled",
  "published",
  "live",
  "done",
]);

export const itemSourceEnum = pgEnum("item_source", ["manual", "youtube"]);

export const roadmapItems = pgTable(
  "roadmap_items",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    type: itemTypeEnum("type").notNull().default("video"),
    status: itemStatusEnum("status").notNull().default("planned"),
    title: text("title").notNull(),
    description: text("description"),
    thumbnailUrl: text("thumbnail_url"),
    youtubeVideoId: text("youtube_video_id").unique(),
    youtubeUrl: text("youtube_url"),
    scheduledAt: timestamp("scheduled_at", { withTimezone: true }),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    source: itemSourceEnum("source").notNull().default("manual"),
    position: integer("position").notNull().default(0),
    tags: text("tags")
      .array()
      .notNull()
      .default(sql`'{}'::text[]`),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("roadmap_items_status_idx").on(t.status),
    index("roadmap_items_type_idx").on(t.type),
    index("roadmap_items_scheduled_at_idx").on(t.scheduledAt),
  ],
);

export type RoadmapItem = typeof roadmapItems.$inferSelect;
export type NewRoadmapItem = typeof roadmapItems.$inferInsert;
