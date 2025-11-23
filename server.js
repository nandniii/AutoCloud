// server.js
import express from "express";
import cors from "cors";
import axios from "axios";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { google } from "googleapis";
import { OAuth2Client } from "google-auth-library";

import DriveCache from "./models/DriveCache.js";
import User from "./models/User.js";
import { Trash } from "./models/Trash.js";

dotenv.config();
const app = express();
app.use(express.json({ limit: "10mb" }));

// ✅ CORS FIX (supports both localhost and 127.0.0.1)
app.use(
  cors({
    origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
    credentials: true,
  })
);

// ✅ Debugging: log every request
app.use((req, res, next) => {
  console.log(`📡 ${req.method} → ${req.url}`);
  next();
});

// ✅ MongoDB connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ Mongo Error:", err));

const oauthClientFactory = () =>
  new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Root route
app.get("/", (req, res) => res.send("Backend Running ✔"));

// ✅ Google Auth
app.post("/api/auth/google", async (req, res) => {
  try {
    const { access_token } = req.body;
    if (!access_token)
      return res.status(400).json({ message: "Access token missing" });

    const profileRes = await axios.get(
      "https://www.googleapis.com/oauth2/v2/userinfo",
      { headers: { Authorization: `Bearer ${access_token}` } }
    );

    const quotaRes = await axios.get(
      "https://www.googleapis.com/drive/v3/about?fields=storageQuota",
      { headers: { Authorization: `Bearer ${access_token}` } }
    );

    const quota = quotaRes.data.storageQuota || {};

    const userData = {
      googleId: profileRes.data.id,
      name: profileRes.data.name,
      email: profileRes.data.email,
      picture: profileRes.data.picture,
      access_token,
      totalUsageGB: (quota.usage || 0) / 1024 ** 3,
      totalLimitGB: (quota.limit || 0) / 1024 ** 3,
      updatedAt: new Date(),
    };

    const user = await User.findOneAndUpdate(
      { email: userData.email },
      userData,
      { new: true, upsert: true }
    );

    res.json(user);
  } catch (err) {
    console.error("Auth Error:", err.response?.data || err.message);
    res.status(500).json({ error: err.message });
  }
});

// ✅ Helper to fetch all files
async function fetchAllDriveFiles(authClient) {
  const drive = google.drive({ version: "v3", auth: authClient });
  const files = [];
  let pageToken = null;

  do {
    const resp = await drive.files.list({
      fields:
        "nextPageToken, files(id,name,size,mimeType,createdTime,modifiedTime,quotaBytesUsed,trashed)",
      pageSize: 200,
      pageToken,
      q: "trashed = false",
    });
    files.push(...(resp.data.files || []));
    pageToken = resp.data.nextPageToken;
  } while (pageToken);

  return files;
}

// ✅ Cleanup / Preview / Delete
app.post("/api/cleanup/drive", async (req, res) => {
  try {
    const {
      access_token,
      rules = [],
      previewOnly = true,
      email,
      forceRefresh = false,
    } = req.body;

    if (!access_token) return res.status(400).json({ message: "Missing token" });
    if (!email) return res.status(400).json({ message: "Missing email" });

    const oauth = oauthClientFactory();
    oauth.setCredentials({ access_token });

    const CACHE_TTL_MS = 3 * 60 * 60 * 1000; // 3 hrs
    let files = [];
    let fromCache = false;

    // 🧠 Cache check
    const existingCache = await DriveCache.findOne({ userEmail: email });
    const cacheIsFresh =
      existingCache &&
      Date.now() - existingCache.updatedAt.getTime() < CACHE_TTL_MS;

    if (cacheIsFresh && !forceRefresh && existingCache.files?.length > 0) {
      files = existingCache.files;
      fromCache = true;
      console.log(`⚡ Using cached Drive data for ${email}`);
    } else {
      console.log(`🔄 Fetching fresh Drive data for ${email}`);
      const fetchedFiles = await fetchAllDriveFiles(oauth);

      const safeFiles = fetchedFiles.map((f) => ({
        id: f.id,
        name: f.name || "",
        mimeType: f.mimeType || "unknown",
        size: f.size || f.quotaBytesUsed || "0",
        modifiedTime: f.modifiedTime || null,
        createdTime: f.createdTime || null,
      }));

      await DriveCache.findOneAndUpdate(
        { userEmail: email },
        { files: safeFiles, updatedAt: new Date() },
        { upsert: true, new: true }
      );

      files = safeFiles;
    }

    console.log(`📦 Total files loaded: ${files.length}`);

    // 🧩 Apply rules
    const matchedFiles = [];
    for (const f of files) {
      if (f.mimeType === "application/vnd.google-apps.folder") continue;

      const name = (f.name || "").toLowerCase();
      const sizeBytes = Number(f.size || 0);
      const sizeMB = sizeBytes / (1024 * 1024);
      const modified = f.modifiedTime ? new Date(f.modifiedTime).getTime() : 0;
      const ageDays = modified
        ? (Date.now() - modified) / (1000 * 60 * 60 * 24)
        : 0;

      for (const rule of rules) {
        if (!rule.enabled) continue;
        const pattern = (rule.pattern || "").toLowerCase().trim();
        const val = (rule.value || "").toString().trim();
        if (!pattern || !val) continue;

        let pMatch = pattern.startsWith(".")
          ? name.endsWith(pattern)
          : name.includes(pattern);

        let cMatch = false;
        if (rule.condition === "older-than") cMatch = ageDays > Number(val);
        else if (rule.condition === "larger-than") cMatch = sizeMB > Number(val);
        else if (rule.condition === "contains")
          cMatch = name.includes(val.toLowerCase());

        if (pMatch && cMatch) {
          matchedFiles.push({
            id: f.id,
            name: f.name,
            mimeType: f.mimeType,
            sizeBytes,
            modifiedTime: f.modifiedTime,
          });
          break;
        }
      }
    }

    console.log(`✅ Matched ${matchedFiles.length} files`);

    if (previewOnly) {
      return res.json({
        success: true,
        mode: "preview",
        fromCache,
        summary: { scanned: files.length, matched: matchedFiles.length },
        matchedFiles,
      });
    }

    // Mock Delete
    const deletedItems = matchedFiles.map((file) => ({
      ...file,
      deletedAt: new Date(),
    }));

    for (const file of deletedItems) {
      await Trash.findOneAndUpdate(
        { userEmail: email, fileId: file.id },
        {
          userEmail: email,
          fileId: file.id,
          name: file.name,
          mimeType: file.mimeType,
          sizeBytes: file.sizeBytes,
          deletedAt: new Date(),
          expiryAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          accessToken: access_token,
        },
        { upsert: true, new: true }
      );
    }

    const deletedCount = deletedItems.length;

    return res.json({
      success: true,
      mode: "delete",
      message:
        deletedCount > 0
          ? `✅ ${deletedCount} file${deletedCount > 1 ? "s" : ""} deleted successfully!`
          : "No files matched cleanup rules.",
      deletedCount,
      deletedFiles: deletedItems,
    });
  } catch (err) {
    console.error("🔥 Cleanup Error:", err.response?.data || err.message);
    res.status(500).json({ error: err.message });
  }
});

// ✅ History Route
app.post("/api/history", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Missing email" });

    const files = await Trash.find({ userEmail: email }).sort({ deletedAt: -1 });

    res.json({
      success: true,
      history: files.map((f) => ({
        id: f._id,
        fileId: f.fileId,
        name: f.name,
        sizeBytes: f.sizeBytes,
        date: f.deletedAt,
        source: "Google Drive",
        accessToken: f.accessToken,
      })),
    });
  } catch (err) {
    console.error("🔥 History Route Error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// ✅ Dashboard Route (🔧 FIXED)
app.post("/api/dashboard", async (req, res) => {
  try {
    const { access_token } = req.body;
    if (!access_token)
      return res.status(400).json({ message: "Missing access_token" });

    console.log("🟢 Dashboard route hit");
    console.log("🔑 Access token (first 10 chars):", access_token.slice(0, 10));

    const oauth = oauthClientFactory();
    oauth.setCredentials({ access_token });

    const drive = google.drive({ version: "v3", auth: oauth });

    // 🚨 Debug: catch if Google auth fails
    try {
      const quotaRes = await drive.about.get({ fields: "storageQuota" });
      const quota = quotaRes.data.storageQuota;

      const mediaRes = await drive.files.list({
        q: "mimeType contains 'image/' or mimeType contains 'video/'",
        fields: "files(id,name,mimeType,size,webViewLink)",
        pageSize: 10,
      });

      const mediaFiles = (mediaRes.data.files || []).map((f) => ({
        id: f.id,
        name: f.name,
        mimeType: f.mimeType,
        sizeMB: (f.size || 0) / (1024 * 1024),
        previewLink: f.webViewLink,
      }));

      return res.json({
        success: true,
        quota: {
          totalUsageGB: (quota.usage || 0) / 1024 ** 3,
          totalLimitGB: (quota.limit || 0) / 1024 ** 3,
          driveUsageGB: (quota.usageInDrive || 0) / 1024 ** 3,
          gmailUsageGB: (quota.usageInGmail || 0) / 1024 ** 3,
          photosUsageGB: (quota.usageInPhotos || 0) / 1024 ** 3,
        },
        media: mediaFiles,
      });
    } catch (googleErr) {
      console.error("🔥 Google API Error:", googleErr.response?.data || googleErr.message);
      return res.status(401).json({
        success: false,
        error: "Invalid or expired Google access token",
      });
    }
  } catch (err) {
    console.error("🔥 DASHBOARD ERROR DETAILS:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// ✅ Start Server
const PORT = process.env.PORT || 5000;
const HOST = "127.0.0.1"; // fix connection issues
app.listen(PORT, HOST, () =>
  console.log(`🚀 Server running → http://${HOST}:${PORT}`)
);
