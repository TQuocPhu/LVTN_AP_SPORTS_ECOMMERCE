'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { getCookie, setCookie } from '@/services/api-client';

type ThemeMode = 'dark' | 'light';

interface ThemeContextType {
  theme: ThemeMode;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'dark',
  toggleTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<ThemeMode>('dark');

  // Đọc cấu hình Theme từ Cookie hoặc hệ thống khi mount
  useEffect(() => {
    let activeTheme: ThemeMode = 'dark';
    try {
      const savedTheme = getCookie('theme') as ThemeMode | null;
      if (savedTheme === 'light' || savedTheme === 'dark') {
        activeTheme = savedTheme;
      }
    } catch {
      activeTheme = 'dark';
    }

    setTheme(activeTheme);
    document.documentElement.setAttribute('data-theme', activeTheme);
    if (activeTheme === 'light') {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme: ThemeMode = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);

    try {
      setCookie('theme', nextTheme, 30);
    } catch (e) {
      console.warn('Unable to persist theme cookie:', e);
    }

    document.documentElement.setAttribute('data-theme', nextTheme);
    if (nextTheme === 'light') {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
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
