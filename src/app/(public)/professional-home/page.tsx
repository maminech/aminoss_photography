'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { FiChevronLeft, FiChevronRight, FiInstagram, FiFacebook, FiMail, FiPhone, FiMenu, FiX, FiGrid, FiLayers } from 'react-icons/fi';
import { useLayoutTheme } from '@/contexts/ThemeContext';

export default function ProfessionalHomePage() {
  const router = useRouter();
  const { currentTheme, switchTheme } = useLayoutTheme();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [images, setImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [backgroundVideo, setBackgroundVideo] = useState<string | null>(null);
  const [videoLoading, setVideoLoading] = useState(true);
  const [videoPoster, setVideoPoster] = useState<string | null>(null);

  // Prevent hydration errors and ensure component is mounted
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const loadImages = async () => {
      try {
        // Load only photos marked for professional mode
        const res = await fetch('/api/admin/images?professionalMode=true&limit=10');
        if (res.ok) {
          const data = await res.json();
          // Ensure we have valid data
          if (Array.isArray(data) && data.length > 0) {
            setImages(data);
          } else {
            // Fallback: load featured images if no professional mode images yet
            const fallbackRes = await fetch('/api/admin/images?featured=true&limit=10');
            if (fallbackRes.ok) {
              const fallbackData = await fallbackRes.json();
              setImages(Array.isArray(fallbackData) ? fallbackData : []);
            }
          }
        }
      } catch (error) {
        console.error('Error loading images:', error);
        // Continue with empty array - won't crash
        setImages([]);
      } finally {
        setLoading(false);
      }
    };
    loadImages();
  }, []);

  // Load background video
  useEffect(() => {
    const loadBackgroundVideo = async () => {
      try {
        console.log('Fetching background video...');
        // Fetch the video specifically marked as background video
        const res = await fetch('/api/videos?backgroundVideo=true&limit=1', {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache',
          },
        });
        console.log('Background video response status:', res.status);
        
        if (res.ok) {
          const data = await res.json();
          console.log('Background video data:', data);
          
          if (data && data.length > 0 && data[0].url) {
            console.log('Setting background video:', data[0].url);
            setBackgroundVideo(data[0].url);
            setVideoPoster(data[0].thumbnailUrl || null);
            setVideoLoading(false);
          } else {
            console.log('No background video found in response');
            setVideoLoading(false);
          }
        } else {
          console.error('Failed to fetch background video:', res.status);
          setVideoLoading(false);
        }
      } catch (error) {
        console.error('Error loading background video:', error);
        setVideoLoading(false);
      }
    };
    loadBackgroundVideo();
  }, []);

  useEffect(() => {
    if (images.length === 0) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [images.length]);

  const nextSlide = () => {
    if (images.length > 0) {
      setCurrentSlide((prev) => (prev + 1) % images.length);
    }
  };
  
  const prevSlide = () => {
    if (images.length > 0) {
      setCurrentSlide((prev) => (prev - 1 + images.length) % images.length);
    }
  };
  
  const goToSlide = (index: number) => {
    if (images.length > 0 && index >= 0 && index < images.length) {
      setCurrentSlide(index);
    }
  };

  // Don't render if not mounted (prevent hydration errors)
  if (!mounted) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white z-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#d4af37] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-lato">Initializing...</p>
        </div>
      </div>
    );
  }

  // Don't render if not in professional mode
  if (currentTheme !== 'professional') {
    return null;
  }

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
    <div className="novo-professional-home fixed inset-0 bg-white overflow-hidden">
      {/* Background Video Layer */}
      {backgroundVideo && (
        <div className="fixed inset-0 z-0">
          {/* Video Loading Placeholder */}
          {videoLoading && videoPoster && (
            <div className="absolute inset-0 bg-black">
              <Image 
                src={videoPoster} 
                alt="Loading video..." 
                fill 
                className="object-cover" 
                style={{ filter: 'brightness(0.7)' }}
                priority
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-16 border-4 border-[#d4af37] border-t-transparent rounded-full animate-spin" />
              </div>
            </div>
          )}
          
          <video
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            poster={videoPoster || undefined}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${videoLoading ? 'opacity-0' : 'opacity-100'}`}
            style={{ filter: 'brightness(0.7)' }}
            onLoadStart={() => {
              setVideoLoading(true);
            }}
            onCanPlay={() => {
              setVideoLoading(false);
            }}
          >
            <source src={backgroundVideo} type="video/mp4" />
          </video>
          {/* Elegant Overlay Gradient */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/60" />
          {/* Vignette Effect */}
          <div className="absolute inset-0 bg-radial-gradient from-transparent via-transparent to-black/50" />
        </div>
      )}

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
              INNOV8
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
                href="/admin/dashboard" 
                className="text-white hover:text-[#d4af37] transition-colors font-lato text-xs lg:text-sm uppercase tracking-[0.2em]"
              >
                Admin
              </Link>
              <Link 
                href="/client/login" 
                className="text-white hover:text-[#d4af37] transition-colors font-lato text-xs lg:text-sm uppercase tracking-[0.2em]"
              >
                Client
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
        {mobileMenuOpen && (
          <div className="md:hidden bg-black/95 backdrop-blur-lg animate-fade-in">
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
                  href="/admin/dashboard" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-white hover:text-[#d4af37] transition-colors font-lato text-sm uppercase tracking-[0.2em] py-3 border-b border-white/10"
                >
                  Admin Dashboard
                </Link>
                <Link 
                  href="/client/login" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-white hover:text-[#d4af37] transition-colors font-lato text-sm uppercase tracking-[0.2em] py-3 border-b border-white/10"
                >
                  Client Portal
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
                  <a href="mailto:innov8production@gmail.com" className="w-10 h-10 flex items-center justify-center bg-white/10 border border-white/20 text-white hover:bg-[#d4af37] hover:border-[#d4af37] transition-all duration-300">
                    <FiMail className="w-5 h-5" />
                  </a>
                  <a href="tel:+21655985565" className="w-10 h-10 flex items-center justify-center bg-white/10 border border-white/20 text-white hover:bg-[#d4af37] hover:border-[#d4af37] transition-all duration-300">
                    <FiPhone className="w-5 h-5" />
                  </a>
                </div>
              </div>
          </div>
        )}
      </motion.nav>

      {/* Hero Section with Slider - Full Screen */}
      <section className="fixed inset-0 w-full h-full z-10">
        {/* Content is positioned above the background video */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Slider only visible if no background video */}
          {!backgroundVideo && (
            <AnimatePresence mode="wait">
              {images.length > 0 && images[currentSlide] ? (
                <motion.div 
                  key={currentSlide} 
                  initial={{ opacity: 0, scale: 1.1 }} 
                  animate={{ opacity: 1, scale: 1 }} 
                  exit={{ opacity: 0, scale: 0.95 }} 
                  transition={{ duration: 1.5, ease: 'easeInOut' }} 
                  className="absolute inset-0"
                >
                  <Image 
                    src={images[currentSlide]?.url || '/placeholder.jpg'} 
                    alt={images[currentSlide]?.title || 'Portfolio'} 
                    fill 
                    className="object-cover" 
                    priority={currentSlide === 0} 
                    quality={90}
                    onError={(e) => {
                      // Fallback on image load error
                      e.currentTarget.src = '/placeholder.jpg';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                </motion.div>
              ) : (
                // Fallback when no images available
                <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-black">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center text-white/20">
                      <svg className="w-32 h-32 mx-auto mb-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
                      </svg>
                      <p className="text-lg font-playfair">No images available</p>
                    </div>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                </div>
              )}
            </AnimatePresence>
          )}

          {/* Slider Controls - Only show when no video background */}
          {!backgroundVideo && images.length > 1 && (
            <>
              <button 
                onClick={prevSlide} 
                className="absolute left-2 sm:left-4 lg:left-6 top-1/2 -translate-y-1/2 z-40 w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-[#d4af37] hover:border-[#d4af37] transition-all duration-300 group touch-manipulation pointer-events-auto" 
                aria-label="Previous"
              >
                <FiChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 group-hover:transform group-hover:-translate-x-1 transition-transform" />
              </button>
              <button 
                onClick={nextSlide} 
                className="absolute right-2 sm:right-4 lg:right-6 top-1/2 -translate-y-1/2 z-40 w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-[#d4af37] hover:border-[#d4af37] transition-all duration-300 group touch-manipulation pointer-events-auto" 
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
            </>
          )}
        </div>

        {/* Hero Content */}
        <motion.div 
          initial={{ opacity: 0, y: 50 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 1, delay: 2.2 }} 
          className="absolute inset-0 flex flex-col items-center justify-center z-30 text-center px-4 sm:px-6 pointer-events-none"
        >
          <div className="pointer-events-auto">
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
            {/* Demande de Devis Button - Primary CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full sm:w-auto"
            >
              <Link
                href="/booking"
                className="group relative w-full sm:w-auto px-8 sm:px-10 py-3 sm:py-4 bg-[#d4af37] text-white font-lato text-xs sm:text-sm uppercase tracking-[0.2em] hover:bg-white hover:text-[#1a1a1a] transition-all duration-300 inline-flex items-center justify-center gap-2 touch-manipulation overflow-hidden font-semibold"
              >
                {/* Shine effect */}
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                
                {/* Text */}
                <span className="relative z-10">Demande de Devis</span>
                
                {/* Arrow */}
                <FiChevronRight className="w-4 h-4 relative z-10 group-hover:translate-x-1 transition-transform duration-300" />
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full sm:w-auto"
            >
              <Link
                href="/gallery"
                className="group relative w-full sm:w-auto px-8 sm:px-10 py-3 sm:py-4 bg-white/10 backdrop-blur-md border-2 border-white/30 text-white font-lato text-xs sm:text-sm uppercase tracking-[0.2em] hover:bg-[#d4af37] hover:border-[#d4af37] transition-all duration-500 inline-flex items-center justify-center gap-2 touch-manipulation overflow-hidden"
              >
                {/* Animated background */}
                <span className="absolute inset-0 bg-gradient-to-r from-[#d4af37]/0 via-[#d4af37]/20 to-[#d4af37]/0 transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                
                {/* Icon */}
                <FiGrid className="w-4 h-4 relative z-10 group-hover:rotate-90 transition-transform duration-500" />
                
                {/* Text */}
                <span className="relative z-10 font-semibold">Explore Gallery</span>
                
                {/* Arrow */}
                <FiChevronRight className="w-4 h-4 relative z-10 group-hover:translate-x-1 transition-transform duration-300" />
              </Link>
            </motion.div>
            
            <motion.button
              onClick={async () => {
                try {
                  setIsTransitioning(true);
                  await new Promise(resolve => setTimeout(resolve, 300));
                  switchTheme('simple');
                  router.push('/');
                } catch (error) {
                  console.error('Error switching theme:', error);
                  setIsTransitioning(false);
                }
              }}
              disabled={isTransitioning}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full sm:w-auto px-8 sm:px-10 py-3 sm:py-4 bg-white/10 backdrop-blur-md border-2 border-white/30 text-white font-lato text-xs sm:text-sm uppercase tracking-[0.2em] hover:bg-white hover:text-[#1a1a1a] transition-all duration-300 inline-flex items-center justify-center gap-2 touch-manipulation disabled:opacity-50"
            >
              <FiGrid className="w-4 h-4" />
              {isTransitioning ? 'Switching...' : 'Switch to Simple Mode'}
            </motion.button>
          </div>
          </div>
        </motion.div>
      </section>


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
          href="mailto:innov8production@gmail.com"
          className="w-10 h-10 flex items-center justify-center bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-[#d4af37] hover:border-[#d4af37] transition-all duration-300"
        >
          <FiMail className="w-5 h-5" />
        </a>
        <a
          href="tel:+21655985565"
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
        &copy; 2025 Innov8 Production
      </motion.div>

    </div>
  );
}
