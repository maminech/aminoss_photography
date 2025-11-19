'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { FiUpload, FiCheck, FiX, FiLoader } from 'react-icons/fi';

interface UploadProgressProps {
  fileName?: string;
  progress: number;
  status: 'uploading' | 'success' | 'error' | 'idle';
  error?: string;
  onCancel?: () => void;
  showDetails?: boolean;
}

export default function UploadProgress({
  fileName,
  progress,
  status,
  error,
  onCancel,
  showDetails = true,
}: UploadProgressProps) {
  if (status === 'idle') return null;

  const getStatusColor = () => {
    switch (status) {
      case 'uploading':
        return 'bg-blue-500';
      case 'success':
        return 'bg-green-500';
      case 'error':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'uploading':
        return <FiLoader className="w-5 h-5 animate-spin" />;
      case 'success':
        return <FiCheck className="w-5 h-5" />;
      case 'error':
        return <FiX className="w-5 h-5" />;
      default:
        return <FiUpload className="w-5 h-5" />;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'uploading':
        return `Uploading... ${Math.round(progress)}%`;
      case 'success':
        return 'Upload complete!';
      case 'error':
        return error || 'Upload failed';
      default:
        return 'Preparing...';
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="bg-white dark:bg-dark-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
      >
        {/* Header */}
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-full ${getStatusColor()} flex items-center justify-center text-white`}
              >
                {getStatusIcon()}
              </div>
              <div className="flex-1 min-w-0">
                {showDetails && fileName && (
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                    {fileName}
                  </p>
                )}
                <p
                  className={`text-sm ${
                    status === 'error'
                      ? 'text-red-600 dark:text-red-400'
                      : 'text-gray-600 dark:text-gray-400'
                  }`}
                >
                  {getStatusText()}
                </p>
              </div>
            </div>
            {status === 'uploading' && onCancel && (
              <button
                onClick={onCancel}
                className="p-2 hover:bg-gray-100 dark:hover:bg-dark-700 rounded-lg transition text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                title="Cancel upload"
              >
                <FiX className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Progress Bar */}
          {status === 'uploading' && (
            <div className="relative h-2 bg-gray-200 dark:bg-dark-700 rounded-full overflow-hidden">
              <motion.div
                className={`absolute inset-y-0 left-0 ${getStatusColor()}`}
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
              />
              {/* Animated shine effect */}
              <motion.div
                className="absolute inset-y-0 left-0 w-full bg-gradient-to-r from-transparent via-white/30 to-transparent"
                animate={{
                  x: ['-100%', '100%'],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: 'linear',
                }}
                style={{ width: '50%' }}
              />
            </div>
          )}

          {/* Success/Error Message */}
          {status === 'success' && (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="mt-2 p-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded text-sm text-green-700 dark:text-green-300"
            >
              ✅ File uploaded successfully
            </motion.div>
          )}

          {status === 'error' && error && (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-sm text-red-700 dark:text-red-300"
            >
              ❌ {error}
            </motion.div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
