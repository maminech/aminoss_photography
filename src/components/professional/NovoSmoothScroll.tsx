'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function NovoSmoothScroll() {
  const pathname = usePathname();

  useEffect(() => {
    // Smooth scroll behavior
    document.documentElement.style.scrollBehavior = 'smooth';

    // Scroll to top on route change
    window.scrollTo({ top: 0, behavior: 'smooth' });

    return () => {
      document.documentElement.style.scrollBehavior = 'auto';
    };
  }, [pathname]);

  useEffect(() => {
    // Handle hash links
    const handleHashClick = (e: MouseEvent) => {
      const target = e.target as HTMLAnchorElement;
      if (target.tagName === 'A' && target.hash) {
        const targetId = target.hash.slice(1);
        const targetElement = document.getElementById(targetId);
        
        if (targetElement) {
          e.preventDefault();
          const offsetTop = targetElement.offsetTop - 100; // Account for fixed header
          window.scrollTo({
            top: offsetTop,
            behavior: 'smooth',
          });
          
          // Update URL without jumping
          window.history.pushState(null, '', target.hash);
        }
      }
    };

    document.addEventListener('click', handleHashClick);
    
    return () => {
      document.removeEventListener('click', handleHashClick);
    };
  }, []);

  // Scroll to top button
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollButton = document.getElementById('scroll-to-top');
      
      if (scrollButton) {
        if (scrollTop > 300) {
          scrollButton.style.opacity = '1';
          scrollButton.style.pointerEvents = 'all';
        } else {
          scrollButton.style.opacity = '0';
          scrollButton.style.pointerEvents = 'none';
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <button
      id="scroll-to-top"
      onClick={scrollToTop}
      className="fixed bottom-6 right-6 z-50 w-12 h-12 bg-[#d4af37] text-white rounded-full shadow-lg hover:bg-[#c09d2f] transition-all duration-300 opacity-0 pointer-events-none flex items-center justify-center"
      aria-label="Scroll to top"
      style={{
        transition: 'opacity 0.3s ease-in-out, transform 0.3s ease-in-out',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      <svg
        className="w-6 h-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M5 10l7-7m0 0l7 7m-7-7v18"
        />
      </svg>
    </button>
  );
}
