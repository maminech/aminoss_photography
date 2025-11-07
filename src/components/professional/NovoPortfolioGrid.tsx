'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface PortfolioItem {
  id: string;
  image: string;
  title: string;
  category: string;
  href?: string;
}

interface NovoPortfolioGridProps {
  items: PortfolioItem[];
  categories?: string[];
  columns?: 2 | 3 | 4;
  showFilter?: boolean;
  gap?: 'small' | 'medium' | 'large';
}

export default function NovoPortfolioGrid({
  items,
  categories,
  columns = 3,
  showFilter = true,
  gap = 'medium',
}: NovoPortfolioGridProps) {
  const [activeFilter, setActiveFilter] = useState<string>('all');

  // Extract unique categories if not provided
  const filterCategories = categories || ['all', ...Array.from(new Set(items.map((item) => item.category)))];

  // Filter items based on active filter
  const filteredItems = activeFilter === 'all' 
    ? items 
    : items.filter((item) => item.category === activeFilter);

  const columnClasses = {
    2: 'md:grid-cols-2',
    3: 'md:grid-cols-2 lg:grid-cols-3',
    4: 'md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  };

  const gapClasses = {
    small: 'gap-4',
    medium: 'gap-6 md:gap-8',
    large: 'gap-8 md:gap-12',
  };

  return (
    <div className="w-full">
      {/* Filter Navigation */}
      {showFilter && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-wrap items-center justify-center gap-4 md:gap-6 mb-12 md:mb-16"
        >
          {filterCategories.map((category, index) => (
            <motion.button
              key={category}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05, duration: 0.4 }}
              onClick={() => setActiveFilter(category)}
              className={`relative px-6 py-2.5 text-sm uppercase tracking-[0.15em] font-lato font-medium transition-all duration-300 ${
                activeFilter === category
                  ? 'text-[#d4af37]'
                  : 'text-gray-600 hover:text-[#1a1a1a]'
              }`}
            >
              {category}
              {activeFilter === category && (
                <motion.div
                  layoutId="activeFilter"
                  className="absolute bottom-0 left-0 right-0 h-[1px] bg-[#d4af37]"
                  transition={{ duration: 0.3 }}
                />
              )}
            </motion.button>
          ))}
        </motion.div>
      )}

      {/* Portfolio Grid */}
      <motion.div
        layout
        className={`grid grid-cols-1 ${columnClasses[columns]} ${gapClasses[gap]}`}
      >
        <AnimatePresence mode="popLayout">
          {filteredItems.map((item, index) => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{
                duration: 0.5,
                delay: index * 0.05,
                layout: { duration: 0.4 },
              }}
            >
              <PortfolioCard item={item} />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {/* Empty State */}
      {filteredItems.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-20"
        >
          <p className="text-gray-500 font-lato text-lg">No items found in this category</p>
        </motion.div>
      )}
    </div>
  );
}

function PortfolioCard({ item }: { item: PortfolioItem }) {
  const [isHovered, setIsHovered] = useState(false);

  const content = (
    <div
      className="relative aspect-[4/5] overflow-hidden bg-gray-100 group cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image */}
      <Image
        src={item.image}
        alt={item.title}
        fill
        className="object-cover transition-transform duration-700 group-hover:scale-110"
        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
      />

      {/* Overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: isHovered ? 1 : 0 }}
        transition={{ duration: 0.4 }}
        className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent"
      />

      {/* Content Overlay */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 20 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="absolute inset-0 flex flex-col justify-end p-6 md:p-8 text-white"
      >
        {/* Category */}
        <p className="text-[#d4af37] text-xs uppercase tracking-[0.2em] font-lato font-medium mb-2">
          {item.category}
        </p>

        {/* Title */}
        <h3 className="text-2xl md:text-3xl font-playfair font-bold leading-tight mb-3">
          {item.title}
        </h3>

        {/* Decorative Line */}
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: isHovered ? '60px' : 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="h-[1px] bg-[#d4af37]"
        />
      </motion.div>

      {/* Plus Icon */}
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: isHovered ? 1 : 0, scale: isHovered ? 1 : 0 }}
        transition={{ duration: 0.3, delay: 0.15 }}
        className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center bg-[#d4af37] text-white"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </motion.div>
    </div>
  );

  return item.href ? (
    <Link href={item.href} className="block">
      {content}
    </Link>
  ) : (
    content
  );
}
