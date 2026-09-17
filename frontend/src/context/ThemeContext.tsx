"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { getCookie, setCookie } from "@/services/api-client";

type ThemeMode = "dark" | "light";

interface ThemeContextType {
  theme: ThemeMode;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "dark",
  toggleTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<ThemeMode>("dark");

  // Đọc cấu hình Theme từ Cookie khi mount — Dark là mặc định
  useEffect(() => {
    let activeTheme: ThemeMode = "dark";
    try {
      const savedTheme = getCookie("theme") as ThemeMode | null;
      if (savedTheme === "light" || savedTheme === "dark") {
        activeTheme = savedTheme;
      }
    } catch {
      activeTheme = "dark";
    }

    applyTheme(activeTheme);
    setTheme(activeTheme);
  }, []);

  function applyTheme(t: ThemeMode) {
    const root = document.documentElement;
    if (t === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    root.setAttribute("data-theme", t);
  }

  const toggleTheme = () => {
    const nextTheme: ThemeMode = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    applyTheme(nextTheme);
    try {
      setCookie("theme", nextTheme, 30);
    } catch (e) {
      console.warn("Unable to persist theme cookie:", e);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
