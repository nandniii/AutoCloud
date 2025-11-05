import express from "express";
import cors from "cors";
import { OAuth2Client } from "google-auth-library";
import axios from "axios";

const app = express();

// ✅ CORS configuration — allow your Vite frontend
app.use(
  cors({
    origin: "http://localhost:5173", // frontend URL
    credentials: true,               // allow credentials (if needed)
  })
);

app.use(express.json());

// ✅ Google OAuth client
const client = new OAuth2Client(
  "485611680613-rim7kuqpc9shbn51t6db7a4ig7e6a9oe.apps.googleusercontent.com"
);

// ✅ Route to verify Google token and fetch user data
app.post("/api/auth/google", async (req, res) => {
  try {
    const { token } = req.body;

    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: "485611680613-rim7kuqpc9shbn51t6db7a4ig7e6a9oe.apps.googleusercontent.com", // same client ID
    });

    const payload = ticket.getPayload();

    // Basic user info
    const user = {
      name: payload.name,
      email: payload.email,
      picture: payload.picture,
    };

    // (Optional) You can use access tokens to call other Google APIs later

    res.json({ user });
  } catch (err) {
    console.error("Login failed:", err);
    res.status(401).json({ message: "Invalid token" });
  }
});
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
}));
app.use((req, res, next) => {
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
  next();
});

// ✅ Start server
app.listen(5000, () => console.log("🚀 Server running on http://localhost:5000"));
