import express from "express";
import cors from "cors";
import axios from "axios";
import { OAuth2Client } from "google-auth-library";

const app = express();
app.use(express.json());

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

// ✅ Disable COOP restriction for Google OAuth popup
app.use((req, res, next) => {
  res.setHeader("Cross-Origin-Opener-Policy", "unsafe-none");
  res.setHeader("Cross-Origin-Embedder-Policy", "unsafe-none");
  next();
});

// ✅ Google OAuth2 Client
const client = new OAuth2Client(
  "485611680613-rim7kuqpc9shbn51t6db7a4ig7e6a9oe.apps.googleusercontent.com"
);

// ✅ Root route test
app.get("/", (req, res) => {
  res.send("✅ AutoCloud backend is running with Google integration");
});

// ✅ GOOGLE LOGIN + REAL DRIVE STORAGE
app.post("/api/auth/google", async (req, res) => {
  try {
    const { access_token } = req.body;
    if (!access_token)
      return res.status(400).json({ message: "Access token missing" });

    // 🔹 Fetch Google profile
    const profileRes = await axios.get(
      "https://www.googleapis.com/oauth2/v2/userinfo",
      {
        headers: { Authorization: `Bearer ${access_token}` },
      }
    );

    // 🔹 Fetch Google Drive usage info
    const driveRes = await axios.get(
      "https://www.googleapis.com/drive/v3/about?fields=storageQuota",
      {
        headers: { Authorization: `Bearer ${access_token}` },
      }
    );
    console.log("🔍 Google Drive API raw:", driveRes.data);

    // Extract storage data
    const quota = driveRes.data.storageQuota || {};
    const total = quota.limit ? quota.limit / (1024 ** 3) : 15; // in GB
    const used = quota.usage ? quota.usage / (1024 ** 3) : 0;
    const free = total - used;
    const usagePercent = ((used / total) * 100).toFixed(1);

    // 🔹 Fetch Gmail info
    const gmailRes = await axios.get(
      "https://www.googleapis.com/gmail/v1/users/me/profile",
      {
        headers: { Authorization: `Bearer ${access_token}` },
      }
    );

    // ✅ Combined user data
    const user = {
      name: profileRes.data.name,
      email: profileRes.data.email,
      picture: profileRes.data.picture,
      drive: {
        totalStorage: total.toFixed(2),
        usedStorage: used.toFixed(2),
        freeStorage: free.toFixed(2),
        usagePercent,
      },
      gmail: gmailRes.data,
    };

    res.json({ user });
  } catch (err) {
    console.error("❌ Google API error:", err.response?.data || err.message);
    res.status(500).json({ message: "Failed to fetch user data" });
  }
});

// ✅ Start server
app.listen(5000, () => {
  console.log("🚀 AutoCloud Server running on http://localhost:5000");
});
