'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import Image from 'next/image';

interface NovoPreloaderEnhancedProps {
  type?: 'words' | 'image' | 'spinner';
  staticWord?: string;
  dynamicWords?: string[];
  imageSrc?: string;
  onComplete?: () => void;
}

export default function NovoPreloaderEnhanced({
  type = 'words',
  staticWord = 'Innov8',
  dynamicWords = ['Photography', 'Moments', 'Memories', 'Stories', 'Beauty'],
  imageSrc,
  onComplete
}: NovoPreloaderEnhancedProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Novo preloader timing: 350ms delay + fade out
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => {
        onComplete?.();
      }, 500); // Wait for fade out animation
    }, 1500);

    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
        className="fixed inset-0 z-[1050] bg-white flex items-center justify-center"
        style={{ fontFamily: "'Lato', sans-serif" }}
      >
        {type === 'words' && (
          <div className="preloader-content relative h-[45px] overflow-hidden text-[35px] leading-[40px] text-center">
            <div className="preloader-container font-semibold overflow-hidden h-[44px] px-10 inline-block relative">
              {/* Left Bracket */}
              <motion.span
                className="absolute left-0 top-0 text-[42px] leading-[40px]"
                animate={{ opacity: [0, 1, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              >
                [
              </motion.span>

              {/* Static Word */}
              <span className="float-left m-0 text-[#1a1a1a]">{staticWord}</span>

              {/* Dynamic Words */}
              <div className="float-left ml-2">
                <motion.ul
                  className="list-none m-0 p-0 block"
                  animate={{
                    y: dynamicWords.map((_, index) => `-${index * 40}px`)
                  }}
                  transition={{
                    duration: dynamicWords.length,
                    repeat: Infinity,
                    ease: 'linear',
                    times: dynamicWords.map((_, index) => index / dynamicWords.length)
                  }}
                  style={{
                    animation: `novoChange${dynamicWords.length} ${dynamicWords.length}s infinite linear`
                  }}
                >
                  {dynamicWords.map((word, index) => (
                    <li key={index} className="leading-[40px] m-0 text-[#d4af37]">
                      {word}
                    </li>
                  ))}
                </motion.ul>
              </div>

              {/* Right Bracket */}
              <motion.span
                className="absolute right-0 top-0 text-[42px] leading-[40px]"
                animate={{ opacity: [0, 1, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              >
                ]
              </motion.span>
            </div>
          </div>
        )}

        {type === 'image' && imageSrc && (
          <div className="preloader-img">
            <Image
              src={imageSrc}
              alt="Loading"
              width={200}
              height={200}
              className="max-w-[200px] max-h-[200px] object-contain"
            />
          </div>
        )}

        {type === 'spinner' && (
          <div className="spinner">
            <div className="w-16 h-16 border-4 border-[#d4af37] border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        <style jsx global>{`
          @keyframes novoChange2 {
            0%, 50%, 100% { transform: translateY(0); }
            25%, 75% { transform: translateY(-40px); }
          }

          @keyframes novoChange3 {
            0%, 33.33%, 100% { transform: translateY(0); }
            16.66%, 50%, 83.33% { transform: translateY(-40px); }
            66.66% { transform: translateY(-80px); }
          }

          @keyframes novoChange4 {
            0%, 25%, 100% { transform: translateY(0); }
            12.5%, 37.5%, 62.5%, 87.5% { transform: translateY(-40px); }
            50%, 75% { transform: translateY(-80px); }
            62.5% { transform: translateY(-120px); }
          }

          @keyframes novoChange5 {
            0%, 20%, 100% { transform: translateY(0); }
            10%, 30%, 50%, 70%, 90% { transform: translateY(-40px); }
            40%, 60%, 80% { transform: translateY(-80px); }
            50%, 70% { transform: translateY(-120px); }
            60% { transform: translateY(-160px); }
          }
        `}</style>
      </motion.div>
    </AnimatePresence>
  );
}
