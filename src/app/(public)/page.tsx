'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { FiGrid, FiVideo, FiBookmark, FiSettings, FiMail, FiMenu, FiX, FiHome, FiPackage, FiUser, FiRotateCw } from 'react-icons/fi';
import { BsGrid3X3 } from 'react-icons/bs';
import { MdVideoLibrary } from 'react-icons/md';
import LightboxModal from '@/components/LightboxModal';
import AlbumLightboxModal from '@/components/AlbumLightboxModal';
import StoriesViewer from '@/components/StoriesViewer';
import ThemeSwitcherModal from '@/components/ThemeSwitcherModal';
import PublicPWAInstallPrompt from '@/components/PublicPWAInstallPrompt';
import { MediaItem, Category } from '@/types';
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
  createdAt?: string;
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

interface Post {
  id: string;
  type?: 'post';
  title: string;
  description?: string;
  category: string;
  coverImage: string;
  imageCount: number;
  images: {
    id: string;
    url: string;
    thumbnailUrl?: string;
    alt?: string;
    width?: number;
    height?: number;
    title?: string;
    description?: string;
  }[];
  tags?: string[];
  isInstagram?: boolean;
  instagramPermalink?: string;
  createdAt: string;
  featured?: boolean;
}

export default function HomePage() {
  const router = useRouter();
  const { currentTheme } = useLayoutTheme();
  const [posts, setPosts] = useState<Post[]>([]);
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [settings, setSettings] = useState<SiteSettings>({});
  const [activeTab, setActiveTab] = useState<'posts' | 'videos'>('posts');
  const [albumLightboxOpen, setAlbumLightboxOpen] = useState(false);
  const [videoPlayerOpen, setVideoPlayerOpen] = useState(false);
  const [currentVideo, setCurrentVideo] = useState<VideoItem | null>(null);
  const [currentPost, setCurrentPost] = useState<Post | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [storiesOpen, setStoriesOpen] = useState(false);
  const [initialHighlightIndex, setInitialHighlightIndex] = useState(0);
  const [showIntro, setShowIntro] = useState(false);
  const [showThemeSwitcher, setShowThemeSwitcher] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [isPulling, setIsPulling] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Check if user has selected a mode before
    if (typeof window !== 'undefined') {
      const modeSelected = localStorage.getItem('modeSelected');
      const currentPath = window.location.pathname;
      
      // Only redirect to mode selection if not already there and mode not selected
      if (!modeSelected && currentPath !== '/mode-selection') {
        // First-time visitor - redirect to mode selection
        router.push('/mode-selection');
        return;
      }
      
      // Check if user has visited before (for intro animation)
      const hasVisited = localStorage.getItem('hasVisited');
      if (!hasVisited && modeSelected) {
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

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Clear any cached posts first
      setPosts([]);
      setVideos([]);
      
      // Load settings
      const settingsRes = await fetch('/api/admin/settings', {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
        },
      });
      if (settingsRes.ok) {
        const data = await settingsRes.json();
        setSettings(data);
      }

      // Load posts with aggressive cache-busting
      const timestamp = new Date().getTime();
      const random = Math.random().toString(36).substring(7);
      const postsRes = await fetch(`/api/public/posts?homepage=true&limit=30&_t=${timestamp}&_r=${random}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
      });
      
      let fetchedPosts: Post[] = [];
      if (postsRes.ok) {
        fetchedPosts = await postsRes.json();
        console.log('Loaded posts:', fetchedPosts.length, 'posts');
      } else {
        console.error('Failed to load posts:', postsRes.status);
      }

      // Load Instagram posts and merge with regular posts
      const instagramRes = await fetch('/api/instagram/posts', {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
        },
      });

      if (instagramRes.ok) {
        const instagramPosts = await instagramRes.json();
        console.log('Loaded Instagram posts:', instagramPosts.length);
        
        // Convert Instagram posts to Post format
        const convertedInstagramPosts: Post[] = instagramPosts.map((instaPost: any) => ({
          id: instaPost.id,
          title: instaPost.caption ? instaPost.caption.substring(0, 50) : 'Instagram Post',
          description: instaPost.caption || '',
          coverImage: instaPost.thumbnailUrl,
          images: [{
            id: instaPost.id,
            url: instaPost.mediaUrl,
            alt: instaPost.caption || 'Instagram Post',
          }],
          imageCount: 1,
          category: 'Instagram' as Category,
          tags: ['Instagram'],
          isInstagram: true,
          instagramPermalink: instaPost.permalink,
          createdAt: instaPost.timestamp,
        }));

        // Merge and sort by date (most recent first)
        const allPosts = [...fetchedPosts, ...convertedInstagramPosts].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        setPosts(allPosts.slice(0, 30)); // Limit to 30 posts total
      } else {
        // If Instagram fetch fails, just use regular posts
        if (fetchedPosts.length > 0) {
          setPosts(fetchedPosts);
        } else {
          console.warn('No posts found');
        }
      }

      // Load homepage videos
      const videosRes = await fetch(`/api/videos?homepage=true&_t=${timestamp}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
      });
      
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
          createdAt: vid.createdAt,
          type: 'video',
        }));
        setVideos(fetchedVideos);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
  };

  // Pull to refresh functionality
  useEffect(() => {
    if (!mounted) return;

    let startY = 0;
    const threshold = 80;

    const handleTouchStart = (e: TouchEvent) => {
      if (window.scrollY === 0) {
        startY = e.touches[0].clientY;
        setIsPulling(true);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isPulling || window.scrollY > 0) return;

      const currentY = e.touches[0].clientY;
      const distance = currentY - startY;

      if (distance > 0 && distance < threshold * 2) {
        setPullDistance(distance);
      }
    };

    const handleTouchEnd = () => {
      if (pullDistance > threshold && !refreshing) {
        handleRefresh();
      }
      setPullDistance(0);
      setIsPulling(false);
    };

    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: true });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [mounted, isPulling, pullDistance, refreshing]);

  const openPostLightbox = (post: Post, imageIndex: number = 0) => {
    setCurrentPost(post);
    setCurrentImageIndex(imageIndex);
    setAlbumLightboxOpen(true);
  };

  // Display media based on active tab
  const displayMedia = activeTab === 'posts' 
    ? posts.filter(p => p.coverImage) // Only show posts with images
    : videos.filter(v => v.url && v.thumbnailUrl); // Only show videos with valid URLs

  // Instagram Stories highlights data - Fetch from database or use fallback
  const [highlights, setHighlights] = useState([
    {
      id: 'about',
      name: 'About',
      coverImage: posts[0]?.coverImage || '/placeholder.jpg',
      stories: [
        { id: 'about-1', image: posts[0]?.images[0]?.url || '/placeholder.jpg', title: '👋 Meet the Photographer' },
        { id: 'about-2', image: posts[1]?.images[0]?.url || '/placeholder.jpg', title: '📸 My Story' },
        { id: 'about-3', image: posts[2]?.images[0]?.url || '/placeholder.jpg', title: '🎨 My Style' },
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
      coverImage: posts[3]?.coverImage || '/placeholder.jpg',
      stories: [
        { id: 'pack-1', image: posts[3]?.images[0]?.url || '/placeholder.jpg', title: '💍 Wedding Package' },
        { id: 'pack-2', image: posts[4]?.images[0]?.url || '/placeholder.jpg', title: '👨‍👩‍👧 Family Sessions' },
        { id: 'pack-3', image: posts[5]?.images[0]?.url || '/placeholder.jpg', title: '🎉 Event Coverage' },
        { id: 'pack-4', image: posts[6]?.images[0]?.url || '/placeholder.jpg', title: '📸 Portrait Sessions' },
      ]
    },
    {
      id: 'contact',
      name: 'Contact',
      coverImage: posts[7]?.coverImage || '/placeholder.jpg',
      stories: [
        { id: 'contact-1', image: posts[7]?.images[0]?.url || '/placeholder.jpg', title: '📱 Book Your Session' },
        { id: 'contact-2', image: posts[8]?.images[0]?.url || '/placeholder.jpg', title: '✉️ Get in Touch' },
        { id: 'contact-3', image: posts[9]?.images[0]?.url || '/placeholder.jpg', title: '📍 Location' },
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
      
      <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Pull to Refresh Indicator */}
      {pullDistance > 0 && (
        <motion.div
          className="fixed top-0 left-0 right-0 flex justify-center z-50 pointer-events-none"
          style={{
            transform: `translateY(${Math.min(pullDistance - 50, 30)}px)`,
            opacity: Math.min(pullDistance / 80, 1)
          }}
        >
          <div className="mt-4 bg-white dark:bg-gray-800 rounded-full shadow-2xl p-3">
            {pullDistance > 80 ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </motion.div>
            ) : (
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            )}
          </div>
        </motion.div>
      )}

      {/* Top Navigation Bar - Instagram Style */}
      <div className="max-w-4xl mx-auto px-3 sm:px-4 md:px-6 pt-3 sm:pt-4 pb-2 flex justify-between items-center">
        <motion.h1 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-base sm:text-lg md:text-xl font-semibold text-gray-900 dark:text-white tracking-tight truncate pr-2"
        >
          {settings.siteName || 'Innov8 Production'}
        </motion.h1>
        <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
          {/* Menu Button */}
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            onClick={() => setMenuOpen(true)}
            className="p-2.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-all active:scale-95 touch-manipulation group"
            aria-label="Open Menu"
            title="Open Navigation Menu"
          >
            <FiMenu className="w-5 h-5 text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors" />
          </motion.button>
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
                  {posts.length + videos.length}
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

      {/* Instagram Grid */}
      <div className="max-w-4xl mx-auto">
        {loading ? (
          <div className="grid grid-cols-3 gap-0.5 sm:gap-1">
            {[...Array(9)].map((_, i) => (
              <div key={i} className="aspect-square bg-gray-200 dark:bg-dark-800 animate-pulse" />
            ))}
          </div>
        ) : displayMedia.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16 sm:py-20 px-4"
          >
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-3 border-gray-200 dark:border-gray-700 mx-auto mb-6 flex items-center justify-center bg-gray-50 dark:bg-gray-800"
            >
              {activeTab === 'posts' ? (
                <BsGrid3X3 className="w-7 h-7 sm:w-9 sm:h-9 text-gray-400 dark:text-gray-500" />
              ) : (
                <MdVideoLibrary className="w-7 h-7 sm:w-9 sm:h-9 text-gray-400 dark:text-gray-500" />
              )}
            </motion.div>
            <h3 className="text-2xl sm:text-3xl font-light text-gray-900 dark:text-white mb-3">
              No {activeTab === 'posts' ? 'Posts' : 'Videos'} Yet
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm sm:text-base">
              Check back soon for amazing content!
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleRefresh}
              disabled={refreshing}
              className="px-6 py-3 bg-primary text-white rounded-full font-medium shadow-lg hover:shadow-xl transition-shadow disabled:opacity-50"
            >
              {refreshing ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Refreshing...
                </span>
              ) : (
                'Refresh Content'
              )}
            </motion.button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-3 gap-0.5 sm:gap-1">
            {activeTab === 'posts' ? (
              posts.filter(p => p.coverImage).map((post, index) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ 
                    duration: 0.4,
                    delay: index * 0.05,
                    ease: [0.4, 0, 0.2, 1]
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="aspect-square relative group cursor-pointer overflow-hidden bg-gray-100 dark:bg-dark-800 shadow-sm hover:shadow-xl transition-shadow duration-300"
                  onClick={() => openPostLightbox(post, 0)}
                >
                  <Image
                    src={post.coverImage}
                    alt={post.title || 'Post'}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                    sizes="(max-width: 768px) 33vw, 300px"
                    priority={index < 6}
                  />
                  
                  {/* Hover overlay with gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  {/* Instagram badge - top left */}
                  {post.isInstagram && (
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ delay: index * 0.05 + 0.2, type: "spring" }}
                      className="absolute top-2 xs:top-3 left-2 xs:left-3 z-10 bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 rounded-full p-1.5 shadow-lg"
                    >
                      <svg className="w-3 h-3 xs:w-4 xs:h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                      </svg>
                    </motion.div>
                  )}

                  {/* Album indicator (multiple images) - top right */}
                  {post.imageCount > 1 && !post.isInstagram && (
                    <motion.div 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: index * 0.05 + 0.2 }}
                      className="absolute top-2 xs:top-3 right-2 xs:right-3 z-10 bg-black/30 backdrop-blur-sm rounded-full p-1.5"
                    >
                      <svg className="w-3 h-3 xs:w-4 xs:h-4 text-white" fill="currentColor" viewBox="0 0 48 48">
                        <path d="M34.8 29.7V11c0-2.9-2.3-5.2-5.2-5.2H11c-2.9 0-5.2 2.3-5.2 5.2v18.7c0 2.9 2.3 5.2 5.2 5.2h18.7c2.8-.1 5.1-2.4 5.1-5.2zM39.2 15v16.1c0 4.5-3.7 8.2-8.2 8.2H14.9c-.6 0-.9.7-.5 1.1 1 1.1 2.4 1.8 4.1 1.8h13.4c5.7 0 10.3-4.6 10.3-10.3V18.5c0-1.6-.7-3.1-1.8-4.1-.5-.4-1.2 0-1.2.6z"></path>
                      </svg>
                    </motion.div>
                  )}

                  {/* Title overlay on hover */}
                  {post.title && (
                    <div className="absolute bottom-0 left-0 right-0 p-2 xs:p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                      <p className="text-white text-xs xs:text-sm font-medium line-clamp-2 drop-shadow-lg">
                        {post.title}
                      </p>
                    </div>
                  )}
                </motion.div>
              ))
            ) : (
              videos.filter(v => v.url && v.thumbnailUrl).map((video, index) => (
                <motion.div
                  key={video.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ 
                    duration: 0.4,
                    delay: index * 0.05,
                    ease: [0.4, 0, 0.2, 1]
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="aspect-square relative group cursor-pointer overflow-hidden bg-gray-100 dark:bg-dark-800 shadow-sm hover:shadow-xl transition-shadow duration-300"
                  onClick={() => {
                    setCurrentVideo(video);
                    setVideoPlayerOpen(true);
                  }}
                >
                  <Image
                    src={video.thumbnailUrl}
                    alt={video.title || 'Video'}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                    sizes="(max-width: 768px) 33vw, 300px"
                    priority={index < 6}
                  />
                  
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  {/* Video indicator - top right */}
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: index * 0.05 + 0.2 }}
                    className="absolute top-2 xs:top-3 right-2 xs:right-3 z-10 bg-black/30 backdrop-blur-sm rounded-full p-1.5"
                  >
                    <MdVideoLibrary className="w-3 h-3 xs:w-4 xs:h-4 text-white" />
                  </motion.div>

                  {/* Play button overlay */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="w-12 h-12 xs:w-14 xs:h-14 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-xl">
                      <div className="w-0 h-0 border-l-8 border-l-gray-900 border-y-6 border-y-transparent ml-1" />
                    </div>
                  </div>

                  {/* Title overlay */}
                  {video.title && (
                    <div className="absolute bottom-0 left-0 right-0 p-2 xs:p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                      <p className="text-white text-xs xs:text-sm font-medium line-clamp-2 drop-shadow-lg">
                        {video.title}
                      </p>
                    </div>
                  )}
                </motion.div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Floating Refresh Button */}
      {!loading && posts.length > 0 && (
        <motion.button
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleRefresh}
          disabled={refreshing}
          className="fixed bottom-20 right-6 z-40 w-14 h-14 bg-gradient-to-br from-primary to-primary-dark text-white rounded-full shadow-2xl flex items-center justify-center backdrop-blur-sm disabled:opacity-50 hover:shadow-3xl transition-all"
          title="Refresh content to see latest photos"
        >
          {refreshing ? (
            <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <motion.svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              animate={{ rotate: 0 }}
              whileHover={{ rotate: 180 }}
              transition={{ duration: 0.5 }}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </motion.svg>
          )}
        </motion.button>
      )}

      {/* Remerciements Section */}
      <RemerciementsSection 
        autoPlayInterval={5000}
        showDots={true}
      />

      {/* Album Lightbox Modal - For Posts (supports albums) */}
      {currentPost && (
        <AlbumLightboxModal
          posts={[{
            id: currentPost.id,
            publicId: currentPost.id,
            url: currentPost.coverImage,
            thumbnailUrl: currentPost.coverImage,
            title: currentPost.title,
            description: currentPost.description || '',
            category: (currentPost.category || 'all') as Category,
            width: 1920,
            height: 1080,
            format: 'jpg',
            createdAt: currentPost.createdAt,
            tags: [],
            albumImages: currentPost.images.map(img => ({
              id: img.id,
              publicId: img.id,
              url: img.url,
              thumbnailUrl: img.thumbnailUrl || img.url,
              title: img.title || '',
              description: img.description || '',
              category: (currentPost.category || 'all') as Category,
              width: img.width || 1920,
              height: img.height || 1080,
              format: 'jpg',
              createdAt: currentPost.createdAt,
              tags: [],
            })),
          }]}
          currentPostIndex={0}
          isOpen={albumLightboxOpen}
          onClose={() => {
            setAlbumLightboxOpen(false);
            setCurrentPost(null);
          }}
        />
      )}

      {/* Instagram Stories Viewer */}
      {storiesOpen && (
        <StoriesViewer
          highlights={highlights}
          onClose={() => setStoriesOpen(false)}
          initialHighlightIndex={initialHighlightIndex}
        />
      )}

      {/* Video Player Modal */}
      {videoPlayerOpen && currentVideo && (
        <div className="fixed inset-0 bg-black z-[100] flex items-center justify-center">
          <button
            onClick={() => {
              setVideoPlayerOpen(false);
              setCurrentVideo(null);
            }}
            className="absolute top-4 right-4 z-10 p-3 bg-white/10 backdrop-blur-sm rounded-full text-white hover:bg-white/20 transition"
          >
            <FiX className="w-6 h-6" />
          </button>
          <video
            src={currentVideo.url}
            controls
            autoPlay
            className="max-w-full max-h-full"
          >
            Your browser does not support the video tag.
          </video>
        </div>
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
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={0.2}
            onDragEnd={(e, info) => {
              if (info.offset.y > 150 || info.velocity.y > 500) {
                setMenuOpen(false);
              }
            }}
          >
            {/* Handle Bar - Interactive */}
            <div className="flex justify-center pt-3 pb-2 cursor-grab active:cursor-grabbing">
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
