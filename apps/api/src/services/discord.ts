import { env } from "../lib/env.ts";
import type { RoadmapItem } from "../db/schema.ts";

const DISCORD_BLURPLE = 0x5865f2;
const YOUTUBE_RED = 0xff0000;

export interface DiscordEmbed {
  title: string;
  description?: string;
  url?: string;
  color?: number;
  timestamp?: string;
  thumbnail?: { url: string };
  footer?: { text: string };
}

/**
 * Builds the embed payload for a roadmap item. Pure — no I/O — so it is unit-testable.
 */
export function buildItemEmbed(item: RoadmapItem, event: "published" | "new"): DiscordEmbed {
  const isLive = item.type === "live";
  const verb = event === "published" ? (isLive ? "🔴 Now live" : "🎥 New video") : "🆕 Added to roadmap";
  const when = item.publishedAt ?? item.scheduledAt ?? item.createdAt;

  const embed: DiscordEmbed = {
    title: `${verb}: ${item.title}`,
    color: isLive ? YOUTUBE_RED : DISCORD_BLURPLE,
    timestamp: when ? new Date(when).toISOString() : undefined,
    footer: { text: env.CHANNEL_NAME },
  };
  if (item.description) embed.description = item.description.slice(0, 500);
  if (item.youtubeUrl) embed.url = item.youtubeUrl;
  if (item.thumbnailUrl) embed.thumbnail = { url: item.thumbnailUrl };
  return embed;
}

/**
 * Posts one or more embeds to the configured Discord webhook.
 * Fire-and-forget: never throws to callers; logs failures. No-op if unconfigured.
 */
export async function sendDiscordEmbeds(embeds: DiscordEmbed[]): Promise<boolean> {
  if (!env.DISCORD_WEBHOOK_URL) {
    console.warn("[discord] DISCORD_WEBHOOK_URL not set — skipping notification");
    return false;
  }
  if (embeds.length === 0) return false;

  try {
    const res = await fetch(env.DISCORD_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      // Discord allows up to 10 embeds per message.
      body: JSON.stringify({ embeds: embeds.slice(0, 10) }),
    });
    if (!res.ok) {
      console.error(`[discord] webhook responded ${res.status}: ${await res.text()}`);
      return false;
    }
    return true;
  } catch (err) {
    console.error("[discord] failed to post webhook:", err);
    return false;
  }
}
