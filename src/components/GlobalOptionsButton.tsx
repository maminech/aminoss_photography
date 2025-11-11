'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSettings } from 'react-icons/fi';
import ThemeSwitcherModal from './ThemeSwitcherModal';
import { usePathname } from 'next/navigation';
import { useLayoutTheme } from '@/contexts/ThemeContext';

export default function GlobalOptionsButton() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const pathname = usePathname();
  const { currentTheme } = useLayoutTheme();

  // Hide on homepage when in simple mode (has its own menu with theme switcher)
  const isSimpleHomepage = pathname === '/' && currentTheme === 'simple';

  if (isSimpleHomepage) {
    return null;
  }

  return (
    <>
      <motion.button
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-6 right-6 z-40 p-4 bg-primary-600 hover:bg-primary-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 active:scale-95 touch-manipulation"
        aria-label="Open options"
        title="Options"
      >
        <FiSettings className="w-6 h-6 animate-spin-slow" />
      </motion.button>

      <ThemeSwitcherModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
