export type ItemType = "video" | "live";
export type ItemStatus =
  | "idea"
  | "planned"
  | "in_progress"
  | "scheduled"
  | "published"
  | "live"
  | "done";
export type ItemSource = "manual" | "youtube";

export interface RoadmapItem {
  id: string;
  type: ItemType;
  status: ItemStatus;
  title: string;
  description: string | null;
  thumbnailUrl: string | null;
  youtubeVideoId: string | null;
  youtubeUrl: string | null;
  scheduledAt: string | null;
  publishedAt: string | null;
  source: ItemSource;
  position: number;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

/** Where a lead item links: its YouTube page when we have one, else the board. */
export function itemTarget(item: RoadmapItem | null): { href: string; external: boolean } {
  if (item?.youtubeUrl) return { href: item.youtubeUrl, external: true };
  return { href: "/roadmap", external: false };
}

export interface BoardColumn {
  status: ItemStatus;
  items: RoadmapItem[];
}

export interface RoadmapResponse {
  items: RoadmapItem[];
  board: BoardColumn[];
}

export interface NextResponse {
  video: RoadmapItem | null;
  live: RoadmapItem | null;
}

export interface LinksResponse {
  channelName: string;
  blurb: string;
  discord: string | null;
  youtube: string | null;
  github: string | null;
  linkedin: string | null;
}

export const STATUS_META: Record<ItemStatus, { label: string; hint: string }> = {
  idea: { label: "Idea", hint: "On the radar" },
  planned: { label: "Planned", hint: "Committed to the lineup" },
  in_progress: { label: "In progress", hint: "Being made right now" },
  scheduled: { label: "Scheduled", hint: "Date locked" },
  published: { label: "Published", hint: "Live on the channel" },
  live: { label: "Live", hint: "On air now" },
  done: { label: "Done", hint: "Wrapped" },
};

/** Left→right board order (mirrors the API enum). */
export const STATUS_ORDER: ItemStatus[] = [
  "idea",
  "planned",
  "in_progress",
  "scheduled",
  "live",
  "published",
  "done",
];
