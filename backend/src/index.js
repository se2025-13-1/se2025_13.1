import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cron from "node-cron";

import { connectPostgres } from "./config/postgres.js";
import { connectRedis } from "./config/redis.js";
import { AuthRepository } from "./modules/auth/auth.repository.js";

// Import routes
import authRoutes from "./modules/auth/auth.routes.js";
import productRoutes from "./modules/product/product.routes.js";

dotenv.config();

const app = express();

// =========================
// 🧩 MIDDLEWARE GLOBAL
// =========================
// Tăng limit nếu bạn cho phép upload ảnh dạng Base64 (tuy nhiên khuyên dùng Multipart/form-data)
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));

// =========================
// 🛣️ ROUTES
// =========================
app.get("/", (req, res) => {
  res.json({
    message: "Fashion App Backend is running 🚀",
    database: "PostgreSQL",
    cache: "Redis",
  });
});

// Module routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);

// =========================
// ❗ GLOBAL ERROR HANDLER
// =========================
app.use((err, req, res, next) => {
  console.error("❌ GLOBAL ERROR:", err);

  // Xử lý lỗi từ PostgreSQL (ví dụ trùng lặp dữ liệu)
  if (err.code === "23505") {
    return res
      .status(409)
      .json({ error: "Dữ liệu đã tồn tại (Duplicate entry)" });
  }

  return res.status(err.status || 500).json({
    error: err.message || "Internal Server Error",
  });
});

// =========================
// 🕒 CRON JOBS
// =========================
// Cleanup user rác (đăng ký nhưng không active email/sđt quá lâu)
// Hãy đảm bảo userRepository.deleteUnverifiedUser đã viết bằng SQL
cron.schedule("*/10 * * * *", async () => {
  // console.log("🧹 Running Cron: Cleaning unverified users...");
  try {
    if (AuthRepository && AuthRepository.deleteUnverifiedUser) {
      await userRepository.deleteUnverifiedUser();
    }
  } catch (err) {
    console.error("❌ Cron job error:", err);
  }
});

// =========================
// 🚀 START SERVER
// =========================
const startServer = async () => {
  try {
    console.log("--------------------------------------");
    console.log("🔄 Initializing Server...");

    // 1. Kết nối PostgreSQL
    await connectPostgres();

    // 2. Kết nối Redis (Cache)
    // Nếu Redis chết, server vẫn nên chạy (fail-safe), nên ta có thể bắt lỗi riêng
    try {
      await connectRedis();
    } catch (redisErr) {
      console.warn(
        "⚠️ Redis connection failed, cache will be disabled:",
        redisErr.message
      );
    }

    // ❌ 3. Không kết nối Mongo nữa
    // await connectMongo();

    const PORT = process.env.PORT || 3000;
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`✅ Server running at http://localhost:${PORT}`);
      console.log("--------------------------------------");
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
