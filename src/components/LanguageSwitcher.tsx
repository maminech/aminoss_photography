'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { FiGlobe } from 'react-icons/fi';
import { useState } from 'react';

export default function LanguageSwitcher() {
  const { language, setLanguage, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const toggleLanguage = (lang: 'en' | 'fr') => {
    setLanguage(lang);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      {/* Language Toggle Button */}
      <motion.button
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="relative px-3 py-2 sm:px-4 sm:py-2 bg-gradient-to-r from-primary/10 via-primary/20 to-primary/10 hover:from-primary/20 hover:via-primary/30 hover:to-primary/20 backdrop-blur-md rounded-full transition-all duration-300 flex items-center gap-2 border border-primary/20 hover:border-primary/40 shadow-lg group min-w-[44px] min-h-[44px] justify-center"
        aria-label={t('common.language')}
      >
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <FiGlobe className="w-4 h-4 sm:w-5 sm:h-5 text-primary group-hover:text-primary-hover transition-colors" />
        </motion.div>
        <span className="hidden sm:inline text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
          {language}
        </span>
      </motion.button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-40"
            />

            {/* Menu */}
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50 backdrop-blur-xl"
            >
              <div className="p-2">
                {/* English Option */}
                <motion.button
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => toggleLanguage('en')}
                  className={`w-full px-4 py-3 rounded-xl text-left transition-all duration-200 flex items-center gap-3 group ${
                    language === 'en'
                      ? 'bg-gradient-to-r from-primary/20 to-primary/10 text-primary font-semibold'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <span className="text-2xl">🇬🇧</span>
                  <div className="flex-1">
                    <div className="font-medium">{t('common.english')}</div>
                    <div className="text-xs opacity-70">English</div>
                  </div>
                  {language === 'en' && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-2 h-2 bg-primary rounded-full"
                    />
                  )}
                </motion.button>

                {/* French Option */}
                <motion.button
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => toggleLanguage('fr')}
                  className={`w-full px-4 py-3 rounded-xl text-left transition-all duration-200 flex items-center gap-3 group mt-1 ${
                    language === 'fr'
                      ? 'bg-gradient-to-r from-primary/20 to-primary/10 text-primary font-semibold'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <span className="text-2xl">🇫🇷</span>
                  <div className="flex-1">
                    <div className="font-medium">{t('common.french')}</div>
                    <div className="text-xs opacity-70">Français</div>
                  </div>
                  {language === 'fr' && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-2 h-2 bg-primary rounded-full"
                    />
                  )}
                </motion.button>
              </div>

              {/* Footer */}
              <div className="px-4 py-2 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700">
                <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                  {language === 'en' ? 'Select your language' : 'Sélectionnez votre langue'}
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
