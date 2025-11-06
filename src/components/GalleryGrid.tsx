'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { MediaItem } from '@/types';

interface GalleryGridProps {
  images: MediaItem[];
  onImageClick: (index: number) => void;
}

export default function GalleryGrid({ images, onImageClick }: GalleryGridProps) {
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());

  const handleImageLoad = (id: string) => {
    setLoadedImages((prev) => new Set([...prev, id]));
  };

  // Calculate aspect ratio for each image
  const getImageAspectRatio = (image: MediaItem) => {
    if (image.width && image.height) {
      return image.width / image.height;
    }
    return 1; // default to square if dimensions not available
  };

  return (
    <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 md:gap-6 space-y-4 md:space-y-6">
      <AnimatePresence>
        {images.map((image, index) => {
          const aspectRatio = getImageAspectRatio(image);
          const isPortrait = aspectRatio < 1;
          const isLandscape = aspectRatio > 1.5;
          
          return (
            <motion.div
              key={image.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="group relative break-inside-avoid overflow-hidden rounded-lg bg-gray-100 dark:bg-dark-800 cursor-pointer mb-4 md:mb-6"
              onClick={() => onImageClick(index)}
            >
              <div className="relative w-full">
                <Image
                  src={image.url}
                  alt={image.title}
                  width={image.width || 800}
                  height={image.height || 800}
                  className={`w-full h-auto transition-all duration-500 group-hover:scale-105 ${
                    loadedImages.has(image.id) ? 'opacity-100' : 'opacity-0'
                  }`}
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  quality={95}
                  loading="lazy"
                  placeholder="blur"
                  blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgZmlsbD0iI2YzZjRmNiIvPjwvc3ZnPg=="
                  onLoad={() => handleImageLoad(image.id)}
                />
                
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h3 className="text-white font-semibold text-lg mb-1">
                      {image.title}
                    </h3>
                    {image.category && (
                      <p className="text-gray-300 text-sm capitalize">
                        {image.category}
                      </p>
                    )}
                  </div>
                </div>

                {/* Loading Skeleton */}
                {!loadedImages.has(image.id) && (
                  <div 
                    className="absolute inset-0 bg-gray-200 dark:bg-dark-700 animate-pulse" 
                    style={{ paddingBottom: `${(1/aspectRatio) * 100}%` }}
                  />
                )}
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
