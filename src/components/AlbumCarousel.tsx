'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { FiChevronLeft, FiChevronRight, FiLayers } from 'react-icons/fi';

interface Photo {
  id: string;
  url: string;
  thumbnailUrl?: string;
  width?: number;
  height?: number;
}

interface AlbumCarouselProps {
  photos: Photo[];
  coverImage?: string;
  photoCount: number;
  onOpen: () => void;
  className?: string;
}

export default function AlbumCarousel({
  photos,
  coverImage,
  photoCount,
  onOpen,
  className = '',
}: AlbumCarouselProps) {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentPhotoIndex < photos.length - 1) {
      setCurrentPhotoIndex(currentPhotoIndex + 1);
    }
  };

  const handlePrevious = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentPhotoIndex > 0) {
      setCurrentPhotoIndex(currentPhotoIndex - 1);
    }
  };

  const currentPhoto = photos[currentPhotoIndex] || photos[0];

  if (photos.length === 0) return null;

  return (
    <div
      onClick={onOpen}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      className={`group relative aspect-square overflow-hidden bg-gray-200 dark:bg-dark-700 cursor-pointer ${className}`}
    >
      {/* Album Badge */}
      <div className="absolute top-3 right-3 z-20 flex items-center gap-1.5 px-3 py-1.5 bg-black/70 backdrop-blur-sm rounded-full">
        <FiLayers className="w-4 h-4 text-white" />
        <span className="text-white text-xs font-medium">{photoCount}</span>
      </div>

      {/* Current Photo */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentPhotoIndex}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.3 }}
          className="absolute inset-0"
        >
          <Image
            src={currentPhoto.thumbnailUrl || currentPhoto.url}
            alt={`Photo ${currentPhotoIndex + 1}`}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-110"
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        </motion.div>
      </AnimatePresence>

      {/* Hover Overlay with Navigation */}
      <div
        className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ${
          isHovering ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {photos.length > 1 && (
          <div className="absolute inset-0 flex items-center justify-between px-2">
            {/* Previous Button */}
            <button
              onClick={handlePrevious}
              disabled={currentPhotoIndex === 0}
              className={`p-2 rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition-all ${
                currentPhotoIndex === 0 ? 'opacity-0 cursor-default' : 'opacity-100'
              }`}
              aria-label="Previous photo"
            >
              <FiChevronLeft className="w-5 h-5" />
            </button>

            {/* Next Button */}
            <button
              onClick={handleNext}
              disabled={currentPhotoIndex === photos.length - 1}
              className={`p-2 rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition-all ${
                currentPhotoIndex === photos.length - 1 ? 'opacity-0 cursor-default' : 'opacity-100'
              }`}
              aria-label="Next photo"
            >
              <FiChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Pagination Dots */}
        {photos.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
            {photos.map((_, idx) => (
              <div
                key={idx}
                className={`h-1.5 rounded-full transition-all ${
                  idx === currentPhotoIndex
                    ? 'w-6 bg-white'
                    : 'w-1.5 bg-white/50'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
