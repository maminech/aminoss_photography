'use client';

import { ReactNode, useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import NovoPreloaderEnhanced from '@/components/professional/NovoPreloaderEnhanced';
import NovoPageTransitionEnhanced from '@/components/professional/NovoPageTransitionEnhanced';
import NovoSmoothScroll from '@/components/professional/NovoSmoothScroll';

interface ProfessionalLayoutProps {
  children: ReactNode;
}

export default function ProfessionalLayout({ children }: ProfessionalLayoutProps) {
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);
  const [showContent, setShowContent] = useState(false);

  // Check if this is an admin or client page (these have their own layouts)
  const isAdminPage = pathname?.startsWith('/admin');
  const isClientPage = pathname?.startsWith('/client');

  // Handle initial loading with Novo timing
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
      setTimeout(() => {
        setShowContent(true);
      }, 100);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  // For admin and client pages, just render children without wrapper
  if (isAdminPage || isClientPage) {
    return <>{children}</>;
  }

  // For public pages, render with Professional theme styling
  return (
    <div className="professional-theme site" id="all">
      {/* Novo Enhanced Preloader */}
      <NovoPreloaderEnhanced
        type="words"
        staticWord="Innov8"
        dynamicWords={['Photography', 'Moments', 'Memories', 'Stories', 'Beauty']}
        onComplete={() => setShowContent(true)}
      />

      {/* Novo Page Transitions */}
      <NovoPageTransitionEnhanced />

      {/* Novo Smooth Scroll */}
      <NovoSmoothScroll />

      {/* Professional Theme Wrapper */}
      <div className="min-h-screen bg-white site-content">
        <style jsx global>{`
          html.professional-theme {
            scroll-behavior: smooth;
          }

          .professional-theme .site {
            position: relative;
            overflow-x: hidden;
          }
          
          .professional-theme h1,
          .professional-theme h2,
          .professional-theme h3,
          .professional-theme h4,
          .professional-theme h5,
          .professional-theme h6 {
            font-family: var(--font-playfair), 'Playfair Display', Georgia, serif;
            font-weight: 700;
            letter-spacing: -0.02em;
            line-height: 1.2;
            margin: 0;
          }
          
          .professional-theme body,
          .professional-theme p,
          .professional-theme span,
          .professional-theme a,
          .professional-theme button,
          .professional-theme input,
          .professional-theme textarea,
          .professional-theme li {
            font-family: var(--font-lato), 'Lato', system-ui, sans-serif;
            font-weight: 400;
            line-height: 1.6;
          }

          .professional-theme {
            --novo-black: #1a1a1a;
            --novo-gold: #d4af37;
            --novo-bronze: #8b7355;
            --novo-white: #ffffff;
            --novo-gray: #f5f5f5;
          }

          .professional-theme .btn-primary {
            background-color: var(--novo-gold);
            color: white;
            padding: 15px 40px;
            text-transform: uppercase;
            letter-spacing: 0.2em;
            font-size: 12px;
            font-weight: 600;
            transition: all 300ms cubic-bezier(0.4, 0, 0.2, 1);
            border: none;
            cursor: pointer;
            display: inline-block;
            text-align: center;
            line-height: 1;
          }

          .professional-theme .btn-primary:hover {
            background-color: var(--novo-black);
            transform: translateY(-2px);
            box-shadow: 0 10px 25px rgba(212, 175, 55, 0.3);
          }

          .professional-theme .btn-secondary {
            background-color: transparent;
            color: var(--novo-black);
            padding: 15px 40px;
            text-transform: uppercase;
            letter-spacing: 0.2em;
            font-size: 12px;
            font-weight: 600;
            transition: all 300ms cubic-bezier(0.4, 0, 0.2, 1);
            border: 1px solid var(--novo-black);
            cursor: pointer;
            display: inline-block;
            text-align: center;
            line-height: 1;
          }

          .professional-theme .btn-secondary:hover {
            background-color: var(--novo-black);
            color: white;
            transform: translateY(-2px);
          }

          .professional-theme ::-webkit-scrollbar {
            width: 8px;
            height: 8px;
          }

          .professional-theme ::-webkit-scrollbar-track {
            background: #f1f1f1;
          }

          .professional-theme ::-webkit-scrollbar-thumb {
            background: var(--novo-gold);
            border-radius: 4px;
          }

          .professional-theme ::selection {
            background: var(--novo-gold);
            color: white;
          }
        `}</style>

        <div
          style={{
            opacity: showContent ? 1 : 0,
            transition: 'opacity 600ms cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
