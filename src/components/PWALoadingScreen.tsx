'use client';

import { useState, useEffect } from 'react';
import { FiCamera } from 'react-icons/fi';

interface PWALoadingScreenProps {
  isPublic?: boolean;
}

export default function PWALoadingScreen({ isPublic = true }: PWALoadingScreenProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Only show in standalone mode (PWA)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    
    if (!isStandalone) {
      setIsVisible(false);
      return;
    }

    // Show for 1.5 seconds
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center ${
        isPublic
          ? 'bg-gradient-to-br from-amber-600 via-orange-600 to-amber-700'
          : 'bg-gradient-to-br from-purple-600 via-indigo-600 to-purple-700'
      }`}
      style={{ animation: 'fadeOut 0.5s ease-out 1s forwards' }}
    >
      <style jsx>{`
        @keyframes fadeOut {
          to {
            opacity: 0;
            visibility: hidden;
          }
        }
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.8;
            transform: scale(1.1);
          }
        }
      `}</style>
      
      <div className="text-center">
        <div
          className="inline-flex items-center justify-center w-24 h-24 bg-white/20 backdrop-blur-sm rounded-3xl mb-6 shadow-2xl"
          style={{ animation: 'pulse 1.5s ease-in-out infinite' }}
        >
          {isPublic ? (
            <FiCamera size={48} className="text-white" />
          ) : (
            <div className="text-white text-5xl font-bold">A</div>
          )}
        </div>
        <h1 className="text-white text-3xl font-bold mb-2">
          {isPublic ? 'Innov8 Production' : 'Admin Dashboard'}
        </h1>
        <div className="flex gap-2 justify-center">
          <div className="w-2 h-2 bg-white/80 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 bg-white/80 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2 h-2 bg-white/80 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>
    </div>
  );
}
