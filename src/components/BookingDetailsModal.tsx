'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Clock, MapPin, Mail, Phone, User, Package, MessageSquare, CheckCircle, XCircle, Clock3, FileText, Plus } from 'lucide-react';
import InvoiceEditor from './InvoiceEditor';

interface BookingDetailsModalProps {
  booking: any;
  isOpen: boolean;
  onClose: () => void;
  onStatusChange?: (bookingId: string, status: string) => void;
}

export default function BookingDetailsModal({ booking, isOpen, onClose, onStatusChange }: BookingDetailsModalProps) {
  const [status, setStatus] = useState(booking.status);
  const [adminNotes, setAdminNotes] = useState(booking.adminNotes || '');
  const [saving, setSaving] = useState(false);
  const [showInvoiceEditor, setShowInvoiceEditor] = useState(false);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loadingInvoices, setLoadingInvoices] = useState(false);

  // Load invoices for this booking
  useEffect(() => {
    if (isOpen && booking.id) {
      loadInvoices();
    }
  }, [isOpen, booking.id]);

  const loadInvoices = async () => {
    try {
      setLoadingInvoices(true);
      const response = await fetch(`/api/invoices/${booking.id}`);
      if (response.ok) {
        const data = await response.json();
        setInvoices(data);
      }
    } catch (error) {
      console.error('Error loading invoices:', error);
    } finally {
      setLoadingInvoices(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    try {
      setSaving(true);
      const response = await fetch(`/api/bookings/${booking.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, adminNotes }),
      });

      if (response.ok) {
        setStatus(newStatus);
        if (onStatusChange) {
          onStatusChange(booking.id, newStatus);
        }
        
        // Show success message
        alert(
          newStatus === 'approved' 
            ? '✅ Booking approved and synced to calendar!' 
            : `✅ Booking status updated to ${newStatus}`
        );
        
        // Close modal after short delay
        setTimeout(() => {
          onClose();
        }, 500);
      } else {
        alert('Failed to update booking status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update booking status');
    } finally {
      setSaving(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
      default:
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTimeSlot = (slot: string) => {
    const slots: Record<string, string> = {
      'morning': 'Matin (8h-12h)',
      'afternoon': 'Après-midi (14h-18h)',
      'evening': 'Soirée (18h-22h)',
      'all-day': 'Toute la journée',
    };
    return slots[slot] || slot;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-white dark:bg-dark-800 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="sticky top-0 bg-white dark:bg-dark-800 border-b border-gray-200 dark:border-gray-700 p-6 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Booking Details
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Submitted {new Date(booking.createdAt).toLocaleString('fr-FR')}
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-dark-700 rounded-lg transition"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Status Badge */}
                <div className="flex items-center justify-between">
                  <span className={`px-4 py-2 rounded-full font-semibold ${getStatusColor(status)}`}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </span>
                  {booking.calendarEventId && (
                    <span className="text-sm text-green-600 dark:text-green-400 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      Synced to Calendar
                    </span>
                  )}
                </div>

                {/* Client Information */}
                <div className="bg-gray-50 dark:bg-dark-700/50 rounded-xl p-4 space-y-3">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                    Client Information
                  </h3>
                  
                  <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                    <User className="w-5 h-5 text-gray-400" />
                    <span className="font-medium">{booking.name}</span>
                  </div>

                  {booking.email && (
                    <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                      <Mail className="w-5 h-5 text-gray-400" />
                      <a href={`mailto:${booking.email}`} className="hover:text-primary">
                        {booking.email}
                      </a>
                    </div>
                  )}

                  <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                    <Phone className="w-5 h-5 text-gray-400" />
                    <a href={`tel:${booking.phone}`} className="hover:text-primary">
                      {booking.phone}
                    </a>
                  </div>
                </div>

                {/* Event Details - Multiple Events Support */}
                <div className="bg-gray-50 dark:bg-dark-700/50 rounded-xl p-4 space-y-3">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                    {booking.events && Array.isArray(booking.events) && booking.events.length > 1 
                      ? `Event Details (${booking.events.length} événements)`
                      : 'Event Details'
                    }
                  </h3>

                  {/* Check if booking has multiple events */}
                  {booking.events && Array.isArray(booking.events) && booking.events.length > 0 ? (
                    <div className="space-y-4">
                      {(booking.events as any[]).map((event: any, index: number) => (
                        <div 
                          key={index}
                          className="p-4 bg-white dark:bg-dark-800 rounded-lg border-l-4 border-primary"
                        >
                          <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                            <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                              #{index + 1}
                            </span>
                            Événement {index + 1}
                          </h4>

                          <div className="space-y-2">
                            <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                              <Package className="w-4 h-4 text-gray-400" />
                              <span className="font-medium">{event.eventType || 'N/A'}</span>
                            </div>

                            <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                              <Calendar className="w-4 h-4 text-gray-400" />
                              <span>{event.eventDate ? formatDate(event.eventDate) : 'N/A'}</span>
                            </div>

                            <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                              <Clock className="w-4 h-4 text-gray-400" />
                              <span>{event.timeSlot ? formatTimeSlot(event.timeSlot) : 'N/A'}</span>
                            </div>

                            {event.location && (
                              <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                                <MapPin className="w-4 h-4 text-gray-400" />
                                <span>{event.location}</span>
                              </div>
                            )}

                            {(event.packageType || event.packageLevel) && (
                              <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                                <Package className="w-4 h-4 text-gray-400" />
                                <span className="text-sm">
                                  <strong>Forfait:</strong>{' '}
                                  {event.packageType === 'aymen' ? 'Par Aymen' : event.packageType === 'equipe' ? 'Par Équipe' : event.packageType}
                                  {event.packageLevel && ` - ${event.packageLevel.toUpperCase()}`}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    // Fallback to single event display for backward compatibility
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                        <Calendar className="w-5 h-5 text-gray-400" />
                        <span>{formatDate(booking.eventDate)}</span>
                      </div>

                      <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                        <Clock className="w-5 h-5 text-gray-400" />
                        <span>{formatTimeSlot(booking.timeSlot)}</span>
                      </div>

                      <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                        <MapPin className="w-5 h-5 text-gray-400" />
                        <span>{booking.location}</span>
                      </div>

                      <div className="flex items-start gap-3 text-gray-700 dark:text-gray-300">
                        <Package className="w-5 h-5 text-gray-400 mt-1" />
                        <div>
                          <div className="font-medium">{booking.eventType}</div>
                          {booking.packageName && (
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              Package: {booking.packageName}
                              {booking.packagePrice && ` - ${booking.packagePrice} DT`}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Message */}
                {booking.message && (
                  <div className="bg-gray-50 dark:bg-dark-700/50 rounded-xl p-4">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                      <MessageSquare className="w-5 h-5" />
                      Client Message
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                      {booking.message}
                    </p>
                  </div>
                )}

                {/* Admin Notes */}
                <div>
                  <label className="block font-semibold text-gray-900 dark:text-white mb-2">
                    Admin Notes
                  </label>
                  <textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-dark-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                    rows={3}
                    placeholder="Add internal notes about this booking..."
                  />
                </div>

                {/* Invoices Section */}
                <div className="bg-gray-50 dark:bg-dark-700/50 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                      <FileText className="w-5 h-5" />
                      Factures ({invoices.length})
                    </h3>
                    <button
                      onClick={() => setShowInvoiceEditor(true)}
                      className="btn-primary text-sm flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Nouvelle facture
                    </button>
                  </div>
                  
                  {loadingInvoices ? (
                    <p className="text-sm text-gray-500">Chargement...</p>
                  ) : invoices.length > 0 ? (
                    <div className="space-y-2">
                      {invoices.map((invoice) => (
                        <button
                          key={invoice.id}
                          onClick={() => setShowInvoiceEditor(true)}
                          className="w-full text-left p-3 bg-white dark:bg-dark-800 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-700 transition"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium text-sm">{invoice.invoiceNumber}</div>
                              <div className="text-xs text-gray-500">
                                {new Date(invoice.issueDate).toLocaleDateString('fr-FR')} • {invoice.totalAmount.toFixed(2)} DT
                              </div>
                            </div>
                            <span className={`px-2 py-1 rounded text-xs font-semibold ${
                              invoice.paymentStatus === 'paid' 
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                : invoice.paymentStatus === 'partial'
                                ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                                : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                            }`}>
                              {invoice.paymentStatus}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">Aucune facture créée</p>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  {status !== 'approved' && (
                    <button
                      onClick={() => handleStatusChange('approved')}
                      disabled={saving}
                      className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
                    >
                      <CheckCircle className="w-5 h-5" />
                      Approve & Sync to Calendar
                    </button>
                  )}
                  {status !== 'rejected' && (
                    <button
                      onClick={() => handleStatusChange('rejected')}
                      disabled={saving}
                      className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
                    >
                      <XCircle className="w-5 h-5" />
                      Reject
                    </button>
                  )}
                  {status !== 'pending' && status !== 'approved' && (
                    <button
                      onClick={() => handleStatusChange('pending')}
                      disabled={saving}
                      className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
                    >
                      <Clock3 className="w-5 h-5" />
                      Set Pending
                    </button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
      
      {/* Invoice Editor Modal */}
      {showInvoiceEditor && (
        <InvoiceEditor
          booking={booking}
          existingInvoice={invoices[0]}
          onClose={() => setShowInvoiceEditor(false)}
          onSave={(savedInvoice) => {
            setShowInvoiceEditor(false);
            loadInvoices(); // Reload invoices
          }}
        />
      )}
    </AnimatePresence>
  );
}
