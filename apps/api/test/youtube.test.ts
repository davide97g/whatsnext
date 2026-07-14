import { describe, expect, test } from "bun:test";
import { mapPlaylistItem, mapUpcomingVideo } from "../src/services/youtube.ts";

describe("mapPlaylistItem", () => {
  test("maps a normal upload to a published video", () => {
    const result = mapPlaylistItem({
      snippet: {
        title: "Token cost optimization pt. 2",
        description: "hello",
        publishedAt: "2026-01-02T10:00:00Z",
        thumbnails: { high: { url: "https://img/high.jpg" }, default: { url: "https://img/def.jpg" } },
        resourceId: { videoId: "abc123" },
      },
    });
    expect(result).not.toBeNull();
    expect(result).toMatchObject({
      youtubeVideoId: "abc123",
      title: "Token cost optimization pt. 2",
      type: "video",
      status: "published",
      youtubeUrl: "https://www.youtube.com/watch?v=abc123",
      thumbnailUrl: "https://img/high.jpg",
    });
    expect(result!.publishedAt).toEqual(new Date("2026-01-02T10:00:00Z"));
    expect(result!.scheduledAt).toBeNull();
  });

  test("returns null for private/deleted or id-less items", () => {
    expect(mapPlaylistItem({ snippet: { title: "Private video", resourceId: { videoId: "x" } } })).toBeNull();
    expect(mapPlaylistItem({ snippet: { title: "No id" } })).toBeNull();
    expect(mapPlaylistItem({})).toBeNull();
  });
});

describe("mapUpcomingVideo", () => {
  test("maps an upcoming broadcast to a scheduled live", () => {
    const result = mapUpcomingVideo({
      id: "live99",
      snippet: {
        title: "Live coding session",
        thumbnails: { medium: { url: "https://img/med.jpg" } },
      },
      liveStreamingDetails: { scheduledStartTime: "2026-07-20T18:00:00Z" },
    });
    expect(result).toMatchObject({
      youtubeVideoId: "live99",
      type: "live",
      status: "scheduled",
      thumbnailUrl: "https://img/med.jpg",
    });
    expect(result!.scheduledAt).toEqual(new Date("2026-07-20T18:00:00Z"));
    expect(result!.publishedAt).toBeNull();
  });

  test("returns null without id or title", () => {
    expect(mapUpcomingVideo({ id: "x" })).toBeNull();
    expect(mapUpcomingVideo({ snippet: { title: "no id" } })).toBeNull();
  });
});
