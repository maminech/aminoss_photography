/**
 * Enhanced Lightbox Component
 * Full-screen image viewer with swipe gestures, keyboard navigation, and animations
 */

'use client';

import { useEffect, useCallback, useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { 
  FiX, 
  FiChevronLeft, 
  FiChevronRight, 
  FiDownload, 
  FiShare2, 
  FiHeart,
  FiZoomIn,
  FiZoomOut
} from 'react-icons/fi';
import { designTokens } from '@/styles/design-tokens';
import { animations } from '@/lib/animations';
import { MediaItem } from '@/types';

interface EnhancedLightboxProps {
  items: MediaItem[];
  initialIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onLike?: (item: MediaItem) => void;
  onDownload?: (item: MediaItem) => void;
  onShare?: (item: MediaItem) => void;
}

export default function EnhancedLightbox({
  items,
  initialIndex,
  isOpen,
  onClose,
  onLike,
  onDownload,
  onShare
}: EnhancedLightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isZoomed, setIsZoomed] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const x = useMotionValue(0);
  const opacity = useTransform(x, [-200, 0, 200], [0.5, 1, 0.5]);

  const currentItem = items[currentIndex];

  // Reset state when index changes
  useEffect(() => {
    setCurrentIndex(initialIndex);
    setIsZoomed(false);
    setImageLoaded(false);
  }, [initialIndex]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowLeft':
          goToPrevious();
          break;
        case 'ArrowRight':
          goToNext();
          break;
        case '+':
        case '=':
          setIsZoomed(true);
          break;
        case '-':
        case '_':
          setIsZoomed(false);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentIndex]);

  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const goToPrevious = useCallback(() => {
    setImageLoaded(false);
    setIsZoomed(false);
    setCurrentIndex((prev) => (prev === 0 ? items.length - 1 : prev - 1));
  }, [items.length]);

  const goToNext = useCallback(() => {
    setImageLoaded(false);
    setIsZoomed(false);
    setCurrentIndex((prev) => (prev === items.length - 1 ? 0 : prev + 1));
  }, [items.length]);

  const handleDragEnd = useCallback(
    (_: any, info: PanInfo) => {
      const threshold = 50;
      if (info.offset.x > threshold) {
        goToPrevious();
      } else if (info.offset.x < -threshold) {
        goToNext();
      }
    },
    [goToPrevious, goToNext]
  );

  const handleDownload = async () => {
    if (!currentItem || !onDownload) return;
    onDownload(currentItem);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] flex items-center justify-center"
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.95)' }}
      >
        {/* Close Button */}
        <motion.button
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ delay: 0.1 }}
          onClick={onClose}
          className="fixed top-4 right-4 sm:top-6 sm:right-6 z-50 w-12 h-12 rounded-full flex items-center justify-center text-white transition-all"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)'
          }}
          whileHover={{ scale: 1.1, backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
          whileTap={{ scale: 0.9 }}
          aria-label="Close lightbox"
        >
          <FiX className="w-6 h-6" />
        </motion.button>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ delay: 0.2 }}
          className="fixed top-4 left-4 sm:top-6 sm:left-6 z-50 flex gap-2"
        >
          {onLike && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => onLike(currentItem)}
              className="w-12 h-12 rounded-full flex items-center justify-center text-white transition-all"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)'
              }}
              aria-label="Like image"
            >
              <FiHeart className="w-5 h-5" />
            </motion.button>
          )}
          {onShare && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => onShare(currentItem)}
              className="w-12 h-12 rounded-full flex items-center justify-center text-white transition-all"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)'
              }}
              aria-label="Share image"
            >
              <FiShare2 className="w-5 h-5" />
            </motion.button>
          )}
          {onDownload && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleDownload}
              className="w-12 h-12 rounded-full flex items-center justify-center text-white transition-all"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)'
              }}
              aria-label="Download image"
            >
              <FiDownload className="w-5 h-5" />
            </motion.button>
          )}
        </motion.div>

        {/* Zoom Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ delay: 0.2 }}
          className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex gap-2"
        >
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsZoomed(false)}
            className={`w-12 h-12 rounded-full flex items-center justify-center text-white transition-all ${
              !isZoomed ? 'bg-white/20' : 'bg-white/10'
            }`}
            style={{ backdropFilter: 'blur(10px)' }}
            aria-label="Zoom out"
          >
            <FiZoomOut className="w-5 h-5" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsZoomed(true)}
            className={`w-12 h-12 rounded-full flex items-center justify-center text-white transition-all ${
              isZoomed ? 'bg-white/20' : 'bg-white/10'
            }`}
            style={{ backdropFilter: 'blur(10px)' }}
            aria-label="Zoom in"
          >
            <FiZoomIn className="w-5 h-5" />
          </motion.button>
        </motion.div>

        {/* Navigation - Previous */}
        {items.length > 1 && (
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ delay: 0.3 }}
            onClick={goToPrevious}
            className="fixed left-4 top-1/2 -translate-y-1/2 z-50 w-14 h-14 rounded-full flex items-center justify-center text-white transition-all"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)'
            }}
            whileHover={{ scale: 1.1, backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
            whileTap={{ scale: 0.9 }}
            aria-label="Previous image"
          >
            <FiChevronLeft className="w-7 h-7" />
          </motion.button>
        )}

        {/* Navigation - Next */}
        {items.length > 1 && (
          <motion.button
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ delay: 0.3 }}
            onClick={goToNext}
            className="fixed right-4 top-1/2 -translate-y-1/2 z-50 w-14 h-14 rounded-full flex items-center justify-center text-white transition-all"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)'
            }}
            whileHover={{ scale: 1.1, backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
            whileTap={{ scale: 0.9 }}
            aria-label="Next image"
          >
            <FiChevronRight className="w-7 h-7" />
          </motion.button>
        )}

        {/* Image Container */}
        <motion.div
          key={currentIndex}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.2}
          onDragEnd={handleDragEnd}
          style={{ x, opacity }}
          className={`relative max-w-[95vw] max-h-[90vh] ${
            isZoomed ? 'cursor-zoom-out' : 'cursor-grab active:cursor-grabbing'
          }`}
          onClick={() => setIsZoomed(!isZoomed)}
        >
          {/* Loading Skeleton */}
          {!imageLoaded && (
            <div 
              className="absolute inset-0 animate-pulse rounded-lg"
              style={{
                background: designTokens.gradients.shimmer,
                backgroundSize: '200% 100%',
                animation: 'shimmer 1.5s infinite'
              }}
            />
          )}

          {/* Image */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ 
              scale: isZoomed ? 1.5 : 1, 
              opacity: imageLoaded ? 1 : 0 
            }}
            transition={{ 
              type: 'spring', 
              stiffness: 300, 
              damping: 30 
            }}
            className="relative"
          >
            <Image
              src={currentItem.url}
              alt={currentItem.title || `Image ${currentIndex + 1}`}
              width={1200}
              height={800}
              className="rounded-lg object-contain max-w-[95vw] max-h-[90vh]"
              style={{ boxShadow: designTokens.shadows['2xl'] }}
              onLoad={() => setImageLoaded(true)}
              priority
              quality={95}
            />
          </motion.div>
        </motion.div>

        {/* Image Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ delay: 0.4 }}
          className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 text-center max-w-2xl px-4"
        >
          {currentItem.title && (
            <h3 
              className="text-white text-xl font-semibold mb-2 font-serif"
            >
              {currentItem.title}
            </h3>
          )}
          {currentItem.description && (
            <p className="text-white/80 text-sm">{currentItem.description}</p>
          )}
          <p className="text-white/60 text-xs mt-2">
            {currentIndex + 1} / {items.length}
          </p>
        </motion.div>

        {/* Shimmer Animation */}
        <style jsx>{`
          @keyframes shimmer {
            0% { background-position: -200% 0; }
            100% { background-position: 200% 0; }
          }
        `}</style>
      </motion.div>
    </AnimatePresence>
  );
}
