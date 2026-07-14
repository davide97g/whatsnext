/**
 * Generates a bcrypt hash for the admin password.
 *
 *   bun run hash                 # prompts for the password
 *   bun run hash "my-password"   # hashes the argument
 *
 * Bun's .env loader performs `$` variable expansion, and bcrypt hashes contain `$`.
 * So we print TWO forms:
 *   - one for a local `.env` file (with `$` escaped as `\$`)
 *   - one for Dokploy / real OS env vars (raw — no escaping needed)
 */
const arg = process.argv[2];

const password = arg ?? prompt("Admin password:") ?? "";
if (!password) {
  console.error("No password provided.");
  process.exit(1);
}

const hash = await Bun.password.hash(password, { algorithm: "bcrypt", cost: 12 });
const escaped = hash.replace(/\$/g, "\\$");

console.log("\n# --- For a local .env file (Bun expands $, so it is escaped) --- #");
console.log(`ADMIN_PASSWORD_HASH=${escaped}`);
console.log("\n# --- For Dokploy / real environment variables (paste as-is) --- #");
console.log(`ADMIN_PASSWORD_HASH=${hash}`);

export {};
