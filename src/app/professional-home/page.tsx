'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { FiChevronLeft, FiChevronRight, FiInstagram, FiFacebook, FiMail, FiPhone, FiMenu, FiX, FiGrid, FiLayers } from 'react-icons/fi';
import { useLayoutTheme } from '@/contexts/ThemeContext';

export default function ProfessionalHomePage() {
  const { currentTheme, setTheme } = useLayoutTheme();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [images, setImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (currentTheme !== 'professional') {
    return null;
  }

  useEffect(() => {
    const loadImages = async () => {
      try {
        const res = await fetch('/api/admin/images?featured=true&limit=10');
        if (res.ok) {
          const data = await res.json();
          setImages(data);
        }
      } catch (error) {
        console.error('Error loading images:', error);
      } finally {
        setLoading(false);
      }
    };
    loadImages();
  }, []);

  useEffect(() => {
    if (images.length === 0) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [images.length]);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % images.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + images.length) % images.length);
  const goToSlide = (index: number) => setCurrentSlide(index);

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white z-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#d4af37] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-lato">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="novo-fullscreen-home fixed inset-0 overflow-hidden bg-white">
      {/* Fixed Navigation Overlay */}
      <motion.nav 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        transition={{ duration: 0.8, delay: 2 }} 
        className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-b from-black/60 to-transparent"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-12">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Logo */}
            <Link href="/gallery" className="text-xl sm:text-2xl font-playfair font-bold tracking-tight text-white hover:text-[#d4af37] transition-colors z-50">
              AMINOSS
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-4 lg:space-x-8">
              <Link 
                href="/gallery" 
                className="text-white hover:text-[#d4af37] transition-colors font-lato text-xs lg:text-sm uppercase tracking-[0.2em]"
              >
                Gallery
              </Link>
              <Link 
                href="/about" 
                className="text-white hover:text-[#d4af37] transition-colors font-lato text-xs lg:text-sm uppercase tracking-[0.2em]"
              >
                About
              </Link>
              <Link 
                href="/videos" 
                className="text-white hover:text-[#d4af37] transition-colors font-lato text-xs lg:text-sm uppercase tracking-[0.2em]"
              >
                Videos
              </Link>
              <Link 
                href="/packs" 
                className="text-white hover:text-[#d4af37] transition-colors font-lato text-xs lg:text-sm uppercase tracking-[0.2em]"
              >
                Packages
              </Link>
              <Link 
                href="/contact" 
                className="px-4 lg:px-6 py-2 lg:py-3 bg-[#d4af37] text-white font-lato text-xs lg:text-sm uppercase tracking-[0.2em] hover:bg-white hover:text-[#1a1a1a] transition-all duration-300"
              >
                Contact
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden z-50 w-10 h-10 flex items-center justify-center text-white hover:text-[#d4af37] transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden bg-black/95 backdrop-blur-lg"
            >
              <div className="container mx-auto px-4 py-6 flex flex-col space-y-4">
                <Link 
                  href="/gallery" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-white hover:text-[#d4af37] transition-colors font-lato text-sm uppercase tracking-[0.2em] py-3 border-b border-white/10"
                >
                  Gallery
                </Link>
                <Link 
                  href="/about" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-white hover:text-[#d4af37] transition-colors font-lato text-sm uppercase tracking-[0.2em] py-3 border-b border-white/10"
                >
                  About
                </Link>
                <Link 
                  href="/videos" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-white hover:text-[#d4af37] transition-colors font-lato text-sm uppercase tracking-[0.2em] py-3 border-b border-white/10"
                >
                  Videos
                </Link>
                <Link 
                  href="/packs" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-white hover:text-[#d4af37] transition-colors font-lato text-sm uppercase tracking-[0.2em] py-3 border-b border-white/10"
                >
                  Packages
                </Link>
                <Link 
                  href="/contact" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center px-6 py-3 bg-[#d4af37] text-white font-lato text-sm uppercase tracking-[0.2em] hover:bg-white hover:text-[#1a1a1a] transition-all duration-300 mt-2"
                >
                  Contact
                </Link>
                {/* Mobile Social Links */}
                <div className="flex items-center justify-center space-x-4 pt-4 border-t border-white/10">
                  <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 flex items-center justify-center bg-white/10 border border-white/20 text-white hover:bg-[#d4af37] hover:border-[#d4af37] transition-all duration-300">
                    <FiInstagram className="w-5 h-5" />
                  </a>
                  <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 flex items-center justify-center bg-white/10 border border-white/20 text-white hover:bg-[#d4af37] hover:border-[#d4af37] transition-all duration-300">
                    <FiFacebook className="w-5 h-5" />
                  </a>
                  <a href="mailto:contact@aminossphotography.com" className="w-10 h-10 flex items-center justify-center bg-white/10 border border-white/20 text-white hover:bg-[#d4af37] hover:border-[#d4af37] transition-all duration-300">
                    <FiMail className="w-5 h-5" />
                  </a>
                  <a href="tel:+1234567890" className="w-10 h-10 flex items-center justify-center bg-white/10 border border-white/20 text-white hover:bg-[#d4af37] hover:border-[#d4af37] transition-all duration-300">
                    <FiPhone className="w-5 h-5" />
                  </a>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
      <div className="relative w-full h-full">
        <AnimatePresence mode="wait">
          {images.length > 0 && (
            <motion.div key={currentSlide} initial={{ opacity: 0, scale: 1.1 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 1.5, ease: 'easeInOut' }} className="absolute inset-0">
              <Image src={images[currentSlide]?.url || '/placeholder.jpg'} alt={images[currentSlide]?.title || 'Portfolio'} fill className="object-cover" priority={currentSlide === 0} quality={90} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
            </motion.div>
          )}
        </AnimatePresence>
        {images.length > 1 && (<>
          <button 
            onClick={prevSlide} 
            className="absolute left-2 sm:left-4 lg:left-6 top-1/2 -translate-y-1/2 z-40 w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-[#d4af37] hover:border-[#d4af37] transition-all duration-300 group touch-manipulation" 
            aria-label="Previous"
          >
            <FiChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 group-hover:transform group-hover:-translate-x-1 transition-transform" />
          </button>
          <button 
            onClick={nextSlide} 
            className="absolute right-2 sm:right-4 lg:right-6 top-1/2 -translate-y-1/2 z-40 w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-[#d4af37] hover:border-[#d4af37] transition-all duration-300 group touch-manipulation" 
            aria-label="Next"
          >
            <FiChevronRight className="w-5 h-5 sm:w-6 sm:h-6 group-hover:transform group-hover:translate-x-1 transition-transform" />
          </button>
          <div className="absolute bottom-4 sm:bottom-6 lg:bottom-8 left-1/2 -translate-x-1/2 z-40 flex items-center space-x-2 sm:space-x-3">
            {images.map((_, index) => (
              <button 
                key={index} 
                onClick={() => goToSlide(index)} 
                className={`transition-all duration-300 touch-manipulation ${index === currentSlide ? 'w-6 sm:w-8 h-1.5 sm:h-2 bg-[#d4af37]' : 'w-1.5 sm:w-2 h-1.5 sm:h-2 bg-white/50 hover:bg-white/80'}`} 
                aria-label={`Slide ${index + 1}`} 
              />
            ))}
          </div>
        </>)}
      </div>
      <motion.div 
        initial={{ opacity: 0, y: 50 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 1, delay: 2.2 }} 
        className="absolute inset-0 flex flex-col items-center justify-center z-30 text-center px-4 sm:px-6"
      >
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl 2xl:text-8xl font-playfair font-bold text-white mb-4 sm:mb-6 leading-tight">
          Capturing Life's
          <br />
          Beautiful Moments
        </h1>
        
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: '60px' }}
          transition={{ duration: 0.8, delay: 2.5 }}
          className="h-[2px] bg-[#d4af37] mb-6 sm:mb-8"
        />

        <p className="text-sm sm:text-base md:text-lg lg:text-xl text-white/90 font-lato max-w-xl lg:max-w-2xl mb-8 sm:mb-10 lg:mb-12 leading-relaxed px-4">
          Professional photography that tells your unique story through artistry and passion
        </p>

        <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-3 sm:gap-4 w-full max-w-md sm:max-w-none px-4">
          <button
            onClick={() => setTheme('professional')}
            className="w-full sm:w-auto px-8 sm:px-10 py-3 sm:py-4 bg-[#d4af37] text-white font-lato text-xs sm:text-sm uppercase tracking-[0.2em] hover:bg-white hover:text-[#1a1a1a] transition-all duration-300 inline-flex items-center justify-center gap-2 touch-manipulation"
          >
            <FiLayers className="w-4 h-4" />
            Professional Mode
          </button>
          <button
            onClick={() => setTheme('simple')}
            className="w-full sm:w-auto px-8 sm:px-10 py-3 sm:py-4 bg-white/10 backdrop-blur-sm border-2 border-white text-white font-lato text-xs sm:text-sm uppercase tracking-[0.2em] hover:bg-white hover:text-[#1a1a1a] transition-all duration-300 inline-flex items-center justify-center gap-2 touch-manipulation"
          >
            <FiGrid className="w-4 h-4" />
            Simple Mode
          </button>
        </div>
      </motion.div>
      {/* Social Links - Bottom Left (Desktop Only) */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 2.8 }}
        className="fixed bottom-4 left-4 sm:bottom-6 sm:left-6 lg:bottom-8 lg:left-8 z-40 hidden lg:flex flex-col space-y-4"
      >
        <a
          href="https://instagram.com"
          target="_blank"
          rel="noopener noreferrer"
          className="w-10 h-10 flex items-center justify-center bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-[#d4af37] hover:border-[#d4af37] transition-all duration-300"
        >
          <FiInstagram className="w-5 h-5" />
        </a>
        <a
          href="https://facebook.com"
          target="_blank"
          rel="noopener noreferrer"
          className="w-10 h-10 flex items-center justify-center bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-[#d4af37] hover:border-[#d4af37] transition-all duration-300"
        >
          <FiFacebook className="w-5 h-5" />
        </a>
        <a
          href="mailto:contact@aminossphotography.com"
          className="w-10 h-10 flex items-center justify-center bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-[#d4af37] hover:border-[#d4af37] transition-all duration-300"
        >
          <FiMail className="w-5 h-5" />
        </a>
        <a
          href="tel:+1234567890"
          className="w-10 h-10 flex items-center justify-center bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-[#d4af37] hover:border-[#d4af37] transition-all duration-300"
        >
          <FiPhone className="w-5 h-5" />
        </a>
      </motion.div>

      {/* Copyright - Bottom Right (Desktop Only) */}
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 2.8 }}
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 lg:bottom-8 lg:right-8 z-40 text-white/70 font-lato text-xs sm:text-sm hidden lg:block"
      >
        © 2025 Aminoss Photography
      </motion.div>
      <style jsx global>{`
        .novo-fullscreen-home {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          overflow: hidden;
        }

        body:has(.novo-fullscreen-home) {
          overflow: hidden;
          touch-action: pan-y pinch-zoom;
        }

        /* Mobile optimizations */
        @media (max-width: 768px) {
          .novo-fullscreen-home {
            height: 100dvh; /* Use dynamic viewport height for mobile */
          }
        }

        /* Prevent iOS bounce scroll */
        html, body {
          overscroll-behavior: none;
        }

        /* Touch-friendly targets */
        .touch-manipulation {
          touch-action: manipulation;
          -webkit-tap-highlight-color: transparent;
        }
      `}</style>
    </div>
  );
}
