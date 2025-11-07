'use client';

import { motion } from 'framer-motion';
import { FiCheck, FiHeart } from 'react-icons/fi';
import { useParams, useRouter } from 'next/navigation';

export default function SuccessPage() {
  const params = useParams();
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 sm:p-12 text-center max-w-md w-full"
      >
        {/* Success Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="mb-6"
        >
          <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-pink-500 to-purple-500 rounded-full flex items-center justify-center mx-auto shadow-xl">
            <FiCheck className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
          </div>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4"
        >
          Thank You! ❤️
        </motion.h1>

        {/* Message */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-base sm:text-lg text-gray-600 dark:text-gray-400 mb-3"
        >
          Your memories have been saved!
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-sm text-gray-500 dark:text-gray-500 mb-8"
        >
          The couple will cherish these moments forever.
        </motion.p>

        {/* Heart Icon Animation */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mb-8"
        >
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              repeatType: 'reverse',
            }}
          >
            <FiHeart className="w-12 h-12 text-pink-500 mx-auto" fill="currentColor" />
          </motion.div>
        </motion.div>

        {/* Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="space-y-3"
        >
          <button
            onClick={() => router.push(`/events/${params.eventId}/guest-upload`)}
            className="w-full py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white font-semibold rounded-lg hover:shadow-xl transition-all transform hover:scale-[1.02] active:scale-[0.98]"
          >
            Upload More Photos
          </button>
          
          <button
            onClick={() => window.close()}
            className="w-full py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
          >
            Close
          </button>
        </motion.div>

        {/* Decorative Elements */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-8 flex items-center justify-center gap-2 text-xs text-gray-400 dark:text-gray-600"
        >
          <span>Made with</span>
          <FiHeart className="w-3 h-3 text-pink-500" fill="currentColor" />
          <span>by Aminoss Photography</span>
        </motion.div>
      </motion.div>
    </div>
  );
}
