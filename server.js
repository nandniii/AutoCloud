const express = require("express");
const axios = require("axios");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Google login route
app.post("/api/auth/google", async (req, res) => {
  const { access_token } = req.body;

  try {
    // 1️⃣ Get basic user info
    const userInfoRes = await axios.get(
      "https://www.googleapis.com/oauth2/v2/userinfo",
      { headers: { Authorization: `Bearer ${access_token}` } }
    );
    const user = userInfoRes.data; // {name, email, picture}

    // 2️⃣ Get Google Drive storage info
    const driveRes = await axios.get(
      "https://www.googleapis.com/drive/v3/about?fields=storageQuota",
      { headers: { Authorization: `Bearer ${access_token}` } }
    );
    const storage = driveRes.data.storageQuota;

    // 3️⃣ Approximate Gmail usage (counts toward Drive storage)
    const gmailUsage = storage.usageInDrive ? parseInt(storage.usageInDrive) : 0;

    // 4️⃣ Prepare final user object
    const userData = {
      name: user.name,
      email: user.email,
      picture: user.picture,
      drive: {
        limit: parseInt(storage.limit || 15 * 1024 ** 3), // fallback 15GB
        usage: parseInt(storage.usage || 0),
      },
      gmail: {
        limit: parseInt(storage.limit || 15 * 1024 ** 3),
        usage: gmailUsage,
      },
      photos: {
        limit: parseInt(storage.limit || 15 * 1024 ** 3),
        usage: 0, // Google Photos API doesn't provide usage easily
      },
    };

    res.json({ user: userData });
  } catch (err) {
    console.error("Google login error:", err.response?.data || err.message);
    res.status(500).json({ error: "Failed to fetch Google data" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
