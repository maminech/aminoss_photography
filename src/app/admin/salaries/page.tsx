'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { FiDollarSign, FiPlus, FiEdit2, FiTrash2, FiCalendar, FiUser, FiCheck, FiX, FiDownload } from 'react-icons/fi';

interface TeamMember {
  id: string;
  name: string;
  monthlySalary: number;
  position: string;
}

interface SalaryPayment {
  id: string;
  teamMemberId: string;
  teamMember: TeamMember;
  month: string;
  baseAmount: number;
  bonus: number;
  deductions: number;
  netAmount: number;
  paymentDate: string;
  paymentMethod: string;
  status: string;
  notes?: string;
  receiptUrl?: string;
}

export default function SalariesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [payments, setPayments] = useState<SalaryPayment[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [filteredPayments, setFilteredPayments] = useState<SalaryPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPayment, setEditingPayment] = useState<SalaryPayment | null>(null);
  
  // Filters
  const [teamMemberFilter, setTeamMemberFilter] = useState('all');
  const [monthFilter, setMonthFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchPayments();
      fetchTeamMembers();
    }
  }, [status]);

  useEffect(() => {
    filterPayments();
  }, [payments, teamMemberFilter, monthFilter, statusFilter]);

  const fetchPayments = async () => {
    try {
      const response = await fetch('/api/salaries');
      if (response.ok) {
        const data = await response.json();
        setPayments(data);
      } else {
        toast.error('Failed to load salary payments');
      }
    } catch (error) {
      toast.error('Error loading salary payments');
    } finally {
      setLoading(false);
    }
  };

  const fetchTeamMembers = async () => {
    try {
      const response = await fetch('/api/team');
      if (response.ok) {
        const data = await response.json();
        setTeamMembers(data);
      }
    } catch (error) {
      console.error('Error fetching team members:', error);
    }
  };

  const filterPayments = () => {
    let filtered = [...payments];

    if (teamMemberFilter !== 'all') {
      filtered = filtered.filter(p => p.teamMemberId === teamMemberFilter);
    }

    if (monthFilter) {
      filtered = filtered.filter(p => p.month === monthFilter);
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(p => p.status === statusFilter);
    }

    // Sort by payment date descending
    filtered.sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime());

    setFilteredPayments(filtered);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this salary payment?')) return;

    try {
      const response = await fetch(`/api/salaries/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Salary payment deleted successfully');
        fetchPayments();
      } else {
        toast.error('Failed to delete salary payment');
      }
    } catch (error) {
      toast.error('Error deleting salary payment');
    }
  };

  const openCreateModal = (teamMemberId?: string) => {
    setEditingPayment(null);
    setShowModal(true);
  };

  const openEditModal = (payment: SalaryPayment) => {
    setEditingPayment(payment);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingPayment(null);
  };

  const handleSave = () => {
    fetchPayments();
    closeModal();
  };

  // Calculate totals
  const totalPaid = filteredPayments
    .filter(p => p.status === 'paid')
    .reduce((sum, p) => sum + p.netAmount, 0);

  const totalPending = filteredPayments
    .filter(p => p.status === 'pending')
    .reduce((sum, p) => sum + p.netAmount, 0);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case 'bank_transfer': return 'Bank Transfer';
      case 'cash': return 'Cash';
      case 'check': return 'Check';
      case 'paypal': return 'PayPal';
      default: return method;
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-600 dark:text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <FiDollarSign className="text-green-500" />
              Salary Management
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Process and track team salary payments
            </p>
          </div>
          <button
            onClick={() => openCreateModal()}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition"
          >
            <FiPlus /> Process Payment
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Paid</h3>
              <FiCheck className="text-green-500" />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {totalPaid.toLocaleString()} MAD
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {filteredPayments.filter(p => p.status === 'paid').length} payments
            </p>
          </div>

          <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending</h3>
              <FiCalendar className="text-yellow-500" />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {totalPending.toLocaleString()} MAD
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {filteredPayments.filter(p => p.status === 'pending').length} payments
            </p>
          </div>

          <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Team Members</h3>
              <FiUser className="text-blue-500" />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {teamMembers.length}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Active employees
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Team Member
              </label>
              <select
                value={teamMemberFilter}
                onChange={(e) => setTeamMemberFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500"
              >
                <option value="all">All Team Members</option>
                {teamMembers.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Month
              </label>
              <input
                type="month"
                value={monthFilter}
                onChange={(e) => setMonthFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        {/* Payments Table */}
        <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-dark-700 border-b border-gray-200 dark:border-gray-600">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Team Member
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Month
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Base Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Bonus
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Deductions
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Net Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Payment Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Method
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
                {filteredPayments.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                      No salary payments found
                    </td>
                  </tr>
                ) : (
                  filteredPayments.map((payment) => (
                    <tr
                      key={payment.id}
                      className="hover:bg-gray-50 dark:hover:bg-dark-700 transition"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <FiUser className="text-gray-400 mr-2" />
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {payment.teamMember.name}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {payment.teamMember.position}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {new Date(payment.month + '-01').toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {payment.baseAmount.toLocaleString()} MAD
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 dark:text-green-400">
                        {payment.bonus > 0 ? `+${payment.bonus.toLocaleString()}` : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 dark:text-red-400">
                        {payment.deductions > 0 ? `-${payment.deductions.toLocaleString()}` : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 dark:text-white">
                        {payment.netAmount.toLocaleString()} MAD
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {new Date(payment.paymentDate).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {getPaymentMethodLabel(payment.paymentMethod)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(payment.status)}`}>
                          {payment.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => openEditModal(payment)}
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 mr-3"
                        >
                          <FiEdit2 />
                        </button>
                        <button
                          onClick={() => handleDelete(payment.id)}
                          className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                        >
                          <FiTrash2 />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <SalaryPaymentModal
          payment={editingPayment}
          teamMembers={teamMembers}
          onClose={closeModal}
          onSave={handleSave}
        />
      )}
    </div>
  );
}

// Salary Payment Modal Component
function SalaryPaymentModal({
  payment,
  teamMembers,
  onClose,
  onSave,
}: {
  payment: SalaryPayment | null;
  teamMembers: TeamMember[];
  onClose: () => void;
  onSave: () => void;
}) {
  const [formData, setFormData] = useState({
    teamMemberId: payment?.teamMemberId || '',
    month: payment?.month || new Date().toISOString().slice(0, 7),
    baseAmount: payment?.baseAmount || 0,
    bonus: payment?.bonus || 0,
    deductions: payment?.deductions || 0,
    paymentDate: payment?.paymentDate ? new Date(payment.paymentDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    paymentMethod: payment?.paymentMethod || 'bank_transfer',
    status: payment?.status || 'pending',
    notes: payment?.notes || '',
  });
  const [saving, setSaving] = useState(false);

  // Auto-update base amount when team member changes
  useEffect(() => {
    if (formData.teamMemberId && !payment) {
      const member = teamMembers.find(m => m.id === formData.teamMemberId);
      if (member) {
        setFormData(prev => ({ ...prev, baseAmount: member.monthlySalary }));
      }
    }
  }, [formData.teamMemberId, teamMembers, payment]);

  // Calculate net amount
  const netAmount = formData.baseAmount + formData.bonus - formData.deductions;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const url = payment ? `/api/salaries/${payment.id}` : '/api/salaries';
      const method = payment ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          netAmount,
        }),
      });

      if (response.ok) {
        toast.success(payment ? 'Salary payment updated successfully' : 'Salary payment created successfully');
        onSave();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to save salary payment');
      }
    } catch (error) {
      toast.error('Error saving salary payment');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-dark-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {payment ? 'Edit Salary Payment' : 'Process Salary Payment'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Team Member *
              </label>
              <select
                value={formData.teamMemberId}
                onChange={(e) => setFormData({ ...formData, teamMemberId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500"
                required
              >
                <option value="">Select Team Member</option>
                {teamMembers.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name} ({member.monthlySalary.toLocaleString()} MAD/month)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Month *
              </label>
              <input
                type="month"
                value={formData.month}
                onChange={(e) => setFormData({ ...formData, month: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Base Amount (MAD) *
              </label>
              <input
                type="number"
                value={formData.baseAmount}
                onChange={(e) => setFormData({ ...formData, baseAmount: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500"
                min="0"
                step="0.01"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Bonus (MAD)
              </label>
              <input
                type="number"
                value={formData.bonus}
                onChange={(e) => setFormData({ ...formData, bonus: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500"
                min="0"
                step="0.01"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Deductions (MAD)
              </label>
              <input
                type="number"
                value={formData.deductions}
                onChange={(e) => setFormData({ ...formData, deductions: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500"
                min="0"
                step="0.01"
              />
            </div>
          </div>

          {/* Net Amount Display */}
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Net Amount:</span>
              <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                {netAmount.toLocaleString()} MAD
              </span>
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              {formData.baseAmount.toLocaleString()} + {formData.bonus.toLocaleString()} - {formData.deductions.toLocaleString()}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Payment Date *
              </label>
              <input
                type="date"
                value={formData.paymentDate}
                onChange={(e) => setFormData({ ...formData, paymentDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Payment Method *
              </label>
              <select
                value={formData.paymentMethod}
                onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500"
                required
              >
                <option value="bank_transfer">Bank Transfer</option>
                <option value="cash">Cash</option>
                <option value="check">Check</option>
                <option value="paypal">PayPal</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Status *
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500"
              required
            >
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500"
              rows={3}
              placeholder="Optional notes about this payment..."
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-700 rounded-lg transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {saving ? 'Saving...' : payment ? 'Update Payment' : 'Create Payment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
