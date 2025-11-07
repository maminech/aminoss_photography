'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

interface CarouselItem {
  id: string;
  image: string;
  title?: string;
  description?: string;
}

interface NovoCarouselProps {
  items: CarouselItem[];
  autoplay?: boolean;
  autoplayInterval?: number;
  showDots?: boolean;
  showArrows?: boolean;
  loop?: boolean;
}

export default function NovoCarousel({
  items,
  autoplay = false,
  autoplayInterval = 5000,
  showDots = true,
  showArrows = true,
  loop = true,
}: NovoCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

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

  const swipeConfidenceThreshold = 10000;
  const swipePower = (offset: number, velocity: number) => {
    return Math.abs(offset) * velocity;
  };

  const paginate = (newDirection: number) => {
    let newIndex = currentIndex + newDirection;

    if (loop) {
      if (newIndex < 0) newIndex = items.length - 1;
      if (newIndex >= items.length) newIndex = 0;
    } else {
      if (newIndex < 0 || newIndex >= items.length) return;
    }

    setDirection(newDirection);
    setCurrentIndex(newIndex);
  };

  const goToSlide = (index: number) => {
    setDirection(index > currentIndex ? 1 : -1);
    setCurrentIndex(index);
  };

  // Autoplay
  useEffect(() => {
    if (!autoplay) return;

    timeoutRef.current = setTimeout(() => {
      paginate(1);
    }, autoplayInterval);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [currentIndex, autoplay, autoplayInterval]);

  const canGoPrev = loop || currentIndex > 0;
  const canGoNext = loop || currentIndex < items.length - 1;

  return (
    <div className="relative w-full overflow-hidden bg-black">
      {/* Carousel Container */}
      <div className="relative w-full aspect-[16/9] md:aspect-[21/9]">
        <AnimatePresence initial={false} custom={direction}>
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: 'spring', stiffness: 300, damping: 30 },
              opacity: { duration: 0.6 },
            }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={1}
            onDragEnd={(e, { offset, velocity }) => {
              const swipe = swipePower(offset.x, velocity.x);

              if (swipe < -swipeConfidenceThreshold) {
                paginate(1);
              } else if (swipe > swipeConfidenceThreshold) {
                paginate(-1);
              }
            }}
            className="absolute inset-0"
          >
            {/* Image */}
            <div className="relative w-full h-full">
              <Image
                src={items[currentIndex].image}
                alt={items[currentIndex].title || `Slide ${currentIndex + 1}`}
                fill
                className="object-cover"
                priority={currentIndex === 0}
                quality={90}
              />
              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
            </div>

            {/* Content Overlay */}
            {(items[currentIndex].title || items[currentIndex].description) && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.8 }}
                className="absolute bottom-0 left-0 right-0 p-8 md:p-16 text-white"
              >
                <div className="max-w-4xl">
                  {items[currentIndex].title && (
                    <h3 className="text-3xl md:text-5xl lg:text-6xl font-playfair font-bold mb-4 leading-tight">
                      {items[currentIndex].title}
                    </h3>
                  )}
                  {items[currentIndex].description && (
                    <p className="text-base md:text-lg font-lato font-light text-white/90 max-w-2xl">
                      {items[currentIndex].description}
                    </p>
                  )}
                </div>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Arrows */}
      {showArrows && (
        <>
          <button
            onClick={() => paginate(-1)}
            disabled={!canGoPrev}
            className={`absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-10 w-12 h-12 md:w-14 md:h-14 flex items-center justify-center bg-white/10 backdrop-blur-sm hover:bg-[#d4af37] transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed group ${
              canGoPrev ? 'hover:scale-110' : ''
            }`}
            aria-label="Previous slide"
          >
            <FiChevronLeft className="w-6 h-6 md:w-7 md:h-7 text-white" />
          </button>

          <button
            onClick={() => paginate(1)}
            disabled={!canGoNext}
            className={`absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-10 w-12 h-12 md:w-14 md:h-14 flex items-center justify-center bg-white/10 backdrop-blur-sm hover:bg-[#d4af37] transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed group ${
              canGoNext ? 'hover:scale-110' : ''
            }`}
            aria-label="Next slide"
          >
            <FiChevronRight className="w-6 h-6 md:w-7 md:h-7 text-white" />
          </button>
        </>
      )}

      {/* Dots Navigation */}
      {showDots && (
        <div className="absolute bottom-6 md:bottom-8 left-1/2 -translate-x-1/2 z-10 flex gap-2 md:gap-3">
          {items.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`transition-all duration-300 ${
                index === currentIndex
                  ? 'w-8 md:w-10 h-1 bg-[#d4af37]'
                  : 'w-1 h-1 bg-white/50 hover:bg-white/80 rounded-full'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Counter */}
      <div className="absolute top-6 md:top-8 right-6 md:right-8 z-10 text-white font-lato text-sm">
        <span className="text-[#d4af37] font-medium">{String(currentIndex + 1).padStart(2, '0')}</span>
        <span className="text-white/50 mx-2">/</span>
        <span className="text-white/70">{String(items.length).padStart(2, '0')}</span>
      </div>
    </div>
  );
}
