import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import { connectPostgres } from "./config/postgres.js";
import { connectMongo } from "./config/mongo.js";
import { connectRedis } from "./config/redis.js";

// 🧩 Import routes
import authRoutes from "./modules/auth/auth.routes.js";

dotenv.config();

const app = express();

// 🧠 Middleware cơ bản
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));

// 🧭 Routes
app.use("/api/auth", authRoutes);

// 🧪 Route test
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
    process.exit(1);
  }
};

startServer();
