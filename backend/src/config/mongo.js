import mongoose from "mongoose";

export const connectMongo = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) throw new Error("MONGO_URI is missing in .env");

    await mongoose.connect(mongoUri);
    console.log("✅ MongoDB connected:", mongoUri.split("@")[1]);
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err.message);
    process.exit(1);
  }
};
