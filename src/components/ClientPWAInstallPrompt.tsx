'use client';

import { useState, useEffect } from 'react';
import { FiDownload, FiX, FiCamera } from 'react-icons/fi';

export default function ClientPWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Listen for beforeinstallprompt event
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/client-sw.js').catch(console.error);
    }

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) {
      // Manual installation instructions for iOS and other browsers
      alert(
        'To install this app:\n\n' +
        'Android Chrome:\n' +
        '1. Tap the menu (⋮)\n' +
        '2. Tap "Install app" or "Add to Home screen"\n\n' +
        'iPhone Safari:\n' +
        '1. Tap the Share button (⬆️)\n' +
        '2. Tap "Add to Home Screen"\n' +
        '3. Tap "Add"'
      );
      return;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      setShowPrompt(false);
      setIsInstalled(true);
    }

    setDeferredPrompt(null);
  };

  if (isInstalled || !showPrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-lg shadow-2xl p-4 z-50 animate-slide-up">
      <button
        onClick={() => setShowPrompt(false)}
        className="absolute top-2 right-2 text-white/80 hover:text-white"
      >
        <FiX size={20} />
      </button>

      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
          <FiCamera size={24} />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-lg mb-1">Install Client App</h3>
          <p className="text-white/90 text-sm mb-3">
            Quick access to your photos and galleries on your device
          </p>
          <button
            onClick={handleInstall}
            className="w-full bg-white text-amber-600 px-4 py-2 rounded-lg font-semibold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
          >
            <FiDownload size={18} />
            Install App
          </button>
        </div>
      </div>
    </div>
  );
}
