'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { 
  FiImage, FiUser, FiVideo, FiMail, FiCalendar, FiBook, FiFileText, FiUsers, FiHome, FiTrendingUp
} from 'react-icons/fi';
import { MdPalette } from 'react-icons/md';
import { motion } from 'framer-motion';
import PWAInstallPrompt from '@/components/PWAInstallPrompt';
import NotificationManager from '@/components/NotificationManager';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { useLanguage } from '@/contexts/LanguageContext';

interface DashboardStats {
  totalPhotos: number;
  totalVideos: number;
  featuredPhotos: number;
  totalClients: number;
  totalBookings: number;
  totalTeamMembers: number;
  unreadMessages: number;
  tracking: number;
}

export default function AdminDashboard() {
  const { data: session } = useSession();
  const { t } = useLanguage();
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

  return (
    <div>
      {/* Top Bar */}
      <header className="bg-white dark:bg-dark-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-20">
        <div className="flex items-center justify-between px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{t('admin.dashboard')}</h1>
          <div className="flex items-center space-x-4">
            <LanguageSwitcher />
            <Link
              href="/"
              target="_blank"
              className="hidden sm:block px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-700 rounded-lg transition"
            >
              {t('common.view')} Site
            </Link>
          </div>
        </div>
      </header>

      {/* Dashboard Content */}
      <main className="p-6">
          {/* Welcome Banner */}
          <motion.div
            className="bg-gradient-to-br from-primary/10 via-purple-50 to-pink-50 dark:from-primary/20 dark:via-purple-900/20 dark:to-pink-900/20 rounded-2xl p-8 mb-8 border-2 border-primary/20 dark:border-primary/30 shadow-xl"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  Welcome back, {session?.user?.name || 'Admin'}! 👋
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Here's what's happening with your photography business today.
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Quick Actions:</span>
                <Link
                  href="/admin/dashboard/photos"
                  className="px-4 py-2 bg-white dark:bg-dark-800 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-primary"
                >
                  📸 Upload Photos
                </Link>
              </div>
            </div>
          </motion.div>

          {/* Stats Grid - Optimized for most important metrics */}
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            {loading ? (
              <>
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className="bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-gray-200 dark:bg-dark-700 rounded-lg animate-pulse" />
                      {i < 2 && (
                        <div className="w-12 h-6 bg-gray-200 dark:bg-dark-700 rounded-full animate-pulse" />
                      )}
                    </div>
                    <div className="h-8 w-16 bg-gray-200 dark:bg-dark-700 rounded animate-pulse mb-2" />
                    <div className="h-4 w-24 bg-gray-200 dark:bg-dark-700 rounded animate-pulse" />
                  </div>
                ))}
              </>
            ) : (
              <>
                <StatCard
                  title="Leads"
                  value={stats.tracking.toString()}
                  icon={FiTrendingUp}
                  color="purple"
                  subtitle="New Tracking"
                  link="/admin/dashboard/leads"
                  priority
                />
                <StatCard
                  title="Messages"
                  value={stats.unreadMessages.toString()}
                  icon={FiMail}
                  color="red"
                  subtitle="Unread"
                  link="/admin/dashboard/messages"
                  priority
                />
                <StatCard
                  title="Total Photos"
                  value={stats.totalPhotos.toString()}
                  icon={FiImage}
                  color="blue"
                />
                <StatCard
                  title="Total Videos"
                  value={stats.totalVideos.toString()}
                  icon={FiVideo}
                  color="green"
                />
              </>
            )}
          </motion.div>

          {/* Notification Manager */}
          <div className="mb-8">
            <NotificationManager />
          </div>

          {/* Priority Quick Actions */}
          <motion.div 
            className="bg-white dark:bg-dark-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-8 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-2xl">⚡</span>
                </div>
                Priority Actions
              </h2>
              <span className="text-sm text-gray-500 dark:text-gray-400">Most important tasks</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              <ActionButton
                title="Leads & Tracking"
                description="View incomplete quote requests"
                href="/admin/dashboard/leads"
                icon={FiTrendingUp}
                color="purple"
              />
              <ActionButton
                title="Messages"
                description="Respond to client messages"
                href="/admin/dashboard/messages"
                icon={FiMail}
                color="red"
              />
              <ActionButton
                title="View Bookings"
                description="Manage confirmed bookings"
                href="/admin/dashboard/calendar"
                icon={FiCalendar}
                color="green"
              />
            </div>
          </motion.div>

          {/* Gallery Management Section */}
          <motion.div 
            className="bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-purple-900/20 dark:via-pink-900/20 dark:to-blue-900/20 rounded-2xl shadow-xl border-2 border-purple-300 dark:border-purple-600 p-8 mb-8 relative overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            {/* Decorative background */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-purple-300/20 to-pink-300/20 dark:from-purple-500/10 dark:to-pink-500/10 rounded-full blur-3xl -z-0"></div>
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                      <span className="text-2xl">🎨</span>
                    </div>
                    Gallery Management
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400 ml-15">
                    Manage your photos, videos, and visual content for both Simple & Professional modes
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                <ActionButton
                  title="Photos"
                  description="Upload & manage photos"
                  href="/admin/dashboard/photos"
                  icon={FiImage}
                  color="blue"
                />
                <ActionButton
                  title="Videos"
                  description="Upload & manage videos"
                  href="/admin/dashboard/videos"
                  icon={FiVideo}
                  color="green"
                />
                <ActionButton
                  title="Highlights"
                  description="Instagram-style stories"
                  href="/admin/highlights"
                  icon={FiImage}
                  color="purple"
                />
                <ActionButton
                  title="Albums"
                  description="Organize in collections"
                  href="/admin/dashboard/albums"
                  icon={FiImage}
                  color="orange"
                />
              </div>
            </div>
          </motion.div>

          {/* Additional Tools */}
          <motion.div 
            className="bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
              <span>🛠️</span>
              Additional Tools
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <ActionButton
                title="Customize Design"
                description="Change colors & layout"
                href="/admin/dashboard/design"
                icon={MdPalette}
                color="purple"
              />
              <ActionButton
                title="Photobooks"
                description="Review orders"
                href="/admin/dashboard/photobooks"
                icon={FiBook}
                color="orange"
              />
              <ActionButton
                title="Team Management"
                description="Manage team members"
                href="/admin/dashboard/team"
                icon={FiUsers}
                color="blue"
              />
            </div>
          </motion.div>
        </main>

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
  priority,
}: {
  title: string;
  value: string;
  icon: any;
  color: string;
  subtitle?: string;
  link?: string;
  priority?: boolean;
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
        <div className={`w-12 h-12 rounded-lg ${colors[color]} flex items-center justify-center transition-transform duration-300 ${priority ? 'group-hover:scale-110' : ''}`}>
          <Icon className="w-6 h-6" />
        </div>
        {priority && parseInt(value) > 0 && (
          <span className="px-2 py-1 text-xs font-bold rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white animate-pulse">
            NEW
          </span>
        )}
      </div>
      <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">{value}</h3>
      <p className="text-sm text-gray-600 dark:text-gray-400">
        {subtitle ? `${subtitle} ${title}` : title}
      </p>
    </>
  );

  const cardClasses = `bg-white dark:bg-dark-800 rounded-xl shadow-sm border p-6 transition-all duration-300 ${
    priority 
      ? 'border-purple-300 dark:border-purple-600 hover:shadow-lg hover:scale-105' 
      : 'border-gray-200 dark:border-gray-700 hover:shadow-md'
  }`;

  if (link) {
    return (
      <Link href={link} className={`${cardClasses} cursor-pointer group`}>
        {content}
      </Link>
    );
  }

  return (
    <div className={cardClasses}>
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
    orange: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400',
    red: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',
  };

  return (
    <Link
      href={href}
      className="block p-5 border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:border-primary hover:shadow-lg transition-all duration-300 group bg-white dark:bg-dark-800 hover:-translate-y-1"
    >
      <div className={`w-11 h-11 rounded-xl ${colors[color]} flex items-center justify-center mb-3 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
        <Icon className="w-5 h-5" />
      </div>
      <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-1 group-hover:text-primary transition-colors">{title}</h3>
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
