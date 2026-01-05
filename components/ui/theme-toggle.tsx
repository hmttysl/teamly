"use client";

import { useState, useEffect } from "react";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Check for saved preference or system preference
    const savedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    
    if (savedTheme === "dark" || (!savedTheme && prefersDark)) {
      setIsDark(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  const toggleTheme = () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    
    if (newIsDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  return (
    <button
      onClick={toggleTheme}
      className="relative flex items-center w-16 h-8 rounded-full bg-gray-200 dark:bg-zinc-800 transition-colors duration-300 p-1"
      aria-label="Toggle theme"
    >
      {/* Sun icon (left) */}
      <div className={`absolute left-1.5 transition-opacity duration-300 ${isDark ? "opacity-50" : "opacity-100"}`}>
        <Sun className="w-4 h-4 text-amber-500" />
      </div>
      
      {/* Moon icon (right) */}
      <div className={`absolute right-1.5 transition-opacity duration-300 ${isDark ? "opacity-100" : "opacity-50"}`}>
        <Moon className="w-4 h-4 text-blue-400" />
      </div>
      
      {/* Toggle circle */}
      <div
        className={`w-6 h-6 rounded-full bg-white shadow-md transform transition-transform duration-300 ease-in-out ${
          isDark ? "translate-x-8" : "translate-x-0"
        }`}
      />
    </button>
  );
}

