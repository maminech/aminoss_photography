'use client';

import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ThemeWrapper from '@/components/ThemeWrapper';
import { usePathname } from 'next/navigation';
import { useLayoutTheme } from '@/contexts/ThemeContext';

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { currentTheme } = useLayoutTheme();
  
  // Check if we're on homepage in simple mode
  const isSimpleHomepage = pathname === '/' && currentTheme === 'simple';

  return (
    <ThemeWrapper>
      <Navbar />
      <main className={isSimpleHomepage ? '' : 'min-h-screen pt-16 md:pt-20'}>
        {children}
      </main>
      {!isSimpleHomepage && <Footer />}
    </ThemeWrapper>
  );
}
