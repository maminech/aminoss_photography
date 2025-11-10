'use client';

import { FiWifiOff, FiHome, FiRefreshCw } from 'react-icons/fi';
import Link from 'next/link';

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-white/20 text-center">
          {/* Icon */}
          <div className="mb-6 flex justify-center">
            <div className="w-24 h-24 bg-orange-500/20 rounded-full flex items-center justify-center animate-pulse">
              <FiWifiOff size={48} className="text-orange-400" />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-white mb-3">
            You're Offline
          </h1>

          {/* Description */}
          <p className="text-gray-300 mb-6 leading-relaxed">
            No internet connection detected. Don't worry, you can still browse cached pages and galleries!
          </p>

          {/* Features available offline */}
          <div className="bg-white/5 rounded-2xl p-4 mb-6 text-left">
            <h3 className="text-white font-semibold mb-3 text-sm">Available Offline:</h3>
            <ul className="space-y-2 text-gray-300 text-sm">
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
                Previously viewed galleries
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
                Cached pages and content
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
                App navigation
              </li>
            </ul>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-gradient-to-r from-orange-500 to-amber-600 text-white px-6 py-3.5 rounded-xl font-semibold hover:from-orange-600 hover:to-amber-700 transition-all duration-200 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
            >
              <FiRefreshCw size={20} />
              Try Again
            </button>

            <Link
              href="/"
              className="block w-full bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-3"
            >
              <FiHome size={20} />
              Go to Home
            </Link>
          </div>

          {/* Tip */}
          <div className="mt-6 text-gray-400 text-xs">
            💡 Tip: Once you're back online, this page will automatically refresh
          </div>
        </div>
      </div>
    </div>
  );
}
