'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Heart, 
  MessageCircle, 
  Send, 
  Bookmark, 
  MoreHorizontal,
  Camera,
  Play,
  Volume2,
  VolumeX
} from 'lucide-react';
import { MediaItem } from '@/types';

interface VideoItem {
  id: string;
  title: string;
  description?: string;
  url: string;
  thumbnailUrl: string;
  width?: number;
  height?: number;
  isReel?: boolean;
  type?: string;
}

interface InstagramFeedProps {
  images: MediaItem[];
  videos?: VideoItem[];
  combinedMedia?: (MediaItem | VideoItem)[];
  onImageClick?: (index: number) => void;
}

interface Story {
  id: string;
  title: string;
  image: string;
  category: string;
}

// Generate stories from actual images in the feed
const generateStoriesFromImages = (images: MediaItem[]): Story[] => {
  const categories = ['weddings', 'portraits', 'fashion', 'events', 'travel'];
  const stories: Story[] = [];
  
  categories.forEach((category) => {
    // Find first image from each category
    const categoryImage = images.find(img => 
      img.category?.toLowerCase().includes(category.slice(0, -1)) || 
      img.tags?.some(tag => tag.toLowerCase().includes(category.slice(0, -1)))
    );
    
    if (categoryImage) {
      stories.push({
        id: category,
        title: category.charAt(0).toUpperCase() + category.slice(1),
        image: categoryImage.thumbnailUrl || categoryImage.url,
        category: category,
      });
    }
  });
  
  return stories;
};

export default function InstagramFeed({ images, videos = [], combinedMedia, onImageClick }: InstagramFeedProps) {
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [savedPosts, setSavedPosts] = useState<Set<string>>(new Set());
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [stories, setStories] = useState<Story[]>([]);
  const [playingVideos, setPlayingVideos] = useState<Set<string>>(new Set());
  const [mutedVideos, setMutedVideos] = useState<Set<string>>(new Set());
  const videoRefs = useRef<{ [key: string]: HTMLVideoElement | null }>({});

  // Use combined media if provided, otherwise just images
  const mediaItems = combinedMedia || images;

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    // Generate stories from actual images
    if (images.length > 0) {
      const generatedStories = generateStoriesFromImages(images);
      setStories(generatedStories);
    }
  }, [images]);

  const toggleLike = (id: string) => {
    setLikedPosts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const toggleSave = (id: string) => {
    setSavedPosts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const toggleVideoPlay = (id: string) => {
    const video = videoRefs.current[id];
    if (!video) return;

    if (playingVideos.has(id)) {
      video.pause();
      setPlayingVideos(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    } else {
      video.play();
      setPlayingVideos(prev => new Set([...prev, id]));
    }
  };

  const toggleVideoMute = (id: string) => {
    const video = videoRefs.current[id];
    if (!video) return;

    video.muted = !video.muted;
    setMutedVideos(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const isVideo = (item: MediaItem | VideoItem): item is VideoItem => {
    return 'type' in item && item.type === 'video';
  };

  return (
    <div className="min-h-screen bg-white dark:bg-dark-900">
      {/* Stories Bar */}
      {stories.length > 0 && (
        <div className="sticky top-16 z-40 bg-white dark:bg-dark-900 border-b border-gray-200 dark:border-gray-800 py-3">
          <div className="max-w-2xl mx-auto px-4">
            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
              {stories.map((story) => (
              <Link 
                key={story.id}
                href={`/gallery?category=${story.category}`}
                className="flex-shrink-0 group"
              >
                <motion.div
                  whileTap={{ scale: 0.95 }}
                  className="flex flex-col items-center gap-1"
                >
                  <div className="relative">
                    {/* Gradient Ring */}
                    <div className="w-16 h-16 md:w-18 md:h-18 rounded-full bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 p-[2px]">
                      <div className="w-full h-full rounded-full bg-white dark:bg-dark-900 p-[2px]">
                        <div className="relative w-full h-full rounded-full overflow-hidden">
                          <Image
                            src={story.image}
                            alt={story.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <span className="text-xs text-gray-900 dark:text-gray-100 font-medium w-16 text-center truncate">
                    {story.title}
                  </span>
                </motion.div>
              </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Feed */}
      <div className="max-w-2xl mx-auto">
        {mediaItems.map((item, index) => {
          const itemIsVideo = isVideo(item);
          const aspectRatio = item.width && item.height ? item.width / item.height : 1;
          const isReelFormat = itemIsVideo && (item.isReel || aspectRatio < 0.8);
          
          return (
            <motion.article
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="mb-6 bg-white dark:bg-dark-800 border-b border-gray-200 dark:border-gray-800 md:border md:rounded-lg md:mb-8"
            >
              {/* Post Header */}
              <div className="flex items-center justify-between p-3 md:p-4">
                <div className="flex items-center gap-3">
                  <div className="relative w-10 h-10 rounded-full bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 p-[2px]">
                    <div className="w-full h-full rounded-full bg-white dark:bg-dark-900 p-[2px]">
                      <div className="relative w-full h-full rounded-full overflow-hidden bg-gray-200 dark:bg-dark-700">
                        <Camera className="w-5 h-5 absolute inset-0 m-auto text-gray-400" />
                      </div>
                    </div>
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-gray-900 dark:text-gray-100">
                      Aminoss Photography
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {itemIsVideo ? (isReelFormat ? 'Reel' : 'Video') : (item.category || 'Photography')}
                    </p>
                  </div>
                </div>
                <button className="p-2 hover:bg-gray-100 dark:hover:bg-dark-700 rounded-full transition-colors">
                  <MoreHorizontal className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                </button>
              </div>

              {/* Post Media */}
              {itemIsVideo ? (
                <div 
                  className={`relative w-full bg-black ${
                    isReelFormat ? 'max-h-[600px] flex items-center justify-center' : ''
                  }`}
                  style={{
                    aspectRatio: isReelFormat ? '9/16' : (aspectRatio || '16/9')
                  }}
                >
                  <video
                    ref={(el) => { videoRefs.current[item.id] = el; }}
                    src={item.url}
                    poster={item.thumbnailUrl}
                    className={`w-full h-full ${isReelFormat ? 'object-contain' : 'object-cover'}`}
                    loop
                    playsInline
                    muted={mutedVideos.has(item.id)}
                    onClick={() => toggleVideoPlay(item.id)}
                  />
                  
                  {/* Video Controls Overlay */}
                  {!playingVideos.has(item.id) && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => toggleVideoPlay(item.id)}
                        className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-lg"
                      >
                        <Play className="w-8 h-8 text-gray-900 ml-1" />
                      </motion.button>
                    </div>
                  )}
                  
                  {/* Mute Button */}
                  <button
                    onClick={() => toggleVideoMute(item.id)}
                    className="absolute bottom-4 right-4 w-10 h-10 bg-black/60 rounded-full flex items-center justify-center hover:bg-black/80 transition-colors"
                  >
                    {mutedVideos.has(item.id) ? (
                      <VolumeX className="w-5 h-5 text-white" />
                    ) : (
                      <Volume2 className="w-5 h-5 text-white" />
                    )}
                  </button>

                  {/* Reel Label */}
                  {isReelFormat && (
                    <div className="absolute top-4 left-4 px-3 py-1 bg-black/60 rounded-full backdrop-blur-sm">
                      <span className="text-white text-sm font-medium">Reel</span>
                    </div>
                  )}
                </div>
              ) : (
                <div 
                  className="relative w-full bg-black cursor-pointer overflow-hidden"
                  style={{ 
                    aspectRatio: item.width && item.height 
                      ? `${item.width}/${item.height}` 
                      : '1/1' 
                  }}
                  onClick={() => onImageClick && onImageClick(index)}
                >
                  <Image
                    src={item.url}
                    alt={item.title}
                    fill
                    className="object-contain"
                    sizes="(max-width: 768px) 100vw, 672px"
                    priority={index < 3}
                    loading={index < 3 ? 'eager' : 'lazy'}
                    quality={90}
                    unoptimized={item.url.includes('cloudinary')}
                  />
                </div>
              )}

              {/* Post Actions */}
              <div className="p-3 md:p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-4">
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={() => toggleLike(item.id)}
                      className="touch-manipulation"
                    >
                      <Heart
                        className={`w-7 h-7 transition-colors ${
                          likedPosts.has(item.id)
                            ? 'fill-red-500 text-red-500'
                            : 'text-gray-900 dark:text-gray-100'
                        }`}
                      />
                    </motion.button>
                    <motion.button whileTap={{ scale: 0.9 }} className="touch-manipulation">
                      <MessageCircle className="w-7 h-7 text-gray-900 dark:text-gray-100" />
                    </motion.button>
                    <motion.button whileTap={{ scale: 0.9 }} className="touch-manipulation">
                      <Send className="w-7 h-7 text-gray-900 dark:text-gray-100" />
                    </motion.button>
                  </div>
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => toggleSave(item.id)}
                    className="touch-manipulation"
                  >
                    <Bookmark
                      className={`w-6 h-6 transition-colors ${
                        savedPosts.has(item.id)
                          ? 'fill-gray-900 dark:fill-gray-100 text-gray-900 dark:text-gray-100'
                          : 'text-gray-900 dark:text-gray-100'
                      }`}
                    />
                  </motion.button>
                </div>

                {/* Likes Count */}
                <p className="font-semibold text-sm mb-2 text-gray-900 dark:text-gray-100">
                  {likedPosts.has(item.id) ? '1,234' : '1,233'} likes
                </p>

                {/* Caption */}
                <div className="text-sm text-gray-900 dark:text-gray-100">
                  <span className="font-semibold mr-2">Aminoss Photography</span>
                  <span className="text-gray-700 dark:text-gray-300">
                    {item.title || 'Beautiful moment captured'}
                  </span>
                </div>

                {/* View Comments */}
                <button className="text-sm text-gray-500 dark:text-gray-400 mt-2 hover:text-gray-700 dark:hover:text-gray-300">
                  View all 48 comments
                </button>

                {/* Time */}
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-2 uppercase">
                  2 days ago
                </p>
              </div>
            </motion.article>
          );
        })}
      </div>      {/* Floating CTA Button */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 right-6 z-50"
          >
            <Link href="/contact">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn-primary shadow-xl flex items-center gap-2 text-base md:text-lg py-4 px-6"
              >
                <Camera className="w-5 h-5" />
                <span className="hidden sm:inline">Book Session</span>
                <span className="sm:hidden">Book</span>
              </motion.button>
            </Link>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
