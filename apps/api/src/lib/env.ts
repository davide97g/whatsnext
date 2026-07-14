import { z } from "zod";

/**
 * Validates and exposes environment configuration.
 * Fails fast at startup if a required variable is missing/malformed.
 */
const boolish = z
  .union([z.boolean(), z.string()])
  .transform((v) => v === true || v === "true" || v === "1")
  .default(false);

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  PORT: z.coerce.number().int().positive().default(4823),

  // Comma-separated list of allowed origins.
  CORS_ORIGIN: z
    .string()
    .default("http://localhost:4917")
    .transform((s) =>
      s
        .split(",")
        .map((o) => o.trim())
        .filter(Boolean),
    ),

  JWT_SECRET: z.string().min(16, "JWT_SECRET must be at least 16 chars"),
  ADMIN_USERNAME: z.string().min(1),
  ADMIN_PASSWORD_HASH: z.string().min(1, "ADMIN_PASSWORD_HASH is required (run `bun run hash`)"),
  SYNC_TOKEN: z.string().min(8, "SYNC_TOKEN must be at least 8 chars"),

  DISCORD_WEBHOOK_URL: z.string().url().optional().or(z.literal("")).transform((v) => v || undefined),

  YOUTUBE_API_KEY: z.string().optional().transform((v) => v || undefined),
  YOUTUBE_CHANNEL_ID: z.string().optional().transform((v) => v || undefined),
  NOTIFY_ON_SYNC: boolish,

  // Public channel links.
  DISCORD_INVITE_URL: z.string().default(""),
  YOUTUBE_CHANNEL_URL: z.string().default(""),
  GITHUB_URL: z.string().default(""),
  LINKEDIN_URL: z.string().default(""),
  CHANNEL_BLURB: z.string().default(""),
  CHANNEL_NAME: z.string().default("Davide Ghiotto"),
});

export type Env = z.infer<typeof envSchema>;

function loadEnv(): Env {
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((i) => `  - ${i.path.join(".") || "(root)"}: ${i.message}`)
      .join("\n");
    console.error(`\n❌ Invalid environment configuration:\n${issues}\n`);
    process.exit(1);
  }
  return parsed.data;
}

export const env = loadEnv();
