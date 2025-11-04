'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiPlay } from 'react-icons/fi';
import { VideoItem } from '@/types';

interface VideoPlayerProps {
  video: VideoItem;
}

export default function VideoPlayer({ video }: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <div className="relative aspect-video bg-gray-900 rounded-lg overflow-hidden group">
      {!isPlaying ? (
        <>
          {/* Thumbnail */}
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${video.thumbnailUrl})` }}
          />
          
          {/* Overlay */}
          <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors" />
          
          {/* Play Button */}
          <motion.button
            onClick={() => setIsPlaying(true)}
            className="absolute inset-0 flex items-center justify-center"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="w-20 h-20 bg-white/90 rounded-full flex items-center justify-center shadow-2xl">
              <FiPlay className="w-10 h-10 text-gray-900 ml-1" />
            </div>
          </motion.button>

          {/* Video Info */}
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
            <h3 className="text-white font-semibold text-lg">{video.title}</h3>
            {video.description && (
              <p className="text-gray-300 text-sm mt-1">{video.description}</p>
            )}
          </div>
        </>
      ) : (
        <iframe
          src={video.videoUrl}
          className="absolute inset-0 w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      )}
    </div>
  );
}
