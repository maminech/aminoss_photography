'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiGrid, FiLayers, FiMoon, FiSun } from 'react-icons/fi';
import { useLayoutTheme } from '@/contexts/ThemeContext';
import { useTheme } from 'next-themes';

interface ThemeSwitcherModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ThemeSwitcherModal({ isOpen, onClose }: ThemeSwitcherModalProps) {
  const { currentTheme, switchTheme } = useLayoutTheme();
  const { theme, setTheme } = useTheme();

  const handleLayoutThemeSwitch = (newTheme: 'simple' | 'professional') => {
    switchTheme(newTheme);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-x-4 top-1/2 -translate-y-1/2 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 sm:w-full sm:max-w-md bg-white dark:bg-dark-800 rounded-2xl shadow-2xl z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                Customize Your Experience
              </h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 dark:hover:bg-dark-700 rounded-full transition"
              >
                <FiX className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Layout Theme Section */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wide">
                  Layout Style
                </h3>
                <div className="space-y-3">
                  <button
                    onClick={() => handleLayoutThemeSwitch('simple')}
                    className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition ${
                      currentTheme === 'simple'
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <div className={`p-3 rounded-lg ${
                      currentTheme === 'simple'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 dark:bg-dark-700 text-gray-600 dark:text-gray-400'
                    }`}>
                      <FiGrid className="w-6 h-6" />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="font-semibold text-gray-900 dark:text-gray-100">
                        Simple Mode
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        Instagram-style layout
                      </div>
                    </div>
                    {currentTheme === 'simple' && (
                      <div className="w-2 h-2 rounded-full bg-blue-500" />
                    )}
                  </button>

                  <button
                    onClick={() => handleLayoutThemeSwitch('professional')}
                    className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition ${
                      currentTheme === 'professional'
                        ? 'border-[#d4af37] bg-amber-50 dark:bg-amber-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <div className={`p-3 rounded-lg ${
                      currentTheme === 'professional'
                        ? 'bg-[#d4af37] text-white'
                        : 'bg-gray-100 dark:bg-dark-700 text-gray-600 dark:text-gray-400'
                    }`}>
                      <FiLayers className="w-6 h-6" />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="font-semibold text-gray-900 dark:text-gray-100">
                        Professional Mode
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        Elegant portfolio layout
                      </div>
                    </div>
                    {currentTheme === 'professional' && (
                      <div className="w-2 h-2 rounded-full bg-[#d4af37]" />
                    )}
                  </button>
                </div>
              </div>

              {/* Color Theme Section */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wide">
                  Color Theme
                </h3>
                <div className="flex gap-3">
                  <button
                    onClick={() => setTheme('light')}
                    className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition ${
                      theme === 'light'
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <FiSun className="w-5 h-5" />
                    <span className="font-medium text-sm">Light</span>
                  </button>
                  <button
                    onClick={() => setTheme('dark')}
                    className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition ${
                      theme === 'dark'
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <FiMoon className="w-5 h-5" />
                    <span className="font-medium text-sm">Dark</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 bg-gray-50 dark:bg-dark-900 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={onClose}
                className="w-full py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg font-semibold hover:bg-gray-800 dark:hover:bg-gray-100 transition"
              >
                Done
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
