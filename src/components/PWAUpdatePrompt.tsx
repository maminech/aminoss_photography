'use client';

import { useState, useEffect } from 'react';
import { FiRefreshCw, FiX } from 'react-icons/fi';

export default function PWAUpdatePrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((reg) => {
        setRegistration(reg);

        // Check for updates every 30 minutes
        setInterval(() => {
          reg.update();
        }, 30 * 60 * 1000);

        // Listen for updates
        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                setShowPrompt(true);
              }
            });
          }
        });
      });
    }
  }, []);

  const handleUpdate = () => {
    if (registration?.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      window.location.reload();
    }
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed top-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl shadow-2xl p-4 z-50 animate-slide-down border border-white/20">
      <button
        onClick={() => setShowPrompt(false)}
        className="absolute top-2 right-2 text-white/80 hover:text-white transition-colors"
        aria-label="Dismiss"
      >
        <FiX size={18} />
      </button>

      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
          <FiRefreshCw size={20} />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-base mb-1">Update Available</h3>
          <p className="text-white/90 text-sm mb-3">
            A new version is ready. Update now for the best experience!
          </p>
          <button
            onClick={handleUpdate}
            className="w-full bg-white text-blue-600 px-4 py-2 rounded-lg font-semibold hover:bg-blue-50 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
          >
            <FiRefreshCw size={16} />
            Update Now
          </button>
        </div>
      </div>
    </div>
  );
}
