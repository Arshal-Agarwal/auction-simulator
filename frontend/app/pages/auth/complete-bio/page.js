"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useRef, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ArrowRight, FileText } from "lucide-react";

export default function CompleteBio() {
  const bioRef = useRef(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);

  const email = searchParams.get("email");
  const password = searchParams.get("password");
  const lat = searchParams.get("lat");
  const lng = searchParams.get("lng");
  const username = searchParams.get("username");

  const handleCreateAccount = async () => {
    const bio = bioRef.current?.value?.trim();
    if (!bio) {
      toast.error("Bio cannot be empty.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("http://localhost:4000/users/crud/addUser", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
          lat,
          lng,
          username,
          bio,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Account creation failed");
      }

      toast.success("Account created successfully!");
      setTimeout(() => {
        router.push("/pages/home"); // Home page
      }, 1500);
    } catch (err) {
      console.error("Error creating account:", err);
      toast.error("Failed to create account. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-white to-purple-100 flex items-center justify-center px-4 py-10 font-sans">
      <ToastContainer
        position="top-center"
        autoClose={2500}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
        theme="colored"
      />

      <div className="w-full max-w-xl bg-white/90 backdrop-blur-sm shadow-2xl border border-gray-200 rounded-xl p-10 md:p-12 transition-all">
        {/* Dots Progress Indicator */}
        <div className="flex justify-center mb-4 space-x-2">
          {[1, 2, 3].map((step) => (
            <div
              key={step}
              className={`w-3 h-3 rounded-full ${
                step === 3 ? "bg-indigo-600" : "bg-gray-300"
              } transition-colors`}
            />
          ))}
        </div>

        {/* Step Label */}
        <div className="flex items-center justify-center mb-6">
          <span className="bg-indigo-100 text-indigo-700 text-xs font-semibold px-3 py-1 rounded-full tracking-wide">
            Step 3 of 3
          </span>
        </div>

        {/* Icon */}
        <div className="flex justify-center mb-6">
          <FileText className="text-indigo-600" size={60} strokeWidth={1.4} />
        </div>

        {/* Title */}
        <h2 className="text-3xl font-extrabold text-center text-gray-900 mb-2">
          Write a Short Bio
        </h2>
        <p className="text-center text-sm text-gray-600 mb-8">
          Tell others about yourself to help them know you better.
        </p>

        {/* Input */}
        <textarea
          ref={bioRef}
          rows={4}
          placeholder="I love hiking, tech, and chatting with new people..."
          className="w-full px-4 py-3 rounded-md border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-500 transition text-sm resize-none"
        />

        {/* Button */}
        <button
          onClick={handleCreateAccount}
          disabled={loading}
          className="group mt-8 w-full flex items-center justify-center gap-2 bg-indigo-600 text-white py-3 px-6 font-medium rounded-md shadow-md hover:bg-indigo-700 hover:shadow-xl transition-all duration-300 ease-in-out"
        >
          {loading ? (
            "Creating Account..."
          ) : (
            <>
              <ArrowRight
                size={20}
                className="group-hover:translate-x-1 group-hover:scale-110 transform transition-transform duration-300"
              />
              Finish
            </>
          )}
        </button>
      </div>
    </div>
  );
}
