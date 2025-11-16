// server.js
import express from "express";
import cors from "cors";
import axios from "axios";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { google } from "googleapis";
import { OAuth2Client } from "google-auth-library";

import User from "./models/User.js";
import { Trash } from "./models/Trash.js";

dotenv.config();
const app = express();
app.use(express.json({ limit: "10mb" }));

// CORS
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

// Allow Google popup
app.use((req, res, next) => {
  res.setHeader("Cross-Origin-Opener-Policy", "unsafe-none");
  res.setHeader("Cross-Origin-Embedder-Policy", "unsafe-none");
  next();
});

// DB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error("Mongo Error:", err));

const oauthClientFactory = () =>
  new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// ========== ROOT ==========
app.get("/", (req, res) => res.send("Backend Running ✔"));

// ========== AUTH ==========
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

// ========== FETCH ALL DRIVE FILES ==========
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

// ========== CLEANUP / PREVIEW + DELETE ==========
app.post("/api/cleanup/drive", async (req, res) => {
  try {
    const { access_token, rules = [], previewOnly = true, email } = req.body;

    if (!access_token) return res.status(400).json({ message: "Missing token" });
    if (!email) return res.status(400).json({ message: "Missing email" });

    const oauth = oauthClientFactory();
    oauth.setCredentials({ access_token });

    const drive = google.drive({ version: "v3", auth: oauth });
    const files = await fetchAllDriveFiles(oauth);

    const matchedFiles = [];

    // RULES
    for (const f of files) {
      if (f.mimeType === "application/vnd.google-apps.folder") continue;

      const name = (f.name || "").toLowerCase();
      const sizeBytes = Number(f.size || f.quotaBytesUsed || 0);
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

    // PREVIEW MODE → SAVE TO DB ONLY
    if (previewOnly) {
      for (const file of matchedFiles) {
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

      return res.json({
        success: true,
        mode: "preview",
        summary: { scanned: files.length, matched: matchedFiles.length },
        matchedFiles,
      });
    }

    // DELETE MODE → MOVE TO GOOGLE BIN
    const deletedItems = [];

    for (const file of matchedFiles) {
      try {
        await drive.files.update({
          fileId: file.id,
          resource: { trashed: true },
        });
        deletedItems.push(file);
      } catch (e) {
        console.log(
          "Failed to delete file:",
          file.id,
          "-",
          e.response?.data?.error?.message || e.message
        );
      }
    }

    return res.json({
      success: true,
      mode: "delete",
      summary: {
        scanned: files.length,
        matched: matchedFiles.length,
        movedToBin: deletedItems.length,
      },
      binItems: deletedItems,
    });
  } catch (err) {
    console.error("Cleanup Error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// ========== HISTORY API ==========
app.post("/api/history", async (req, res) => {
  try {
    const { email, filter } = req.body;

    if (!email) return res.status(400).json({ message: "Missing email" });

    const query = { userEmail: email };

    if (filter === "7") {
      query.deletedAt = {
        $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      };
    }

    const files = await Trash.find(query).sort({ deletedAt: -1 });

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
    console.error("History error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// ========== RESTORE ==========
app.post("/api/bin/restore", async (req, res) => {
  try {
    const { fileId, access_token } = req.body;

    if (!fileId || !access_token) {
      return res
        .status(400)
        .json({ message: "Missing fileId or access_token" });
    }

    const oauth = oauthClientFactory();
    oauth.setCredentials({ access_token });
    const drive = google.drive({ version: "v3", auth: oauth });

    let fileMeta;

    try {
      fileMeta = await drive.files.get({
        fileId,
        fields: "id, trashed",
      });
    } catch (err) {
      if (err.response?.status === 404) {
        await Trash.deleteOne({ fileId });
        return res.json({
          success: false,
          restored: false,
          message: "File permanently deleted from Google Drive",
        });
      }
      throw err;
    }

    if (fileMeta.data?.trashed) {
      await drive.files.update({
        fileId,
        resource: { trashed: false },
      });
    }

    await Trash.deleteOne({ fileId });

    res.json({
      success: true,
      restored: true,
      message: "File successfully restored",
    });
  } catch (err) {
    console.error("Restore error:", err.message);
    res.status(500).json({ error: err.message });
  }
});


// ========== DASHBOARD API ==========
app.post("/api/dashboard", async (req, res) => {
  try {
    const { access_token } = req.body;

    if (!access_token) {
      return res.status(400).json({ message: "Missing access_token" });
    }

    // Correct Google OAuth client
    const oauth = new OAuth2Client();
    oauth.setCredentials({ access_token });

    const drive = google.drive({ version: "v3", auth: oauth });

    // ---- Fetch Quota ----
    const quotaRes = await drive.about.get({
      fields: "storageQuota",
    });

    const q = quotaRes.data.storageQuota;

    // ---- Fetch Images + Videos ----
    const mediaRes = await drive.files.list({
      q: "mimeType contains 'image/' or mimeType contains 'video/'",
      fields: "files(id,name,mimeType,size,webViewLink)",
      pageSize: 100,
    });

    const mediaFiles = (mediaRes.data.files || []).map((f) => ({
      id: f.id,
      name: f.name,
      mimeType: f.mimeType,
      sizeMB: (f.size || 0) / (1024 * 1024),
      previewLink: f.webViewLink,
    }));

    return res.json({
      quota: {
        totalUsageGB: (q.usage || 0) / 1024 ** 3,
        totalLimitGB: (q.limit || 0) / 1024 ** 3,
        driveUsageGB: (q.usageInDrive || 0) / 1024 ** 3,
        gmailUsageGB: (q.usageInGmail || 0) / 1024 ** 3,
        photosUsageGB: (q.usageInPhotos || 0) / 1024 ** 3,
      },
      media: mediaFiles,
    });
  } catch (err) {
    console.error("🔥 DASHBOARD ERROR:", err.response?.data || err.message);
    return res.status(500).json({ error: "Dashboard failed" });
  }
});


// START SERVER
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`Server running → http://localhost:${PORT}`)
);
