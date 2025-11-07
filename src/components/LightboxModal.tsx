'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { FiX, FiChevronLeft, FiChevronRight, FiDownload, FiHeart, FiShare2, FiInfo, FiZoomIn, FiZoomOut } from 'react-icons/fi';
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
  const [zoom, setZoom] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const currentImage = images[currentIndex];
  const x = useMotionValue(0);
  const opacity = useTransform(x, [-200, 0, 200], [0.5, 1, 0.5]);

  useEffect(() => {
    setImageLoaded(false);
    setZoom(1); // Reset zoom when changing images
  }, [currentIndex]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      
      switch (e.key) {
        case 'Escape':
          if (zoom > 1) {
            setZoom(1);
          } else {
            onClose();
          }
          break;
        case 'ArrowLeft':
          if (currentIndex > 0 && zoom === 1) onPrevious();
          break;
        case 'ArrowRight':
          if (currentIndex < images.length - 1 && zoom === 1) onNext();
          break;
        case 'i':
        case 'I':
          setShowInfo(!showInfo);
          break;
        case '+':
        case '=':
          setZoom(Math.min(zoom + 0.5, 3));
          break;
        case '-':
        case '_':
          setZoom(Math.max(zoom - 0.5, 1));
          break;
        case '0':
          setZoom(1);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentIndex, images.length, showInfo, zoom, onClose, onNext, onPrevious]);

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
    setIsDragging(false);
    const threshold = 100;
    const velocity = info.velocity.x;
    const velocityY = info.velocity.y;
    const offset = info.offset.x;
    const offsetY = info.offset.y;

    // Only allow swipe down to close if swiping down significantly
    if (Math.abs(offsetY) > Math.abs(offset) && (offsetY > 150 || velocityY > 800)) {
      onClose();
      return;
    }

    // Swipe left (next image) - only if horizontal swipe
    if (Math.abs(offset) > Math.abs(offsetY) && (offset < -threshold || velocity < -500)) {
      if (currentIndex < images.length - 1) {
        onNext();
      }
    } 
    // Swipe right (previous image) - only if horizontal swipe
    else if (Math.abs(offset) > Math.abs(offsetY) && (offset > threshold || velocity > 500)) {
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
            <div className="flex items-center justify-between p-3 sm:p-4">
              {/* Left: Counter */}
              <div className="flex items-center space-x-3">
                <span className="text-white text-sm sm:text-base font-medium">
                  {currentIndex + 1} / {images.length}
                </span>
              </div>

              {/* Right: Actions */}
              <div className="flex items-center space-x-1.5 sm:space-x-2">
                {/* Zoom Controls */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setZoom(Math.max(zoom - 0.5, 1));
                  }}
                  disabled={zoom <= 1}
                  className="p-2.5 sm:p-3 min-w-[44px] min-h-[44px] rounded-full bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 transition-all active:scale-95 disabled:opacity-30"
                  aria-label="Zoom out"
                >
                  <FiZoomOut className="w-5 h-5" />
                </button>
                <span className="text-white text-xs sm:text-sm font-medium min-w-[35px] sm:min-w-[45px] text-center hidden xs:block">
                  {Math.round(zoom * 100)}%
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setZoom(Math.min(zoom + 0.5, 3));
                  }}
                  disabled={zoom >= 3}
                  className="p-2.5 sm:p-3 min-w-[44px] min-h-[44px] rounded-full bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 transition-all active:scale-95 disabled:opacity-30"
                  aria-label="Zoom in"
                >
                  <FiZoomIn className="w-5 h-5" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowInfo(!showInfo);
                  }}
                  className="p-2.5 sm:p-3 min-w-[44px] min-h-[44px] rounded-full bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 transition-all active:scale-95"
                  aria-label="Toggle info"
                >
                  <FiInfo className="w-5 h-5" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    // Share functionality
                  }}
                  className="p-2.5 sm:p-3 min-w-[44px] min-h-[44px] rounded-full bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 transition-all active:scale-95 hidden md:flex"
                  aria-label="Share"
                >
                  <FiShare2 className="w-5 h-5" />
                </button>
                <button
                  onClick={onClose}
                  className="p-2.5 sm:p-3 min-w-[44px] min-h-[44px] rounded-full bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 transition-all active:scale-95"
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
                  className={`absolute left-2 sm:left-4 md:left-6 z-20 p-3 sm:p-4 min-w-[44px] min-h-[44px] rounded-full bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 transition-all active:scale-95 ${
                    currentIndex === 0 ? 'opacity-30 cursor-not-allowed' : ''
                  }`}
                  aria-label="Previous"
                >
                  <FiChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (currentIndex < images.length - 1) onNext();
                  }}
                  disabled={currentIndex === images.length - 1}
                  className={`absolute right-2 sm:right-4 md:right-6 z-20 p-3 sm:p-4 min-w-[44px] min-h-[44px] rounded-full bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 transition-all active:scale-95 ${
                    currentIndex === images.length - 1 ? 'opacity-30 cursor-not-allowed' : ''
                  }`}
                  aria-label="Next"
                >
                  <FiChevronRight className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8" />
                </button>
              </>
            )}

            {/* Image with Swipe Support */}
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="relative w-full h-full flex items-center justify-center px-3 xs:px-4 sm:px-12 md:px-20 py-16 sm:py-20 md:py-24"
              drag={zoom === 1}
              dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
              dragElastic={0.2}
              dragDirectionLock={false}
              onDragEnd={handleDragEnd}
              onDragStart={() => setIsDragging(true)}
              style={{ 
                x: zoom === 1 ? x : 0, 
                opacity: zoom === 1 ? opacity : 1,
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
              <motion.div 
                className="relative max-w-7xl max-h-full w-full h-full"
                animate={{ scale: zoom }}
                transition={{ duration: 0.2 }}
                style={{ cursor: zoom > 1 ? 'grab' : 'default' }}
                onDoubleClick={(e) => {
                  e.stopPropagation();
                  setZoom(zoom === 1 ? 2 : 1);
                }}
              >
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
              </motion.div>
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
                  className="md:hidden absolute bottom-0 left-0 right-0 z-30 bg-black/95 backdrop-blur-xl border-t border-white/10 rounded-t-3xl max-h-[70vh] overflow-y-auto"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="p-5 sm:p-6">
                    {/* Drag Handle */}
                    <div className="w-12 h-1.5 bg-white/30 rounded-full mx-auto mb-5 sm:mb-6"></div>
                    
                    <h2 className="text-lg sm:text-xl font-bold text-white mb-2 break-words">
                      {currentImage.title || 'Untitled'}
                    </h2>
                    
                    {currentImage.description && (
                      <p className="text-gray-300 text-sm leading-relaxed mb-4 break-words">
                        {currentImage.description}
                      </p>
                    )}
                    
                    {currentImage.category && (
                      <div className="flex items-center gap-2 mb-4 flex-wrap">
                        <span className="px-3 py-1.5 bg-white/10 text-white text-xs font-medium rounded-full capitalize">
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
                            className="px-2 py-1 bg-white/5 text-gray-400 text-xs rounded break-all"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="grid grid-cols-2 gap-3 pt-4 border-t border-white/10">
                      <button className="flex items-center justify-center gap-2 py-3 min-h-[48px] bg-white/10 hover:bg-white/20 text-white rounded-xl transition active:scale-95">
                        <FiHeart className="w-5 h-5" />
                        <span className="font-medium">Like</span>
                      </button>
                      <button className="flex items-center justify-center gap-2 py-3 min-h-[48px] bg-white/10 hover:bg-white/20 text-white rounded-xl transition active:scale-95">
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
                      <button className="w-full flex items-center justify-center gap-2 py-3 min-h-[48px] bg-white text-black hover:bg-gray-200 rounded-xl transition active:scale-95 font-medium">
                        <FiDownload className="w-5 h-5" />
                        <span>Download Image</span>
                      </button>
                      <button className="w-full flex items-center justify-center gap-2 py-3 min-h-[48px] bg-white/10 hover:bg-white/20 text-white rounded-xl transition active:scale-95 font-medium">
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
