'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import Image from 'next/image';

interface NovoHeroSectionProps {
  title: string;
  subtitle?: string;
  backgroundImage?: string;
  height?: 'full' | 'large' | 'medium';
  overlay?: boolean;
  parallax?: boolean;
  children?: React.ReactNode;
}

export default function NovoHeroSection({
  title,
  subtitle,
  backgroundImage,
  height = 'full',
  overlay = true,
  parallax = true,
  children,
}: NovoHeroSectionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  });

  const y = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);
  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [1, 0.8, 0.3]);

  const heightClasses = {
    full: 'h-screen min-h-[600px]',
    large: 'h-[80vh] min-h-[500px]',
    medium: 'h-[60vh] min-h-[400px]',
  };

  return (
    <div
      ref={ref}
      className={`relative ${heightClasses[height]} overflow-hidden flex items-center justify-center`}
    >
      {/* Background Image with Parallax */}
      {backgroundImage && (
        <motion.div
          style={parallax ? { y } : {}}
          className="absolute inset-0 w-full h-full scale-110"
        >
          <Image
            src={backgroundImage}
            alt={title}
            fill
            className="object-cover"
            priority
            quality={90}
          />
        </motion.div>
      )}

      {/* Overlay */}
      {overlay && (
        <motion.div
          style={parallax ? { opacity } : { opacity: 0.6 }}
          className="absolute inset-0 bg-black"
        />
      )}

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: [0.4, 0, 0.2, 1], delay: 0.2 }}
        className="relative z-10 text-center px-6 max-w-5xl mx-auto"
      >
        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-5xl md:text-7xl lg:text-8xl font-playfair font-bold text-white mb-6 leading-tight tracking-tight"
        >
          {title}
        </motion.h1>

        {/* Subtitle */}
        {subtitle && (
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-lg md:text-xl lg:text-2xl font-lato font-light text-white/90 tracking-wide"
          >
            {subtitle}
          </motion.p>
        )}

        {/* Decorative Line */}
        <motion.div
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: '100px', opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="h-[1px] bg-[#d4af37] mx-auto mt-8"
        />

        {/* Children (CTA buttons, etc.) */}
        {children && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1 }}
            className="mt-10"
          >
            {children}
          </motion.div>
        )}
      </motion.div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.5 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          className="flex flex-col items-center gap-2 text-white/70 cursor-pointer hover:text-white transition-colors"
        >
          <span className="text-xs uppercase tracking-[0.2em] font-lato font-light">Scroll</span>
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </svg>
        </motion.div>
      </motion.div>
    </div>
  );
}
