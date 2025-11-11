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

// ✅ CORS setup for frontend
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

// ✅ Disable COOP/COEP for OAuth popups
app.use((req, res, next) => {
  res.setHeader("Cross-Origin-Opener-Policy", "unsafe-none");
  res.setHeader("Cross-Origin-Embedder-Policy", "unsafe-none");
  next();
});

// ✅ MongoDB connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

mongoose.set("debug", false);

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// ✅ Helper — bytes → GB
const bytesToGB = (b) => {
  const n = Number(b);
  return n && !isNaN(n) ? n / (1024 ** 3) : 0;
};

// ✅ Root route
app.get("/", (req, res) => {
  res.send("✅ AutoCloud backend running with Google integration");
});

// ------------------------------------------------------------------
// GOOGLE LOGIN + STORAGE SYNC
// ------------------------------------------------------------------
app.post("/api/auth/google", async (req, res) => {
  try {
    const { access_token } = req.body;
    if (!access_token)
      return res.status(400).json({ message: "Access token missing" });

    // 1️⃣ Fetch Google user profile
    const profileRes = await axios.get(
      "https://www.googleapis.com/oauth2/v2/userinfo",
      { headers: { Authorization: `Bearer ${access_token}` } }
    );

    // 2️⃣ Fetch total storage info from Drive API v3
    const v3Res = await axios.get(
      "https://www.googleapis.com/drive/v3/about?fields=storageQuota",
      { headers: { Authorization: `Bearer ${access_token}` } }
    );
    const quota = v3Res.data?.storageQuota || {};

    // 3️⃣ Fetch service-wise usage from Drive API v2
    let quotaByService = [];
    try {
      const v2Res = await axios.get(
        "https://www.googleapis.com/drive/v2/about?fields=quotaBytesByService",
        { headers: { Authorization: `Bearer ${access_token}` } }
      );
      quotaByService = v2Res.data?.quotaBytesByService || [];
    } catch (v2Err) {
      console.warn("⚠️ Drive API v2 fallback failed:", v2Err.message);
    }

    // 4️⃣ Extract values safely
    const totalLimitGB = bytesToGB(quota.limit) || 15;
    const totalUsageGB = bytesToGB(quota.usage);

    const driveUsageGB = bytesToGB(
      quotaByService.find((s) => s.serviceName === "DRIVE")?.bytesUsed
    );
    const gmailUsageGB = bytesToGB(
      quotaByService.find((s) => s.serviceName === "GMAIL")?.bytesUsed
    );
    const photosUsageGB = bytesToGB(
      quotaByService.find((s) => s.serviceName === "PHOTOS")?.bytesUsed
    );

    // 5️⃣ Handle missing or inconsistent data
    let correctedGmail = gmailUsageGB;
    let correctedPhotos = photosUsageGB;

    // Fix Gmail/Photos swap if detected
    if (gmailUsageGB > 5 && photosUsageGB < 2) {
      console.warn("⚠️ Gmail/Photos swapped — correcting...");
      [correctedGmail, correctedPhotos] = [photosUsageGB, gmailUsageGB];
    }

    // If any missing, estimate from total usage
    if (!totalUsageGB && (driveUsageGB || correctedGmail || correctedPhotos)) {
      totalUsageGB = driveUsageGB + correctedGmail + correctedPhotos;
    }

    console.log("📊 Final Google Storage Breakdown:", {
      totalLimitGB: totalLimitGB.toFixed(2),
      totalUsageGB: totalUsageGB.toFixed(2),
      driveUsageGB: driveUsageGB.toFixed(2),
      gmailUsageGB: correctedGmail.toFixed(2),
      photosUsageGB: correctedPhotos.toFixed(2),
    });

    // 6️⃣ Build user object
    const userData = {
      googleId: profileRes.data.id,
      name: profileRes.data.name,
      email: profileRes.data.email,
      picture: profileRes.data.picture,
      drive: { limit: totalLimitGB, usage: driveUsageGB },
      gmail: { limit: totalLimitGB, usage: correctedGmail },
      photos: { limit: totalLimitGB, usage: correctedPhotos },
      mobileBackup: { limit: 10, usage: 0.5 },
      updatedAt: new Date(),
    };

    // 7️⃣ Save or update in MongoDB
    const user = await User.findOneAndUpdate(
      { email: userData.email },
      userData,
      { new: true, upsert: true, runValidators: true }
    );

    console.log("✅ User synced successfully:", user.email);

    // 8️⃣ Return clean JSON
    res.json({
      ...user.toObject(),
      totalUsageGB: Number(totalUsageGB.toFixed(2)),
      totalLimitGB: Number(totalLimitGB.toFixed(2)),
    });
  } catch (err) {
    console.error("❌ Google sync failed:", err.message);
    res.status(500).json({
      message: "Google sync failed",
      error: err.response?.data || err.message,
    });
  }
});

// ------------------------------------------------------------------
// FETCH USER BY EMAIL
// ------------------------------------------------------------------
app.get("/api/user/:email", async (req, res) => {
  try {
    const email = decodeURIComponent(req.params.email);
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user.toObject());
  } catch (err) {
    console.error("❌ Fetch user error:", err.message);
    res.status(500).json({ message: "Failed to fetch user", error: err.message });
  }
});

// ------------------------------------------------------------------
// START SERVER
// ------------------------------------------------------------------
app.listen(process.env.PORT || 5000, () => {
  console.log(`🚀 Server running on http://localhost:${process.env.PORT || 5000}`);
});
