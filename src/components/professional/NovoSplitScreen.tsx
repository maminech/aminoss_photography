'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { ReactNode } from 'react';

interface NovoSplitScreenProps {
  imagePosition: 'left' | 'right';
  imageSrc: string;
  imageAlt: string;
  title: string;
  subtitle?: string;
  description?: string;
  overlay?: boolean;
  overlayColor?: string;
  children?: ReactNode;
}

export default function NovoSplitScreen({
  imagePosition,
  imageSrc,
  imageAlt,
  title,
  subtitle,
  description,
  overlay = false,
  overlayColor = '#1a1a1a',
  children,
}: NovoSplitScreenProps) {
  const isImageLeft = imagePosition === 'left';

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.4, 0, 0.2, 1],
      },
    },
  };

  const imageVariants = {
    hidden: { opacity: 0, scale: 1.1 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 1.2,
        ease: [0.4, 0, 0.2, 1],
      },
    },
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[600px]">
      {/* Image Section */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-100px' }}
        variants={imageVariants}
        className={`relative overflow-hidden ${isImageLeft ? 'lg:order-1' : 'lg:order-2'}`}
      >
        <div className="relative w-full h-[400px] lg:h-full">
          <Image
            src={imageSrc}
            alt={imageAlt}
            fill
            className="object-cover transition-transform duration-700 hover:scale-105"
            sizes="(max-width: 1024px) 100vw, 50vw"
            quality={90}
          />
          {overlay && (
            <div
              className="absolute inset-0 opacity-40 transition-opacity duration-500 hover:opacity-20"
              style={{ backgroundColor: overlayColor }}
            />
          )}
        </div>
      </motion.div>

      {/* Content Section */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-100px' }}
        variants={containerVariants}
        className={`flex items-center justify-center px-8 md:px-16 lg:px-20 py-16 lg:py-20 bg-white ${
          isImageLeft ? 'lg:order-2' : 'lg:order-1'
        }`}
      >
        <div className="max-w-xl">
          {/* Subtitle */}
          {subtitle && (
            <motion.p
              variants={itemVariants}
              className="text-[#d4af37] text-sm uppercase tracking-[0.2em] font-lato font-medium mb-4"
            >
              {subtitle}
            </motion.p>
          )}

          {/* Title */}
          <motion.h2
            variants={itemVariants}
            className="text-4xl md:text-5xl lg:text-6xl font-playfair font-bold text-[#1a1a1a] mb-6 leading-tight"
          >
            {title}
          </motion.h2>

          {/* Decorative Line */}
          <motion.div
            variants={itemVariants}
            className="w-16 h-[1px] bg-[#d4af37] mb-8"
          />

          {/* Description */}
          {description && (
            <motion.p
              variants={itemVariants}
              className="text-base md:text-lg text-gray-700 font-lato font-light leading-relaxed mb-8"
            >
              {description}
            </motion.p>
          )}

          {/* Children (CTAs, additional content) */}
          {children && (
            <motion.div variants={itemVariants}>
              {children}
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
