'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { FiX, FiVolume2, FiVolumeX, FiHeart, FiMessageCircle, FiShare2, FiMoreVertical } from 'react-icons/fi';

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

interface ReelsViewerProps {
  videos: VideoItem[];
  initialIndex: number;
  onClose: () => void;
}

export default function ReelsViewer({ videos, initialIndex, onClose }: ReelsViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isMuted, setIsMuted] = useState(false);
  const [direction, setDirection] = useState(0);
  const videoRefs = useRef<{ [key: number]: HTMLVideoElement | null }>({});
  const containerRef = useRef<HTMLDivElement>(null);

  const currentVideo = videos[currentIndex];

  // Preload adjacent videos
  useEffect(() => {
    const preloadVideo = (index: number) => {
      if (videos[index] && !videoRefs.current[index]) {
        const video = document.createElement('video');
        video.src = videos[index].url;
        video.preload = 'auto';
        video.muted = isMuted;
      }
    };

    // Preload next and previous videos
    if (currentIndex > 0) preloadVideo(currentIndex - 1);
    if (currentIndex < videos.length - 1) preloadVideo(currentIndex + 1);
  }, [currentIndex, videos, isMuted]);

  // Auto-play current video
  useEffect(() => {
    const video = videoRefs.current[currentIndex];
    if (video) {
      video.play().catch(() => {});
    }

    // Pause other videos
    Object.entries(videoRefs.current).forEach(([index, vid]) => {
      if (parseInt(index) !== currentIndex && vid) {
        vid.pause();
      }
    });
  }, [currentIndex]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowUp' && currentIndex > 0) {
        setDirection(-1);
        setCurrentIndex(prev => prev - 1);
      }
      if (e.key === 'ArrowDown' && currentIndex < videos.length - 1) {
        setDirection(1);
        setCurrentIndex(prev => prev + 1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, videos.length, onClose]);

  // Handle swipe gestures
  const handleDragEnd = useCallback((event: any, info: PanInfo) => {
    const swipeThreshold = 50;
    const velocityThreshold = 500;

    if (
      info.offset.y < -swipeThreshold ||
      info.velocity.y < -velocityThreshold
    ) {
      // Swipe up - next video
      if (currentIndex < videos.length - 1) {
        setDirection(1);
        setCurrentIndex(prev => prev + 1);
      }
    } else if (
      info.offset.y > swipeThreshold ||
      info.velocity.y > velocityThreshold
    ) {
      // Swipe down - previous video
      if (currentIndex > 0) {
        setDirection(-1);
        setCurrentIndex(prev => prev - 1);
      }
    }
  }, [currentIndex, videos.length]);

  // Toggle mute
  const toggleMute = () => {
    setIsMuted(prev => !prev);
    const video = videoRefs.current[currentIndex];
    if (video) {
      video.muted = !isMuted;
    }
  };

  // Double tap to like (mobile)
  const handleDoubleTap = (e: React.MouseEvent | React.TouchEvent) => {
    // Show heart animation
    const heart = document.createElement('div');
    heart.innerHTML = '❤️';
    heart.style.position = 'absolute';
    heart.style.left = '50%';
    heart.style.top = '50%';
    heart.style.transform = 'translate(-50%, -50%) scale(0)';
    heart.style.fontSize = '100px';
    heart.style.pointerEvents = 'none';
    heart.style.zIndex = '50';
    heart.style.transition = 'all 0.5s ease-out';
    
    containerRef.current?.appendChild(heart);
    
    setTimeout(() => {
      heart.style.transform = 'translate(-50%, -50%) scale(1.5)';
      heart.style.opacity = '0';
    }, 10);
    
    setTimeout(() => {
      heart.remove();
    }, 500);
  };

  const variants = {
    enter: (direction: number) => ({
      y: direction > 0 ? '100%' : '-100%',
      opacity: 0,
    }),
    center: {
      y: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      y: direction > 0 ? '-100%' : '100%',
      opacity: 0,
    }),
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black z-[100] overflow-hidden"
      ref={containerRef}
    >
      {/* Close button */}
      <motion.button
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        onClick={onClose}
        className="absolute top-4 left-4 z-50 p-3 bg-black/40 backdrop-blur-md rounded-full text-white hover:bg-black/60 transition-all touch-manipulation"
      >
        <FiX className="w-6 h-6" />
      </motion.button>

      {/* Mute toggle */}
      <motion.button
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        onClick={toggleMute}
        className="absolute top-4 right-4 z-50 p-3 bg-black/40 backdrop-blur-md rounded-full text-white hover:bg-black/60 transition-all touch-manipulation"
      >
        {isMuted ? <FiVolumeX className="w-6 h-6" /> : <FiVolume2 className="w-6 h-6" />}
      </motion.button>

      {/* Video counter */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-black/40 backdrop-blur-md rounded-full text-white text-sm font-medium">
        {currentIndex + 1} / {videos.length}
      </div>

      {/* Main video container with swipe */}
      <AnimatePresence initial={false} custom={direction} mode="wait">
        <motion.div
          key={currentIndex}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            y: { type: "spring", stiffness: 300, damping: 30 },
            opacity: { duration: 0.2 },
          }}
          drag="y"
          dragConstraints={{ top: 0, bottom: 0 }}
          dragElastic={0.2}
          onDragEnd={handleDragEnd}
          onDoubleClick={handleDoubleTap}
          className="absolute inset-0 flex items-center justify-center cursor-grab active:cursor-grabbing"
        >
          <video
            ref={(el) => {
              videoRefs.current[currentIndex] = el;
            }}
            src={currentVideo.url}
            loop
            playsInline
            webkit-playsinline="true"
            muted={isMuted}
            autoPlay
            preload="auto"
            crossOrigin="anonymous"
            className="w-full h-full object-contain"
            style={{
              maxHeight: '100vh',
              maxWidth: '100vw',
            }}
          />

          {/* Video info overlay - bottom */}
          <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 via-black/40 to-transparent pointer-events-none">
            <div className="max-w-xl">
              {currentVideo.title && (
                <h3 className="text-white text-lg font-bold mb-2 drop-shadow-lg">
                  {currentVideo.title}
                </h3>
              )}
              {currentVideo.description && (
                <p className="text-white/90 text-sm drop-shadow-lg line-clamp-3">
                  {currentVideo.description}
                </p>
              )}
            </div>
          </div>

          {/* Right side actions - Instagram style */}
          <div className="absolute bottom-24 right-4 flex flex-col gap-6 pointer-events-auto">
            {/* Like button */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              className="flex flex-col items-center gap-1"
            >
              <div className="w-12 h-12 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/60 transition-all">
                <FiHeart className="w-6 h-6" />
              </div>
              <span className="text-white text-xs font-medium drop-shadow-lg">Like</span>
            </motion.button>

            {/* Comment button */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              className="flex flex-col items-center gap-1"
            >
              <div className="w-12 h-12 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/60 transition-all">
                <FiMessageCircle className="w-6 h-6" />
              </div>
              <span className="text-white text-xs font-medium drop-shadow-lg">Comment</span>
            </motion.button>

            {/* Share button */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              className="flex flex-col items-center gap-1"
            >
              <div className="w-12 h-12 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/60 transition-all">
                <FiShare2 className="w-6 h-6" />
              </div>
              <span className="text-white text-xs font-medium drop-shadow-lg">Share</span>
            </motion.button>

            {/* More button */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              className="flex flex-col items-center gap-1"
            >
              <div className="w-12 h-12 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/60 transition-all">
                <FiMoreVertical className="w-6 h-6" />
              </div>
            </motion.button>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Swipe indicator - show on first video */}
      {currentIndex === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ delay: 1, duration: 0.5 }}
          className="absolute bottom-32 left-1/2 -translate-x-1/2 z-40 flex flex-col items-center gap-2 pointer-events-none"
        >
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="text-white/60"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="rotate-180">
              <path d="M12 5L12 19M12 19L5 12M12 19L19 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </motion.div>
          <span className="text-white/60 text-sm font-medium">Swipe up for more</span>
        </motion.div>
      )}
    </motion.div>
  );
}
