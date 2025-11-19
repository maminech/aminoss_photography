'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiMail, FiMapPin, FiInstagram, FiFacebook, FiYoutube, FiSend, FiPhone } from 'react-icons/fi';
import { useLayoutTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import NavigationButton from '@/components/NavigationButton';

interface ContactSettings {
  email?: string;
  phone?: string;
  whatsappNumber?: string;
  instagramUrl?: string;
  facebookUrl?: string;
  youtubeUrl?: string;
  location?: string;
}

export default function ContactPage() {
  const { currentTheme } = useLayoutTheme();
  const { t } = useLanguage();
  const isProfessional = currentTheme === 'professional';
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [contactSettings, setContactSettings] = useState<ContactSettings>({
    email: 'innov8production@gmail.com',
    phone: '+216 55985565',
    whatsappNumber: '21655985565',
    instagramUrl: 'https://www.instagram.com/innov8_production',
    facebookUrl: 'https://www.facebook.com/innovproduction',
    youtubeUrl: 'https://youtube.com/@innov8production',
    location: 'Moknine, Sousse Governorate, Tunisia',
  });

  // Load contact settings on mount
  useEffect(() => {
    fetch('/api/settings/contact')
      .then(res => res.json())
      .then(data => setContactSettings(prev => ({ ...prev, ...data })))
      .catch(console.error);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMessage('');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        
        // Prepare WhatsApp message
        const whatsappNumber = contactSettings.whatsappNumber || '21655985565';
        const whatsappMessage = `Salut Innov8, ${formData.name} vous a contacté.\n\nTéléphone: ${formData.phone}${formData.email ? `\nEmail: ${formData.email}` : ''}\n\nMessage:\n${formData.message}`;
        const encodedMessage = encodeURIComponent(whatsappMessage);
        
        // Open WhatsApp in new tab/window
        window.open(`https://wa.me/${whatsappNumber}?text=${encodedMessage}`, '_blank');
        
        // Reset form
        setFormData({ name: '', email: '', phone: '', message: '' });
      } else {
        setStatus('error');
        setErrorMessage(data.error || 'Something went wrong');
      }
    } catch (error) {
      setStatus('error');
      setErrorMessage('Failed to send message. Please try again.');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // Professional/Novo Theme Layout
  if (isProfessional) {
    return (
      <div className="novo-contact-page bg-gradient-to-br from-white via-gray-50 to-gray-100 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 min-h-screen relative overflow-hidden">
        {/* Fixed Navigation Button - No Text Overlap */}
        <div className="fixed top-6 left-6 z-50">
          <NavigationButton variant="both" />
        </div>

        {/* Decorative Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            animate={{ 
              rotate: [0, 360],
              scale: [1, 1.2, 1]
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute -top-48 -right-48 w-96 h-96 bg-gradient-to-br from-[#d4af37]/10 to-[#f4d03f]/10 rounded-full blur-3xl"
          />
          <motion.div
            animate={{ 
              rotate: [360, 0],
              scale: [1, 1.3, 1]
            }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            className="absolute -bottom-48 -left-48 w-96 h-96 bg-gradient-to-tr from-[#d4af37]/10 to-[#e4c087]/10 rounded-full blur-3xl"
          />
        </div>

        {/* Novo Hero Section */}
        <section className="py-32 md:py-40 relative">
          <div className="container mx-auto px-6 max-w-6xl">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center mb-20"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="inline-block mb-6 px-6 py-2 bg-[#d4af37]/10 backdrop-blur-sm rounded-full"
              >
                <span className="text-[#d4af37] font-lato font-semibold text-sm uppercase tracking-wider">
                  Let's Connect
                </span>
              </motion.div>

              <h1 className="text-5xl md:text-6xl lg:text-7xl font-playfair font-bold text-[#1a1a1a] dark:text-gray-100 mb-8 leading-tight">
                {t('contact.title')}
              </h1>
              
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: '80px' }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="h-[2px] bg-gradient-to-r from-transparent via-[#d4af37] to-transparent mx-auto mb-8"
              />

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 font-lato leading-relaxed max-w-3xl mx-auto"
              >
                {t('contact.subtitle')}
              </motion.p>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
              {/* Contact Information - Novo Style */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="space-y-8"
              >
                {/* Glassmorphism Card */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="relative p-8 rounded-3xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden"
                >
                  {/* Card Decorative Gradient */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#d4af37]/20 to-transparent rounded-full blur-2xl" />
                  
                  <div className="relative z-10">
                    <h2 className="text-3xl md:text-4xl font-playfair font-bold text-[#1a1a1a] dark:text-gray-100 mb-4">
                      {t('contact.getInTouch')}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-300 font-lato leading-relaxed text-lg">
                      {t('contact.contactDescription')}
                    </p>
                  </div>
                </motion.div>

                {/* Contact Details */}
                <div className="space-y-6">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.5 }}
                    whileHover={{ x: 5 }}
                    className="flex items-start gap-5 p-6 rounded-2xl bg-white/60 dark:bg-gray-800/60 backdrop-blur-md shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200/50 dark:border-gray-700/50"
                  >
                    <motion.div
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.5 }}
                      className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#d4af37] to-[#f4d03f] flex items-center justify-center flex-shrink-0 shadow-lg"
                    >
                      <FiPhone className="w-6 h-6 text-white" />
                    </motion.div>
                    <div>
                      <h3 className="text-xl font-playfair font-bold text-[#1a1a1a] dark:text-gray-100 mb-2">
                        {t('contact.phone')}
                      </h3>
                      <a 
                        href={`tel:${contactSettings.phone}`} 
                        className="text-gray-700 dark:text-gray-300 font-lato hover:text-[#d4af37] dark:hover:text-[#d4af37] transition-colors text-lg"
                      >
                        {contactSettings.phone || '+216 94 124 796'}
                      </a>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.6 }}
                    whileHover={{ x: 5 }}
                    className="flex items-start gap-5 p-6 rounded-2xl bg-white/60 dark:bg-gray-800/60 backdrop-blur-md shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200/50 dark:border-gray-700/50"
                  >
                    <motion.div
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.5 }}
                      className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#d4af37] to-[#f4d03f] flex items-center justify-center flex-shrink-0 shadow-lg"
                    >
                      <FiMail className="w-6 h-6 text-white" />
                    </motion.div>
                    <div>
                      <h3 className="text-xl font-playfair font-bold text-[#1a1a1a] dark:text-gray-100 mb-2">
                        {t('contact.email_label')}
                      </h3>
                      <a 
                        href={`mailto:${contactSettings.email}`} 
                        className="text-gray-700 dark:text-gray-300 font-lato hover:text-[#d4af37] dark:hover:text-[#d4af37] transition-colors break-all text-lg"
                      >
                        {contactSettings.email || 'innov8.tn@gmail.com'}
                      </a>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.7 }}
                    whileHover={{ x: 5 }}
                    className="flex items-start gap-5 p-6 rounded-2xl bg-white/60 dark:bg-gray-800/60 backdrop-blur-md shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200/50 dark:border-gray-700/50"
                  >
                    <motion.div
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.5 }}
                      className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#d4af37] to-[#f4d03f] flex items-center justify-center flex-shrink-0 shadow-lg"
                    >
                      <FiMapPin className="w-6 h-6 text-white" />
                    </motion.div>
                    <div>
                      <h3 className="text-xl font-playfair font-bold text-[#1a1a1a] dark:text-gray-100 mb-2">
                        {t('contact.location')}
                      </h3>
                      <p className="text-gray-700 dark:text-gray-300 font-lato text-lg">
                        {contactSettings.location || 'Sousse, Tunisia'}<br />
                        <span className="text-[#d4af37] font-semibold">{t('contact.availableWorldwide')}</span>
                      </p>
                    </div>
                  </motion.div>
                </div>

                {/* Social Links */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.8 }}
                  className="p-8 rounded-3xl bg-gradient-to-br from-white/80 to-gray-50/80 dark:from-gray-800/80 dark:to-gray-900/80 backdrop-blur-xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50"
                >
                  <h3 className="text-2xl font-playfair font-bold text-[#1a1a1a] dark:text-gray-100 mb-6">
                    {t('contact.followMe')}
                  </h3>
                  <div className="flex gap-4">
                    {contactSettings.instagramUrl && (
                      <motion.a
                        whileHover={{ scale: 1.15, rotate: 5 }}
                        whileTap={{ scale: 0.95 }}
                        href={contactSettings.instagramUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-14 h-14 rounded-2xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-white shadow-lg hover:shadow-2xl transition-all duration-300"
                      >
                        <FiInstagram className="w-6 h-6" />
                      </motion.a>
                    )}
                    {contactSettings.facebookUrl && (
                      <motion.a
                        whileHover={{ scale: 1.15, rotate: -5 }}
                        whileTap={{ scale: 0.95 }}
                        href={contactSettings.facebookUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white shadow-lg hover:shadow-2xl transition-all duration-300"
                      >
                        <FiFacebook className="w-6 h-6" />
                      </motion.a>
                    )}
                    {contactSettings.youtubeUrl && (
                      <motion.a
                        whileHover={{ scale: 1.15, rotate: 5 }}
                        whileTap={{ scale: 0.95 }}
                        href={contactSettings.youtubeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center text-white shadow-lg hover:shadow-2xl transition-all duration-300"
                      >
                        <FiYoutube className="w-6 h-6" />
                      </motion.a>
                    )}
                  </div>
                </motion.div>
              </motion.div>

              {/* Contact Form - Novo Style */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="relative"
              >
                {/* Form Card with Glassmorphism */}
                <motion.div
                  whileHover={{ y: -5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="relative p-10 rounded-3xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-2xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden"
                >
                  {/* Decorative Shine Effect */}
                  <motion.div
                    animate={{
                      x: ['-100%', '200%'],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      repeatDelay: 2,
                      ease: "easeInOut"
                    }}
                    className="absolute top-0 left-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12"
                  />

                  <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                  >
                    <label htmlFor="name" className="block text-sm font-lato font-semibold text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wider">
                      {t('contact.name')} *
                    </label>
                    <motion.input
                      whileFocus={{ scale: 1.02 }}
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-6 py-5 rounded-2xl border-2 border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm text-gray-900 dark:text-gray-100 font-lato text-base focus:border-[#d4af37] focus:outline-none focus:ring-4 focus:ring-[#d4af37]/20 transition-all shadow-sm hover:shadow-md"
                      placeholder={t('contact.name')}
                    />
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.6 }}
                  >
                    <label htmlFor="phone" className="block text-sm font-lato font-semibold text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wider">
                      {t('contact.phone')} *
                    </label>
                    <motion.input
                      whileFocus={{ scale: 1.02 }}
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                      className="w-full px-6 py-5 rounded-2xl border-2 border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm text-gray-900 dark:text-gray-100 font-lato text-base focus:border-[#d4af37] focus:outline-none focus:ring-4 focus:ring-[#d4af37]/20 transition-all shadow-sm hover:shadow-md"
                      placeholder={t('contact.phone')}
                    />
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.7 }}
                  >
                    <label htmlFor="email" className="block text-sm font-lato font-semibold text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wider">
                      {t('contact.email')}
                    </label>
                    <motion.input
                      whileFocus={{ scale: 1.02 }}
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-6 py-5 rounded-2xl border-2 border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm text-gray-900 dark:text-gray-100 font-lato text-base focus:border-[#d4af37] focus:outline-none focus:ring-4 focus:ring-[#d4af37]/20 transition-all shadow-sm hover:shadow-md"
                      placeholder={t('contact.email')}
                    />
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.8 }}
                  >
                    <label htmlFor="message" className="block text-sm font-lato font-semibold text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wider">
                      {t('contact.message')} *
                    </label>
                    <motion.textarea
                      whileFocus={{ scale: 1.02 }}
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows={6}
                      className="w-full px-6 py-5 rounded-2xl border-2 border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm text-gray-900 dark:text-gray-100 font-lato text-base focus:border-[#d4af37] focus:outline-none focus:ring-4 focus:ring-[#d4af37]/20 transition-all resize-none shadow-sm hover:shadow-md"
                      placeholder={t('contact.message')}
                    />
                  </motion.div>

                  {status === 'success' && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="p-6 rounded-2xl bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 border-2 border-green-300 dark:border-green-700 text-green-800 dark:text-green-200 font-lato shadow-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                          <span className="text-white text-xl">✓</span>
                        </div>
                        <span className="font-semibold">{t('contact.success')}</span>
                      </div>
                    </motion.div>
                  )}

                  {status === 'error' && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="p-6 rounded-2xl bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/30 dark:to-pink-900/30 border-2 border-red-300 dark:border-red-700 text-red-800 dark:text-red-200 font-lato shadow-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center">
                          <span className="text-white text-xl">✗</span>
                        </div>
                        <span className="font-semibold">{errorMessage}</span>
                      </div>
                    </motion.div>
                  )}

                  <motion.button
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={status === 'loading'}
                    className="w-full px-10 py-6 rounded-2xl bg-gradient-to-r from-[#1a1a1a] to-[#2a2a2a] hover:from-[#d4af37] hover:to-[#f4d03f] text-white font-lato font-bold text-base uppercase tracking-[0.2em] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-xl hover:shadow-2xl"
                  >
                    {status === 'loading' ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full"
                        />
                        <span>{t('contact.sending')}</span>
                      </>
                    ) : (
                      <>
                        <FiSend className="w-5 h-5" />
                        <span>{t('contact.send')}</span>
                      </>
                    )}
                  </motion.button>
                </form>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  // Simple Theme Layout - Now matching Professional
  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-white via-gray-50 to-gray-100 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      {/* Fixed Navigation Button - No Text Overlap */}
      <div className="fixed top-6 left-6 z-50">
        <NavigationButton variant="both" />
      </div>

      {/* Decorative Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ 
            rotate: [0, 360],
            scale: [1, 1.2, 1]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-48 -right-48 w-96 h-96 bg-gradient-to-br from-primary-500/10 to-pink-500/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ 
            rotate: [360, 0],
            scale: [1, 1.3, 1]
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-48 -left-48 w-96 h-96 bg-gradient-to-tr from-primary-500/10 to-orange-500/10 rounded-full blur-3xl"
        />
      </div>

      <div className="relative py-32 md:py-40 px-6 max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Header */}
          <div className="text-center mb-16 sm:mb-20">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="inline-block mb-6 px-6 py-2 bg-gradient-to-r from-primary-500/10 to-pink-500/10 backdrop-blur-sm rounded-full"
            >
              <span className="text-primary-600 dark:text-primary-400 font-semibold text-sm uppercase tracking-wider">
                Let's Connect
              </span>
            </motion.div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display font-bold mb-6 sm:mb-8 text-gray-900 dark:text-gray-100 leading-tight">
              {t('contact.getInTouch')}
            </h1>

            <motion.div
              initial={{ width: 0 }}
              animate={{ width: '80px' }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="h-[2px] bg-gradient-to-r from-transparent via-primary-500 to-transparent mx-auto mb-8"
            />

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="text-lg sm:text-xl md:text-2xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto px-4 leading-relaxed"
            >
              {t('contact.subtitle')}
            </motion.p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 md:gap-16">
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              {/* Form Card with Glassmorphism */}
              <motion.div
                whileHover={{ y: -5 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="relative p-8 sm:p-10 rounded-3xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-2xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden"
              >
                {/* Decorative Shine Effect */}
                <motion.div
                  animate={{
                    x: ['-100%', '200%'],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    repeatDelay: 2,
                    ease: "easeInOut"
                  }}
                  className="absolute top-0 left-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12"
                />

              <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                >
                  <label htmlFor="name" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wider">
                    {t('contact.name')} *
                  </label>
                  <motion.input
                    whileFocus={{ scale: 1.02 }}
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-6 py-5 rounded-2xl border-2 border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm text-gray-900 dark:text-gray-100 text-base focus:border-primary-500 focus:outline-none focus:ring-4 focus:ring-primary-500/20 transition-all shadow-sm hover:shadow-md"
                    placeholder={t('contact.name')}
                  />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.6 }}
                >
                  <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wider">
                    {t('contact.phone')} *
                  </label>
                  <motion.input
                    whileFocus={{ scale: 1.02 }}
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    className="w-full px-6 py-5 rounded-2xl border-2 border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm text-gray-900 dark:text-gray-100 text-base focus:border-primary-500 focus:outline-none focus:ring-4 focus:ring-primary-500/20 transition-all shadow-sm hover:shadow-md"
                    placeholder={t('contact.phone')}
                  />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.7 }}
                >
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wider">
                    {t('contact.email')}
                  </label>
                  <motion.input
                    whileFocus={{ scale: 1.02 }}
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-6 py-5 rounded-2xl border-2 border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm text-gray-900 dark:text-gray-100 text-base focus:border-primary-500 focus:outline-none focus:ring-4 focus:ring-primary-500/20 transition-all shadow-sm hover:shadow-md"
                    placeholder={t('contact.email')}
                  />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.8 }}
                >
                  <label htmlFor="message" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wider">
                    {t('contact.message')} *
                  </label>
                  <motion.textarea
                    whileFocus={{ scale: 1.02 }}
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={6}
                    className="w-full px-6 py-5 rounded-2xl border-2 border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm text-gray-900 dark:text-gray-100 text-base focus:border-primary-500 focus:outline-none focus:ring-4 focus:ring-primary-500/20 transition-all resize-none shadow-sm hover:shadow-md"
                    placeholder={t('contact.message')}
                  />
                </motion.div>

                {status === 'success' && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-6 rounded-2xl bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 border-2 border-green-300 dark:border-green-700 text-green-800 dark:text-green-200 shadow-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                        <span className="text-white text-xl">✓</span>
                      </div>
                      <span className="font-semibold">{t('contact.success')}</span>
                    </div>
                  </motion.div>
                )}

                {status === 'error' && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-6 rounded-2xl bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/30 dark:to-pink-900/30 border-2 border-red-300 dark:border-red-700 text-red-800 dark:text-red-200 shadow-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center">
                        <span className="text-white text-xl">✗</span>
                      </div>
                      <span className="font-semibold">{errorMessage}</span>
                    </div>
                  </motion.div>
                )}

                <motion.button
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={status === 'loading'}
                  className="w-full px-10 py-6 rounded-2xl bg-gradient-to-r from-primary-600 to-pink-600 hover:from-primary-500 hover:to-pink-500 text-white font-bold text-base uppercase tracking-[0.2em] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-xl hover:shadow-2xl"
                >
                  {status === 'loading' ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full"
                      />
                      <span>{t('contact.sending')}</span>
                    </>
                  ) : (
                    <>
                      <FiSend className="w-5 h-5" />
                      <span>{t('contact.send')}</span>
                    </>
                  )}
                </motion.button>
              </form>
              </motion.div>
            </motion.div>

            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="space-y-8">
              
              {/* Contact Details Cards */}
              <div className="space-y-6">
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                  whileHover={{ x: -5 }}
                  className="flex items-start gap-5 p-6 rounded-2xl bg-white/60 dark:bg-gray-800/60 backdrop-blur-md shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200/50 dark:border-gray-700/50"
                >
                  <motion.div
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.5 }}
                    className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-pink-500 flex items-center justify-center flex-shrink-0 shadow-lg"
                  >
                    <FiMail className="w-6 h-6 text-white" />
                  </motion.div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-xl mb-2 text-gray-900 dark:text-gray-100">{t('contact.email_label')}</h3>
                    <a
                      href={`mailto:${contactSettings.email}`}
                      className="text-lg text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors break-all"
                    >
                      {contactSettings.email || 'innov8.tn@gmail.com'}
                    </a>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.6 }}
                  whileHover={{ x: -5 }}
                  className="flex items-start gap-5 p-6 rounded-2xl bg-white/60 dark:bg-gray-800/60 backdrop-blur-md shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200/50 dark:border-gray-700/50"
                >
                  <motion.div
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.5 }}
                    className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-orange-500 flex items-center justify-center flex-shrink-0 shadow-lg"
                  >
                    <FiMapPin className="w-6 h-6 text-white" />
                  </motion.div>
                  <div>
                    <h3 className="font-bold text-xl mb-2 text-gray-900 dark:text-gray-100">{t('contact.location')}</h3>
                    <p className="text-lg text-gray-700 dark:text-gray-300">
                      {contactSettings.location || 'Sousse, Tunisia'}
                    </p>
                  </div>
                </motion.div>
              </div>

              {/* Social Links */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.7 }}
                className="p-8 rounded-3xl bg-gradient-to-br from-white/80 to-gray-50/80 dark:from-gray-800/80 dark:to-gray-900/80 backdrop-blur-xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50"
              >
                <h3 className="font-bold text-2xl mb-6 text-gray-900 dark:text-gray-100">{t('contact.followMe')}</h3>
                <div className="flex gap-4">
                  {contactSettings.instagramUrl && (
                    <motion.a
                      whileHover={{ scale: 1.15, rotate: 5 }}
                      whileTap={{ scale: 0.95 }}
                      href={contactSettings.instagramUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-14 h-14 rounded-2xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-white shadow-lg hover:shadow-2xl transition-all duration-300"
                      aria-label="Instagram"
                    >
                      <FiInstagram className="w-6 h-6" />
                    </motion.a>
                  )}
                  {contactSettings.facebookUrl && (
                    <motion.a
                      whileHover={{ scale: 1.15, rotate: -5 }}
                      whileTap={{ scale: 0.95 }}
                      href={contactSettings.facebookUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white shadow-lg hover:shadow-2xl transition-all duration-300"
                      aria-label="Facebook"
                    >
                      <FiFacebook className="w-6 h-6" />
                    </motion.a>
                  )}
                  {contactSettings.youtubeUrl && (
                    <motion.a
                      whileHover={{ scale: 1.15, rotate: 5 }}
                      whileTap={{ scale: 0.95 }}
                      href={contactSettings.youtubeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center text-white shadow-lg hover:shadow-2xl transition-all duration-300"
                      aria-label="YouTube"
                    >
                      <FiYoutube className="w-6 h-6" />
                    </motion.a>
                  )}
                </div>
              </motion.div>

              {/* Business Hours */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8 }}
                className="p-8 rounded-3xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50"
              >
                <h3 className="font-bold text-2xl mb-6 text-gray-900 dark:text-gray-100">Availability</h3>
                <div className="space-y-3 text-lg text-gray-700 dark:text-gray-300">
                  <p className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                    Monday - Friday: 9:00 AM - 7:00 PM
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                    Saturday: 10:00 AM - 6:00 PM
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
                    Sunday: By appointment only
                  </p>
                </div>
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                  className="mt-6 text-sm text-primary-600 dark:text-primary-400 font-semibold bg-primary-50 dark:bg-primary-900/20 p-3 rounded-xl"
                >
                  ⚡ Response time: Usually within 24 hours
                </motion.p>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
