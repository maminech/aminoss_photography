'use client';

import { motion } from 'framer-motion';
import { FiLoader } from 'react-icons/fi';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  text?: string;
  fullScreen?: boolean;
  variant?: 'default' | 'dots' | 'pulse' | 'bars';
}

export default function LoadingSpinner({
  size = 'md',
  text,
  fullScreen = false,
  variant = 'default',
}: LoadingSpinnerProps) {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  const containerClass = fullScreen
    ? 'fixed inset-0 bg-white dark:bg-dark-900 flex items-center justify-center z-50'
    : 'flex items-center justify-center';

  const renderSpinner = () => {
    switch (variant) {
      case 'dots':
        return (
          <div className="flex items-center gap-2">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className={`${sizes[size]} bg-primary rounded-full`}
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  delay: i * 0.2,
                  ease: 'easeInOut',
                }}
              />
            ))}
          </div>
        );

      case 'pulse':
        return (
          <motion.div
            className={`${sizes[size]} bg-primary rounded-full`}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        );

      case 'bars':
        return (
          <div className="flex items-center gap-1">
            {[0, 1, 2, 3, 4].map((i) => (
              <motion.div
                key={i}
                className={`w-1 bg-primary rounded-full`}
                style={{
                  height: size === 'sm' ? '16px' : size === 'md' ? '24px' : size === 'lg' ? '32px' : '40px',
                }}
                animate={{
                  scaleY: [1, 2, 1],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  delay: i * 0.1,
                  ease: 'easeInOut',
                }}
              />
            ))}
          </div>
        );

      default:
        return (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{
              duration: 1,
              repeat: Infinity,
              ease: 'linear',
            }}
          >
            <FiLoader className={`${sizes[size]} text-primary`} />
          </motion.div>
        );
    }
  };

  return (
    <div className={containerClass}>
      <div className="flex flex-col items-center gap-4">
        {renderSpinner()}
        {text && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sm font-medium text-gray-600 dark:text-gray-400"
          >
            {text}
          </motion.p>
        )}
      </div>
    </div>
  );
}

// Skeleton loader for cards
export function SkeletonCard({ count = 1 }: { count?: number }) {
  return (
    <>
      {[...Array(count)].map((_, i) => (
        <div
          key={i}
          className="bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 animate-pulse"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gray-200 dark:bg-dark-700 rounded-lg" />
            <div className="w-16 h-6 bg-gray-200 dark:bg-dark-700 rounded" />
          </div>
          <div className="h-8 w-20 bg-gray-200 dark:bg-dark-700 rounded mb-2" />
          <div className="h-4 w-32 bg-gray-200 dark:bg-dark-700 rounded" />
        </div>
      ))}
    </>
  );
}

// Skeleton loader for list items
export function SkeletonList({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {[...Array(count)].map((_, i) => (
        <div
          key={i}
          className="bg-white dark:bg-dark-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 animate-pulse"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gray-200 dark:bg-dark-700 rounded-full flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 dark:bg-dark-700 rounded w-3/4" />
              <div className="h-3 bg-gray-200 dark:bg-dark-700 rounded w-1/2" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Skeleton loader for table
export function SkeletonTable({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="bg-white dark:bg-dark-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-700 p-4">
        <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
          {[...Array(cols)].map((_, i) => (
            <div key={i} className="h-4 bg-gray-200 dark:bg-dark-700 rounded animate-pulse" />
          ))}
        </div>
      </div>
      {/* Rows */}
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {[...Array(rows)].map((_, rowIndex) => (
          <div key={rowIndex} className="p-4">
            <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
              {[...Array(cols)].map((_, colIndex) => (
                <div
                  key={colIndex}
                  className="h-4 bg-gray-200 dark:bg-dark-700 rounded animate-pulse"
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
