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
  const [sortBy, setSortBy] = useState<'date' | 'title'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadImages = async () => {
      try {
        // Load real images from database that are visible in gallery
        const res = await fetch('/api/admin/images');
        if (res.ok) {
          const data = await res.json();
          // Filter images that should be shown in gallery
          const galleryImages = data.filter((img: any) => img.showInGallery !== false);
          // Map to MediaItem format
          const mappedImages = galleryImages.map((img: any) => ({
            id: img.id,
            publicId: img.cloudinaryId,
            url: img.url,
            thumbnailUrl: img.thumbnailUrl,
            title: img.title || 'Untitled',
            description: img.description || '',
            category: img.category,
            width: img.width,
            height: img.height,
            format: img.format,
            createdAt: img.createdAt,
            tags: img.tags || [],
          }));
          setAllImages(mappedImages);
          setFilteredImages(mappedImages);
        } else {
          // Fallback to sample data
          const data = await getSampleImages('all');
          setAllImages(data);
          setFilteredImages(data);
        }
      } catch (error) {
        console.error('Error loading images:', error);
        // Fallback to sample data on error
        const data = await getSampleImages('all');
        setAllImages(data);
        setFilteredImages(data);
      } finally {
        setLoading(false);
      }
    };
    loadImages();
  }, []);

  const handleCategoryChange = (category: Category) => {
    setActiveCategory(category);
    const filtered = filterImagesByCategory(allImages, category);
    setFilteredImages(sortImages(filtered));
  };

  const sortImages = (images: MediaItem[]) => {
    const sorted = [...images].sort((a, b) => {
      if (sortBy === 'date') {
        const dateA = new Date(a.createdAt || 0).getTime();
        const dateB = new Date(b.createdAt || 0).getTime();
        return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
      } else {
        const titleA = a.title.toLowerCase();
        const titleB = b.title.toLowerCase();
        return sortOrder === 'asc' 
          ? titleA.localeCompare(titleB)
          : titleB.localeCompare(titleA);
      }
    });
    return sorted;
  };

  const handleSortChange = (newSortBy: 'date' | 'title') => {
    if (sortBy === newSortBy) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(newSortBy);
      setSortOrder('desc');
    }
    setFilteredImages(sortImages(filteredImages));
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
    <div className="min-h-screen py-16 sm:py-20 md:py-24 lg:py-28 px-3 sm:px-4 md:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-center mb-6 sm:mb-8 md:mb-12">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-display font-bold mb-2 sm:mb-3 md:mb-4 text-gray-900 dark:text-gray-100">
              Gallery
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base md:text-lg max-w-2xl mx-auto mb-4 sm:mb-6 md:mb-8 px-4">
              Explore my photography collection across different categories
            </p>
            <CategoryFilter
              activeCategory={activeCategory}
              onCategoryChange={handleCategoryChange}
            />
            
            {/* Sorting Controls */}
            <div className="flex flex-col xs:flex-row flex-wrap items-center justify-center gap-2 sm:gap-3 mt-4 sm:mt-6 px-4">
              <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 w-full xs:w-auto text-center xs:text-left">Sort by:</span>
              <div className="flex gap-2 w-full xs:w-auto justify-center">
                <button
                  onClick={() => handleSortChange('date')}
                  className={`flex-1 xs:flex-initial px-4 sm:px-5 py-2.5 sm:py-3 min-h-[44px] rounded-lg text-sm font-medium transition-all ${
                    sortBy === 'date'
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 dark:bg-dark-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-dark-700'
                  }`}
                >
                  Date {sortBy === 'date' && (sortOrder === 'desc' ? '↓' : '↑')}
                </button>
                <button
                  onClick={() => handleSortChange('title')}
                  className={`flex-1 xs:flex-initial px-4 sm:px-5 py-2.5 sm:py-3 min-h-[44px] rounded-lg text-sm font-medium transition-all ${
                    sortBy === 'title'
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 dark:bg-dark-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-dark-700'
                  }`}
                >
                  Title {sortBy === 'title' && (sortOrder === 'desc' ? '↓' : '↑')}
                </button>
              </div>
              <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-500 w-full xs:w-auto text-center xs:text-left">
                ({filteredImages.length} {filteredImages.length === 1 ? 'photo' : 'photos'})
              </span>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {[...Array(9)].map((_, i) => (
                <div key={i} className="aspect-square bg-gray-200 dark:bg-dark-800 animate-pulse rounded-lg sm:rounded-xl" />
              ))}
            </div>
          ) : filteredImages.length > 0 ? (
            <GalleryGrid images={filteredImages} onImageClick={openLightbox} />
          ) : (
            <div className="text-center py-12 sm:py-16">
              <p className="text-gray-500 dark:text-gray-400 text-base sm:text-lg">No images found in this category.</p>
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
