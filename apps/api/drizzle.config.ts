import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "postgres://whatsnext:whatsnext@localhost:5432/whatsnext",
  },
  verbose: true,
  strict: true,
});
