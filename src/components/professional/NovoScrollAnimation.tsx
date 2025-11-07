'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { ReactNode, useRef } from 'react';

interface NovoScrollAnimationProps {
  children: ReactNode;
  direction?: 'up' | 'down' | 'left' | 'right' | 'fade' | 'scale';
  delay?: number;
  duration?: number;
  once?: boolean;
}

export default function NovoScrollAnimation({
  children,
  direction = 'up',
  delay = 0,
  duration = 0.8,
  once = true,
}: NovoScrollAnimationProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  const getInitialState = () => {
    switch (direction) {
      case 'up':
        return { opacity: 0, y: 60 };
      case 'down':
        return { opacity: 0, y: -60 };
      case 'left':
        return { opacity: 0, x: -60 };
      case 'right':
        return { opacity: 0, x: 60 };
      case 'scale':
        return { opacity: 0, scale: 0.8 };
      case 'fade':
      default:
        return { opacity: 0 };
    }
  };

  const getAnimateState = () => {
    switch (direction) {
      case 'up':
      case 'down':
        return { opacity: 1, y: 0 };
      case 'left':
      case 'right':
        return { opacity: 1, x: 0 };
      case 'scale':
        return { opacity: 1, scale: 1 };
      case 'fade':
      default:
        return { opacity: 1 };
    }
  };

  return (
    <motion.div
      ref={ref}
      initial={getInitialState()}
      whileInView={getAnimateState()}
      viewport={{ once, margin: '-100px' }}
      transition={{
        duration,
        delay,
        ease: [0.4, 0, 0.2, 1],
      }}
    >
      {children}
    </motion.div>
  );
}

// Stagger Children Animation
interface NovoStaggerProps {
  children: ReactNode;
  staggerDelay?: number;
  initialDelay?: number;
}

export function NovoStagger({
  children,
  staggerDelay = 0.1,
  initialDelay = 0,
}: NovoStaggerProps) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-100px' }}
      transition={{
        staggerChildren: staggerDelay,
        delayChildren: initialDelay,
      }}
      variants={{
        hidden: {},
        visible: {},
      }}
    >
      {children}
    </motion.div>
  );
}

// Individual Stagger Item
export function NovoStaggerItem({
  children,
  direction = 'up',
}: {
  children: ReactNode;
  direction?: 'up' | 'fade';
}) {
  const variants = {
    hidden:
      direction === 'up'
        ? { opacity: 0, y: 30 }
        : { opacity: 0 },
    visible:
      direction === 'up'
        ? { opacity: 1, y: 0 }
        : { opacity: 1 },
  };

  return (
    <motion.div
      variants={variants}
      transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
    >
      {children}
    </motion.div>
  );
}

// Hover Scale Effect
export function NovoHoverScale({ children }: { children: ReactNode }) {
  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
    >
      {children}
    </motion.div>
  );
}

// Image Hover Zoom
export function NovoImageZoom({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-hidden">
      <motion.div
        whileHover={{ scale: 1.1 }}
        transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
      >
        {children}
      </motion.div>
    </div>
  );
}
