// Animation Presets Library
// Professional-grade animation configurations using Framer Motion

import { Variants } from 'framer-motion';

// Easing curves
export const ease = {
  smooth: [0.6, -0.05, 0.01, 0.99],
  bounce: [0.68, -0.55, 0.265, 1.55],
  snappy: [0.4, 0, 0.2, 1],
  lazy: [0.4, 0, 0.6, 1],
};

// FADE ANIMATIONS
export const fadeIn: Variants = {
  initial: { opacity: 0 },
  animate: { 
    opacity: 1,
    transition: { duration: 0.6, ease: ease.smooth }
  },
  exit: { 
    opacity: 0,
    transition: { duration: 0.3 }
  }
};

export const fadeInUp: Variants = {
  initial: { opacity: 0, y: 60 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6, ease: ease.smooth }
  },
  exit: { 
    opacity: 0, 
    y: 20,
    transition: { duration: 0.3 }
  }
};

export const fadeInDown: Variants = {
  initial: { opacity: 0, y: -60 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6, ease: ease.smooth }
  },
  exit: { 
    opacity: 0, 
    y: -20,
    transition: { duration: 0.3 }
  }
};

export const fadeInLeft: Variants = {
  initial: { opacity: 0, x: -60 },
  animate: { 
    opacity: 1, 
    x: 0,
    transition: { duration: 0.6, ease: ease.smooth }
  },
  exit: { 
    opacity: 0, 
    x: -20,
    transition: { duration: 0.3 }
  }
};

export const fadeInRight: Variants = {
  initial: { opacity: 0, x: 60 },
  animate: { 
    opacity: 1, 
    x: 0,
    transition: { duration: 0.6, ease: ease.smooth }
  },
  exit: { 
    opacity: 0, 
    x: 20,
    transition: { duration: 0.3 }
  }
};

// SCALE ANIMATIONS
export const scaleIn: Variants = {
  initial: { opacity: 0, scale: 0.8 },
  animate: { 
    opacity: 1, 
    scale: 1,
    transition: { duration: 0.5, ease: ease.smooth }
  },
  exit: { 
    opacity: 0, 
    scale: 0.95,
    transition: { duration: 0.2 }
  }
};

export const scaleUp: Variants = {
  initial: { scale: 0.95 },
  animate: { 
    scale: 1,
    transition: { duration: 0.3, ease: ease.bounce }
  },
  exit: { 
    scale: 0.95,
    transition: { duration: 0.2 }
  }
};

export const popIn: Variants = {
  initial: { opacity: 0, scale: 0 },
  animate: { 
    opacity: 1, 
    scale: 1,
    transition: { duration: 0.5, ease: ease.bounce }
  },
  exit: { 
    opacity: 0, 
    scale: 0,
    transition: { duration: 0.2 }
  }
};

// SLIDE ANIMATIONS
export const slideInUp: Variants = {
  initial: { y: '100%' },
  animate: { 
    y: 0,
    transition: { duration: 0.5, ease: ease.smooth }
  },
  exit: { 
    y: '100%',
    transition: { duration: 0.3 }
  }
};

export const slideInDown: Variants = {
  initial: { y: '-100%' },
  animate: { 
    y: 0,
    transition: { duration: 0.5, ease: ease.smooth }
  },
  exit: { 
    y: '-100%',
    transition: { duration: 0.3 }
  }
};

export const slideInLeft: Variants = {
  initial: { x: '-100%' },
  animate: { 
    x: 0,
    transition: { duration: 0.5, ease: ease.smooth }
  },
  exit: { 
    x: '-100%',
    transition: { duration: 0.3 }
  }
};

export const slideInRight: Variants = {
  initial: { x: '100%' },
  animate: { 
    x: 0,
    transition: { duration: 0.5, ease: ease.smooth }
  },
  exit: { 
    x: '100%',
    transition: { duration: 0.3 }
  }
};

// STAGGER ANIMATIONS
export const staggerContainer: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

export const staggerFast: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.05
    }
  }
};

export const staggerSlow: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.3
    }
  }
};

// HOVER ANIMATIONS
export const hoverScale: Variants = {
  initial: { scale: 1 },
  hover: { 
    scale: 1.05,
    transition: { duration: 0.3, ease: ease.smooth }
  },
  tap: { 
    scale: 0.98,
    transition: { duration: 0.1 }
  }
};

export const hoverLift: Variants = {
  initial: { y: 0, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' },
  hover: { 
    y: -8,
    boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
    transition: { duration: 0.3, ease: ease.smooth }
  }
};

export const hoverGlow: Variants = {
  initial: { 
    filter: 'brightness(1) saturate(1)',
    boxShadow: '0 0 0 rgba(198, 117, 72, 0)'
  },
  hover: { 
    filter: 'brightness(1.1) saturate(1.2)',
    boxShadow: '0 0 30px rgba(198, 117, 72, 0.6)',
    transition: { duration: 0.3 }
  }
};

// ROTATION ANIMATIONS
export const rotate: Variants = {
  initial: { rotate: 0 },
  animate: { 
    rotate: 360,
    transition: { duration: 1, repeat: Infinity, ease: 'linear' }
  }
};

export const rotateIn: Variants = {
  initial: { opacity: 0, rotate: -180 },
  animate: { 
    opacity: 1, 
    rotate: 0,
    transition: { duration: 0.6, ease: ease.smooth }
  },
  exit: { 
    opacity: 0, 
    rotate: 180,
    transition: { duration: 0.3 }
  }
};

// SPECIAL EFFECTS
export const flipX: Variants = {
  initial: { rotateX: -90, opacity: 0 },
  animate: { 
    rotateX: 0, 
    opacity: 1,
    transition: { duration: 0.5, ease: ease.smooth }
  },
  exit: { 
    rotateX: 90, 
    opacity: 0,
    transition: { duration: 0.3 }
  }
};

export const flipY: Variants = {
  initial: { rotateY: -90, opacity: 0 },
  animate: { 
    rotateY: 0, 
    opacity: 1,
    transition: { duration: 0.5, ease: ease.smooth }
  },
  exit: { 
    rotateY: 90, 
    opacity: 0,
    transition: { duration: 0.3 }
  }
};

export const blur: Variants = {
  initial: { filter: 'blur(10px)', opacity: 0 },
  animate: { 
    filter: 'blur(0px)', 
    opacity: 1,
    transition: { duration: 0.6 }
  },
  exit: { 
    filter: 'blur(10px)', 
    opacity: 0,
    transition: { duration: 0.3 }
  }
};

// PARALLAX EFFECTS
export const parallaxSlow = {
  initial: { y: 0 },
  animate: (custom: number = 1) => ({
    y: custom * -50,
    transition: { ease: 'linear' }
  })
};

export const parallaxMedium = {
  initial: { y: 0 },
  animate: (custom: number = 1) => ({
    y: custom * -100,
    transition: { ease: 'linear' }
  })
};

export const parallaxFast = {
  initial: { y: 0 },
  animate: (custom: number = 1) => ({
    y: custom * -150,
    transition: { ease: 'linear' }
  })
};

// IMAGE REVEAL ANIMATIONS
export const imageReveal: Variants = {
  initial: { 
    scale: 1.2,
    opacity: 0,
    filter: 'blur(20px)'
  },
  animate: { 
    scale: 1,
    opacity: 1,
    filter: 'blur(0px)',
    transition: { 
      duration: 1,
      ease: ease.smooth
    }
  }
};

export const imageZoom: Variants = {
  initial: { scale: 1 },
  hover: { 
    scale: 1.1,
    transition: { duration: 0.6, ease: ease.smooth }
  }
};

// TEXT ANIMATIONS
export const textReveal: Variants = {
  initial: { y: '100%' },
  animate: { 
    y: 0,
    transition: { duration: 0.6, ease: ease.smooth }
  }
};

export const letterAnimation: Variants = {
  initial: { opacity: 0, y: 50 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.3 }
  }
};

// NUMBER COUNTER ANIMATION
export const counterAnimation = {
  initial: { opacity: 0, scale: 0.5 },
  animate: { 
    opacity: 1, 
    scale: 1,
    transition: { duration: 0.5, ease: ease.bounce }
  }
};

// MODAL/OVERLAY ANIMATIONS
export const modalBackdrop: Variants = {
  initial: { opacity: 0 },
  animate: { 
    opacity: 1,
    transition: { duration: 0.3 }
  },
  exit: { 
    opacity: 0,
    transition: { duration: 0.3 }
  }
};

export const modalContent: Variants = {
  initial: { opacity: 0, scale: 0.9, y: 20 },
  animate: { 
    opacity: 1, 
    scale: 1, 
    y: 0,
    transition: { duration: 0.3, ease: ease.smooth }
  },
  exit: { 
    opacity: 0, 
    scale: 0.95, 
    y: 10,
    transition: { duration: 0.2 }
  }
};

// PAGE TRANSITIONS
export const pageTransition: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5, ease: ease.smooth }
  },
  exit: { 
    opacity: 0, 
    y: -20,
    transition: { duration: 0.3 }
  }
};

// LOADING ANIMATIONS
export const pulse: Variants = {
  initial: { scale: 1, opacity: 1 },
  animate: {
    scale: [1, 1.05, 1],
    opacity: [1, 0.8, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'easeInOut'
    }
  }
};

export const spin: Variants = {
  animate: {
    rotate: 360,
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: 'linear'
    }
  }
};

// Export all animations as a collection
export const animations = {
  fadeIn,
  fadeInUp,
  fadeInDown,
  fadeInLeft,
  fadeInRight,
  scaleIn,
  scaleUp,
  popIn,
  slideInUp,
  slideInDown,
  slideInLeft,
  slideInRight,
  staggerContainer,
  staggerFast,
  staggerSlow,
  hoverScale,
  hoverLift,
  hoverGlow,
  rotate,
  rotateIn,
  flipX,
  flipY,
  blur,
  parallaxSlow,
  parallaxMedium,
  parallaxFast,
  imageReveal,
  imageZoom,
  textReveal,
  letterAnimation,
  counterAnimation,
  modalBackdrop,
  modalContent,
  pageTransition,
  pulse,
  spin,
};

export default animations;
