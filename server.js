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

// ✅ Enable CORS for frontend (React)
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

// ✅ Disable COOP for Google OAuth popup
app.use((req, res, next) => {
  res.setHeader("Cross-Origin-Opener-Policy", "unsafe-none");
  res.setHeader("Cross-Origin-Embedder-Policy", "unsafe-none");
  next();
});

// ✅ MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

mongoose.set("debug", true); // Logs MongoDB operations

// ✅ Google OAuth2 Client
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// ✅ Root Route
app.get("/", (req, res) => {
  res.send("✅ AutoCloud backend running with Google integration");
});

// ✅ Google Login & Sync Route
app.post("/api/auth/google", async (req, res) => {
  try {
    const { access_token } = req.body;
    if (!access_token)
      return res.status(400).json({ message: "Access token missing" });

    // 1️⃣ Verify granted scopes (for debugging)
    const tokenInfo = await axios.get(
      `https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=${access_token}`
    );
    console.log("🔍 Granted Scopes:", tokenInfo.data.scope);

    // 2️⃣ Fetch Google Profile
    const profileRes = await axios.get(
      "https://www.googleapis.com/oauth2/v2/userinfo",
      { headers: { Authorization: `Bearer ${access_token}` } }
    );

    // 3️⃣ Fetch Drive Storage Info
    const driveRes = await axios.get(
      "https://www.googleapis.com/drive/v3/about?fields=storageQuota",
      { headers: { Authorization: `Bearer ${access_token}` } }
    );

    const quota = driveRes.data.storageQuota || {};
    const bytesToGB = (b) => (b ? b / (1024 ** 3) : 0);

    const totalLimitGB = bytesToGB(Number(quota.limit) || 15 * 1024 ** 3);
    const totalUsageGB = bytesToGB(Number(quota.usage));
    const driveUsageGB = bytesToGB(Number(quota.usageInDrive));
    const gmailUsageGB = bytesToGB(Number(quota.usageInGmail));
    const photosUsageGB = bytesToGB(Number(quota.usageInPhotos));

    console.log("📊 Google Storage Breakdown:", {
      totalUsageGB,
      driveUsageGB,
      gmailUsageGB,
      photosUsageGB,
    });

    // 4️⃣ Gmail usage fallback (if API didn’t return it)
    let gmailUsage = gmailUsageGB;
     if (!gmailUsage) {
      try {
        const gmailRes = await axios.get("https://www.googleapis.com/gmail/v1/users/me/profile", {
          headers: { Authorization: `Bearer ${access_token}` },
        });
        if (gmailRes.data?.quotaUsed)
          gmailUsage = bytesToGB(gmailRes.data.quotaUsed);
      } catch (err) {
        console.warn("⚠️ Gmail usage unavailable, estimating...");
      }
    }

    // 5️⃣ Photos usage fallback (approximation)
    let photosUsage = photosUsageGB;
    if (!photosUsage) {
      try {
        const photosRes = await axios.get("https://photoslibrary.googleapis.com/v1/albums?pageSize=1", {
          headers: { Authorization: `Bearer ${access_token}` },
        });
        if (photosRes.data)
          photosUsage = 1.2; // fallback estimate
      } catch (err) {
        console.warn("⚠️ Photos usage unavailable, using fallback...");
      }
    }

    // 6️⃣ Mobile Backup placeholder
    const mobileUsage = 0.5;

    // 7️⃣ Construct user data
    const userData = {
      googleId: profileRes.data.id,
      name: profileRes.data.name,
      email: profileRes.data.email,
      picture: profileRes.data.picture,
      drive: { limit: totalLimitGB, usage: driveUsageGB },
      gmail: { limit: totalLimitGB, usage: gmailUsage },
      photos: { limit: totalLimitGB, usage: photosUsage },
      mobileBackup: { limit: 10, usage: mobileUsage },
      updatedAt: new Date(),
    };

    // 8️⃣ Save or Update in MongoDB
    const user = await User.findOneAndUpdate(
      { email: userData.email },
      userData,
      { new: true, upsert: true, runValidators: true }
    );

    console.log("✅ User synced:", user.email);
    res.json({ user });
  } catch (err) {
    console.error("❌ Insert error:", err.message);
    res.status(500).json({ message: "Insert failed", error: err.message });
  }
});

// ✅ Fetch user by email (for Dashboard)
app.get("/api/user/:email", async (req, res) => {
  try {
    const email = decodeURIComponent(req.params.email);
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    console.error("❌ Fetch user error:", err.message);
    res
      .status(500)
      .json({ message: "Failed to fetch user", error: err.message });
  }
});

// ✅ Start Server
app.listen(process.env.PORT || 5000, () => {
  console.log(
    `🚀 Server running on http://localhost:${process.env.PORT || 5000}`
  );
});
