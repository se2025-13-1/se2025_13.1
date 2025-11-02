import express from "express";
import dotenv from "dotenv";

import { connectPostgres } from "./config/postgres.js";
import { connectMongo } from "./config/mongo.js";
import { connectRedis } from "./config/redis.js";

dotenv.config();

const app = express();
app.use(express.json());

// 🧠 Route test để kiểm tra backend
app.get("/", (req, res) => {
  res.json({ message: "Backend is running 🚀" });
});

// ⚙️ Hàm khởi động server
const startServer = async () => {
  try {
    console.log("🔄 Connecting to databases...");

    await connectPostgres();
    await connectMongo();
    await connectRedis();

    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1); // Dừng lại nếu có lỗi kết nối DB
  }
};

startServer();
