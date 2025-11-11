'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { FiGrid, FiVideo, FiBookmark, FiSettings, FiMail, FiMenu, FiX, FiHome, FiPackage, FiUser } from 'react-icons/fi';
import { BsGrid3X3 } from 'react-icons/bs';
import { MdVideoLibrary } from 'react-icons/md';
import LightboxModal from '@/components/LightboxModal';
import AlbumLightboxModal from '@/components/AlbumLightboxModal';
import StoriesViewer from '@/components/StoriesViewer';
import ThemeSwitcherModal from '@/components/ThemeSwitcherModal';
import PublicPWAInstallPrompt from '@/components/PublicPWAInstallPrompt';
import { MediaItem } from '@/types';
import { getSampleImages } from '@/lib/sample-data';
import { useLayoutTheme } from '@/contexts/ThemeContext';
import dynamic from 'next/dynamic';
import AnimatedIntro from '@/modules/intro/AnimatedIntro';
import RemerciementsSection from '@/modules/remerciements/RemerciementsSection';
import { useTheme } from 'next-themes';
import ProfessionalModeErrorBoundary from '@/components/ProfessionalModeErrorBoundary';

const ProfessionalHome = dynamic(() => import('./professional-home/page'), {
  ssr: false,
  loading: () => (
    <div className="fixed inset-0 flex items-center justify-center bg-white z-50">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-[#d4af37] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-600 font-lato">Loading Professional Mode...</p>
      </div>
    </div>
  ),
});

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
  primaryColor?: string;
  secondaryColor?: string;
  fontHeading?: string;
  fontBody?: string;
}

export default function HomePage() {
  const router = useRouter();
  const { currentTheme } = useLayoutTheme();
  const [images, setImages] = useState<MediaItem[]>([]);
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [settings, setSettings] = useState<SiteSettings>({});
  const [activeTab, setActiveTab] = useState<'posts' | 'videos'>('posts');
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [storiesOpen, setStoriesOpen] = useState(false);
  const [initialHighlightIndex, setInitialHighlightIndex] = useState(0);
  const [showIntro, setShowIntro] = useState(false);
  const [showThemeSwitcher, setShowThemeSwitcher] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Check if user has selected a mode before
    if (typeof window !== 'undefined') {
      const modeSelected = localStorage.getItem('modeSelected');
      if (!modeSelected) {
        // First-time visitor - redirect to mode selection
        router.push('/mode-selection');
        return;
      }
      
      // Check if user has visited before (for intro animation)
      const hasVisited = localStorage.getItem('hasVisited');
      if (!hasVisited) {
        setShowIntro(true);
      }
    }
  }, [router]);

  const handleIntroComplete = () => {
    setShowIntro(false);
    if (typeof window !== 'undefined') {
      localStorage.setItem('hasVisited', 'true');
    }
  };

  // If Professional theme, show Novo-style homepage with error boundary
  if (currentTheme === 'professional') {
    return (
      <ProfessionalModeErrorBoundary>
        <ProfessionalHome />
      </ProfessionalModeErrorBoundary>
    );
  }

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

  // Instagram Stories highlights data - Fetch from database or use fallback
  const [highlights, setHighlights] = useState([
    {
      id: 'about',
      name: 'About',
      coverImage: images[0]?.thumbnailUrl || '/placeholder.jpg',
      stories: [
        { id: 'about-1', image: images[0]?.url || '/placeholder.jpg', title: '👋 Meet the Photographer' },
        { id: 'about-2', image: images[1]?.url || '/placeholder.jpg', title: '📸 My Story' },
        { id: 'about-3', image: images[2]?.url || '/placeholder.jpg', title: '🎨 My Style' },
      ]
    },
    {
      id: 'videos',
      name: 'Videos',
      coverImage: videos[0]?.thumbnailUrl || '/placeholder.jpg',
      stories: videos.slice(0, 4).map((vid) => ({
        id: vid.id,
        image: vid.thumbnailUrl,
        title: vid.title
      }))
    },
    {
      id: 'packages',
      name: 'Packages',
      coverImage: images[3]?.thumbnailUrl || '/placeholder.jpg',
      stories: [
        { id: 'pack-1', image: images[3]?.url || '/placeholder.jpg', title: '� Wedding Package' },
        { id: 'pack-2', image: images[4]?.url || '/placeholder.jpg', title: '👨‍👩‍👧 Family Sessions' },
        { id: 'pack-3', image: images[5]?.url || '/placeholder.jpg', title: '🎉 Event Coverage' },
        { id: 'pack-4', image: images[6]?.url || '/placeholder.jpg', title: '📸 Portrait Sessions' },
      ]
    },
    {
      id: 'contact',
      name: 'Contact',
      coverImage: images[7]?.thumbnailUrl || '/placeholder.jpg',
      stories: [
        { id: 'contact-1', image: images[7]?.url || '/placeholder.jpg', title: '📱 Book Your Session' },
        { id: 'contact-2', image: images[8]?.url || '/placeholder.jpg', title: '✉️ Get in Touch' },
        { id: 'contact-3', image: images[9]?.url || '/placeholder.jpg', title: '📍 Location' },
      ]
    }
  ]);

  // Load Instagram highlights if available
  useEffect(() => {
    const loadInstagramHighlights = async () => {
      try {
        const response = await fetch('/api/instagram/highlights');
        if (response.ok) {
          const instagramHighlights = await response.json();
          if (instagramHighlights && instagramHighlights.length > 0) {
            setHighlights(instagramHighlights);
          }
        }
      } catch (error) {
        console.error('Failed to load Instagram highlights:', error);
        // Keep fallback highlights
      }
    };

    loadInstagramHighlights();
  }, []);

  const openStories = (index: number) => {
    setInitialHighlightIndex(index);
    setStoriesOpen(true);
  };

  // Prevent hydration errors
  if (!mounted) {
    return null;
  }

  return (
    <>
      {/* Animated Intro - First Visit Only */}
      {showIntro && <AnimatedIntro onComplete={handleIntroComplete} />}
      
      <div className="min-h-screen bg-white dark:bg-dark-900">
      {/* Top Navigation Bar - Instagram Style */}
      <div className="max-w-4xl mx-auto px-3 sm:px-4 md:px-6 pt-3 sm:pt-4 pb-2 flex justify-between items-center">
        <h1 className="text-base sm:text-lg md:text-xl font-semibold text-white tracking-tight truncate pr-2">
          {settings.siteName || 'Innov8 Production'}
        </h1>
        <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
          {/* Menu Button */}
          <button
            onClick={() => setMenuOpen(true)}
            className="p-2.5 hover:bg-gray-800 rounded-full transition-all active:scale-95 touch-manipulation group"
            aria-label="Open Menu"
            title="Open Navigation Menu"
          >
            <FiMenu className="w-5 h-5 text-gray-300 group-hover:text-white transition-colors" />
          </button>
        </div>
      </div>

      {/* Instagram Profile Header - Exact Layout */}
      <div className="max-w-4xl mx-auto px-3 sm:px-4 md:px-6 pt-2 sm:pt-4 pb-3 sm:pb-4">
        {/* Profile Section */}
        <div className="flex gap-3 xs:gap-4 sm:gap-6 md:gap-8 lg:gap-20 mb-6 xs:mb-8 sm:mb-11">
          {/* Profile Picture - Left Side */}
          <div className="flex-shrink-0">
            <div className="relative">
              <div className="w-16 h-16 xs:w-20 xs:h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 lg:w-36 lg:h-36 rounded-full overflow-hidden ring-2 ring-gray-200 dark:ring-gray-700 shadow-lg">
                <div className="w-full h-full rounded-full overflow-hidden bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
                  {settings.heroImage ? (
                    <Image
                      src={settings.heroImage}
                      alt="Profile"
                      width={150}
                      height={150}
                      className="w-full h-full object-cover"
                      priority
                    />
                  ) : (
                    <span className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl font-bold text-white">
                      {settings.siteName?.charAt(0) || 'A'}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Profile Info - Right Side */}
          <div className="flex-1 min-w-0">
            {/* Username */}
            <div className="flex items-center gap-2 sm:gap-3 mb-2 xs:mb-3 sm:mb-4 md:mb-5">
              <h1 
                className="text-sm xs:text-base sm:text-lg md:text-xl font-light text-gray-900 dark:text-gray-100 truncate"
                style={{ fontFamily: settings.fontHeading || 'Poppins, sans-serif' }}
              >
                {settings.siteName?.toLowerCase().replace(/\s+/g, '_') || 'innov8.production'}
              </h1>
            </div>

            {/* Stats */}
            <div className="flex gap-3 xs:gap-4 sm:gap-6 md:gap-10 mb-2 xs:mb-3 sm:mb-4 md:mb-5 text-xs xs:text-sm sm:text-base">
              <div className="flex-shrink-0">
                <span className="font-semibold text-gray-900 dark:text-gray-100 block xs:inline">
                  {images.length + videos.length}
                </span>
                <span className="text-gray-900 dark:text-gray-100 ml-0 xs:ml-1 block xs:inline text-[10px] xs:text-xs sm:text-sm"> posts</span>
              </div>
              <div className="flex-shrink-0">
                <span className="font-semibold text-gray-900 dark:text-gray-100 block xs:inline">
                  2.8k
                </span>
                <span className="text-gray-900 dark:text-gray-100 ml-0 xs:ml-1 block xs:inline text-[10px] xs:text-xs sm:text-sm"> followers</span>
              </div>
              <div className="flex-shrink-0">
                <span className="font-semibold text-gray-900 dark:text-gray-100 block xs:inline">
                  312
                </span>
                <span className="text-gray-900 dark:text-gray-100 ml-0 xs:ml-1 block xs:inline text-[10px] xs:text-xs sm:text-sm"> following</span>
              </div>
            </div>

            {/* Bio */}
            <div className="text-[11px] xs:text-xs sm:text-sm leading-snug" style={{ fontFamily: settings.fontBody || 'Inter, sans-serif' }}>
              <div 
                className="font-semibold text-gray-900 dark:text-gray-100 mb-0.5 xs:mb-1"
                style={{ fontFamily: settings.fontHeading || 'Poppins, sans-serif' }}
              >
                {settings.tagline || 'Professional Photographer'}
              </div>
              <div className="text-gray-900 dark:text-gray-100 whitespace-pre-line break-words line-clamp-4 xs:line-clamp-none">
                {settings.description || '📸 Creative Wedding & Event Photography\n✨ Weddings · Engagements · Events · Lifestyle\n📍 Moknine, Sousse, Tunisia\n👇 Book your session'}
              </div>
              <Link href="/contact" className="font-semibold text-blue-900 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 mt-0.5 xs:mt-1 inline-block break-all text-[11px] xs:text-xs sm:text-sm">
                innov8production.com
              </Link>
            </div>
          </div>
        </div>

        {/* Action Buttons - Instagram Style */}
        <div className="flex gap-2 xs:gap-2.5 sm:gap-3 mb-4 xs:mb-6 sm:mb-8">
          <Link href="/booking" className="flex-1">
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full px-2 xs:px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg font-semibold transition-all text-[11px] xs:text-xs sm:text-sm text-white shadow-md hover:shadow-lg touch-manipulation relative overflow-hidden group"
              style={{ 
                backgroundColor: settings.primaryColor || '#c67548'
              }}
            >
              <span className="relative z-10">Demande un Devis</span>
              <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity" />
            </motion.button>
          </Link>
          <Link href="/contact" className="flex-1">
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full px-2 xs:px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg font-semibold transition-all text-[11px] xs:text-xs sm:text-sm bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600 shadow-sm hover:shadow-md touch-manipulation"
            >
              Contact
            </motion.button>
          </Link>
          <Link href="/about" className="flex-1">
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full px-2 xs:px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg font-semibold transition-all text-[11px] xs:text-xs sm:text-sm bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600 shadow-sm hover:shadow-md touch-manipulation"
            >
              About Us
            </motion.button>
          </Link>
        </div>

        {/* Highlights - Instagram Stories Style */}
        <div className="flex gap-4 xs:gap-5 sm:gap-6 overflow-x-auto pb-4 mb-1 px-1" style={{ 
          scrollSnapType: 'x mandatory',
          WebkitOverflowScrolling: 'touch',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none'
        }}>
          <button 
            onClick={() => openStories(0)} 
            className="flex flex-col items-center gap-1.5 flex-shrink-0 active:scale-95 transition-all hover:opacity-80" 
            style={{ scrollSnapAlign: 'start' }}
          >
            <div className="relative">
              <div 
                className="w-16 h-16 xs:w-18 xs:h-18 sm:w-20 sm:h-20 rounded-full p-[3px] bg-gradient-to-tr"
                style={{ 
                  backgroundImage: `linear-gradient(135deg, ${settings.primaryColor || '#c67548'}, ${settings.primaryColor || '#c67548'}dd)` 
                }}
              >
                <div className="w-full h-full rounded-full overflow-hidden bg-white dark:bg-dark-900 p-[2px]">
                  <div className="w-full h-full rounded-full overflow-hidden">
                    {highlights[0]?.coverImage ? (
                      <Image
                        src={highlights[0].coverImage}
                        alt="About"
                        width={80}
                        height={80}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div 
                        className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary to-primary-600"
                      >
                        <BsGrid3X3 className="w-6 h-6 text-white" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <span className="text-xs font-medium text-gray-900 dark:text-gray-100 max-w-[70px] truncate">About</span>
          </button>
          
          <button 
            onClick={() => openStories(1)} 
            className="flex flex-col items-center gap-1.5 flex-shrink-0 active:scale-95 transition-all hover:opacity-80" 
            style={{ scrollSnapAlign: 'start' }}
          >
            <div className="relative">
              <div 
                className="w-16 h-16 xs:w-18 xs:h-18 sm:w-20 sm:h-20 rounded-full p-[3px] bg-gradient-to-tr"
                style={{ 
                  backgroundImage: `linear-gradient(135deg, ${settings.primaryColor || '#c67548'}, ${settings.primaryColor || '#c67548'}dd)` 
                }}
              >
                <div className="w-full h-full rounded-full overflow-hidden bg-white dark:bg-dark-900 p-[2px]">
                  <div className="w-full h-full rounded-full overflow-hidden">
                    {highlights[1]?.coverImage ? (
                      <Image
                        src={highlights[1].coverImage}
                        alt="Videos"
                        width={80}
                        height={80}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-500 to-purple-600">
                        <MdVideoLibrary className="w-6 h-6 text-white" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <span className="text-xs font-medium text-gray-900 dark:text-gray-100 max-w-[70px] truncate">Videos</span>
          </button>
          
          <button 
            onClick={() => openStories(2)} 
            className="flex flex-col items-center gap-1.5 flex-shrink-0 active:scale-95 transition-all hover:opacity-80" 
            style={{ scrollSnapAlign: 'start' }}
          >
            <div className="relative">
              <div 
                className="w-16 h-16 xs:w-18 xs:h-18 sm:w-20 sm:h-20 rounded-full p-[3px] bg-gradient-to-tr"
                style={{ 
                  backgroundImage: `linear-gradient(135deg, ${settings.primaryColor || '#c67548'}, ${settings.primaryColor || '#c67548'}dd)` 
                }}
              >
                <div className="w-full h-full rounded-full overflow-hidden bg-white dark:bg-dark-900 p-[2px]">
                  <div className="w-full h-full rounded-full overflow-hidden">
                    {highlights[2]?.coverImage ? (
                      <Image
                        src={highlights[2].coverImage}
                        alt="Packages"
                        width={80}
                        height={80}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-green-500 to-green-600">
                        <FiPackage className="w-6 h-6 text-white" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <span className="text-xs font-medium text-gray-900 dark:text-gray-100 max-w-[70px] truncate">Packages</span>
          </button>
          
          <button 
            onClick={() => openStories(3)} 
            className="flex flex-col items-center gap-1.5 flex-shrink-0 active:scale-95 transition-all hover:opacity-80" 
            style={{ scrollSnapAlign: 'start' }}
          >
            <div className="relative">
              <div 
                className="w-16 h-16 xs:w-18 xs:h-18 sm:w-20 sm:h-20 rounded-full p-[3px] bg-gradient-to-tr"
                style={{ 
                  backgroundImage: `linear-gradient(135deg, ${settings.primaryColor || '#c67548'}, ${settings.primaryColor || '#c67548'}dd)` 
                }}
              >
                <div className="w-full h-full rounded-full overflow-hidden bg-white dark:bg-dark-900 p-[2px]">
                  <div className="w-full h-full rounded-full overflow-hidden">
                    {highlights[3]?.coverImage ? (
                      <Image
                        src={highlights[3].coverImage}
                        alt="Contact"
                        width={80}
                        height={80}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-pink-500 to-pink-600">
                        <FiMail className="w-6 h-6 text-white" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <span className="text-xs font-medium text-gray-900 dark:text-gray-100 max-w-[70px] truncate">Contact</span>
          </button>
        </div>
      </div>

      {/* Tabs - Instagram Style */}
      <div className="border-t border-gray-200 dark:border-gray-800 sticky top-0 bg-white dark:bg-dark-900 z-10">
        <div className="max-w-4xl mx-auto flex justify-center">
          <button
            onClick={() => setActiveTab('posts')}
            className={`flex items-center justify-center gap-1.5 px-6 sm:px-8 py-3.5 sm:py-4 border-t-2 transition min-h-[48px] ${
              activeTab === 'posts'
                ? 'border-gray-900 dark:border-white text-gray-900 dark:text-white'
                : 'border-transparent text-gray-400 dark:text-gray-500'
            }`}
          >
            <BsGrid3X3 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="text-xs sm:text-sm font-semibold uppercase tracking-widest">
              POSTS
            </span>
          </button>
          <button
            onClick={() => setActiveTab('videos')}
            className={`flex items-center justify-center gap-1.5 px-6 sm:px-8 py-3.5 sm:py-4 border-t-2 transition min-h-[48px] ${
              activeTab === 'videos'
                ? 'border-gray-900 dark:border-white text-gray-900 dark:text-white'
                : 'border-transparent text-gray-400 dark:text-gray-500'
            }`}
          >
            <MdVideoLibrary className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="text-xs sm:text-sm font-semibold uppercase tracking-widest">
              VIDEOS
            </span>
          </button>
        </div>
      </div>

      {/* Instagram Grid - Exactly 3 columns */}
      <div className="max-w-4xl mx-auto">
        {loading ? (
          <div className="grid grid-cols-3 gap-0.5 sm:gap-1">
            {[...Array(9)].map((_, i) => (
              <div key={i} className="aspect-square bg-gray-200 dark:bg-dark-800 animate-pulse" />
            ))}
          </div>
        ) : displayMedia.length === 0 ? (
          <div className="text-center py-16 sm:py-20 px-4">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full border-2 border-gray-900 dark:border-white mx-auto mb-4 flex items-center justify-center">
              {activeTab === 'posts' ? (
                <BsGrid3X3 className="w-6 h-6 sm:w-7 sm:h-7 text-gray-900 dark:text-white" />
              ) : (
                <MdVideoLibrary className="w-6 h-6 sm:w-7 sm:h-7 text-gray-900 dark:text-white" />
              )}
            </div>
            <h3 className="text-2xl sm:text-3xl font-light text-gray-900 dark:text-white mb-2">
              No Posts Yet
            </h3>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-0.5 sm:gap-1">
            {displayMedia.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
                className="aspect-square relative group cursor-pointer overflow-hidden bg-gray-100 dark:bg-dark-800 active:opacity-75 transition-opacity"
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
                  <div className="absolute top-2 xs:top-3 right-2 xs:right-3 z-10">
                    <MdVideoLibrary className="w-4 h-4 xs:w-5 xs:h-5 text-white drop-shadow-lg" />
                  </div>
                )}

                {/* Album indicator (multiple images) - top right */}
                {'albumImages' in item && item.albumImages && item.albumImages.length > 1 && (
                  <div className="absolute top-2 xs:top-3 right-2 xs:right-3 z-10">
                    <svg className="w-4 h-4 xs:w-5 xs:h-5 text-white drop-shadow-lg" fill="currentColor" viewBox="0 0 48 48">
                      <path d="M34.8 29.7V11c0-2.9-2.3-5.2-5.2-5.2H11c-2.9 0-5.2 2.3-5.2 5.2v18.7c0 2.9 2.3 5.2 5.2 5.2h18.7c2.8-.1 5.1-2.4 5.1-5.2zM39.2 15v16.1c0 4.5-3.7 8.2-8.2 8.2H14.9c-.6 0-.9.7-.5 1.1 1 1.1 2.4 1.8 4.1 1.8h13.4c5.7 0 10.3-4.6 10.3-10.3V18.5c0-1.6-.7-3.1-1.8-4.1-.5-.4-1.2 0-1.2.6z"></path>
                    </svg>
                  </div>
                )}

                {/* Instagram hover overlay with likes and comments */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <div className="flex items-center gap-4 sm:gap-6 text-white font-semibold text-xs sm:text-base">
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <svg className="w-5 h-5 sm:w-6 sm:h-6 fill-current" viewBox="0 0 48 48">
                        <path d="M34.6 3.1c-4.5 0-7.9 1.8-10.6 5.6-2.7-3.7-6.1-5.5-10.6-5.5C6 3.1 0 9.6 0 17.6c0 7.3 5.4 12 10.6 16.5.6.5 1.3 1.1 1.9 1.7l2.3 2c4.4 3.9 6.6 5.9 7.6 6.5.5.3 1.1.5 1.6.5s1.1-.2 1.6-.5c1-.6 2.8-2.2 7.8-6.8l2-1.8c.7-.6 1.3-1.2 2-1.7C42.7 29.6 48 25 48 17.6c0-8-6-14.5-13.4-14.5z"></path>
                      </svg>
                      <span className="hidden xs:inline">247</span>
                    </div>
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <svg className="w-5 h-5 sm:w-6 sm:h-6 fill-current" viewBox="0 0 48 48">
                        <path d="M47.5 46.1l-2.8-11c1.8-3.3 2.8-7.1 2.8-11.1C47.5 11 37 .5 24 .5S.5 11 .5 24 11 47.5 24 47.5c4 0 7.8-1 11.1-2.8l11 2.8c.8.2 1.6-.6 1.4-1.4zm-3-22.1c0 4-1 7-2.6 10-.2.4-.3.9-.2 1.4l2.1 8.4-8.3-2.1c-.5-.1-1-.1-1.4.2-1.8 1-5.2 2.6-10 2.6-11.4 0-20.6-9.2-20.6-20.5S12.7 3.5 24 3.5 44.5 12.7 44.5 24z"></path>
                      </svg>
                      <span className="hidden xs:inline">18</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Remerciements Section */}
      <RemerciementsSection 
        autoPlayInterval={5000}
        showDots={true}
      />

      {/* Album Lightbox Modal - For Posts (supports albums) */}
      <AlbumLightboxModal
        posts={images}
        currentPostIndex={currentImageIndex}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
      />

      {/* Instagram Stories Viewer */}
      {storiesOpen && (
        <StoriesViewer
          highlights={highlights}
          onClose={() => setStoriesOpen(false)}
          initialHighlightIndex={initialHighlightIndex}
        />
      )}

      {/* Theme Switcher Modal */}
      <ThemeSwitcherModal 
        isOpen={showThemeSwitcher}
        onClose={() => setShowThemeSwitcher(false)}
      />

      {/* Navigation Menu - Instagram Style Slide-up */}
      {menuOpen && (
        <>
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={() => setMenuOpen(false)}
          />
          
          {/* Menu Panel - Slide from bottom */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 z-50 rounded-t-3xl shadow-2xl max-h-[85vh] overflow-hidden"
          >
            {/* Handle Bar */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-12 h-1.5 bg-gray-300 dark:bg-gray-700 rounded-full"></div>
            </div>

            {/* Menu Header */}
            <div className="px-6 pt-2 pb-4 border-b border-gray-200 dark:border-gray-800">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center">Navigation</h2>
            </div>

            {/* Menu Items - Instagram Style */}
            <nav className="p-3 overflow-y-auto max-h-[calc(85vh-120px)]">
              <Link 
                href="/" 
                onClick={() => setMenuOpen(false)} 
                className="flex items-center gap-4 p-4 active:bg-gray-100 dark:active:bg-gray-800 rounded-2xl transition-colors mb-1"
              >
                <div className="w-11 h-11 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
                  <FiHome className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <span className="text-lg font-semibold text-gray-900 dark:text-white block">Home</span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">Explore our work</span>
                </div>
              </Link>
              
              <Link 
                href="/about" 
                onClick={() => setMenuOpen(false)} 
                className="flex items-center gap-4 p-4 active:bg-gray-100 dark:active:bg-gray-800 rounded-2xl transition-colors mb-1"
              >
                <div className="w-11 h-11 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
                  <FiUser className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <span className="text-lg font-semibold text-gray-900 dark:text-white block">About Us</span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">Our story & mission</span>
                </div>
              </Link>

              <Link 
                href="/booking" 
                onClick={() => setMenuOpen(false)} 
                className="flex items-center gap-4 p-4 active:bg-gray-100 dark:active:bg-gray-800 rounded-2xl transition-colors mb-1"
              >
                <div className="w-11 h-11 rounded-full bg-gradient-to-br from-yellow-500 to-yellow-600 flex items-center justify-center">
                  <FiBookmark className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <span className="text-lg font-semibold text-gray-900 dark:text-white block">Book a Session</span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">Reserve your date</span>
                </div>
              </Link>
              
              <Link 
                href="/contact" 
                onClick={() => setMenuOpen(false)} 
                className="flex items-center gap-4 p-4 active:bg-gray-100 dark:active:bg-gray-800 rounded-2xl transition-colors mb-1"
              >
                <div className="w-11 h-11 rounded-full bg-gradient-to-br from-pink-500 to-pink-600 flex items-center justify-center">
                  <FiMail className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <span className="text-lg font-semibold text-gray-900 dark:text-white block">Contact</span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">Get in touch</span>
                </div>
              </Link>

              {/* Divider */}
              <div className="border-t border-gray-200 dark:border-gray-800 my-3"></div>

              {/* Admin & Client Links */}
              <Link 
                href="/admin/dashboard" 
                onClick={() => setMenuOpen(false)} 
                className="flex items-center gap-4 p-4 active:bg-gray-100 dark:active:bg-gray-800 rounded-2xl transition-colors mb-1"
              >
                <div className="w-11 h-11 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center">
                  <FiSettings className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <span className="text-lg font-semibold text-gray-900 dark:text-white block">Admin Dashboard</span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">Manage content & settings</span>
                </div>
              </Link>

              <Link 
                href="/client/login" 
                onClick={() => setMenuOpen(false)} 
                className="flex items-center gap-4 p-4 active:bg-gray-100 dark:active:bg-gray-800 rounded-2xl transition-colors mb-1"
              >
                <div className="w-11 h-11 rounded-full bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center">
                  <FiUser className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <span className="text-lg font-semibold text-gray-900 dark:text-white block">Client Portal</span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">Access your gallery</span>
                </div>
              </Link>

              {/* Theme Settings */}
              <button 
                onClick={() => { setMenuOpen(false); setShowThemeSwitcher(true); }}
                className="w-full flex items-center gap-4 p-4 active:bg-gray-100 dark:active:bg-gray-800 rounded-2xl transition-colors"
              >
                <div className="w-11 h-11 rounded-full bg-gradient-to-br from-gray-500 to-gray-600 flex items-center justify-center">
                  <FiGrid className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 text-left">
                  <span className="text-lg font-semibold text-gray-900 dark:text-white block">Switch Theme</span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">Simple ⇄ Professional</span>
                </div>
              </button>
            </nav>

            {/* Close Button */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
              <button
                onClick={() => setMenuOpen(false)}
                className="w-full py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-full font-semibold text-base active:scale-95 transition-transform"
              >
                Close
              </button>
            </div>
          </motion.div>
        </>
      )}
    </div>

    {/* PWA Install Prompt */}
    <PublicPWAInstallPrompt />
    </>
  );
}
