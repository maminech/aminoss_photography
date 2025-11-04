'use client';

import { useState, useEffect } from 'react';
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
  Play
} from 'lucide-react';
import { MediaItem } from '@/types';

interface InstagramFeedProps {
  images: MediaItem[];
  onImageClick?: (index: number) => void;
}

interface Story {
  id: string;
  title: string;
  image: string;
  category: string;
}

const stories: Story[] = [
  { id: '1', title: 'Weddings', image: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=400&q=80', category: 'wedding' },
  { id: '2', title: 'Portraits', image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&q=80', category: 'portrait' },
  { id: '3', title: 'Fashion', image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=400&q=80', category: 'fashion' },
  { id: '4', title: 'Events', image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400&q=80', category: 'event' },
  { id: '5', title: 'Travel', image: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400&q=80', category: 'travel' },
];

export default function InstagramFeed({ images, onImageClick }: InstagramFeedProps) {
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [savedPosts, setSavedPosts] = useState<Set<string>>(new Set());
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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

  return (
    <div className="min-h-screen bg-white dark:bg-dark-900">
      {/* Stories Bar */}
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

      {/* Feed */}
      <div className="max-w-2xl mx-auto">
        {images.map((image, index) => (
          <motion.article
            key={image.id}
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
                    {image.category || 'Photography'}
                  </p>
                </div>
              </div>
              <button className="p-2 hover:bg-gray-100 dark:hover:bg-dark-700 rounded-full transition-colors">
                <MoreHorizontal className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              </button>
            </div>

            {/* Post Image */}
            <div 
              className="relative w-full aspect-square bg-gray-100 dark:bg-dark-700 cursor-pointer"
              onClick={() => onImageClick && onImageClick(index)}
            >
              <Image
                src={image.url}
                alt={image.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 672px"
              />
              {image.type === 'video' && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center">
                    <Play className="w-8 h-8 text-white fill-white ml-1" />
                  </div>
                </div>
              )}
            </div>

            {/* Post Actions */}
            <div className="p-3 md:p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-4">
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => toggleLike(image.id)}
                    className="touch-manipulation"
                  >
                    <Heart
                      className={`w-7 h-7 transition-colors ${
                        likedPosts.has(image.id)
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
                  onClick={() => toggleSave(image.id)}
                  className="touch-manipulation"
                >
                  <Bookmark
                    className={`w-6 h-6 transition-colors ${
                      savedPosts.has(image.id)
                        ? 'fill-gray-900 dark:fill-gray-100 text-gray-900 dark:text-gray-100'
                        : 'text-gray-900 dark:text-gray-100'
                    }`}
                  />
                </motion.button>
              </div>

              {/* Likes Count */}
              <p className="font-semibold text-sm mb-2 text-gray-900 dark:text-gray-100">
                {likedPosts.has(image.id) ? '1,234' : '1,233'} likes
              </p>

              {/* Caption */}
              <div className="text-sm text-gray-900 dark:text-gray-100">
                <span className="font-semibold mr-2">Aminoss Photography</span>
                <span className="text-gray-700 dark:text-gray-300">
                  {image.title || 'Beautiful moment captured'}
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
        ))}
      </div>

      {/* Floating CTA Button */}
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
