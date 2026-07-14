import { describe, expect, test } from "bun:test";
import { buildItemEmbed } from "../src/services/discord.ts";
import type { RoadmapItem } from "../src/db/schema.ts";

function makeItem(overrides: Partial<RoadmapItem> = {}): RoadmapItem {
  return {
    id: "00000000-0000-0000-0000-000000000000",
    type: "video",
    status: "published",
    title: "My Video",
    description: "A description",
    thumbnailUrl: "https://img/thumb.jpg",
    youtubeVideoId: "vid1",
    youtubeUrl: "https://youtube.com/watch?v=vid1",
    scheduledAt: null,
    publishedAt: new Date("2026-03-01T12:00:00Z"),
    source: "youtube",
    position: 0,
    tags: [],
    createdAt: new Date("2026-02-01T00:00:00Z"),
    updatedAt: new Date("2026-02-01T00:00:00Z"),
    ...overrides,
  };
}

describe("buildItemEmbed", () => {
  test("published video embed uses blurple + video verb", () => {
    const embed = buildItemEmbed(makeItem(), "published");
    expect(embed.title).toBe("🎥 New video: My Video");
    expect(embed.color).toBe(0x5865f2);
    expect(embed.url).toBe("https://youtube.com/watch?v=vid1");
    expect(embed.thumbnail).toEqual({ url: "https://img/thumb.jpg" });
    expect(embed.timestamp).toBe("2026-03-01T12:00:00.000Z");
  });

  test("live item uses red + live verb", () => {
    const embed = buildItemEmbed(makeItem({ type: "live" }), "published");
    expect(embed.title).toBe("🔴 Now live: My Video");
    expect(embed.color).toBe(0xff0000);
  });

  test("new event uses roadmap verb", () => {
    const embed = buildItemEmbed(makeItem(), "new");
    expect(embed.title).toBe("🆕 Added to roadmap: My Video");
  });

  test("truncates long descriptions to 500 chars", () => {
    const embed = buildItemEmbed(makeItem({ description: "x".repeat(1000) }), "published");
    expect(embed.description!.length).toBe(500);
  });
});
