import pkg from "pg";
const { Pool } = pkg;

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("❌ Missing DATABASE_URL");
}

export const pgPool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false }, // Supabase bắt buộc
  max: 20,
});

export const connectPostgres = async () => {
  try {
    const res = await pgPool.query("SELECT NOW()");
    console.log("✅ PostgreSQL connected successfully:", res.rows[0].now);
  } catch (err) {
    console.error("❌ PostgreSQL connection failed:", err.message);
  }
};
