const { Pool } = require('pg');

const connectionString = process.env.DATABASE_URL || "postgresql://neondb_owner:npg_kPHUoQT95ifp@ep-misty-mode-ayy0761x.c-5.us-east-2.aws.neon.tech/certitask?sslmode=require";

console.log("Testing connection to Neon DB...");

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 15000,
});

async function test() {
  try {
    const client = await pool.connect();
    console.log("Connected successfully!");
    const res = await client.query("SELECT count(*) FROM users");
    console.log("Users count:", res.rows[0]);
    client.release();
    await pool.end();
  } catch (err) {
    console.error("Connection failed:", err);
  }
}

test();
