import express from "express";
import cors from "cors";
import axios from "axios";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { OAuth2Client } from "google-auth-library";
import User from "./models/User.js";

dotenv.config();

const app = express();
app.use(express.json());

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use((req, res, next) => {
  res.setHeader("Cross-Origin-Opener-Policy", "unsafe-none");
  res.setHeader("Cross-Origin-Embedder-Policy", "unsafe-none");
  next();
});

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB error:", err));

mongoose.set("debug", false);

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const bytesToGB = (b) => {
  const n = Number(b);
  return n && !isNaN(n) ? n / (1024 ** 3) : 0;
};

// ------------------------------------------------------------------
// GOOGLE LOGIN + STORAGE SYNC
// ------------------------------------------------------------------
app.post("/api/auth/google", async (req, res) => {
  try {
    const { access_token } = req.body;
    if (!access_token)
      return res.status(400).json({ message: "Access token missing" });

    // 1️⃣ Fetch Google user info
    const profileRes = await axios.get(
      "https://www.googleapis.com/oauth2/v2/userinfo",
      { headers: { Authorization: `Bearer ${access_token}` } }
    );

    // 2️⃣ Fetch Drive storage info
    const driveRes = await axios.get(
      "https://www.googleapis.com/drive/v3/about?fields=storageQuota",
      { headers: { Authorization: `Bearer ${access_token}` } }
    );

    const quota = driveRes.data?.storageQuota || {};
    let driveUsageGB = bytesToGB(quota.usageInDrive);
    let gmailUsageGB = bytesToGB(quota.usageInGmail);
    let photosUsageGB = bytesToGB(quota.usageInPhotos);
    let totalUsageGB = bytesToGB(quota.usage);
    let totalLimitGB = bytesToGB(quota.limit) || 15;

    // 🔍 Log what Google actually returns
    console.log("🔍 Raw Google quota:", quota);

    // 🩹 Fallback if missing total usage
    if (!totalUsageGB || totalUsageGB < 0.01) {
      totalUsageGB = driveUsageGB + gmailUsageGB + photosUsageGB;
    }

    // 🧩 If Gmail/Photos missing → estimate from total - drive
    if ((!gmailUsageGB || !photosUsageGB) && totalUsageGB > 0) {
      const remainder = totalUsageGB - driveUsageGB;
      if (remainder > 0) {
        gmailUsageGB = Math.max(remainder * 0.8, 0);
        photosUsageGB = Math.max(remainder * 0.2, 0);
      }
    }

    // 🧠 Ensure sensible limit
    if (!totalLimitGB || totalLimitGB < 1) totalLimitGB = 15;

    // 📊 Log corrected breakdown
    console.log("📊 Corrected Google Storage:", {
      totalLimitGB,
      totalUsageGB,
      driveUsageGB,
      gmailUsageGB,
      photosUsageGB,
    });

    // 3️⃣ Save to DB
    const userData = {
      googleId: profileRes.data.id,
      name: profileRes.data.name,
      email: profileRes.data.email,
      picture: profileRes.data.picture,
      drive: { limit: totalLimitGB, usage: driveUsageGB },
      gmail: { limit: totalLimitGB, usage: gmailUsageGB },
      photos: { limit: totalLimitGB, usage: photosUsageGB },
      mobileBackup: { limit: 10, usage: 0.5 },
      updatedAt: new Date(),
    };

    const user = await User.findOneAndUpdate(
      { email: userData.email },
      userData,
      { new: true, upsert: true, runValidators: true }
    );

    console.log("✅ User synced:", user.email);

    // 4️⃣ Return unified response
    res.json({
      ...user.toObject(),
      totalUsageGB: Number(totalUsageGB.toFixed(2)),
      totalLimitGB: Number(totalLimitGB.toFixed(2)),
    });
  } catch (err) {
    console.error("❌ Google sync failed:", {
      status: err.response?.status,
      data: err.response?.data || err.message,
    });

    res.status(500).json({
      message: "Google sync failed",
      error: err.response?.data || err.message,
    });
  }
});

// ------------------------------------------------------------------
// GET USER (MongoDB)
// ------------------------------------------------------------------
app.get("/api/user/:email", async (req, res) => {
  try {
    const email = decodeURIComponent(req.params.email);
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user.toObject());
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to fetch user", error: err.message });
  }
});

// ------------------------------------------------------------------
// START SERVER
// ------------------------------------------------------------------
app.listen(process.env.PORT || 5000, () => {
  console.log(`🚀 Server running on http://localhost:${process.env.PORT || 5000}`);
});
