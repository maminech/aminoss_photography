'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import CategoryFilter from '@/components/CategoryFilter';
import GalleryGrid from '@/components/GalleryGrid';
import LightboxModal from '@/components/LightboxModal';
import { MediaItem, Category } from '@/types';
import { getSampleImages, filterImagesByCategory } from '@/lib/sample-data';

export default function GalleryPage() {
  const [allImages, setAllImages] = useState<MediaItem[]>([]);
  const [filteredImages, setFilteredImages] = useState<MediaItem[]>([]);
  const [activeCategory, setActiveCategory] = useState<Category>('all');
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadImages = async () => {
      const data = await getSampleImages('all');
      setAllImages(data);
      setFilteredImages(data);
      setLoading(false);
    };
    loadImages();
  }, []);

  const handleCategoryChange = (category: Category) => {
    setActiveCategory(category);
    setFilteredImages(filterImagesByCategory(allImages, category));
  };

  const openLightbox = (index: number) => {
    setCurrentImageIndex(index);
    setLightboxOpen(true);
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % filteredImages.length);
  };

  const previousImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + filteredImages.length) % filteredImages.length);
  };

  return (
    <div className="min-h-screen py-16 md:py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold mb-4 text-gray-900 dark:text-gray-100">
              Gallery
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl mx-auto mb-8">
              Explore my photography collection across different categories
            </p>
            <CategoryFilter
              activeCategory={activeCategory}
              onCategoryChange={handleCategoryChange}
            />
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {[...Array(9)].map((_, i) => (
                <div key={i} className="aspect-square bg-gray-200 dark:bg-dark-800 animate-pulse rounded-lg" />
              ))}
            </div>
          ) : filteredImages.length > 0 ? (
            <GalleryGrid images={filteredImages} onImageClick={openLightbox} />
          ) : (
            <div className="text-center py-16">
              <p className="text-gray-500 dark:text-gray-400 text-lg">No images found in this category.</p>
            </div>
          )}
        </motion.div>
      </div>

      <LightboxModal
        images={filteredImages}
        currentIndex={currentImageIndex}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        onNext={nextImage}
        onPrevious={previousImage}
      />
    </div>
  );
}
