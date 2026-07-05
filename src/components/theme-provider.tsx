"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

type Theme = "dark" | "light" | "system";

interface ThemeContextType {
  theme: Theme;
  resolved: "dark" | "light";
  setTheme: (t: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType>({ theme: "dark", resolved: "dark", setTheme: () => {} });

export function useTheme() {
  return useContext(ThemeContext);
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("dark");
  const [resolved, setResolved] = useState<"dark" | "light">("dark");

  useEffect(() => {
    const stored = localStorage.getItem("incidentiq-theme") as Theme | null;
    if (stored && ["dark", "light", "system"].includes(stored)) {
      setThemeState(stored);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("incidentiq-theme", theme);
    const media = window.matchMedia("(prefers-color-scheme: light)");
    const r = theme === "system" ? (media.matches ? "light" : "dark") : theme;
    setResolved(r);
    document.documentElement.setAttribute("data-theme", r);
  }, [theme]);

  const setTheme = (t: Theme) => setThemeState(t);

  return <ThemeContext.Provider value={{ theme, resolved, setTheme }}>{children}</ThemeContext.Provider>;
}
