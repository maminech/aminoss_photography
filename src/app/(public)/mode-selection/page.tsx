'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { FiGrid, FiZap } from 'react-icons/fi';
import { useLayoutTheme } from '@/contexts/ThemeContext';

export default function ModeSelectionPage() {
  const router = useRouter();
  const { switchTheme } = useLayoutTheme();

  const handleProfessionalMode = () => {
    // Save mode selection
    if (typeof window !== 'undefined') {
      localStorage.setItem('modeSelected', 'true');
    }
    // Set theme
    switchTheme('professional');
    // Small delay to ensure theme is set
    setTimeout(() => {
      router.push('/gallery');
    }, 100);
  };

  const handleSimpleMode = () => {
    // Save mode selection
    if (typeof window !== 'undefined') {
      localStorage.setItem('modeSelected', 'true');
    }
    // Set theme
    switchTheme('simple');
    // Small delay to ensure theme is set
    setTimeout(() => {
      // Reload to simple home instead of pushing
      window.location.href = '/';
    }, 100);
  };

  return (
    <div className="fixed inset-0 overflow-hidden bg-gradient-to-br from-gray-900 via-black to-gray-900">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'linear',
          }}
          className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-primary-600/20 to-transparent rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [90, 0, 90],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'linear',
          }}
          className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-sky-600/20 to-transparent rounded-full blur-3xl"
        />
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
        {/* Logo/Brand */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12 sm:mb-16"
        >
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-playfair font-bold text-white mb-4 tracking-tight">
            INNOV8
          </h1>
          <p className="text-lg sm:text-xl text-gray-300 font-lato tracking-wide">
            Choose Your Experience
          </p>
        </motion.div>

        {/* Mode Selection Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 w-full max-w-5xl">
          {/* Professional Mode */}
          <motion.button
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            whileHover={{ scale: 1.05, y: -10 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleProfessionalMode}
            className="group relative overflow-hidden bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 sm:p-12 border border-gray-700 hover:border-[#d4af37] transition-all duration-500 shadow-2xl hover:shadow-[#d4af37]/20"
          >
            {/* Shine effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
            
            <div className="relative z-10">
              {/* Icon */}
              <div className="mb-6 sm:mb-8 flex justify-center">
                <div className="p-4 sm:p-5 bg-[#d4af37]/10 rounded-full group-hover:bg-[#d4af37]/20 transition-colors duration-300">
                  <FiGrid className="w-10 h-10 sm:w-12 sm:h-12 text-[#d4af37]" />
                </div>
              </div>

              {/* Title */}
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-playfair font-bold text-white mb-3 sm:mb-4 group-hover:text-[#d4af37] transition-colors duration-300">
                Professional Mode
              </h2>

              {/* Description */}
              <p className="text-sm sm:text-base text-gray-400 font-lato mb-6 sm:mb-8 leading-relaxed">
                Elegant portfolio showcase with sophisticated layouts, smooth animations, and premium design aesthetics.
              </p>

              {/* Features */}
              <ul className="space-y-2 sm:space-y-3 text-xs sm:text-sm text-gray-300 font-lato">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#d4af37]" />
                  Luxury Design Interface
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#d4af37]" />
                  Cinematic Transitions
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#d4af37]" />
                  Full-Screen Gallery
                </li>
              </ul>

              {/* Arrow */}
              <div className="mt-6 sm:mt-8 flex items-center justify-center">
                <motion.div
                  animate={{ x: [0, 10, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="text-[#d4af37]"
                >
                  →
                </motion.div>
              </div>
            </div>
          </motion.button>

          {/* Simple Mode */}
          <motion.button
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            whileHover={{ scale: 1.05, y: -10 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSimpleMode}
            className="group relative overflow-hidden bg-gradient-to-br from-sky-900 to-blue-900 rounded-2xl p-8 sm:p-12 border border-sky-700 hover:border-sky-400 transition-all duration-500 shadow-2xl hover:shadow-sky-400/20"
          >
            {/* Shine effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
            
            <div className="relative z-10">
              {/* Icon */}
              <div className="mb-6 sm:mb-8 flex justify-center">
                <div className="p-4 sm:p-5 bg-sky-400/10 rounded-full group-hover:bg-sky-400/20 transition-colors duration-300">
                  <FiZap className="w-10 h-10 sm:w-12 sm:h-12 text-sky-400" />
                </div>
              </div>

              {/* Title */}
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-playfair font-bold text-white mb-3 sm:mb-4 group-hover:text-sky-400 transition-colors duration-300">
                Simple Mode
              </h2>

              {/* Description */}
              <p className="text-sm sm:text-base text-gray-300 font-lato mb-6 sm:mb-8 leading-relaxed">
                Clean and intuitive interface with easy navigation, quick access to all features, and mobile-optimized experience.
              </p>

              {/* Features */}
              <ul className="space-y-2 sm:space-y-3 text-xs sm:text-sm text-gray-300 font-lato">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                  Fast & Responsive
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                  User-Friendly Layout
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                  Mobile Optimized
                </li>
              </ul>

              {/* Arrow */}
              <div className="mt-6 sm:mt-8 flex items-center justify-center">
                <motion.div
                  animate={{ x: [0, 10, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="text-sky-400"
                >
                  →
                </motion.div>
              </div>
            </div>
          </motion.button>
        </div>

        {/* Footer hint */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1 }}
          className="mt-12 sm:mt-16 text-xs sm:text-sm text-gray-500 font-lato text-center"
        >
          You can always switch modes later from the settings
        </motion.p>
      </div>
    </div>
  );
}
