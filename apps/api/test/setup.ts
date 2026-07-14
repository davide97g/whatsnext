// Provides the minimum env so importing modules that read `env` don't exit during tests.
process.env.NODE_ENV = "test";
process.env.DATABASE_URL ??= "postgres://whatsnext:whatsnext@localhost:5432/whatsnext_test";
process.env.JWT_SECRET ??= "test-secret-at-least-16-chars-long";
process.env.ADMIN_USERNAME ??= "admin";
process.env.ADMIN_PASSWORD_HASH ??= "$2b$04$abcdefghijklmnopqrstuv";
process.env.SYNC_TOKEN ??= "test-sync-token";
process.env.CHANNEL_NAME ??= "whatsnext";
