// models/Notification.js
import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
  userId: String,
  title: String,
  message: String,
  type: {
    type: String,
    enum: ["ORDER", "PROMOTION", "SYSTEM"],
    default: "SYSTEM",
  },
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Notification", notificationSchema);
