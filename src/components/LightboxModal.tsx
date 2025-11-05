'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { FiX, FiChevronLeft, FiChevronRight, FiDownload, FiHeart, FiShare2, FiInfo } from 'react-icons/fi';
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
  const [showInfo, setShowInfo] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const currentImage = images[currentIndex];
  const x = useMotionValue(0);
  const opacity = useTransform(x, [-200, 0, 200], [0.5, 1, 0.5]);

  useEffect(() => {
    setImageLoaded(false);
  }, [currentIndex]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      
      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowLeft':
          if (currentIndex > 0) onPrevious();
          break;
        case 'ArrowRight':
          if (currentIndex < images.length - 1) onNext();
          break;
        case 'i':
        case 'I':
          setShowInfo(!showInfo);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentIndex, images.length, showInfo, onClose, onNext, onPrevious]);

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
    const threshold = 100;
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
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[100] bg-black"
          onClick={onClose}
        >
          {/* Top Bar - Mobile & Desktop */}
          <div className="absolute top-0 left-0 right-0 z-20 bg-gradient-to-b from-black/80 via-black/40 to-transparent">
            <div className="flex items-center justify-between p-3 md:p-4">
              {/* Left: Counter */}
              <div className="flex items-center space-x-3">
                <span className="text-white text-sm md:text-base font-medium">
                  {currentIndex + 1} / {images.length}
                </span>
              </div>

              {/* Right: Actions */}
              <div className="flex items-center space-x-2 md:space-x-3">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowInfo(!showInfo);
                  }}
                  className="p-2 md:p-2.5 rounded-full bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 transition-all touch-manipulation"
                  aria-label="Toggle info"
                >
                  <FiInfo className="w-5 h-5" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    // Share functionality
                  }}
                  className="p-2 md:p-2.5 rounded-full bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 transition-all touch-manipulation hidden md:flex"
                  aria-label="Share"
                >
                  <FiShare2 className="w-5 h-5" />
                </button>
                <button
                  onClick={onClose}
                  className="p-2 md:p-2.5 rounded-full bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 transition-all touch-manipulation"
                  aria-label="Close"
                >
                  <FiX className="w-6 h-6" />
                </button>
              </div>
            </div>
          </div>

          {/* Main Image Container */}
          <div
            className="absolute inset-0 flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Navigation Buttons - Desktop */}
            {images.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (currentIndex > 0) onPrevious();
                  }}
                  disabled={currentIndex === 0}
                  className={`absolute left-2 md:left-6 z-20 p-3 md:p-4 rounded-full bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 transition-all touch-manipulation ${
                    currentIndex === 0 ? 'opacity-30 cursor-not-allowed' : ''
                  }`}
                  aria-label="Previous"
                >
                  <FiChevronLeft className="w-6 h-6 md:w-8 md:h-8" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (currentIndex < images.length - 1) onNext();
                  }}
                  disabled={currentIndex === images.length - 1}
                  className={`absolute right-2 md:right-6 z-20 p-3 md:p-4 rounded-full bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 transition-all touch-manipulation ${
                    currentIndex === images.length - 1 ? 'opacity-30 cursor-not-allowed' : ''
                  }`}
                  aria-label="Next"
                >
                  <FiChevronRight className="w-6 h-6 md:w-8 md:h-8" />
                </button>
              </>
            )}

            {/* Image with Swipe Support */}
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="relative w-full h-full flex items-center justify-center px-4 md:px-20 py-20 md:py-24"
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.3}
              onDragEnd={handleDragEnd}
              style={{ x, opacity }}
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
                  quality={95}
                />
              </div>
            </motion.div>
          </div>

          {/* Bottom Info Panel - Slides up on mobile, sidebar on desktop */}
          <AnimatePresence>
            {showInfo && (
              <>
                {/* Mobile: Bottom Sheet */}
                <motion.div
                  initial={{ y: '100%' }}
                  animate={{ y: 0 }}
                  exit={{ y: '100%' }}
                  transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                  className="md:hidden absolute bottom-0 left-0 right-0 z-30 bg-black/95 backdrop-blur-xl border-t border-white/10 rounded-t-3xl"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="p-6 max-h-[60vh] overflow-y-auto">
                    {/* Drag Handle */}
                    <div className="w-12 h-1.5 bg-white/30 rounded-full mx-auto mb-6"></div>
                    
                    <h2 className="text-xl font-bold text-white mb-2">
                      {currentImage.title || 'Untitled'}
                    </h2>
                    
                    {currentImage.description && (
                      <p className="text-gray-300 text-sm leading-relaxed mb-4">
                        {currentImage.description}
                      </p>
                    )}
                    
                    {currentImage.category && (
                      <div className="flex items-center gap-2 mb-4">
                        <span className="px-3 py-1 bg-white/10 text-white text-xs font-medium rounded-full capitalize">
                          {currentImage.category}
                        </span>
                      </div>
                    )}

                    {/* Tags */}
                    {currentImage.tags && currentImage.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {currentImage.tags.map((tag, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-white/5 text-gray-400 text-xs rounded"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3 pt-4 border-t border-white/10">
                      <button className="flex-1 flex items-center justify-center gap-2 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition touch-manipulation">
                        <FiHeart className="w-5 h-5" />
                        <span className="font-medium">Like</span>
                      </button>
                      <button className="flex-1 flex items-center justify-center gap-2 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition touch-manipulation">
                        <FiDownload className="w-5 h-5" />
                        <span className="font-medium">Save</span>
                      </button>
                    </div>
                  </div>
                </motion.div>

                {/* Desktop: Right Sidebar */}
                <motion.div
                  initial={{ x: '100%' }}
                  animate={{ x: 0 }}
                  exit={{ x: '100%' }}
                  transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                  className="hidden md:block absolute top-0 right-0 bottom-0 w-96 z-30 bg-black/95 backdrop-blur-xl border-l border-white/10"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="h-full flex flex-col">
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-white/10">
                      <h3 className="text-lg font-semibold text-white">Details</h3>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowInfo(false);
                        }}
                        className="p-2 hover:bg-white/10 rounded-lg transition text-white"
                      >
                        <FiX className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-6">
                      <div>
                        <h2 className="text-2xl font-bold text-white mb-2">
                          {currentImage.title || 'Untitled'}
                        </h2>
                        
                        {currentImage.description && (
                          <p className="text-gray-300 leading-relaxed">
                            {currentImage.description}
                          </p>
                        )}
                      </div>

                      {currentImage.category && (
                        <div>
                          <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                            Category
                          </h4>
                          <span className="inline-block px-3 py-1.5 bg-white/10 text-white text-sm font-medium rounded-lg capitalize">
                            {currentImage.category}
                          </span>
                        </div>
                      )}

                      {currentImage.tags && currentImage.tags.length > 0 && (
                        <div>
                          <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                            Tags
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {currentImage.tags.map((tag, idx) => (
                              <span
                                key={idx}
                                className="px-3 py-1 bg-white/5 text-gray-300 text-sm rounded-lg"
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {currentImage.exif && (
                        <div>
                          <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                            Camera Info
                          </h4>
                          <div className="space-y-2 text-sm">
                            {currentImage.exif.camera && (
                              <div className="flex justify-between text-gray-300">
                                <span>Camera</span>
                                <span className="font-medium">{currentImage.exif.camera}</span>
                              </div>
                            )}
                            {currentImage.exif.lens && (
                              <div className="flex justify-between text-gray-300">
                                <span>Lens</span>
                                <span className="font-medium">{currentImage.exif.lens}</span>
                              </div>
                            )}
                            {currentImage.exif.focalLength && (
                              <div className="flex justify-between text-gray-300">
                                <span>Focal Length</span>
                                <span className="font-medium">{currentImage.exif.focalLength}mm</span>
                              </div>
                            )}
                            {currentImage.exif.aperture && (
                              <div className="flex justify-between text-gray-300">
                                <span>Aperture</span>
                                <span className="font-medium">f/{currentImage.exif.aperture}</span>
                              </div>
                            )}
                            {currentImage.exif.shutterSpeed && (
                              <div className="flex justify-between text-gray-300">
                                <span>Shutter Speed</span>
                                <span className="font-medium">{currentImage.exif.shutterSpeed}s</span>
                              </div>
                            )}
                            {currentImage.exif.iso && (
                              <div className="flex justify-between text-gray-300">
                                <span>ISO</span>
                                <span className="font-medium">{currentImage.exif.iso}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Dimensions */}
                      <div>
                        <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                          Image Info
                        </h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between text-gray-300">
                            <span>Dimensions</span>
                            <span className="font-medium">
                              {currentImage.width} × {currentImage.height}
                            </span>
                          </div>
                          {currentImage.format && (
                            <div className="flex justify-between text-gray-300">
                              <span>Format</span>
                              <span className="font-medium uppercase">{currentImage.format}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="p-6 border-t border-white/10 space-y-3">
                      <button className="w-full flex items-center justify-center gap-2 py-3 bg-white text-black hover:bg-gray-200 rounded-xl transition font-medium">
                        <FiDownload className="w-5 h-5" />
                        <span>Download Image</span>
                      </button>
                      <button className="w-full flex items-center justify-center gap-2 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition font-medium">
                        <FiShare2 className="w-5 h-5" />
                        <span>Share</span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>

          {/* Mobile Swipe Indicator */}
          {images.length > 1 && (
            <div className="md:hidden absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1.5">
              {images.map((_, idx) => (
                <div
                  key={idx}
                  className={`h-1.5 rounded-full transition-all ${
                    idx === currentIndex
                      ? 'w-6 bg-white'
                      : 'w-1.5 bg-white/40'
                  }`}
                />
              ))}
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
