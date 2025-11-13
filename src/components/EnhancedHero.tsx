'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'link';
import { FiArrowRight, FiChevronDown, FiPlay } from 'react-icons/fi';
import { fadeInUp, staggerContainer, imageReveal } from '@/lib/animations';

interface EnhancedHeroProps {
  title?: string;
  subtitle?: string;
  description?: string;
  primaryCTA?: {
    text: string;
    href: string;
  };
  secondaryCTA?: {
    text: string;
    href: string;
  };
  backgroundImage?: string;
  backgroundVideo?: string;
  trustSignals?: {
    icon: React.ReactNode;
    value: string;
    label: string;
  }[];
  showScrollIndicator?: boolean;
}

export default function EnhancedHero({
  title = "Capturing Life's Beautiful Moments",
  subtitle = "Professional Photography & Videography",
  description = "Transforming your special occasions into timeless memories through the art of photography",
  primaryCTA = { text: "View Portfolio", href: "/gallery" },
  secondaryCTA = { text: "Book Now", href: "/booking" },
  backgroundImage = "/hero-bg.jpg",
  backgroundVideo,
  trustSignals = [
    { icon: null, value: "10+", label: "Years Experience" },
    { icon: null, value: "500+", label: "Happy Clients" },
    { icon: null, value: "1000+", label: "Projects Completed" },
  ],
  showScrollIndicator = true,
}: EnhancedHeroProps) {
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const { scrollY } = useScroll();

  // Parallax effects
  const y = useTransform(scrollY, [0, 500], [0, 150]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);
  const scale = useTransform(scrollY, [0, 300], [1, 1.1]);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Layer with Parallax */}
      <motion.div
        className="absolute inset-0 z-0"
        style={{ y, scale }}
      >
        {/* Video Background (if provided) */}
        {backgroundVideo && (
          <video
            autoPlay
            loop
            muted
            playsInline
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
              isVideoLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            onLoadedData={() => setIsVideoLoaded(true)}
          >
            <source src={backgroundVideo} type="video/mp4" />
          </video>
        )}

        {/* Image Background (fallback or default) */}
        <div className="absolute inset-0">
          <Image
            src={backgroundImage}
            alt="Hero Background"
            fill
            className="object-cover"
            priority
            quality={90}
          />
        </div>

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-900/90 via-secondary-900/85 to-primary-700/80" />

        {/* Animated Pattern Overlay */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>
      </motion.div>

      {/* Content Layer */}
      <motion.div
        className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 text-center"
        style={{ opacity }}
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >
        {/* Subtitle Badge */}
        <motion.div
          variants={fadeInUp}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white text-sm font-medium mb-6"
        >
          <span className="w-2 h-2 rounded-full bg-primary-400 animate-pulse" />
          <span>{subtitle}</span>
        </motion.div>

        {/* Main Title */}
        <motion.h1
          variants={fadeInUp}
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight"
        >
          <span className="bg-gradient-to-r from-white via-primary-100 to-primary-300 bg-clip-text text-transparent">
            {title}
          </span>
        </motion.h1>

        {/* Description */}
        <motion.p
          variants={fadeInUp}
          className="text-lg sm:text-xl text-gray-200 max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          {description}
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          variants={fadeInUp}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
        >
          {/* Primary CTA */}
          <Link href={primaryCTA.href}>
            <motion.button
              className="group relative px-8 py-4 bg-primary-500 text-white rounded-full font-semibold text-lg overflow-hidden shadow-2xl hover:shadow-primary-500/50 transition-all duration-300"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              {/* Shimmer effect */}
              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/30 to-transparent" />
              
              <span className="relative flex items-center gap-2">
                {primaryCTA.text}
                <FiArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
            </motion.button>
          </Link>

          {/* Secondary CTA */}
          <Link href={secondaryCTA.href}>
            <motion.button
              className="px-8 py-4 bg-white/10 backdrop-blur-sm border-2 border-white/30 text-white rounded-full font-semibold text-lg hover:bg-white/20 hover:border-white/50 transition-all duration-300"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              {secondaryCTA.text}
            </motion.button>
          </Link>
        </motion.div>

        {/* Trust Signals */}
        {trustSignals.length > 0 && (
          <motion.div
            variants={fadeInUp}
            className="flex flex-wrap items-center justify-center gap-8 md:gap-12"
          >
            {trustSignals.map((signal, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-white mb-1 bg-gradient-to-r from-primary-300 to-amber-300 bg-clip-text text-transparent">
                  {signal.value}
                </div>
                <div className="text-sm text-gray-300 font-medium">
                  {signal.label}
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </motion.div>

      {/* Scroll Indicator */}
      {showScrollIndicator && (
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
          style={{ opacity }}
          animate={{
            y: [0, 10, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <div className="flex flex-col items-center gap-2 cursor-pointer group"
            onClick={() => window.scrollBy({ top: window.innerHeight, behavior: 'smooth' })}
          >
            <span className="text-white/80 text-sm font-medium group-hover:text-white transition-colors">
              Scroll to explore
            </span>
            <div className="w-6 h-10 rounded-full border-2 border-white/30 flex items-start justify-center p-2 group-hover:border-white/60 transition-colors">
              <motion.div
                className="w-1 h-2 bg-white/60 rounded-full"
                animate={{
                  y: [0, 12, 0],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            </div>
          </div>
        </motion.div>
      )}

      {/* Decorative Elements */}
      <div className="absolute top-1/4 left-10 w-72 h-72 bg-primary-500/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-10 w-96 h-96 bg-amber-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
    </section>
  );
}
