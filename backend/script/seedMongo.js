// scripts/seedMongo.js
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";

// Chuẩn hóa __dirname khi dùng ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load file .env (có thể đổi nếu bạn chạy từ thư mục khác)
dotenv.config({ path: path.resolve(__dirname, "../../docker/.env") });

import { connectMongo } from "../src/config/mongo.js";
import Review from "../src/models/Review.js";
import ActivityLog from "../src/models/ActivityLog.js";
import ProductMetadata from "../src/models/ProductMetadata.js";

const run = async () => {
  await connectMongo();

  console.log("🧹 Clearing collections...");
  await Promise.all([
    Review.deleteMany({}),
    ActivityLog.deleteMany({}),
    ProductMetadata.deleteMany({}),
  ]);

  console.log("🌱 Seeding data...");

  // ✅ Seed reviews
  await Review.create([
    {
      productId: new mongoose.Types.ObjectId(),
      userId: new mongoose.Types.ObjectId(),
      rating: 5,
      comment: "Sản phẩm tuyệt vời",
      images: [],
    },
    {
      productId: new mongoose.Types.ObjectId(),
      userId: new mongoose.Types.ObjectId(),
      rating: 4,
      comment: "Đáng tiền",
    },
  ]);

  // ✅ Seed metadata
  await ProductMetadata.create({
    productId: new mongoose.Types.ObjectId(),
    tags: ["smartphone", "ios"],
    specifications: { brand: "Apple", model: "iPhone 15", storage: "128GB" },
    images: ["https://example.com/p1-1.jpg"],
  });

  // ✅ Seed activity logs
  await ActivityLog.create({
    userId: new mongoose.Types.ObjectId(),
    action: "VIEW_PRODUCT",
    metadata: { productId: "prod_1" },
  });

  console.log("✅ MongoDB seed complete!");
  process.exit(0);
};

run().catch((err) => {
  console.error("❌ Error during seeding:", err);
  process.exit(1);
});
