"use client";
import { useEffect } from "react";

export default function Load() {
  useEffect(() => {
    // Load Eruda only in development from CDN
    if (process.env.NODE_ENV === "development") {
      const script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/npm/eruda";
      script.async = true;
      script.onload = () => {
        // Initialize Eruda after script loads
        window.eruda.init();
      };
      document.body.appendChild(script);
    }
  }, []);

  return <div id="loading">Now Loading...</div>;
}
