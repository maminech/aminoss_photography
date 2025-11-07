'use client';

import { useEffect, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

interface NovoParallaxSectionProps {
  children: React.ReactNode;
  speed?: number;
  className?: string;
  overlay?: boolean;
  overlayOpacity?: number;
}

export default function NovoParallaxSection({
  children,
  speed = 0.5,
  className = '',
  overlay = false,
  overlayOpacity = 0.6,
}: NovoParallaxSectionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  const y = useTransform(scrollYProgress, [0, 1], [0, speed * 100]);
  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [0.3, 1, 0.3]);

  return (
    <div ref={ref} className={`relative overflow-hidden ${className}`}>
      <motion.div style={{ y }} className="relative">
        {children}
      </motion.div>
      
      {overlay && (
        <motion.div
          style={{ opacity: useTransform(opacity, (val) => val * overlayOpacity) }}
          className="absolute inset-0 bg-black pointer-events-none"
        />
      )}
    </div>
  );
}
