import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

type ThemeMode = "light" | "dark";

type ThemeContextValue = {
  mode: ThemeMode;
  toggle: () => void;
  setMode: (mode: ThemeMode) => void;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

function getInitialMode(): ThemeMode {
  if (typeof window === "undefined") return "light";
  const saved = localStorage.getItem("theme-mode");
  if (saved === "light" || saved === "dark") return saved;
  const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  return prefersDark ? "dark" : "light";
}

function applyDocumentClass(mode: ThemeMode) {
  const root = document.documentElement;
  if (mode === "dark") {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }
}

export const ThemeProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [mode, setMode] = useState<ThemeMode>(getInitialMode);

  useEffect(() => {
    applyDocumentClass(mode);
    try {
      localStorage.setItem("theme-mode", mode);
    } catch {}
  }, [mode]);

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => {
      const saved = localStorage.getItem("theme-mode");
      if (saved !== "light" && saved !== "dark") {
        setMode(media.matches ? "dark" : "light");
      }
    };
    media.addEventListener?.("change", handler);
    return () => media.removeEventListener?.("change", handler);
  }, []);

  const value = useMemo<ThemeContextValue>(
    () => ({
      mode,
      toggle: () => setMode((m) => (m === "dark" ? "light" : "dark")),
      setMode,
    }),
    [mode]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}


