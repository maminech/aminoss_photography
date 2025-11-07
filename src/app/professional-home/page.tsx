'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';
import { FiInstagram, FiFacebook, FiTwitter, FiPhone, FiMail, FiMapPin } from 'react-icons/fi';
import { useLayoutTheme } from '@/contexts/ThemeContext';

export default function ProfessionalHomePage() {
  const { currentTheme } = useLayoutTheme();
  const [images, setImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Only render this page when Professional theme is active
  if (currentTheme !== 'professional') {
    return null;
  }

  useEffect(() => {
    const loadImages = async () => {
      try {
        const res = await fetch('/api/admin/images?featured=true&limit=30');
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

  const categories = [
    { id: 'all', name: 'All', count: images.length },
    { id: 'portraits', name: 'Portraits', count: images.filter(img => img.category === 'portraits').length },
    { id: 'fashion', name: 'Fashion', count: images.filter(img => img.category === 'fashion').length },
    { id: 'lifestyle', name: 'Lifestyle', count: images.filter(img => img.category === 'lifestyle').length },
    { id: 'nature', name: 'Nature', count: images.filter(img => img.category === 'nature').length },
    { id: 'studio', name: 'Studio', count: images.filter(img => img.category === 'studio').length },
  ];

  const filteredImages = activeCategory === 'all' 
    ? images 
    : images.filter(img => img.category === activeCategory);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 80; // Header height
      const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
      window.scrollTo({
        top: elementPosition - offset,
        behavior: 'smooth'
      });
    }
    setIsMenuOpen(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#d4af37] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-lato">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="novo-one-page bg-white">
      {/* Fixed Navigation */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, delay: 1.8 }}
        className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100"
      >
        <div className="container mx-auto px-6 lg:px-12">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 2 }}
              className="text-2xl font-playfair font-bold tracking-tight text-[#1a1a1a]"
            >
              AMINOSS
            </motion.div>

            {/* Desktop Menu */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 2.2 }}
              className="hidden md:flex items-center gap-10"
            >
              <button onClick={() => scrollToSection('home')} className="text-sm uppercase tracking-[0.2em] font-lato font-medium text-gray-700 hover:text-[#d4af37] transition-colors duration-300">
                Home
              </button>
              <button onClick={() => scrollToSection('about')} className="text-sm uppercase tracking-[0.2em] font-lato font-medium text-gray-700 hover:text-[#d4af37] transition-colors duration-300">
                About
              </button>
              <button onClick={() => scrollToSection('portfolio')} className="text-sm uppercase tracking-[0.2em] font-lato font-medium text-gray-700 hover:text-[#d4af37] transition-colors duration-300">
                Portfolio
              </button>
              <button onClick={() => scrollToSection('categories')} className="text-sm uppercase tracking-[0.2em] font-lato font-medium text-gray-700 hover:text-[#d4af37] transition-colors duration-300">
                Categories
              </button>
              <button onClick={() => scrollToSection('contact')} className="text-sm uppercase tracking-[0.2em] font-lato font-medium text-gray-700 hover:text-[#d4af37] transition-colors duration-300">
                Contact
              </button>
            </motion.div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden w-10 h-10 flex flex-col items-center justify-center gap-1.5"
            >
              <span className={`w-6 h-0.5 bg-[#1a1a1a] transition-transform duration-300 ${isMenuOpen ? 'rotate-45 translate-y-2' : ''}`} />
              <span className={`w-6 h-0.5 bg-[#1a1a1a] transition-opacity duration-300 ${isMenuOpen ? 'opacity-0' : ''}`} />
              <span className={`w-6 h-0.5 bg-[#1a1a1a] transition-transform duration-300 ${isMenuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden bg-white border-t border-gray-100"
          >
            <div className="container mx-auto px-6 py-6 flex flex-col gap-4">
              <button onClick={() => scrollToSection('home')} className="text-sm uppercase tracking-[0.2em] font-lato font-medium text-gray-700 hover:text-[#d4af37] transition-colors text-left">
                Home
              </button>
              <button onClick={() => scrollToSection('about')} className="text-sm uppercase tracking-[0.2em] font-lato font-medium text-gray-700 hover:text-[#d4af37] transition-colors text-left">
                About
              </button>
              <button onClick={() => scrollToSection('portfolio')} className="text-sm uppercase tracking-[0.2em] font-lato font-medium text-gray-700 hover:text-[#d4af37] transition-colors text-left">
                Portfolio
              </button>
              <button onClick={() => scrollToSection('categories')} className="text-sm uppercase tracking-[0.2em] font-lato font-medium text-gray-700 hover:text-[#d4af37] transition-colors text-left">
                Categories
              </button>
              <button onClick={() => scrollToSection('contact')} className="text-sm uppercase tracking-[0.2em] font-lato font-medium text-gray-700 hover:text-[#d4af37] transition-colors text-left">
                Contact
              </button>
            </div>
          </motion.div>
        )}
      </motion.nav>

      {/* Hero Section - Full Screen with Parallax */}
      <section id="home" className="relative h-screen min-h-[600px] flex items-center justify-center overflow-hidden">
        {/* Background Image with Parallax */}
        <motion.div
          initial={{ scale: 1.2, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.5, ease: [0.4, 0, 0.2, 1] }}
          className="absolute inset-0"
        >
          {images[0] && (
            <Image
              src={images[0].url}
              alt="Hero Background"
              fill
              className="object-cover"
              priority
              quality={90}
            />
          )}
          <div className="absolute inset-0 bg-black/40" />
        </motion.div>

        {/* Hero Content */}
        <div className="relative z-10 container mx-auto px-6 text-center text-white">
          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="text-5xl md:text-7xl lg:text-8xl font-playfair font-bold mb-6 leading-tight"
          >
            My name is Aminoss,
            <br />
            I'm a photographer.
          </motion.h1>
          
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: '80px', opacity: 1 }}
            transition={{ duration: 0.8, delay: 1 }}
            className="h-[1px] bg-[#d4af37] mx-auto mb-8"
          />

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.2 }}
            className="text-lg md:text-xl lg:text-2xl font-lato font-light max-w-3xl mx-auto leading-relaxed"
          >
            The world without photography will be meaningless to us if there is no light and color, which opens up our minds and expresses passion.
          </motion.p>

          {/* Scroll Indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1.8 }}
            className="absolute bottom-10 left-1/2 -translate-x-1/2"
          >
            <motion.button
              onClick={() => scrollToSection('about')}
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
              className="flex flex-col items-center gap-2 text-white/70 hover:text-white transition-colors"
            >
              <span className="text-xs uppercase tracking-[0.2em] font-lato">Scroll</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-24 md:py-32 bg-white">
        <div className="container mx-auto px-6 max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-playfair font-bold text-[#1a1a1a] mb-8 leading-tight">
              About Me
            </h2>
            
            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: '60px' }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="h-[1px] bg-[#d4af37] mx-auto mb-12"
            />

            <p className="text-lg md:text-xl text-gray-700 font-lato leading-relaxed max-w-4xl mx-auto mb-12">
              Photography is more than just capturing moments—it's about telling stories, evoking emotions, 
              and preserving memories that last a lifetime. With years of experience and a passion for visual 
              storytelling, I specialize in creating stunning images that reflect the beauty and authenticity 
              of every subject.
            </p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <Link 
                href="/about"
                className="inline-block px-8 py-3 bg-transparent border border-[#1a1a1a] text-[#1a1a1a] font-lato font-medium text-sm uppercase tracking-[0.2em] hover:bg-[#1a1a1a] hover:text-white transition-all duration-300"
              >
                Read More
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Latest Photos Section */}
      <section id="portfolio" className="py-24 md:py-32 bg-gray-50">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-playfair font-bold text-[#1a1a1a] mb-8">
              Latest Photos
            </h2>
            
            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: '60px' }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="h-[1px] bg-[#d4af37] mx-auto"
            />
          </motion.div>

          {/* Photo Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {images.slice(0, 6).map((image, index) => (
              <motion.div
                key={image.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="group relative aspect-square overflow-hidden bg-gray-200"
              >
                <Image
                  src={image.url}
                  alt={image.title || `Photo ${index + 1}`}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
                
                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <div className="text-center text-white">
                    <h3 className="text-xl font-playfair font-bold mb-2">
                      {image.title || `Photo ${index + 1}`}
                    </h3>
                    <p className="text-sm font-lato uppercase tracking-[0.2em] text-[#d4af37]">
                      {image.category || 'Photography'}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* View All Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-center mt-16"
          >
            <Link 
              href="/gallery"
              className="inline-block px-10 py-4 bg-[#1a1a1a] text-white font-lato font-medium text-sm uppercase tracking-[0.2em] hover:bg-[#d4af37] transition-all duration-300"
            >
              View All Photos
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Categories Section */}
      <section id="categories" className="py-24 md:py-32 bg-white">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-playfair font-bold text-[#1a1a1a] mb-8">
              Categories
            </h2>
            
            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: '60px' }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="h-[1px] bg-[#d4af37] mx-auto mb-12"
            />

            {/* Category Filter Buttons */}
            <div className="flex flex-wrap justify-center gap-4 mb-12">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`px-6 py-2 font-lato font-medium text-sm uppercase tracking-[0.2em] transition-all duration-300 ${
                    activeCategory === category.id
                      ? 'text-[#d4af37] border-b-2 border-[#d4af37]'
                      : 'text-gray-600 hover:text-[#1a1a1a]'
                  }`}
                >
                  {category.name}
                  <span className="ml-2 text-xs">({category.count})</span>
                </button>
              ))}
            </div>
          </motion.div>

          {/* Filtered Photos Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {filteredImages.slice(0, 9).map((image, index) => (
              <motion.div
                key={`${image.id}-${index}`}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                className="group relative aspect-[4/5] overflow-hidden bg-gray-200"
              >
                <Image
                  src={image.url}
                  alt={image.title || `Photo ${index + 1}`}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
                
                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <div className="text-center text-white p-6">
                    <h3 className="text-lg font-playfair font-bold mb-2">
                      {image.title || 'Untitled'}
                    </h3>
                    <div className="w-12 h-[1px] bg-[#d4af37] mx-auto mb-3" />
                    <p className="text-xs font-lato uppercase tracking-[0.2em] text-gray-300">
                      {image.category || 'Photography'}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-24 md:py-32 bg-gray-50">
        <div className="container mx-auto px-6 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-playfair font-bold text-[#1a1a1a] mb-8">
              Contact
            </h2>
            
            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: '60px' }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="h-[1px] bg-[#d4af37] mx-auto mb-12"
            />

            <p className="text-lg md:text-xl text-gray-700 font-lato leading-relaxed mb-12">
              Ready to capture your story? Let's create something beautiful together.
            </p>
          </motion.div>

          {/* Contact Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 mb-12">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="flex flex-col items-center text-center"
            >
              <div className="w-16 h-16 rounded-full bg-[#d4af37] flex items-center justify-center mb-4">
                <FiPhone className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-playfair font-bold text-[#1a1a1a] mb-2">Phone</h3>
              <a 
                href="tel:+1234567890"
                className="text-gray-700 font-lato hover:text-[#d4af37] transition-colors"
              >
                +1 (800) 456 37 11
              </a>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="flex flex-col items-center text-center"
            >
              <div className="w-16 h-16 rounded-full bg-[#d4af37] flex items-center justify-center mb-4">
                <FiMail className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-playfair font-bold text-[#1a1a1a] mb-2">Email</h3>
              <a 
                href="mailto:contact@aminossphotography.com"
                className="text-gray-700 font-lato hover:text-[#d4af37] transition-colors"
              >
                contact@aminossphotography.com
              </a>
            </motion.div>
          </div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Link 
              href="/contact"
              className="inline-block px-10 py-4 bg-[#1a1a1a] text-white font-lato font-medium text-sm uppercase tracking-[0.2em] hover:bg-[#d4af37] transition-all duration-300"
            >
              Send Message
            </Link>
            <Link 
              href="/booking"
              className="inline-block px-10 py-4 bg-transparent border border-[#1a1a1a] text-[#1a1a1a] font-lato font-medium text-sm uppercase tracking-[0.2em] hover:bg-[#1a1a1a] hover:text-white transition-all duration-300"
            >
              Book Session
            </Link>
          </motion.div>

          {/* Social Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex justify-center gap-6 mt-12"
          >
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-12 h-12 rounded-full border-2 border-gray-300 flex items-center justify-center text-gray-600 hover:bg-[#d4af37] hover:border-[#d4af37] hover:text-white transition-all duration-300"
            >
              <FiInstagram className="w-5 h-5" />
            </a>
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-12 h-12 rounded-full border-2 border-gray-300 flex items-center justify-center text-gray-600 hover:bg-[#d4af37] hover:border-[#d4af37] hover:text-white transition-all duration-300"
            >
              <FiFacebook className="w-5 h-5" />
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-12 h-12 rounded-full border-2 border-gray-300 flex items-center justify-center text-gray-600 hover:bg-[#d4af37] hover:border-[#d4af37] hover:text-white transition-all duration-300"
            >
              <FiTwitter className="w-5 h-5" />
            </a>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white py-8 border-t border-gray-200">
        <div className="container mx-auto px-6 text-center">
          <p className="text-gray-600 font-lato text-sm">
            © {new Date().getFullYear()} Aminoss Photography. All rights reserved.
          </p>
          <p className="text-gray-500 font-lato text-xs mt-2">
            Professional Photography Services | Available Worldwide
          </p>
        </div>
      </footer>
    </div>
  );
}
