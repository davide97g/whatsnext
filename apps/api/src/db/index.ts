import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { env } from "../lib/env.ts";
import * as schema from "./schema.ts";

/**
 * Long-lived query client. `max` kept modest for a small VPS deployment.
 */
const queryClient = postgres(env.DATABASE_URL, { max: 10 });

export const db = drizzle(queryClient, { schema });
export { schema };
export type Database = typeof db;
