'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { FiX, FiChevronLeft, FiChevronRight, FiCamera, FiMapPin } from 'react-icons/fi';
import { MediaItem } from '@/types';

interface LightboxModalProps {
  images: MediaItem[];
  currentIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onNext: () => void;
  onPrevious: () => void;
}

export default function LightboxModal({
  images,
  currentIndex,
  isOpen,
  onClose,
  onNext,
  onPrevious,
}: LightboxModalProps) {
  const currentImage = images[currentIndex];
  const x = useMotionValue(0);
  const opacity = useTransform(x, [-200, 0, 200], [0.5, 1, 0.5]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      
      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowLeft':
          onPrevious();
          break;
        case 'ArrowRight':
          onNext();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, onNext, onPrevious]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const threshold = 50;
    const velocity = info.velocity.x;
    const offset = info.offset.x;

    // Swipe left (next image)
    if (offset < -threshold || velocity < -500) {
      if (currentIndex < images.length - 1) {
        onNext();
      }
    } 
    // Swipe right (previous image)
    else if (offset > threshold || velocity > 500) {
      if (currentIndex > 0) {
        onPrevious();
      }
    }
    
    // Reset position
    x.set(0);
  };

  if (!currentImage) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center"
          onClick={onClose}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 text-white hover:text-gray-300 transition-colors"
            aria-label="Close lightbox"
          >
            <FiX className="w-8 h-8" />
          </button>

          {/* Navigation Buttons */}
          {images.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onPrevious();
                }}
                className="absolute left-2 md:left-4 z-10 p-3 md:p-2 text-white hover:text-gray-300 transition-colors touch-manipulation"
                aria-label="Previous image"
                disabled={currentIndex === 0}
              >
                <FiChevronLeft className="w-10 h-10 md:w-8 md:h-8" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onNext();
                }}
                className="absolute right-2 md:right-4 z-10 p-3 md:p-2 text-white hover:text-gray-300 transition-colors touch-manipulation"
                aria-label="Next image"
                disabled={currentIndex === images.length - 1}
              >
                <FiChevronRight className="w-10 h-10 md:w-8 md:h-8" />
              </button>
            </>
          )}

          {/* Image Container */}
          <div
            className="relative w-full h-full flex flex-col items-center justify-center p-4 md:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              className="relative max-w-6xl max-h-[70vh] w-full"
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.2}
              onDragEnd={handleDragEnd}
              style={{ x, opacity }}
            >
              <Image
                src={currentImage.url}
                alt={currentImage.title}
                width={currentImage.width}
                height={currentImage.height}
                className="w-full h-full object-contain select-none"
                priority
                draggable={false}
              />
            </motion.div>

            {/* Image Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-6 max-w-2xl w-full text-white"
            >
              <h2 className="text-2xl font-bold mb-2">{currentImage.title}</h2>
              {currentImage.description && (
                <p className="text-gray-300 mb-4">{currentImage.description}</p>
              )}
              
              <div className="flex flex-wrap gap-4 text-sm text-gray-400">
                {currentImage.category && (
                  <span className="flex items-center gap-1">
                    <FiMapPin className="w-4 h-4" />
                    <span className="capitalize">{currentImage.category}</span>
                  </span>
                )}
                {currentImage.exif?.camera && (
                  <span className="flex items-center gap-1">
                    <FiCamera className="w-4 h-4" />
                    {currentImage.exif.camera}
                  </span>
                )}
                {currentImage.exif?.lens && (
                  <span>Lens: {currentImage.exif.lens}</span>
                )}
              </div>

              {/* Image Counter */}
              <div className="mt-4 text-center text-gray-400 text-sm">
                {currentIndex + 1} / {images.length}
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
