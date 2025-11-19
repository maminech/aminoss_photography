'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import VideoPlayer from '@/components/VideoPlayer';
import NavigationButton from '@/components/NavigationButton';
import { VideoItem } from '@/types';
import { useLayoutTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { FiPlay, FiX, FiMaximize2, FiVolume2, FiVolumeX } from 'react-icons/fi';

export default function VideosPage() {
  const { currentTheme } = useLayoutTheme();
  const { t } = useLanguage();
  const isProfessional = currentTheme === 'professional';
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedVideo, setSelectedVideo] = useState<VideoItem | null>(null);
  const [hoveredVideo, setHoveredVideo] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(true);
  const videoRefs = useRef<{ [key: string]: HTMLVideoElement | null }>({});

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
                {t('videos.title')}
              </h1>
              
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: '60px' }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="h-[1px] bg-[#d4af37] mx-auto mb-12"
              />

              <p className="text-lg md:text-xl text-gray-700 dark:text-gray-300 font-lato leading-relaxed max-w-3xl mx-auto">
                {t('videos.subtitle')}
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
                  {category === 'all' ? t('gallery.all') : t(`gallery.${category}`)}
                </button>
              ))}
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="aspect-video bg-gray-200 dark:bg-gray-800 animate-pulse rounded-lg" />
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
                      className={`group relative overflow-hidden cursor-pointer ${isReel ? 'md:col-span-1 mx-auto max-w-sm' : ''}`}
                      onClick={() => setSelectedVideo(video)}
                      onMouseEnter={() => {
                        setHoveredVideo(video.id);
                        const videoEl = videoRefs.current[video.id];
                        if (videoEl) {
                          videoEl.play().catch(() => {});
                        }
                      }}
                      onMouseLeave={() => {
                        setHoveredVideo(null);
                        const videoEl = videoRefs.current[video.id];
                        if (videoEl) {
                          videoEl.pause();
                          videoEl.currentTime = 0;
                        }
                      }}
                    >
                      <div className="relative aspect-video bg-gray-900 overflow-hidden rounded-lg shadow-2xl">
                        {/* Video preview on hover */}
                        <video
                          ref={(el) => { videoRefs.current[video.id] = el; }}
                          src={video.url}
                          muted
                          loop
                          playsInline
                          className="absolute inset-0 w-full h-full object-cover"
                          style={{ opacity: hoveredVideo === video.id ? 1 : 0 }}
                        />
                        
                        {/* Thumbnail */}
                        {video.thumbnailUrl && (
                          <img
                            src={video.thumbnailUrl}
                            alt={video.title}
                            className="absolute inset-0 w-full h-full object-cover transition-all duration-700"
                            style={{ 
                              opacity: hoveredVideo === video.id ? 0 : 1,
                              transform: hoveredVideo === video.id ? 'scale(1.1)' : 'scale(1)'
                            }}
                          />
                        )}
                        
                        {/* Luxury gradient overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-500" />
                        
                        {/* Play button overlay - hidden on hover */}
                        <motion.div 
                          className="absolute inset-0 flex items-center justify-center"
                          animate={{ opacity: hoveredVideo === video.id ? 0 : 1 }}
                          transition={{ duration: 0.3 }}
                        >
                          <motion.div
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            className="w-20 h-20 rounded-full bg-white/10 backdrop-blur-md border-2 border-[#d4af37] flex items-center justify-center shadow-2xl"
                          >
                            <FiPlay className="w-10 h-10 text-[#d4af37] ml-1" />
                          </motion.div>
                        </motion.div>

                        {/* Title overlay at bottom */}
                        <div className="absolute bottom-0 left-0 right-0 p-6 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                          <motion.h3 
                            className="text-xl font-playfair font-bold text-white mb-2"
                            initial={{ opacity: 0.9 }}
                            whileHover={{ opacity: 1 }}
                          >
                            {video.title}
                          </motion.h3>
                          {video.description && (
                            <motion.p 
                              className="text-white/90 font-lato text-sm line-clamp-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                              initial={{ y: 10 }}
                              whileHover={{ y: 0 }}
                            >
                              {video.description}
                            </motion.p>
                          )}
                          {video.category && (
                            <span className="inline-block mt-2 px-3 py-1 bg-[#d4af37]/20 backdrop-blur-sm border border-[#d4af37]/50 rounded-full text-xs font-lato uppercase tracking-wider text-[#d4af37]">
                              {video.category}
                            </span>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-16">
                <p className="text-gray-500 font-lato text-lg">{t('videos.noVideos')}</p>
              </div>
            )}
          </div>
        </section>

        {/* Luxury Fullscreen Video Modal */}
        <AnimatePresence>
          {selectedVideo && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex items-center justify-center p-4"
              onClick={() => setSelectedVideo(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="relative w-full max-w-6xl"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Close button */}
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setSelectedVideo(null)}
                  className="absolute -top-12 right-0 md:-right-12 w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-colors z-10"
                >
                  <FiX className="w-5 h-5" />
                </motion.button>

                {/* Video container */}
                <div className="relative aspect-video rounded-2xl overflow-hidden shadow-2xl">
                  <video
                    src={selectedVideo.url}
                    controls
                    autoPlay
                    muted={isMuted}
                    playsInline
                    className="w-full h-full object-contain bg-black"
                    onTouchStart={(e) => {
                      // Mobile gesture support - double tap to play/pause
                      const video = e.currentTarget;
                      if (video.paused) {
                        video.play();
                      } else {
                        video.pause();
                      }
                    }}
                  />

                  {/* Luxury controls overlay */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
                    <h3 className="text-2xl font-playfair font-bold text-white mb-2">
                      {selectedVideo.title}
                    </h3>
                    {selectedVideo.description && (
                      <p className="text-white/90 font-lato text-sm mb-4">
                        {selectedVideo.description}
                      </p>
                    )}
                    <div className="flex items-center gap-3">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setIsMuted(!isMuted)}
                        className="px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 transition-colors flex items-center gap-2"
                      >
                        {isMuted ? <FiVolumeX className="w-4 h-4" /> : <FiVolume2 className="w-4 h-4" />}
                        <span className="text-sm font-lato">{isMuted ? 'Unmute' : 'Mute'}</span>
                      </motion.button>
                      {selectedVideo.category && (
                        <span className="px-4 py-2 rounded-full bg-[#d4af37]/20 backdrop-blur-md border border-[#d4af37]/50 text-[#d4af37] text-xs font-lato uppercase tracking-wider">
                          {selectedVideo.category}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Swipe instruction for mobile */}
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 0.6, y: 0 }}
                  transition={{ delay: 1 }}
                  className="text-center text-white/60 text-sm font-lato mt-4 md:hidden"
                >
                  Swipe down to close
                </motion.p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
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
            <div className="text-center py-20">
              <p className="text-gray-500 dark:text-gray-400 text-lg">{t('videos.noVideos')}</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
