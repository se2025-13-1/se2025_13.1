// models/Review.js
import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
  productId: { type: String, required: true },
  userId: { type: String, required: true },
  rating: { type: Number, min: 1, max: 5 },
  comment: String,
  images: [String],
  likes: { type: Number, default: 0 },
  replies: [
    {
      userId: String,
      comment: String,
      createdAt: { type: Date, default: Date.now },
    },
  ],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

reviewSchema.index({ productId: 1 });

export default mongoose.model("Review", reviewSchema);
