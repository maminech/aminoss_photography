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

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
      <AnimatePresence>
        {images.map((image, index) => (
          <motion.div
            key={image.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className="group relative aspect-square overflow-hidden rounded-lg bg-gray-100 cursor-pointer"
            onClick={() => onImageClick(index)}
          >
            <Image
              src={image.thumbnailUrl}
              alt={image.title}
              fill
              className={`object-cover transition-all duration-500 group-hover:scale-110 ${
                loadedImages.has(image.id) ? 'opacity-100' : 'opacity-0'
              }`}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              onLoad={() => handleImageLoad(image.id)}
            />
            
            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
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
              <div className="absolute inset-0 bg-gray-200 animate-pulse" />
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
