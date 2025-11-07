'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ThemeType, themes, ThemeConfig } from '@/types/theme';

interface LayoutThemeContextType {
  currentTheme: ThemeType;
  themeConfig: ThemeConfig;
  switchTheme: (theme: ThemeType) => void;
  availableThemes: ThemeType[];
}

const LayoutThemeContext = createContext<LayoutThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = 'aminoss-layout-theme-preference';

interface LayoutThemeProviderProps {
  children: ReactNode;
  defaultTheme?: ThemeType;
}

export function LayoutThemeProvider({ children, defaultTheme = 'simple' }: LayoutThemeProviderProps) {
  const [currentTheme, setCurrentTheme] = useState<ThemeType>(defaultTheme);
  const [mounted, setMounted] = useState(false);

  // Load theme from localStorage on mount
  useEffect(() => {
    setMounted(true);
    const storedTheme = localStorage.getItem(THEME_STORAGE_KEY) as ThemeType;
    if (storedTheme && (storedTheme === 'simple' || storedTheme === 'professional')) {
      setCurrentTheme(storedTheme);
    }
  }, []);

  // Save theme to localStorage when it changes
  useEffect(() => {
    if (mounted) {
      localStorage.setItem(THEME_STORAGE_KEY, currentTheme);
    }
  }, [currentTheme, mounted]);

  const switchTheme = (theme: ThemeType) => {
    setCurrentTheme(theme);
  };

  const value: LayoutThemeContextType = {
    currentTheme,
    themeConfig: themes[currentTheme],
    switchTheme,
    availableThemes: ['simple', 'professional'],
  };

  // Prevent flash of wrong theme by not rendering until mounted
  if (!mounted) {
    return null;
  }

  return <LayoutThemeContext.Provider value={value}>{children}</LayoutThemeContext.Provider>;
}

export function useLayoutTheme() {
  const context = useContext(LayoutThemeContext);
  if (context === undefined) {
    throw new Error('useLayoutTheme must be used within a LayoutThemeProvider');
  }
  return context;
}
