'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { FiLayout, FiCheck, FiX } from 'react-icons/fi';
import { useLayoutTheme } from '@/contexts/ThemeContext';
import { ThemeType } from '@/types/theme';

export default function ThemeSwitcher() {
  const { currentTheme, switchTheme, availableThemes, themeConfig } = useLayoutTheme();
  const [isOpen, setIsOpen] = useState(false);

  const themes = {
    simple: {
      name: 'Simple',
      description: 'Clean & Minimalistic',
      preview: 'bg-gradient-to-br from-blue-500 to-purple-500',
    },
    professional: {
      name: 'Professional',
      description: 'Elegant & Modern',
      preview: 'bg-gradient-to-br from-gray-900 via-gray-800 to-yellow-600',
    },
  };

  return (
    <>
      {/* Floating Theme Switcher Button */}
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.5 }}
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-[60] p-3 sm:p-4 rounded-full shadow-2xl transition-all hover:scale-110 group touch-manipulation ${
          currentTheme === 'professional'
            ? 'bg-[#d4af37] hover:bg-[#c49d2f] text-white shadow-[#d4af37]/50'
            : 'bg-gradient-to-r from-primary to-purple-600 text-white hover:shadow-primary/50'
        }`}
        title="Change Theme"
        aria-label="Change Theme"
      >
        <FiLayout className="w-5 h-5 sm:w-6 sm:h-6 group-hover:rotate-180 transition-transform duration-500" />
      </motion.button>

      {/* Theme Selector Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className={`rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden ${
                currentTheme === 'professional'
                  ? 'bg-white'
                  : 'bg-white dark:bg-gray-900'
              }`}
            >
              {/* Header */}
              <div className={`p-6 text-white relative overflow-hidden ${
                currentTheme === 'professional'
                  ? 'bg-gradient-to-r from-[#1a1a1a] to-[#3a3a3a]'
                  : 'bg-gradient-to-r from-primary to-purple-600'
              }`}>
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute inset-0 bg-[url('/pattern.svg')] bg-repeat opacity-20"></div>
                </div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-3">
                      <FiLayout className="w-6 h-6 sm:w-7 sm:h-7" />
                      Choose Your Style
                    </h2>
                    <button
                      onClick={() => setIsOpen(false)}
                      className="p-2 hover:bg-white/20 rounded-full transition touch-manipulation"
                      aria-label="Close"
                    >
                      <FiX className="w-5 h-5 sm:w-6 sm:h-6" />
                    </button>
                  </div>
                  <p className="text-white/90 text-xs sm:text-sm">
                    Select the design that matches your taste. You can change it anytime!
                  </p>
                </div>
              </div>

              {/* Theme Options */}
              <div className="p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {availableThemes.map((themeId: ThemeType) => {
                  const theme = themes[themeId];
                  const isActive = currentTheme === themeId;

                  return (
                    <motion.button
                      key={themeId}
                      whileHover={{ scale: 1.02, y: -4 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        switchTheme(themeId);
                        setTimeout(() => setIsOpen(false), 300);
                      }}
                      className={`relative p-4 sm:p-6 rounded-2xl border-2 transition-all text-left touch-manipulation ${
                        isActive
                          ? currentTheme === 'professional'
                            ? 'border-[#d4af37] bg-[#d4af37]/5 shadow-lg ring-4 ring-[#d4af37]/20'
                            : 'border-primary bg-primary/5 shadow-lg ring-4 ring-primary/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-primary/50 hover:shadow-md'
                      }`}
                    >
                      {/* Active Badge */}
                      {isActive && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className={`absolute -top-2 -right-2 text-white rounded-full p-2 shadow-lg ${
                            currentTheme === 'professional' ? 'bg-[#d4af37]' : 'bg-primary'
                          }`}
                        >
                          <FiCheck className="w-4 h-4 sm:w-5 sm:h-5" />
                        </motion.div>
                      )}

                      {/* Theme Preview */}
                      <div
                        className={`${theme.preview} h-20 sm:h-24 rounded-xl mb-3 sm:mb-4 shadow-inner relative overflow-hidden`}
                      >
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-white font-bold text-xl sm:text-2xl drop-shadow-lg">
                            {theme.name}
                          </span>
                        </div>
                      </div>

                      {/* Theme Info */}
                      <div>
                        <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-1">
                          {theme.name}
                        </h3>
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                          {theme.description}
                        </p>
                      </div>

                      {/* Selection Indicator */}
                      <div className="mt-3 sm:mt-4 flex items-center justify-end">
                        <span
                          className={`text-xs font-semibold px-3 py-1 rounded-full ${
                            isActive
                              ? currentTheme === 'professional'
                                ? 'bg-[#d4af37] text-white'
                                : 'bg-primary text-white'
                              : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                          }`}
                        >
                          {isActive ? 'Active' : 'Select'}
                        </span>
                      </div>
                    </motion.button>
                  );
                })}
              </div>

              {/* Footer */}
              <div className={`px-4 sm:px-6 py-3 sm:py-4 border-t ${
                currentTheme === 'professional'
                  ? 'bg-gray-50 border-gray-200'
                  : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
              }`}>
                <p className={`text-xs text-center ${
                  currentTheme === 'professional'
                    ? 'text-gray-600'
                    : 'text-gray-600 dark:text-gray-400'
                }`}>
                  💡 Your preference is saved automatically and will persist across sessions
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
