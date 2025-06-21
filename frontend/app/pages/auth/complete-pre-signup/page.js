"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useRef, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { UserCircle, ArrowRight } from "lucide-react";

export default function CompleteUsername() {
  const usernameRef = useRef(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);

  const email = searchParams.get("email");
  const password = searchParams.get("password");
  const lat = searchParams.get("lat");
  const lng = searchParams.get("lng");

  const handleNext = async () => {
    const username = usernameRef.current?.value?.trim();
    if (!username) {
      toast.error("Username cannot be empty.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`http://localhost:4000/users/auth/check-username?username=${username}`);
      const data = await res.json();

      if (data.exists) {
        toast.error("Username already taken. Please choose another one.");
        setLoading(false);
        return;
      }

      const params = new URLSearchParams({
        email,
        password,
        lat,
        lng,
        username,
      }).toString();

      router.push(`/pages/auth/complete-bio?${params}`);
    } catch (err) {
      console.error("Error checking username:", err);
      toast.error("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-white to-purple-100 dark:from-gray-900 dark:via-black dark:to-gray-900 flex items-center justify-center px-4 py-10 font-sans transition-colors">
      <ToastContainer position="top-center" autoClose={2500} theme="colored" />

      <div className="w-full max-w-xl bg-white/90 dark:bg-gray-900/80 backdrop-blur-sm shadow-2xl border border-gray-200 dark:border-gray-700 rounded-xl p-10 md:p-12">
        {/* Dots Progress Indicator */}
        <div className="flex justify-center mb-4 space-x-2">
          {[1, 2, 3].map((step) => (
            <div
              key={step}
              className={`w-3 h-3 rounded-full transition-colors duration-300 ${
                step === 2 ? "bg-indigo-600" : "bg-gray-300 dark:bg-gray-600"
              }`}
            />
          ))}
        </div>

        {/* Step Label */}
        <div className="flex items-center justify-center mb-6">
          <span className="bg-indigo-100 dark:bg-indigo-700/20 text-indigo-700 dark:text-indigo-300 text-xs font-semibold px-3 py-1 rounded-full tracking-wide">
            Step 2 of 3
          </span>
        </div>

        {/* Icon */}
        <div className="flex justify-center mb-6">
          <UserCircle className="text-indigo-600 dark:text-indigo-400" size={60} strokeWidth={1.4} />
        </div>

        {/* Title */}
        <h2 className="text-3xl font-extrabold text-center text-gray-900 dark:text-white mb-2">
          Choose a Username
        </h2>
        <p className="text-center text-sm text-gray-600 dark:text-gray-400 mb-8">
          This will be your unique identity in{" "}
          <span className="font-semibold text-indigo-600 dark:text-indigo-400">ChatNearby</span>.
        </p>

        {/* Input */}
        <label htmlFor="username" className="sr-only">
          Username
        </label>
        <input
          type="text"
          id="username"
          ref={usernameRef}
          placeholder="your_username"
          className="w-full px-4 py-3 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-500 transition text-sm"
        />

        {/* Button */}
        <button
          onClick={handleNext}
          disabled={loading}
          className="group mt-8 w-full flex items-center justify-center gap-2 bg-indigo-600 text-white py-3 px-6 font-medium rounded-md shadow-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-xl transition-all duration-300 ease-in-out"
        >
          {loading ? (
            <span className="animate-pulse">Validating...</span>
          ) : (
            <>
              Continue
              <ArrowRight
                size={20}
                className="group-hover:translate-x-1 group-hover:scale-110 transform transition-transform duration-300"
              />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
