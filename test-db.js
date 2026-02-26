import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
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