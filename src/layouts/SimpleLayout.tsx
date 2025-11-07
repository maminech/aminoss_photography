'use client';

import { ReactNode } from 'react';
import { usePathname } from 'next/navigation';

interface SimpleLayoutProps {
  children: ReactNode;
}

export default function SimpleLayout({ children }: SimpleLayoutProps) {
  const pathname = usePathname();

  // Check if this is an admin or client page (these have their own layouts)
  const isAdminPage = pathname?.startsWith('/admin');
  const isClientPage = pathname?.startsWith('/client');

  // For admin and client pages, just render children without wrapper
  if (isAdminPage || isClientPage) {
    return <>{children}</>;
  }

  // For public pages, render with Simple theme styling
  return (
    <div className="min-h-screen bg-white dark:bg-dark-900">
      {/* Simple theme uses the existing design - no wrapper needed */}
      {children}
    </div>
  );
}
