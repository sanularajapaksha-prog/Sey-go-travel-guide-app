import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./shared/schema";

const { Pool } = pg;
const missingDbErrorMessage =
  "A database connection string must be set via DATABASE_URL, SUPABASE_DB_POOLER_URL, POSTGRES_URL, POSTGRESQL_URL, DATABASE_PRIVATE_URL, DATABASE_PUBLIC_URL, POSTGRES_PRISMA_URL, POSTGRES_URL_NON_POOLING, or PGHOST/PGUSER/PGPASSWORD/PGDATABASE.";

function getEnv(name: string): string | undefined {
  const value = process.env[name]?.trim();
  return value ? value : undefined;
}

function buildConnectionStringFromPgEnv(): string | undefined {
  const host = getEnv("PGHOST");
  const user = getEnv("PGUSER");
  const password = getEnv("PGPASSWORD");
  const database = getEnv("PGDATABASE");
  const port = getEnv("PGPORT") ?? "5432";

  if (!host || !user || !password || !database) {
    return undefined;
  }

  return `postgresql://${encodeURIComponent(user)}:${encodeURIComponent(password)}@${host}:${port}/${database}`;
}

const connectionString =
  getEnv("DATABASE_URL") ??
  getEnv("SUPABASE_DB_POOLER_URL") ??
  getEnv("POSTGRES_URL") ??
  getEnv("POSTGRESQL_URL") ??
  getEnv("DATABASE_PRIVATE_URL") ??
  getEnv("DATABASE_PUBLIC_URL") ??
  getEnv("POSTGRES_PRISMA_URL") ??
  getEnv("POSTGRES_URL_NON_POOLING") ??
  buildConnectionStringFromPgEnv();

if (!connectionString) {
  console.warn(`[db] ${missingDbErrorMessage}`);
}

type QueryablePool = Pick<pg.Pool, "query">;

export const pool: QueryablePool = connectionString
  ? (() => {
      const databaseUrl = new URL(connectionString);

      return new Pool({
        host: databaseUrl.hostname,
        port: Number(databaseUrl.port || 5432),
        user: decodeURIComponent(databaseUrl.username),
        password: decodeURIComponent(databaseUrl.password),
        database: databaseUrl.pathname.replace(/^\//, ""),
        ssl: { rejectUnauthorized: false },
      });
    })()
  : {
      query: async () => {
        throw new Error(missingDbErrorMessage);
      },
    };

export const db = connectionString ? drizzle(pool as pg.Pool, { schema }) : null;
