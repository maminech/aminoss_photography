'use client';

import { motion, useScroll, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

interface NavItem {
  label: string;
  href: string;
}

interface NovoNavigationProps {
  logo?: string;
  items: NavItem[];
  ctaLabel?: string;
  ctaHref?: string;
}

export default function NovoNavigation({ logo, items, ctaLabel, ctaHref }: NovoNavigationProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { scrollY } = useScroll();

  useEffect(() => {
    return scrollY.on('change', (latest) => {
      setIsScrolled(latest > 50);
    });
  }, [scrollY]);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const isActive = (href: string) => pathname === href;

  return (
    <>
      {/* Desktop & Mobile Navigation */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled
            ? 'bg-white shadow-lg py-4'
            : 'bg-transparent py-6'
        }`}
      >
        <div className="container mx-auto px-6 lg:px-12">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center group">
              {logo ? (
                <img src={logo} alt="Logo" className="h-8 md:h-10 transition-opacity duration-300 group-hover:opacity-80" />
              ) : (
                <span
                  className={`text-2xl md:text-3xl font-playfair font-bold tracking-tight transition-colors duration-300 ${
                    isScrolled ? 'text-[#1a1a1a]' : 'text-white'
                  }`}
                >
                  Aminoss
                </span>
              )}
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-10">
              {items.map((item, index) => (
                <Link
                  key={index}
                  href={item.href}
                  className={`relative text-sm uppercase tracking-[0.15em] font-lato font-medium transition-all duration-300 ${
                    isScrolled ? 'text-[#1a1a1a]' : 'text-white'
                  } ${isActive(item.href) ? 'opacity-100' : 'opacity-70 hover:opacity-100'}`}
                >
                  {item.label}
                  {isActive(item.href) && (
                    <motion.div
                      layoutId="activeNav"
                      className="absolute -bottom-1 left-0 right-0 h-[1px] bg-[#d4af37]"
                      transition={{ duration: 0.3 }}
                    />
                  )}
                </Link>
              ))}

              {/* CTA Button */}
              {ctaLabel && ctaHref && (
                <Link
                  href={ctaHref}
                  className="px-6 py-2.5 bg-[#d4af37] text-white text-sm uppercase tracking-[0.15em] font-lato font-medium hover:bg-[#c09d2f] transition-all duration-300 shadow-md hover:shadow-lg"
                >
                  {ctaLabel}
                </Link>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden w-10 h-10 flex flex-col items-center justify-center gap-1.5 group"
              aria-label="Toggle menu"
            >
              <motion.span
                animate={isMobileMenuOpen ? { rotate: 45, y: 7 } : { rotate: 0, y: 0 }}
                className={`w-6 h-0.5 transition-colors duration-300 ${
                  isScrolled ? 'bg-[#1a1a1a]' : 'bg-white'
                }`}
              />
              <motion.span
                animate={isMobileMenuOpen ? { opacity: 0 } : { opacity: 1 }}
                className={`w-6 h-0.5 transition-colors duration-300 ${
                  isScrolled ? 'bg-[#1a1a1a]' : 'bg-white'
                }`}
              />
              <motion.span
                animate={isMobileMenuOpen ? { rotate: -45, y: -7 } : { rotate: 0, y: 0 }}
                className={`w-6 h-0.5 transition-colors duration-300 ${
                  isScrolled ? 'bg-[#1a1a1a]' : 'bg-white'
                }`}
              />
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/95 z-40 lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <motion.div
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -50, opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
              className="flex flex-col items-center justify-center h-full gap-8"
              onClick={(e) => e.stopPropagation()}
            >
              {items.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 + 0.2 }}
                >
                  <Link
                    href={item.href}
                    className={`text-2xl font-playfair font-bold text-white tracking-tight transition-colors duration-300 ${
                      isActive(item.href) ? 'text-[#d4af37]' : 'hover:text-[#d4af37]'
                    }`}
                  >
                    {item.label}
                  </Link>
                </motion.div>
              ))}

              {ctaLabel && ctaHref && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: items.length * 0.1 + 0.3 }}
                  className="mt-4"
                >
                  <Link
                    href={ctaHref}
                    className="px-8 py-3 bg-[#d4af37] text-white text-sm uppercase tracking-[0.15em] font-lato font-medium hover:bg-[#c09d2f] transition-all duration-300 inline-block"
                  >
                    {ctaLabel}
                  </Link>
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
