import { clearToken, getToken } from "./auth.ts";
import type { LinksResponse, NextResponse, RoadmapItem, RoadmapResponse } from "./types.ts";

const BASE = (import.meta.env.VITE_API_URL ?? "http://localhost:4823").replace(/\/$/, "");

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers = new Headers(init.headers);
  if (init.body) headers.set("Content-Type", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const res = await fetch(`${BASE}/api${path}`, { ...init, headers });

  if (res.status === 401 && token) {
    // Token rejected — drop it so the UI can send the user back to login.
    clearToken();
  }

  if (!res.ok) {
    let message = res.statusText;
    try {
      const body = await res.json();
      if (body?.error) message = body.error;
    } catch {
      /* non-JSON error body */
    }
    throw new ApiError(res.status, message);
  }

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

// ── Public ──────────────────────────────────────────────────
export const api = {
  roadmap: (type?: "video" | "live") =>
    request<RoadmapResponse>(`/roadmap${type ? `?type=${type}` : ""}`),
  next: () => request<NextResponse>("/next"),
  links: () => request<LinksResponse>("/links"),

  // ── Auth ──────────────────────────────────────────────────
  login: (username: string, password: string) =>
    request<{ token: string; expiresAt: number }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    }),
  me: () => request<{ username: string; expiresAt: number }>("/auth/me"),

  // ── Admin ─────────────────────────────────────────────────
  adminList: () => request<{ items: RoadmapItem[] }>("/admin/roadmap"),
  create: (data: Partial<RoadmapItem>) =>
    request<RoadmapItem>("/admin/roadmap", { method: "POST", body: JSON.stringify(data) }),
  update: (id: string, data: Partial<RoadmapItem>) =>
    request<RoadmapItem>(`/admin/roadmap/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  remove: (id: string) =>
    request<{ ok: true }>(`/admin/roadmap/${id}`, { method: "DELETE" }),
  publish: (id: string) =>
    request<RoadmapItem>(`/admin/roadmap/${id}/publish`, { method: "POST" }),
  sync: () =>
    request<{ created: number; updated: number; skipped: number }>("/admin/sync", { method: "POST" }),
};
