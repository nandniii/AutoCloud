const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { google } = require("googleapis");
const axios = require("axios");

// ----------------- EMAIL/PASSWORD LOGIN -----------------
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ----------------- GOOGLE LOGIN -----------------
router.post("/google", async (req, res) => {
  const { access_token } = req.body;

  try {
    // Fetch user info
    const { data: googleUser } = await axios.get(
      `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${access_token}`
    );

    let user = await User.findOne({ googleId: googleUser.id });
    if (!user) {
      // Create new user
      user = new User({
        googleId: googleUser.id,
        email: googleUser.email,
        name: googleUser.name,
      });
    }

    // ---------------- FETCH DRIVE USAGE ----------------
    const drive = google.drive({ version: "v3", auth: access_token });
    const driveRes = await drive.about.get({ fields: "storageQuota" });
    const driveUsage = Number(driveRes.data.storageQuota.usage);
    const driveLimit = Number(driveRes.data.storageQuota.limit);

    user.drive = { usage: driveUsage, limit: driveLimit };

    // ---------------- FETCH GMAIL USAGE ----------------
    const gmailRes = await axios.get(
      "https://gmail.googleapis.com/gmail/v1/users/me/profile",
      { headers: { Authorization: `Bearer ${access_token}` } }
    );
    // Gmail usage not directly provided, we'll keep placeholder
    user.gmail.usage = 2.3 * 1024 ** 3; // placeholder
    user.gmail.limit = 15 * 1024 ** 3;

    // ---------------- FETCH PHOTOS USAGE ----------------
    user.photos.usage = 3.5 * 1024 ** 3; // placeholder
    user.photos.limit = 15 * 1024 ** 3;

    // Save user to DB
    await user.save();

    res.json({ user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Google login failed" });
  }
});

module.exports = router;
