import { timingSafeEqual } from "node:crypto";
import type { Context, Next } from "hono";
import { verify } from "hono/jwt";
import { env } from "../lib/env.ts";

export interface JwtPayload {
  sub: string;
  exp: number;
}

/**
 * Guards admin routes. Expects `Authorization: Bearer <jwt>`.
 * On success, stashes the payload on the context under "jwt".
 */
export async function requireAuth(c: Context, next: Next) {
  const header = c.req.header("Authorization");
  const token = header?.startsWith("Bearer ") ? header.slice(7) : undefined;
  if (!token) {
    return c.json({ error: "Missing bearer token" }, 401);
  }
  try {
    const payload = (await verify(token, env.JWT_SECRET, "HS256")) as unknown as JwtPayload;
    c.set("jwtPayload", payload);
    await next();
  } catch {
    return c.json({ error: "Invalid or expired token" }, 401);
  }
}

/**
 * Constant-time comparison of the `x-sync-token` header against SYNC_TOKEN.
 * Used by the Dokploy scheduled task; independent of the admin JWT.
 */
export async function requireSyncToken(c: Context, next: Next) {
  const provided = c.req.header("x-sync-token") ?? "";
  const expected = env.SYNC_TOKEN;
  const a = new TextEncoder().encode(provided);
  const b = new TextEncoder().encode(expected);
  // Length check first (timingSafeEqual requires equal lengths); token length is not secret.
  const ok = a.length === b.length && timingSafeEqual(a, b);
  if (!ok) {
    return c.json({ error: "Invalid sync token" }, 401);
  }
  await next();
}
