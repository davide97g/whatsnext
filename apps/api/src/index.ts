import { app } from "./app.ts";
import { env } from "./lib/env.ts";

const server = Bun.serve({
  port: env.PORT,
  fetch: app.fetch,
});

console.log(`🚀 whatsnext-api listening on http://localhost:${server.port}`);
