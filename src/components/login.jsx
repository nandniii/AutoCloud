import React, { useState } from "react";
import { Button } from "../components/ui/button";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import { useGoogleLogin } from "@react-oauth/google";
import axios from "axios";

const Login = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // ------------------ EMAIL LOGIN (optional) ------------------
  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", {
        email,
        password,
      });
      localStorage.setItem("user", JSON.stringify(res.data.user));
      if (onLoginSuccess) onLoginSuccess(res.data.user);
    } catch (err) {
      console.error("Login failed:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // ------------------ GOOGLE LOGIN (IMPLICIT FLOW) ------------------
  const loginWithGoogle = useGoogleLogin({
    flow: "implicit", // ✅ implicit = front-end gets access_token directly

    scope: "openid email profile https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/drive https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/photoslibrary.readonly",


    onSuccess: async (tokenResponse) => {
      try {
        setGoogleLoading(true);

        // tokenResponse has access_token here
        const access_token = tokenResponse.access_token;
        if (!access_token) {
          console.error("No access_token in Google response");
          return;
        }

        // Send access_token to backend to sync and store user
        const res = await axios.post("http://localhost:5000/api/auth/google", {
          access_token,
        });

        console.log("✅ Google login success, backend user:", res.data);

        // Save user in localStorage (includes access_token)
        localStorage.setItem("user", JSON.stringify(res.data));

        if (onLoginSuccess) onLoginSuccess(res.data);

        // reload to propagate fresh user everywhere
        window.location.reload();
      } catch (err) {
        console.error("❌ Google login failed:", err);
      } finally {
        setGoogleLoading(false);
      }
    },

    onError: (err) => console.error("Google login error:", err),
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="relative w-full max-w-md bg-white/10 backdrop-blur-xl p-8 rounded-2xl border border-white/20 shadow-2xl">
        <h1 className="text-center text-white text-3xl mb-2">Welcome back</h1>
        <p className="text-center text-gray-300 mb-8">
          Sign in to access your dashboard
        </p>

        <form onSubmit={handleLogin} className="space-y-6">
          {/* Email */}
          <div>
            <label htmlFor="email" className="text-white">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-2 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                id="email"
                type="email"
                placeholder="name@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="pl-11 mt-1 w-full p-3 bg-white/10 border border-white/20 text-white rounded-md"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="text-white">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-2 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="pl-11 mt-1 w-full p-3 bg-white/10 border border-white/20 text-white rounded-md"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
              >
                {showPassword ? <EyeOff /> : <Eye />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90 text-white"
          >
            {isLoading ? "Signing in..." : "Sign in"}
          </Button>

          <div className="mt-8 text-center text-gray-400 text-sm">
            or continue with
          </div>

          {/* GOOGLE LOGIN BUTTON */}
          <Button
            type="button"
            onClick={() => loginWithGoogle()}
            disabled={googleLoading}
            className="w-full bg-white/10 border border-white/20 text-white hover:bg-white/20"
          >
            {googleLoading ? "Connecting..." : "Continue with Google"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Login;
