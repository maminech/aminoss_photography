'use client';

import { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'dark'; // Force dark mode only

interface ThemeContextType {
  theme: Theme;
  actualTheme: 'dark';
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme] = useState<Theme>('dark');
  const [actualTheme] = useState<'dark'>('dark');
  const [mounted, setMounted] = useState(false);

  // Force dark mode on mount
  useEffect(() => {
    setMounted(true);
    document.documentElement.classList.add('dark');
    localStorage.setItem('theme', 'dark');
  }, []);

  // No-op setTheme function (dark mode is locked)
  const setTheme = () => {
    // Do nothing - dark mode is always on
  };

  // Prevent flash of unstyled content
  if (!mounted) {
    return null;
  }

  return (
    <ThemeContext.Provider value={{ theme, actualTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
