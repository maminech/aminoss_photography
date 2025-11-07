'use client';

import { useSession } from 'next-auth/react';
import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Toaster } from 'react-hot-toast';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      // This will be called if the session is not authenticated
      // The redirect is handled by the middleware
    },
  });
  const router = useRouter();
  const pathname = usePathname();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      // Use window.location for a hard redirect to ensure clean state
      window.location.href = `/admin/login?callbackUrl=${encodeURIComponent(pathname)}`;
    }
  }, [status, pathname]);

  // Show loading state while checking authentication
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Show redirecting message while unauthenticated
  if (status === 'unauthenticated' || !session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Redirecting to login...</p>
        </div>
      </div>
    );
  }

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
