'use client';

import { useState, useEffect } from 'react';
import { FiCalendar, FiX, FiPlus, FiCheck, FiAlertCircle, FiClock, FiCheckCircle, FiXCircle, FiEye, FiEdit2, FiTrash2, FiUser, FiMapPin, FiDollarSign } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

interface BlockedDate {
  id: string;
  date: string;
  reason?: string;
  createdAt: string;
}

interface CalendarEvent {
  id: string;
  date: string;
  title: string;
  clientName?: string;
  eventType: 'wedding' | 'portrait' | 'event' | 'travel' | 'other';
  startTime?: string;
  endTime?: string;
  location?: string;
  price?: number;
  deposit?: number;
  notes?: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
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

const EVENT_TYPES = [
  { value: 'wedding', label: '💒 Wedding', color: 'bg-pink-500' },
  { value: 'portrait', label: '📸 Portrait', color: 'bg-blue-500' },
  { value: 'event', label: '🎉 Event', color: 'bg-purple-500' },
  { value: 'travel', label: '✈️ Travel', color: 'bg-green-500' },
  { value: 'other', label: '📝 Other', color: 'bg-gray-500' },
];

const STATUSES = [
  { value: 'pending', label: 'Pending', color: 'bg-yellow-500' },
  { value: 'confirmed', label: 'Confirmed', color: 'bg-green-500' },
  { value: 'completed', label: 'Completed', color: 'bg-blue-500' },
  { value: 'cancelled', label: 'Cancelled', color: 'bg-red-500' },
];

export default function AdminCalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [blockReason, setBlockReason] = useState('');
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [showBookingsModal, setShowBookingsModal] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [selectedDateBookings, setSelectedDateBookings] = useState<Booking[]>([]);
  const [selectedDateEvents, setSelectedDateEvents] = useState<CalendarEvent[]>([]);
  const [saving, setSaving] = useState(false);

  // Event form state
  const [eventForm, setEventForm] = useState({
    title: '',
    clientName: '',
    eventType: 'other' as const,
    startTime: '',
    endTime: '',
    location: '',
    price: '',
    deposit: '',
    notes: '',
    status: 'pending' as const,
  });

  useEffect(() => {
    fetchBlockedDates();
    fetchBookings();
    fetchCalendarEvents();
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

  const fetchCalendarEvents = async () => {
    try {
      const res = await fetch('/api/admin/calendar/events');
      if (res.ok) {
        const data = await res.json();
        setCalendarEvents(data);
      }
    } catch (error) {
      console.error('Error fetching calendar events:', error);
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

  // Event CRUD operations
  const openEventModal = (date: Date, event?: CalendarEvent) => {
    setSelectedDate(date);
    setEditingEvent(event || null);
    
    if (event) {
      setEventForm({
        title: event.title,
        clientName: event.clientName || '',
        eventType: event.eventType as any,
        startTime: event.startTime || '',
        endTime: event.endTime || '',
        location: event.location || '',
        price: event.price?.toString() || '',
        deposit: event.deposit?.toString() || '',
        notes: event.notes || '',
        status: event.status as any,
      });
    } else {
      setEventForm({
        title: '',
        clientName: '',
        eventType: 'other',
        startTime: '',
        endTime: '',
        location: '',
        price: '',
        deposit: '',
        notes: '',
        status: 'pending',
      });
    }
    
    setShowEventModal(true);
  };

  const saveEvent = async () => {
    if (!selectedDate || !eventForm.title.trim()) {
      alert('Please enter an event title');
      return;
    }

    try {
      setSaving(true);
      const eventData = {
        date: selectedDate.toISOString(),
        title: eventForm.title,
        clientName: eventForm.clientName || null,
        eventType: eventForm.eventType,
        startTime: eventForm.startTime || null,
        endTime: eventForm.endTime || null,
        location: eventForm.location || null,
        price: eventForm.price ? parseFloat(eventForm.price) : null,
        deposit: eventForm.deposit ? parseFloat(eventForm.deposit) : null,
        notes: eventForm.notes || null,
        status: eventForm.status,
      };

      const res = await fetch('/api/admin/calendar/events', {
        method: editingEvent ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingEvent ? { id: editingEvent.id, ...eventData } : eventData),
      });

      if (res.ok) {
        await fetchCalendarEvents();
        setShowEventModal(false);
        setEditingEvent(null);
      } else {
        const error = await res.json();
        alert(error.error || 'Failed to save event');
      }
    } catch (error) {
      console.error('Error saving event:', error);
      alert('Failed to save event');
    } finally {
      setSaving(false);
    }
  };

  const deleteEvent = async (id: string) => {
    if (!confirm('Are you sure you want to delete this event?')) return;

    try {
      const res = await fetch('/api/admin/calendar/events', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });

      if (res.ok) {
        await fetchCalendarEvents();
        setShowEventModal(false);
      }
    } catch (error) {
      console.error('Error deleting event:', error);
      alert('Failed to delete event');
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

  const getEventsForDate = (date: Date) => {
    return calendarEvents.filter(event => {
      const eventDate = new Date(event.date);
      return (
        eventDate.getDate() === date.getDate() &&
        eventDate.getMonth() === date.getMonth() &&
        eventDate.getFullYear() === date.getFullYear()
      );
    });
  };

  const hasBookingsOnDate = (date: Date) => {
    return getBookingsForDate(date).length > 0;
  };

  const hasEventsOnDate = (date: Date) => {
    return getEventsForDate(date).length > 0;
  };

  const handleDateClick = (day: number) => {
    const date = new Date(currentYear, currentMonth, day);
    const blocked = getBlockedDateInfo(date);
    const dateBookings = getBookingsForDate(date);
    const dateEvents = getEventsForDate(date);

    // Open event modal to show all events/bookings or create new
    setSelectedDate(date);
    setSelectedDateBookings(dateBookings);
    setSelectedDateEvents(dateEvents);
    
    // If there are events or bookings, show them
    if (dateEvents.length > 0 || dateBookings.length > 0) {
      setShowBookingsModal(true);
    } else if (!isPastDate(date)) {
      // Allow creating a new event
      openEventModal(date);
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
      const hasEvents = hasEventsOnDate(date);
      const eventsForDate = getEventsForDate(date);
      const bookingsCount = getBookingsForDate(date).length;
      const eventsCount = eventsForDate.length;
      const totalItems = bookingsCount + eventsCount;
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
              : hasBookings || hasEvents
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 cursor-pointer'
              : blocked
              ? 'border-red-500 bg-red-50 dark:bg-red-900/20 cursor-pointer'
              : past
              ? 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
              : 'border-gray-300 dark:border-gray-600 hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 cursor-pointer'
          }`}
        >
          <div className="flex flex-col items-center justify-center h-full">
            <span className={`text-sm md:text-base font-medium ${
              hasBookings || hasEvents ? 'text-blue-600 dark:text-blue-400' : blocked ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-gray-100'
            }`}>
              {day}
            </span>
            {(hasBookings || hasEvents) && (
              <div className="flex items-center gap-1 mt-1">
                <FiCalendar className="w-3 h-3 md:w-4 md:h-4 text-blue-600 dark:text-blue-400" />
                <span className="text-xs text-blue-600 dark:text-blue-400">{totalItems}</span>
              </div>
            )}
            {blocked && !hasBookings && !hasEvents && (
              <FiX className="w-3 h-3 md:w-4 md:h-4 text-red-600 dark:text-red-400 mt-1" />
            )}
            {!past && !blocked && !hasBookings && !hasEvents && (
              <FiPlus className="w-3 h-3 md:w-4 md:h-4 text-primary-500 mt-1 opacity-0 group-hover:opacity-100 transition-opacity" />
            )}
            
            {/* Event type indicators */}
            {hasEvents && eventsForDate.length > 0 && (
              <div className="flex gap-0.5 mt-1">
                {eventsForDate.slice(0, 3).map(event => {
                  const eventType = EVENT_TYPES.find(t => t.value === event.eventType);
                  return (
                    <div 
                      key={event.id} 
                      className={`w-1.5 h-1.5 rounded-full ${eventType?.color || 'bg-gray-500'}`}
                    />
                  );
                })}
              </div>
            )}
          </div>
          
          {/* Tooltip */}
          {(blockedInfo?.reason || hasBookings || hasEvents) && (
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
              {hasBookings && `${bookingsCount} booking(s) `}
              {hasEvents && `${eventsCount} event(s)`}
              {blockedInfo?.reason}
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

      {/* Events & Bookings Modal */}
      <AnimatePresence>
        {showBookingsModal && selectedDate && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-dark-800 rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="sticky top-0 bg-white dark:bg-dark-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between z-10">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                    {selectedDate.toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {selectedDateEvents.length} event(s) • {selectedDateBookings.length} booking(s)
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      setShowBookingsModal(false);
                      openEventModal(selectedDate);
                    }}
                    className="px-3 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition flex items-center space-x-2"
                  >
                    <FiPlus className="w-4 h-4" />
                    <span>Add Event</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowBookingsModal(false);
                      setSelectedDate(null);
                      setSelectedDateBookings([]);
                      setSelectedDateEvents([]);
                    }}
                    className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                  >
                    <FiX className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Calendar Events */}
                {selectedDateEvents.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center space-x-2">
                      <FiCalendar className="w-5 h-5" />
                      <span>Your Events</span>
                    </h3>
                    <div className="space-y-3">
                      {selectedDateEvents.map((event) => {
                        const eventType = EVENT_TYPES.find(t => t.value === event.eventType);
                        const status = STATUSES.find(s => s.value === event.status);
                        return (
                          <div
                            key={event.id}
                            className="bg-gray-50 dark:bg-dark-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600"
                          >
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-2">
                                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 text-lg">
                                    {event.title}
                                  </h4>
                                  <span className={`px-2 py-0.5 rounded-full text-xs text-white ${eventType?.color}`}>
                                    {eventType?.label}
                                  </span>
                                  <span className={`px-2 py-0.5 rounded-full text-xs text-white ${status?.color}`}>
                                    {status?.label}
                                  </span>
                                </div>
                                {event.clientName && (
                                  <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center space-x-1">
                                    <FiUser className="w-3 h-3" />
                                    <span>{event.clientName}</span>
                                  </p>
                                )}
                              </div>
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => {
                                    setShowBookingsModal(false);
                                    openEventModal(selectedDate, event);
                                  }}
                                  className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition"
                                >
                                  <FiEdit2 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => deleteEvent(event.id)}
                                  className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
                                >
                                  <FiTrash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3 text-sm">
                              {event.startTime && (
                                <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                                  <FiClock className="w-4 h-4" />
                                  <span>{event.startTime}{event.endTime && ` - ${event.endTime}`}</span>
                                </div>
                              )}
                              {event.location && (
                                <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                                  <FiMapPin className="w-4 h-4" />
                                  <span>{event.location}</span>
                                </div>
                              )}
                              {event.price && (
                                <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                                  <FiDollarSign className="w-4 h-4" />
                                  <span>${event.price}{event.deposit && ` (${event.deposit} paid)`}</span>
                                </div>
                              )}
                            </div>

                            {event.notes && (
                              <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                                <p className="text-sm text-gray-700 dark:text-gray-300">{event.notes}</p>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Confirmed Bookings */}
                {selectedDateBookings.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center space-x-2">
                      <FiCheckCircle className="w-5 h-5" />
                      <span>Confirmed Bookings</span>
                    </h3>
                    <div className="space-y-3">{selectedDateBookings.map((booking, index) => (
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
                  </div>
                )}

                {/* Empty state */}
                {selectedDateEvents.length === 0 && selectedDateBookings.length === 0 && (
                  <div className="text-center py-8">
                    <FiCalendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600 dark:text-gray-400 mb-4">No events or bookings on this date</p>
                    <button
                      onClick={() => {
                        setShowBookingsModal(false);
                        openEventModal(selectedDate);
                      }}
                      className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition"
                    >
                      Create First Event
                    </button>
                  </div>
                )}
              </div>

              <div className="sticky bottom-0 bg-white dark:bg-dark-800 border-t border-gray-200 dark:border-gray-700 px-6 py-4">
                <button
                  onClick={() => {
                    setShowBookingsModal(false);
                    setSelectedDate(null);
                    setSelectedDateBookings([]);
                    setSelectedDateEvents([]);
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

      {/* Event Creation/Edit Modal */}
      <AnimatePresence>
        {showEventModal && selectedDate && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-dark-800 rounded-xl max-w-2xl w-full my-8"
            >
              <div className="sticky top-0 bg-white dark:bg-dark-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between rounded-t-xl z-10">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                    {editingEvent ? 'Edit Event' : 'Create Event'}
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowEventModal(false);
                    setEditingEvent(null);
                  }}
                  className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  <FiX className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Event Title *
                  </label>
                  <input
                    type="text"
                    value={eventForm.title}
                    onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-dark-700 text-gray-900 dark:text-gray-100"
                    placeholder="e.g., Wedding Photography Session"
                  />
                </div>

                {/* Client Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <FiUser className="inline w-4 h-4 mr-1" />
                    Client Name
                  </label>
                  <input
                    type="text"
                    value={eventForm.clientName}
                    onChange={(e) => setEventForm({ ...eventForm, clientName: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-dark-700 text-gray-900 dark:text-gray-100"
                    placeholder="Client's name"
                  />
                </div>

                {/* Event Type & Status */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Event Type
                    </label>
                    <select
                      value={eventForm.eventType}
                      onChange={(e) => setEventForm({ ...eventForm, eventType: e.target.value as any })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-dark-700 text-gray-900 dark:text-gray-100"
                    >
                      {EVENT_TYPES.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Status
                    </label>
                    <select
                      value={eventForm.status}
                      onChange={(e) => setEventForm({ ...eventForm, status: e.target.value as any })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-dark-700 text-gray-900 dark:text-gray-100"
                    >
                      {STATUSES.map((status) => (
                        <option key={status.value} value={status.value}>
                          {status.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Time */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <FiClock className="inline w-4 h-4 mr-1" />
                      Start Time
                    </label>
                    <input
                      type="time"
                      value={eventForm.startTime}
                      onChange={(e) => setEventForm({ ...eventForm, startTime: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-dark-700 text-gray-900 dark:text-gray-100"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      End Time
                    </label>
                    <input
                      type="time"
                      value={eventForm.endTime}
                      onChange={(e) => setEventForm({ ...eventForm, endTime: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-dark-700 text-gray-900 dark:text-gray-100"
                    />
                  </div>
                </div>

                {/* Location */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <FiMapPin className="inline w-4 h-4 mr-1" />
                    Location
                  </label>
                  <input
                    type="text"
                    value={eventForm.location}
                    onChange={(e) => setEventForm({ ...eventForm, location: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-dark-700 text-gray-900 dark:text-gray-100"
                    placeholder="Venue or address"
                  />
                </div>

                {/* Price & Deposit */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <FiDollarSign className="inline w-4 h-4 mr-1" />
                      Price
                    </label>
                    <input
                      type="number"
                      value={eventForm.price}
                      onChange={(e) => setEventForm({ ...eventForm, price: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-dark-700 text-gray-900 dark:text-gray-100"
                      placeholder="0.00"
                      step="0.01"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Deposit Paid
                    </label>
                    <input
                      type="number"
                      value={eventForm.deposit}
                      onChange={(e) => setEventForm({ ...eventForm, deposit: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-dark-700 text-gray-900 dark:text-gray-100"
                      placeholder="0.00"
                      step="0.01"
                    />
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Notes
                  </label>
                  <textarea
                    value={eventForm.notes}
                    onChange={(e) => setEventForm({ ...eventForm, notes: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-dark-700 text-gray-900 dark:text-gray-100"
                    placeholder="Additional notes or requirements..."
                  />
                </div>
              </div>

              <div className="sticky bottom-0 bg-white dark:bg-dark-800 border-t border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between rounded-b-xl">
                {editingEvent && (
                  <button
                    onClick={() => {
                      deleteEvent(editingEvent.id);
                    }}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition flex items-center space-x-2"
                  >
                    <FiTrash2 className="w-4 h-4" />
                    <span>Delete</span>
                  </button>
                )}
                <div className={`flex items-center space-x-3 ${editingEvent ? '' : 'ml-auto'}`}>
                  <button
                    onClick={() => {
                      setShowEventModal(false);
                      setEditingEvent(null);
                    }}
                    className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-700 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={saveEvent}
                    disabled={saving}
                    className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition disabled:opacity-50 flex items-center space-x-2"
                  >
                    {saving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <FiCheck className="w-4 h-4" />
                        <span>{editingEvent ? 'Update' : 'Create'} Event</span>
                      </>
                    )}
                  </button>
                </div>
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
