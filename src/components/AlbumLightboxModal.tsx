'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { FiX, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { MediaItem } from '@/types';

interface AlbumLightboxModalProps {
  posts: MediaItem[];
  currentPostIndex: number;
  isOpen: boolean;
  onClose: () => void;
}

export default function AlbumLightboxModal({
  posts,
  currentPostIndex,
  isOpen,
  onClose,
}: AlbumLightboxModalProps) {
  const [postIndex, setPostIndex] = useState(currentPostIndex);
  const [imageIndexInPost, setImageIndexInPost] = useState(0);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const x = useMotionValue(0);
  const opacity = useTransform(x, [-200, 0, 200], [0.5, 1, 0.5]);

  const currentPost = posts[postIndex];
  const currentPostImages = currentPost?.albumImages || [currentPost];
  const currentImage = currentPostImages[imageIndexInPost];
  const isAlbum = currentPost?.albumImages && currentPost.albumImages.length > 1;

  // Reset closing state when modal opens
  useEffect(() => {
    if (isOpen) {
      setIsClosing(false);
    }
  }, [isOpen]);

  useEffect(() => {
    setPostIndex(currentPostIndex);
    setImageIndexInPost(0);
  }, [currentPostIndex]);

  useEffect(() => {
    setImageLoaded(false);
  }, [postIndex, imageIndexInPost]);

  useEffect(() => {
    if (!isOpen) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowLeft':
          handlePrevious();
          break;
        case 'ArrowRight':
          handleNext();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, postIndex, imageIndexInPost, currentPostImages.length, posts.length, onClose]);

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

  const handleNext = () => {
    // If in an album, navigate within album first
    if (isAlbum && imageIndexInPost < currentPostImages.length - 1) {
      setImageIndexInPost(imageIndexInPost + 1);
    }
    // Otherwise, go to next post
    else if (postIndex < posts.length - 1) {
      setPostIndex(postIndex + 1);
      setImageIndexInPost(0);
    }
  };

  const handlePrevious = () => {
    // If in an album and not at first image, go to previous image in album
    if (isAlbum && imageIndexInPost > 0) {
      setImageIndexInPost(imageIndexInPost - 1);
    }
    // Otherwise, go to previous post
    else if (postIndex > 0) {
      setPostIndex(postIndex - 1);
      const prevPost = posts[postIndex - 1];
      const prevPostImages = prevPost?.albumImages || [prevPost];
      setImageIndexInPost(prevPostImages.length - 1); // Start at last image of previous post
    }
  };

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (!isOpen || isClosing) return; // Prevent actions if already closing
    
    const threshold = 100;
    const velocity = info.velocity.x;
    const velocityY = info.velocity.y;
    const offset = info.offset.x;
    const offsetY = info.offset.y;

    // Swipe down to close
    if (Math.abs(offsetY) > Math.abs(offset) && (offsetY > 150 || velocityY > 800)) {
      x.set(0);
      setIsClosing(true);
      onClose();
      return;
    }

    // Swipe left (next)
    if (Math.abs(offset) > Math.abs(offsetY) && (offset < -threshold || velocity < -500)) {
      handleNext();
    } 
    // Swipe right (previous)
    else if (Math.abs(offset) > Math.abs(offsetY) && (offset > threshold || velocity > 500)) {
      handlePrevious();
    }
    
    // Reset position
    x.set(0);
  };

  if (!currentImage) return null;

  const canGoNext = isAlbum && imageIndexInPost < currentPostImages.length - 1 || postIndex < posts.length - 1;
  const canGoPrevious = isAlbum && imageIndexInPost > 0 || postIndex > 0;

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[100] bg-black"
          onClick={(e) => {
            e.stopPropagation();
            if (!isClosing) {
              setIsClosing(true);
              onClose();
            }
          }}
        >
          {/* Top Bar */}
          <div className="absolute top-0 left-0 right-0 z-20 bg-gradient-to-b from-black/80 via-black/40 to-transparent">
            <div className="flex items-center justify-between p-3 sm:p-4">
              {/* Left: Post counter and album indicator */}
              <div className="flex items-center space-x-3">
                <span className="text-white text-sm sm:text-base font-medium">
                  Post {postIndex + 1} / {posts.length}
                </span>
                {isAlbum && (
                  <span className="text-white/70 text-sm sm:text-base">
                    • {imageIndexInPost + 1}/{currentPostImages.length}
                  </span>
                )}
              </div>

              {/* Right: Close button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (!isClosing) {
                    setIsClosing(true);
                    onClose();
                  }
                }}
                disabled={isClosing}
                className="p-2.5 sm:p-3 min-w-[44px] min-h-[44px] rounded-full bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 transition-all active:scale-95 disabled:opacity-50"
                aria-label="Close"
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Main Image Container */}
          <div
            className="absolute inset-0 flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Navigation Buttons */}
            {canGoPrevious && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handlePrevious();
                }}
                className="absolute left-2 sm:left-4 md:left-6 z-20 p-3 sm:p-4 min-w-[44px] min-h-[44px] rounded-full bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 transition-all active:scale-95"
                aria-label="Previous"
              >
                <FiChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8" />
              </button>
            )}
            {canGoNext && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleNext();
                }}
                className="absolute right-2 sm:right-4 md:right-6 z-20 p-3 sm:p-4 min-w-[44px] min-h-[44px] rounded-full bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 transition-all active:scale-95"
                aria-label="Next"
              >
                <FiChevronRight className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8" />
              </button>
            )}

            {/* Image with Swipe Support */}
            <motion.div
              key={`${postIndex}-${imageIndexInPost}`}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="relative w-full h-full flex items-center justify-center px-3 xs:px-4 sm:px-12 md:px-20 py-16 sm:py-20 md:py-24"
              drag
              dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
              dragElastic={0.2}
              dragDirectionLock={false}
              onDragEnd={handleDragEnd}
              style={{ 
                x, 
                opacity,
                touchAction: 'none'
              }}
            >
              {/* Loading Spinner */}
              {!imageLoaded && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
                </div>
              )}

              {/* Image */}
              <div className="relative max-w-7xl max-h-full w-full h-full">
                <Image
                  src={currentImage.url}
                  alt={currentImage.title || 'Image'}
                  fill
                  className="object-contain select-none"
                  priority
                  draggable={false}
                  onLoadingComplete={() => setImageLoaded(true)}
                  sizes="100vw"
                  quality={100}
                />
              </div>
            </motion.div>
          </div>

          {/* Album Indicator Dots - Instagram Style */}
          {isAlbum && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1.5">
              {currentPostImages.map((_, idx) => (
                <button
                  key={idx}
                  onClick={(e) => {
                    e.stopPropagation();
                    setImageIndexInPost(idx);
                  }}
                  className={`transition-all ${
                    idx === imageIndexInPost
                      ? 'w-6 h-1.5 bg-white'
                      : 'w-1.5 h-1.5 bg-white/40 hover:bg-white/60'
                  } rounded-full`}
                  aria-label={`Go to image ${idx + 1}`}
                />
              ))}
            </div>
          )}

          {/* Post title */}
          {currentPost.title && (
            <div className="absolute bottom-20 left-0 right-0 z-10 px-4 text-center">
              <p className="text-white text-sm sm:text-base font-medium drop-shadow-lg">
                {currentPost.title}
              </p>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
