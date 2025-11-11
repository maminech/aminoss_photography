'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiMail, FiMapPin, FiInstagram, FiFacebook, FiYoutube, FiSend, FiPhone } from 'react-icons/fi';
import { useLayoutTheme } from '@/contexts/ThemeContext';
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
        const whatsappMessage = `Salut Innov8, ${formData.name} vous a contacté.\n\nEmail: ${formData.email}${formData.phone ? `\nTéléphone: ${formData.phone}` : ''}\n\nMessage:\n${formData.message}`;
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
      <div className="novo-contact-page bg-white dark:bg-gray-900 min-h-screen">
        <NavigationButton variant="both" />
        {/* Novo Hero Section */}
        <section className="py-24 md:py-32 bg-white dark:bg-gray-900">
          <div className="container mx-auto px-6 max-w-6xl">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center mb-16"
            >
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-playfair font-bold text-[#1a1a1a] dark:text-gray-100 mb-8">
                Contact
              </h1>
              
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: '60px' }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="h-[1px] bg-[#d4af37] mx-auto mb-12"
              />

              <p className="text-lg md:text-xl text-gray-700 dark:text-gray-300 font-lato leading-relaxed max-w-3xl mx-auto">
                Let's discuss your photography needs and create something amazing together
              </p>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
              {/* Contact Information - Novo Style */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="space-y-8"
              >
                <div>
                  <h2 className="text-2xl md:text-3xl font-playfair font-bold text-[#1a1a1a] dark:text-gray-100 mb-6">
                    Get In Touch
                  </h2>
                  <p className="text-gray-700 dark:text-gray-300 font-lato leading-relaxed mb-8">
                    Whether you're planning a wedding, need professional portraits, or have a creative project in mind, 
                    I'd love to hear from you. Fill out the form and I'll get back to you within 24 hours.
                  </p>
                </div>

                {/* Contact Details */}
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-[#d4af37] flex items-center justify-center flex-shrink-0">
                      <FiPhone className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-playfair font-bold text-[#1a1a1a] mb-1">Phone</h3>
                      <a href={`tel:${contactSettings.phone}`} className="text-gray-700 font-lato hover:text-[#d4af37] transition-colors">
                        {contactSettings.phone || '+216 94 124 796'}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-[#d4af37] flex items-center justify-center flex-shrink-0">
                      <FiMail className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-playfair font-bold text-[#1a1a1a] mb-1">Email</h3>
                      <a href={`mailto:${contactSettings.email}`} className="text-gray-700 font-lato hover:text-[#d4af37] transition-colors">
                        {contactSettings.email || 'aminoss.photography@gmail.com'}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-[#d4af37] flex items-center justify-center flex-shrink-0">
                      <FiMapPin className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-playfair font-bold text-[#1a1a1a] mb-1">Location</h3>
                      <p className="text-gray-700 font-lato">
                        {contactSettings.location || 'Sousse, Tunisia'}<br />
                        Available Worldwide
                      </p>
                    </div>
                  </div>
                </div>

                {/* Social Links */}
                <div>
                  <h3 className="text-lg font-playfair font-bold text-[#1a1a1a] mb-4">Follow Me</h3>
                  <div className="flex gap-4">
                    {contactSettings.instagramUrl && (
                      <a
                        href={contactSettings.instagramUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-12 h-12 rounded-full border-2 border-gray-300 flex items-center justify-center text-gray-600 hover:bg-[#d4af37] hover:border-[#d4af37] hover:text-white transition-all duration-300"
                      >
                        <FiInstagram className="w-5 h-5" />
                      </a>
                    )}
                    {contactSettings.facebookUrl && (
                      <a
                        href={contactSettings.facebookUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-12 h-12 rounded-full border-2 border-gray-300 flex items-center justify-center text-gray-600 hover:bg-[#d4af37] hover:border-[#d4af37] hover:text-white transition-all duration-300"
                      >
                        <FiFacebook className="w-5 h-5" />
                      </a>
                    )}
                    {contactSettings.youtubeUrl && (
                      <a
                        href={contactSettings.youtubeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-12 h-12 rounded-full border-2 border-gray-300 flex items-center justify-center text-gray-600 hover:bg-[#d4af37] hover:border-[#d4af37] hover:text-white transition-all duration-300"
                      >
                        <FiYoutube className="w-5 h-5" />
                      </a>
                    )}
                  </div>
                </div>
              </motion.div>

              {/* Contact Form - Novo Style */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-lato font-medium text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">
                      Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-6 py-4 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 font-lato text-base focus:border-[#d4af37] focus:outline-none focus:ring-2 focus:ring-[#d4af37]/20 transition-all"
                      placeholder="Your Name"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-lato font-medium text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">
                      Email *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-6 py-4 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 font-lato text-base focus:border-[#d4af37] focus:outline-none focus:ring-2 focus:ring-[#d4af37]/20 transition-all"
                      placeholder="your@email.com"
                    />
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-sm font-lato font-medium text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">
                      Phone
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-6 py-4 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 font-lato text-base focus:border-[#d4af37] focus:outline-none focus:ring-2 focus:ring-[#d4af37]/20 transition-all"
                      placeholder="Your Phone Number"
                    />
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-lato font-medium text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">
                      Message *
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows={6}
                      className="w-full px-6 py-4 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 font-lato text-base focus:border-[#d4af37] focus:outline-none focus:ring-2 focus:ring-[#d4af37]/20 transition-all resize-none"
                      placeholder="Tell me about your project..."
                    />
                  </div>

                  {status === 'success' && (
                    <div className="p-4 bg-green-50 border border-green-200 text-green-800 font-lato text-sm">
                      Message sent successfully! I'll get back to you soon.
                    </div>
                  )}

                  {status === 'error' && (
                    <div className="p-4 bg-red-50 border border-red-200 text-red-800 font-lato text-sm">
                      {errorMessage}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={status === 'loading'}
                    className="w-full px-10 py-4 bg-[#1a1a1a] text-white font-lato font-medium text-sm uppercase tracking-[0.2em] hover:bg-[#d4af37] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {status === 'loading' ? (
                      <>Sending...</>
                    ) : (
                      <>
                        <FiSend className="w-4 h-4" />
                        Send Message
                      </>
                    )}
                  </button>
                </form>
              </motion.div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  // Simple Theme Layout (existing)
  return (
    <div className="min-h-screen py-16 sm:py-20 md:py-24 px-3 sm:px-4 md:px-6 lg:px-8">
      <NavigationButton variant="both" />
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Header */}
          <div className="text-center mb-10 sm:mb-12 md:mb-16">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-display font-bold mb-3 sm:mb-4 text-gray-900 dark:text-gray-100">
              Get In Touch
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base md:text-lg max-w-2xl mx-auto px-4">
              Let's discuss your photography needs and create something amazing together
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-10 md:gap-12">
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="input-field text-base min-h-[48px]"
                    placeholder="Your name"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="input-field text-base min-h-[48px]"
                    placeholder="your@email.com"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Phone Number (Optional)
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="input-field text-base min-h-[48px]"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={6}
                    className="input-field resize-none text-base"
                    placeholder="Tell me about your project..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="btn-primary w-full inline-flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed min-h-[48px] text-base"
                >
                  {status === 'loading' ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <FiSend />
                      Send Message
                    </>
                  )}
                </button>

                {status === 'success' && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-green-50 dark:bg-green-900/30 text-green-800 dark:text-green-200 rounded-lg border border-green-200 dark:border-green-700 text-sm sm:text-base"
                  >
                    ✓ Message sent successfully! I'll get back to you soon.
                  </motion.div>
                )}

                {status === 'error' && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-red-50 dark:bg-red-900/30 text-red-800 dark:text-red-200 rounded-lg border border-red-200 dark:border-red-700 text-sm sm:text-base"
                  >
                    ✗ {errorMessage}
                  </motion.div>
                )}
              </form>
            </motion.div>

            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="space-y-6 sm:space-y-8">
              {/* Info Cards */}
              <div className="bg-gray-50 dark:bg-dark-800 rounded-xl sm:rounded-2xl p-6 sm:p-8 space-y-5 sm:space-y-6">
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="p-2.5 sm:p-3 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex-shrink-0">
                    <FiMail className="w-5 h-5 sm:w-6 sm:h-6 text-primary-600 dark:text-primary-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-base sm:text-lg mb-1 text-gray-900 dark:text-gray-100">Email</h3>
                    <a
                      href={`mailto:${contactSettings.email}`}
                      className="text-sm sm:text-base text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors break-all"
                    >
                      {contactSettings.email || 'aminoss.photography@gmail.com'}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="p-2.5 sm:p-3 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex-shrink-0">
                    <FiMapPin className="w-5 h-5 sm:w-6 sm:h-6 text-primary-600 dark:text-primary-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-base sm:text-lg mb-1 text-gray-900 dark:text-gray-100">Location</h3>
                    <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                      {contactSettings.location || 'Sousse, Tunisia'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Social Links */}
              <div>
                <h3 className="font-semibold text-base sm:text-lg mb-3 sm:mb-4 text-gray-900 dark:text-gray-100">Follow Me</h3>
                <div className="flex gap-3 sm:gap-4">
                  {contactSettings.instagramUrl && (
                    <a
                      href={contactSettings.instagramUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3.5 sm:p-4 min-w-[48px] min-h-[48px] bg-gray-100 dark:bg-dark-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-primary-600 hover:text-white dark:hover:bg-primary-600 dark:hover:text-white transition-colors group flex items-center justify-center"
                      aria-label="Instagram"
                    >
                      <FiInstagram className="w-5 h-5 sm:w-6 sm:h-6" />
                    </a>
                  )}
                  {contactSettings.facebookUrl && (
                    <a
                      href={contactSettings.facebookUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3.5 sm:p-4 min-w-[48px] min-h-[48px] bg-gray-100 dark:bg-dark-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-primary-600 hover:text-white dark:hover:bg-primary-600 dark:hover:text-white transition-colors group flex items-center justify-center"
                      aria-label="Facebook"
                    >
                      <FiFacebook className="w-5 h-5 sm:w-6 sm:h-6" />
                    </a>
                  )}
                  {contactSettings.youtubeUrl && (
                    <a
                      href={contactSettings.youtubeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3.5 sm:p-4 min-w-[48px] min-h-[48px] bg-gray-100 dark:bg-dark-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-primary-600 hover:text-white dark:hover:bg-primary-600 dark:hover:text-white transition-colors group flex items-center justify-center"
                      aria-label="YouTube"
                    >
                      <FiYoutube className="w-5 h-5 sm:w-6 sm:h-6" />
                    </a>
                  )}
                </div>
              </div>

              {/* Business Hours */}
              <div className="bg-gray-50 dark:bg-dark-800 rounded-xl sm:rounded-2xl p-6 sm:p-8">
                <h3 className="font-semibold text-base sm:text-lg mb-3 sm:mb-4 text-gray-900 dark:text-gray-100">Availability</h3>
                <div className="space-y-2 text-sm sm:text-base text-gray-600 dark:text-gray-400">
                  <p>Monday - Friday: 9:00 AM - 7:00 PM</p>
                  <p>Saturday: 10:00 AM - 6:00 PM</p>
                  <p>Sunday: By appointment only</p>
                </div>
                <p className="mt-3 sm:mt-4 text-xs sm:text-sm text-gray-500 dark:text-gray-500">
                  Response time: Usually within 24 hours
                </p>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
