'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCheck, FiClock, FiDollarSign, FiCalendar, FiX } from 'react-icons/fi';
import { useLayoutTheme } from '@/contexts/ThemeContext';
import NavigationButton from '@/components/NavigationButton';

interface Pack {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: string;
  coverImage: string;
  features: string[];
  category: string;
}

export default function PacksPage() {
  const { currentTheme } = useLayoutTheme();
  const isProfessional = currentTheme === 'professional';
  const [packs, setPacks] = useState<Pack[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPack, setSelectedPack] = useState<Pack | null>(null);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [filter, setFilter] = useState('all');
  const [showFloatingButton, setShowFloatingButton] = useState(false);
  const [bookingStatus, setBookingStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const [bookingForm, setBookingForm] = useState({
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    requestedDate: '',
    alternateDate: '',
    message: '',
  });

  useEffect(() => {
    fetchPacks();
  }, []);

  // Show floating button on scroll
  useEffect(() => {
    const handleScroll = () => {
      setShowFloatingButton(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const fetchPacks = async () => {
    try {
      const res = await fetch('/api/packs');
      if (res.ok) {
        const data = await res.json();
        setPacks(data);
      }
    } catch (error) {
      console.error('Error fetching packs:', error);
    } finally {
      setLoading(false);
    }
  };

  const categories = ['all', ...Array.from(new Set(packs.map(p => p.category)))];
  const filteredPacks = filter === 'all' ? packs : packs.filter(p => p.category === filter);

  const openBookingModal = (pack: Pack) => {
    setSelectedPack(pack);
    setBookingModalOpen(true);
  };

  const closeBookingModal = () => {
    setBookingModalOpen(false);
    setSelectedPack(null);
    setBookingStatus('idle');
    setBookingForm({
      clientName: '',
      clientEmail: '',
      clientPhone: '',
      requestedDate: '',
      alternateDate: '',
      message: '',
    });
  };

  const handleSubmitBooking = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedPack) return;

    setBookingStatus('loading');

    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...bookingForm,
          packId: selectedPack.id,
          packName: selectedPack.name,
        }),
      });

      if (res.ok) {
        setBookingStatus('success');
        setTimeout(() => {
          closeBookingModal();
        }, 2000);
      } else {
        const data = await res.json();
        setBookingStatus('error');
        console.error('Booking error:', data.error);
      }
    } catch (error) {
      setBookingStatus('error');
      console.error('Booking submission error:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading packages...</p>
        </div>
      </div>
    );
  }

  // Professional/Novo Theme Layout
  if (isProfessional) {
    return (
      <div className="novo-packs-page bg-white dark:bg-gray-900 min-h-screen">
        <NavigationButton variant="both" />
        <section className="py-24 md:py-32 bg-white dark:bg-gray-900">
          <div className="container mx-auto px-6 max-w-7xl">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center mb-16"
            >
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-playfair font-bold text-[#1a1a1a] dark:text-gray-100 mb-8">
                Photography Packages
              </h1>
              
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: '60px' }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="h-[1px] bg-[#d4af37] mx-auto mb-12"
              />

              <p className="text-lg md:text-xl text-gray-700 dark:text-gray-300 font-lato leading-relaxed max-w-3xl mx-auto">
                Professional photography packages tailored to capture your special moments
              </p>
            </motion.div>

            {/* Category Filters - Novo Style */}
            <div className="flex flex-wrap justify-center gap-4 mb-12">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setFilter(category)}
                  className={`px-6 py-2 text-sm font-lato uppercase tracking-[0.2em] transition-all duration-300 ${
                    filter === category
                      ? 'bg-[#d4af37] text-white'
                      : 'bg-transparent text-[#1a1a1a] dark:text-gray-100 border border-gray-300 hover:border-[#d4af37]'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            {/* Packs Grid - Novo Style */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredPacks.map((pack, index) => (
                <motion.div
                  key={pack.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="group bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-[#d4af37] transition-all duration-300 overflow-hidden"
                >
                  {/* Pack Cover Image */}
                  <div className="relative aspect-[4/3] overflow-hidden">
                    {pack.coverImage ? (
                      <img
                        src={pack.coverImage}
                        alt={pack.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300" />
                    )}
                    
                    {/* Price Badge */}
                    <div className="absolute top-4 right-4 bg-[#d4af37] text-white px-4 py-2">
                      <span className="text-2xl font-playfair font-bold">${pack.price}</span>
                    </div>
                  </div>

                  {/* Pack Details */}
                  <div className="p-6">
                    <h3 className="text-2xl font-playfair font-bold text-[#1a1a1a] dark:text-gray-100 mb-3 group-hover:text-[#d4af37] transition-colors">
                      {pack.name}
                    </h3>
                    
                    <p className="text-gray-600 font-lato mb-4 line-clamp-2">
                      {pack.description}
                    </p>

                    {/* Duration */}
                    <div className="flex items-center gap-2 mb-4 text-gray-600">
                      <FiClock className="w-4 h-4" />
                      <span className="font-lato text-sm">{pack.duration}</span>
                    </div>

                    {/* Features List */}
                    <ul className="space-y-2 mb-6">
                      {pack.features.slice(0, 4).map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
                          <FiCheck className="w-4 h-4 text-[#d4af37] mt-1 flex-shrink-0" />
                          <span className="font-lato text-sm">{feature}</span>
                        </li>
                      ))}
                      {pack.features.length > 4 && (
                        <li className="text-[#d4af37] font-lato text-sm">
                          +{pack.features.length - 4} more features
                        </li>
                      )}
                    </ul>

                    {/* Book Button */}
                    <button
                      onClick={() => openBookingModal(pack)}
                      className="w-full px-6 py-3 bg-[#1a1a1a] text-white font-lato text-sm uppercase tracking-[0.2em] hover:bg-[#d4af37] transition-all duration-300"
                    >
                      Book Now
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>

            {filteredPacks.length === 0 && (
              <div className="text-center py-16">
                <p className="text-gray-500 font-lato text-lg">No packages available yet.</p>
              </div>
            )}
          </div>
        </section>

        {/* Booking Modal - Novo Style */}
        <AnimatePresence>
          {bookingModalOpen && selectedPack && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
              onClick={closeBookingModal}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              >
                {/* Modal Header */}
                <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 flex justify-between items-center">
                  <div>
                    <h2 className="text-3xl font-playfair font-bold text-[#1a1a1a] dark:text-gray-100">
                      Book {selectedPack.name}
                    </h2>
                    <p className="text-[#d4af37] font-lato text-lg mt-1">${selectedPack.price}</p>
                  </div>
                  <button
                    onClick={closeBookingModal}
                    className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 transition-colors"
                  >
                    <FiX className="w-6 h-6" />
                  </button>
                </div>

                {/* Modal Content */}
                <div className="p-6">
                  {bookingStatus === 'success' ? (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FiCheck className="w-8 h-8 text-green-600" />
                      </div>
                      <h3 className="text-2xl font-playfair font-bold text-[#1a1a1a] dark:text-gray-100 mb-2">
                        Booking Request Sent!
                      </h3>
                      <p className="text-gray-600 font-lato">
                        We'll contact you shortly to confirm your booking.
                      </p>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmitBooking} className="space-y-6">
                      <div>
                        <label className="block text-sm font-lato uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-2">
                          Your Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={bookingForm.clientName}
                          onChange={(e) => setBookingForm({ ...bookingForm, clientName: e.target.value })}
                          className="w-full px-6 py-4 border border-gray-300 focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37]/20 outline-none transition-colors font-lato"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-lato uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-2">
                          Email *
                        </label>
                        <input
                          type="email"
                          required
                          value={bookingForm.clientEmail}
                          onChange={(e) => setBookingForm({ ...bookingForm, clientEmail: e.target.value })}
                          className="w-full px-6 py-4 border border-gray-300 focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37]/20 outline-none transition-colors font-lato"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-lato uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-2">
                          Phone
                        </label>
                        <input
                          type="tel"
                          value={bookingForm.clientPhone}
                          onChange={(e) => setBookingForm({ ...bookingForm, clientPhone: e.target.value })}
                          className="w-full px-6 py-4 border border-gray-300 focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37]/20 outline-none transition-colors font-lato"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-lato uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-2">
                          Preferred Date *
                        </label>
                        <input
                          type="date"
                          required
                          value={bookingForm.requestedDate}
                          onChange={(e) => setBookingForm({ ...bookingForm, requestedDate: e.target.value })}
                          className="w-full px-6 py-4 border border-gray-300 focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37]/20 outline-none transition-colors font-lato"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-lato uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-2">
                          Alternate Date
                        </label>
                        <input
                          type="date"
                          value={bookingForm.alternateDate}
                          onChange={(e) => setBookingForm({ ...bookingForm, alternateDate: e.target.value })}
                          className="w-full px-6 py-4 border border-gray-300 focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37]/20 outline-none transition-colors font-lato"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-lato uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-2">
                          Additional Notes
                        </label>
                        <textarea
                          rows={4}
                          value={bookingForm.message}
                          onChange={(e) => setBookingForm({ ...bookingForm, message: e.target.value })}
                          className="w-full px-6 py-4 border border-gray-300 focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37]/20 outline-none transition-colors font-lato resize-none"
                        />
                      </div>

                      {bookingStatus === 'error' && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 font-lato text-sm">
                          Failed to submit booking. Please try again.
                        </div>
                      )}

                      <button
                        type="submit"
                        disabled={bookingStatus === 'loading'}
                        className="w-full px-6 py-4 bg-[#1a1a1a] text-white font-lato text-sm uppercase tracking-[0.2em] hover:bg-[#d4af37] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {bookingStatus === 'loading' ? 'Submitting...' : 'Submit Booking Request'}
                      </button>
                    </form>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Simple Theme Layout (existing)
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-900 pt-20">
      <NavigationButton variant="both" />
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/10 via-white dark:via-dark-800 to-primary/5 py-16 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-4"
          >
            Photography Packages
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto"
          >
            Discover our professional photography packages tailored to capture your special moments
          </motion.p>
        </div>
      </section>

      {/* Filter Tabs */}
      <div className="bg-white dark:bg-dark-800 border-b border-gray-200 dark:border-gray-700 sticky top-16 z-30">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center space-x-2 overflow-x-auto">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setFilter(category)}
                className={`px-6 py-2 rounded-full font-medium transition whitespace-nowrap ${
                  filter === category
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 dark:bg-dark-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-dark-600'
                }`}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Packs Grid - Instagram Style */}
      <main className="max-w-7xl mx-auto px-4 py-12">
        {filteredPacks.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <div className="max-w-md mx-auto">
              <div className="text-6xl mb-4">📦</div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                No Packages Available
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-lg mb-6">
                {filter === 'all' 
                  ? "We're currently updating our packages. Check back soon!"
                  : `No packages found in the "${filter}" category.`
                }
              </p>
              {filter !== 'all' && (
                <button
                  onClick={() => setFilter('all')}
                  className="btn-primary"
                >
                  View All Packages
                </button>
              )}
            </div>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {filteredPacks.map((pack, index) => (
              <motion.div
                key={pack.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white dark:bg-dark-800 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 group touch-manipulation"
              >
                {/* Cover Image */}
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img
                    src={pack.coverImage}
                    alt={pack.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-gray-900 text-xs font-semibold rounded-full">
                      {pack.category}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">{pack.name}</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">{pack.description}</p>

                  {/* Price & Duration */}
                  <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-100 dark:border-gray-700">
                    <div className="flex items-center space-x-2 text-primary dark:text-primary-400">
                      <FiDollarSign className="w-5 h-5" />
                      <span className="text-2xl font-bold">{pack.price} TND</span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                      <FiClock className="w-4 h-4" />
                      <span className="text-sm font-medium">{pack.duration}</span>
                    </div>
                  </div>

                  {/* Features */}
                  <ul className="space-y-2 mb-6">
                    {pack.features.slice(0, 4).map((feature, idx) => (
                      <li key={idx} className="flex items-start space-x-2 text-sm text-gray-700 dark:text-gray-300">
                        <FiCheck className="w-4 h-4 text-green-500 dark:text-green-400 mt-0.5 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                    {pack.features.length > 4 && (
                      <li className="text-sm text-primary dark:text-primary-400 font-medium">
                        +{pack.features.length - 4} more features
                      </li>
                    )}
                  </ul>

                  {/* Book Now Button */}
                  <button
                    onClick={() => openBookingModal(pack)}
                    className="w-full py-4 md:py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-all font-semibold flex items-center justify-center space-x-2 group touch-manipulation text-base md:text-sm"
                  >
                    <FiCalendar className="w-5 h-5" />
                    <span>Book Now</span>
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>

      {/* Booking Modal */}
      {bookingModalOpen && selectedPack && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-dark-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-4 md:p-6 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-dark-800 z-10">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-gray-100">Book: {selectedPack.name}</h2>
              <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm md:text-base">{selectedPack.price} TND • {selectedPack.duration}</p>
            </div>

            <form onSubmit={handleSubmitBooking} className="p-4 md:p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    value={bookingForm.clientName}
                    onChange={(e) => setBookingForm({ ...bookingForm, clientName: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-dark-700 text-gray-900 dark:text-gray-100"
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={bookingForm.clientEmail}
                    onChange={(e) => setBookingForm({ ...bookingForm, clientEmail: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-dark-700 text-gray-900 dark:text-gray-100"
                    placeholder="john@example.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={bookingForm.clientPhone}
                  onChange={(e) => setBookingForm({ ...bookingForm, clientPhone: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-dark-700 text-gray-900 dark:text-gray-100"
                  placeholder="+1 (555) 123-4567"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Preferred Date *
                  </label>
                  <input
                    type="date"
                    value={bookingForm.requestedDate}
                    onChange={(e) => setBookingForm({ ...bookingForm, requestedDate: e.target.value })}
                    required
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-dark-700 text-gray-900 dark:text-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Alternate Date (optional)
                  </label>
                  <input
                    type="date"
                    value={bookingForm.alternateDate}
                    onChange={(e) => setBookingForm({ ...bookingForm, alternateDate: e.target.value })}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-dark-700 text-gray-900 dark:text-gray-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Message (optional)
                </label>
                <textarea
                  value={bookingForm.message}
                  onChange={(e) => setBookingForm({ ...bookingForm, message: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-dark-700 text-gray-900 dark:text-gray-100"
                  placeholder="Tell us about your project, special requests, or any questions..."
                />
              </div>

              {/* Status Messages */}
              {bookingStatus === 'success' && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-green-50 dark:bg-green-900/30 text-green-800 dark:text-green-200 rounded-lg border border-green-200 dark:border-green-700"
                >
                  ✓ Booking request sent successfully! We'll contact you soon.
                </motion.div>
              )}

              {bookingStatus === 'error' && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-red-50 dark:bg-red-900/30 text-red-800 dark:text-red-200 rounded-lg border border-red-200 dark:border-red-700"
                >
                  ✗ Failed to send booking request. Please try again.
                </motion.div>
              )}

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={closeBookingModal}
                  disabled={bookingStatus === 'loading'}
                  className="px-4 md:px-6 py-3 md:py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-700 transition touch-manipulation disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={bookingStatus === 'loading' || bookingStatus === 'success'}
                  className="px-4 md:px-6 py-3 md:py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition touch-manipulation disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {bookingStatus === 'loading' ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                      Sending...
                    </>
                  ) : bookingStatus === 'success' ? (
                    <>✓ Sent</>
                  ) : (
                    'Send Booking Request'
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Floating Book Now Button (Mobile) */}
      <AnimatePresence>
        {showFloatingButton && !bookingModalOpen && (
          <motion.button
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            onClick={() => {
              if (packs.length > 0) {
                setSelectedPack(packs[0]);
                setBookingModalOpen(true);
              }
            }}
            className="md:hidden fixed bottom-6 right-6 z-40 bg-primary text-white px-6 py-4 rounded-full shadow-2xl hover:bg-primary/90 transition-all flex items-center gap-2 touch-manipulation"
          >
            <FiCalendar className="w-5 h-5" />
            <span className="font-semibold">Book Now</span>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
