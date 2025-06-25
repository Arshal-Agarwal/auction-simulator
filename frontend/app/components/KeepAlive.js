// components/KeepAlive.js
"use client";

import { useEffect } from "react";

export default function KeepAlive() {
  useEffect(() => {
    console.log("Keeping Alive");    
    const interval = setInterval(() => {
      fetch("http://localhost:4000/users/auth/keep-alive", {
        credentials: "include",
      }).catch(() => {
        console.warn("⚠️ Silent refresh failed");
      });
    }, 12 * 60 * 1000); // Every 12 minutes

    return () => clearInterval(interval);
  }, []);

  return null; // Nothing visual, just logic
}
