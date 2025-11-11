'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiCheck, FiArrowRight, FiArrowLeft, FiCalendar } from 'react-icons/fi';

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

interface BookingModalProps {
  pack: Pack | null;
  isOpen: boolean;
  onClose: () => void;
  allPacks: Pack[];
}

export default function BookingModal({ pack: initialPack, isOpen, onClose, allPacks }: BookingModalProps) {
  const [step, setStep] = useState(1);
  const [selectedPack, setSelectedPack] = useState<Pack | null>(initialPack);
  const [bookingStatus, setBookingStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  // Step 1: Event Details
  const [eventDetails, setEventDetails] = useState({
    eventName: '',
    eventType: 'other',
    eventDate: '',
  });

  // Step 3: Contact Info
  const [contactInfo, setContactInfo] = useState({
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    timeSlot: 'all-day',
    message: '',
  });

  // Track when user enters name and phone (real-time tracking)
  const [trackedContactInfo, setTrackedContactInfo] = useState(false);

  // Track page view on mount
  useState(() => {
    if (isOpen) {
      trackPageView();
    }
  });

  const trackPageView = async () => {
    try {
      await fetch('/api/bookings/tracking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          viewedPackages: [initialPack?.name || 'unknown'],
        }),
      });
    } catch (error) {
      console.error('Tracking error:', error);
    }
  };

  const handleStep1Complete = async () => {
    if (!eventDetails.eventName || !eventDetails.eventDate) {
      alert('Please fill in event name and date');
      return;
    }

    // Create tracking record with event details
    try {
      await fetch('/api/bookings/tracking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventType: eventDetails.eventType,
          eventName: eventDetails.eventName,
          eventDate: eventDetails.eventDate,
        }),
      });
    } catch (error) {
      console.error('Tracking error:', error);
    }

    setStep(2);
  };

  const handlePackSelection = async (pack: Pack) => {
    setSelectedPack(pack);

    // Update tracking record with pack selection
    try {
      await fetch('/api/bookings/tracking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventType: eventDetails.eventType,
          eventName: eventDetails.eventName,
          eventDate: eventDetails.eventDate,
          selectedPackId: pack.id,
          viewedPackages: [pack.name],
        }),
      });
    } catch (error) {
      console.error('Tracking error:', error);
    }

    setStep(3);
  };

  // Track contact info as soon as both name and phone are filled
  const handleContactInfoChange = async (field: string, value: string) => {
    const updatedInfo = { ...contactInfo, [field]: value };
    setContactInfo(updatedInfo);

    // If both name and phone are filled, track immediately
    if (updatedInfo.clientName && updatedInfo.clientPhone && !trackedContactInfo && selectedPack) {
      setTrackedContactInfo(true);
      
      try {
        await fetch('/api/bookings/tracking', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            eventType: eventDetails.eventType,
            eventName: eventDetails.eventName,
            eventDate: eventDetails.eventDate,
            selectedPackId: selectedPack.id,
            packName: selectedPack.name,
            clientName: updatedInfo.clientName,
            clientPhone: updatedInfo.clientPhone,
            clientEmail: updatedInfo.clientEmail,
            timeSlot: updatedInfo.timeSlot,
            message: updatedInfo.message,
            viewedPackages: [selectedPack.name],
          }),
        });
      } catch (error) {
        console.error('Contact tracking error:', error);
      }
    }
  };

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedPack || !contactInfo.clientName || !contactInfo.clientPhone) {
      alert('Please fill in all required fields');
      return;
    }

    setBookingStatus('loading');

    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientName: contactInfo.clientName,
          clientEmail: contactInfo.clientEmail,
          clientPhone: contactInfo.clientPhone,
          message: contactInfo.message,
          packName: selectedPack.name,
          events: [{
            eventType: eventDetails.eventType,
            eventDate: eventDetails.eventDate,
            timeSlot: contactInfo.timeSlot,
            location: eventDetails.eventName,
          }],
          // Legacy fields for backward compatibility
          eventType: eventDetails.eventType,
          requestedDate: eventDetails.eventDate,
          timeSlot: contactInfo.timeSlot,
          location: eventDetails.eventName,
        }),
      });

      if (res.ok) {
        setBookingStatus('success');
        setTimeout(() => {
          handleClose();
        }, 2500);
      } else {
        setBookingStatus('error');
      }
    } catch (error) {
      console.error('Booking error:', error);
      setBookingStatus('error');
    }
  };

  const handleClose = () => {
    setStep(1);
    setSelectedPack(initialPack);
    setEventDetails({ eventName: '', eventType: 'other', eventDate: '' });
    setContactInfo({ clientName: '', clientEmail: '', clientPhone: '', timeSlot: 'all-day', message: '' });
    setBookingStatus('idle');
    setTrackedContactInfo(false);
    onClose();
  };

  // Filter packs by event type (if not 'other')
  const filteredPacks = eventDetails.eventType === 'other' 
    ? allPacks 
    : allPacks.filter(p => p.category.toLowerCase() === eventDetails.eventType.toLowerCase());

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
        onClick={handleClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white dark:bg-gray-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
        >
          {/* Header */}
          <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 flex justify-between items-center z-10">
            <div>
              <h2 className="text-2xl md:text-3xl font-playfair font-bold text-gray-900 dark:text-gray-100">
                {bookingStatus === 'success' ? 'Booking Confirmed!' : 'Book Photography Package'}
              </h2>
              {bookingStatus !== 'success' && (
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Step {step} of 3
                </p>
              )}
            </div>
            <button
              onClick={handleClose}
              className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
            >
              <FiX className="w-6 h-6" />
            </button>
          </div>

          {/* Progress Bar */}
          {bookingStatus !== 'success' && (
            <div className="px-6 pt-4">
              <div className="flex items-center justify-between mb-6">
                {[1, 2, 3].map((s) => (
                  <div key={s} className="flex-1 flex items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-colors ${
                      s < step ? 'bg-green-500 text-white' :
                      s === step ? 'bg-primary text-white' :
                      'bg-gray-200 dark:bg-gray-700 text-gray-500'
                    }`}>
                      {s < step ? <FiCheck /> : s}
                    </div>
                    {s < 3 && (
                      <div className={`flex-1 h-1 mx-2 rounded transition-colors ${
                        s < step ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-700'
                      }`} />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Content */}
          <div className="p-6">
            {bookingStatus === 'success' ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FiCheck className="w-10 h-10 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3">
                  Booking Request Sent Successfully!
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-2">
                  We've received your booking request for <strong>{selectedPack?.name}</strong>
                </p>
                <p className="text-gray-600 dark:text-gray-400">
                  Our team will contact you shortly at <strong>{contactInfo.clientPhone}</strong> to confirm the details.
                </p>
              </div>
            ) : (
              <>
                {/* Step 1: Event Details */}
                {step === 1 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                        Tell us about your event
                      </h3>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Event Name *
                      </label>
                      <input
                        type="text"
                        value={eventDetails.eventName}
                        onChange={(e) => setEventDetails({ ...eventDetails, eventName: e.target.value })}
                        placeholder="e.g., Sarah & John's Wedding, Birthday Party, Corporate Event"
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        required
                      />
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Write your custom event name - no need to select a type
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Event Type (helps us filter packages)
                      </label>
                      <select
                        value={eventDetails.eventType}
                        onChange={(e) => setEventDetails({ ...eventDetails, eventType: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      >
                        <option value="other">All Packages (Custom Event)</option>
                        <option value="wedding">Wedding</option>
                        <option value="engagement">Engagement</option>
                        <option value="portrait">Portrait</option>
                        <option value="fashion">Fashion</option>
                        <option value="event">Event</option>
                        <option value="commercial">Commercial</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Event Date *
                      </label>
                      <input
                        type="date"
                        value={eventDetails.eventDate}
                        onChange={(e) => setEventDetails({ ...eventDetails, eventDate: e.target.value })}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        required
                      />
                    </div>

                    <button
                      onClick={handleStep1Complete}
                      type="button"
                      className="w-full py-4 bg-primary text-white rounded-lg hover:bg-primary/90 transition-all font-semibold flex items-center justify-center space-x-2"
                    >
                      <span>Continue to Package Selection</span>
                      <FiArrowRight />
                    </button>
                  </motion.div>
                )}

                {/* Step 2: Pack Selection */}
                {step === 2 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                        Choose Your Package
                      </h3>
                      <button
                        onClick={() => setStep(1)}
                        className="text-primary hover:text-primary/80 flex items-center space-x-1"
                      >
                        <FiArrowLeft />
                        <span>Back</span>
                      </button>
                    </div>

                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                      <p className="text-sm text-blue-900 dark:text-blue-100">
                        <strong>Event:</strong> {eventDetails.eventName} • <strong>Date:</strong> {new Date(eventDetails.eventDate).toLocaleDateString()}
                      </p>
                      {eventDetails.eventType !== 'other' && (
                        <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                          Showing packages for: <strong>{eventDetails.eventType}</strong>
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                      {filteredPacks.map((pack) => (
                        <button
                          key={pack.id}
                          onClick={() => handlePackSelection(pack)}
                          className={`text-left p-4 border-2 rounded-lg transition-all hover:border-primary ${
                            selectedPack?.id === pack.id
                              ? 'border-primary bg-primary/5'
                              : 'border-gray-200 dark:border-gray-700'
                          }`}
                        >
                          {pack.coverImage && (
                            <img
                              src={pack.coverImage}
                              alt={pack.name}
                              className="w-full h-32 object-cover rounded-lg mb-3"
                            />
                          )}
                          <h4 className="font-bold text-gray-900 dark:text-gray-100 mb-1">{pack.name}</h4>
                          <p className="text-primary font-bold mb-2">{pack.price} TND • {pack.duration}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{pack.description}</p>
                        </button>
                      ))}
                    </div>

                    {filteredPacks.length === 0 && (
                      <div className="text-center py-8">
                        <p className="text-gray-500 dark:text-gray-400">
                          No packages found for "{eventDetails.eventType}". Try selecting "All Packages" or a different event type.
                        </p>
                      </div>
                    )}
                  </motion.div>
                )}

                {/* Step 3: Contact Info */}
                {step === 3 && selectedPack && (
                  <motion.form
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    onSubmit={handleFinalSubmit}
                    className="space-y-6"
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                        Your Contact Information
                      </h3>
                      <button
                        type="button"
                        onClick={() => setStep(2)}
                        className="text-primary hover:text-primary/80 flex items-center space-x-1"
                      >
                        <FiArrowLeft />
                        <span>Back</span>
                      </button>
                    </div>

                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                      <p className="text-sm text-green-900 dark:text-green-100">
                        <strong>Package:</strong> {selectedPack.name} ({selectedPack.price} TND)
                      </p>
                      <p className="text-sm text-green-900 dark:text-green-100">
                        <strong>Event:</strong> {eventDetails.eventName} • {new Date(eventDetails.eventDate).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Your Name *
                        </label>
                        <input
                          type="text"
                          value={contactInfo.clientName}
                          onChange={(e) => handleContactInfoChange('clientName', e.target.value)}
                          required
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                          placeholder="John Doe"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Phone Number *
                        </label>
                        <input
                          type="tel"
                          value={contactInfo.clientPhone}
                          onChange={(e) => handleContactInfoChange('clientPhone', e.target.value)}
                          required
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                          placeholder="+216 12 345 678"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={contactInfo.clientEmail}
                        onChange={(e) => handleContactInfoChange('clientEmail', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        placeholder="john@example.com"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Preferred Time
                      </label>
                      <select
                        value={contactInfo.timeSlot}
                        onChange={(e) => handleContactInfoChange('timeSlot', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      >
                        <option value="morning">Morning (8AM - 12PM)</option>
                        <option value="afternoon">Afternoon (12PM - 5PM)</option>
                        <option value="evening">Evening (5PM - 10PM)</option>
                        <option value="all-day">All Day</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Additional Notes
                      </label>
                      <textarea
                        value={contactInfo.message}
                        onChange={(e) => handleContactInfoChange('message', e.target.value)}
                        rows={4}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 resize-none"
                        placeholder="Tell us about your vision, special requests, or any questions you have..."
                      />
                    </div>

                    {bookingStatus === 'error' && (
                      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg">
                        Failed to submit booking. Please try again or contact us directly.
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={bookingStatus === 'loading'}
                      className="w-full py-4 bg-primary text-white rounded-lg hover:bg-primary/90 transition-all font-semibold flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {bookingStatus === 'loading' ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          <span>Submitting...</span>
                        </>
                      ) : (
                        <>
                          <FiCheck />
                          <span>Confirm Booking Request</span>
                        </>
                      )}
                    </button>
                  </motion.form>
                )}
              </>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
