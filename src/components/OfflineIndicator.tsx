'use client';

import { useState, useEffect } from 'react';
import { FiWifiOff, FiWifi } from 'react-icons/fi';

export default function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(true);
  const [showIndicator, setShowIndicator] = useState(false);

  useEffect(() => {
    setIsOnline(navigator.onLine);

    const handleOnline = () => {
      setIsOnline(true);
      setShowIndicator(true);
      setTimeout(() => setShowIndicator(false), 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowIndicator(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!showIndicator) return null;

  return (
    <div
      className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 animate-slide-down ${
        isOnline
          ? 'bg-gradient-to-r from-green-500 to-emerald-500'
          : 'bg-gradient-to-r from-gray-600 to-gray-700'
      } text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 border-2 border-white/20`}
    >
      {isOnline ? (
        <>
          <FiWifi size={20} className="animate-pulse" />
          <span className="font-semibold">Back Online</span>
        </>
      ) : (
        <>
          <FiWifiOff size={20} />
          <span className="font-semibold">You're Offline</span>
        </>
      )}
    </div>
  );
}
