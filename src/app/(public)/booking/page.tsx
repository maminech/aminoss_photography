'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import EnhancedBookingForm from '@/modules/booking/EnhancedBookingForm';
import { useLayoutTheme } from '@/contexts/ThemeContext';
import NavigationButton from '@/components/NavigationButton';

export default function BookingPage() {
  const { currentTheme } = useLayoutTheme();
  const isProfessional = currentTheme === 'professional';

  if (isProfessional) {
    return (
      <div className="novo-booking-page bg-white dark:bg-gray-900 min-h-screen">
        <NavigationButton variant="both" />
        <section className="py-24 md:py-32 bg-white dark:bg-gray-900">
          <div className="container mx-auto px-6 max-w-6xl">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center mb-16"
            >
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-playfair font-bold text-[#1a1a1a] dark:text-gray-100 mb-8">
                Demande de Devis
              </h1>
              
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: '6rem' }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="h-[2px] bg-[#1a1a1a] mx-auto mb-8"
              />
              
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Réservez votre séance photo ou demandez un devis personnalisé
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="max-w-3xl mx-auto"
            >
              <EnhancedBookingForm />
            </motion.div>
          </div>
        </section>
      </div>
    );
  }

  // Simple/Instagram Mode
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900">
      <NavigationButton variant="both" />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8 py-8 sm:py-12 md:py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8 sm:mb-12"
        >
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Demande de Devis
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Réservez votre séance photo ou demandez un devis personnalisé
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <EnhancedBookingForm />
        </motion.div>
      </div>
    </div>
  );
}
