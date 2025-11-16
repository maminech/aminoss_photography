'use client';

import { useState } from 'react';
import { FiShare2, FiCheck, FiCopy } from 'react-icons/fi';

interface ShareButtonProps {
  url?: string;
  title?: string;
  text?: string;
  className?: string;
}

export default function ShareButton({
  url = typeof window !== 'undefined' ? window.location.href : '',
  title = 'Innov8 Production',
  text = 'Check out this amazing photography portfolio!',
  className = ''
}: ShareButtonProps) {
  const [showCopied, setShowCopied] = useState(false);

  const handleShare = async () => {
    // Try native share API first (mobile devices)
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text,
          url,
        });
        return;
      } catch (err) {
        // User cancelled or error occurred
        if ((err as Error).name !== 'AbortError') {
          console.error('Share failed:', err);
        }
      }
    }

    // Fallback: Copy to clipboard
    try {
      await navigator.clipboard.writeText(url);
      setShowCopied(true);
      setTimeout(() => setShowCopied(false), 2000);
    } catch (err) {
      console.error('Copy failed:', err);
      alert(`Share this link: ${url}`);
    }
  };

  return (
    <button
      onClick={handleShare}
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all duration-200 hover:scale-105 active:scale-95 backdrop-blur-sm ${className}`}
      aria-label="Share"
    >
      {showCopied ? (
        <>
          <FiCheck size={18} />
          <span className="font-medium">Copied!</span>
        </>
      ) : (
        <>
          <FiShare2 size={18} />
          <span className="font-medium">Share</span>
        </>
      )}
    </button>
  );
}
