'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FiArrowLeft, FiCheck, FiX, FiClock, FiUser, FiMail, FiPhone, FiCalendar, FiPackage, FiMessageSquare } from 'react-icons/fi';
import { motion } from 'framer-motion';

interface Booking {
  id: string;
  clientName: string;
  clientEmail: string;
  clientPhone?: string;
  packName: string;
  requestedDate: string;
  alternateDate?: string;
  status: string;
  message?: string;
  adminNotes?: string;
  createdAt: string;
}

export default function BookingRequestsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'pending' | 'all'>('pending');
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const res = await fetch('/api/admin/bookings');
      if (res.ok) {
        const data = await res.json();
        setBookings(data);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      setProcessing(id);
      const res = await fetch('/api/admin/bookings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: 'confirmed' }),
      });

      if (res.ok) {
        await fetchBookings();
      } else {
        alert('Failed to approve booking');
      }
    } catch (error) {
      console.error('Error approving booking:', error);
      alert('Failed to approve booking');
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (id: string) => {
    const reason = prompt('Reason for rejection (optional):');
    
    try {
      setProcessing(id);
      const res = await fetch('/api/admin/bookings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          id, 
          status: 'rejected',
          adminNotes: reason || 'Rejected by admin'
        }),
      });

      if (res.ok) {
        await fetchBookings();
      } else {
        alert('Failed to reject booking');
      }
    } catch (error) {
      console.error('Error rejecting booking:', error);
      alert('Failed to reject booking');
    } finally {
      setProcessing(null);
    }
  };

  const filteredBookings = filter === 'pending' 
    ? bookings.filter(b => b.status === 'pending')
    : bookings;

  const pendingCount = bookings.filter(b => b.status === 'pending').length;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-900">
      {/* Header */}
      <header className="bg-white dark:bg-dark-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-30">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                href="/admin/dashboard/calendar"
                className="p-2 hover:bg-gray-100 dark:hover:bg-dark-700 rounded-lg transition"
              >
                <FiArrowLeft className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Booking Requests</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Review and manage booking requests
                </p>
              </div>
            </div>

            {pendingCount > 0 && (
              <div className="flex items-center space-x-2 px-4 py-2 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 rounded-lg">
                <FiClock className="w-4 h-4" />
                <span className="text-sm font-medium">{pendingCount} Pending</span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6 max-w-7xl mx-auto">
        {/* Filter Tabs */}
        <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-2 mb-6 flex space-x-2">
          <button
            onClick={() => setFilter('pending')}
            className={`flex-1 px-4 py-2 rounded-lg font-medium transition ${
              filter === 'pending'
                ? 'bg-primary-600 text-white'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-700'
            }`}
          >
            Pending ({pendingCount})
          </button>
          <button
            onClick={() => setFilter('all')}
            className={`flex-1 px-4 py-2 rounded-lg font-medium transition ${
              filter === 'all'
                ? 'bg-primary-600 text-white'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-700'
            }`}
          >
            All Requests ({bookings.length})
          </button>
        </div>

        {/* Bookings List */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
            <FiClock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              {filter === 'pending' ? 'No Pending Requests' : 'No Booking Requests'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {filter === 'pending' 
                ? 'All booking requests have been processed.'
                : 'No booking requests have been submitted yet.'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredBookings.map((booking) => (
              <motion.div
                key={booking.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                        {booking.clientName}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Requested on {new Date(booking.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      booking.status === 'pending'
                        ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400'
                        : booking.status === 'confirmed'
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                        : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                    }`}>
                      {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                        <FiMail className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Email</p>
                        <p className="font-medium text-gray-900 dark:text-gray-100">{booking.clientEmail}</p>
                      </div>
                    </div>

                    {booking.clientPhone && (
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                          <FiPhone className="w-5 h-5 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-600 dark:text-gray-400">Phone</p>
                          <p className="font-medium text-gray-900 dark:text-gray-100">{booking.clientPhone}</p>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                        <FiCalendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Requested Date</p>
                        <p className="font-medium text-gray-900 dark:text-gray-100">
                          {new Date(booking.requestedDate).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                        <FiPackage className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Package</p>
                        <p className="font-medium text-gray-900 dark:text-gray-100">{booking.packName}</p>
                      </div>
                    </div>
                  </div>

                  {booking.alternateDate && (
                    <div className="mb-4 p-3 bg-gray-50 dark:bg-dark-700 rounded-lg">
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        <strong>Alternate Date:</strong> {new Date(booking.alternateDate).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  )}

                  {booking.message && (
                    <div className="mb-4 p-4 bg-gray-50 dark:bg-dark-700 rounded-lg">
                      <div className="flex items-start space-x-2 mb-2">
                        <FiMessageSquare className="w-4 h-4 text-gray-600 dark:text-gray-400 mt-0.5" />
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Message from client:</p>
                      </div>
                      <p className="text-sm text-gray-900 dark:text-gray-100 ml-6">{booking.message}</p>
                    </div>
                  )}

                  {booking.status === 'pending' && (
                    <div className="flex items-center space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <button
                        onClick={() => handleApprove(booking.id)}
                        disabled={processing === booking.id}
                        className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
                      >
                        <FiCheck className="w-5 h-5" />
                        <span className="font-medium">Approve Booking</span>
                      </button>
                      <button
                        onClick={() => handleReject(booking.id)}
                        disabled={processing === booking.id}
                        className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50"
                      >
                        <FiX className="w-5 h-5" />
                        <span className="font-medium">Reject</span>
                      </button>
                    </div>
                  )}

                  {booking.adminNotes && booking.status === 'rejected' && (
                    <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                      <p className="text-sm text-red-800 dark:text-red-300">
                        <strong>Rejection reason:</strong> {booking.adminNotes}
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
