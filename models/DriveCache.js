// models/DriveCache.js
import mongoose from "mongoose";

const DriveCacheSchema = new mongoose.Schema({
  userEmail: { type: String, required: true, unique: true },
  files: [
    {
      id: String,
      name: String,
      mimeType: String,
      sizeBytes: Number,
      modifiedTime: String,
    },
  ],
  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.model("DriveCache", DriveCacheSchema);
