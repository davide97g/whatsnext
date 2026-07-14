/**
 * YouTube Data API v3 client + pure mappers.
 *
 * Quota notes: `channels.list` / `playlistItems.list` / `videos.list` cost 1 unit each;
 * `search.list` costs 100 units. Keep the sync cron modest (e.g. every 6h).
 */

const API_BASE = "https://www.googleapis.com/youtube/v3";

export interface SyncedItem {
  youtubeVideoId: string;
  title: string;
  description: string | null;
  thumbnailUrl: string | null;
  youtubeUrl: string;
  type: "video" | "live";
  status: "published" | "scheduled";
  publishedAt: Date | null;
  scheduledAt: Date | null;
}

// ── Raw API shapes (only the fields we use) ──────────────────
interface YtThumbnails {
  default?: { url: string };
  medium?: { url: string };
  high?: { url: string };
  standard?: { url: string };
  maxres?: { url: string };
}
interface PlaylistItem {
  snippet?: {
    title?: string;
    description?: string;
    publishedAt?: string;
    thumbnails?: YtThumbnails;
    resourceId?: { videoId?: string };
  };
}
interface VideoResource {
  id?: string;
  snippet?: {
    title?: string;
    description?: string;
    publishedAt?: string;
    thumbnails?: YtThumbnails;
    liveBroadcastContent?: string;
  };
  liveStreamingDetails?: {
    scheduledStartTime?: string;
    actualStartTime?: string;
  };
}

function bestThumbnail(thumbs?: YtThumbnails): string | null {
  return (
    thumbs?.maxres?.url ??
    thumbs?.standard?.url ??
    thumbs?.high?.url ??
    thumbs?.medium?.url ??
    thumbs?.default?.url ??
    null
  );
}

function watchUrl(videoId: string): string {
  return `https://www.youtube.com/watch?v=${videoId}`;
}

/** Pure: maps an uploads-playlist item into a published-video SyncedItem. Returns null if unusable. */
export function mapPlaylistItem(raw: PlaylistItem): SyncedItem | null {
  const videoId = raw.snippet?.resourceId?.videoId;
  const title = raw.snippet?.title;
  if (!videoId || !title || title === "Private video" || title === "Deleted video") return null;
  return {
    youtubeVideoId: videoId,
    title,
    description: raw.snippet?.description || null,
    thumbnailUrl: bestThumbnail(raw.snippet?.thumbnails),
    youtubeUrl: watchUrl(videoId),
    type: "video",
    status: "published",
    publishedAt: raw.snippet?.publishedAt ? new Date(raw.snippet.publishedAt) : null,
    scheduledAt: null,
  };
}

/** Pure: maps an upcoming-live video resource into a scheduled-live SyncedItem. Returns null if unusable. */
export function mapUpcomingVideo(raw: VideoResource): SyncedItem | null {
  const videoId = raw.id;
  const title = raw.snippet?.title;
  if (!videoId || !title) return null;
  const scheduled = raw.liveStreamingDetails?.scheduledStartTime;
  return {
    youtubeVideoId: videoId,
    title,
    description: raw.snippet?.description || null,
    thumbnailUrl: bestThumbnail(raw.snippet?.thumbnails),
    youtubeUrl: watchUrl(videoId),
    type: "live",
    status: "scheduled",
    publishedAt: null,
    scheduledAt: scheduled ? new Date(scheduled) : null,
  };
}

async function ytGet<T>(path: string, params: Record<string, string>, apiKey: string): Promise<T> {
  const url = new URL(`${API_BASE}/${path}`);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  url.searchParams.set("key", apiKey);
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`YouTube API ${path} → ${res.status}: ${await res.text()}`);
  }
  return (await res.json()) as T;
}

async function getUploadsPlaylistId(channelId: string, apiKey: string): Promise<string | null> {
  const data = await ytGet<{ items?: { contentDetails?: { relatedPlaylists?: { uploads?: string } } }[] }>(
    "channels",
    { part: "contentDetails", id: channelId },
    apiKey,
  );
  return data.items?.[0]?.contentDetails?.relatedPlaylists?.uploads ?? null;
}

async function getRecentUploads(playlistId: string, apiKey: string, max = 20): Promise<SyncedItem[]> {
  const data = await ytGet<{ items?: PlaylistItem[] }>(
    "playlistItems",
    { part: "snippet", playlistId, maxResults: String(Math.min(max, 50)) },
    apiKey,
  );
  return (data.items ?? []).map(mapPlaylistItem).filter((x): x is SyncedItem => x !== null);
}

async function getUpcomingLives(channelId: string, apiKey: string): Promise<SyncedItem[]> {
  // search.list finds upcoming broadcasts; videos.list enriches with scheduledStartTime + thumbnails.
  const search = await ytGet<{ items?: { id?: { videoId?: string } }[] }>(
    "search",
    { part: "id", channelId, eventType: "upcoming", type: "video", maxResults: "10", order: "date" },
    apiKey,
  );
  const ids = (search.items ?? []).map((i) => i.id?.videoId).filter((x): x is string => !!x);
  if (ids.length === 0) return [];

  const videos = await ytGet<{ items?: VideoResource[] }>(
    "videos",
    { part: "snippet,liveStreamingDetails", id: ids.join(",") },
    apiKey,
  );
  return (videos.items ?? []).map(mapUpcomingVideo).filter((x): x is SyncedItem => x !== null);
}

/**
 * Fetches recent uploads + upcoming livestreams for a channel and returns normalized items.
 *
 * Uploads are the core payload, so a failure there is fatal. The upcoming-lives `search` call is
 * best-effort: it costs 100 quota units and can flake independently, so its failure is logged and
 * swallowed rather than dropping the whole sync (and every upload with it).
 */
export async function fetchYouTubeItems(channelId: string, apiKey: string): Promise<SyncedItem[]> {
  const uploadsId = await getUploadsPlaylistId(channelId, apiKey);
  const uploads = uploadsId ? await getRecentUploads(uploadsId, apiKey) : [];

  let lives: SyncedItem[] = [];
  try {
    lives = await getUpcomingLives(channelId, apiKey);
  } catch (err) {
    console.warn("[youtube] upcoming-lives lookup failed (uploads still synced):", err);
  }

  return [...lives, ...uploads];
}
