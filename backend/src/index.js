import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cron from "node-cron";

import { connectPostgres } from "./config/postgres.js";
import { connectMongo } from "./config/mongo.js";
import { connectRedis } from "./config/redis.js";
import { userRepository } from "./modules/auth/auth.repository.js";

// Import routes (module-based)
import authRoutes from "./modules/auth/auth.routes.js";
import productRoutes from "./modules/product/product.routes.js"; // ⬅️ nhớ thêm module này sau

dotenv.config();

const app = express();

// =========================
// 🧩 MIDDLEWARE GLOBAL
// =========================
app.use(express.json({ limit: "10mb" }));
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));

// =========================
// 🛣️ ROUTES
// =========================
app.get("/", (req, res) => {
  res.json({ message: "Backend is running 🚀" });
});

// Module routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes); // ⬅️ Product module

// =========================
// ❗ GLOBAL ERROR HANDLER
// =========================
app.use((err, req, res, next) => {
  console.error("❌ GLOBAL ERROR:", err);

  return res.status(err.status || 500).json({
    error: err.message || "Internal Server Error",
  });
});

// =========================
// 🕒 CRON JOBS
// =========================
// Cleanup user chưa xác thực sau 10 phút
cron.schedule("*/10 * * * *", async () => {
  console.log("🧹 Dọn dẹp user chưa xác thực...");
  try {
    await userRepository.deleteUnverifiedUser();
  } catch (err) {
    console.error("❌ Cron job error:", err);
  }
});

// =========================
// 🚀 START SERVER
// =========================
const startServer = async () => {
  try {
    console.log("🔄 Connecting to databases...");

    await connectPostgres();
    await connectMongo();
    await connectRedis();

    const PORT = process.env.PORT || 3000;
    app.listen(PORT, "0.0.0.0", () =>
      console.log(`🚀 Server running at http://localhost:${PORT}`)
    );
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
