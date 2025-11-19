'use client';

import { useState, useEffect } from 'react';
import { FiDownload, FiEye, FiEdit2, FiTrash2, FiSearch, FiFilter, FiDollarSign, FiClock, FiCheckCircle, FiAlertCircle, FiPlus, FiFileText } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import InvoiceEditor from '@/components/InvoiceEditor';

interface Invoice {
  id: string;
  invoiceNumber: string;
  clientName: string;
  clientEmail?: string;
  clientPhone: string;
  totalAmount: number;
  paidAmount: number;
  paymentStatus: string;
  paymentMethod?: string;
  eventType: string;
  eventDate: string;
  eventRemarks?: string;
  instagramLinks?: string[];
  planDetails?: string[];
  paymentHistory?: Array<{ amount: number; date: string; method?: string }>;
  issueDate: string;
  dueDate?: string;
  booking: any;
}

export default function FacturesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [filteredInvoices, setFilteredInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [showInvoiceEditor, setShowInvoiceEditor] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  useEffect(() => {
    loadInvoices();
  }, []);

  useEffect(() => {
    filterInvoices();
  }, [invoices, searchQuery, statusFilter]);

  const loadInvoices = async () => {
    try {
      setLoading(true);
      
      // Fetch all bookings
      const bookingsRes = await fetch('/api/bookings');
      if (!bookingsRes.ok) throw new Error('Failed to fetch bookings');
      
      const bookings = await bookingsRes.json();
      
      // Fetch invoices for each booking
      const allInvoices: Invoice[] = [];
      
      for (const booking of bookings) {
        const invoicesRes = await fetch(`/api/invoices/${booking.id}`);
        if (invoicesRes.ok) {
          const bookingInvoices = await invoicesRes.json();
          allInvoices.push(...bookingInvoices.map((inv: any) => ({
            ...inv,
            booking,
          })));
        }
      }
      
      // Sort by issue date descending
      allInvoices.sort((a, b) => 
        new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime()
      );
      
      setInvoices(allInvoices);
    } catch (error) {
      console.error('Error loading invoices:', error);
      toast.error('Échec du chargement des factures');
    } finally {
      setLoading(false);
    }
  };

  const filterInvoices = () => {
    let filtered = [...invoices];

    // Search filter - search by name, phone, email, invoice number, Instagram
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        inv =>
          inv.invoiceNumber.toLowerCase().includes(query) ||
          inv.clientName.toLowerCase().includes(query) ||
          inv.clientPhone.includes(query) ||
          (inv.clientEmail && inv.clientEmail.toLowerCase().includes(query)) ||
          (inv.instagramLinks && inv.instagramLinks.some(link => link.toLowerCase().includes(query))) ||
          (inv.eventRemarks && inv.eventRemarks.toLowerCase().includes(query))
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(inv => inv.paymentStatus === statusFilter);
    }

    setFilteredInvoices(filtered);
  };

  const handleDelete = async (invoiceId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette facture ?')) {
      return;
    }

    try {
      setDeletingId(invoiceId);
      const res = await fetch(`/api/invoices/invoice/${invoiceId}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Failed to delete invoice');

      toast.success('Facture supprimée avec succès');
      loadInvoices();
    } catch (error) {
      console.error('Error deleting invoice:', error);
      toast.error('Échec de la suppression');
    } finally {
      setDeletingId(null);
    }
  };

  const handleEdit = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setShowInvoiceEditor(true);
  };

  const handleDownloadPDF = async (invoice: Invoice) => {
    try {
      setDownloadingId(invoice.id);
      const loadingToast = toast.loading('Génération du PDF...');
      
      const res = await fetch('/api/admin/invoices/generate-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invoiceId: invoice.id }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to generate PDF');
      }

      const data = await res.json();
      
      toast.dismiss(loadingToast);
      
      if (data.pdfUrl) {
        toast.success('PDF généré avec succès');
        // Open PDF in new tab
        window.open(data.pdfUrl, '_blank');
      } else {
        throw new Error('No PDF URL returned');
      }
    } catch (error: any) {
      console.error('Error generating PDF:', error);
      toast.error(error.message || 'Échec de la génération du PDF');
    } finally {
      setDownloadingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
            <FiCheckCircle className="w-3 h-3" />
            Payé
          </span>
        );
      case 'partial':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
            <FiClock className="w-3 h-3" />
            Partiel
          </span>
        );
      case 'unpaid':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
            <FiAlertCircle className="w-3 h-3" />
            Impayé
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400">
            {status}
          </span>
        );
    }
  };

  const getTotalStats = () => {
    const total = invoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
    const paid = invoices.reduce((sum, inv) => sum + inv.paidAmount, 0);
    const unpaid = total - paid;
    
    return { total, paid, unpaid };
  };

  const stats = getTotalStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Chargement des factures...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Gestion des Factures
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Gérez toutes vos factures et contrats
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Facturé</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.total.toFixed(2)} DT
              </p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <FiFileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
            {invoices.length} facture(s)
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Montant Payé</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {stats.paid.toFixed(2)} DT
              </p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <FiCheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
            {invoices.filter(inv => inv.paymentStatus === 'paid').length} payée(s)
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Reste à Payer</p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                {stats.unpaid.toFixed(2)} DT
              </p>
            </div>
            <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-lg">
              <FiAlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
            {invoices.filter(inv => inv.paymentStatus === 'unpaid').length} impayée(s)
          </p>
        </motion.div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Rechercher par nom, téléphone, email, Instagram..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="md:w-48">
            <div className="relative">
              <FiFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent appearance-none cursor-pointer"
              >
                <option value="all">Tous les statuts</option>
                <option value="paid">Payé</option>
                <option value="partial">Partiel</option>
                <option value="unpaid">Impayé</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        {filteredInvoices.length === 0 ? (
          <div className="text-center py-12">
            <FiFileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">
              {searchQuery || statusFilter !== 'all' 
                ? 'Aucune facture trouvée'
                : 'Aucune facture disponible'
              }
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    N° Facture
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Client
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Événement
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Montant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                <AnimatePresence>
                  {filteredInvoices.map((invoice) => (
                    <motion.tr
                      key={invoice.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <FiFileText className="w-4 h-4 text-gray-400" />
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {invoice.invoiceNumber}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <div className="font-medium text-gray-900 dark:text-white">
                            {invoice.clientName}
                          </div>
                          <div className="text-gray-500 dark:text-gray-400">
                            {invoice.clientPhone}
                          </div>
                          {invoice.instagramLinks && invoice.instagramLinks.length > 0 && (
                            <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                              📱 {invoice.instagramLinks[0]}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <div className="text-gray-900 dark:text-white">
                            {invoice.eventType}
                          </div>
                          <div className="text-gray-500 dark:text-gray-400 text-xs">
                            {new Date(invoice.eventDate).toLocaleDateString('fr-FR')}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm">
                          <div className="font-semibold text-gray-900 dark:text-white">
                            {invoice.totalAmount.toFixed(2)} DT
                          </div>
                          {invoice.paidAmount > 0 && (
                            <div className="text-xs text-green-600 dark:text-green-400">
                              Payé: {invoice.paidAmount.toFixed(2)} DT
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(invoice.paymentStatus)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {new Date(invoice.issueDate).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleDownloadPDF(invoice)}
                            disabled={downloadingId === invoice.id}
                            className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Télécharger PDF"
                          >
                            {downloadingId === invoice.id ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent" />
                            ) : (
                              <FiDownload className="w-4 h-4" />
                            )}
                          </button>
                          <button
                            onClick={() => handleEdit(invoice)}
                            className="p-2 text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                            title="Modifier"
                          >
                            <FiEdit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(invoice.id)}
                            disabled={deletingId === invoice.id}
                            className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50"
                            title="Supprimer"
                          >
                            <FiTrash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Invoice Editor Modal */}
      <AnimatePresence>
        {showInvoiceEditor && selectedInvoice && (
          <InvoiceEditor
            booking={selectedInvoice.booking}
            existingInvoice={selectedInvoice as any}
            onClose={() => {
              setShowInvoiceEditor(false);
              setSelectedInvoice(null);
            }}
            onSave={() => {
              setShowInvoiceEditor(false);
              setSelectedInvoice(null);
              loadInvoices();
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
