'use client';

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { FiPlay } from 'react-icons/fi';
import { Volume2, VolumeX } from 'lucide-react';
import { VideoItem } from '@/types';

interface VideoPlayerProps {
  video: VideoItem;
}

export default function VideoPlayer({ video }: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Determine if this is a reel (vertical/portrait video)
  const isReel = video.width && video.height ? video.width / video.height < 0.8 : false;
  
  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleMuteToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  return (
    <div 
      className={`relative bg-gray-900 rounded-lg overflow-hidden group ${
        isReel ? 'max-w-sm mx-auto' : 'w-full'
      }`}
      style={{
        aspectRatio: isReel 
          ? '9/16' 
          : video.width && video.height 
            ? `${video.width}/${video.height}` 
            : '16/9'
      }}
    >
      {!isPlaying ? (
        <>
          {/* Thumbnail */}
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${video.thumbnailUrl})` }}
          />
          
          {/* Overlay */}
          <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors" />
          
          {/* Reel Badge */}
          {isReel && (
            <div className="absolute top-4 left-4 px-3 py-1 bg-black/60 rounded-full backdrop-blur-sm z-10">
              <span className="text-white text-sm font-medium">Reel</span>
            </div>
          )}
          
          {/* Play Button */}
          <motion.button
            onClick={handlePlayPause}
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
        <>
          <video
            ref={videoRef}
            src={video.url}
            className={`w-full h-full ${isReel ? 'object-contain' : 'object-cover'} bg-black`}
            loop
            playsInline
            muted={isMuted}
            autoPlay
            onClick={handlePlayPause}
            onEnded={() => setIsPlaying(false)}
          />
          
          {/* Video Controls */}
          <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity">
            {/* Mute Button */}
            <button
              onClick={handleMuteToggle}
              className="absolute bottom-4 right-4 w-10 h-10 bg-black/60 rounded-full flex items-center justify-center hover:bg-black/80 transition-colors"
            >
              {isMuted ? (
                <VolumeX className="w-5 h-5 text-white" />
              ) : (
                <Volume2 className="w-5 h-5 text-white" />
              )}
            </button>

            {/* Click to Pause Overlay */}
            <div className="absolute inset-0 cursor-pointer" onClick={handlePlayPause} />
          </div>
          
          {/* Reel Badge */}
          {isReel && (
            <div className="absolute top-4 left-4 px-3 py-1 bg-black/60 rounded-full backdrop-blur-sm">
              <span className="text-white text-sm font-medium">Reel</span>
            </div>
          )}
        </>
      )}
    </div>
  );
}
