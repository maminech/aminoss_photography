'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  ChevronRight,
  Sparkles,
  TrendingUp,
  AlertCircle
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

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

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
      const response = await fetch('/api/bookings');
      if (response.ok) {
        const data = await response.json();
        const sortedData = data.sort((a: Booking, b: Booking) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setBookings(sortedData);
      }

      const groupedResponse = await fetch('/api/bookings?grouped=true');
      if (groupedResponse.ok) {
        const groupedData = await groupedResponse.json();
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
    setBookings(prev => 
      prev.map(b => b.id === bookingId ? { ...b, status: newStatus } : b)
    );
    
    setGroupedBookings(prev => 
      prev.map(group => ({
        ...group,
        bookings: group.bookings.map((b: Booking) => 
          b.id === bookingId ? { ...b, status: newStatus } : b
        ),
      }))
    );

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
    if (filter === 'viewed' && !booking.viewedPackages) return false;
    if (filter === 'completed' && !booking.completedForm) return false;
    if (filter === 'tracking' && booking.status !== 'tracking') return false;

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
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-dark-900 dark:to-gray-800">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"
          />
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-gray-600 dark:text-gray-400 font-medium"
          >
            Chargement des réservations...
          </motion.p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-dark-900 dark:to-gray-800">
      <div className="p-4 md:p-6 lg:p-8 max-w-[1920px] mx-auto">
        {/* Header with gradient */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-3">
            <motion.div
              whileHover={{ rotate: 360, scale: 1.1 }}
              transition={{ duration: 0.5 }}
              className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary via-primary/80 to-primary/60 flex items-center justify-center shadow-lg shadow-primary/20"
            >
              <TrendingUp className="w-6 h-6 text-white" />
            </motion.div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700 dark:from-white dark:via-gray-100 dark:to-gray-300 bg-clip-text text-transparent">
                Suivi des Réservations
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Gérez toutes vos interactions clients
              </p>
            </div>
          </div>
        </motion.div>

        {/* Enhanced Stats Cards with gradients and animations */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8"
        >
          <motion.div
            variants={itemVariants}
            whileHover={{ scale: 1.02, y: -4 }}
            className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 p-6 shadow-xl shadow-blue-500/20"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <Package className="w-8 h-8 text-white/90" />
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring" }}
                  className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs text-white font-medium"
                >
                  Total
                </motion.div>
              </div>
              <p className="text-white/80 text-sm font-medium mb-1">Total Interactions</p>
              <motion.p
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3, type: "spring" }}
                className="text-4xl font-bold text-white"
              >
                {stats.total}
              </motion.p>
            </div>
          </motion.div>

          <motion.div
            variants={itemVariants}
            whileHover={{ scale: 1.02, y: -4 }}
            className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 p-6 shadow-xl shadow-purple-500/20"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <Eye className="w-8 h-8 text-white/90" />
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3, type: "spring" }}
                  className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs text-white font-medium"
                >
                  Vus
                </motion.div>
              </div>
              <p className="text-white/80 text-sm font-medium mb-1">Packages Consultés</p>
              <motion.p
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4, type: "spring" }}
                className="text-4xl font-bold text-white"
              >
                {stats.viewedPackages}
              </motion.p>
            </div>
          </motion.div>

          <motion.div
            variants={itemVariants}
            whileHover={{ scale: 1.02, y: -4 }}
            className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-500 to-green-600 p-6 shadow-xl shadow-green-500/20"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <CheckCircle className="w-8 h-8 text-white/90" />
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.4, type: "spring" }}
                  className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs text-white font-medium"
                >
                  Complets
                </motion.div>
              </div>
              <p className="text-white/80 text-sm font-medium mb-1">Formulaires Remplis</p>
              <motion.p
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5, type: "spring" }}
                className="text-4xl font-bold text-white"
              >
                {stats.completedForms}
              </motion.p>
            </div>
          </motion.div>

          <motion.div
            variants={itemVariants}
            whileHover={{ scale: 1.02, y: -4 }}
            className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 p-6 shadow-xl shadow-amber-500/20"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <Clock className="w-8 h-8 text-white/90" />
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5, type: "spring" }}
                  className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs text-white font-medium"
                >
                  En cours
                </motion.div>
              </div>
              <p className="text-white/80 text-sm font-medium mb-1">En Progression</p>
              <motion.p
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6, type: "spring" }}
                className="text-4xl font-bold text-white"
              >
                {stats.tracking}
              </motion.p>
            </div>
          </motion.div>
        </motion.div>

        {/* View Mode Toggle with smooth animation */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="flex gap-2 mb-6"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setViewMode('grouped')}
            className={`px-6 py-3 rounded-xl font-medium transition-all flex items-center gap-2 shadow-lg ${
              viewMode === 'grouped'
                ? 'bg-gradient-to-r from-primary to-primary/80 text-white shadow-primary/30'
                : 'bg-white dark:bg-dark-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-700'
            }`}
          >
            <Users className="w-5 h-5" />
            Groupé par Client
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setViewMode('list')}
            className={`px-6 py-3 rounded-xl font-medium transition-all flex items-center gap-2 shadow-lg ${
              viewMode === 'list'
                ? 'bg-gradient-to-r from-primary to-primary/80 text-white shadow-primary/30'
                : 'bg-white dark:bg-dark-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-700'
            }`}
          >
            <Package className="w-5 h-5" />
            Toutes les Réservations
          </motion.button>
        </motion.div>

        {/* Filters and Search with glassmorphism */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white/80 dark:bg-dark-800/80 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-gray-200/50 dark:border-gray-700/50 mb-6"
        >
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="flex gap-2 flex-wrap">
              {[
                { key: 'all', label: 'Tous', count: stats.total, icon: Package },
                { key: 'viewed', label: 'Vus', count: stats.viewedPackages, icon: Eye },
                { key: 'completed', label: 'Complets', count: stats.completedForms, icon: CheckCircle },
                { key: 'tracking', label: 'En cours', count: stats.tracking, icon: Clock },
              ].map(({ key, label, count, icon: Icon }) => (
                <motion.button
                  key={key}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setFilter(key as any)}
                  className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center gap-2 shadow-md ${
                    filter === key
                      ? 'bg-gradient-to-r from-primary to-primary/80 text-white shadow-primary/30'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label} <span className="ml-1 px-2 py-0.5 bg-white/20 rounded-full text-xs">{count}</span>
                </motion.button>
              ))}
            </div>

            <div className="flex gap-3 w-full lg:w-auto">
              <div className="relative flex-1 lg:w-80">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-100 dark:bg-gray-700 border-0 rounded-xl text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-primary transition shadow-inner"
                />
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={exportToCSV}
                className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-medium transition-all flex items-center gap-2 shadow-lg shadow-green-500/30 hover:shadow-xl hover:shadow-green-500/40"
              >
                <Download className="w-5 h-5" />
                <span className="hidden sm:inline">Exporter CSV</span>
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Bookings List */}
        <AnimatePresence mode="wait">
          {filteredBookings.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white/80 dark:bg-dark-800/80 backdrop-blur-xl rounded-2xl p-12 text-center shadow-xl border border-gray-200/50 dark:border-gray-700/50"
            >
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 rounded-2xl flex items-center justify-center mx-auto mb-4"
              >
                <AlertCircle className="w-10 h-10 text-gray-400" />
              </motion.div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                Aucune réservation trouvée
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Essayez de modifier vos filtres ou votre recherche
              </p>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4"
            >
              {viewMode === 'grouped' ? (
                // Grouped View
                groupedBookings.filter(group => {
                  const groupBookings = group.bookings.filter((booking: Booking) => filteredBookings.some(fb => fb.id === booking.id));
                  return groupBookings.length > 0;
                }).map((group, index) => (
                  <motion.div
                    key={group.clientKey}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-white/80 dark:bg-dark-800/80 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden"
                  >
                    <motion.div
                      whileHover={{ backgroundColor: 'rgba(var(--primary-rgb), 0.05)' }}
                      onClick={() => toggleClientExpand(group.clientKey)}
                      className="px-6 py-5 cursor-pointer border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-transparent via-primary/5 to-transparent"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <motion.div
                            whileHover={{ rotate: 360, scale: 1.1 }}
                            transition={{ duration: 0.6 }}
                            className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary/70 text-white flex items-center justify-center font-bold text-xl shadow-lg shadow-primary/20"
                          >
                            {group.clientName.charAt(0).toUpperCase()}
                          </motion.div>
                          <div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                              {group.clientName}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                              <Package className="w-4 h-4" />
                              {group.bookings.length} réservation{group.bookings.length > 1 ? 's' : ''}
                            </p>
                          </div>
                        </div>
                        <motion.div
                          animate={{ rotate: expandedClients.has(group.clientKey) ? 90 : 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <ChevronRight className="w-6 h-6 text-gray-400" />
                        </motion.div>
                      </div>
                    </motion.div>

                    <AnimatePresence>
                      {expandedClients.has(group.clientKey) && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="overflow-hidden"
                        >
                          <div className="p-6 space-y-4">
                            {group.bookings.filter((booking: Booking) => filteredBookings.some(fb => fb.id === booking.id)).map((booking: Booking, bookingIndex: number) => (
                              <BookingCard
                                key={booking.id}
                                booking={booking}
                                index={bookingIndex}
                                onStatusChange={handleStatusChange}
                                onSelectBooking={setSelectedBooking}
                              />
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))
              ) : (
                // List View
                <div className="space-y-4">
                  {filteredBookings.map((booking, index) => (
                    <BookingCard
                      key={booking.id}
                      booking={booking}
                      index={index}
                      onStatusChange={handleStatusChange}
                      onSelectBooking={setSelectedBooking}
                    />
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Booking Details Modal */}
        <AnimatePresence>
          {selectedBooking && (
            <BookingDetailsModal
              booking={selectedBooking}
              isOpen={!!selectedBooking}
              onClose={() => setSelectedBooking(null)}
              onStatusChange={handleStatusChange}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// Enhanced Booking Card Component
function BookingCard({ 
  booking, 
  index, 
  onStatusChange, 
  onSelectBooking 
}: { 
  booking: Booking; 
  index: number; 
  onStatusChange: (id: string, status: string) => void;
  onSelectBooking: (booking: Booking) => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ scale: 1.01, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}
      onClick={() => onSelectBooking(booking)}
      className="bg-white dark:bg-dark-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 cursor-pointer transition-all hover:border-primary/50"
    >
      <div className="flex flex-col md:flex-row md:items-center gap-4 justify-between">
        <div className="flex-1 space-y-3">
          <div className="flex items-center gap-3">
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
              className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center"
            >
              <Package className="w-6 h-6 text-primary" />
            </motion.div>
            <div>
              <h4 className="font-bold text-gray-900 dark:text-white text-lg">{booking.name}</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">{booking.eventType}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <Phone className="w-4 h-4" />
              <span>{booking.phone}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <Mail className="w-4 h-4" />
              <span className="truncate">{booking.email}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <Calendar className="w-4 h-4" />
              <span>{new Date(booking.eventDate).toLocaleDateString('fr-FR')}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <Clock className="w-4 h-4" />
              <span>{booking.timeSlot}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {booking.viewedPackages && (
            <motion.div
              whileHover={{ scale: 1.1 }}
              className="px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-lg text-xs font-medium flex items-center gap-1.5"
            >
              <Eye className="w-3.5 h-3.5" />
              Vu
            </motion.div>
          )}
          {booking.completedForm && (
            <motion.div
              whileHover={{ scale: 1.1 }}
              className="px-3 py-1.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg text-xs font-medium flex items-center gap-1.5"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              Complet
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
