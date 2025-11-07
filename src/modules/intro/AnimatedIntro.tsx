'use client';

/**
 * Animated Intro Screen
 * Displays "Innov8 Camera Focus Smile" animation on first visit
 * Auto-transitions to home gallery after animation completes
 */

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Camera, Focus, Smile } from 'lucide-react';

interface AnimatedIntroProps {
  onComplete: () => void;
}

export default function AnimatedIntro({ onComplete }: AnimatedIntroProps) {
  const [step, setStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  const words = [
    { text: 'Innov8', icon: null },
    { text: 'Camera', icon: Camera },
    { text: 'Focus', icon: Focus },
    { text: 'Smile', icon: Smile },
  ];

  useEffect(() => {
    // Progress through animation steps
    const timers: NodeJS.Timeout[] = [];

    words.forEach((_, index) => {
      timers.push(
        setTimeout(() => {
          setStep(index);
        }, index * 800)
      );
    });

    // Complete animation and trigger callback
    timers.push(
      setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => {
          onComplete();
        }, 600);
      }, words.length * 800 + 1000)
    );

    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-gradient-to-br from-gray-900 via-black to-gray-800"
        >
          {/* Animated Background Particles */}
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-primary/20 rounded-full"
                initial={{
                  x: Math.random() * window.innerWidth,
                  y: Math.random() * window.innerHeight,
                  scale: 0,
                }}
                animate={{
                  y: [null, Math.random() * window.innerHeight],
                  scale: [0, 1, 0],
                  opacity: [0, 0.5, 0],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
              />
            ))}
          </div>

          {/* Main Content */}
          <div className="relative z-10 text-center">
            {/* Words Animation */}
            <div className="mb-12">
              <AnimatePresence mode="wait">
                {words.map((word, index) => {
                  if (index !== step) return null;
                  
                  const Icon = word.icon;
                  
                  return (
                    <motion.div
                      key={word.text}
                      initial={{ opacity: 0, scale: 0.5, y: 20 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.5, y: -20 }}
                      transition={{ duration: 0.5 }}
                      className="flex flex-col items-center gap-6"
                    >
                      {Icon && (
                        <motion.div
                          initial={{ rotate: -180, scale: 0 }}
                          animate={{ rotate: 0, scale: 1 }}
                          transition={{ duration: 0.6, delay: 0.2 }}
                        >
                          <Icon className="w-20 h-20 text-primary" strokeWidth={1.5} />
                        </motion.div>
                      )}
                      <motion.h1
                        className="text-6xl md:text-8xl font-bold bg-gradient-to-r from-primary via-yellow-400 to-primary bg-clip-text text-transparent"
                        initial={{ letterSpacing: '0.5em', opacity: 0 }}
                        animate={{ letterSpacing: '0.1em', opacity: 1 }}
                        transition={{ duration: 0.6 }}
                      >
                        {word.text}
                      </motion.h1>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>

            {/* Loading Bar */}
            <motion.div
              className="w-64 h-1 mx-auto bg-gray-700 rounded-full overflow-hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <motion.div
                className="h-full bg-gradient-to-r from-primary to-yellow-400"
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{ duration: 3.2, ease: 'easeInOut' }}
              />
            </motion.div>

            {/* Subtitle */}
            <motion.p
              className="mt-8 text-gray-400 text-lg tracking-wider"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
            >
              Photography & Videography
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
