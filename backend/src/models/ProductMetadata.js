// models/ProductMetadata.js
import mongoose from "mongoose";

const productMetaSchema = new mongoose.Schema({
  productId: { type: String, required: true, unique: true },
  tags: [String],
  specifications: { type: Object }, // tuỳ biến: kích thước, màu, CPU, RAM,...
  images: [String],
  relatedProducts: [String],
  seo: {
    keywords: [String],
    description: String,
  },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("ProductMetadata", productMetaSchema);
