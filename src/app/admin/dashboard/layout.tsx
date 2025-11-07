'use client';

import { useSession } from 'next-auth/react';
import { Toaster } from 'react-hot-toast';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();

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

  // Authenticated - render the dashboard
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
      {children}
    </>
  );
}
