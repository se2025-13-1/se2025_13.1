// src/config/postgres.js
import pkg from "pg";
import dns from "dns";
const { Pool } = pkg;

// Ép Node ưu tiên IPv4
dns.setDefaultResultOrder("ipv4first");

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("❌ Missing DATABASE_URL in environment variables");
}

export const pgPool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
  family: 4, // ép dùng IPv4 thay vì IPv6
});

export const connectPostgres = async () => {
  try {
    const res = await pgPool.query("SELECT NOW()");
    console.log("✅ PostgreSQL connected:", res.rows[0].now);
  } catch (err) {
    console.error("❌ PostgreSQL connection failed:", err.message);
    throw err;
  }
};
