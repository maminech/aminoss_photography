'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { FiArrowRight, FiCamera, FiUser } from 'react-icons/fi';
import InstagramFeed from '@/components/InstagramFeed';
import LightboxModal from '@/components/LightboxModal';
import { MediaItem } from '@/types';
import { getSampleImages } from '@/lib/sample-data';

interface VideoItem {
  id: string;
  title: string;
  description?: string;
  url: string;
  thumbnailUrl: string;
  width?: number;
  height?: number;
  isReel?: boolean;
}

export default function HomePage() {
  const [images, setImages] = useState<MediaItem[]>([]);
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [combinedMedia, setCombinedMedia] = useState<(MediaItem | VideoItem)[]>([]);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMedia = async () => {
      try {
        // Load featured images
        const imagesRes = await fetch('/api/admin/images?featured=true');
        let fetchedImages: MediaItem[] = [];
        
        if (imagesRes.ok) {
          const data = await imagesRes.json();
          fetchedImages = data.map((img: any) => ({
            id: img.id,
            publicId: img.cloudinaryId,
            url: img.url,
            thumbnailUrl: img.thumbnailUrl,
            title: img.title || 'Untitled',
            description: img.description || '',
            category: img.category,
            width: img.width,
            height: img.height,
            format: img.format,
            createdAt: img.createdAt,
            tags: img.tags || [],
            type: 'image',
          }));
          setImages(fetchedImages);
        }

        // Load homepage videos
        const videosRes = await fetch('/api/videos?homepage=true');
        let fetchedVideos: VideoItem[] = [];
        
        if (videosRes.ok) {
          const data = await videosRes.json();
          fetchedVideos = data.map((vid: any) => ({
            id: vid.id,
            title: vid.title,
            description: vid.description,
            url: vid.url,
            thumbnailUrl: vid.thumbnailUrl,
            width: vid.width,
            height: vid.height,
            isReel: vid.isReel,
            type: 'video',
          }));
          setVideos(fetchedVideos);
        }

        // Combine and sort by creation date
        const combined = [...fetchedImages, ...fetchedVideos].sort(() => Math.random() - 0.5);
        setCombinedMedia(combined);

        // Fallback to sample data if no media
        if (combined.length === 0) {
          const sampleData = await getSampleImages('all');
          setImages(sampleData);
          setCombinedMedia(sampleData);
        }
      } catch (error) {
        console.error('Error loading media:', error);
        const data = await getSampleImages('all');
        setImages(data);
        setCombinedMedia(data);
      } finally {
        setLoading(false);
      }
    };
    loadMedia();
  }, []);

  const openLightbox = (index: number) => {
    // Only open lightbox for images, not videos
    const mediaItem = combinedMedia[index];
    if ('type' in mediaItem && mediaItem.type === 'video') {
      return; // Videos handle their own playback
    }
    setCurrentImageIndex(index);
    setLightboxOpen(true);
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const previousImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className="min-h-screen">
      {/* Glass Hero Section */}
      <section className="relative h-[50vh] md:h-[60vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=1920&q=80"
            alt="Hero"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/50 to-black/70" />
        </div>
        
        <div className="relative z-10 text-center text-white px-4 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="glass-card backdrop-blur-2xl bg-white/10 border-white/20 p-8 md:p-12"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 glass rounded-2xl mb-6 float">
              <FiCamera className="w-8 h-8 md:w-10 md:h-10 text-primary-400" />
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-bold mb-4 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Aminoss Photography
            </h1>
            <p className="text-lg md:text-xl text-gray-200 mb-8 max-w-2xl mx-auto">
              Capturing moments that tell your story with artistry and passion
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/gallery">
                <button className="glass-button text-white hover:bg-white/20 group">
                  View Gallery
                  <FiArrowRight className="inline ml-2 group-hover:translate-x-1 transition-transform" />
                </button>
              </Link>
              <Link href="/contact">
                <button className="btn-primary">
                  Book a Session
                </button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Instagram-Style Feed with Glass Effect */}
      {loading ? (
        <div className="max-w-2xl mx-auto py-12 px-4">
          <div className="space-y-8">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="glass-card animate-pulse">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-gray-300/50 dark:bg-gray-700/50" />
                  <div className="flex-1">
                    <div className="h-4 bg-gray-300/50 dark:bg-gray-700/50 rounded-lg w-1/3 mb-2" />
                    <div className="h-3 bg-gray-300/50 dark:bg-gray-700/50 rounded-lg w-1/4" />
                  </div>
                </div>
                <div className="aspect-square bg-gray-200 dark:bg-dark-700 animate-pulse" />
                <div className="p-4 space-y-3">
                  <div className="h-6 bg-gray-200 dark:bg-dark-700 rounded w-1/4 animate-pulse" />
                  <div className="h-4 bg-gray-200 dark:bg-dark-700 rounded w-3/4 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <InstagramFeed 
          images={images} 
          videos={videos}
          combinedMedia={combinedMedia}
          onImageClick={openLightbox} 
        />
      )}

      {/* Lightbox Modal */}
      <LightboxModal
        images={images}
        currentIndex={currentImageIndex}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        onNext={nextImage}
        onPrevious={previousImage}
      />
    </div>
  );
}
