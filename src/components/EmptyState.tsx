'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import { IconType } from 'react-icons';

interface EmptyStateProps {
  icon: IconType;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
    icon?: IconType;
  };
  tip?: string;
  variant?: 'default' | 'success' | 'info' | 'warning';
}

export default function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  tip,
  variant = 'default',
}: EmptyStateProps) {
  const variantStyles = {
    default: {
      iconBg: 'from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700',
      iconColor: 'text-gray-500 dark:text-gray-400',
      tipBg: 'bg-blue-50 dark:bg-blue-900/20',
      tipBorder: 'border-blue-200 dark:border-blue-800',
      tipText: 'text-blue-700 dark:text-blue-300',
    },
    success: {
      iconBg: 'from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30',
      iconColor: 'text-green-600 dark:text-green-400',
      tipBg: 'bg-green-50 dark:bg-green-900/20',
      tipBorder: 'border-green-200 dark:border-green-800',
      tipText: 'text-green-700 dark:text-green-300',
    },
    info: {
      iconBg: 'from-blue-100 to-cyan-100 dark:from-blue-900/30 dark:to-cyan-900/30',
      iconColor: 'text-blue-600 dark:text-blue-400',
      tipBg: 'bg-blue-50 dark:bg-blue-900/20',
      tipBorder: 'border-blue-200 dark:border-blue-800',
      tipText: 'text-blue-700 dark:text-blue-300',
    },
    warning: {
      iconBg: 'from-orange-100 to-yellow-100 dark:from-orange-900/30 dark:to-yellow-900/30',
      iconColor: 'text-orange-600 dark:text-orange-400',
      tipBg: 'bg-orange-50 dark:bg-orange-900/20',
      tipBorder: 'border-orange-200 dark:border-orange-800',
      tipText: 'text-orange-700 dark:text-orange-300',
    },
  };

  const styles = variantStyles[variant];

  return (
    <div className="bg-white dark:bg-dark-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-12 md:p-16 text-center">
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{
          type: 'spring',
          stiffness: 200,
          damping: 15,
          duration: 0.6,
        }}
      >
        <div
          className={`w-24 h-24 bg-gradient-to-br ${styles.iconBg} rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg`}
        >
          <Icon className={`w-12 h-12 ${styles.iconColor}`} />
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h3 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-3">
          {title}
        </h3>
        <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto mb-8 text-base md:text-lg">
          {description}
        </p>

        {action && (
          <motion.button
            onClick={action.onClick}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-blue-600 text-white rounded-xl hover:from-primary/90 hover:to-blue-600/90 transition font-semibold shadow-lg hover:shadow-xl"
          >
            {action.icon && <action.icon className="w-5 h-5" />}
            <span>{action.label}</span>
          </motion.button>
        )}

        {tip && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className={`inline-flex items-center gap-2 mt-6 px-4 py-2.5 ${styles.tipBg} border ${styles.tipBorder} rounded-lg text-sm ${styles.tipText}`}
          >
            <span>💡</span>
            <span>{tip}</span>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}

// Specialized empty state variants
export function EmptyInbox() {
  return (
    <EmptyState
      icon={({ className }) => (
        <svg
          className={className}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
          />
        </svg>
      )}
      title="All Caught Up!"
      description="You've read all your messages. New ones will appear here when customers contact you."
      variant="success"
    />
  );
}

export function EmptySearch({ searchTerm }: { searchTerm: string }) {
  return (
    <EmptyState
      icon={({ className }) => (
        <svg
          className={className}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      )}
      title="No Results Found"
      description={`We couldn't find anything matching "${searchTerm}". Try adjusting your search or filters.`}
      variant="info"
      tip="Try using different keywords or check your spelling"
    />
  );
}

export function EmptyGallery({ onUpload }: { onUpload: () => void }) {
  return (
    <EmptyState
      icon={({ className }) => (
        <svg
          className={className}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      )}
      title="No Photos Yet"
      description="Start building your beautiful gallery by uploading your first photos."
      action={{
        label: 'Upload Photos',
        onClick: onUpload,
        icon: ({ className }) => (
          <svg
            className={className}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
        ),
      }}
      tip="Supported formats: JPG, PNG, WebP (max 10MB per file)"
    />
  );
}
