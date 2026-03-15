import "dotenv/config";
import { defineConfig } from "drizzle-kit";

const connectionString =
  process.env.DATABASE_URL ?? process.env.SUPABASE_DB_POOLER_URL;

if (!connectionString) {
  throw new Error(
    "DATABASE_URL or SUPABASE_DB_POOLER_URL must be set for Drizzle.",
  );
}

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: connectionString,
  },
});
