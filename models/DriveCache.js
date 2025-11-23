import mongoose from "mongoose";

const DriveCacheSchema = new mongoose.Schema({
  userEmail: { type: String, required: true, unique: true },
  files: [
    {
      id: String,
      name: String,
      mimeType: String,
      size: String,
      modifiedTime: String,
      createdTime: String,
      trashed: Boolean,
    },
  ],
  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.model("DriveCache", DriveCacheSchema);
