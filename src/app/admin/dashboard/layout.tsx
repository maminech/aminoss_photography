'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Toaster } from 'react-hot-toast';
import { FiMenu } from 'react-icons/fi';
import AdminSidebar from '@/components/AdminSidebar';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Show loading state while checking authentication
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading session...</p>
        </div>
      </div>
    );
  }

  // If unauthenticated, show a message (middleware will redirect)
  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark-900">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400">Not authenticated. Redirecting...</p>
        </div>
      </div>
    );
  }

  // Authenticated - render the dashboard with sidebar
  return (
    <>
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 3000,
          className: 'dark:bg-dark-800 dark:text-gray-100',
          style: {
            background: 'var(--bg-secondary)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-primary)',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
            style: {
              background: 'var(--bg-secondary)',
              color: 'var(--text-primary)',
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
            style: {
              background: 'var(--bg-secondary)',
              color: 'var(--text-primary)',
            },
          },
        }}
      />
      
      <div className="min-h-screen bg-gray-50 dark:bg-dark-900">
        {/* Mobile Sidebar Backdrop */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden animate-fade-in"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Main Content */}
        <div className="lg:pl-64">
          {/* Mobile Menu Button */}
          <div className="lg:hidden fixed top-4 left-4 z-40">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-3 bg-white dark:bg-dark-800 rounded-lg shadow-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-700"
            >
              <FiMenu className="w-6 h-6" />
            </button>
          </div>

          {children}
        </div>
      </div>
    </>
  );
}
