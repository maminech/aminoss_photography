'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FiDollarSign,
  FiTrendingUp,
  FiTrendingDown,
  FiShoppingBag,
  FiUsers,
  FiAlertCircle,
  FiCheckCircle,
  FiClock,
  FiCalendar,
  FiPieChart,
  FiBarChart2,
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';

interface FinancialStats {
  period: {
    startDate: string;
    endDate: string;
    label: string;
  };
  revenue: {
    total: number;
    paid: number;
    pending: number;
    invoiceCount: number;
    paidCount: number;
    partialCount: number;
    unpaidCount: number;
    growth: number;
  };
  expenses: {
    total: number;
    count: number;
    byCategory: Record<string, number>;
  };
  salaries: {
    total: number;
    count: number;
  };
  profit: {
    amount: number;
    margin: number;
  };
  insights: string[];
}

export default function FinancesPage() {
  const [stats, setStats] = useState<FinancialStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [periodFilter, setPeriodFilter] = useState('current-month');

  useEffect(() => {
    loadStats();
  }, [periodFilter]);

  const loadStats = async () => {
    try {
      setLoading(true);

      let url = '/api/finances/stats';
      const now = new Date();

      if (periodFilter === 'current-month') {
        const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        url += `?month=${month}`;
      } else if (periodFilter === 'last-month') {
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const month = `${lastMonth.getFullYear()}-${String(lastMonth.getMonth() + 1).padStart(2, '0')}`;
        url += `?month=${month}`;
      } else if (periodFilter === 'current-year') {
        url += `?year=${now.getFullYear()}`;
      } else if (periodFilter === 'last-year') {
        url += `?year=${now.getFullYear() - 1}`;
      }

      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch stats');

      const data = await res.json();
      setStats(data);
    } catch (error) {
      console.error('Error loading stats:', error);
      toast.error('Failed to load financial statistics');
    } finally {
      setLoading(false);
    }
  };

  if (loading || !stats) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const topExpenseCategories = Object.entries(stats.expenses.byCategory)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-900">
      {/* Header */}
      <header className="bg-white dark:bg-dark-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-30">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Financial Dashboard</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Complete financial overview and insights
              </p>
            </div>

            <div className="flex items-center gap-2">
              <FiCalendar className="text-gray-400" />
              <select
                value={periodFilter}
                onChange={(e) => setPeriodFilter(e.target.value)}
                className="px-4 py-2 bg-gray-50 dark:bg-dark-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="current-month">Current Month</option>
                <option value="last-month">Last Month</option>
                <option value="current-year">Current Year</option>
                <option value="last-year">Last Year</option>
              </select>
            </div>
          </div>
        </div>
      </header>

      <div className="px-6 py-6 space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Revenue */}
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-6 text-white shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <FiDollarSign className="w-8 h-8 opacity-80" />
              {stats.revenue.growth !== 0 && (
                <div className="flex items-center gap-1 text-sm">
                  {stats.revenue.growth > 0 ? (
                    <>
                      <FiTrendingUp className="w-4 h-4" />
                      <span>+{stats.revenue.growth.toFixed(1)}%</span>
                    </>
                  ) : (
                    <>
                      <FiTrendingDown className="w-4 h-4" />
                      <span>{stats.revenue.growth.toFixed(1)}%</span>
                    </>
                  )}
                </div>
              )}
            </div>
            <h3 className="text-sm font-medium opacity-90 mb-1">Total Revenue</h3>
            <p className="text-3xl font-bold">{stats.revenue.total.toFixed(2)} TND</p>
            <p className="text-sm opacity-80 mt-2">Paid: {stats.revenue.paid.toFixed(2)} TND</p>
          </div>

          {/* Profit */}
          <div className={`rounded-lg p-6 text-white shadow-lg ${
            stats.profit.amount >= 0
              ? 'bg-gradient-to-br from-green-500 to-green-600'
              : 'bg-gradient-to-br from-red-500 to-red-600'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <FiTrendingUp className="w-8 h-8 opacity-80" />
              <span className="text-sm font-medium">
                {stats.profit.margin.toFixed(1)}% margin
              </span>
            </div>
            <h3 className="text-sm font-medium opacity-90 mb-1">Net Profit</h3>
            <p className="text-3xl font-bold">{stats.profit.amount.toFixed(2)} TND</p>
            <p className="text-sm opacity-80 mt-2">
              {stats.profit.amount >= 0 ? 'Profitable period' : 'Operating at loss'}
            </p>
          </div>

          {/* Expenses */}
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg p-6 text-white shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <FiShoppingBag className="w-8 h-8 opacity-80" />
              <span className="text-sm">{stats.expenses.count} items</span>
            </div>
            <h3 className="text-sm font-medium opacity-90 mb-1">Total Expenses</h3>
            <p className="text-3xl font-bold">{stats.expenses.total.toFixed(2)} TND</p>
            <p className="text-sm opacity-80 mt-2">
              {((stats.expenses.total / stats.revenue.paid) * 100).toFixed(0)}% of revenue
            </p>
          </div>

          {/* Salaries */}
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-6 text-white shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <FiUsers className="w-8 h-8 opacity-80" />
              <span className="text-sm">{stats.salaries.count} payments</span>
            </div>
            <h3 className="text-sm font-medium opacity-90 mb-1">Team Salaries</h3>
            <p className="text-3xl font-bold">{stats.salaries.total.toFixed(2)} TND</p>
            <p className="text-sm opacity-80 mt-2">
              {((stats.salaries.total / stats.revenue.paid) * 100).toFixed(0)}% of revenue
            </p>
          </div>
        </div>

        {/* Smart Insights */}
        {stats.insights.length > 0 && (
          <div className="bg-white dark:bg-dark-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 mb-4">
              <FiBarChart2 className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Smart Insights & Recommendations
              </h2>
            </div>
            <div className="space-y-3">
              {stats.insights.map((insight, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700"
                >
                  <FiAlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-gray-700 dark:text-gray-300">{insight}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Revenue Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Invoice Status */}
          <div className="bg-white dark:bg-dark-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
              <FiPieChart className="w-5 h-5 text-primary" />
              Invoice Status
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="flex items-center gap-3">
                  <FiCheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">Paid</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{stats.revenue.paidCount} invoices</p>
                  </div>
                </div>
                <p className="text-lg font-bold text-green-600 dark:text-green-400">
                  {stats.revenue.paid.toFixed(2)} TND
                </p>
              </div>

              <div className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <div className="flex items-center gap-3">
                  <FiClock className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">Partial</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{stats.revenue.partialCount} invoices</p>
                  </div>
                </div>
                <p className="text-lg font-bold text-yellow-600 dark:text-yellow-400">
                  Partial
                </p>
              </div>

              <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <div className="flex items-center gap-3">
                  <FiAlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">Unpaid</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{stats.revenue.unpaidCount} invoices</p>
                  </div>
                </div>
                <p className="text-lg font-bold text-red-600 dark:text-red-400">
                  {stats.revenue.pending.toFixed(2)} TND
                </p>
              </div>
            </div>

            <Link
              href="/admin/invoices"
              className="mt-4 block w-full text-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition"
            >
              View All Invoices
            </Link>
          </div>

          {/* Expense Breakdown */}
          <div className="bg-white dark:bg-dark-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
              <FiBarChart2 className="w-5 h-5 text-primary" />
              Expense Breakdown
            </h2>
            {topExpenseCategories.length > 0 ? (
              <div className="space-y-3">
                {topExpenseCategories.map(([category, amount]) => {
                  const percentage = (amount / stats.expenses.total) * 100;
                  return (
                    <div key={category}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                          {category.replace('_', ' ')}
                        </span>
                        <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                          {amount.toFixed(2)} TND
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {percentage.toFixed(1)}% of total expenses
                      </p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                No expenses recorded for this period
              </p>
            )}

            <Link
              href="/admin/expenses"
              className="mt-4 block w-full text-center px-4 py-2 bg-gray-100 dark:bg-dark-700 text-gray-900 dark:text-gray-100 rounded-lg hover:bg-gray-200 dark:hover:bg-dark-600 transition"
            >
              Manage Expenses
            </Link>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/admin/invoices"
            className="bg-white dark:bg-dark-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 hover:border-primary transition group"
          >
            <FiDollarSign className="w-8 h-8 text-primary mb-3 group-hover:scale-110 transition" />
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Manage Invoices</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              View, create, and track all invoices
            </p>
          </Link>

          <Link
            href="/admin/expenses"
            className="bg-white dark:bg-dark-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 hover:border-primary transition group"
          >
            <FiShoppingBag className="w-8 h-8 text-primary mb-3 group-hover:scale-110 transition" />
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Track Expenses</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Record and categorize business expenses
            </p>
          </Link>

          <Link
            href="/admin/salaries"
            className="bg-white dark:bg-dark-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 hover:border-primary transition group"
          >
            <FiUsers className="w-8 h-8 text-primary mb-3 group-hover:scale-110 transition" />
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Team Salaries</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Manage team member payments
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
}
