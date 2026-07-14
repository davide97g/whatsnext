import { zValidator } from "@hono/zod-validator";
import { desc, eq } from "drizzle-orm";
import { Hono } from "hono";
import { z } from "zod";
import { db } from "../db/index.ts";
import { roadmapItems } from "../db/schema.ts";
import { requireAuth } from "../middleware/auth.ts";
import { notifyItemPublished } from "../services/notifier.ts";
import { runYouTubeSync } from "../services/sync.ts";

export const adminRoutes = new Hono();
adminRoutes.use("*", requireAuth);

const nullableDate = z.coerce.date().nullish();

const createSchema = z.object({
  title: z.string().min(1).max(300),
  type: z.enum(["video", "live"]).default("video"),
  status: z.enum(["idea", "planned", "in_progress", "scheduled", "published", "live", "done"]).default("planned"),
  description: z.string().max(5000).nullish(),
  thumbnailUrl: z.string().url().nullish().or(z.literal("")),
  youtubeVideoId: z.string().nullish(),
  youtubeUrl: z.string().url().nullish().or(z.literal("")),
  scheduledAt: nullableDate,
  publishedAt: nullableDate,
  position: z.number().int().default(0),
  tags: z.array(z.string()).default([]),
});

const updateSchema = createSchema.partial();

// List all items (admin view — includes everything, newest first).
adminRoutes.get("/roadmap", async (c) => {
  const items = await db.select().from(roadmapItems).orderBy(desc(roadmapItems.updatedAt));
  return c.json({ items });
});

adminRoutes.post("/roadmap", zValidator("json", createSchema), async (c) => {
  const body = c.req.valid("json");
  const [item] = await db
    .insert(roadmapItems)
    .values({ ...body, source: "manual" })
    .returning();
  return c.json(item, 201);
});

adminRoutes.patch("/roadmap/:id", zValidator("json", updateSchema), async (c) => {
  const body = c.req.valid("json");
  const [item] = await db
    .update(roadmapItems)
    .set({ ...body, updatedAt: new Date() })
    .where(eq(roadmapItems.id, c.req.param("id")))
    .returning();
  if (!item) return c.json({ error: "Not found" }, 404);
  return c.json(item);
});

adminRoutes.delete("/roadmap/:id", async (c) => {
  const [item] = await db
    .delete(roadmapItems)
    .where(eq(roadmapItems.id, c.req.param("id")))
    .returning();
  if (!item) return c.json({ error: "Not found" }, 404);
  return c.json({ ok: true });
});

// Mark published and fire a Discord notification.
adminRoutes.post("/roadmap/:id/publish", async (c) => {
  const id = c.req.param("id");
  const [existing] = await db.select().from(roadmapItems).where(eq(roadmapItems.id, id));
  if (!existing) return c.json({ error: "Not found" }, 404);

  const [item] = await db
    .update(roadmapItems)
    .set({
      status: "published",
      publishedAt: existing.publishedAt ?? new Date(),
      updatedAt: new Date(),
    })
    .where(eq(roadmapItems.id, id))
    .returning();

  await notifyItemPublished(item!);
  return c.json(item);
});

// Manual "sync now" — JWT-gated wrapper over the YouTube sync service.
adminRoutes.post("/sync", async (c) => {
  try {
    const result = await runYouTubeSync();
    return c.json(result);
  } catch (err) {
    return c.json({ error: err instanceof Error ? err.message : "Sync failed" }, 500);
  }
});
