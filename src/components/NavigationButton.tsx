'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FiArrowLeft, FiHome } from 'react-icons/fi';
import { motion } from 'framer-motion';

interface NavigationButtonProps {
  variant?: 'back' | 'home' | 'both';
  backHref?: string;
  homeHref?: string;
  className?: string;
  position?: 'fixed' | 'relative';
  showLabels?: boolean;
}

export default function NavigationButton({
  variant = 'both',
  backHref,
  homeHref = '/',
  className = '',
  position = 'fixed',
  showLabels = false,
}: NavigationButtonProps) {
  const router = useRouter();

  const handleBack = () => {
    if (backHref) {
      router.push(backHref);
    } else {
      router.back();
    }
  };

  const baseClasses = position === 'fixed' 
    ? 'fixed top-4 left-4 z-50' 
    : 'relative';

  const buttonClasses = `
    p-3 sm:p-4 
    bg-white/90 dark:bg-dark-800/90 
    backdrop-blur-md 
    border border-gray-200 dark:border-gray-700 
    rounded-full 
    shadow-lg hover:shadow-xl 
    transition-all duration-300 
    hover:scale-110 
    active:scale-95
    text-gray-700 dark:text-gray-300 
    hover:text-primary-600 dark:hover:text-primary-400
    hover:bg-white dark:hover:bg-dark-700
    touch-manipulation
  `;

  if (variant === 'both') {
    return (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
        className={`${baseClasses} ${className} flex gap-2`}
      >
        <button
          onClick={handleBack}
          className={buttonClasses}
          aria-label="Go back"
          title="Go back"
        >
          <FiArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
        <Link
          href={homeHref}
          className={buttonClasses}
          aria-label="Go home"
          title="Go home"
        >
          <FiHome className="w-5 h-5 sm:w-6 sm:h-6" />
        </Link>
      </motion.div>
    );
  }

  if (variant === 'back') {
    return (
      <motion.button
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
        onClick={handleBack}
        className={`${baseClasses} ${className} ${buttonClasses} ${showLabels ? 'rounded-xl px-4 sm:px-6' : ''}`}
        aria-label="Go back"
      >
        <div className="flex items-center gap-2">
          <FiArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />
          {showLabels && <span className="text-sm sm:text-base font-medium hidden sm:inline">Back</span>}
        </div>
      </motion.button>
    );
  }

  if (variant === 'home') {
    return (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
        className={`${baseClasses} ${className}`}
      >
        <Link
          href={homeHref}
          className={`${buttonClasses} ${showLabels ? 'rounded-xl px-4 sm:px-6' : ''}`}
          aria-label="Go home"
        >
          <div className="flex items-center gap-2">
            <FiHome className="w-5 h-5 sm:w-6 sm:h-6" />
            {showLabels && <span className="text-sm sm:text-base font-medium hidden sm:inline">Home</span>}
          </div>
        </Link>
      </motion.div>
    );
  }

  return null;
}
