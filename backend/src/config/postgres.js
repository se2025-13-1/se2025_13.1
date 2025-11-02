import pkg from "pg";
import dns from "dns";
const { Pool } = pkg;

// Ép Node ưu tiên IPv4 (tránh lỗi ENETUNREACH)
dns.setDefaultResultOrder("ipv4first");

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("❌ Missing DATABASE_URL in environment variables");
}

const pgPool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
  family: 6, // ép IPv4
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

export default pgPool;
