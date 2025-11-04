'use client';

import { motion } from 'framer-motion';
import { Category } from '@/types';

const categories: { value: Category; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'weddings', label: 'Weddings' },
  { value: 'portraits', label: 'Portraits' },
  { value: 'travel', label: 'Travel' },
  { value: 'fashion', label: 'Fashion' },
];

interface CategoryFilterProps {
  activeCategory: Category;
  onCategoryChange: (category: Category) => void;
}

export default function CategoryFilter({ activeCategory, onCategoryChange }: CategoryFilterProps) {
  return (
    <div className="flex flex-wrap justify-center gap-3 mb-8">
      {categories.map((category) => (
        <motion.button
          key={category.value}
          onClick={() => onCategoryChange(category.value)}
          className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
            activeCategory === category.value
              ? 'bg-primary-600 text-white shadow-lg'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {category.label}
        </motion.button>
      ))}
    </div>
  );
}
