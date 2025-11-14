'use client';

/**
 * Remerciements Section
 * Rotating thank-you messages and images carousel
 * Auto-plays and can be managed from admin dashboard
 * Now includes star ratings from client testimonials
 */

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { Heart, Quote, Star } from 'lucide-react';

interface RemerciementItem {
  id: string;
  type: 'image' | 'text' | 'testimonial';
  content: string;
  author?: string;
  image?: string;
  active: boolean;
  order: number;
}

interface ClientTestimonial {
  id: string;
  clientName: string;
  rating: number;
  comment: string;
  eventType?: string;
  eventDate?: string;
  photoUrl?: string;
  featured: boolean;
  createdAt: string;
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
  const [testimonials, setTestimonials] = useState<ClientTestimonial[]>([]);
  const [allItems, setAllItems] = useState<(RemerciementItem | ClientTestimonial)[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [direction, setDirection] = useState(1);

  useEffect(() => {
    fetchAllContent();
  }, []);

  useEffect(() => {
    if (allItems.length === 0) return;

    const timer = setInterval(() => {
      setDirection(1);
      setCurrentIndex((prev) => (prev + 1) % allItems.length);
    }, autoPlayInterval);

    return () => clearInterval(timer);
  }, [allItems.length, autoPlayInterval]);

  const fetchAllContent = async () => {
    try {
      // Fetch old remerciements (only active and approved ones)
      const remercRes = await fetch('/api/admin/remerciements?activeOnly=true');
      let oldItems: RemerciementItem[] = [];
      if (remercRes.ok) {
        const data = await remercRes.json();
        oldItems = data.sort((a: RemerciementItem, b: RemerciementItem) => a.order - b.order);
      }

      // Fetch new client testimonials
      const testimonialRes = await fetch('/api/public/testimonials');
      let newTestimonials: ClientTestimonial[] = [];
      if (testimonialRes.ok) {
        const data = await testimonialRes.json();
        newTestimonials = data;
      }

      setItems(oldItems);
      setTestimonials(newTestimonials);
      
      // Combine both types - featured testimonials first, then everything else mixed
      const combined = [...newTestimonials, ...oldItems];
      setAllItems(combined);
    } catch (error) {
      console.error('Error fetching content:', error);
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

  if (allItems.length === 0) {
    // Show a default thank you message if no content
    return (
      <section className="py-20 bg-gradient-to-br from-primary/5 via-white to-primary/10 dark:from-gray-900 dark:via-black dark:to-gray-900">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
              <Heart className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3">
              Merci à nos clients
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Votre confiance fait notre fierté
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="glass-card p-8 md:p-12 text-center max-w-3xl mx-auto"
          >
            <Quote className="w-12 h-12 text-primary/30 mx-auto mb-6" />
            <p className="text-xl md:text-2xl text-gray-700 dark:text-gray-300 italic mb-6">
              "Merci de nous faire confiance pour capturer vos moments les plus précieux. Chaque événement est une nouvelle histoire que nous sommes honorés de raconter à travers nos photos."
            </p>
            <p className="text-lg font-semibold text-primary">
              - L'équipe Innov8 Production
            </p>
          </motion.div>
        </div>
      </section>
    );
  }

  const currentItem = allItems[currentIndex];
  const isTestimonial = 'rating' in currentItem; // Check if it's a ClientTestimonial

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
                {/* Client Testimonial with Star Rating */}
                {isTestimonial && (
                  <div className="max-w-3xl mx-auto">
                    <div className="relative">
                      <Quote className="absolute -top-4 -left-4 w-12 h-12 text-primary/20" />
                      
                      {/* Star Rating */}
                      <div className="flex justify-center gap-1 mb-6 pl-8">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-6 h-6 ${
                              star <= (currentItem as ClientTestimonial).rating
                                ? 'text-yellow-500 fill-yellow-500'
                                : 'text-gray-300 dark:text-gray-600'
                            }`}
                          />
                        ))}
                      </div>

                      {/* Comment */}
                      <blockquote className="text-xl md:text-2xl text-gray-700 dark:text-gray-300 italic leading-relaxed pl-8 mb-6">
                        "{(currentItem as ClientTestimonial).comment}"
                      </blockquote>

                      {/* Client Info */}
                      <div className="mt-6 flex items-center gap-4 pl-8">
                        {(currentItem as ClientTestimonial).photoUrl && (
                          <div className="relative w-16 h-16 rounded-full overflow-hidden flex-shrink-0">
                            <Image
                              src={(currentItem as ClientTestimonial).photoUrl}
                              alt={(currentItem as ClientTestimonial).clientName}
                              fill
                              className="object-cover"
                            />
                          </div>
                        )}
                        <div>
                          <p className="font-bold text-gray-900 dark:text-white text-lg">
                            {(currentItem as ClientTestimonial).clientName}
                          </p>
                          <div className="flex items-center gap-2 text-sm text-primary">
                            {(currentItem as ClientTestimonial).featured && (
                              <span className="px-2 py-0.5 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded-full text-xs font-medium">
                                ⭐ Coup de cœur
                              </span>
                            )}
                            {(currentItem as ClientTestimonial).eventType && (
                              <span className="capitalize">
                                {(currentItem as ClientTestimonial).eventType}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Old Remerciement Types */}
                {!isTestimonial && (currentItem as RemerciementItem).type === 'image' && (currentItem as RemerciementItem).image && (
                  <div className="relative w-full max-w-4xl mx-auto">
                    <div className="relative aspect-video rounded-2xl overflow-hidden">
                      <Image
                        src={(currentItem as RemerciementItem).image!}
                        alt={(currentItem as RemerciementItem).content}
                        fill
                        className="object-cover"
                      />
                    </div>
                    {(currentItem as RemerciementItem).content && (
                      <p className="text-center text-gray-700 dark:text-gray-300 mt-6 text-lg font-medium">
                        {(currentItem as RemerciementItem).content}
                      </p>
                    )}
                  </div>
                )}

                {!isTestimonial && (currentItem as RemerciementItem).type === 'text' && (
                  <div className="max-w-3xl mx-auto text-center">
                    <Heart className="w-16 h-16 text-primary fill-current mx-auto mb-6" />
                    <p className="text-2xl md:text-3xl font-medium text-gray-800 dark:text-gray-200 leading-relaxed">
                      {(currentItem as RemerciementItem).content}
                    </p>
                    {(currentItem as RemerciementItem).author && (
                      <p className="mt-6 text-lg text-primary font-semibold">
                        - {(currentItem as RemerciementItem).author}
                      </p>
                    )}
                  </div>
                )}

                {!isTestimonial && (currentItem as RemerciementItem).type === 'testimonial' && (
                  <div className="max-w-3xl mx-auto">
                    <div className="relative">
                      <Quote className="absolute -top-4 -left-4 w-12 h-12 text-primary/20" />
                      <blockquote className="text-xl md:text-2xl text-gray-700 dark:text-gray-300 italic leading-relaxed pl-8">
                        "{(currentItem as RemerciementItem).content}"
                      </blockquote>
                      {(currentItem as RemerciementItem).author && (
                        <div className="mt-6 flex items-center gap-4">
                          {(currentItem as RemerciementItem).image && (
                            <div className="relative w-16 h-16 rounded-full overflow-hidden flex-shrink-0">
                              <Image
                                src={(currentItem as RemerciementItem).image!}
                                alt={(currentItem as RemerciementItem).author!}
                                fill
                                className="object-cover"
                              />
                            </div>
                          )}
                          <div>
                            <p className="font-bold text-gray-900 dark:text-white text-lg">
                              {(currentItem as RemerciementItem).author}
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
          {showDots && allItems.length > 1 && (
            <div className="flex justify-center gap-3 mt-8">
              {allItems.map((_, index) => (
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
