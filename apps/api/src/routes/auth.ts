import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { sign } from "hono/jwt";
import { z } from "zod";
import { env } from "../lib/env.ts";
import { requireAuth } from "../middleware/auth.ts";

const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

const TOKEN_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days

export const authRoutes = new Hono();

authRoutes.post("/login", zValidator("json", loginSchema), async (c) => {
  const { username, password } = c.req.valid("json");

  const userMatches = username === env.ADMIN_USERNAME;
  // Always run the (expensive) verify to avoid leaking which check failed via timing.
  const passwordMatches = await Bun.password.verify(password, env.ADMIN_PASSWORD_HASH).catch(() => false);

  if (!userMatches || !passwordMatches) {
    return c.json({ error: "Invalid credentials" }, 401);
  }

  const exp = Math.floor(Date.now() / 1000) + TOKEN_TTL_SECONDS;
  const token = await sign({ sub: username, exp }, env.JWT_SECRET, "HS256");
  return c.json({ token, expiresAt: exp });
});

authRoutes.get("/me", requireAuth, (c) => {
  const payload = c.get("jwtPayload") as { sub: string; exp: number };
  return c.json({ username: payload.sub, expiresAt: payload.exp });
});
