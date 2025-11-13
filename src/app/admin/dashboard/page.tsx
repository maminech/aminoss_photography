'use client';

import { useState, useEffect } from 'react';
import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import { 
  FiImage, FiSettings, FiLogOut, FiMenu, FiX, 
  FiHome, FiFileText, FiUser, FiUsers, FiCheck, FiPackage, FiCalendar, FiVideo, FiMail, FiBook, FiInstagram,
  FiDollarSign, FiShoppingBag, FiTrendingUp
} from 'react-icons/fi';
import { MdPalette } from 'react-icons/md';
import PWAInstallPrompt from '@/components/PWAInstallPrompt';
import NotificationManager from '@/components/NotificationManager';

interface DashboardStats {
  totalPhotos: number;
  totalVideos: number;
  featuredPhotos: number;
  totalClients: number;
  totalBookings: number;
  totalTeamMembers: number;
  unreadMessages: number;
  tracking: number;
  // Financial stats
  totalRevenue?: number;
  unpaidInvoices?: number;
  monthlyExpenses?: number;
  profit?: number;
}

export default function AdminDashboard() {
  const { data: session } = useSession();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stats, setStats] = useState<DashboardStats>({
    totalPhotos: 0,
    totalVideos: 0,
    featuredPhotos: 0,
    totalClients: 0,
    totalBookings: 0,
    totalTeamMembers: 0,
    unreadMessages: 0,
    tracking: 0,
  });
  const [loading, setLoading] = useState(true);

  // Fetch dashboard stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/admin/dashboard/stats');
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const menuItems = [
    { name: 'Overview', icon: FiHome, href: '/admin/dashboard', active: true },
    { name: 'Albums', icon: FiImage, href: '/admin/dashboard/albums' },
    { name: 'Photos', icon: FiImage, href: '/admin/dashboard/photos' },
    { name: 'Videos & Reels', icon: FiVideo, href: '/admin/dashboard/videos' },
    { name: 'Design', icon: MdPalette, href: '/admin/dashboard/design' },
    { name: 'Content', icon: FiFileText, href: '/admin/dashboard/content' },
    { name: 'Team', icon: FiUsers, href: '/admin/dashboard/team' },
    { name: 'Instagram', icon: FiInstagram, href: '/admin/dashboard/instagram' },
    { name: 'Clients', icon: FiUser, href: '/admin/dashboard/clients' },
    { name: 'Packages (Devis)', icon: FiPackage, href: '/admin/dashboard/packs' },
    { name: 'Calendar & Bookings', icon: FiCalendar, href: '/admin/dashboard/calendar' },
    { name: 'Leads & Tracking', icon: FiTrendingUp, href: '/admin/dashboard/leads', badge: stats.tracking > 0 ? stats.tracking : undefined },
    { name: 'Bookings Tracking', icon: FiCheck, href: '/admin/bookings-tracking', badge: stats.tracking > 0 ? stats.tracking : undefined },
    { name: 'Calendar Integration', icon: FiCalendar, href: '/admin/dashboard/calendar-integration' },
    { name: 'Photobooks', icon: FiBook, href: '/admin/dashboard/photobooks' },
    { name: 'Remerciements', icon: FiMail, href: '/admin/dashboard/remerciements' },
    { name: 'Messages', icon: FiMail, href: '/admin/dashboard/messages', badge: stats.unreadMessages > 0 ? stats.unreadMessages : undefined },
    { name: 'Selected for Print', icon: FiCheck, href: '/admin/dashboard/selected-photos' },
    { 
      name: 'Finances', 
      icon: FiDollarSign, 
      href: '/admin/finances',
      badge: stats.unpaidInvoices && stats.unpaidInvoices > 0 ? stats.unpaidInvoices : undefined,
      subItems: [
        { name: 'Dashboard', href: '/admin/finances' },
        { name: 'Invoices', href: '/admin/invoices' },
        { name: 'Expenses', href: '/admin/expenses' },
        { name: 'Salaries', href: '/admin/salaries' },
      ]
    },
    { name: 'Settings', icon: FiSettings, href: '/admin/dashboard/settings' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-900">
      {/* Mobile Sidebar Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-64 bg-white dark:bg-dark-800 border-r border-gray-200 dark:border-gray-700 transform transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Admin Panel</h2>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            >
              <FiX className="w-6 h-6" />
            </button>
          </div>

          {/* User Info */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-semibold">
                {session?.user?.name?.[0] || 'A'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                  {session?.user?.name || 'Admin'}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {session?.user?.email}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const hasSubItems = 'subItems' in item && item.subItems && item.subItems.length > 0;
              
              return (
                <div key={item.name}>
                  <Link
                    href={item.href}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition ${
                      item.active
                        ? 'bg-primary text-white'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-700'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium flex-1">{item.name}</span>
                    {item.badge && item.badge > 0 && (
                      <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-red-500 text-white">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                  {hasSubItems && (
                    <div className="ml-4 mt-1 space-y-1 border-l-2 border-gray-200 dark:border-gray-700 pl-4">
                      {item.subItems!.map((subItem: any) => (
                        <Link
                          key={subItem.name}
                          href={subItem.href}
                          className="block px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary rounded-lg hover:bg-gray-50 dark:hover:bg-dark-700/50 transition"
                        >
                          {subItem.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          {/* Footer Actions */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <Link
              href="/"
              target="_blank"
              className="flex items-center space-x-3 px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-700 rounded-lg transition mb-2"
            >
              <FiHome className="w-5 h-5" />
              <span className="font-medium">View Site</span>
            </Link>
            <button
              onClick={() => signOut({ callbackUrl: '/admin/login' })}
              className="flex items-center space-x-3 px-4 py-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition w-full"
            >
              <FiLogOut className="w-5 h-5" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:ml-64">
        {/* Top Bar */}
        <header className="bg-white dark:bg-dark-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-30">
          <div className="flex items-center justify-between px-6 py-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            >
              <FiMenu className="w-6 h-6" />
            </button>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Dashboard Overview</h1>
            <div className="flex items-center space-x-4">
              <Link
                href="/"
                target="_blank"
                className="hidden sm:block px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-700 rounded-lg transition"
              >
                View Site
              </Link>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="p-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Total Photos"
              value={loading ? '...' : stats.totalPhotos.toString()}
              icon={FiImage}
              color="blue"
            />
            <StatCard
              title="Total Videos"
              value={loading ? '...' : stats.totalVideos.toString()}
              icon={FiVideo}
              color="green"
            />
            <StatCard
              title="Messages"
              value={loading ? '...' : stats.unreadMessages.toString()}
              icon={FiMail}
              color="red"
              subtitle="Unread"
              link="/admin/dashboard/messages"
            />
            <StatCard
              title="Clients"
              value={loading ? '...' : stats.totalClients.toString()}
              icon={FiUser}
              color="orange"
            />
          </div>

          {/* Notification Manager */}
          <div className="mb-8">
            <NotificationManager />
          </div>

          {/* Financial Stats (if available) */}
          {(stats.totalRevenue !== undefined || stats.unpaidInvoices !== undefined || stats.monthlyExpenses !== undefined || stats.profit !== undefined) && (
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  Financial Overview
                </h2>
                <Link
                  href="/admin/finances"
                  className="text-sm text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 font-medium"
                >
                  View Details →
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.totalRevenue !== undefined && (
                  <StatCard
                    title="Monthly Revenue"
                    value={`${stats.totalRevenue.toLocaleString()} TND`}
                    icon={FiTrendingUp}
                    color="blue"
                    subtitle="This month"
                  />
                )}
                {stats.unpaidInvoices !== undefined && (
                  <StatCard
                    title="Unpaid Invoices"
                    value={stats.unpaidInvoices.toString()}
                    icon={FiShoppingBag}
                    color="red"
                    subtitle="Awaiting payment"
                    link="/admin/invoices"
                  />
                )}
                {stats.monthlyExpenses !== undefined && (
                  <StatCard
                    title="Monthly Expenses"
                    value={`${stats.monthlyExpenses.toLocaleString()} TND`}
                    icon={FiDollarSign}
                    color="orange"
                    subtitle="This month"
                    link="/admin/expenses"
                  />
                )}
                {stats.profit !== undefined && (
                  <StatCard
                    title="Net Profit"
                    value={`${stats.profit.toLocaleString()} TND`}
                    icon={FiDollarSign}
                    color="green"
                    subtitle="Revenue - Expenses"
                  />
                )}
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Quick Actions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <ActionButton
                title="Create Invoice"
                description="Generate a new invoice for a client"
                href="/admin/invoices?action=create"
                icon={FiFileText}
                color="blue"
              />
              <ActionButton
                title="Add Expense"
                description="Record a new business expense"
                href="/admin/expenses?action=create"
                icon={FiDollarSign}
                color="red"
              />
              <ActionButton
                title="View Bookings"
                description="Manage client bookings and reservations"
                href="/admin/bookings"
                icon={FiCalendar}
                color="green"
              />
              <ActionButton
                title="Manage Photobooks"
                description="Review and process photobook orders"
                href="/admin/dashboard/photobooks"
                icon={FiBook}
                color="purple"
              />
              <ActionButton
                title="Sync Photos"
                description="Import photos from Cloudinary"
                href="/admin/dashboard/photos"
                icon={FiImage}
                color="blue"
              />
              <ActionButton
                title="Customize Design"
                description="Change colors, fonts, and layout"
                href="/admin/dashboard/design"
                icon={MdPalette}
                color="purple"
              />
              <ActionButton
                title="Edit Content"
                description="Update about, services, and contact"
                href="/admin/dashboard/content"
                icon={FiFileText}
                color="green"
              />
              <ActionButton
                title="Team Management"
                description="Manage team members and roles"
                href="/admin/team"
                icon={FiUsers}
                color="orange"
              />
              <ActionButton
                title="📱 Mobile App"
                description="Download admin app for Android"
                href="/admin/mobile-app"
                icon={FiHome}
                color="indigo"
              />
            </div>
          </div>

          {/* Getting Started Guide */}
          <div className="bg-gradient-to-r from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/10 rounded-xl p-6 border border-primary/20 dark:border-primary/30">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              🚀 Getting Started
            </h2>
            <div className="space-y-3">
              <Step
                number={1}
                title="Upload Photos to Cloudinary"
                description="Go to your Cloudinary account and upload photos to the 'aminoss-portfolio' folder"
              />
              <Step
                number={2}
                title="Sync Photos"
                description="Click 'Sync Photos from Cloudinary' above to automatically import all photos"
              />
              <Step
                number={3}
                title="Organize & Categorize"
                description="Manage photos, assign categories, and set featured images"
              />
              <Step
                number={4}
                title="Customize Your Site"
                description="Update design, content, and settings to match your brand"
              />
            </div>
          </div>
        </main>
      </div>

      {/* PWA Install Prompt */}
      <PWAInstallPrompt />
    </div>
  );
}

function StatCard({
  title,
  value,
  icon: Icon,
  color,
  subtitle,
  link,
}: {
  title: string;
  value: string;
  icon: any;
  color: string;
  subtitle?: string;
  link?: string;
}) {
  const colors: any = {
    blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
    green: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
    purple: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
    orange: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400',
    red: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',
  };

  const content = (
    <>
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 rounded-lg ${colors[color]} flex items-center justify-center`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
      <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">{value}</h3>
      <p className="text-sm text-gray-600 dark:text-gray-400">
        {subtitle ? `${subtitle} ${title}` : title}
      </p>
    </>
  );

  if (link) {
    return (
      <Link href={link} className="bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition cursor-pointer">
        {content}
      </Link>
    );
  }

  return (
    <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      {content}
    </div>
  );
}

function ActionButton({
  title,
  description,
  href,
  icon: Icon,
  color,
}: {
  title: string;
  description: string;
  href: string;
  icon: any;
  color: string;
}) {
  const colors: any = {
    blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
    purple: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
    green: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
  };

  return (
    <Link
      href={href}
      className="block p-4 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-primary hover:shadow-md transition group bg-white dark:bg-dark-800"
    >
      <div className={`w-10 h-10 rounded-lg ${colors[color]} flex items-center justify-center mb-3 group-hover:scale-110 transition`}>
        <Icon className="w-5 h-5" />
      </div>
      <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">{title}</h3>
      <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
    </Link>
  );
}

function Step({
  number,
  title,
  description,
}: {
  number: number;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start space-x-3">
      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-sm font-semibold">
        {number}
      </div>
      <div>
        <h4 className="font-medium text-gray-900 dark:text-gray-100">{title}</h4>
        <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
      </div>
    </div>
  );
}
