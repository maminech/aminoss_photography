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

  // Prevent hydration errors and ensure component is mounted
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const loadImages = async () => {
      try {
        const res = await fetch('/api/admin/images?featured=true&limit=10');
        if (res.ok) {
          const data = await res.json();
          // Ensure we have valid data
          if (Array.isArray(data) && data.length > 0) {
            setImages(data);
          } else {
            // Fallback: load any images if no featured ones
            const fallbackRes = await fetch('/api/admin/images?limit=10');
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
    <div className="novo-professional-home min-h-screen bg-white overflow-y-auto">
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
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* Hero Section with Slider */}
      <section className="relative w-full h-screen min-h-[600px]">
        {/* Image Slider Background */}
        <div className="absolute inset-0">
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

          {/* Slider Controls */}
          {images.length > 1 && (
            <>
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
            </>
          )}
        </div>

        {/* Hero Content */}
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
              className="w-full sm:w-auto px-8 sm:px-10 py-3 sm:py-4 bg-[#d4af37] text-white font-lato text-xs sm:text-sm uppercase tracking-[0.2em] hover:bg-white hover:text-[#1a1a1a] transition-all duration-300 inline-flex items-center justify-center gap-2 touch-manipulation disabled:opacity-50"
            >
              <FiGrid className="w-4 h-4" />
              {isTransitioning ? 'Switching...' : 'Simple Mode'}
            </motion.button>
            <button
              onClick={() => {
                try {
                  switchTheme('professional');
                } catch (error) {
                  console.error('Error switching theme:', error);
                }
              }}
              className="w-full sm:w-auto px-8 sm:px-10 py-3 sm:py-4 bg-white/10 backdrop-blur-sm border-2 border-white text-white font-lato text-xs sm:text-sm uppercase tracking-[0.2em] hover:bg-white hover:text-[#1a1a1a] transition-all duration-300 inline-flex items-center justify-center gap-2 touch-manipulation"
            >
              <FiLayers className="w-4 h-4" />
              Professional Mode
            </button>
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
        © 2025 Innov8 Production
      </motion.div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 3, repeat: Infinity, repeatType: 'reverse', repeatDelay: 1 }}
        className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40 flex flex-col items-center text-white/70"
      >
        <span className="text-xs uppercase tracking-widest mb-2 font-lato">Scroll Down</span>
        <FiChevronRight className="w-5 h-5 rotate-90" />
      </motion.div>

      {/* Gallery Preview Section */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 1 }}
        viewport={{ once: true }}
        className="relative bg-white py-20 lg:py-32"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-12">
          <div className="text-center mb-12 lg:mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-3xl sm:text-4xl lg:text-5xl font-playfair font-bold text-[#1a1a1a] mb-4"
            >
              Featured Portfolio
            </motion.h2>
            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: '60px' }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
              className="h-[2px] bg-[#d4af37] mx-auto mb-6"
            />
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              viewport={{ once: true }}
              className="text-gray-600 font-lato text-lg max-w-2xl mx-auto"
            >
              Explore our most captivating work, where every frame tells a unique story
            </motion.p>
          </div>

          {/* Gallery Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6 mb-12">
            {images.length > 0 ? (
              images.slice(0, 8).map((image, index) => (
                <motion.div
                  key={image?.id || `img-${index}`}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="relative aspect-[3/4] group cursor-pointer overflow-hidden"
                >
                  <Image
                    src={image?.url || '/placeholder.jpg'}
                    alt={image?.title || 'Gallery image'}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                    sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    onError={(e) => {
                      e.currentTarget.src = '/placeholder.jpg';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-6">
                    <div>
                      <h3 className="text-white font-playfair text-lg font-semibold mb-1">{image?.title || 'Untitled'}</h3>
                      <p className="text-white/80 font-lato text-sm">{image?.category || 'Photography'}</p>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              // Show placeholder gallery when no images
              <div className="col-span-full text-center py-12 text-gray-500">
                <p className="text-lg font-playfair">No gallery images available yet</p>
                <p className="text-sm font-lato mt-2">Check back soon for stunning portfolio work!</p>
              </div>
            )}
          </div>

          {/* View All Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <Link
              href="/gallery"
              className="inline-block px-10 py-4 bg-[#d4af37] text-white font-lato text-sm uppercase tracking-[0.2em] hover:bg-[#1a1a1a] transition-all duration-300"
            >
              View Full Gallery
            </Link>
          </motion.div>
        </div>
      </motion.section>

      {/* About Section */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 1 }}
        viewport={{ once: true }}
        className="relative bg-[#f8f8f8] py-20 lg:py-32"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-12">
          <div className="grid md:grid-cols-2 gap-12 lg:gap-20 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-playfair font-bold text-[#1a1a1a] mb-6">
                About Our Studio
              </h2>
              <div className="w-16 h-[2px] bg-[#d4af37] mb-8" />
              <p className="text-gray-600 font-lato text-lg leading-relaxed mb-6">
                With over a decade of experience, we specialize in capturing authentic moments that become timeless memories. Our passion for photography drives us to create stunning visual narratives.
              </p>
              <p className="text-gray-600 font-lato text-lg leading-relaxed mb-8">
                From intimate weddings to corporate events, we bring creativity, professionalism, and an artistic eye to every project.
              </p>
              <Link
                href="/about"
                className="inline-block px-10 py-4 border-2 border-[#1a1a1a] text-[#1a1a1a] font-lato text-sm uppercase tracking-[0.2em] hover:bg-[#1a1a1a] hover:text-white transition-all duration-300"
              >
                Learn More
              </Link>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="relative aspect-[4/5] overflow-hidden bg-gray-200"
            >
              {images.length > 0 && images[0] ? (
                <Image
                  src={images[0].url}
                  alt="About us"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  onError={(e) => {
                    e.currentTarget.src = '/placeholder.jpg';
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300">
                  <svg className="w-20 h-20 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
                  </svg>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Footer */}
      <footer className="bg-[#1a1a1a] text-white py-12 lg:py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-8">
            <div>
              <h3 className="text-2xl font-playfair font-bold mb-4">INNOV8 PRODUCTION</h3>
              <p className="text-white/70 font-lato text-sm leading-relaxed">
                Creative wedding and event photography studio based in Moknine, Sousse, Tunisia. Led by Aymen Ben Ammar.
              </p>
            </div>
            <div>
              <h4 className="text-lg font-playfair font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 font-lato text-sm">
                <li><Link href="/gallery" className="text-white/70 hover:text-[#d4af37] transition-colors">Gallery</Link></li>
                <li><Link href="/videos" className="text-white/70 hover:text-[#d4af37] transition-colors">Videos</Link></li>
                <li><Link href="/about" className="text-white/70 hover:text-[#d4af37] transition-colors">About</Link></li>
                <li><Link href="/contact" className="text-white/70 hover:text-[#d4af37] transition-colors">Contact</Link></li>
                <li><Link href="/admin/dashboard" className="text-white/70 hover:text-[#d4af37] transition-colors">Admin</Link></li>
                <li><Link href="/client/login" className="text-white/70 hover:text-[#d4af37] transition-colors">Client Portal</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-playfair font-semibold mb-4">Connect</h4>
              <div className="flex space-x-4 mb-6">
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 flex items-center justify-center border border-white/20 text-white hover:bg-[#d4af37] hover:border-[#d4af37] transition-all">
                  <FiInstagram className="w-5 h-5" />
                </a>
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 flex items-center justify-center border border-white/20 text-white hover:bg-[#d4af37] hover:border-[#d4af37] transition-all">
                  <FiFacebook className="w-5 h-5" />
                </a>
                <a href="mailto:innov8production@gmail.com" className="w-10 h-10 flex items-center justify-center border border-white/20 text-white hover:bg-[#d4af37] hover:border-[#d4af37] transition-all">
                  <FiMail className="w-5 h-5" />
                </a>
              </div>
              <p className="text-white/70 font-lato text-sm">
                Email: innov8production@gmail.com<br />
                WhatsApp: +216 55985565
              </p>
            </div>
          </div>
          <div className="border-t border-white/10 pt-8 text-center">
            <p className="text-white/50 font-lato text-sm">© 2025 Innov8 Production. All rights reserved.</p>
          </div>
        </div>
      </footer>

      <style jsx global>{`
        .novo-professional-home {
          scroll-behavior: smooth;
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
