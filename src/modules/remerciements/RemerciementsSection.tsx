'use client';

/**
 * Remerciements Section - Enhanced with Gestures
 * Beautiful, smooth, and fluid testimonials carousel
 * Features: Swipe gestures, auto-play, smooth animations
 * Fully responsive with touch support
 */

import { useEffect, useState } from 'react';
import { motion, AnimatePresence, PanInfo, useMotionValue, useTransform, animate } from 'framer-motion';
import Image from 'next/image';
import { Heart, Quote, Star, ChevronLeft, ChevronRight } from 'lucide-react';

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
  const [testimonials, setTestimonials] = useState<ClientTestimonial[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [direction, setDirection] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  
  // Motion values for smooth drag interactions
  const x = useMotionValue(0);
  const opacity = useTransform(x, [-200, 0, 200], [0.5, 1, 0.5]);

  useEffect(() => {
    fetchAllContent();
  }, []);

  useEffect(() => {
    if (testimonials.length === 0 || isDragging) return;

    const timer = setInterval(() => {
      setDirection(1);
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, autoPlayInterval);

    return () => clearInterval(timer);
  }, [testimonials.length, autoPlayInterval, isDragging]);

  const fetchAllContent = async () => {
    try {
      // Fetch testimonials (approved only)
      const testimonialRes = await fetch('/api/public/testimonials');
      let loadedTestimonials: ClientTestimonial[] = [];
      if (testimonialRes.ok) {
        const data = await testimonialRes.json();
        loadedTestimonials = data.testimonials || data;
        console.log('Testimonials loaded:', loadedTestimonials.length, 'items');
      } else {
        console.warn('Failed to load testimonials:', testimonialRes.status);
      }

      setTestimonials(loadedTestimonials);
      console.log('Total testimonials:', loadedTestimonials.length);
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

  const goToNext = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const goToPrevious = () => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    setIsDragging(false);
    const swipeThreshold = 50;
    
    if (info.offset.x > swipeThreshold) {
      goToPrevious();
    } else if (info.offset.x < -swipeThreshold) {
      goToNext();
    }
    
    // Reset x position
    animate(x, 0, { type: 'spring', stiffness: 300, damping: 30 });
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

  if (testimonials.length === 0) {
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

  const currentTestimonial = testimonials[currentIndex];

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? '100%' : '-100%',
      opacity: 0,
      scale: 0.8,
      rotateY: direction > 0 ? 45 : -45,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
      scale: 1,
      rotateY: 0,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? '100%' : '-100%',
      opacity: 0,
      scale: 0.8,
      rotateY: direction < 0 ? 45 : -45,
    }),
  };

  return (
    <section className="py-20 bg-gradient-to-br from-primary/5 via-white to-primary/10 dark:from-gray-900 dark:via-black dark:to-gray-900 overflow-hidden relative">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'linear',
          }}
          className="absolute -top-1/4 -right-1/4 w-1/2 h-1/2 bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [360, 180, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: 'linear',
          }}
          className="absolute -bottom-1/4 -left-1/4 w-1/2 h-1/2 bg-gradient-to-tr from-pink-500/10 to-transparent rounded-full blur-3xl"
        />
      </div>

      <div className="max-w-6xl mx-auto px-4 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary/10 to-pink-500/10 border border-primary/20 mb-4 backdrop-blur-sm"
          >
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Heart className="w-4 h-4 text-primary fill-current" />
            </motion.div>
            <span className="text-sm font-medium bg-gradient-to-r from-primary to-pink-600 bg-clip-text text-transparent">
              Remerciements
            </span>
          </motion.div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-2">
            Merci à tous nos clients
          </h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Découvrez les retours de nos clients satisfaits
          </p>
        </motion.div>

        {/* Carousel Content with Gestures */}
        <div className="relative">
          {/* Navigation Arrows - Desktop */}
          {testimonials.length > 1 && (
            <>
              <motion.button
                whileHover={{ scale: 1.1, x: -5 }}
                whileTap={{ scale: 0.9 }}
                onClick={goToPrevious}
                className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 z-20 w-12 h-12 items-center justify-center rounded-full bg-white dark:bg-gray-800 shadow-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-primary hover:text-white dark:hover:bg-primary transition-colors"
                aria-label="Previous testimonial"
              >
                <ChevronLeft className="w-6 h-6" />
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.1, x: 5 }}
                whileTap={{ scale: 0.9 }}
                onClick={goToNext}
                className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 z-20 w-12 h-12 items-center justify-center rounded-full bg-white dark:bg-gray-800 shadow-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-primary hover:text-white dark:hover:bg-primary transition-colors"
                aria-label="Next testimonial"
              >
                <ChevronRight className="w-6 h-6" />
              </motion.button>
            </>
          )}

          <motion.div
            className="glass-card overflow-hidden min-h-[400px] flex items-center justify-center p-8 md:p-12 cursor-grab active:cursor-grabbing"
            style={{ perspective: 1000 }}
          >
            <AnimatePresence initial={false} custom={direction} mode="wait">
              <motion.div
                key={currentIndex}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                  x: { type: 'spring', stiffness: 300, damping: 40 },
                  opacity: { duration: 0.3 },
                  scale: { duration: 0.4 },
                  rotateY: { duration: 0.6 },
                }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.5}
                onDragStart={() => setIsDragging(true)}
                onDragEnd={handleDragEnd}
                style={{ x, opacity }}
                className="w-full"
              >
                <div className="max-w-3xl mx-auto">
                  <div className="relative">
                    {/* Decorative Quote */}
                    <motion.div
                      initial={{ opacity: 0, scale: 0.5, rotate: -180 }}
                      animate={{ opacity: 1, scale: 1, rotate: 0 }}
                      transition={{ delay: 0.2, type: 'spring' }}
                    >
                      <Quote className="absolute -top-4 -left-4 w-16 h-16 text-primary/20" />
                    </motion.div>
                    
                    {/* Star Rating with Animation */}
                    <motion.div
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="flex justify-center gap-1.5 mb-8 pl-8"
                    >
                      {[1, 2, 3, 4, 5].map((star, index) => (
                        <motion.div
                          key={star}
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.4 + index * 0.1, type: 'spring', stiffness: 200 }}
                        >
                          <Star
                            className={`w-7 h-7 transition-all ${
                              star <= currentTestimonial.rating
                                ? 'text-yellow-500 fill-yellow-500 drop-shadow-lg'
                                : 'text-gray-300 dark:text-gray-600'
                            }`}
                          />
                        </motion.div>
                      ))}
                    </motion.div>

                    {/* Comment with Smooth Reveal */}
                    <motion.blockquote
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5, duration: 0.6 }}
                      className="text-xl md:text-2xl lg:text-3xl text-gray-700 dark:text-gray-300 italic leading-relaxed pl-8 mb-8 font-serif"
                    >
                      <span className="inline-block">"{currentTestimonial.comment}"</span>
                    </motion.blockquote>

                    {/* Client Info with Elegant Layout */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 }}
                      className="mt-8 flex items-center gap-4 pl-8"
                    >
                      {currentTestimonial.photoUrl && (
                        <motion.div
                          whileHover={{ scale: 1.1 }}
                          className="relative w-20 h-20 rounded-full overflow-hidden flex-shrink-0 ring-4 ring-primary/20"
                        >
                          <Image
                            src={currentTestimonial.photoUrl}
                            alt={currentTestimonial.clientName}
                            fill
                            className="object-cover"
                          />
                        </motion.div>
                      )}
                      <div className="flex-1">
                        <p className="font-bold text-gray-900 dark:text-white text-xl mb-1">
                          {currentTestimonial.clientName}
                        </p>
                        <div className="flex flex-wrap items-center gap-2 text-sm">
                          {currentTestimonial.featured && (
                            <motion.span
                              whileHover={{ scale: 1.05 }}
                              className="px-3 py-1 bg-gradient-to-r from-yellow-100 to-orange-100 dark:from-yellow-900/30 dark:to-orange-900/30 text-yellow-700 dark:text-yellow-400 rounded-full text-xs font-semibold shadow-sm"
                            >
                              ⭐ Coup de cœur
                            </motion.span>
                          )}
                          {currentTestimonial.eventType && (
                            <span className="capitalize text-primary font-medium">
                              {currentTestimonial.eventType}
                            </span>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </motion.div>

          {/* Swipe Hint - Mobile */}
          {testimonials.length > 1 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="md:hidden text-center mt-4 text-sm text-gray-500 dark:text-gray-400"
            >
              <motion.span
                animate={{ x: [-5, 5, -5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="inline-block"
              >
                ← Swipe →
              </motion.span>
            </motion.div>
          )}

          {/* Navigation Dots with Enhanced Design */}
          {showDots && testimonials.length > 1 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="flex justify-center gap-2 mt-8"
            >
              {testimonials.map((_, index) => (
                <motion.button
                  key={index}
                  onClick={() => goToSlide(index)}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                  className="relative group"
                  aria-label={`Go to slide ${index + 1}`}
                >
                  <motion.div
                    animate={{
                      width: index === currentIndex ? '48px' : '12px',
                      backgroundColor: index === currentIndex 
                        ? 'rgb(var(--primary))' 
                        : 'rgb(209 213 219)',
                    }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                    className={`h-3 rounded-full transition-colors ${
                      index === currentIndex
                        ? 'bg-primary shadow-lg shadow-primary/50'
                        : 'bg-gray-300 dark:bg-gray-600 group-hover:bg-primary/50'
                    }`}
                  />
                  {index === currentIndex && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="absolute inset-0 rounded-full bg-primary/20 blur-sm"
                    />
                  )}
                </motion.button>
              ))}
            </motion.div>
          )}

          {/* Animated Progress Bar */}
          {!isDragging && (
            <motion.div
              initial={{ opacity: 0, scaleX: 0 }}
              animate={{ opacity: 1, scaleX: 1 }}
              transition={{ delay: 0.8 }}
              className="mt-6 max-w-md mx-auto"
            >
              <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden relative">
                <motion.div
                  className="h-full bg-gradient-to-r from-primary via-pink-500 to-primary rounded-full relative overflow-hidden"
                  initial={{ width: '0%' }}
                  animate={{ width: '100%' }}
                  transition={{ duration: autoPlayInterval / 1000, ease: 'linear' }}
                  key={currentIndex}
                >
                  {/* Shine effect */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                    animate={{ x: ['-100%', '200%'] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                  />
                </motion.div>
              </div>
            </motion.div>
          )}

          {/* Counter */}
          {testimonials.length > 1 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
              className="text-center mt-4 text-sm font-medium text-gray-600 dark:text-gray-400"
            >
              <span className="text-primary font-bold">{currentIndex + 1}</span>
              <span className="mx-2">/</span>
              <span>{testimonials.length}</span>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
}
