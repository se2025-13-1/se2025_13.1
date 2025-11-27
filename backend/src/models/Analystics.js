// models/Analytics.js
import mongoose from "mongoose";

const analyticsSchema = new mongoose.Schema({
  event: String, // VIEW_PRODUCT, SEARCH, ADD_TO_CART
  productId: String,
  userId: String,
  timestamp: { type: Date, default: Date.now },
  device: String,
  platform: String,
});

analyticsSchema.index({ event: 1, productId: 1 });

export default mongoose.model("Analytics", analyticsSchema);
