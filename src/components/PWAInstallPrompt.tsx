'use client';

import { useState, useEffect } from 'react';
import { FiDownload, FiX, FiSmartphone, FiBell, FiZap, FiLock, FiTrendingUp } from 'react-icons/fi';

export default function PWAInstallPrompt() {
  // Disabled - PWA install prompt
  return null;
  
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

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
      setTimeout(() => setIsAnimating(true), 100);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(console.error);
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
    <div 
      className={`fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-[440px] bg-gradient-to-br from-purple-600 via-indigo-600 to-purple-700 text-white rounded-2xl shadow-2xl p-6 z-50 border-2 border-white/20 transition-all duration-500 ${
        isAnimating ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
      }`}
      style={{
        backdropFilter: 'blur(10px)',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.1)'
      }}
    >
      <button
        onClick={() => setShowPrompt(false)}
        className="absolute top-3 right-3 text-white/80 hover:text-white transition-all duration-200 hover:scale-110 hover:rotate-90"
        aria-label="Dismiss"
      >
        <FiX size={22} />
      </button>

      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg animate-pulse">
          <div className="text-white text-3xl font-bold">A</div>
        </div>
        
        <div className="flex-1 pt-1">
          <h3 className="font-bold text-xl mb-2 text-white drop-shadow-sm">
            Install Admin App
          </h3>
          <p className="text-white/95 text-sm mb-4 leading-relaxed">
            Get instant access to your dashboard with push notifications and offline support!
          </p>

          {/* Features */}
          <div className="space-y-2.5 mb-5">
            <div className="flex items-center gap-3 text-white/95 text-sm group">
              <div className="flex-shrink-0 w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                <FiBell size={14} />
              </div>
              <span>Real-time push notifications</span>
            </div>
            <div className="flex items-center gap-3 text-white/95 text-sm group">
              <div className="flex-shrink-0 w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                <FiZap size={14} />
              </div>
              <span>Lightning fast access</span>
            </div>
            <div className="flex items-center gap-3 text-white/95 text-sm group">
              <div className="flex-shrink-0 w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                <FiLock size={14} />
              </div>
              <span>Works offline • Secure</span>
            </div>
            <div className="flex items-center gap-3 text-white/95 text-sm group">
              <div className="flex-shrink-0 w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                <FiTrendingUp size={14} />
              </div>
              <span>Manage business anywhere</span>
            </div>
          </div>

          <button
            onClick={handleInstall}
            className="w-full bg-white text-purple-700 px-5 py-3.5 rounded-xl font-bold hover:bg-purple-50 transition-all duration-200 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] group relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-purple-50 to-indigo-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <FiDownload size={20} className="relative z-10 group-hover:animate-bounce" />
            <span className="relative z-10">Install Admin App</span>
          </button>

          <div className="flex items-center justify-center gap-2 text-white/70 text-xs mt-3">
            <span className="w-1.5 h-1.5 bg-white/70 rounded-full"></span>
            <span>Instant Access</span>
            <span className="w-1.5 h-1.5 bg-white/70 rounded-full"></span>
            <span>No App Store</span>
            <span className="w-1.5 h-1.5 bg-white/70 rounded-full"></span>
            <span>Always Updated</span>
          </div>
        </div>
      </div>
    </div>
  );
}
