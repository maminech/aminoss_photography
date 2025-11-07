'use client';

/**
 * Navigation Mode Toggle
 * Switches between Easy (Instagram-like grid) and Professional (Novo-style) modes
 * Stored in localStorage for persistence
 */

import { motion } from 'framer-motion';
import { Grid3x3, Sparkles } from 'lucide-react';
import { useLayoutTheme } from '@/contexts/ThemeContext';

export default function NavigationModeToggle() {
  const { currentTheme, toggleLayoutTheme } = useLayoutTheme();
  const isProfessional = currentTheme === 'professional';

  return (
    <motion.button
      onClick={toggleLayoutTheme}
      className="group relative flex items-center gap-2 px-4 py-2 rounded-full
                 bg-white/10 dark:bg-gray-800/50 backdrop-blur-md
                 border border-gray-200 dark:border-gray-700
                 hover:bg-white/20 dark:hover:bg-gray-700/50
                 transition-all duration-300"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      title={`Switch to ${isProfessional ? 'Easy' : 'Professional'} Mode`}
    >
      {/* Icon Animation Container */}
      <div className="relative w-5 h-5">
        <motion.div
          initial={false}
          animate={{
            opacity: isProfessional ? 0 : 1,
            scale: isProfessional ? 0.5 : 1,
            rotate: isProfessional ? -90 : 0,
          }}
          transition={{ duration: 0.3 }}
          className="absolute inset-0"
        >
          <Grid3x3 className="w-5 h-5 text-primary" />
        </motion.div>
        <motion.div
          initial={false}
          animate={{
            opacity: isProfessional ? 1 : 0,
            scale: isProfessional ? 1 : 0.5,
            rotate: isProfessional ? 0 : 90,
          }}
          transition={{ duration: 0.3 }}
          className="absolute inset-0"
        >
          <Sparkles className="w-5 h-5 text-primary" />
        </motion.div>
      </div>

      {/* Text */}
      <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
        {isProfessional ? 'Professional' : 'Easy'}
      </span>

      {/* Toggle Indicator */}
      <div className="flex items-center gap-1 ml-1">
        <motion.div
          className="w-1.5 h-1.5 rounded-full bg-primary"
          animate={{
            x: isProfessional ? 8 : 0,
          }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
        />
        <span className="text-xs text-gray-500 dark:text-gray-400">↔</span>
      </div>

      {/* Tooltip */}
      <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 
                      px-3 py-1 bg-gray-900 text-white text-xs rounded-md
                      opacity-0 group-hover:opacity-100 pointer-events-none
                      transition-opacity duration-200 whitespace-nowrap z-50">
        Switch to {isProfessional ? 'Easy (Grid)' : 'Professional (Novo)'} Mode
      </div>
    </motion.button>
  );
}
