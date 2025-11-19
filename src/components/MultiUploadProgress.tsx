'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { FiUploadCloud, FiCheck, FiX, FiMinimize2, FiMaximize2 } from 'react-icons/fi';
import { useState } from 'react';

export interface UploadFile {
  id: string;
  name: string;
  size: number;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
}

interface MultiUploadProgressProps {
  files: UploadFile[];
  onCancel?: (fileId: string) => void;
  onClose?: () => void;
  totalProgress: number;
}

export default function MultiUploadProgress({
  files,
  onCancel,
  onClose,
  totalProgress,
}: MultiUploadProgressProps) {
  const [isMinimized, setIsMinimized] = useState(false);

  if (files.length === 0) return null;

  const completedCount = files.filter((f) => f.status === 'success').length;
  const errorCount = files.filter((f) => f.status === 'error').length;
  const uploadingCount = files.filter((f) => f.status === 'uploading').length;
  const allCompleted = completedCount === files.length;
  const hasErrors = errorCount > 0;

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 50, scale: 0.9 }}
        className="fixed bottom-6 right-6 z-50 w-96 max-w-[calc(100vw-3rem)]"
      >
        <div className="bg-white dark:bg-dark-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-4">
            <div className="flex items-center justify-between text-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                  {allCompleted ? (
                    <FiCheck className="w-6 h-6" />
                  ) : (
                    <FiUploadCloud className="w-6 h-6" />
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-lg">
                    {allCompleted
                      ? '✅ Upload Complete'
                      : hasErrors
                      ? '⚠️ Upload Issues'
                      : `📤 Uploading ${files.length} file${files.length > 1 ? 's' : ''}`}
                  </h3>
                  <p className="text-sm text-blue-100">
                    {allCompleted
                      ? `${completedCount} file${completedCount > 1 ? 's' : ''} uploaded`
                      : `${completedCount} / ${files.length} complete`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="p-2 hover:bg-white/20 rounded-lg transition"
                  title={isMinimized ? 'Expand' : 'Minimize'}
                >
                  {isMinimized ? (
                    <FiMaximize2 className="w-5 h-5" />
                  ) : (
                    <FiMinimize2 className="w-5 h-5" />
                  )}
                </button>
                {allCompleted && onClose && (
                  <button
                    onClick={onClose}
                    className="p-2 hover:bg-white/20 rounded-lg transition"
                    title="Close"
                  >
                    <FiX className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>

            {/* Overall Progress Bar */}
            {!allCompleted && (
              <div className="mt-3">
                <div className="flex items-center justify-between text-sm text-blue-100 mb-1">
                  <span>Overall Progress</span>
                  <span className="font-bold">{Math.round(totalProgress)}%</span>
                </div>
                <div className="relative h-2 bg-white/20 rounded-full overflow-hidden">
                  <motion.div
                    className="absolute inset-y-0 left-0 bg-white"
                    initial={{ width: 0 }}
                    animate={{ width: `${totalProgress}%` }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                  />
                  {/* Animated shine */}
                  <motion.div
                    className="absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                    animate={{ x: ['-100%', '200%'] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* File List */}
          {!isMinimized && (
            <div className="max-h-80 overflow-y-auto">
              <div className="p-4 space-y-3">
                {files.map((file) => (
                  <motion.div
                    key={file.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-dark-700 rounded-lg"
                  >
                    {/* Status Icon */}
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        file.status === 'success'
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                          : file.status === 'error'
                          ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                          : 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                      }`}
                    >
                      {file.status === 'success' ? (
                        <FiCheck className="w-4 h-4" />
                      ) : file.status === 'error' ? (
                        <FiX className="w-4 h-4" />
                      ) : (
                        <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      )}
                    </div>

                    {/* File Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                        {file.name}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                        <span>{formatFileSize(file.size)}</span>
                        {file.status === 'uploading' && (
                          <>
                            <span>•</span>
                            <span>{Math.round(file.progress)}%</span>
                          </>
                        )}
                        {file.status === 'error' && file.error && (
                          <>
                            <span>•</span>
                            <span className="text-red-600 dark:text-red-400">{file.error}</span>
                          </>
                        )}
                      </div>

                      {/* Individual Progress Bar */}
                      {file.status === 'uploading' && (
                        <div className="mt-2 h-1 bg-gray-200 dark:bg-dark-600 rounded-full overflow-hidden">
                          <motion.div
                            className="h-full bg-blue-500"
                            initial={{ width: 0 }}
                            animate={{ width: `${file.progress}%` }}
                            transition={{ duration: 0.2 }}
                          />
                        </div>
                      )}
                    </div>

                    {/* Cancel Button */}
                    {file.status === 'uploading' && onCancel && (
                      <button
                        onClick={() => onCancel(file.id)}
                        className="p-2 hover:bg-gray-200 dark:hover:bg-dark-600 rounded-lg transition text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                        title="Cancel"
                      >
                        <FiX className="w-4 h-4" />
                      </button>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Summary Footer */}
          {!isMinimized && allCompleted && (
            <div className="border-t border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">
                  ✅ {completedCount} successful
                  {errorCount > 0 && ` • ❌ ${errorCount} failed`}
                </span>
                {onClose && (
                  <button
                    onClick={onClose}
                    className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 transition font-medium"
                  >
                    Done
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
