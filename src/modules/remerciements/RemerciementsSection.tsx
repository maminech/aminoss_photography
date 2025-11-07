'use client';

/**
 * Remerciements Section
 * Rotating thank-you messages and images carousel
 * Auto-plays and can be managed from admin dashboard
 */

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { Heart, Quote } from 'lucide-react';

interface RemerciementItem {
  id: string;
  type: 'image' | 'text' | 'testimonial';
  content: string;
  author?: string;
  image?: string;
  active: boolean;
  order: number;
}

interface RemerciementsSectionProps {
  autoPlayInterval?: number; // milliseconds
  showDots?: boolean;
}

export default function RemerciementsSection({ 
  autoPlayInterval = 5000, 
  showDots = true 
}: RemerciementsSectionProps) {
  const [items, setItems] = useState<RemerciementItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [direction, setDirection] = useState(1);

  useEffect(() => {
    fetchRemerciements();
  }, []);

  useEffect(() => {
    if (items.length === 0) return;

    const timer = setInterval(() => {
      setDirection(1);
      setCurrentIndex((prev) => (prev + 1) % items.length);
    }, autoPlayInterval);

    return () => clearInterval(timer);
  }, [items.length, autoPlayInterval]);

  const fetchRemerciements = async () => {
    try {
      const res = await fetch('/api/admin/remerciements');
      if (res.ok) {
        const data = await res.json();
        const activeItems = data.filter((item: RemerciementItem) => item.active)
                                 .sort((a: RemerciementItem, b: RemerciementItem) => a.order - b.order);
        setItems(activeItems);
      }
    } catch (error) {
      console.error('Error fetching remerciements:', error);
    } finally {
      setLoading(false);
    }
  };

  const goToSlide = (index: number) => {
    setDirection(index > currentIndex ? 1 : -1);
    setCurrentIndex(index);
  };

  if (loading) {
    return (
      <section className="py-16 bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-black">
        <div className="max-w-6xl mx-auto px-4">
          <div className="glass-card p-12 animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mx-auto mb-4" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mx-auto" />
          </div>
        </div>
      </section>
    );
  }

  if (items.length === 0) {
    return null; // Don't show section if no remerciements
  }

  const currentItem = items[currentIndex];

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
    }),
  };

  return (
    <section className="py-20 bg-gradient-to-br from-primary/5 via-white to-primary/10 dark:from-gray-900 dark:via-black dark:to-gray-900 overflow-hidden">
      <div className="max-w-6xl mx-auto px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4">
            <Heart className="w-4 h-4 text-primary fill-current" />
            <span className="text-sm font-medium text-primary">Remerciements</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
            Merci à tous nos clients
          </h2>
        </motion.div>

        {/* Carousel Content */}
        <div className="relative">
          <div className="glass-card overflow-hidden min-h-[400px] flex items-center justify-center p-8 md:p-12">
            <AnimatePresence initial={false} custom={direction} mode="wait">
              <motion.div
                key={currentIndex}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                  x: { type: 'spring', stiffness: 300, damping: 30 },
                  opacity: { duration: 0.2 },
                }}
                className="w-full"
              >
                {/* Render based on type */}
                {currentItem.type === 'image' && currentItem.image && (
                  <div className="relative w-full max-w-4xl mx-auto">
                    <div className="relative aspect-video rounded-2xl overflow-hidden">
                      <Image
                        src={currentItem.image}
                        alt={currentItem.content}
                        fill
                        className="object-cover"
                      />
                    </div>
                    {currentItem.content && (
                      <p className="text-center text-gray-700 dark:text-gray-300 mt-6 text-lg font-medium">
                        {currentItem.content}
                      </p>
                    )}
                  </div>
                )}

                {currentItem.type === 'text' && (
                  <div className="max-w-3xl mx-auto text-center">
                    <Heart className="w-16 h-16 text-primary fill-current mx-auto mb-6" />
                    <p className="text-2xl md:text-3xl font-medium text-gray-800 dark:text-gray-200 leading-relaxed">
                      {currentItem.content}
                    </p>
                    {currentItem.author && (
                      <p className="mt-6 text-lg text-primary font-semibold">
                        - {currentItem.author}
                      </p>
                    )}
                  </div>
                )}

                {currentItem.type === 'testimonial' && (
                  <div className="max-w-3xl mx-auto">
                    <div className="relative">
                      <Quote className="absolute -top-4 -left-4 w-12 h-12 text-primary/20" />
                      <blockquote className="text-xl md:text-2xl text-gray-700 dark:text-gray-300 italic leading-relaxed pl-8">
                        "{currentItem.content}"
                      </blockquote>
                      {currentItem.author && (
                        <div className="mt-6 flex items-center gap-4">
                          {currentItem.image && (
                            <div className="relative w-16 h-16 rounded-full overflow-hidden flex-shrink-0">
                              <Image
                                src={currentItem.image}
                                alt={currentItem.author}
                                fill
                                className="object-cover"
                              />
                            </div>
                          )}
                          <div>
                            <p className="font-bold text-gray-900 dark:text-white text-lg">
                              {currentItem.author}
                            </p>
                            <p className="text-primary text-sm">Client satisfait</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation Dots */}
          {showDots && items.length > 1 && (
            <div className="flex justify-center gap-3 mt-8">
              {items.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`transition-all duration-300 rounded-full ${
                    index === currentIndex
                      ? 'w-12 h-3 bg-primary'
                      : 'w-3 h-3 bg-gray-300 dark:bg-gray-600 hover:bg-primary/50'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          )}

          {/* Progress Bar */}
          <div className="mt-6 max-w-md mx-auto">
            <div className="h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-primary"
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{ duration: autoPlayInterval / 1000, ease: 'linear' }}
                key={currentIndex}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
