'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlay, FiPause, FiLoader, FiVolume2, FiVolumeX, FiMaximize } from 'react-icons/fi';
import { VideoItem } from '@/types';

interface VideoPlayerProps {
  video: VideoItem;
}

export default function VideoPlayer({ video }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [showThumbnail, setShowThumbnail] = useState(true);

  // Determine if this is a reel (vertical/portrait video)
  const isReel = video.width && video.height ? video.width / video.height < 0.8 : false;
  
  const handlePlayClick = () => {
    setShowThumbnail(false);
    if (videoRef.current) {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const toggleFullscreen = () => {
    if (videoRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        videoRef.current.requestFullscreen();
      }
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const progress = (videoRef.current.currentTime / videoRef.current.duration) * 100;
      setProgress(progress);
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (videoRef.current) {
      const rect = e.currentTarget.getBoundingClientRect();
      const pos = (e.clientX - rect.left) / rect.width;
      videoRef.current.currentTime = pos * videoRef.current.duration;
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
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      {/* Reel Badge */}
      {isReel && (
        <div className="absolute top-4 left-4 px-3 py-1 bg-black/60 rounded-full backdrop-blur-sm z-50">
          <span className="text-white text-sm font-medium">Reel</span>
        </div>
      )}

      {/* Video Element */}
      <video
        ref={videoRef}
        className={`w-full h-full object-contain ${showThumbnail ? 'invisible' : 'visible'}`}
        src={video.url}
        onLoadedData={() => setIsLoading(false)}
        onTimeUpdate={handleTimeUpdate}
        onEnded={() => setIsPlaying(false)}
        onClick={togglePlay}
        playsInline
      />

      {/* Thumbnail Overlay (shown before play) */}
      {showThumbnail && (
        <div 
          className="absolute inset-0 cursor-pointer"
          onClick={handlePlayClick}
        >
          {video.thumbnailUrl && (
            <div
              className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
              style={{ backgroundImage: `url(${video.thumbnailUrl})` }}
            />
          )}
          
          <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors" />
          
          {/* Play Button */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="w-20 h-20 bg-white/90 rounded-full flex items-center justify-center shadow-2xl group-hover:bg-[#d4af37] group-hover:text-white transition-colors">
              <FiPlay className="w-10 h-10 text-gray-900 group-hover:text-white ml-1 transition-colors" />
            </div>
          </motion.div>
        </div>
      )}

      {/* Loading Indicator */}
      <AnimatePresence>
        {isLoading && !showThumbnail && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center bg-black/80 z-40"
          >
            <div className="flex flex-col items-center gap-3">
              <FiLoader className="w-12 h-12 text-white animate-spin" />
              <p className="text-white text-sm font-medium">Loading...</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Custom Controls (shown when video is playing) */}
      {!showThumbnail && (
        <div 
          className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-4 transition-opacity duration-300 ${
            showControls || !isPlaying ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {/* Progress Bar */}
          <div 
            className="w-full h-1 bg-white/30 rounded-full mb-3 cursor-pointer hover:h-2 transition-all"
            onClick={handleSeek}
          >
            <div 
              className="h-full bg-[#d4af37] rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Control Buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={togglePlay}
                className="text-white hover:text-[#d4af37] transition-colors p-1"
                aria-label={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? <FiPause className="w-6 h-6" /> : <FiPlay className="w-6 h-6" />}
              </button>
              
              <button
                onClick={toggleMute}
                className="text-white hover:text-[#d4af37] transition-colors p-1"
                aria-label={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? <FiVolumeX className="w-6 h-6" /> : <FiVolume2 className="w-6 h-6" />}
              </button>
            </div>

            <button
              onClick={toggleFullscreen}
              className="text-white hover:text-[#d4af37] transition-colors p-1"
              aria-label="Fullscreen"
            >
              <FiMaximize className="w-6 h-6" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
