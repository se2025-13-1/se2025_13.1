<<<<<<< HEAD
import pkg from "pg";
const { Pool } = pkg;

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("❌ Missing DATABASE_URL");
=======
// src/config/postgres.js
import pkg from "pg";
import dns from "dns";
const { Pool } = pkg;

// Ép Node ưu tiên IPv4
dns.setDefaultResultOrder("ipv4first");

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("❌ Missing DATABASE_URL in environment variables");
>>>>>>> origin/dev
}

export const pgPool = new Pool({
  connectionString,
<<<<<<< HEAD
  ssl: { rejectUnauthorized: false }, // Supabase bắt buộc
  max: 20,
=======
  ssl: { rejectUnauthorized: false },
  family: 4, // ép dùng IPv4 thay vì IPv6
>>>>>>> origin/dev
});

export const connectPostgres = async () => {
  try {
    const res = await pgPool.query("SELECT NOW()");
<<<<<<< HEAD
    console.log("✅ PostgreSQL connected successfully:", res.rows[0].now);
  } catch (err) {
    console.error("❌ PostgreSQL connection failed:", err.message);
=======
    console.log("✅ PostgreSQL connected:", res.rows[0].now);
  } catch (err) {
    console.error("❌ PostgreSQL connection failed:", err.message);
    throw err;
>>>>>>> origin/dev
  }
};
