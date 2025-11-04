'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import VideoPlayer from '@/components/VideoPlayer';
import { VideoItem } from '@/types';
import { getSampleVideos } from '@/lib/sample-data';

export default function VideosPage() {
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadVideos = async () => {
      const data = await getSampleVideos();
      setVideos(data);
      setLoading(false);
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
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold mb-4">
              Videos & Reels
            </h1>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Cinematic stories brought to life through videography
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="aspect-video bg-gray-200 animate-pulse rounded-lg" />
              ))}
            </div>
          ) : videos.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {videos.map((video, index) => (
                <motion.div
                  key={video.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <VideoPlayer video={video} />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-gray-500 text-lg">No videos available yet.</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
