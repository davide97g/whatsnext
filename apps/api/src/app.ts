import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { env } from "./lib/env.ts";
import { adminRoutes } from "./routes/admin.ts";
import { authRoutes } from "./routes/auth.ts";
import { publicRoutes } from "./routes/public.ts";
import { syncRoutes } from "./routes/sync.ts";

export const app = new Hono();

app.use("*", logger());
app.use(
  "/api/*",
  cors({
    origin: env.CORS_ORIGIN,
    allowMethods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization", "x-sync-token"],
  }),
);

const api = new Hono();
api.route("/", publicRoutes);
api.route("/auth", authRoutes);
api.route("/admin", adminRoutes);
api.route("/sync", syncRoutes);

app.route("/api", api);

app.get("/", (c) => c.json({ name: "whatsnext-api", status: "ok" }));
app.notFound((c) => c.json({ error: "Not found" }, 404));
app.onError((err, c) => {
  console.error("[error]", err);
  return c.json({ error: "Internal server error" }, 500);
});
