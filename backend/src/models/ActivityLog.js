// models/ActivityLog.js
import mongoose from "mongoose";

const activitySchema = new mongoose.Schema({
  userId: { type: String, required: true },
  action: { type: String, required: true }, // LOGIN, VIEW_PRODUCT, ADD_TO_CART, CHECKOUT, UPDATE_ORDER,...
  metadata: { type: Object },
  createdAt: { type: Date, default: Date.now },
});

// Tự động xóa sau 30 ngày
activitySchema.index({ createdAt: 1 }, { expireAfterSeconds: 2592000 });

export default mongoose.model("ActivityLog", activitySchema);
