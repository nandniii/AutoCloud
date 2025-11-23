import mongoose from "mongoose";

const cleanupRuleSchema = new mongoose.Schema({
  email: { type: String, required: true },
  rules: { type: Array, default: [] },   // Rules created in UI
  updatedAt: { type: Date, default: Date.now }
});

export default mongoose.model("CleanupRule", cleanupRuleSchema);
