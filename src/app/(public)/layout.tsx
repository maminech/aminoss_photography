'use client';

import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ThemeWrapper from '@/components/ThemeWrapper';
import PWALoadingScreen from '@/components/PWALoadingScreen';
import PWAUpdatePrompt from '@/components/PWAUpdatePrompt';
import OfflineIndicator from '@/components/OfflineIndicator';
import GlobalOptionsButton from '@/components/GlobalOptionsButton';
import { usePathname } from 'next/navigation';
import { useLayoutTheme } from '@/contexts/ThemeContext';

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { currentTheme } = useLayoutTheme();
  
  // Check if we're in simple mode (Instagram-like experience)
  const isSimpleMode = currentTheme === 'simple';
  
  // Professional home page has its own custom navigation
  const isProfessionalHome = pathname === '/professional-home';
  
  // Check if we're on root page with professional theme (has its own nav)
  const isProfessionalRoot = pathname === '/' && currentTheme === 'professional';

  return (
    <ThemeWrapper>
      <PWALoadingScreen isPublic={true} />
      <PWAUpdatePrompt />
      <OfflineIndicator />
      {!isProfessionalHome && !isProfessionalRoot && <Navbar />}
      <main className={isSimpleMode || isProfessionalHome || isProfessionalRoot ? '' : currentTheme === 'professional' ? 'min-h-screen' : 'min-h-screen pt-16 md:pt-20'}>
        {children}
      </main>
      {!isSimpleMode && !isProfessionalHome && !isProfessionalRoot && <Footer />}
      {/* Global Options Button - available on all pages */}
      <GlobalOptionsButton />
    </ThemeWrapper>
  );
}
