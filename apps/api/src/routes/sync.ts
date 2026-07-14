import { Hono } from "hono";
import { requireSyncToken } from "../middleware/auth.ts";
import { runYouTubeSync } from "../services/sync.ts";

export const syncRoutes = new Hono();

// POST /sync/youtube — called by the Dokploy scheduled task with `x-sync-token`.
syncRoutes.post("/youtube", requireSyncToken, async (c) => {
  try {
    const result = await runYouTubeSync();
    return c.json(result);
  } catch (err) {
    console.error("[sync] failed:", err);
    return c.json({ error: err instanceof Error ? err.message : "Sync failed" }, 500);
  }
});
