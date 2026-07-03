"use client";

import { useState } from "react";

type Theme = "light" | "dark";

// Resolve the active theme from the DOM (set pre-hydration by an inline script)
// or the OS preference. Runs only in the browser; the build-time render returns
// null so the server markup is stable and hydration mismatches are suppressed.
function readTheme(): Theme | null {
  if (typeof document === "undefined") return null;
  const attr = document.documentElement.getAttribute("data-theme");
  return attr === "dark" || attr === "light"
    ? attr
    : window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme | null>(readTheme);

  function toggle() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem("pixly-theme", next);
    } catch {
      /* private mode — ignore */
    }
  }

  return (
    <button
      onClick={toggle}
      aria-label="Toggle dark mode"
      suppressHydrationWarning
      className="grid h-9 w-9 place-items-center rounded-lg text-muted transition-colors hover:bg-surface-2 hover:text-ink"
    >
      {theme === "dark" ? (
        // sun — click to go light
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" suppressHydrationWarning>
          <circle cx="12" cy="12" r="4" />
          <path strokeLinecap="round" d="M12 2v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4m11.4-11.4 1.4-1.4" />
        </svg>
      ) : (
        // moon — click to go dark
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" suppressHydrationWarning>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />
        </svg>
      )}
    </button>
  );
}
