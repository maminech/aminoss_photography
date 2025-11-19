'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { useOnScreen, getOptimizedCloudinaryUrl, getAdaptiveQuality } from '@/lib/performance';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  quality?: 'auto' | number;
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
  loading?: 'lazy' | 'eager';
  sizes?: string;
  onLoad?: () => void;
  onError?: () => void;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
}

/**
 * Optimized Image Component
 * 
 * Features:
 * - Automatic lazy loading with intersection observer
 * - Cloudinary optimization
 * - Adaptive quality based on network/device
 * - Progressive loading with blur placeholder
 * - Error handling with fallback
 * - WebP/AVIF format support
 */
export default function OptimizedImage({
  src,
  alt,
  width,
  height,
  className = '',
  priority = false,
  quality = 'auto',
  objectFit = 'cover',
  loading = 'lazy',
  sizes,
  onLoad,
  onError,
  placeholder = 'blur',
  blurDataURL,
}: OptimizedImageProps) {
  const [imageSrc, setImageSrc] = useState(src);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imageRef = useRef<HTMLDivElement>(null);
  const isVisible = useOnScreen(imageRef, '200px');

  // Determine if we should load the image
  const shouldLoad = priority || isVisible || loading === 'eager';

  // Get adaptive quality based on network
  const adaptiveQuality = quality === 'auto' ? getAdaptiveQuality() : quality;
  
  // Map quality to numeric value
  const qualityValue = typeof adaptiveQuality === 'string' 
    ? { low: 50, medium: 70, high: 85 }[adaptiveQuality] 
    : adaptiveQuality;

  // Optimize Cloudinary URL
  const optimizedSrc = React.useMemo(() => {
    if (!shouldLoad) return '';
    
    return getOptimizedCloudinaryUrl(imageSrc, {
      width,
      height,
      quality: qualityValue,
      format: 'auto', // Let Cloudinary choose best format (WebP/AVIF)
      crop: objectFit === 'cover' ? 'fill' : 'fit',
    });
  }, [imageSrc, shouldLoad, width, height, qualityValue, objectFit]);

  // Generate blur placeholder if not provided
  const placeholderSrc = React.useMemo(() => {
    if (blurDataURL) return blurDataURL;
    
    if (src.includes('cloudinary.com')) {
      // Generate tiny blurred version from Cloudinary
      return getOptimizedCloudinaryUrl(src, {
        width: 20,
        quality: 10,
        format: 'jpg',
      });
    }
    
    return undefined;
  }, [src, blurDataURL]);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    setImageSrc('/images/placeholder.jpg'); // Fallback image
    onError?.();
  };

  // Calculate responsive sizes if not provided
  const responsiveSizes = sizes || `
    (max-width: 640px) 100vw,
    (max-width: 1024px) 50vw,
    33vw
  `;

  return (
    <div
      ref={imageRef}
      className={`relative overflow-hidden ${className}`}
      style={{ width: width || '100%', height: height || 'auto' }}
    >
      {shouldLoad ? (
        <>
          {/* Main Image */}
          <Image
            src={optimizedSrc}
            alt={alt}
            width={width || 800}
            height={height || 600}
            className={`
              transition-opacity duration-500
              ${isLoaded ? 'opacity-100' : 'opacity-0'}
              ${objectFit ? `object-${objectFit}` : ''}
            `}
            priority={priority}
            loading={priority ? 'eager' : 'lazy'}
            quality={qualityValue}
            sizes={responsiveSizes}
            placeholder={placeholder}
            blurDataURL={placeholderSrc}
            onLoad={handleLoad}
            onError={handleError}
            style={{
              width: '100%',
              height: '100%',
            }}
          />

          {/* Loading State */}
          {!isLoaded && !hasError && (
            <div className="absolute inset-0 bg-gray-200 dark:bg-gray-800 animate-pulse flex items-center justify-center">
              <div className="w-8 h-8 border-4 border-gray-300 dark:border-gray-700 border-t-primary rounded-full animate-spin" />
            </div>
          )}

          {/* Error State */}
          {hasError && (
            <div className="absolute inset-0 bg-gray-200 dark:bg-gray-800 flex items-center justify-center">
              <div className="text-center text-gray-500 dark:text-gray-400 p-4">
                <svg className="w-12 h-12 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-sm">Failed to load image</p>
              </div>
            </div>
          )}
        </>
      ) : (
        // Placeholder before image is visible
        <div className="absolute inset-0 bg-gray-200 dark:bg-gray-800 animate-pulse" />
      )}
    </div>
  );
}

/**
 * Optimized Background Image Component
 * For hero sections and background images
 */
export function OptimizedBackgroundImage({
  src,
  alt = '',
  className = '',
  children,
  priority = false,
  overlay = false,
  overlayOpacity = 0.5,
}: {
  src: string;
  alt?: string;
  className?: string;
  children?: React.ReactNode;
  priority?: boolean;
  overlay?: boolean;
  overlayOpacity?: number;
}) {
  const [isLoaded, setIsLoaded] = useState(false);
  const imageRef = useRef<HTMLDivElement>(null);
  const isVisible = useOnScreen(imageRef, '200px');
  const shouldLoad = priority || isVisible;

  // Get adaptive quality
  const quality = getAdaptiveQuality();
  const qualityValue = { low: 50, medium: 70, high: 85 }[quality];

  // Optimize for background (larger size, lower quality acceptable)
  const optimizedSrc = React.useMemo(() => {
    if (!shouldLoad) return '';
    
    return getOptimizedCloudinaryUrl(src, {
      width: 1920, // Full HD width
      quality: qualityValue,
      format: 'auto',
      crop: 'fill',
    });
  }, [src, shouldLoad, qualityValue]);

  return (
    <div ref={imageRef} className={`relative ${className}`}>
      {shouldLoad && (
        <>
          <Image
            src={optimizedSrc}
            alt={alt}
            fill
            className={`
              transition-opacity duration-1000
              ${isLoaded ? 'opacity-100' : 'opacity-0'}
            `}
            style={{ objectFit: 'cover' }}
            priority={priority}
            quality={qualityValue}
            sizes="100vw"
            onLoad={() => setIsLoaded(true)}
          />
          
          {overlay && (
            <div 
              className="absolute inset-0 bg-black" 
              style={{ opacity: overlayOpacity }}
            />
          )}
        </>
      )}
      
      {!isLoaded && (
        <div className="absolute inset-0 bg-gray-900 animate-pulse" />
      )}
      
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}

/**
 * Optimized Avatar Component
 * For user avatars and profile pictures
 */
export function OptimizedAvatar({
  src,
  alt,
  size = 'md',
  className = '',
}: {
  src: string;
  alt: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}) {
  const sizes = {
    sm: 32,
    md: 48,
    lg: 64,
    xl: 96,
  };

  const dimension = sizes[size];

  const optimizedSrc = getOptimizedCloudinaryUrl(src, {
    width: dimension * 2, // 2x for retina
    height: dimension * 2,
    quality: 80,
    format: 'auto',
    crop: 'fill',
  });

  return (
    <div className={`relative overflow-hidden rounded-full ${className}`}>
      <Image
        src={optimizedSrc}
        alt={alt}
        width={dimension}
        height={dimension}
        className="object-cover"
        quality={80}
      />
    </div>
  );
}
