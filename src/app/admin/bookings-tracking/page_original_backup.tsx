'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Eye, 
  EyeOff, 
  Package, 
  Phone, 
  Mail, 
  Calendar, 
  MapPin, 
  Clock, 
  CheckCircle, 
  XCircle,
  Filter,
  Download,
  Search,
  Users,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import BookingDetailsModal from '@/components/BookingDetailsModal';

interface Booking {
  id: string;
  name: string;
  email: string;
  phone: string;
  packageName?: string;
  packagePrice?: number;
  eventType: string;
  eventDate: string;
  timeSlot: string;
  location: string;
  message?: string;
  status: string;
  viewedPackages: boolean;
  packageViewedAt?: string;
  selectedPackages: string[];
  completedForm: boolean;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
  updatedAt: string;
}

export default function BookingsTracking() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [groupedBookings, setGroupedBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'viewed' | 'completed' | 'tracking'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'grouped'>('grouped');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [expandedClients, setExpandedClients] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      // Fetch regular bookings
      const response = await fetch('/api/bookings');
      if (response.ok) {
        const data = await response.json();
        // Sort by latest (createdAt descending)
        const sortedData = data.sort((a: Booking, b: Booking) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setBookings(sortedData);
      }

      // Fetch grouped bookings
      const groupedResponse = await fetch('/api/bookings?grouped=true');
      if (groupedResponse.ok) {
        const groupedData = await groupedResponse.json();
        // Sort each group's bookings by latest
        const sortedGroupedData = groupedData.map((group: any) => ({
          ...group,
          bookings: group.bookings.sort((a: Booking, b: Booking) => 
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )
        }));
        setGroupedBookings(sortedGroupedData);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (bookingId: string, newStatus: string) => {
    // Update bookings list
    setBookings(prev => 
      prev.map(b => b.id === bookingId ? { ...b, status: newStatus } : b)
    );
    
    // Update grouped bookings
    setGroupedBookings(prev => 
      prev.map(group => ({
        ...group,
        bookings: group.bookings.map((b: Booking) => 
          b.id === bookingId ? { ...b, status: newStatus } : b
        ),
      }))
    );

    // Refresh data
    fetchBookings();
  };

  const toggleClientExpand = (clientName: string) => {
    setExpandedClients(prev => {
      const newSet = new Set(prev);
      if (newSet.has(clientName)) {
        newSet.delete(clientName);
      } else {
        newSet.add(clientName);
      }
      return newSet;
    });
  };

  const filteredBookings = bookings.filter((booking) => {
    // Apply status filter
    if (filter === 'viewed' && !booking.viewedPackages) return false;
    if (filter === 'completed' && !booking.completedForm) return false;
    if (filter === 'tracking' && booking.status !== 'tracking') return false;

    // Apply search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      return (
        booking.name.toLowerCase().includes(search) ||
        booking.phone.includes(search) ||
        booking.email.toLowerCase().includes(search) ||
        booking.packageName?.toLowerCase().includes(search)
      );
    }

    return true;
  });

  const stats = {
    total: bookings.length,
    viewedPackages: bookings.filter((b) => b.viewedPackages).length,
    completedForms: bookings.filter((b) => b.completedForm).length,
    tracking: bookings.filter((b) => b.status === 'tracking').length,
  };

  const exportToCSV = () => {
    const headers = [
      'Name',
      'Phone',
      'Email',
      'Package',
      'Price',
      'Event Type',
      'Event Date',
      'Viewed Packages',
      'Completed Form',
      'Status',
      'Created At',
    ];

    const rows = filteredBookings.map((b) => [
      b.name,
      b.phone,
      b.email,
      b.packageName || '',
      b.packagePrice || '',
      b.eventType,
      new Date(b.eventDate).toLocaleDateString(),
      b.viewedPackages ? 'Yes' : 'No',
      b.completedForm ? 'Yes' : 'No',
      b.status,
      new Date(b.createdAt).toLocaleString(),
    ]);

    const csv = [headers, ...rows].map((row) => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bookings-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Booking Tracking Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Monitor user interactions and package views
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="glass-card p-6 border-l-4 border-primary"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Interactions</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                {stats.total}
              </p>
            </div>
            <Package className="w-10 h-10 text-primary opacity-50" />
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="glass-card p-6 border-l-4 border-blue-500"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Viewed Packages</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                {stats.viewedPackages}
              </p>
            </div>
            <Eye className="w-10 h-10 text-blue-500 opacity-50" />
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="glass-card p-6 border-l-4 border-green-500"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Completed Forms</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                {stats.completedForms}
              </p>
            </div>
            <CheckCircle className="w-10 h-10 text-green-500 opacity-50" />
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="glass-card p-6 border-l-4 border-amber-500"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">In Progress</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                {stats.tracking}
              </p>
            </div>
            <Clock className="w-10 h-10 text-amber-500 opacity-50" />
          </div>
        </motion.div>
      </div>

      {/* View Mode Toggle */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setViewMode('grouped')}
          className={`px-4 py-2 rounded-lg font-medium transition flex items-center gap-2 ${
            viewMode === 'grouped'
              ? 'bg-primary text-white'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
          }`}
        >
          <Users className="w-4 h-4" />
          Grouped by Client
        </button>
        <button
          onClick={() => setViewMode('list')}
          className={`px-4 py-2 rounded-lg font-medium transition flex items-center gap-2 ${
            viewMode === 'list'
              ? 'bg-primary text-white'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
          }`}
        >
          <Package className="w-4 h-4" />
          All Bookings
        </button>
      </div>

      {/* Filters and Search */}
      <div className="glass-card p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filter === 'all'
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              All ({stats.total})
            </button>
            <button
              onClick={() => setFilter('viewed')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filter === 'viewed'
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              Viewed Packages ({stats.viewedPackages})
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filter === 'completed'
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              Completed ({stats.completedForms})
            </button>
            <button
              onClick={() => setFilter('tracking')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filter === 'tracking'
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              In Progress ({stats.tracking})
            </button>
          </div>

          <div className="flex gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10 w-full"
              />
            </div>
            <button
              onClick={exportToCSV}
              className="btn-secondary flex items-center gap-2 whitespace-nowrap"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Grouped View */}
      {viewMode === 'grouped' && (
        <div className="space-y-4">
          {groupedBookings.map((group) => (
            <motion.div
              key={group.clientName}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card overflow-hidden"
            >
              {/* Client Header */}
              <button
                onClick={() => toggleClientExpand(group.clientName)}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-dark-700/30 transition"
              >
                <div className="flex items-center gap-4">
                  {expandedClients.has(group.clientName) ? (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  )}
                  <div className="text-left">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {group.clientName}
                    </h3>
                    <div className="flex items-center gap-4 mt-1 text-sm text-gray-600 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        {group.clientPhone}
                      </span>
                      {group.clientEmail && (
                        <span className="flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {group.clientEmail}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-semibold">
                    {group.totalBookings} {group.totalBookings === 1 ? 'booking' : 'bookings'}
                  </span>
                </div>
              </button>

              {/* Expanded Bookings */}
              {expandedClients.has(group.clientName) && (
                <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-dark-700/30">
                  <div className="divide-y divide-gray-200 dark:divide-gray-700">
                    {group.bookings.map((booking: Booking) => (
                      <div
                        key={booking.id}
                        onClick={() => setSelectedBooking(booking)}
                        className="p-4 hover:bg-white dark:hover:bg-dark-700 transition cursor-pointer"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Package */}
                            <div>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Package</p>
                              {booking.packageName ? (
                                <div>
                                  <p className="font-medium text-gray-900 dark:text-white">
                                    {booking.packageName}
                                  </p>
                                  {booking.packagePrice && booking.packagePrice > 0 && (
                                    <p className="text-sm text-primary font-semibold">
                                      {booking.packagePrice} DT
                                    </p>
                                  )}
                                </div>
                              ) : (
                                <p className="text-gray-400">-</p>
                              )}
                            </div>

                            {/* Event */}
                            <div>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Event</p>
                              <p className="font-medium text-gray-900 dark:text-white">
                                {booking.eventType}
                              </p>
                              <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {new Date(booking.eventDate).toLocaleDateString()}
                              </p>
                            </div>

                            {/* Status */}
                            <div>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Status</p>
                              <span
                                className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  booking.status === 'pending'
                                    ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                                    : booking.status === 'approved'
                                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                    : booking.status === 'rejected'
                                    ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                                    : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
                                }`}
                              >
                                {booking.status}
                              </span>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                {new Date(booking.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedBooking(booking);
                            }}
                            className="px-4 py-2 text-sm font-medium text-primary hover:bg-primary/10 rounded-lg transition"
                          >
                            View Details
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          ))}

          {groupedBookings.length === 0 && (
            <div className="glass-card text-center py-12">
              <Users className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">No bookings found</p>
            </div>
          )}
        </div>
      )}

      {/* List View (Original Table) */}
      {viewMode === 'list' && (
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Client
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Package
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Event
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Tracking
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredBookings.map((booking) => (
                <motion.tr
                  key={booking.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  onClick={() => setSelectedBooking(booking)}
                  className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors cursor-pointer"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {booking.name}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {booking.phone}
                        </div>
                        {booking.completedForm && (
                          <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {booking.email}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {booking.packageName ? (
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {booking.packageName}
                        </div>
                        {booking.packagePrice && booking.packagePrice > 0 && (
                          <div className="text-sm text-primary font-semibold">
                            {booking.packagePrice} DT
                          </div>
                        )}
                        {booking.selectedPackages.length > 1 && (
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Also viewed: {booking.selectedPackages.filter(p => p !== booking.packageName).join(', ')}
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {booking.completedForm ? (
                      <div className="text-sm">
                        <div className="font-medium text-gray-900 dark:text-white">
                          {booking.eventType}
                        </div>
                        <div className="text-gray-500 dark:text-gray-400 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(booking.eventDate).toLocaleDateString()}
                        </div>
                        <div className="text-gray-500 dark:text-gray-400 flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {booking.location}
                        </div>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">Pending</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        {booking.viewedPackages ? (
                          <>
                            <Eye className="w-4 h-4 text-blue-500" />
                            <span className="text-xs text-blue-500">Viewed Packages</span>
                          </>
                        ) : (
                          <>
                            <EyeOff className="w-4 h-4 text-gray-400" />
                            <span className="text-xs text-gray-400">Not viewed</span>
                          </>
                        )}
                      </div>
                      {booking.completedForm && (
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span className="text-xs text-green-500">Form completed</span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        booking.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                          : booking.status === 'tracking'
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                          : booking.status === 'approved'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
                      }`}
                    >
                      {booking.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {new Date(booking.createdAt).toLocaleDateString()}
                    <div className="text-xs">{new Date(booking.createdAt).toLocaleTimeString()}</div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredBookings.length === 0 && (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">No bookings found</p>
          </div>
        )}
      </div>
      )}

      {/* Booking Details Modal */}
      {selectedBooking && (
        <BookingDetailsModal
          booking={selectedBooking}
          isOpen={!!selectedBooking}
          onClose={() => setSelectedBooking(null)}
          onStatusChange={handleStatusChange}
        />
      )}
    </div>
  );
}
