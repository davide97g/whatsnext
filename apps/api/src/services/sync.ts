import { eq, inArray } from "drizzle-orm";
import { db } from "../db/index.ts";
import { roadmapItems, type RoadmapItem } from "../db/schema.ts";
import { env } from "../lib/env.ts";
import { notifyNewItems } from "./notifier.ts";
import { fetchYouTubeItems, type SyncedItem } from "./youtube.ts";

export interface SyncResult {
  created: number;
  updated: number;
  skipped: number;
  createdItems: RoadmapItem[];
}

/**
 * Fetches from YouTube and upserts by `youtube_video_id`.
 * Only ever touches `source='youtube'` rows — manually curated items are never modified.
 * When NOTIFY_ON_SYNC is enabled, newly created items fire a Discord notification.
 */
export async function runYouTubeSync(): Promise<SyncResult> {
  if (!env.YOUTUBE_API_KEY || !env.YOUTUBE_CHANNEL_ID) {
    throw new Error("YouTube sync not configured: set YOUTUBE_API_KEY and YOUTUBE_CHANNEL_ID");
  }

  const fetched = await fetchYouTubeItems(env.YOUTUBE_CHANNEL_ID, env.YOUTUBE_API_KEY);
  // De-dupe by videoId within this batch (uploads + lives can't overlap, but be safe).
  const byId = new Map<string, SyncedItem>();
  for (const item of fetched) byId.set(item.youtubeVideoId, item);
  const items = [...byId.values()];

  if (items.length === 0) return { created: 0, updated: 0, skipped: 0, createdItems: [] };

  const ids = items.map((i) => i.youtubeVideoId);
  const existing = await db
    .select({ id: roadmapItems.id, youtubeVideoId: roadmapItems.youtubeVideoId, source: roadmapItems.source })
    .from(roadmapItems)
    .where(inArray(roadmapItems.youtubeVideoId, ids));

  const existingBySource = new Map(existing.map((e) => [e.youtubeVideoId!, e.source]));

  const toCreate: SyncedItem[] = [];
  const toUpdate: SyncedItem[] = [];
  let skipped = 0;

  for (const item of items) {
    const src = existingBySource.get(item.youtubeVideoId);
    if (src === undefined) toCreate.push(item);
    else if (src === "youtube") toUpdate.push(item);
    else skipped++; // a manual item claimed this videoId — leave it alone
  }

  const createdItems: RoadmapItem[] = [];
  if (toCreate.length > 0) {
    const rows = await db
      .insert(roadmapItems)
      .values(
        toCreate.map((i) => ({
          type: i.type,
          status: i.status,
          title: i.title,
          description: i.description,
          thumbnailUrl: i.thumbnailUrl,
          youtubeVideoId: i.youtubeVideoId,
          youtubeUrl: i.youtubeUrl,
          publishedAt: i.publishedAt,
          scheduledAt: i.scheduledAt,
          source: "youtube" as const,
        })),
      )
      .returning();
    createdItems.push(...rows);
  }

  for (const i of toUpdate) {
    await db
      .update(roadmapItems)
      .set({
        type: i.type,
        status: i.status,
        title: i.title,
        description: i.description,
        thumbnailUrl: i.thumbnailUrl,
        youtubeUrl: i.youtubeUrl,
        publishedAt: i.publishedAt,
        scheduledAt: i.scheduledAt,
        updatedAt: new Date(),
      })
      .where(eq(roadmapItems.youtubeVideoId, i.youtubeVideoId));
  }

  if (env.NOTIFY_ON_SYNC && createdItems.length > 0) {
    await notifyNewItems(createdItems);
  }

  return { created: createdItems.length, updated: toUpdate.length, skipped, createdItems };
}
