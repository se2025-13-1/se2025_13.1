import express from "express";
import pkg from "pg";
import mongoose from "mongoose";
import { createClient } from "redis";

const { Pool } = pkg;
const app = express();

// PostgreSQL
const pgPool = new Pool({
  host: process.env.POSTGRES_HOST,
  port: process.env.POSTGRES_PORT,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
  ssl: { rejectUnauthorized: false }, // Supabase yêu cầu SSL
});

// MongoDB
const mongoUri = process.env.MONGO_URI;
mongoose
  .connect(mongoUri)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB error:", err));

// Redis
const redisClient = createClient({
  url: process.env.REDIS_URL,
});
redisClient
  .connect()
  .then(() => console.log("✅ Redis connected"))
  .catch((err) => console.error("❌ Redis error:", err));

// Express
app.get("/", async (req, res) => {
  try {
    const result = await pgPool.query("SELECT NOW()");
    res.json({
      message: "Hello from backend 🚀",
      postgres_time: result.rows[0],
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
