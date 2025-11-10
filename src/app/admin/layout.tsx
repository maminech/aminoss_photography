'use client';

import PWALoadingScreen from '@/components/PWALoadingScreen';
import PWAUpdatePrompt from '@/components/PWAUpdatePrompt';
import OfflineIndicator from '@/components/OfflineIndicator';

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Admin pages don't need Navbar/Footer wrapper
  return (
    <>
      <PWALoadingScreen isPublic={false} />
      <PWAUpdatePrompt />
      <OfflineIndicator />
      {children}
    </>
  );
}
