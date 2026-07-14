# whatsnext

A public roadmap & timeline for a YouTube channel — a Notion-style board of upcoming videos and
live streams, with a live "next up" countdown, channel links, and a protected admin panel. New
publishes fire a **Discord** notification. Roadmap items come from two places: **auto-synced from
YouTube** (published videos + upcoming livestreams) and **manually curated** (planned/idea work).

- **Frontend** — React + Vite + Tailwind v4, shadcn-style components. Design: a "tally light"
  control-room theme (amber = on-air tally, red reserved for live).
- **Backend** — Bun + Hono API, Drizzle ORM, PostgreSQL, JWT admin auth.
- **Deploy** — Bun monorepo, two Docker services + Postgres, built for **Dokploy**.

```
whatsnext/
├── apps/
│   ├── api/          # Hono API (Bun) + Drizzle + Postgres
│   └── web/          # React + Vite SPA
├── docker-compose.yml   # local Postgres only
└── .env.example
```

## Prerequisites

- [Bun](https://bun.sh) ≥ 1.1
- Docker (for local Postgres)

## Local development

```bash
# 1. Install
bun install

# 2. Start Postgres
docker compose up -d

# 3. Configure env
cp .env.example apps/api/.env
#    → generate the admin password hash and paste it in (see note below)
bun run hash            # prints two forms; use the ".env" one locally

# 4. Migrate + seed schema
bun run db:migrate

# 5. Run both apps (API :4823, web :4917)
bun run dev
#    or individually:
bun run dev:api
bun run dev:web
```

The web app reads the API base URL from `VITE_API_URL` (defaults to `http://localhost:4823`).

> **⚠️ bcrypt hash in `.env`:** Bun's `.env` loader performs `$` variable expansion, and bcrypt
> hashes contain `$`. `bun run hash` prints **two** lines — use the one labelled *"for a local
> .env file"* (it escapes `$` as `\$`) in any `.env` file, and the raw one when pasting into a
> Dokploy/OS environment variable field (no escaping there).

## Environment variables

See [`.env.example`](./.env.example) for the full annotated list. Key ones:

| Variable | Used by | Notes |
| --- | --- | --- |
| `DATABASE_URL` | api | Postgres connection string |
| `JWT_SECRET` | api | signs admin JWTs (`openssl rand -hex 32`) |
| `ADMIN_USERNAME` / `ADMIN_PASSWORD_HASH` | api | single admin; hash via `bun run hash` |
| `SYNC_TOKEN` | api | shared secret for the scheduled YouTube sync |
| `DISCORD_WEBHOOK_URL` | api | channel → Integrations → Webhooks → New Webhook |
| `YOUTUBE_API_KEY` / `YOUTUBE_CHANNEL_ID` | api | YouTube Data API v3 sync |
| `NOTIFY_ON_SYNC` | api | `true` → newly synced items also notify Discord |
| `DISCORD_INVITE_URL`, `YOUTUBE_CHANNEL_URL`, `GITHUB_URL`, `LINKEDIN_URL`, `CHANNEL_BLURB`, `CHANNEL_NAME` | api | public channel links/copy (served by `/api/links`) |
| `CORS_ORIGIN` | api | comma-separated allowed origins (the web app URL) |
| `VITE_API_URL` | web | **build-time**; the API's public URL |

## API

Public: `GET /api/health`, `/api/roadmap` (`?type=video|live`), `/api/roadmap/:id`, `/api/next`,
`/api/links`.
Auth: `POST /api/auth/login`, `GET /api/auth/me`.
Admin (Bearer JWT): `POST|PATCH|DELETE /api/admin/roadmap[/:id]`,
`POST /api/admin/roadmap/:id/publish`, `POST /api/admin/sync`.
Sync (header `x-sync-token`): `POST /api/sync/youtube`.

## YouTube sync

The sync pulls recent uploads (as published videos) and upcoming livestreams (as scheduled lives),
upserting by video id. It **only touches `source='youtube'` rows** — your manual items are never
overwritten.

> **⚠️ API key restriction:** the sync runs **server-side**, so the API key must NOT be restricted
> to *HTTP referrers* (that's for browser keys and will fail with
> `API_KEY_HTTP_REFERRER_BLOCKED`). In Google Cloud Console → Credentials → your key →
> *Application restrictions*, choose **None** or **IP addresses** (your VPS IP), and restrict the
> key to the *YouTube Data API v3* under API restrictions.

Trigger it manually from the admin panel ("Sync now"), or on a schedule (below).

## Testing

```bash
bun test          # API unit tests (youtube mappers, discord embeds)
```

## Deploy to Dokploy

Create **three** resources in your Dokploy project:

### 1. PostgreSQL (Database)
Add a Postgres database service. Copy its connection string into the API's `DATABASE_URL`.

### 2. API (Application → Docker)
- **Repository**: this repo. **Build type**: Dockerfile.
- **Docker context / Build path**: `apps/api`
- **Dockerfile**: `Dockerfile`
- **Port**: `3000`
- **Domain**: e.g. `api.yourdomain.com`
- **Environment**: set `DATABASE_URL`, `JWT_SECRET`, `ADMIN_USERNAME`, `ADMIN_PASSWORD_HASH`
  (raw form — no `\$`), `SYNC_TOKEN`, `DISCORD_WEBHOOK_URL`, `YOUTUBE_API_KEY`,
  `YOUTUBE_CHANNEL_ID`, `NOTIFY_ON_SYNC`, `CORS_ORIGIN=https://yourdomain.com`, and the public
  link vars.
- Migrations run automatically on container start (`bun run migrate && bun run start`).

### 3. Web (Application → Docker)
- **Docker context / Build path**: `apps/web`
- **Dockerfile**: `Dockerfile`
- **Port**: `80`
- **Domain**: e.g. `yourdomain.com`
- **Build arg**: `VITE_API_URL=https://api.yourdomain.com` (baked at build time — rebuild if it
  changes).

### 4. Scheduled task (YouTube sync)
Add a Dokploy scheduled task / cron (e.g. every 6 hours — `search.list` costs 100 quota units):

```bash
curl -fsS -X POST https://api.yourdomain.com/api/sync/youtube \
  -H "x-sync-token: $SYNC_TOKEN"
```

## Discord webhook

In your Discord server: **channel → Edit Channel → Integrations → Webhooks → New Webhook**, copy
the URL into `DISCORD_WEBHOOK_URL`. Publishing an item (admin "publish" action) posts an embed;
enable `NOTIFY_ON_SYNC=true` to also notify on newly auto-synced items.
