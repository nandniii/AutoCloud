const express = require("express");
const router = express.Router();
const axios = require("axios");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

// ------------------ Email/Password Login ------------------
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    let user = await User.findOne({ email });

    if (!user) return res.status(404).json({ message: "User not found" });
    if (!user.password)
      return res.status(400).json({ message: "Please login with Google" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid password" });

    res.json({ success: true, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// ------------------ Google Login ------------------
router.post("/google", async (req, res) => {
  try {
    const { access_token } = req.body;
    if (!access_token)
      return res.status(400).json({ message: "Access token missing" });

    // Fetch user info from Google
    const googleRes = await axios.get(
      "https://www.googleapis.com/oauth2/v3/userinfo",
      { headers: { Authorization: `Bearer ${access_token}` } }
    );

    const { sub: googleId, name, email, picture } = googleRes.data;

    let user = await User.findOne({ email });
    if (!user) {
      user = new User({
        email,
        name,
        googleId,
      });
      await user.save();
    }

    res.json({ success: true, user });
  } catch (err) {
    console.error("Google login error:", err.response?.data || err.message);
    res.status(500).json({ message: "Google login failed" });
  }
});

module.exports = router;
