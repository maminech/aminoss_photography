'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

interface HighlightItem {
  id: string;
  mediaType: 'image' | 'video';
  mediaUrl: string;
  thumbnailUrl: string;
  title?: string;
  description?: string;
  duration?: number;
  order: number;
}

interface Highlight {
  id: string;
  title: string;
  coverImage: string;
  description?: string;
  order: number;
  active: boolean;
  items: HighlightItem[];
}

export default function HighlightsRow() {
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [selectedHighlight, setSelectedHighlight] = useState<Highlight | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHighlights = async () => {
      try {
        const res = await fetch('/api/admin/highlights', {
          cache: 'no-store'
        });
        if (res.ok) {
          const data = await res.json();
          // Only show active highlights
          setHighlights(data.filter((h: Highlight) => h.active));
        }
      } catch (error) {
        console.error('Error fetching highlights:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHighlights();
  }, []);

  const handleHighlightClick = (highlight: Highlight) => {
    setSelectedHighlight(highlight);
    setCurrentIndex(0);
  };

  const handleClose = () => {
    setSelectedHighlight(null);
    setCurrentIndex(0);
  };

  const handleNext = () => {
    if (!selectedHighlight) return;
    if (currentIndex < selectedHighlight.items.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // Move to next highlight
      const currentHighlightIndex = highlights.findIndex(h => h.id === selectedHighlight.id);
      if (currentHighlightIndex < highlights.length - 1) {
        setSelectedHighlight(highlights[currentHighlightIndex + 1]);
        setCurrentIndex(0);
      } else {
        handleClose();
      }
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    } else if (selectedHighlight) {
      // Move to previous highlight
      const currentHighlightIndex = highlights.findIndex(h => h.id === selectedHighlight.id);
      if (currentHighlightIndex > 0) {
        const prevHighlight = highlights[currentHighlightIndex - 1];
        setSelectedHighlight(prevHighlight);
        setCurrentIndex(prevHighlight.items.length - 1);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex gap-4 px-4 py-6 overflow-x-auto">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex flex-col items-center gap-2 animate-pulse">
            <div className="w-20 h-20 rounded-full bg-gray-300 dark:bg-gray-700"></div>
            <div className="w-16 h-3 bg-gray-300 dark:bg-gray-700 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  if (highlights.length === 0) {
    return null;
  }

  return (
    <>
      {/* Highlights Row */}
      <div className="w-full overflow-x-auto pb-4 px-4 scrollbar-hide">
        <div className="flex gap-4 md:gap-6">
          {highlights.map((highlight) => (
            <motion.button
              key={highlight.id}
              whileTap={{ scale: 0.9 }}
              onClick={() => handleHighlightClick(highlight)}
              className="flex flex-col items-center gap-2 flex-shrink-0 group"
            >
              {/* Circular Avatar with Gradient Ring */}
              <div className="relative">
                {/* Gradient Ring - Instagram Style */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 p-[3px] group-hover:p-[4px] transition-all">
                  <div className="w-full h-full rounded-full bg-white dark:bg-gray-900 p-[3px]">
                    <div className="relative w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full overflow-hidden">
                      <Image
                        src={highlight.coverImage}
                        alt={highlight.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Title */}
              <span className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white max-w-[80px] md:max-w-[100px] truncate">
                {highlight.title}
              </span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Stories Viewer - Full Screen */}
      <AnimatePresence>
        {selectedHighlight && (
          <StoriesViewer
            highlight={selectedHighlight}
            currentIndex={currentIndex}
            onClose={handleClose}
            onNext={handleNext}
            onPrevious={handlePrevious}
            totalHighlights={highlights.length}
            currentHighlightIndex={highlights.findIndex(h => h.id === selectedHighlight.id)}
          />
        )}
      </AnimatePresence>
    </>
  );
}

// Stories Viewer Component
interface StoriesViewerProps {
  highlight: Highlight;
  currentIndex: number;
  onClose: () => void;
  onNext: () => void;
  onPrevious: () => void;
  totalHighlights: number;
  currentHighlightIndex: number;
}

function StoriesViewer({
  highlight,
  currentIndex,
  onClose,
  onNext,
  onPrevious,
  totalHighlights,
  currentHighlightIndex
}: StoriesViewerProps) {
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const currentItem = highlight.items[currentIndex];
  const duration = currentItem?.mediaType === 'video' ? (currentItem.duration || 10) * 1000 : 5000;

  // Auto-advance progress
  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          onNext();
          return 0;
        }
        return prev + (100 / (duration / 100));
      });
    }, 100);

    return () => clearInterval(interval);
  }, [duration, isPaused, onNext]);

  // Reset progress on item change
  useEffect(() => {
    setProgress(0);
  }, [currentIndex]);

  // Handle keyboard
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') onNext();
      if (e.key === 'ArrowLeft') onPrevious();
      if (e.key === ' ') setIsPaused(prev => !prev);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, onNext, onPrevious]);

  // Handle swipe gestures
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.touches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (touchStart - touchEnd > 75) {
      // Swiped left
      onNext();
    }
    if (touchStart - touchEnd < -75) {
      // Swiped right
      onPrevious();
    }
  };

  const handleScreenTap = (e: React.MouseEvent) => {
    const screenWidth = window.innerWidth;
    const tapX = e.clientX;
    
    if (tapX < screenWidth / 3) {
      onPrevious();
    } else if (tapX > (screenWidth * 2) / 3) {
      onNext();
    } else {
      setIsPaused(prev => !prev);
    }
  };

  if (!currentItem) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onClick={handleScreenTap}
    >
      {/* Progress Bars */}
      <div className="absolute top-0 left-0 right-0 z-10 flex gap-1 p-4">
        {highlight.items.map((item, index) => (
          <div
            key={item.id}
            className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden"
          >
            <motion.div
              className="h-full bg-white rounded-full"
              initial={{ width: '0%' }}
              animate={{
                width: index < currentIndex ? '100%' : index === currentIndex ? `${progress}%` : '0%'
              }}
              transition={{ duration: 0.1 }}
            />
          </div>
        ))}
      </div>

      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 p-4 pt-16 bg-gradient-to-b from-black/50 to-transparent">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-white">
              <Image
                src={highlight.coverImage}
                alt={highlight.title}
                width={40}
                height={40}
                className="object-cover"
              />
            </div>
            <div className="text-white">
              <h3 className="font-semibold text-sm">{highlight.title}</h3>
              <p className="text-xs opacity-80">
                {currentIndex + 1} / {highlight.items.length}
              </p>
            </div>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="text-white p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Media Content */}
      <div className="absolute inset-0 flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentItem.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.3 }}
            className="relative w-full h-full"
          >
            {currentItem.mediaType === 'video' ? (
              <video
                src={currentItem.mediaUrl}
                autoPlay
                muted
                playsInline
                className="w-full h-full object-contain"
                onEnded={onNext}
              />
            ) : (
              <Image
                src={currentItem.mediaUrl}
                alt={currentItem.title || ''}
                fill
                className="object-contain"
                priority
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Caption */}
      {(currentItem.title || currentItem.description) && (
        <div className="absolute bottom-0 left-0 right-0 z-10 p-6 bg-gradient-to-t from-black/70 to-transparent">
          {currentItem.title && (
            <h4 className="text-white font-semibold text-lg mb-1">
              {currentItem.title}
            </h4>
          )}
          {currentItem.description && (
            <p className="text-white/90 text-sm line-clamp-3">
              {currentItem.description}
            </p>
          )}
        </div>
      )}

      {/* Pause Indicator */}
      {isPaused && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black/50 rounded-full p-4"
        >
          <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
          </svg>
        </motion.div>
      )}

      {/* Navigation Zones (invisible) */}
      <div className="absolute inset-0 flex">
        <div className="w-1/3 h-full" onClick={(e) => { e.stopPropagation(); onPrevious(); }} />
        <div className="w-1/3 h-full" onClick={(e) => { e.stopPropagation(); setIsPaused(prev => !prev); }} />
        <div className="w-1/3 h-full" onClick={(e) => { e.stopPropagation(); onNext(); }} />
      </div>
    </motion.div>
  );
}
