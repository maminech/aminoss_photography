'use client';

import { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiFilter, FiCalendar, FiDollarSign, FiUpload, FiX } from 'react-icons/fi';
import { toast } from 'react-hot-toast';

interface Expense {
  id: string;
  title: string;
  category: string;
  amount: number;
  paymentMethod?: string;
  receiptUrl?: string;
  vendor?: string;
  description?: string;
  date: string;
  isPaid: boolean;
  notes?: string;
  createdAt: string;
}

const EXPENSE_CATEGORIES = [
  { value: 'equipment', label: 'Equipment' },
  { value: 'software', label: 'Software' },
  { value: 'travel', label: 'Travel' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'utilities', label: 'Utilities' },
  { value: 'supplies', label: 'Supplies' },
  { value: 'other', label: 'Other' },
];

const PAYMENT_METHODS = [
  { value: 'cash', label: 'Cash' },
  { value: 'bank_transfer', label: 'Bank Transfer' },
  { value: 'credit_card', label: 'Credit Card' },
  { value: 'check', label: 'Check' },
];

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [filteredExpenses, setFilteredExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [monthFilter, setMonthFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  useEffect(() => {
    loadExpenses();
  }, []);

  useEffect(() => {
    filterExpenses();
  }, [expenses, categoryFilter, monthFilter]);

  const loadExpenses = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/expenses');
      if (!res.ok) throw new Error('Failed to fetch expenses');
      
      const data = await res.json();
      setExpenses(data);
    } catch (error) {
      console.error('Error loading expenses:', error);
      toast.error('Failed to load expenses');
    } finally {
      setLoading(false);
    }
  };

  const filterExpenses = () => {
    let filtered = [...expenses];

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(exp => exp.category === categoryFilter);
    }

    if (monthFilter) {
      filtered = filtered.filter(exp => {
        const expDate = new Date(exp.date);
        const filterDate = new Date(monthFilter);
        return (
          expDate.getMonth() === filterDate.getMonth() &&
          expDate.getFullYear() === filterDate.getFullYear()
        );
      });
    }

    setFilteredExpenses(filtered);
  };

  const deleteExpense = async (id: string) => {
    if (!confirm('Are you sure you want to delete this expense?')) return;

    const loadingToast = toast.loading('Deleting expense...');

    try {
      const res = await fetch(`/api/expenses?id=${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        toast.success('✅ Expense deleted', { id: loadingToast });
        loadExpenses();
      } else {
        toast.error('❌ Failed to delete expense', { id: loadingToast });
      }
    } catch (error) {
      console.error('Error deleting expense:', error);
      toast.error('❌ Failed to delete expense', { id: loadingToast });
    }
  };

  const openModal = (expense?: Expense) => {
    setEditingExpense(expense || null);
    setShowModal(true);
  };

  const closeModal = () => {
    setEditingExpense(null);
    setShowModal(false);
  };

  // Calculate stats
  const totalExpenses = filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0);
  const expensesByCategory = EXPENSE_CATEGORIES.map(cat => ({
    ...cat,
    total: filteredExpenses
      .filter(exp => exp.category === cat.value)
      .reduce((sum, exp) => sum + exp.amount, 0),
  })).filter(cat => cat.total > 0);

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      equipment: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      software: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      travel: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      marketing: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
      maintenance: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      utilities: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      supplies: 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200',
      other: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
    };
    return colors[category] || colors.other;
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
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Expense Management</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Track and manage business expenses
              </p>
            </div>
            <button
              onClick={() => openModal()}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition"
            >
              <FiPlus className="w-5 h-5" />
              New Expense
            </button>
          </div>
        </div>
      </header>

      <div className="px-6 py-6">
        {/* Stats Card */}
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg p-6 text-white shadow-lg mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90 mb-1">Total Expenses</p>
              <p className="text-3xl font-bold">{totalExpenses.toFixed(2)} TND</p>
              <p className="text-sm opacity-80 mt-2">{filteredExpenses.length} transactions</p>
            </div>
            <FiDollarSign className="w-16 h-16 opacity-20" />
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-dark-800 rounded-lg p-4 mb-4 border border-gray-200 dark:border-gray-700">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex items-center gap-2">
              <FiFilter className="text-gray-400" />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-4 py-2 bg-gray-50 dark:bg-dark-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="all">All Categories</option>
                {EXPENSE_CATEGORIES.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <FiCalendar className="text-gray-400" />
              <input
                type="month"
                value={monthFilter}
                onChange={(e) => setMonthFilter(e.target.value)}
                className="px-4 py-2 bg-gray-50 dark:bg-dark-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary"
              />
              {monthFilter && (
                <button
                  onClick={() => setMonthFilter('')}
                  className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  title="Clear filter"
                >
                  <FiX className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Expense Categories Breakdown */}
        {expensesByCategory.length > 0 && (
          <div className="bg-white dark:bg-dark-800 rounded-lg p-6 mb-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Expenses by Category
            </h2>
            <div className="space-y-3">
              {expensesByCategory.map(cat => {
                const percentage = (cat.total / totalExpenses) * 100;
                return (
                  <div key={cat.value}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                        {cat.label}
                      </span>
                      <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                        {cat.total.toFixed(2)} TND ({percentage.toFixed(1)}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Expenses Table */}
        <div className="bg-white dark:bg-dark-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          {filteredExpenses.length === 0 ? (
            <div className="text-center py-12">
              <FiDollarSign className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                No Expenses Found
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {categoryFilter !== 'all' || monthFilter
                  ? 'Try adjusting your filters'
                  : 'Start tracking expenses by clicking "New Expense"'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-dark-700 border-b border-gray-200 dark:border-gray-600">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Title
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Vendor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredExpenses.map((expense) => (
                    <tr
                      key={expense.id}
                      className="hover:bg-gray-50 dark:hover:bg-dark-700 transition"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        {new Date(expense.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {expense.title}
                        </div>
                        {expense.description && (
                          <div className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">
                            {expense.description}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getCategoryColor(expense.category)}`}>
                          {expense.category.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        {expense.vendor || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                          {expense.amount.toFixed(2)} TND
                        </div>
                        {expense.paymentMethod && (
                          <div className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                            {expense.paymentMethod.replace('_', ' ')}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openModal(expense)}
                            className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition"
                            title="Edit"
                          >
                            <FiEdit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteExpense(expense.id)}
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

      {/* Expense Modal */}
      {showModal && (
        <ExpenseModal
          expense={editingExpense}
          onClose={closeModal}
          onSave={loadExpenses}
        />
      )}
    </div>
  );
}

// Expense Modal Component
function ExpenseModal({
  expense,
  onClose,
  onSave,
}: {
  expense: Expense | null;
  onClose: () => void;
  onSave: () => void;
}) {
  const [formData, setFormData] = useState({
    title: expense?.title || '',
    category: expense?.category || 'other',
    amount: expense?.amount || 0,
    paymentMethod: expense?.paymentMethod || '',
    vendor: expense?.vendor || '',
    description: expense?.description || '',
    date: expense?.date ? new Date(expense.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    isPaid: expense?.isPaid ?? true,
    notes: expense?.notes || '',
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.amount) {
      toast.error('Please fill in required fields');
      return;
    }

    setSaving(true);
    const loadingToast = toast.loading(expense ? 'Updating expense...' : 'Creating expense...');

    try {
      const method = expense ? 'PUT' : 'POST';
      const body = expense ? { id: expense.id, ...formData } : formData;

      const res = await fetch('/api/expenses', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        toast.success(expense ? '✅ Expense updated!' : '✅ Expense created!', { id: loadingToast });
        onSave();
        onClose();
      } else {
        const error = await res.json();
        toast.error(error.error || '❌ Failed to save expense', { id: loadingToast });
      }
    } catch (error) {
      console.error('Error saving expense:', error);
      toast.error('❌ Failed to save expense', { id: loadingToast });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-dark-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-dark-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            {expense ? 'Edit Expense' : 'New Expense'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-700"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 bg-gray-50 dark:bg-dark-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="e.g., Camera lens"
              required
            />
          </div>

          {/* Category & Date */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-2 bg-gray-50 dark:bg-dark-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary"
                required
              >
                {EXPENSE_CATEGORIES.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-4 py-2 bg-gray-50 dark:bg-dark-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>
          </div>

          {/* Amount & Payment Method */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Amount (TND) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
                className="w-full px-4 py-2 bg-gray-50 dark:bg-dark-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="0.00"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Payment Method
              </label>
              <select
                value={formData.paymentMethod}
                onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                className="w-full px-4 py-2 bg-gray-50 dark:bg-dark-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Select method</option>
                {PAYMENT_METHODS.map(method => (
                  <option key={method.value} value={method.value}>{method.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Vendor */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Vendor
            </label>
            <input
              type="text"
              value={formData.vendor}
              onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
              className="w-full px-4 py-2 bg-gray-50 dark:bg-dark-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="e.g., Amazon, Local store"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 bg-gray-50 dark:bg-dark-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              placeholder="Additional details..."
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={2}
              className="w-full px-4 py-2 bg-gray-50 dark:bg-dark-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              placeholder="Internal notes..."
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition disabled:opacity-50"
            >
              {saving ? 'Saving...' : expense ? 'Update Expense' : 'Create Expense'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 dark:bg-dark-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-dark-600 transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
