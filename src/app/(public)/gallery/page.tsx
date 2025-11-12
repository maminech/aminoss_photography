'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { useLayoutTheme } from '@/contexts/ThemeContext';
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

type GalleryItem = GalleryAlbum | GalleryImage;

export default function GalleryPage() {
  const { currentTheme } = useLayoutTheme();
  const [allItems, setAllItems] = useState<GalleryItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<GalleryItem[]>([]);
  const [activeCategory, setActiveCategory] = useState<Category>('all');
  const [sortBy, setSortBy] = useState<'date' | 'title'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [albumLightboxOpen, setAlbumLightboxOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [currentAlbum, setCurrentAlbum] = useState<GalleryAlbum | null>(null);
  const [loading, setLoading] = useState(true);
  const isProfessional = currentTheme === 'professional';

  useEffect(() => {
    const loadGallery = async () => {
      try {
        // Load gallery items (albums + standalone images) from new unified API
        const res = await fetch('/api/public/gallery');
        if (res.ok) {
          const data: GalleryItem[] = await res.json();
          setAllItems(data);
          setFilteredItems(data);
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
            setFilteredItems(mappedImages);
          }
        }
      } catch (error) {
        console.error('Error loading gallery:', error);
      } finally {
        setLoading(false);
      }
    };
    loadGallery();
  }, []);

  const handleCategoryChange = (category: Category) => {
    setActiveCategory(category);
    const filtered = category === 'all' 
      ? allItems 
      : allItems.filter(item => item.category === category);
    setFilteredItems(sortItems(filtered));
  };

  const sortItems = (items: GalleryItem[]) => {
    const sorted = [...items].sort((a, b) => {
      if (sortBy === 'date') {
        const dateA = new Date(a.createdAt || 0).getTime();
        const dateB = new Date(b.createdAt || 0).getTime();
        return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
      } else {
        const titleA = (a.type === 'album' ? a.title : a.title)?.toLowerCase() || '';
        const titleB = (b.type === 'album' ? b.title : b.title)?.toLowerCase() || '';
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
    setFilteredItems(sortItems(filteredItems));
  };

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
    const standaloneImages = filteredItems.filter(item => item.type === 'image') as GalleryImage[];
    setCurrentImageIndex((prev) => (prev + 1) % standaloneImages.length);
  };

  const previousImage = () => {
    const standaloneImages = filteredItems.filter(item => item.type === 'image') as GalleryImage[];
    setCurrentImageIndex((prev) => (prev - 1 + standaloneImages.length) % standaloneImages.length);
  };

  // Convert filtered items to MediaItems for lightbox (only standalone images)
  const standaloneImages: MediaItem[] = filteredItems
    .filter(item => item.type === 'image')
    .map(item => item as GalleryImage)
    .map(img => ({
      id: img.id,
      publicId: img.publicId,
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

  // Professional/Novo Theme Layout
  if (isProfessional) {
    return (
      <div className="novo-gallery-page bg-white dark:bg-gray-900 min-h-screen">
        <NavigationButton variant="both" />
        {/* Novo Header Section */}
        <section className="py-24 md:py-32 bg-white dark:bg-gray-900">
          <div className="container mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center mb-16"
            >
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-playfair font-bold text-[#1a1a1a] dark:text-gray-100 mb-8">
                Gallery
              </h1>
              
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: '60px' }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="h-[1px] bg-[#d4af37] mx-auto mb-12"
              />

              <p className="text-lg md:text-xl text-gray-700 dark:text-gray-300 font-lato leading-relaxed max-w-3xl mx-auto mb-12">
                Explore my curated collection of photography across different styles and moments
              </p>

              {/* Novo Category Filter */}
              <div className="flex flex-wrap justify-center gap-4 mb-8">
                {['all', 'portraits', 'weddings', 'events', 'nature', 'fashion'].map((category) => (
                  <button
                    key={category}
                    onClick={() => handleCategoryChange(category as Category)}
                    className={`px-6 py-2 font-lato font-medium text-sm uppercase tracking-[0.2em] transition-all duration-300 ${
                      activeCategory === category
                        ? 'text-[#d4af37] border-b-2 border-[#d4af37]'
                        : 'text-gray-600 hover:text-[#1a1a1a] dark:text-gray-100'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>

              {/* Sort Controls - Novo Style */}
              <div className="flex items-center justify-center gap-4 text-sm">
                <span className="text-gray-600 font-lato">Sort by:</span>
                <button
                  onClick={() => handleSortChange('date')}
                  className={`px-4 py-2 font-lato font-medium text-xs uppercase tracking-[0.2em] transition-all duration-300 ${
                    sortBy === 'date'
                      ? 'text-[#d4af37]'
                      : 'text-gray-600 hover:text-[#1a1a1a] dark:text-gray-100'
                  }`}
                >
                  Date {sortBy === 'date' && (sortOrder === 'desc' ? '↓' : '↑')}
                </button>
                <button
                  onClick={() => handleSortChange('title')}
                  className={`px-4 py-2 font-lato font-medium text-xs uppercase tracking-[0.2em] transition-all duration-300 ${
                    sortBy === 'title'
                      ? 'text-[#d4af37]'
                      : 'text-gray-600 hover:text-[#1a1a1a] dark:text-gray-100'
                  }`}
                >
                  Title {sortBy === 'title' && (sortOrder === 'desc' ? '↓' : '↑')}
                </button>
                <span className="text-gray-500 font-lato">
                  ({filteredItems.length} {filteredItems.length === 1 ? 'item' : 'items'})
                </span>
              </div>
            </motion.div>

            {/* Novo Gallery Grid */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                {[...Array(9)].map((_, i) => (
                  <div key={i} className="aspect-square bg-gray-200 animate-pulse" />
                ))}
              </div>
            ) : filteredItems.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                {filteredItems.map((item, index) => {
                  if (item.type === 'album') {
                    return (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-50px" }}
                        transition={{ duration: 0.6, delay: index * 0.05 }}
                      >
                        <AlbumCarousel
                          photos={item.photos}
                          coverImage={item.coverImage}
                          photoCount={item.photoCount}
                          onOpen={() => openAlbumLightbox(item)}
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
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-50px" }}
                        transition={{ duration: 0.6, delay: index * 0.05 }}
                        onClick={() => openLightbox(imageIndex)}
                        className="group relative aspect-square overflow-hidden bg-gray-200 cursor-pointer"
                      >
                        <Image
                          src={item.thumbnailUrl || item.url}
                          alt={item.title || `Photo ${imageIndex + 1}`}
                          fill
                          className="object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        
                        {/* Hover Overlay - Clean without text */}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </motion.div>
                    );
                  }
                })}
              </div>
            ) : (
              <div className="text-center py-16">
                <p className="text-gray-500 font-lato text-lg">No content found in this category.</p>
              </div>
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
            photos={currentAlbum.photos}
            albumTitle={currentAlbum.title}
            albumDescription={currentAlbum.description}
            currentIndex={0}
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
      <NavigationButton variant="both" />
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
          photos={currentAlbum.photos}
          albumTitle={currentAlbum.title}
          albumDescription={currentAlbum.description}
          currentIndex={0}
          isOpen={albumLightboxOpen}
          onClose={() => setAlbumLightboxOpen(false)}
        />
      )}

      {/* PWA Install Prompt */}
      <PublicPWAInstallPrompt />
    </div>
  );
}
