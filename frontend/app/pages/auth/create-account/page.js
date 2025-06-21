"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import validator from "validator";

export default function CreateAccount() {
  const [coords, setCoords] = useState({ lat: null, lng: null });
  const [loading, setLoading] = useState(false);
  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  async function handleSignUpClick() {
    const email = emailRef.current?.value?.trim();
    const password = passwordRef.current?.value;

    if (!email || !password) {
      toast.error("Please enter both email and password.");
      return;
    }

    if (!validator.isEmail(email)) {
      toast.error("Please enter a valid email address.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`http://localhost:4000/users/auth/check-email?email=${encodeURIComponent(email)}`);
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Error checking email");

      if (data.exists) {
        toast.error("This email is already registered. Try logging in.");
        return;
      }

      const params = new URLSearchParams({
        email,
        password,
        lat: coords.lat?.toString() || "",
        lng: coords.lng?.toString() || "",
      }).toString();

      router.push(`/pages/auth/complete-pre-signup?${params}`);
    } catch (err) {
      console.error("Error:", err);
      toast.error(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => setCoords({ lat: 18.5204, lng: 73.8567 }) // Pune fallback
      );
    } else {
      setCoords({ lat: 18.5204, lng: 73.8567 });
    }
  }, []);

  const mapSrc = coords.lat && coords.lng
    ? `https://maps.google.com/maps?q=${coords.lat},${coords.lng}&z=14&output=embed`
    : "";

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-black dark:to-gray-900 transition-colors duration-300 flex flex-col">
      <ToastContainer position="top-center" autoClose={2500} theme="colored" />

      <section className="flex-grow w-full max-w-7xl mx-auto text-gray-600 dark:text-gray-200 body-font relative">
        <div className="backdrop-blur-sm bg-white/30 dark:bg-white/5 rounded-3xl shadow-2xl overflow-hidden">
          <div className="w-full mx-auto flex flex-col lg:flex-row">
            {/* Map Section */}
            <div className="lg:w-2/3 bg-gray-300 dark:bg-gray-800 relative min-h-[600px]">
              {mapSrc && (
                <iframe
                  width="100%"
                  height="100%"
                  className="absolute inset-0"
                  frameBorder="0"
                  title="map"
                  src={mapSrc}
                  style={{ filter: "grayscale(1) contrast(1.2) opacity(0.7)" }}
                ></iframe>
              )}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-8">
                <h1 className="text-white text-3xl font-bold">Welcome to ChatNearby</h1>
                <p className="text-gray-200 mt-2">Connect with people around you</p>
              </div>
            </div>

            {/* Form Section */}
            <div className="lg:w-1/3 bg-white/80 dark:bg-[#111827]/80 backdrop-blur-md p-8 lg:p-12">
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Create Account</h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Join our community and start chatting with nearby friends
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      ref={emailRef}
                      placeholder="you@example.com"
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-300 transition"
                    />
                  </div>

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

                <button
                  onClick={handleSignUpClick}
                  disabled={loading}
                  className="w-full bg-indigo-600 text-white py-3 px-6 rounded-lg hover:bg-indigo-700 transform hover:scale-[1.02] transition font-semibold shadow-lg hover:shadow-indigo-500/20 disabled:opacity-50"
                >
                  {loading ? "Signing up..." : "Sign up"}
                </button>

                <div className="flex items-center my-6">
                  <hr className="flex-grow border-t border-gray-300 dark:border-gray-600" />
                  <span className="mx-4 text-sm text-gray-500 dark:text-gray-400">or</span>
                  <hr className="flex-grow border-t border-gray-300 dark:border-gray-600" />
                </div>

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

                <p className="text-center text-sm text-gray-600 dark:text-gray-400">
                  Already have an account?{" "}
                  <Link href="/pages/auth/sign-in" className="text-indigo-600 hover:text-indigo-700 dark:hover:text-indigo-400 font-medium">
                    Sign in
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
