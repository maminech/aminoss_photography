/**
 * Performance Optimization Utilities
 * 
 * Provides tools for lazy loading, debouncing, throttling,
 * and performance monitoring across the application.
 */

/**
 * Debounce function to limit how often a function is called
 * Useful for search inputs, resize events, etc.
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function to ensure a function is called at most once per interval
 * Useful for scroll events, mouse movements, etc.
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  let lastResult: ReturnType<T>;

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      inThrottle = true;
      lastResult = func(...args);
      setTimeout(() => (inThrottle = false), limit);
    }
    return lastResult;
  };
}

/**
 * Lazy load component with automatic code splitting
 * Usage: const MyComponent = lazyLoad(() => import('./MyComponent'))
 */
export function lazyLoad<T extends React.ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>
) {
  return React.lazy(importFunc);
}

/**
 * Intersection Observer for lazy loading images/components
 * Returns true when element is visible in viewport
 */
export function useInView(
  ref: React.RefObject<HTMLElement>,
  options?: IntersectionObserverInit
): boolean {
  const [isInView, setIsInView] = React.useState(false);

  React.useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect(); // Stop observing once visible
        }
      },
      {
        rootMargin: '50px', // Start loading 50px before element is visible
        threshold: 0.01,
        ...options,
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [ref, options]);

  return isInView;
}

/**
 * Preload image to improve perceived performance
 */
export function preloadImage(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = src;
  });
}

/**
 * Batch preload multiple images
 */
export async function preloadImages(urls: string[]): Promise<void[]> {
  return Promise.all(urls.map(preloadImage));
}

/**
 * Measure component render time
 * Usage: const measure = measureRenderTime('MyComponent')
 *        // ... render component
 *        measure() // logs time
 */
export function measureRenderTime(componentName: string) {
  const start = performance.now();
  
  return () => {
    const end = performance.now();
    const duration = end - start;
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Performance] ${componentName} rendered in ${duration.toFixed(2)}ms`);
    }
    
    return duration;
  };
}

/**
 * Get Web Vitals (CLS, FID, LCP, FCP, TTFB)
 */
export function reportWebVitals(metric: any) {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Web Vital] ${metric.name}:`, metric.value);
  }
  
  // Send to analytics in production
  if (process.env.NODE_ENV === 'production') {
    // Example: Send to Google Analytics
    // window.gtag?.('event', metric.name, {
    //   value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
    //   metric_id: metric.id,
    //   metric_value: metric.value,
    //   metric_delta: metric.delta,
    // });
  }
}

/**
 * Optimize scroll performance with requestAnimationFrame
 */
export function optimizeScroll(callback: () => void) {
  let ticking = false;

  return () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        callback();
        ticking = false;
      });
      ticking = true;
    }
  };
}

/**
 * Check if user prefers reduced motion
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Get optimal image size based on device pixel ratio and container size
 */
export function getOptimalImageSize(
  containerWidth: number,
  containerHeight: number
): { width: number; height: number } {
  const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
  
  // Cap at 2x for performance
  const targetDpr = Math.min(dpr, 2);
  
  return {
    width: Math.ceil(containerWidth * targetDpr),
    height: Math.ceil(containerHeight * targetDpr),
  };
}

/**
 * Memory usage monitoring (for debugging)
 */
export function getMemoryUsage() {
  if (typeof window === 'undefined' || !(performance as any).memory) {
    return null;
  }

  const memory = (performance as any).memory;
  return {
    usedJSHeapSize: Math.round(memory.usedJSHeapSize / 1048576), // MB
    totalJSHeapSize: Math.round(memory.totalJSHeapSize / 1048576), // MB
    jsHeapSizeLimit: Math.round(memory.jsHeapSizeLimit / 1048576), // MB
  };
}

/**
 * Check if device is low-end (for conditional feature loading)
 */
export function isLowEndDevice(): boolean {
  if (typeof navigator === 'undefined') return false;
  
  // Check for low memory
  const memory = (navigator as any).deviceMemory;
  if (memory && memory < 4) return true;
  
  // Check for slow connection
  const connection = (navigator as any).connection;
  if (connection) {
    if (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
      return true;
    }
    if (connection.saveData) return true;
  }
  
  // Check hardware concurrency (CPU cores)
  if (navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4) {
    return true;
  }
  
  return false;
}

/**
 * Adaptive loading: load different assets based on network/device
 */
export function getAdaptiveQuality(): 'low' | 'medium' | 'high' {
  if (typeof navigator === 'undefined') return 'high';
  
  const connection = (navigator as any).connection;
  
  if (connection) {
    // Save data mode
    if (connection.saveData) return 'low';
    
    // Check effective connection type
    switch (connection.effectiveType) {
      case 'slow-2g':
      case '2g':
        return 'low';
      case '3g':
        return 'medium';
      case '4g':
      default:
        return 'high';
    }
  }
  
  // Fallback to device check
  if (isLowEndDevice()) return 'low';
  
  return 'high';
}

/**
 * Cloudinary image URL optimizer
 */
export function getOptimizedCloudinaryUrl(
  url: string,
  options: {
    width?: number;
    height?: number;
    quality?: 'auto' | number;
    format?: 'auto' | 'webp' | 'avif' | 'jpg' | 'png';
    crop?: 'fill' | 'fit' | 'scale' | 'crop';
  } = {}
): string {
  if (!url.includes('cloudinary.com')) return url;
  
  const {
    width,
    height,
    quality = 'auto',
    format = 'auto',
    crop = 'fill',
  } = options;
  
  // Extract base URL and public ID
  const parts = url.split('/upload/');
  if (parts.length !== 2) return url;
  
  const [base, publicIdWithVersion] = parts;
  
  // Build transformation string
  const transformations: string[] = [];
  
  // Quality
  transformations.push(`q_${quality}`);
  
  // Format
  transformations.push(`f_${format}`);
  
  // Dimensions
  if (width) transformations.push(`w_${width}`);
  if (height) transformations.push(`h_${height}`);
  if (width || height) transformations.push(`c_${crop}`);
  
  // Optimization flags
  transformations.push('fl_progressive'); // Progressive loading
  transformations.push('fl_lossy'); // Allow lossy compression
  
  const transformString = transformations.join(',');
  
  return `${base}/upload/${transformString}/${publicIdWithVersion}`;
}

/**
 * React Hook: useDebounce
 */
import React from 'react';

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = React.useState<T>(value);

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * React Hook: useThrottle
 */
export function useThrottle<T>(value: T, limit: number): T {
  const [throttledValue, setThrottledValue] = React.useState<T>(value);
  const lastRan = React.useRef(Date.now());

  React.useEffect(() => {
    const handler = setTimeout(() => {
      if (Date.now() - lastRan.current >= limit) {
        setThrottledValue(value);
        lastRan.current = Date.now();
      }
    }, limit - (Date.now() - lastRan.current));

    return () => {
      clearTimeout(handler);
    };
  }, [value, limit]);

  return throttledValue;
}

/**
 * React Hook: useWindowSize with debouncing
 */
export function useWindowSize() {
  const [windowSize, setWindowSize] = React.useState<{
    width: number | undefined;
    height: number | undefined;
  }>({
    width: undefined,
    height: undefined,
  });

  React.useEffect(() => {
    const handleResize = debounce(() => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }, 150);

    // Set initial size
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return windowSize;
}

/**
 * React Hook: useMediaQuery
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = React.useState(false);

  React.useEffect(() => {
    const media = window.matchMedia(query);
    
    if (media.matches !== matches) {
      setMatches(media.matches);
    }

    const listener = (e: MediaQueryListEvent) => setMatches(e.matches);
    
    // Modern browsers
    if (media.addEventListener) {
      media.addEventListener('change', listener);
      return () => media.removeEventListener('change', listener);
    } else {
      // Fallback for older browsers
      media.addListener(listener);
      return () => media.removeListener(listener);
    }
  }, [matches, query]);

  return matches;
}

/**
 * React Hook: useOnScreen (Intersection Observer)
 */
export function useOnScreen(
  ref: React.RefObject<HTMLElement>,
  rootMargin = '0px'
): boolean {
  const [isVisible, setIsVisible] = React.useState(false);

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { rootMargin }
    );

    const currentRef = ref.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [ref, rootMargin]);

  return isVisible;
}
