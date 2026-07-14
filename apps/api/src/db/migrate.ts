import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";
import { env } from "../lib/env.ts";

/**
 * Applies pending SQL migrations from ./drizzle, then exits.
 * Run standalone (`bun run migrate`) or as the API container's pre-start step.
 */
async function main() {
  const client = postgres(env.DATABASE_URL, { max: 1 });
  const db = drizzle(client);
  console.log("⏳ Running migrations…");
  await migrate(db, { migrationsFolder: new URL("../../drizzle", import.meta.url).pathname });
  console.log("✅ Migrations complete.");
  await client.end();
}

main().catch((err) => {
  console.error("❌ Migration failed:", err);
  process.exit(1);
});
