import type { RoadmapItem } from "../db/schema.ts";
import { buildItemEmbed, sendDiscordEmbeds } from "./discord.ts";

/**
 * Channel-agnostic dispatch layer. Today it fans out to Discord only; adding email
 * or an RSS ping later means editing this file, not every call site.
 */

export async function notifyItemPublished(item: RoadmapItem): Promise<void> {
  await sendDiscordEmbeds([buildItemEmbed(item, "published")]);
}

export async function notifyNewItems(items: RoadmapItem[]): Promise<void> {
  if (items.length === 0) return;
  await sendDiscordEmbeds(items.map((i) => buildItemEmbed(i, "new")));
}
