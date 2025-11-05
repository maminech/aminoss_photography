'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import VideoPlayer from '@/components/VideoPlayer';
import { VideoItem } from '@/types';

export default function VideosPage() {
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadVideos = async () => {
      try {
        // Fetch videos from public API
        const res = await fetch('/api/videos');
        if (res.ok) {
          const data = await res.json();
          
          // Map to VideoItem format
          const mappedVideos: VideoItem[] = data.map((video: any) => ({
            id: video.id,
            title: video.title,
            description: video.description || '',
            url: video.url,
            thumbnailUrl: video.thumbnailUrl,
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
  }, []);

  return (
    <div className="min-h-screen py-16 md:py-24 px-4 sm:px-6 lg:px-8">
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
