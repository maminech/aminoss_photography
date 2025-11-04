'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCheck, FiClock, FiDollarSign, FiCalendar } from 'react-icons/fi';

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
  const [packs, setPacks] = useState<Pack[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPack, setSelectedPack] = useState<Pack | null>(null);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [filter, setFilter] = useState('all');
  const [showFloatingButton, setShowFloatingButton] = useState(false);

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
        alert('🎉 Booking request sent successfully! We\'ll contact you soon.');
        closeBookingModal();
      } else {
        alert('❌ Failed to send booking request. Please try again.');
      }
    } catch (error) {
      alert('❌ An error occurred. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/10 via-white to-primary/5 py-16 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold text-gray-900 mb-4"
          >
            Photography Packages
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-gray-600 max-w-2xl mx-auto"
          >
            Discover our professional photography packages tailored to capture your special moments
          </motion.p>
        </div>
      </section>

      {/* Filter Tabs */}
      <div className="bg-white border-b border-gray-200 sticky top-16 z-30">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center space-x-2 overflow-x-auto">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setFilter(category)}
                className={`px-6 py-2 rounded-full font-medium transition whitespace-nowrap ${
                  filter === category
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
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
          <div className="text-center py-20">
            <p className="text-gray-600 text-lg">No packages available at the moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {filteredPacks.map((pack, index) => (
              <motion.div
                key={pack.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 group touch-manipulation"
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
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{pack.name}</h3>
                  <p className="text-gray-600 mb-4 line-clamp-2">{pack.description}</p>

                  {/* Price & Duration */}
                  <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-100">
                    <div className="flex items-center space-x-2 text-primary">
                      <FiDollarSign className="w-5 h-5" />
                      <span className="text-2xl font-bold">{pack.price} TND</span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-600">
                      <FiClock className="w-4 h-4" />
                      <span className="text-sm font-medium">{pack.duration}</span>
                    </div>
                  </div>

                  {/* Features */}
                  <ul className="space-y-2 mb-6">
                    {pack.features.slice(0, 4).map((feature, idx) => (
                      <li key={idx} className="flex items-start space-x-2 text-sm text-gray-700">
                        <FiCheck className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                    {pack.features.length > 4 && (
                      <li className="text-sm text-primary font-medium">
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
            className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-4 md:p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900">Book: {selectedPack.name}</h2>
              <p className="text-gray-600 mt-1 text-sm md:text-base">{selectedPack.price} TND • {selectedPack.duration}</p>
            </div>

            <form onSubmit={handleSubmitBooking} className="p-4 md:p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    value={bookingForm.clientName}
                    onChange={(e) => setBookingForm({ ...bookingForm, clientName: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={bookingForm.clientEmail}
                    onChange={(e) => setBookingForm({ ...bookingForm, clientEmail: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="john@example.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={bookingForm.clientPhone}
                  onChange={(e) => setBookingForm({ ...bookingForm, clientPhone: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="+1 (555) 123-4567"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Preferred Date *
                  </label>
                  <input
                    type="date"
                    value={bookingForm.requestedDate}
                    onChange={(e) => setBookingForm({ ...bookingForm, requestedDate: e.target.value })}
                    required
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Alternate Date (optional)
                  </label>
                  <input
                    type="date"
                    value={bookingForm.alternateDate}
                    onChange={(e) => setBookingForm({ ...bookingForm, alternateDate: e.target.value })}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message (optional)
                </label>
                <textarea
                  value={bookingForm.message}
                  onChange={(e) => setBookingForm({ ...bookingForm, message: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Tell us about your project, special requests, or any questions..."
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={closeBookingModal}
                  className="px-4 md:px-6 py-3 md:py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition touch-manipulation"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 md:px-6 py-3 md:py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition touch-manipulation"
                >
                  Send Booking Request
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
