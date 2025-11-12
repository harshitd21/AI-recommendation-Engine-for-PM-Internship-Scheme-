import React, { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";
import { cn } from "../utils/cn";

// Small, global theme toggle button. Persists preference in localStorage and toggles `dark` class on <html>.
export default function ThemeToggle({ className = "" }) {
  const [isDark, setIsDark] = useState(false);

  // Initialize theme from localStorage or system preference
  useEffect(() => {
    try {
      const stored = localStorage.getItem("theme");
      const shouldDark = stored
        ? stored === "dark"
        : window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
      setIsDark(shouldDark);
      document.documentElement.classList.toggle("dark", shouldDark);
    } catch (_) {
      // no-op
    }
  }, []);

  const toggle = () => {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem("theme", next ? "dark" : "light");
    } catch (_) {
      // no-op
    }
  };

  return (
    <button
      onClick={toggle}
      aria-label="Toggle color theme"
      className={cn(
        "fixed top-4 right-4 z-50 p-2 rounded-full bg-card/70 backdrop-blur-subtle border border-border",
        "transition-colors duration-300 hover:bg-card",
        className
      )}
    >
      {isDark ? (
        <Sun className="h-5 w-5 text-yellow-300" />
      ) : (
        <Moon className="h-5 w-5 text-blue-900" />
      )}
    </button>
  );
}
