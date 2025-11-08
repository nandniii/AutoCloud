import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    googleId: { type: String, required: true, unique: true }, // ✅ Missing field
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    picture: { type: String },

    drive: {
      limit: { type: Number, default: 15 * 1024 ** 3 }, // bytes or GB
      usage: { type: Number, default: 0 },
    },

    gmail: {
      limit: { type: Number, default: 15 * 1024 ** 3 },
      usage: { type: Number, default: 0 },
    },

    photos: {
      limit: { type: Number, default: 15 * 1024 ** 3 },
      usage: { type: Number, default: 0 },
    },

    mobileBackup: {
      limit: { type: Number, default: 10 * 1024 ** 3 },
      usage: { type: Number, default: 0 },
    },

    // optional extra stats (future)
    usageTrends: [{ month: String, usage: Number }],
    cleanupStats: [{ month: String, cleaned: Number }],
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
