"use client";
import { useEffect } from "react";

export default function Load() {
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/eruda";
    script.async = true;
    script.onload = () => {
      // Initialize Eruda after script loads
      window.eruda.init();
    };
    document.body.appendChild(script);
  }, []);

  return <div id="loading">Now Loading...</div>;
}
