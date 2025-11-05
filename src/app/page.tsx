'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { FiGrid, FiVideo, FiBookmark, FiSettings, FiMail } from 'react-icons/fi';
import { BsGrid3X3 } from 'react-icons/bs';
import { MdVideoLibrary } from 'react-icons/md';
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

interface SiteSettings {
  siteName?: string;
  tagline?: string;
  description?: string;
  aboutContent?: string;
  heroImage?: string;
}

export default function HomePage() {
  const [images, setImages] = useState<MediaItem[]>([]);
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [settings, setSettings] = useState<SiteSettings>({});
  const [activeTab, setActiveTab] = useState<'posts' | 'videos'>('posts');
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Load settings
        const settingsRes = await fetch('/api/admin/settings');
        if (settingsRes.ok) {
          const data = await settingsRes.json();
          setSettings(data);
        }

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
        
        if (videosRes.ok) {
          const data = await videosRes.json();
          const fetchedVideos = data.map((vid: any) => ({
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

        // Fallback to sample data if no media
        if (fetchedImages.length === 0) {
          const sampleData = await getSampleImages('all');
          setImages(sampleData);
        }
      } catch (error) {
        console.error('Error loading data:', error);
        const data = await getSampleImages('all');
        setImages(data);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const openLightbox = (index: number) => {
    setCurrentImageIndex(index);
    setLightboxOpen(true);
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const previousImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const displayMedia = activeTab === 'posts' ? images : videos;

  return (
    <div className="min-h-screen bg-white dark:bg-dark-900">
      {/* Instagram Profile Header - Exact Layout */}
      <div className="max-w-4xl mx-auto px-4 pt-8 pb-4">
        {/* Profile Section */}
        <div className="flex gap-8 md:gap-20 mb-11">
          {/* Profile Picture - Left Side */}
          <div className="flex-shrink-0">
            <div className="w-20 h-20 md:w-36 md:h-36 rounded-full overflow-hidden bg-white dark:bg-dark-800">
              <div className="w-full h-full rounded-full overflow-hidden bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
                {settings.heroImage ? (
                  <Image
                    src={settings.heroImage}
                    alt="Profile"
                    width={150}
                    height={150}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-3xl md:text-5xl font-bold text-white">
                    {settings.siteName?.charAt(0) || 'A'}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Profile Info - Right Side */}
          <div className="flex-1 min-w-0">
            {/* Username and Buttons */}
            <div className="flex items-center gap-5 mb-5">
              <h1 className="text-xl font-light text-gray-900 dark:text-gray-100">
                {settings.siteName?.toLowerCase().replace(/\s+/g, '_') || 'aminoss_photography'}
              </h1>
              <Link href="/contact">
                <button className="px-6 py-1.5 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition text-sm">
                  Message
                </button>
              </Link>
              <Link href="/gallery">
                <button className="px-6 py-1.5 bg-gray-200 dark:bg-dark-700 text-gray-900 dark:text-gray-100 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-dark-600 transition text-sm">
                  View Gallery
                </button>
              </Link>
              <button className="p-2 hover:bg-gray-100 dark:hover:bg-dark-800 rounded-lg transition">
                <FiSettings className="w-5 h-5 text-gray-900 dark:text-gray-100" />
              </button>
            </div>

            {/* Stats */}
            <div className="flex gap-10 mb-5">
              <div>
                <span className="font-semibold text-gray-900 dark:text-gray-100">
                  {images.length + videos.length}
                </span>
                <span className="text-gray-900 dark:text-gray-100 ml-1">posts</span>
              </div>
              <div>
                <span className="font-semibold text-gray-900 dark:text-gray-100">
                  2,847
                </span>
                <span className="text-gray-900 dark:text-gray-100 ml-1">followers</span>
              </div>
              <div>
                <span className="font-semibold text-gray-900 dark:text-gray-100">
                  312
                </span>
                <span className="text-gray-900 dark:text-gray-100 ml-1">following</span>
              </div>
            </div>

            {/* Bio */}
            <div>
              <div className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                {settings.tagline || 'Professional Photographer'}
              </div>
              <div className="text-sm text-gray-900 dark:text-gray-100 whitespace-pre-line">
                {settings.description || '📸 Capturing life\'s precious moments\n✨ Weddings | Portraits | Events\n📍 Available worldwide\n👇 Book your session'}
              </div>
              <Link href="/contact" className="text-sm font-semibold text-blue-900 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 mt-1 inline-block">
                aminossphotography.com
              </Link>
            </div>
          </div>
        </div>

        {/* Highlights */}
        <div className="flex gap-16 overflow-x-auto pb-4 mb-1 no-scrollbar">
          <Link href="/gallery" className="flex flex-col items-center gap-1 flex-shrink-0">
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-full ring-2 ring-gray-200 dark:ring-gray-700 p-0.5 bg-white dark:bg-dark-800">
              <div className="w-full h-full rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center">
                <BsGrid3X3 className="w-5 h-5 md:w-6 md:h-6 text-white" />
              </div>
            </div>
            <span className="text-xs text-gray-900 dark:text-gray-100">Gallery</span>
          </Link>
          <Link href="/videos" className="flex flex-col items-center gap-1 flex-shrink-0">
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-full ring-2 ring-gray-200 dark:ring-gray-700 p-0.5 bg-white dark:bg-dark-800">
              <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                <MdVideoLibrary className="w-5 h-5 md:w-6 md:h-6 text-white" />
              </div>
            </div>
            <span className="text-xs text-gray-900 dark:text-gray-100">Videos</span>
          </Link>
          <Link href="/packs" className="flex flex-col items-center gap-1 flex-shrink-0">
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-full ring-2 ring-gray-200 dark:ring-gray-700 p-0.5 bg-white dark:bg-dark-800">
              <div className="w-full h-full rounded-full bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center">
                <FiBookmark className="w-5 h-5 md:w-6 md:h-6 text-white" />
              </div>
            </div>
            <span className="text-xs text-gray-900 dark:text-gray-100">Packages</span>
          </Link>
          <Link href="/about" className="flex flex-col items-center gap-1 flex-shrink-0">
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-full ring-2 ring-gray-200 dark:ring-gray-700 p-0.5 bg-white dark:bg-dark-800">
              <div className="w-full h-full rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center">
                <FiMail className="w-5 h-5 md:w-6 md:h-6 text-white" />
              </div>
            </div>
            <span className="text-xs text-gray-900 dark:text-gray-100">Contact</span>
          </Link>
        </div>
      </div>

      {/* Tabs - Instagram Style */}
      <div className="border-t border-gray-200 dark:border-gray-800">
        <div className="max-w-4xl mx-auto flex justify-center">
          <button
            onClick={() => setActiveTab('posts')}
            className={`flex items-center justify-center gap-1.5 px-4 py-3 border-t transition ${
              activeTab === 'posts'
                ? 'border-gray-900 dark:border-white text-gray-900 dark:text-white'
                : 'border-transparent text-gray-400 dark:text-gray-500'
            }`}
          >
            <BsGrid3X3 className="w-3 h-3" />
            <span className="text-xs font-semibold uppercase tracking-widest">
              POSTS
            </span>
          </button>
          <button
            onClick={() => setActiveTab('videos')}
            className={`flex items-center justify-center gap-1.5 px-4 py-3 border-t transition ${
              activeTab === 'videos'
                ? 'border-gray-900 dark:border-white text-gray-900 dark:text-white'
                : 'border-transparent text-gray-400 dark:text-gray-500'
            }`}
          >
            <MdVideoLibrary className="w-3 h-3" />
            <span className="text-xs font-semibold uppercase tracking-widest">
              VIDEOS
            </span>
          </button>
        </div>
      </div>

      {/* Instagram Grid - Exactly 3 columns */}
      <div className="max-w-4xl mx-auto">
        {loading ? (
          <div className="grid grid-cols-3 gap-1">
            {[...Array(9)].map((_, i) => (
              <div key={i} className="aspect-square bg-gray-200 dark:bg-dark-800 animate-pulse" />
            ))}
          </div>
        ) : displayMedia.length === 0 ? (
          <div className="text-center py-20 px-4">
            <div className="w-16 h-16 rounded-full border-2 border-gray-900 dark:border-white mx-auto mb-4 flex items-center justify-center">
              {activeTab === 'posts' ? (
                <BsGrid3X3 className="w-7 h-7 text-gray-900 dark:text-white" />
              ) : (
                <MdVideoLibrary className="w-7 h-7 text-gray-900 dark:text-white" />
              )}
            </div>
            <h3 className="text-3xl font-light text-gray-900 dark:text-white mb-2">
              No Posts Yet
            </h3>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-1">
            {displayMedia.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
                className="aspect-square relative group cursor-pointer overflow-hidden bg-gray-100 dark:bg-dark-800"
                onClick={() => {
                  if (activeTab === 'posts') {
                    openLightbox(index);
                  }
                }}
              >
                <Image
                  src={item.thumbnailUrl || item.url}
                  alt={item.title || 'Post'}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 33vw, 300px"
                />
                
                {/* Video indicator - top right */}
                {'isReel' in item && (
                  <div className="absolute top-3 right-3 z-10">
                    <MdVideoLibrary className="w-5 h-5 text-white drop-shadow-lg" />
                  </div>
                )}

                {/* Instagram hover overlay with likes and comments */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <div className="flex items-center gap-6 text-white font-semibold">
                    <div className="flex items-center gap-2">
                      <svg className="w-6 h-6 fill-current" viewBox="0 0 48 48">
                        <path d="M34.6 3.1c-4.5 0-7.9 1.8-10.6 5.6-2.7-3.7-6.1-5.5-10.6-5.5C6 3.1 0 9.6 0 17.6c0 7.3 5.4 12 10.6 16.5.6.5 1.3 1.1 1.9 1.7l2.3 2c4.4 3.9 6.6 5.9 7.6 6.5.5.3 1.1.5 1.6.5s1.1-.2 1.6-.5c1-.6 2.8-2.2 7.8-6.8l2-1.8c.7-.6 1.3-1.2 2-1.7C42.7 29.6 48 25 48 17.6c0-8-6-14.5-13.4-14.5z"></path>
                      </svg>
                      <span>247</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <svg className="w-6 h-6 fill-current" viewBox="0 0 48 48">
                        <path d="M47.5 46.1l-2.8-11c1.8-3.3 2.8-7.1 2.8-11.1C47.5 11 37 .5 24 .5S.5 11 .5 24 11 47.5 24 47.5c4 0 7.8-1 11.1-2.8l11 2.8c.8.2 1.6-.6 1.4-1.4zm-3-22.1c0 4-1 7-2.6 10-.2.4-.3.9-.2 1.4l2.1 8.4-8.3-2.1c-.5-.1-1-.1-1.4.2-1.8 1-5.2 2.6-10 2.6-11.4 0-20.6-9.2-20.6-20.5S12.7 3.5 24 3.5 44.5 12.7 44.5 24z"></path>
                      </svg>
                      <span>18</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

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
