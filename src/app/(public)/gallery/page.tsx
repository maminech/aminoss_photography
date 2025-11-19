'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { FiPlay } from 'react-icons/fi';
import { useLayoutTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import CategoryFilter from '@/components/CategoryFilter';
import GalleryGrid from '@/components/GalleryGrid';
import LightboxModal from '@/components/LightboxModal';
import AlbumCarousel from '@/components/AlbumCarousel';
import AlbumLightboxModal from '@/components/AlbumLightboxModal';
import NavigationButton from '@/components/NavigationButton';
import PublicPWAInstallPrompt from '@/components/PublicPWAInstallPrompt';
import { MediaItem, Category } from '@/types';
import { getSampleImages, filterImagesByCategory } from '@/lib/sample-data';

interface GalleryAlbum {
  type: 'album';
  id: string;
  title?: string;
  description?: string;
  category: string;
  coverImage?: string;
  photoCount: number;
  photos: Array<{
    id: string;
    url: string;
    thumbnailUrl?: string;
    width?: number;
    height?: number;
  }>;
  createdAt: string;
  featured?: boolean;
}

interface GalleryImage {
  type: 'image';
  id: string;
  publicId: string;
  url: string;
  thumbnailUrl?: string;
  title?: string;
  description?: string;
  category: string;
  tags?: string[];
  width?: number;
  height?: number;
  format?: string;
  createdAt: string;
}

interface GalleryVideo {
  type: 'video';
  id: string;
  cloudinaryId: string;
  url: string;
  thumbnailUrl: string;
  title?: string;
  description?: string;
  category: string;
  tags?: string[];
  width?: number;
  height?: number;
  duration?: number;
  format?: string;
  createdAt: string;
}

type GalleryItem = GalleryAlbum | GalleryImage | GalleryVideo;

export default function GalleryPage() {
  const { currentTheme } = useLayoutTheme();
  const { t } = useLanguage();
  const [allItems, setAllItems] = useState<GalleryItem[]>([]);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [albumLightboxOpen, setAlbumLightboxOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [currentAlbum, setCurrentAlbum] = useState<GalleryAlbum | null>(null);
  const [loading, setLoading] = useState(true);
  const isProfessional = currentTheme === 'professional';

  useEffect(() => {
    const loadGallery = async () => {
      try {
        // For professional mode, load only admin-uploaded content with professionalMode flag
        // For simple mode, this gallery page is not used (Instagram feed on homepage)
        
        if (isProfessional) {
          // Load ONLY photos for professional mode gallery (videos have separate page)
          const imagesRes = await fetch('/api/admin/images?professionalMode=true');
          
          const allGalleryItems: GalleryItem[] = [];
          
          if (imagesRes.ok) {
            const images = await imagesRes.json();
            const mappedImages: GalleryImage[] = images.map((img: any) => ({
              type: 'image',
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
            allGalleryItems.push(...mappedImages);
          }
          
          // Sort by date (most recent first)
          allGalleryItems.sort((a, b) => 
            new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
          );
          
          setAllItems(allGalleryItems);
        } else {
          // Simple mode - use public gallery API
          const res = await fetch('/api/public/gallery');
          if (res.ok) {
            const data: GalleryItem[] = await res.json();
            setAllItems(data);
          } else {
            // Fallback to old API
            const imgRes = await fetch('/api/admin/images');
            if (imgRes.ok) {
              const imgData = await imgRes.json();
              const galleryImages = imgData.filter((img: any) => img.showInGallery !== false);
              const mappedImages: GalleryImage[] = galleryImages.map((img: any) => ({
                type: 'image',
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
              setAllItems(mappedImages);
            }
          }
        }
      } catch (error) {
        console.error('Error loading gallery:', error);
      } finally {
        setLoading(false);
      }
    };
    loadGallery();
  }, [isProfessional]);

  const openLightbox = (index: number) => {
    setCurrentImageIndex(index);
    setLightboxOpen(true);
  };

  const openAlbumLightbox = (album: GalleryAlbum) => {
    setCurrentAlbum(album);
    setAlbumLightboxOpen(true);
  };

  const nextImage = () => {
    // Get only standalone images for lightbox navigation
    const standaloneImages = allItems.filter(item => item.type === 'image') as GalleryImage[];
    setCurrentImageIndex((prev) => (prev + 1) % standaloneImages.length);
  };

  const previousImage = () => {
    const standaloneImages = allItems.filter(item => item.type === 'image') as GalleryImage[];
    setCurrentImageIndex((prev) => (prev - 1 + standaloneImages.length) % standaloneImages.length);
  };

  // Convert all items to MediaItems for lightbox (only standalone images)
  const standaloneImages: MediaItem[] = allItems
    .filter(item => item.type === 'image')
    .map(item => item as GalleryImage)
    .map(img => ({
      id: img.id,
      publicId: img.publicId,
      url: img.url,
      thumbnailUrl: img.thumbnailUrl || img.url,
      title: img.title || 'Untitled',
      description: img.description || '',
      category: img.category as Category,
      width: img.width || 1920,
      height: img.height || 1080,
      format: img.format || 'jpg',
      createdAt: img.createdAt,
      tags: img.tags || [],
    }));

  // Professional/Novo Theme Layout
  if (isProfessional) {
    return (
      <div className="novo-gallery-page bg-white dark:bg-gray-900 min-h-screen">
        <div className="fixed top-6 left-6 z-[9999]">
          <NavigationButton variant="both" />
        </div>
        {/* Novo Header Section */}
        <section className="relative py-20 md:py-28 bg-gradient-to-b from-white via-gray-50/30 to-white dark:from-gray-900 dark:via-gray-800/20 dark:to-gray-900 overflow-hidden">
          {/* Floating Animated Background Elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                rotate: [0, 90, 0],
                opacity: [0.03, 0.08, 0.03],
              }}
              transition={{
                duration: 20,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute -top-1/4 -right-1/4 w-1/2 h-1/2 bg-gradient-to-br from-[#d4af37]/20 to-transparent rounded-full blur-3xl"
            />
            <motion.div
              animate={{
                scale: [1, 1.3, 1],
                rotate: [0, -90, 0],
                opacity: [0.03, 0.08, 0.03],
              }}
              transition={{
                duration: 25,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 5
              }}
              className="absolute -bottom-1/4 -left-1/4 w-1/2 h-1/2 bg-gradient-to-tr from-[#d4af37]/20 to-transparent rounded-full blur-3xl"
            />
          </div>

          <div className="container mx-auto px-6 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center"
            >
              {/* Elegant Title */}
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-5xl md:text-6xl lg:text-7xl font-playfair font-bold text-[#1a1a1a] dark:text-gray-100 mb-6"
              >
                {t('gallery.title')}
              </motion.h1>
              
              {/* Animated Golden Line */}
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: '80px', opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="h-[2px] bg-gradient-to-r from-transparent via-[#d4af37] to-transparent mx-auto mb-8"
              />

              {/* Elegant Subtitle */}
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 font-lato leading-relaxed max-w-3xl mx-auto mb-4"
              >
                {t('gallery.subtitle')}
              </motion.p>

              {/* Photo Count Badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.8 }}
                className="inline-flex items-center gap-2 px-6 py-2 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-[#d4af37]/20 rounded-full"
              >
                <div className="w-2 h-2 rounded-full bg-[#d4af37] animate-pulse" />
                <span className="text-sm font-lato text-gray-700 dark:text-gray-300">
                  {allItems.length} {allItems.length === 1 ? t('gallery.item') : t('gallery.items')}
                </span>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Gallery Content Section */}
        <section className="py-16 md:py-20 bg-white dark:bg-gray-900">
          <div className="container mx-auto px-6">

            {/* Enhanced Gallery Grid */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
                {[...Array(9)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3, delay: i * 0.05 }}
                    className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 animate-pulse rounded-lg"
                  />
                ))}
              </div>
            ) : allItems.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
                {allItems.map((item, index) => {
                  if (item.type === 'album') {
                    return (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ 
                          duration: 0.7, 
                          delay: index * 0.08,
                          ease: [0.25, 0.1, 0.25, 1]
                        }}
                        className="group"
                      >
                        <motion.div
                          whileHover={{ y: -8 }}
                          transition={{ duration: 0.4, ease: "easeOut" }}
                        >
                          <AlbumCarousel
                            photos={item.photos}
                            coverImage={item.coverImage}
                            photoCount={item.photoCount}
                            onOpen={() => openAlbumLightbox(item)}
                          />
                        </motion.div>
                      </motion.div>
                    );
                  } else if (item.type === 'video') {
                    return (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ 
                          duration: 0.7, 
                          delay: index * 0.08,
                          ease: [0.25, 0.1, 0.25, 1]
                        }}
                      >
                        <motion.div
                          whileHover={{ y: -8, scale: 1.02 }}
                          transition={{ duration: 0.4, ease: "easeOut" }}
                          className="group relative aspect-square overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 cursor-pointer rounded-lg shadow-lg hover:shadow-2xl"
                          onClick={() => window.open(item.url, '_blank')}
                        >
                          <Image
                            src={item.thumbnailUrl}
                            alt={item.title || 'Video'}
                            fill
                            className="object-cover transition-transform duration-700 group-hover:scale-110"
                          />
                          
                          {/* Video Play Icon */}
                          <div className="absolute inset-0 flex items-center justify-center z-10">
                            <motion.div
                              whileHover={{ scale: 1.2, rotate: 360 }}
                              transition={{ duration: 0.6 }}
                              className="w-20 h-20 rounded-full bg-white/95 backdrop-blur-sm flex items-center justify-center group-hover:bg-[#d4af37] transition-all duration-500 shadow-2xl"
                            >
                              <svg className="w-10 h-10 text-gray-900 group-hover:text-white ml-1 transition-colors duration-300" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                              </svg>
                            </motion.div>
                          </div>
                          
                          {/* Video Badge */}
                          <div className="absolute top-4 right-4 px-3 py-1.5 bg-black/80 backdrop-blur-sm text-white text-xs font-medium rounded-full border border-white/20">
                            {t('nav.videos').toUpperCase()}
                          </div>
                          
                          {/* Enhanced Hover Overlay */}
                          <motion.div 
                            initial={{ opacity: 0 }}
                            whileHover={{ opacity: 1 }}
                            transition={{ duration: 0.3 }}
                            className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"
                          />
                        </motion.div>
                      </motion.div>
                    );
                  } else {
                    const imageIndex = allItems
                      .slice(0, index)
                      .filter(i => i.type === 'image').length;
                    return (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ 
                          duration: 0.7, 
                          delay: index * 0.08,
                          ease: [0.25, 0.1, 0.25, 1]
                        }}
                      >
                        <motion.div
                          whileHover={{ y: -8, scale: 1.02 }}
                          transition={{ duration: 0.4, ease: "easeOut" }}
                          onClick={() => openLightbox(imageIndex)}
                          className="group relative aspect-square overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 cursor-pointer rounded-lg shadow-lg hover:shadow-2xl"
                        >
                          <Image
                            src={item.thumbnailUrl || item.url}
                            alt={item.title || `Photo ${imageIndex + 1}`}
                            fill
                            className="object-cover transition-transform duration-700 group-hover:scale-110"
                          />
                          
                          {/* Elegant Hover Overlay */}
                          <motion.div 
                            initial={{ opacity: 0 }}
                            whileHover={{ opacity: 1 }}
                            transition={{ duration: 0.3 }}
                            className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"
                          />

                          {/* Subtle Corner Accent */}
                          <motion.div
                            initial={{ opacity: 0, scale: 0 }}
                            whileHover={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.3 }}
                            className="absolute top-4 right-4 w-8 h-8"
                          >
                            <div className="w-full h-full border-t-2 border-r-2 border-[#d4af37] rounded-tr-lg" />
                          </motion.div>
                        </motion.div>
                      </motion.div>
                    );
                  }
                })}
              </div>
            ) : (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-20"
              >
                <p className="text-gray-500 dark:text-gray-400 font-lato text-lg">{t('gallery.noContent')}</p>
              </motion.div>
            )}
          </div>
        </section>

        {/* Lightbox for standalone images */}
        <LightboxModal
          images={standaloneImages}
          currentIndex={currentImageIndex}
          isOpen={lightboxOpen}
          onClose={() => setLightboxOpen(false)}
          onNext={nextImage}
          onPrevious={previousImage}
        />

        {/* Album Lightbox */}
        {currentAlbum && (
          <AlbumLightboxModal
            posts={currentAlbum.photos.map((photo, idx) => ({
              id: photo.id,
              publicId: photo.id,
              url: photo.url,
              thumbnailUrl: photo.thumbnailUrl || photo.url,
              title: currentAlbum.title || '',
              description: currentAlbum.description || '',
              category: currentAlbum.category as any,
              width: photo.width || 1920,
              height: photo.height || 1080,
              format: 'jpg',
              createdAt: currentAlbum.createdAt,
              albumImages: currentAlbum.photos.map(p => ({
                id: p.id,
                publicId: p.id,
                url: p.url,
                thumbnailUrl: p.thumbnailUrl || p.url,
                width: p.width,
                height: p.height,
              })) as any,
            }))}
            currentPostIndex={0}
            isOpen={albumLightboxOpen}
            onClose={() => setAlbumLightboxOpen(false)}
          />
        )}
      </div>
    );
  }

  // Simple Theme Layout (existing)
  return (
    <div className="min-h-screen py-16 sm:py-20 md:py-24 lg:py-28 px-3 sm:px-4 md:px-6 lg:px-8">
      <div className="fixed top-6 left-6 z-[9999]">
        <NavigationButton variant="both" />
      </div>
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
                ({filteredItems.length} {filteredItems.length === 1 ? 'item' : 'items'})
              </span>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {[...Array(9)].map((_, i) => (
                <div key={i} className="aspect-square bg-gray-200 dark:bg-dark-800 animate-pulse rounded-lg sm:rounded-xl" />
              ))}
            </div>
          ) : filteredItems.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {filteredItems.map((item, index) => {
                if (item.type === 'album') {
                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                    >
                      <AlbumCarousel
                        photos={item.photos}
                        coverImage={item.coverImage}
                        photoCount={item.photoCount}
                        onOpen={() => openAlbumLightbox(item)}
                        className="rounded-lg sm:rounded-xl"
                      />
                    </motion.div>
                  );
                } else {
                  const imageIndex = filteredItems
                    .slice(0, index)
                    .filter(i => i.type === 'image').length;
                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      onClick={() => openLightbox(imageIndex)}
                      className="group relative aspect-square overflow-hidden bg-gray-200 dark:bg-dark-700 cursor-pointer rounded-lg sm:rounded-xl"
                    >
                      <Image
                        src={item.thumbnailUrl || item.url}
                        alt={item.title || `Photo ${imageIndex + 1}`}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                      
                      {/* Hover Overlay */}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </motion.div>
                  );
                }
              })}
            </div>
          ) : (
            <div className="text-center py-12 sm:py-16">
              <p className="text-gray-500 dark:text-gray-400 text-base sm:text-lg">No content found in this category.</p>
            </div>
          )}
        </motion.div>
      </div>

      {/* Lightbox for standalone images */}
      <LightboxModal
        images={standaloneImages}
        currentIndex={currentImageIndex}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        onNext={nextImage}
        onPrevious={previousImage}
      />

      {/* Album Lightbox */}
      {currentAlbum && (
        <AlbumLightboxModal
          posts={currentAlbum.photos.map((photo, idx) => ({
            id: photo.id,
            publicId: photo.id,
            url: photo.url,
            thumbnailUrl: photo.thumbnailUrl || photo.url,
            title: currentAlbum.title || '',
            description: currentAlbum.description || '',
            category: currentAlbum.category as any,
            width: photo.width || 1920,
            height: photo.height || 1080,
            format: 'jpg',
            createdAt: currentAlbum.createdAt,
            albumImages: currentAlbum.photos.map(p => ({
              id: p.id,
              publicId: p.id,
              url: p.url,
              thumbnailUrl: p.thumbnailUrl || p.url,
              width: p.width,
              height: p.height,
            })) as any,
          }))}
          currentPostIndex={0}
          isOpen={albumLightboxOpen}
          onClose={() => setAlbumLightboxOpen(false)}
        />
      )}

      {/* PWA Install Prompt */}
      <PublicPWAInstallPrompt />
    </div>
  );
}
