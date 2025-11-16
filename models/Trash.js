import mongoose from "mongoose";

const TrashSchema = new mongoose.Schema({
  userEmail: { type: String, required: true },
  fileId: { type: String, required: true },
  name: { type: String, required: true },
  mimeType: { type: String },
  sizeBytes: { type: Number, default: 0 },
  deletedAt: { type: Date, default: Date.now },
  expiryAt: { type: Date, required: true },
  accessToken: { type: String, required: true },
});

// ⭐ Named export instead of default
export const Trash = mongoose.model("Trash", TrashSchema);
