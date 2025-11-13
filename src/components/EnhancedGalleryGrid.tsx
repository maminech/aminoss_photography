/**
 * Enhanced Gallery Grid Component
 * Professional masonry layout with hover effects, filtering, and lazy loading
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { FiHeart, FiMessageCircle, FiShare2, FiEye } from 'react-icons/fi';
import { designTokens } from '@/styles/design-tokens';
import { animations } from '@/lib/animations';
import { MediaItem } from '@/types';

interface EnhancedGalleryGridProps {
  items: MediaItem[];
  columns?: 2 | 3 | 4;
  onItemClick?: (item: MediaItem, index: number) => void;
  showFilters?: boolean;
  categories?: string[];
}

export default function EnhancedGalleryGrid({
  items,
  columns = 3,
  onItemClick,
  showFilters = true,
  categories = ['All', 'Weddings', 'Events', 'Portraits', 'Landscape']
}: EnhancedGalleryGridProps) {
  const [activeCategory, setActiveCategory] = useState('All');
  const [filteredItems, setFilteredItems] = useState(items);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (activeCategory === 'All') {
      setFilteredItems(items);
    } else {
      setFilteredItems(items.filter(item => item.category === activeCategory));
    }
  }, [activeCategory, items]);

  const handleImageLoad = useCallback((id: string) => {
    setLoadedImages(prev => new Set(prev).add(id));
  }, []);

  const columnClasses = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
  };

  return (
    <div className="w-full">
      {/* Category Filters */}
      {showFilters && categories.length > 1 && (
        <motion.div 
          className="flex flex-wrap justify-center gap-3 mb-12"
          {...animations.fadeInUp}
        >
          {categories.map((category) => (
            <motion.button
              key={category}
              onClick={() => setActiveCategory(category)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300 font-sans ${
                activeCategory === category
                  ? 'text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-50 shadow-sm'
              }`}
              style={{
                backgroundColor: activeCategory === category ? designTokens.primary[500] : undefined
              }}
            >
              {category}
            </motion.button>
          ))}
        </motion.div>
      )}

      {/* Gallery Grid */}
      <motion.div 
        className={`grid ${columnClasses[columns]} gap-4 md:gap-6`}
        layout
      >
        <AnimatePresence mode="popLayout">
          {filteredItems.map((item, index) => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              className="relative group cursor-pointer overflow-hidden rounded-lg"
              style={{ 
                aspectRatio: item.width && item.height ? `${item.width}/${item.height}` : '1/1',
                boxShadow: designTokens.shadows.md
              }}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              onClick={() => onItemClick?.(item, index)}
            >
              {/* Image with Blur-up Effect */}
              <div className="relative w-full h-full bg-gray-100">
                {!loadedImages.has(item.id) && (
                  <div 
                    className="absolute inset-0 animate-pulse"
                    style={{
                      background: designTokens.gradients.shimmer,
                      backgroundSize: '200% 100%',
                      animation: 'shimmer 1.5s infinite'
                    }}
                  />
                )}
                <Image
                  src={item.url}
                  alt={item.title || 'Gallery image'}
                  fill
                  sizes={`(max-width: 640px) 100vw, (max-width: 1024px) ${100 / 2}vw, ${100 / columns}vw`}
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                  onLoad={() => handleImageLoad(item.id)}
                  loading="lazy"
                />
              </div>

              {/* Hover Overlay */}
              <AnimatePresence>
                {hoveredIndex === index && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="absolute inset-0 flex flex-col justify-between p-6"
                    style={{
                      background: designTokens.gradients.darkOverlay
                    }}
                  >
                    {/* Top Actions */}
                    <div className="flex justify-end gap-3">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/30 transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          // Handle like
                        }}
                      >
                        <FiHeart className="w-5 h-5" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/30 transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          // Handle share
                        }}
                      >
                        <FiShare2 className="w-5 h-5" />
                      </motion.button>
                    </div>

                    {/* Bottom Info */}
                    <div className="space-y-2">
                      {item.title && (
                        <h3 
                          className="text-white text-lg font-semibold font-serif"
                        >
                          {item.title}
                        </h3>
                      )}
                      {item.description && (
                        <p className="text-white/90 text-sm line-clamp-2">
                          {item.description}
                        </p>
                      )}
                      <div className="flex items-center gap-4 text-white/80 text-sm">
                        <span className="flex items-center gap-1">
                          <FiEye className="w-4 h-4" />
                          0
                        </span>
                        <span className="flex items-center gap-1">
                          <FiHeart className="w-4 h-4" />
                          0
                        </span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {/* Empty State */}
      {filteredItems.length === 0 && (
        <motion.div 
          className="text-center py-20"
          {...animations.fadeIn}
        >
          <div className="text-6xl mb-4">📷</div>
          <h3 className="text-2xl font-semibold mb-2 text-gray-700 font-serif">
            No items found
          </h3>
          <p className="text-gray-500">
            Try selecting a different category
          </p>
        </motion.div>
      )}

      {/* Shimmer Animation Keyframes */}
      <style jsx>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
    </div>
  );
}
