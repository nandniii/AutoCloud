import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  googleId: String,
  name: String,
  email: { type: String, unique: true },
  picture: String,
  access_token: String,
  drive: { limit: Number, usage: Number },
  gmail: { limit: Number, usage: Number },
  photos: { limit: Number, usage: Number },
  mobileBackup: { limit: Number, usage: Number },
  totalUsageGB: Number,
  totalLimitGB: Number,
  updatedAt: Date,
});

export default mongoose.model("User", userSchema);
