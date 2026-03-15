import 'dotenv/config';
import pkg from 'pg';
const { Pool } = pkg;
const connectionString =
  process.env.DATABASE_URL ?? process.env.SUPABASE_DB_POOLER_URL;
const databaseUrl = new URL(connectionString);

const pool = new Pool({
  host: databaseUrl.hostname,
  port: Number(databaseUrl.port || 5432),
  user: decodeURIComponent(databaseUrl.username),
  password: decodeURIComponent(databaseUrl.password),
  database: databaseUrl.pathname.replace(/^\//, ""),
  ssl: { rejectUnauthorized: false }
});

async function test() {
  try {
    const res = await pool.query('SELECT NOW()');
    console.log('DB Connected:', res.rows[0]);
    await pool.end();
  } catch (err) {
    console.error('DB connection error:', err);
  }
}

test();
