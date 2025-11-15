'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import VideoPlayer from '@/components/VideoPlayer';
import NavigationButton from '@/components/NavigationButton';
import { VideoItem } from '@/types';
import { useLayoutTheme } from '@/contexts/ThemeContext';
import { FiPlay } from 'react-icons/fi';

export default function VideosPage() {
  const { currentTheme } = useLayoutTheme();
  const isProfessional = currentTheme === 'professional';
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    const loadVideos = async () => {
      try {
        // Fetch videos from public API - professional mode gets only videos marked for professional mode
        const apiUrl = isProfessional 
          ? '/api/videos?professionalMode=true'
          : '/api/videos';
        const res = await fetch(apiUrl);
        if (res.ok) {
          const data = await res.json();
          
          // Map to VideoItem format
          const mappedVideos: VideoItem[] = data.map((video: any) => ({
            id: video.id,
            title: video.title,
            description: video.description || '',
            url: video.url,
            thumbnailUrl: video.thumbnailUrl,
            category: video.category || 'general',
          }));
          
          setVideos(mappedVideos);
        } else {
          console.error('Failed to fetch videos');
        }
      } catch (error) {
        console.error('Error loading videos:', error);
      } finally {
        setLoading(false);
      }
    };
    loadVideos();
  }, [isProfessional]);

  // Get unique categories
  const categories = ['all', ...Array.from(new Set(videos.map(v => v.category || 'general')))];
  const filteredVideos = selectedCategory === 'all' 
    ? videos 
    : videos.filter(v => v.category === selectedCategory);

  // Professional/Novo Theme Layout
  if (isProfessional) {
    return (
      <div className="novo-videos-page bg-white dark:bg-gray-900 min-h-screen">
        <NavigationButton variant="both" />
        <section className="py-24 md:py-32 bg-white dark:bg-gray-900">
          <div className="container mx-auto px-6 max-w-7xl">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center mb-16"
            >
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-playfair font-bold text-[#1a1a1a] dark:text-gray-100 mb-8">
                Videos & Cinematography
              </h1>
              
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: '60px' }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="h-[1px] bg-[#d4af37] mx-auto mb-12"
              />

              <p className="text-lg md:text-xl text-gray-700 dark:text-gray-300 font-lato leading-relaxed max-w-3xl mx-auto">
                Cinematic stories brought to life through videography
              </p>
            </motion.div>

            {/* Category Filters - Novo Style */}
            <div className="flex flex-wrap justify-center gap-4 mb-12">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-6 py-2 text-sm font-lato uppercase tracking-[0.2em] transition-all duration-300 ${
                    selectedCategory === category
                      ? 'bg-[#d4af37] text-white'
                      : 'bg-transparent text-[#1a1a1a] dark:text-gray-100 border border-gray-300 hover:border-[#d4af37]'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="aspect-video bg-gray-200 animate-pulse" />
                ))}
              </div>
            ) : filteredVideos.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredVideos.map((video, index) => {
                  const isReel = video.width && video.height ? video.width / video.height < 0.8 : false;
                  
                  return (
                    <motion.div
                      key={video.id}
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                      className={`group relative overflow-hidden ${isReel ? 'md:col-span-1 mx-auto max-w-sm' : ''}`}
                    >
                      <div className="relative aspect-video bg-gray-900 overflow-hidden">
                        {video.thumbnailUrl ? (
                          <img
                            src={video.thumbnailUrl}
                            alt={video.title}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900" />
                        )}
                        
                        {/* Novo-style overlay */}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                          <div className="w-16 h-16 rounded-full border-2 border-[#d4af37] flex items-center justify-center">
                            <FiPlay className="w-8 h-8 text-[#d4af37] ml-1" />
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-4">
                        <h3 className="text-xl font-playfair font-bold text-[#1a1a1a] dark:text-gray-100 mb-2 group-hover:text-[#d4af37] transition-colors">
                          {video.title}
                        </h3>
                        {video.description && (
                          <p className="text-gray-600 font-lato text-sm line-clamp-2">
                            {video.description}
                          </p>
                        )}
                        {video.category && (
                          <span className="inline-block mt-2 text-xs font-lato uppercase tracking-wider text-[#d4af37]">
                            {video.category}
                          </span>
                        )}
                      </div>

                      {/* Video Player Component */}
                      <div className="mt-4">
                        <VideoPlayer video={video} />
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-16">
                <p className="text-gray-500 font-lato text-lg">No videos available yet.</p>
              </div>
            )}
          </div>
        </section>
      </div>
    );
  }

  // Simple Theme Layout (existing)
  return (
    <div className="min-h-screen py-16 md:py-24 px-4 sm:px-6 lg:px-8">
      <NavigationButton variant="both" />
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold mb-4 text-gray-900 dark:text-gray-100">
              Videos & Reels
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl mx-auto">
              Cinematic stories brought to life through videography
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="aspect-video bg-gray-200 dark:bg-dark-800 animate-pulse rounded-lg" />
              ))}
            </div>
          ) : videos.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {videos.map((video, index) => {
                // Check if it's a reel (portrait video)
                const isReel = video.width && video.height ? video.width / video.height < 0.8 : false;
                
                return (
                  <motion.div
                    key={video.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className={isReel ? 'md:col-span-1 mx-auto max-w-sm' : ''}
                  >
                    <VideoPlayer video={video} />
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-gray-500 dark:text-gray-400 text-lg">No videos available yet.</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
