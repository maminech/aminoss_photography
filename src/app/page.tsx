'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { FiArrowRight, FiCamera, FiUser } from 'react-icons/fi';
import InstagramFeed from '@/components/InstagramFeed';
import LightboxModal from '@/components/LightboxModal';
import { MediaItem } from '@/types';
import { getSampleImages } from '@/lib/sample-data';

export default function HomePage() {
  const [images, setImages] = useState<MediaItem[]>([]);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadImages = async () => {
      const data = await getSampleImages('all');
      setImages(data); // Show all images in feed
      setLoading(false);
    };
    loadImages();
  }, []);

  const openLightbox = (index: number) => {
    setCurrentImageIndex(index);
    setLightboxOpen(true);
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const previousImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className="min-h-screen">
      {/* Compact Hero Section - Mobile First */}
      <section className="relative h-[40vh] md:h-[50vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=1920&q=80"
            alt="Hero"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black/50" />
        </div>
        
        <div className="relative z-10 text-center text-white px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <FiCamera className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-3 text-primary-400" />
            <h1 className="text-3xl md:text-5xl font-display font-bold mb-2">
              Aminoss Photography
            </h1>
            <p className="text-sm md:text-lg text-gray-200">
              Capturing moments that tell your story
            </p>
          </motion.div>
        </div>
      </section>

      {/* Instagram-Style Feed */}
      {loading ? (
        <div className="max-w-2xl mx-auto py-8 px-4">
          <div className="space-y-8">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white dark:bg-dark-800 border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden">
                <div className="flex items-center gap-3 p-4">
                  <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-dark-700 animate-pulse" />
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 dark:bg-dark-700 rounded w-1/3 mb-2 animate-pulse" />
                    <div className="h-3 bg-gray-200 dark:bg-dark-700 rounded w-1/4 animate-pulse" />
                  </div>
                </div>
                <div className="aspect-square bg-gray-200 dark:bg-dark-700 animate-pulse" />
                <div className="p-4 space-y-3">
                  <div className="h-6 bg-gray-200 dark:bg-dark-700 rounded w-1/4 animate-pulse" />
                  <div className="h-4 bg-gray-200 dark:bg-dark-700 rounded w-3/4 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <InstagramFeed images={images} onImageClick={openLightbox} />
      )}

      {/* Lightbox Modal */}
      <LightboxModal
        images={images}
        currentIndex={currentImageIndex}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        onNext={nextImage}
        onPrevious={previousImage}
      />
    </div>
  );
}
