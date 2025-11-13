'use client';

import { useState, useEffect } from 'react';
import { FiEye, FiPhone, FiMail, FiCalendar, FiPackage, FiClock, FiFilter, FiDownload, FiCheck, FiX, FiUser, FiMapPin, FiTrendingUp } from 'react-icons/fi';
import { motion } from 'framer-motion';

interface Lead {
  id: string;
  name: string;
  email: string | null;
  phone: string;
  eventType: string;
  eventDate: string;
  location: string; // Event name stored here
  timeSlot: string;
  message: string | null;
  packageName: string | null;
  status: string;
  viewedPackages: boolean;
  packageViewedAt: string | null;
  selectedPackages: string[];
  completedForm: boolean;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
  updatedAt: string;
}

interface LeadStats {
  total: number;
  tracking: number;
  pending: number;
  approved: number;
  conversionRate: number;
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filteredLeads, setFilteredLeads] = useState<Lead[]>([]);
  const [stats, setStats] = useState<LeadStats>({
    total: 0,
    tracking: 0,
    pending: 0,
    approved: 0,
    conversionRate: 0,
  });
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<'all' | 'tracking' | 'pending' | 'approved'>('all');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    fetchLeads();
  }, []);

  useEffect(() => {
    // Apply filter
    if (filterStatus === 'all') {
      setFilteredLeads(leads);
    } else {
      setFilteredLeads(leads.filter(lead => lead.status === filterStatus));
    }
  }, [filterStatus, leads]);

  const fetchLeads = async () => {
    try {
      const res = await fetch('/api/bookings?includeTracking=true');
      if (res.ok) {
        const data = await res.json();
        setLeads(data);
        
        // Calculate stats
        const tracking = data.filter((l: Lead) => l.status === 'tracking').length;
        const pending = data.filter((l: Lead) => l.status === 'pending').length;
        const approved = data.filter((l: Lead) => l.status === 'approved').length;
        const conversionRate = data.length > 0 ? ((pending + approved) / data.length * 100) : 0;

        setStats({
          total: data.length,
          tracking,
          pending,
          approved,
          conversionRate: Math.round(conversionRate * 10) / 10,
        });
      }
    } catch (error) {
      console.error('Error fetching leads:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateLeadStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/bookings/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      if (res.ok) {
        fetchLeads();
        if (selectedLead?.id === id) {
          setSelectedLead({ ...selectedLead, status });
        }
      }
    } catch (error) {
      console.error('Error updating lead:', error);
    }
  };

  const exportToCSV = () => {
    const csvContent = [
      ['Name', 'Email', 'Phone', 'Event Type', 'Event Name', 'Event Date', 'Status', 'Package Viewed', 'Created At'],
      ...filteredLeads.map(lead => [
        lead.name,
        lead.email || '',
        lead.phone,
        lead.eventType,
        lead.location,
        new Date(lead.eventDate).toLocaleDateString(),
        lead.status,
        lead.packageName || lead.selectedPackages.join(', '),
        new Date(lead.createdAt).toLocaleString(),
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `leads-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'tracking': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'pending': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'approved': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'rejected': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'tracking': return 'Browsing';
      case 'pending': return 'New Lead';
      case 'approved': return 'Converted';
      case 'rejected': return 'Rejected';
      default: return status;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading leads...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-900 p-4 md:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Leads & Quote Requests
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Track all visitors and booking requests
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-dark-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between mb-2">
            <FiTrendingUp className="w-8 h-8 text-primary" />
            <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.total}</span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Total Visitors</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-dark-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between mb-2">
            <FiEye className="w-8 h-8 text-yellow-500" />
            <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.tracking}</span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Browsing</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-dark-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between mb-2">
            <FiPackage className="w-8 h-8 text-blue-500" />
            <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.pending}</span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">New Leads</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-dark-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between mb-2">
            <FiCheck className="w-8 h-8 text-green-500" />
            <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.approved}</span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Converted</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-br from-primary to-primary-dark text-white rounded-lg shadow-sm p-6"
        >
          <div className="flex items-center justify-between mb-2">
            <FiTrendingUp className="w-8 h-8" />
            <span className="text-2xl font-bold">{stats.conversionRate}%</span>
          </div>
          <p className="text-sm opacity-90">Conversion Rate</p>
        </motion.div>
      </div>

      {/* Filters & Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto">
          <FiFilter className="w-5 h-5 text-gray-600 dark:text-gray-400 flex-shrink-0" />
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap ${
              filterStatus === 'all'
                ? 'bg-primary text-white'
                : 'bg-gray-200 dark:bg-dark-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-dark-600'
            }`}
          >
            All ({stats.total})
          </button>
          <button
            onClick={() => setFilterStatus('tracking')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap ${
              filterStatus === 'tracking'
                ? 'bg-yellow-500 text-white'
                : 'bg-gray-200 dark:bg-dark-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-dark-600'
            }`}
          >
            Browsing ({stats.tracking})
          </button>
          <button
            onClick={() => setFilterStatus('pending')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap ${
              filterStatus === 'pending'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 dark:bg-dark-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-dark-600'
            }`}
          >
            New Leads ({stats.pending})
          </button>
          <button
            onClick={() => setFilterStatus('approved')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap ${
              filterStatus === 'approved'
                ? 'bg-green-500 text-white'
                : 'bg-gray-200 dark:bg-dark-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-dark-600'
            }`}
          >
            Converted ({stats.approved})
          </button>
        </div>

        <button
          onClick={exportToCSV}
          className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-dark-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-700 transition"
        >
          <FiDownload className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      {/* Leads List */}
      <div className="bg-white dark:bg-dark-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        {filteredLeads.length === 0 ? (
          <div className="text-center py-12">
            <FiPackage className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
              No leads found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {filterStatus === 'all' 
                ? 'No visitors have viewed your packs yet.'
                : `No leads with status "${getStatusLabel(filterStatus)}".`}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-dark-700 border-b border-gray-200 dark:border-gray-600">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Visitor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Event Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Package Viewed
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-gray-50 dark:hover:bg-dark-700/50 transition">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                          <FiUser className="w-5 h-5 text-primary" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {lead.name}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                            {lead.email && (
                              <span className="flex items-center gap-1">
                                <FiMail className="w-3 h-3" />
                                {lead.email}
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                            <FiPhone className="w-3 h-3" />
                            {lead.phone}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 dark:text-gray-100 font-medium">
                        {lead.location}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                        <FiCalendar className="w-3 h-3" />
                        {new Date(lead.eventDate).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                        {lead.eventType} • {lead.timeSlot}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {lead.packageName ? (
                        <div className="text-sm text-gray-900 dark:text-gray-100">
                          <FiPackage className="w-4 h-4 inline mr-1 text-primary" />
                          {lead.packageName}
                        </div>
                      ) : lead.selectedPackages.length > 0 ? (
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {lead.selectedPackages.join(', ')}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400 dark:text-gray-500">No package selected</span>
                      )}
                      {lead.packageViewedAt && (
                        <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-1">
                          <FiClock className="w-3 h-3" />
                          {new Date(lead.packageViewedAt).toLocaleString()}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(lead.status)}`}>
                        {getStatusLabel(lead.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      <div>{new Date(lead.createdAt).toLocaleDateString()}</div>
                      <div className="text-xs">{new Date(lead.createdAt).toLocaleTimeString()}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => {
                          setSelectedLead(lead);
                          setModalOpen(true);
                        }}
                        className="text-primary hover:text-primary-dark font-medium"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {modalOpen && selectedLead && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-dark-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
          >
            {/* Modal Header */}
            <div className="sticky top-0 bg-white dark:bg-dark-800 border-b border-gray-200 dark:border-gray-700 p-6 flex justify-between items-center z-10">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Lead Details
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-dark-700 rounded-full transition-colors"
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Status Badge */}
              <div className="flex items-center justify-between">
                <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(selectedLead.status)}`}>
                  {getStatusLabel(selectedLead.status)}
                </span>
                {/* Information Only - No Action Buttons */}
              </div>

              {/* Contact Information */}
              <div className="bg-gray-50 dark:bg-dark-700 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                  <FiUser className="w-5 h-5 text-primary" />
                  Contact Information
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                    <FiUser className="w-4 h-4 text-gray-500" />
                    <span className="font-medium">Name:</span>
                    <span>{selectedLead.name}</span>
                  </div>
                  {selectedLead.email && (
                    <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                      <FiMail className="w-4 h-4 text-gray-500" />
                      <span className="font-medium">Email:</span>
                      <a href={`mailto:${selectedLead.email}`} className="text-primary hover:underline">
                        {selectedLead.email}
                      </a>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                    <FiPhone className="w-4 h-4 text-gray-500" />
                    <span className="font-medium">Phone:</span>
                    <a href={`tel:${selectedLead.phone}`} className="text-primary hover:underline">
                      {selectedLead.phone}
                    </a>
                  </div>
                </div>
              </div>

              {/* Event Details */}
              <div className="bg-gray-50 dark:bg-dark-700 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                  <FiCalendar className="w-5 h-5 text-primary" />
                  Event Details
                </h3>
                <div className="space-y-2">
                  <div className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
                    <FiMapPin className="w-4 h-4 text-gray-500 mt-1" />
                    <div>
                      <span className="font-medium">Event Name:</span>
                      <div className="text-lg font-semibold text-primary">{selectedLead.location}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                    <span className="font-medium">Type:</span>
                    <span className="capitalize">{selectedLead.eventType}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                    <FiCalendar className="w-4 h-4 text-gray-500" />
                    <span className="font-medium">Date:</span>
                    <span>{new Date(selectedLead.eventDate).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                    <FiClock className="w-4 h-4 text-gray-500" />
                    <span className="font-medium">Time Slot:</span>
                    <span className="capitalize">{selectedLead.timeSlot.replace(/-/g, ' ')}</span>
                  </div>
                </div>
              </div>

              {/* Package Information */}
              {(selectedLead.packageName || selectedLead.selectedPackages.length > 0) && (
                <div className="bg-gray-50 dark:bg-dark-700 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                    <FiPackage className="w-5 h-5 text-primary" />
                    Package Information
                  </h3>
                  <div className="space-y-2">
                    {selectedLead.packageName && (
                      <div className="text-gray-700 dark:text-gray-300">
                        <span className="font-medium">Selected Package:</span>
                        <div className="text-lg font-semibold text-primary mt-1">
                          {selectedLead.packageName}
                        </div>
                      </div>
                    )}
                    {selectedLead.selectedPackages.length > 0 && (
                      <div className="text-gray-700 dark:text-gray-300">
                        <span className="font-medium">Viewed Packages:</span>
                        <div className="mt-1">
                          {selectedLead.selectedPackages.map((pkg, idx) => (
                            <span key={idx} className="inline-block bg-primary/10 text-primary px-3 py-1 rounded-full text-sm mr-2 mb-2">
                              {pkg}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {selectedLead.packageViewedAt && (
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 text-sm">
                        <FiClock className="w-4 h-4" />
                        <span>Viewed on {new Date(selectedLead.packageViewedAt).toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Message */}
              {selectedLead.message && (
                <div className="bg-gray-50 dark:bg-dark-700 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
                    Message
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                    {selectedLead.message}
                  </p>
                </div>
              )}

              {/* Tracking Info */}
              <div className="bg-gray-50 dark:bg-dark-700 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
                  Tracking Information
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-gray-700 dark:text-gray-300">
                    <span className="font-medium">First Visit:</span>
                    <span>{new Date(selectedLead.createdAt).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-gray-700 dark:text-gray-300">
                    <span className="font-medium">Last Update:</span>
                    <span>{new Date(selectedLead.updatedAt).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-gray-700 dark:text-gray-300">
                    <span className="font-medium">Viewed Packages:</span>
                    <span>{selectedLead.viewedPackages ? 'Yes' : 'No'}</span>
                  </div>
                  <div className="flex justify-between text-gray-700 dark:text-gray-300">
                    <span className="font-medium">Completed Form:</span>
                    <span>{selectedLead.completedForm ? 'Yes' : 'No'}</span>
                  </div>
                  {selectedLead.ipAddress && (
                    <div className="flex justify-between text-gray-600 dark:text-gray-400 text-xs">
                      <span>IP Address:</span>
                      <span>{selectedLead.ipAddress}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <a
                  href={`tel:${selectedLead.phone}`}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition"
                >
                  <FiPhone className="w-5 h-5" />
                  Call
                </a>
                {selectedLead.email && (
                  <a
                    href={`mailto:${selectedLead.email}`}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                  >
                    <FiMail className="w-5 h-5" />
                    Email
                  </a>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
