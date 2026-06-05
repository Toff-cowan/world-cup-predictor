import dns from "node:dns";
import pg from "pg";
import dotenv from "dotenv";

// Supabase direct host (db.*.supabase.co) is often IPv6-only; fixes ENOTFOUND on Windows
dns.setDefaultResultOrder("ipv4first");

dotenv.config();

const connectionString = process.env.DATABASE_URL;
const useSsl =
  process.env.DATABASE_SSL === "true" ||
  /supabase\.com|render\.com|neon\.tech/i.test(connectionString || "");

const pool = new pg.Pool({
  connectionString,
  ssl: useSsl ? { rejectUnauthorized: false } : undefined,
});

pool.on("error", (err) => {
  console.error("Unexpected DB error", err);
});

export default pool;
