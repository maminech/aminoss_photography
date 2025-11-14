'use client';

import { useState, useEffect } from 'react';
import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  FiImage, FiSettings, FiLogOut, FiX, 
  FiHome, FiFileText, FiUser, FiUsers, FiCheck, FiPackage, FiCalendar, FiVideo, FiMail, FiBook, FiInstagram,
  FiTrendingUp
} from 'react-icons/fi';
import { MdPalette } from 'react-icons/md';

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface NotificationCounts {
  unreadMessages: number;
  newPhotoSelections: number;
  newBookings: number;
  tracking: number;
}

export default function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [notifications, setNotifications] = useState<NotificationCounts>({
    unreadMessages: 0,
    newPhotoSelections: 0,
    newBookings: 0,
    tracking: 0,
  });

  // Fetch notifications every 30 seconds
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await fetch('/api/admin/dashboard/notifications');
        if (res.ok) {
          const data = await res.json();
          setNotifications(data);
        }
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // Refresh every 30s

    return () => clearInterval(interval);
  }, []);

  const menuItems = [
    { name: 'Overview', icon: FiHome, href: '/admin/dashboard' },
    { name: 'Leads & Quote Requests', icon: FiTrendingUp, href: '/admin/dashboard/leads', badge: notifications.tracking },
    { name: 'All Bookings (Grouped)', icon: FiCheck, href: '/admin/bookings-tracking', badge: notifications.newBookings },
    { name: 'Calendar & Confirmed', icon: FiCalendar, href: '/admin/dashboard/calendar' },
    { name: 'Messages', icon: FiMail, href: '/admin/dashboard/messages', badge: notifications.unreadMessages },
    { name: 'Clients', icon: FiUser, href: '/admin/dashboard/clients' },
    { name: 'Selected for Print', icon: FiCheck, href: '/admin/dashboard/selected-photos', badge: notifications.newPhotoSelections },
    { name: 'Albums', icon: FiImage, href: '/admin/dashboard/albums' },
    { name: 'Photos', icon: FiImage, href: '/admin/dashboard/photos' },
    { name: 'Videos & Reels', icon: FiVideo, href: '/admin/dashboard/videos' },
    { name: 'Instagram', icon: FiInstagram, href: '/admin/dashboard/instagram' },
    { name: 'Photobooks', icon: FiBook, href: '/admin/dashboard/photobooks' },
    { name: 'Packages (Devis)', icon: FiPackage, href: '/admin/dashboard/packs' },
    { name: 'Booking Settings', icon: FiPackage, href: '/admin/dashboard/booking-settings' },
    { name: 'Design', icon: MdPalette, href: '/admin/dashboard/design' },
    { name: 'Content', icon: FiFileText, href: '/admin/dashboard/content' },
    { name: 'Team', icon: FiUsers, href: '/admin/dashboard/team' },
    { name: 'Remerciements', icon: FiMail, href: '/admin/dashboard/remerciements' },
    { name: 'Calendar Integration', icon: FiCalendar, href: '/admin/dashboard/calendar-integration' },
    { name: 'Settings', icon: FiSettings, href: '/admin/dashboard/settings' },
  ];

  return (
    <aside
      className={`fixed top-0 left-0 z-50 h-full w-64 bg-white dark:bg-dark-800 border-r border-gray-200 dark:border-gray-700 transform transition-transform duration-300 lg:translate-x-0 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Admin Panel</h2>
          <button
            onClick={onClose}
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
            const isActive = pathname === item.href;
            
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => onClose()}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition relative ${
                  isActive
                    ? 'bg-primary text-white'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-700'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium flex-1">{item.name}</span>
                {item.badge && item.badge > 0 && (
                  <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-red-500 text-white animate-pulse">
                    {item.badge}
                  </span>
                )}
              </Link>
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
  );
}
