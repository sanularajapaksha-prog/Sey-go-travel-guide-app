import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";

const { Pool } = pg;
const connectionString =
  process.env.DATABASE_URL ?? process.env.SUPABASE_DB_POOLER_URL;

if (!connectionString) {
  throw new Error(
    "DATABASE_URL or SUPABASE_DB_POOLER_URL must be set.",
  );
}

const databaseUrl = new URL(connectionString);

export const pool = new Pool({
  host: databaseUrl.hostname,
  port: Number(databaseUrl.port || 5432),
  user: decodeURIComponent(databaseUrl.username),
  password: decodeURIComponent(databaseUrl.password),
  database: databaseUrl.pathname.replace(/^\//, ""),
  ssl: { rejectUnauthorized: false },
});
export const db = drizzle(pool, { schema });
