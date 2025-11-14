'use client';

import { useState, useEffect } from 'react';
import { FiDownload, FiEye, FiEdit2, FiTrash2, FiSearch, FiFilter, FiDollarSign, FiClock, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
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
  issueDate: string;
  dueDate?: string;
  booking: any;
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [filteredInvoices, setFilteredInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [showInvoiceEditor, setShowInvoiceEditor] = useState(false);

  useEffect(() => {
    loadInvoices();
  }, []);

  useEffect(() => {
    filterInvoices();
  }, [invoices, searchQuery, statusFilter]);

  const loadInvoices = async () => {
    try {
      setLoading(true);
      
      // Fetch all invoices (we'll aggregate from all bookings)
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
      toast.error('Failed to load invoices');
    } finally {
      setLoading(false);
    }
  };

  const filterInvoices = () => {
    let filtered = [...invoices];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        inv =>
          inv.invoiceNumber.toLowerCase().includes(query) ||
          inv.clientName.toLowerCase().includes(query) ||
          inv.clientPhone.includes(query) ||
          (inv.clientEmail && inv.clientEmail.toLowerCase().includes(query))
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(inv => inv.paymentStatus === statusFilter);
    }

    setFilteredInvoices(filtered);
  };

  const markAsPaid = async (invoiceId: string) => {
    if (!confirm('Mark this invoice as fully paid?')) return;

    const loadingToast = toast.loading('Updating invoice...');

    try {
      const res = await fetch(`/api/invoices/invoice/${invoiceId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentStatus: 'paid',
          paymentDate: new Date().toISOString(),
        }),
      });

      if (res.ok) {
        toast.success('✅ Invoice marked as paid', { id: loadingToast });
        loadInvoices();
      } else {
        toast.error('❌ Failed to update invoice', { id: loadingToast });
      }
    } catch (error) {
      console.error('Error updating invoice:', error);
      toast.error('❌ Failed to update invoice', { id: loadingToast });
    }
  };

  const deleteInvoice = async (invoiceId: string) => {
    if (!confirm('Are you sure you want to delete this invoice?')) return;

    const loadingToast = toast.loading('Deleting invoice...');

    try {
      const res = await fetch(`/api/invoices/invoice/${invoiceId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        toast.success('✅ Invoice deleted', { id: loadingToast });
        loadInvoices();
      } else {
        toast.error('❌ Failed to delete invoice', { id: loadingToast });
      }
    } catch (error) {
      console.error('Error deleting invoice:', error);
      toast.error('❌ Failed to delete invoice', { id: loadingToast });
    }
  };

  const downloadPDF = async (invoice: Invoice) => {
    toast.loading('Generating PDF...');
    // This would trigger the InvoiceEditor's PDF download
    // For now, we'll open in editor with view mode
    setSelectedInvoice(invoice);
    setShowInvoiceEditor(true);
  };

  // Calculate stats
  const stats = {
    total: invoices.length,
    paid: invoices.filter(inv => inv.paymentStatus === 'paid').length,
    partial: invoices.filter(inv => inv.paymentStatus === 'partial').length,
    unpaid: invoices.filter(inv => inv.paymentStatus === 'unpaid').length,
    totalRevenue: invoices.reduce((sum, inv) => sum + inv.totalAmount, 0),
    paidRevenue: invoices.reduce((sum, inv) => sum + inv.paidAmount, 0),
    pendingRevenue: invoices.reduce((sum, inv) => sum + (inv.totalAmount - inv.paidAmount), 0),
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'partial':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'unpaid':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <FiCheckCircle className="w-4 h-4" />;
      case 'partial':
        return <FiClock className="w-4 h-4" />;
      case 'unpaid':
        return <FiAlertCircle className="w-4 h-4" />;
      default:
        return <FiDollarSign className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-900">
      {/* Header */}
      <header className="bg-white dark:bg-dark-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-30">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Factures / Invoices</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {stats.total} total • {stats.paid} paid • {stats.unpaid} unpaid
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="px-6 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white dark:bg-dark-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {stats.totalRevenue.toFixed(2)} TND
                </p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <FiDollarSign className="w-6 h-6 text-blue-600 dark:text-blue-300" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-dark-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Paid</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {stats.paidRevenue.toFixed(2)} TND
                </p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                <FiCheckCircle className="w-6 h-6 text-green-600 dark:text-green-300" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-1">{stats.paid} invoices</p>
          </div>

          <div className="bg-white dark:bg-dark-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Pending</p>
                <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                  {stats.pendingRevenue.toFixed(2)} TND
                </p>
              </div>
              <div className="p-3 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                <FiClock className="w-6 h-6 text-yellow-600 dark:text-yellow-300" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-1">{stats.partial + stats.unpaid} invoices</p>
          </div>

          <div className="bg-white dark:bg-dark-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Unpaid</p>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {stats.unpaid}
                </p>
              </div>
              <div className="p-3 bg-red-100 dark:bg-red-900 rounded-lg">
                <FiAlertCircle className="w-6 h-6 text-red-600 dark:text-red-300" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-1">Require follow-up</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-dark-800 rounded-lg p-4 mb-4 border border-gray-200 dark:border-gray-700">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by invoice number, client name, phone..."
                className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-dark-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="flex items-center gap-2">
              <FiFilter className="text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 bg-gray-50 dark:bg-dark-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="all">All Status</option>
                <option value="paid">Paid</option>
                <option value="partial">Partial</option>
                <option value="unpaid">Unpaid</option>
              </select>
            </div>
          </div>
        </div>

        {/* Invoices Table */}
        <div className="bg-white dark:bg-dark-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          {filteredInvoices.length === 0 ? (
            <div className="text-center py-12">
              <FiDollarSign className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                No Invoices Found
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {searchQuery || statusFilter !== 'all'
                  ? 'Try adjusting your filters'
                  : 'Invoices will appear here when you create them from approved bookings'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-dark-700 border-b border-gray-200 dark:border-gray-600">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Invoice #
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Client
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Event
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredInvoices.map((invoice) => (
                    <tr
                      key={invoice.id}
                      className="hover:bg-gray-50 dark:hover:bg-dark-700 transition"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {invoice.invoiceNumber}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(invoice.issueDate).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {invoice.clientName}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {invoice.clientPhone}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-gray-100">
                          {invoice.eventType}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(invoice.eventDate).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        {new Date(invoice.issueDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                          {invoice.totalAmount.toFixed(2)} TND
                        </div>
                        {invoice.paidAmount > 0 && (
                          <div className="text-xs text-green-600 dark:text-green-400">
                            Paid: {invoice.paidAmount.toFixed(2)} TND
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                            invoice.paymentStatus
                          )}`}
                        >
                          {getStatusIcon(invoice.paymentStatus)}
                          {invoice.paymentStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          {invoice.paymentStatus !== 'paid' && (
                            <button
                              onClick={() => markAsPaid(invoice.id)}
                              className="p-2 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition"
                              title="Mark as Paid"
                            >
                              <FiCheckCircle className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => {
                              setSelectedInvoice(invoice);
                              setShowInvoiceEditor(true);
                            }}
                            className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition"
                            title="View/Edit"
                          >
                            <FiEye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteInvoice(invoice.id)}
                            className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
                            title="Delete"
                          >
                            <FiTrash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Invoice Editor Modal */}
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
    </div>
  );
}
