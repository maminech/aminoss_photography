'use client';

import { useState, useEffect } from 'react';
import { FiDownload, FiX, FiCamera, FiImage, FiStar, FiZap, FiSmartphone } from 'react-icons/fi';

export default function PublicPWAInstallPrompt() {
  // Disabled - PWA install prompt
  return null;
  
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showLater, setShowLater] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Check if user dismissed it recently
    const dismissed = localStorage.getItem('pwa-install-dismissed');
    if (dismissed) {
      const dismissedTime = parseInt(dismissed);
      const daysSinceDismissed = (Date.now() - dismissedTime) / (1000 * 60 * 60 * 24);
      if (daysSinceDismissed < 7) {
        // Don't show again for 7 days
        return;
      }
    }

    // Wait 10 seconds before showing prompt (better UX)
    const timer = setTimeout(() => {
      setShowLater(true);
    }, 10000);

    // Listen for beforeinstallprompt event
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      if (showLater) {
        setShowPrompt(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/client-sw.js').catch(console.error);
    }

    return () => {
      clearTimeout(timer);
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, [showLater]);

  useEffect(() => {
    if (deferredPrompt && showLater) {
      setShowPrompt(true);
      // Trigger animation after component mounts
      setTimeout(() => setIsAnimating(true), 100);
    }
  }, [deferredPrompt, showLater]);

  const handleInstall = async () => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    
    if (!deferredPrompt || isIOS) {
      // iOS-specific instructions
      if (isIOS) {
        const instructions = `📱 Install on iPhone/iPad:\n\n` +
          `1. Tap the Share button (⬆️) at the bottom of Safari\n` +
          `2. Scroll down and tap "Add to Home Screen" 🏠\n` +
          `3. Tap "Add" in the top right\n` +
          `4. Find the Innov8 icon on your home screen!\n\n` +
          `✨ You'll have instant access to our portfolio!`;
        
        alert(instructions);
      } else {
        // Other browsers
        alert(
          '📱 Install this app:\n\n' +
          'Chrome/Edge:\n' +
          '1. Tap the menu (⋮) or (•••)\n' +
          '2. Tap "Install app" or "Add to Home screen"\n\n' +
          '✨ Quick access to our portfolio anytime!'
        );
      }
      return;
    }

    // Android/Desktop Chrome installation
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      setShowPrompt(false);
      setIsInstalled(true);
      localStorage.removeItem('pwa-install-dismissed');
    }

    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
  };

  if (isInstalled || !showPrompt) {
    return null;
  }

  return (
    <div 
      className={`fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-[440px] bg-gradient-to-br from-amber-600 via-orange-600 to-amber-700 text-white rounded-2xl shadow-2xl p-6 z-50 border-2 border-white/20 transition-all duration-500 ${
        isAnimating ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
      }`}
      style={{
        backdropFilter: 'blur(10px)',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.1)'
      }}
    >
      <button
        onClick={handleDismiss}
        className="absolute top-3 right-3 text-white/80 hover:text-white transition-all duration-200 hover:scale-110 hover:rotate-90"
        aria-label="Dismiss"
      >
        <FiX size={22} />
      </button>

      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg animate-pulse">
          <FiCamera size={32} className="text-white" />
        </div>
        
        <div className="flex-1 pt-1">
          <h3 className="font-bold text-xl mb-2 text-white drop-shadow-sm">
            Install Our App
          </h3>
          <p className="text-white/95 text-sm mb-4 leading-relaxed">
            Get quick access to our portfolio, book sessions, and view galleries - all from your home screen!
          </p>

          {/* Features */}
          <div className="space-y-2.5 mb-5">
            <div className="flex items-center gap-3 text-white/95 text-sm group">
              <div className="flex-shrink-0 w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                <FiImage size={14} />
              </div>
              <span>Browse latest photography work</span>
            </div>
            <div className="flex items-center gap-3 text-white/95 text-sm group">
              <div className="flex-shrink-0 w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                <FiStar size={14} />
              </div>
              <span>Book sessions instantly</span>
            </div>
            <div className="flex items-center gap-3 text-white/95 text-sm group">
              <div className="flex-shrink-0 w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                <FiZap size={14} />
              </div>
              <span>Lightning fast • Works offline</span>
            </div>
            <div className="flex items-center gap-3 text-white/95 text-sm group">
              <div className="flex-shrink-0 w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                <FiSmartphone size={14} />
              </div>
              <span>No app store • Installs in seconds</span>
            </div>
          </div>

          <button
            onClick={handleInstall}
            className="w-full bg-white text-amber-700 px-5 py-3.5 rounded-xl font-bold hover:bg-amber-50 transition-all duration-200 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] group relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-amber-50 to-orange-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <FiDownload size={20} className="relative z-10 group-hover:animate-bounce" />
            <span className="relative z-10">Install App</span>
          </button>

          <div className="flex items-center justify-center gap-2 text-white/70 text-xs mt-3">
            <span className="w-1.5 h-1.5 bg-white/70 rounded-full"></span>
            <span>Free Forever</span>
            <span className="w-1.5 h-1.5 bg-white/70 rounded-full"></span>
            <span>All Devices</span>
            <span className="w-1.5 h-1.5 bg-white/70 rounded-full"></span>
            <span>1-Tap Access</span>
          </div>
        </div>
      </div>
    </div>
  );
}
