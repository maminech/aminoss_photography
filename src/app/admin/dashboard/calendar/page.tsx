'use client';

import { useState, useEffect } from 'react';
import { FiCalendar, FiX, FiPlus, FiCheck, FiAlertCircle, FiClock, FiCheckCircle, FiXCircle, FiEye } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

interface BlockedDate {
  id: string;
  date: string;
  reason?: string;
  createdAt: string;
}

interface Booking {
  id: string;
  clientName: string;
  clientEmail: string;
  clientPhone?: string;
  packName: string;
  requestedDate: string;
  status: string;
  message?: string;
  createdAt: string;
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function AdminCalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [blockReason, setBlockReason] = useState('');
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [showBookingsModal, setShowBookingsModal] = useState(false);
  const [selectedDateBookings, setSelectedDateBookings] = useState<Booking[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchBlockedDates();
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const res = await fetch('/api/admin/bookings');
      if (res.ok) {
        const data = await res.json();
        // API returns { bookings, blockedDates }
        const bookingsArray = data.bookings || data;
        setBookings(Array.isArray(bookingsArray) ? bookingsArray.filter((b: Booking) => b.status === 'confirmed') : []);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
    }
  };

  const fetchBlockedDates = async () => {
    try {
      const res = await fetch('/api/admin/calendar');
      if (res.ok) {
        const data = await res.json();
        setBlockedDates(data);
      }
    } catch (error) {
      console.error('Error fetching blocked dates:', error);
    } finally {
      setLoading(false);
    }
  };

  const blockDate = async () => {
    if (!selectedDate) return;

    try {
      setSaving(true);
      const res = await fetch('/api/admin/calendar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: selectedDate.toISOString(),
          reason: blockReason || null,
        }),
      });

      if (res.ok) {
        await fetchBlockedDates();
        setShowBlockModal(false);
        setSelectedDate(null);
        setBlockReason('');
      } else {
        const error = await res.json();
        alert(error.error || 'Failed to block date');
      }
    } catch (error) {
      console.error('Error blocking date:', error);
      alert('Failed to block date');
    } finally {
      setSaving(false);
    }
  };

  const unblockDate = async (id: string) => {
    if (!confirm('Are you sure you want to unblock this date?')) return;

    try {
      const res = await fetch(`/api/admin/calendar?id=${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        await fetchBlockedDates();
      }
    } catch (error) {
      console.error('Error unblocking date:', error);
    }
  };

  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month: number, year: number) => {
    return new Date(year, month, 1).getDay();
  };

  const isDateBlocked = (date: Date) => {
    return blockedDates.some(blocked => {
      const blockedDate = new Date(blocked.date);
      return (
        blockedDate.getDate() === date.getDate() &&
        blockedDate.getMonth() === date.getMonth() &&
        blockedDate.getFullYear() === date.getFullYear()
      );
    });
  };

  const getBlockedDateInfo = (date: Date) => {
    return blockedDates.find(blocked => {
      const blockedDate = new Date(blocked.date);
      return (
        blockedDate.getDate() === date.getDate() &&
        blockedDate.getMonth() === date.getMonth() &&
        blockedDate.getFullYear() === date.getFullYear()
      );
    });
  };

  const isPastDate = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const getBookingsForDate = (date: Date) => {
    return bookings.filter(booking => {
      const bookingDate = new Date(booking.requestedDate);
      return (
        bookingDate.getDate() === date.getDate() &&
        bookingDate.getMonth() === date.getMonth() &&
        bookingDate.getFullYear() === date.getFullYear()
      );
    });
  };

  const hasBookingsOnDate = (date: Date) => {
    return getBookingsForDate(date).length > 0;
  };

  const handleDateClick = (day: number) => {
    const date = new Date(currentYear, currentMonth, day);
    const blocked = getBlockedDateInfo(date);
    const dateBookings = getBookingsForDate(date);

    if (dateBookings.length > 0) {
      // Show bookings for this date
      setSelectedDateBookings(dateBookings);
      setSelectedDate(date);
      setShowBookingsModal(true);
    } else if (blocked) {
      // Unblock if already blocked
      unblockDate(blocked.id);
    } else if (!isPastDate(date)) {
      // Block if not blocked and not past
      setSelectedDate(date);
      setShowBlockModal(true);
    }
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      if (currentMonth === 0) {
        setCurrentMonth(11);
        setCurrentYear(currentYear - 1);
      } else {
        setCurrentMonth(currentMonth - 1);
      }
    } else {
      if (currentMonth === 11) {
        setCurrentMonth(0);
        setCurrentYear(currentYear + 1);
      } else {
        setCurrentMonth(currentMonth + 1);
      }
    }
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentMonth, currentYear);
    const firstDay = getFirstDayOfMonth(currentMonth, currentYear);
    const days = [];

    // Empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      days.push(
        <div key={`empty-${i}`} className="aspect-square p-2" />
      );
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentYear, currentMonth, day);
      const blocked = isDateBlocked(date);
      const blockedInfo = getBlockedDateInfo(date);
      const hasBookings = hasBookingsOnDate(date);
      const bookingsCount = getBookingsForDate(date).length;
      const past = isPastDate(date);
      const today = new Date().toDateString() === date.toDateString();

      days.push(
        <motion.button
          key={day}
          whileHover={!past ? { scale: 1.05 } : {}}
          whileTap={!past ? { scale: 0.95 } : {}}
          onClick={() => handleDateClick(day)}
          disabled={past}
          className={`aspect-square p-2 rounded-lg border-2 transition-all relative group ${
            today
              ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
              : hasBookings
              ? 'border-green-500 bg-green-50 dark:bg-green-900/20 cursor-pointer'
              : blocked
              ? 'border-red-500 bg-red-50 dark:bg-red-900/20 cursor-pointer'
              : past
              ? 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
              : 'border-gray-300 dark:border-gray-600 hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 cursor-pointer'
          }`}
        >
          <div className="flex flex-col items-center justify-center h-full">
            <span className={`text-sm md:text-base font-medium ${
              hasBookings ? 'text-green-600 dark:text-green-400' : blocked ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-gray-100'
            }`}>
              {day}
            </span>
            {hasBookings && (
              <div className="flex items-center gap-1 mt-1">
                <FiCheckCircle className="w-3 h-3 md:w-4 md:h-4 text-green-600 dark:text-green-400" />
                <span className="text-xs text-green-600 dark:text-green-400">{bookingsCount}</span>
              </div>
            )}
            {blocked && !hasBookings && (
              <FiX className="w-3 h-3 md:w-4 md:h-4 text-red-600 dark:text-red-400 mt-1" />
            )}
            {!past && !blocked && !hasBookings && (
              <FiPlus className="w-3 h-3 md:w-4 md:h-4 text-primary-500 mt-1 opacity-0 group-hover:opacity-100 transition-opacity" />
            )}
          </div>
          
          {/* Tooltip */}
          {(blockedInfo?.reason || hasBookings) && (
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
              {hasBookings ? `${bookingsCount} booking(s)` : blockedInfo?.reason}
            </div>
          )}
        </motion.button>
      );
    }

    return days;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-900">
      {/* Header */}
      <header className="bg-white dark:bg-dark-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-30">
        <div className="px-6 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Calendar & Bookings</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Manage availability and view confirmed bookings
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/admin/dashboard/calendar/requests"
                className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
              >
                <FiClock className="w-4 h-4" />
                <span>Booking Requests</span>
              </Link>
              <div className="flex items-center space-x-2 text-sm">
                <div className="flex items-center space-x-1">
                  <div className="w-4 h-4 border-2 border-green-500 bg-green-50 dark:bg-green-900/20 rounded"></div>
                  <span className="text-gray-700 dark:text-gray-300">Booked</span>
                </div>
                <div className="flex items-center space-x-1 ml-4">
                  <div className="w-4 h-4 border-2 border-red-500 bg-red-50 dark:bg-red-900/20 rounded"></div>
                  <span className="text-gray-700 dark:text-gray-300">Blocked</span>
                </div>
                <div className="flex items-center space-x-1 ml-4">
                  <div className="w-4 h-4 border-2 border-primary-500 bg-primary-50 dark:bg-primary-900/20 rounded"></div>
                  <span className="text-gray-700 dark:text-gray-300">Today</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6 max-w-7xl mx-auto">
        {/* Calendar Navigation */}
        <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => navigateMonth('prev')}
              className="px-4 py-2 bg-gray-100 dark:bg-dark-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-dark-600 transition"
            >
              ← Previous
            </button>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {MONTHS[currentMonth]} {currentYear}
            </h2>
            <button
              onClick={() => navigateMonth('next')}
              className="px-4 py-2 bg-gray-100 dark:bg-dark-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-dark-600 transition"
            >
              Next →
            </button>
          </div>

          {/* Days of Week */}
          <div className="grid grid-cols-7 gap-2 mb-2">
            {DAYS.map(day => (
              <div key={day} className="text-center font-semibold text-gray-700 dark:text-gray-300 text-sm md:text-base py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
          ) : (
            <div className="grid grid-cols-7 gap-2">
              {renderCalendar()}
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
          <div className="flex items-start space-x-3">
            <FiAlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                How to use the calendar:
              </h3>
              <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                <li>• <strong>Green dates</strong> show confirmed bookings (click to view details)</li>
                <li>• <strong>Red dates</strong> are blocked (click to unblock)</li>
                <li>• Click any available date to block it manually</li>
                <li>• Manage booking requests from the "Booking Requests" button above</li>
                <li>• A date can have multiple bookings if you approve them</li>
              </ul>
            </div>
          </div>
        </div>
      </main>

      {/* Bookings Modal */}
      <AnimatePresence>
        {showBookingsModal && selectedDate && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-dark-800 rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto"
            >
              <div className="sticky top-0 bg-white dark:bg-dark-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                    Bookings for {selectedDate.toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {selectedDateBookings.length} confirmed booking(s)
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowBookingsModal(false);
                    setSelectedDate(null);
                    setSelectedDateBookings([]);
                  }}
                  className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  <FiX className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                {selectedDateBookings.map((booking, index) => (
                  <div
                    key={booking.id}
                    className="bg-gray-50 dark:bg-dark-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-lg">
                          Booking #{index + 1}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Confirmed on {new Date(booking.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-xs font-medium">
                        Confirmed
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600 dark:text-gray-400">Client Name</p>
                        <p className="font-medium text-gray-900 dark:text-gray-100">{booking.clientName}</p>
                      </div>
                      <div>
                        <p className="text-gray-600 dark:text-gray-400">Package</p>
                        <p className="font-medium text-gray-900 dark:text-gray-100">{booking.packName}</p>
                      </div>
                      <div>
                        <p className="text-gray-600 dark:text-gray-400">Email</p>
                        <p className="font-medium text-gray-900 dark:text-gray-100">{booking.clientEmail}</p>
                      </div>
                      {booking.clientPhone && (
                        <div>
                          <p className="text-gray-600 dark:text-gray-400">Phone</p>
                          <p className="font-medium text-gray-900 dark:text-gray-100">{booking.clientPhone}</p>
                        </div>
                      )}
                    </div>

                    {booking.message && (
                      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                        <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">Message</p>
                        <p className="text-gray-900 dark:text-gray-100 text-sm">{booking.message}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="sticky bottom-0 bg-white dark:bg-dark-800 border-t border-gray-200 dark:border-gray-700 px-6 py-4">
                <button
                  onClick={() => {
                    setShowBookingsModal(false);
                    setSelectedDate(null);
                    setSelectedDateBookings([]);
                  }}
                  className="w-full px-4 py-2 bg-gray-200 dark:bg-dark-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-dark-600 transition"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Block Date Modal */}
      <AnimatePresence>
        {showBlockModal && selectedDate && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-dark-800 rounded-xl max-w-md w-full p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  Block Date
                </h2>
                <button
                  onClick={() => {
                    setShowBlockModal(false);
                    setSelectedDate(null);
                    setBlockReason('');
                  }}
                  className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  <FiX className="w-6 h-6" />
                </button>
              </div>

              <div className="mb-6">
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  Blocking: <strong>{selectedDate.toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}</strong>
                </p>

                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Reason (optional)
                </label>
                <input
                  type="text"
                  value={blockReason}
                  onChange={(e) => setBlockReason(e.target.value)}
                  placeholder="e.g., Already booked, Personal day"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-dark-700 text-gray-900 dark:text-gray-100"
                />
              </div>

              <div className="flex items-center justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowBlockModal(false);
                    setSelectedDate(null);
                    setBlockReason('');
                  }}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-700 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={blockDate}
                  disabled={saving}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition disabled:opacity-50 flex items-center space-x-2"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Blocking...</span>
                    </>
                  ) : (
                    <>
                      <FiCheck className="w-4 h-4" />
                      <span>Block Date</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
