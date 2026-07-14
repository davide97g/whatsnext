import { and, asc, eq, gt, isNotNull } from "drizzle-orm";
import { Hono } from "hono";
import { db } from "../db/index.ts";
import { roadmapItems, itemStatusEnum, type RoadmapItem } from "../db/schema.ts";
import { env } from "../lib/env.ts";

export const publicRoutes = new Hono();

/** Column order for the board, mirrors the enum definition. */
const STATUS_ORDER = itemStatusEnum.enumValues;

publicRoutes.get("/health", (c) => c.json({ ok: true }));

publicRoutes.get("/links", (c) =>
  c.json({
    channelName: env.CHANNEL_NAME,
    blurb: env.CHANNEL_BLURB,
    discord: env.DISCORD_INVITE_URL || null,
    youtube: env.YOUTUBE_CHANNEL_URL || null,
    github: env.GITHUB_URL || null,
    linkedin: env.LINKEDIN_URL || null,
  }),
);

// GET /roadmap?type=video|live  → items plus a board grouped by status.
publicRoutes.get("/roadmap", async (c) => {
  const type = c.req.query("type");
  const where = type === "video" || type === "live" ? eq(roadmapItems.type, type) : undefined;

  const items = await db
    .select()
    .from(roadmapItems)
    .where(where)
    .orderBy(asc(roadmapItems.position), asc(roadmapItems.scheduledAt), asc(roadmapItems.createdAt));

  const board = STATUS_ORDER.map((status) => ({
    status,
    items: items.filter((i) => i.status === status),
  }));

  return c.json({ items, board });
});

publicRoutes.get("/roadmap/:id", async (c) => {
  const [item] = await db.select().from(roadmapItems).where(eq(roadmapItems.id, c.req.param("id")));
  if (!item) return c.json({ error: "Not found" }, 404);
  return c.json(item);
});

// GET /next → soonest upcoming video and live (by scheduledAt in the future).
publicRoutes.get("/next", async (c) => {
  const now = new Date();

  const soonest = async (type: "video" | "live"): Promise<RoadmapItem | null> => {
    const [item] = await db
      .select()
      .from(roadmapItems)
      .where(
        and(eq(roadmapItems.type, type), isNotNull(roadmapItems.scheduledAt), gt(roadmapItems.scheduledAt, now)),
      )
      .orderBy(asc(roadmapItems.scheduledAt))
      .limit(1);
    return item ?? null;
  };

  const [video, live] = await Promise.all([soonest("video"), soonest("live")]);
  return c.json({ video, live });
});
