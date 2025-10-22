import express from "express";
import pkg from "pg";
import mongoose from "mongoose";
import { createClient } from "redis";

const { Pool } = pkg;
const app = express();

// PostgreSQL
const pgPool = new Pool({
  host: process.env.POSTGRES_HOST || "postgres_db",
  port: process.env.POSTGRES_PORT || 5432,
  user: process.env.POSTGRES_USER || "postgres",
  password: process.env.POSTGRES_PASSWORD || "password",
  database: process.env.POSTGRES_DB || "mydb",
});

// MongoDB
const mongoUri = process.env.MONGO_URI || "mongodb://mongo_db:27017/myapp";
mongoose
  .connect(mongoUri)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB error:", err));

// Redis
const redisClient = createClient({
  url: process.env.REDIS_URL || "redis://redis_cache:6379",
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
