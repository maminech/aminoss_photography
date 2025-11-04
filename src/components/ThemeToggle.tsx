'use client';

import { useTheme } from './ThemeProvider';
import { motion } from 'framer-motion';
import { Sun, Moon, Monitor } from 'lucide-react';

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const themes: Array<{ value: 'light' | 'dark' | 'system'; icon: React.ReactNode; label: string }> = [
    { value: 'light', icon: <Sun className="w-4 h-4" />, label: 'Light' },
    { value: 'dark', icon: <Moon className="w-4 h-4" />, label: 'Dark' },
    { value: 'system', icon: <Monitor className="w-4 h-4" />, label: 'System' },
  ];

  return (
    <div className="flex items-center gap-1 bg-gray-100 dark:bg-dark-800 rounded-lg p-1">
      {themes.map((t) => (
        <motion.button
          key={t.value}
          onClick={() => setTheme(t.value)}
          className={`relative px-3 py-2 rounded-md text-sm font-medium transition-colors ${
            theme === t.value
              ? 'text-white'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
          }`}
          whileTap={{ scale: 0.95 }}
          aria-label={`Switch to ${t.label} mode`}
        >
          {theme === t.value && (
            <motion.div
              layoutId="activeTheme"
              className="absolute inset-0 bg-primary-600 rounded-md"
              transition={{ type: 'spring', stiffness: 380, damping: 30 }}
            />
          )}
          <span className="relative z-10 flex items-center gap-2">
            {t.icon}
            <span className="hidden sm:inline">{t.label}</span>
          </span>
        </motion.button>
      ))}
    </div>
  );
}
