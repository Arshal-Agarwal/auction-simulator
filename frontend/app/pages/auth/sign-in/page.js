"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Eye, EyeOff } from "lucide-react";
import Lottie from "lottie-react";
import validator from "validator";
import loginAnimation from "@/public/animations/login.json";

export default function SignInPage() {
  const identifierRef = useRef(null);
  const passwordRef = useRef(null);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSignInClick = async () => {
    const identifier = identifierRef.current?.value?.trim();
    const password = passwordRef.current?.value;

    if (!identifier || !password) {
      toast.error("Please enter username/email and password.");
      return;
    }

    const isEmail = validator.isEmail(identifier);
    const payload = {
      password,
      ...(isEmail ? { email: identifier } : { username: identifier }),
    };

    setLoading(true);
    try {
      const res = await fetch("http://localhost:4000/users/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Invalid credentials");

      toast.success("Signed in successfully!");
      setTimeout(() => router.push("/pages/home"), 1000);
    } catch (err) {
      toast.error(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-950 dark:to-black transition-colors duration-300 flex flex-col">
      <ToastContainer position="top-center" autoClose={2500} theme="colored" />

      <section className="flex-grow w-full max-w-7xl mx-auto text-gray-600 dark:text-gray-200 body-font relative">
        <div className="backdrop-blur-sm bg-white/30 dark:bg-white/5 rounded-3xl shadow-2xl overflow-hidden">
          <div className="w-full mx-auto flex flex-col lg:flex-row">
            {/* Left Animation */}
            <div className="lg:w-2/3 bg-gray-100 dark:bg-gray-900 flex items-center justify-center relative min-h-[600px] p-10">
              <Lottie animationData={loginAnimation} loop autoplay className="max-w-[600px] w-full" />
            </div>

            {/* Right Form */}
            <div className="lg:w-1/3 bg-white/80 dark:bg-black backdrop-blur-md p-8 lg:p-12">
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Sign In</h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Access your account and continue chatting</p>
                </div>

                <div className="space-y-4">
                  {/* Email / Username */}
                  <div>
                    <label htmlFor="identifier" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Email or Username
                    </label>
                    <input
                      type="text"
                      id="identifier"
                      ref={identifierRef}
                      placeholder="you@example.com or yourusername"
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-300 transition"
                    />
                  </div>

                  {/* Password */}
                  <div className="relative">
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Password
                    </label>
                    <input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      ref={passwordRef}
                      placeholder="••••••••"
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-300 transition pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute top-[38px] right-3 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                {/* Sign In Button */}
                <button
                  onClick={handleSignInClick}
                  disabled={loading}
                  className="w-full bg-indigo-600 text-white py-3 px-6 rounded-lg hover:bg-indigo-700 transform hover:scale-[1.02] transition font-semibold shadow-lg hover:shadow-indigo-500/20 disabled:opacity-50"
                >
                  {loading ? "Signing in..." : "Sign In"}
                </button>

                {/* Separator */}
                <div className="flex items-center my-6">
                  <hr className="flex-grow border-t border-gray-300 dark:border-gray-600" />
                  <span className="mx-4 text-sm text-gray-500 dark:text-gray-400">or</span>
                  <hr className="flex-grow border-t border-gray-300 dark:border-gray-600" />
                </div>

                {/* OAuth Buttons */}
                <div className="flex flex-row gap-3">
                  <button
                    onClick={() => window.location.href = "http://localhost:5001/auth/google"}
                    className="flex-1 flex items-center justify-center gap-2 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm font-medium text-gray-700 dark:text-white bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                  >
                    <img
                      src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/google/google-original.svg"
                      alt="Google"
                      className="h-5 w-5"
                    />
                    Google
                  </button>

                  <button
                    onClick={() => window.location.href = "http://localhost:5001/auth/github"}
                    className="flex-1 flex items-center justify-center gap-2 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm font-medium text-gray-700 dark:text-white bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                  >
                    <img
                      src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/github/github-original.svg"
                      alt="GitHub"
                      className="h-5 w-5"
                    />
                    GitHub
                  </button>
                </div>

                {/* Sign Up Link */}
                <p className="text-center text-sm text-gray-600 dark:text-gray-400">
                  Don’t have an account?{" "}
                  <a href="/pages/auth/create-account" className="text-indigo-600 hover:text-indigo-700 dark:hover:text-indigo-400 font-medium">
                    Sign up
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
