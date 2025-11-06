'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { FiX } from 'react-icons/fi';

interface Story {
  id: string;
  image: string;
  title?: string;
}

interface Highlight {
  id: string;
  name: string;
  coverImage: string;
  stories: Story[];
}

interface StoriesViewerProps {
  highlights: Highlight[];
  onClose: () => void;
  initialHighlightIndex?: number;
}

export default function StoriesViewer({ 
  highlights, 
  onClose, 
  initialHighlightIndex = 0 
}: StoriesViewerProps) {
  const [currentHighlightIndex, setCurrentHighlightIndex] = useState(initialHighlightIndex);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);

  const currentHighlight = highlights[currentHighlightIndex];
  const currentStory = currentHighlight?.stories[currentStoryIndex];
  const totalStories = currentHighlight?.stories.length || 0;

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        goToPreviousStory();
      } else if (e.key === 'ArrowRight') {
        goToNextStory();
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentStoryIndex, currentHighlightIndex]);

  // Auto progress story
  useEffect(() => {
    if (!currentStory || isPaused) return;

    const duration = 5000; // 5 seconds per story
    const interval = 50;
    const increment = (interval / duration) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          // Move to next story
          if (currentStoryIndex < totalStories - 1) {
            setCurrentStoryIndex(currentStoryIndex + 1);
            return 0;
          } else if (currentHighlightIndex < highlights.length - 1) {
            // Move to next highlight
            setCurrentHighlightIndex(currentHighlightIndex + 1);
            setCurrentStoryIndex(0);
            return 0;
          } else {
            // End of all stories
            onClose();
            return 0;
          }
        }
        return prev + increment;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [currentStory, currentStoryIndex, currentHighlightIndex, isPaused, totalStories, highlights.length, onClose]);

  const goToNextStory = () => {
    if (currentStoryIndex < totalStories - 1) {
      setCurrentStoryIndex(currentStoryIndex + 1);
      setProgress(0);
    } else if (currentHighlightIndex < highlights.length - 1) {
      setCurrentHighlightIndex(currentHighlightIndex + 1);
      setCurrentStoryIndex(0);
      setProgress(0);
    } else {
      onClose();
    }
  };

  const goToPreviousStory = () => {
    if (currentStoryIndex > 0) {
      setCurrentStoryIndex(currentStoryIndex - 1);
      setProgress(0);
    } else if (currentHighlightIndex > 0) {
      setCurrentHighlightIndex(currentHighlightIndex - 1);
      const prevHighlight = highlights[currentHighlightIndex - 1];
      setCurrentStoryIndex(prevHighlight.stories.length - 1);
      setProgress(0);
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    setDragStart({ x: touch.clientX, y: touch.clientY });
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!dragStart) return;

    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - dragStart.x;
    const deltaY = touch.clientY - dragStart.y;

    // Detect swipe down to close
    if (Math.abs(deltaY) > Math.abs(deltaX) && deltaY > 100) {
      onClose();
      return;
    }

    // Tap navigation (left/right)
    const screenWidth = window.innerWidth;
    if (Math.abs(deltaX) < 10 && Math.abs(deltaY) < 10) {
      if (dragStart.x < screenWidth / 2) {
        goToPreviousStory();
      } else {
        goToNextStory();
      }
    }

    setDragStart(null);
  };

  if (!currentStory) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] bg-black"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onMouseDown={(e) => {
          const screenWidth = window.innerWidth;
          if (e.clientX < screenWidth / 2) {
            goToPreviousStory();
          } else {
            goToNextStory();
          }
        }}
      >
        {/* Progress bars */}
        <div className="absolute top-0 left-0 right-0 z-20 flex gap-1 p-2">
          {currentHighlight.stories.map((_, index) => (
            <div key={index} className="flex-1 h-0.5 bg-white/30 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-white"
                initial={{ width: '0%' }}
                animate={{
                  width: index < currentStoryIndex
                    ? '100%'
                    : index === currentStoryIndex
                    ? `${progress}%`
                    : '0%'
                }}
                transition={{ duration: 0.1 }}
              />
            </div>
          ))}
        </div>

        {/* Header */}
        <div className="absolute top-4 left-0 right-0 z-20 flex items-center justify-between px-4 pt-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center overflow-hidden">
              <Image
                src={currentHighlight.coverImage}
                alt={currentHighlight.name}
                width={32}
                height={32}
                className="w-full h-full object-cover"
              />
            </div>
            <span className="text-white text-sm font-semibold">
              {currentHighlight.name}
            </span>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="p-2 text-white"
          >
            <FiX className="w-6 h-6" />
          </button>
        </div>

        {/* Story Image */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            key={currentStory.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.3 }}
            className="relative w-full h-full"
          >
            <Image
              src={currentStory.image}
              alt={currentStory.title || 'Story'}
              fill
              className="object-contain"
              priority
              quality={95}
            />
          </motion.div>
        </div>

        {/* Story title (if any) */}
        {currentStory.title && (
          <div className="absolute bottom-20 left-0 right-0 z-20 px-4">
            <p className="text-white text-center text-lg font-semibold drop-shadow-lg">
              {currentStory.title}
            </p>
          </div>
        )}

        {/* Touch areas (invisible) */}
        <div className="absolute inset-0 flex">
          <div className="w-1/2 h-full" />
          <div className="w-1/2 h-full" />
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
