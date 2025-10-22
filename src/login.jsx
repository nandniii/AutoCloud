import React from "react";
import { useState } from "react";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      console.log("Login successful:", { email, password });
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-500/30 rounded-full blur-3xl animate-pulse delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-300/20 rounded-full blur-3xl animate-pulse delay-700"></div>
      </div>
      {/* glass card */}
      <div className="relative w-full max-w-md">
        <div className="backdrop-blur-xl bg-white/10 rounded-2xl border border-white/20 shadow-2xl p-8">
          <div className="space-y-2 mb-8">
            <h1 className="text-center text-white text-3xl">Welcome back</h1>
            <p className="text-center text-gray-300">
              Enter your credentials to access your account
            </p>
          </div>
          <form onSubmit={handleLogin} className="space-y-6">
            {/* email */}
            <div>
              <label htmlFor="email" className="text-white ">
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
                  className="pl-11 mt-1 rounded-b-sm w-full p-3 bg-white/10 border border-white/20 text-white placeholder-gray-400 backdrop-blur-sm focus:bg-white/20 focus:border-white/40 transition-all"
                />
              </div>
            </div>
            {/* password */}
            <div>
              <label htmlFor="Password" className="text-white ">
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
                  className="pl-11 mt-1 rounded-b-sm w-full p-3 bg-white/10 border border-white/20 text-white placeholder-gray-400 backdrop-blur-sm focus:bg-white/20 focus:border-white/40 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex item-center space-x-2">
                <input
                  type="checkbox"
                  id="remember"
                  className="rounded border-white/20 bg-white/10 text-purple-500 focus:ring-purple-500 focus:ring-offset-0"
                />
                <label
                  htmlFor="remember"
                  className="text-sm cursor-pointer text-gray-300"
                >
                  Remember me
                </label>
                {/* forgot password */}
              </div>
              <a href="#" className="text-sm text-purple-300 hover:text-purple-200 transition-colors">
                Forgot password?
              </a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
