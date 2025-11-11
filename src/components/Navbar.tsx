'use client';

import Link from 'next/link';
import Logo from './Logo';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMenu, FiX, FiUser, FiLogOut, FiSettings } from 'react-icons/fi';
import { useSession, signOut } from 'next-auth/react';
import { useLayoutTheme } from '@/contexts/ThemeContext';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/gallery', label: 'Gallery' },
  { href: '/videos', label: 'Videos' },
  { href: '/packs', label: 'Packages' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
  { href: '/download', label: 'Download App', highlight: true },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { data: session, status } = useSession(); // Check admin session
  const [isClient, setIsClient] = useState(false);
  const [clientName, setClientName] = useState('');
  const { currentTheme } = useLayoutTheme();

  // Check if user is a logged-in client
  useEffect(() => {
    const checkClientAuth = async () => {
      try {
        const res = await fetch('/api/client/auth/me');
        if (res.ok) {
          const data = await res.json();
          setIsClient(true);
          setClientName(data.client?.name || 'Client');
        } else {
          setIsClient(false);
        }
      } catch (error) {
        setIsClient(false);
      }
    };

    // Only check client auth if not admin and not on admin/client pages
    if (!session && !pathname.startsWith('/admin')) {
      checkClientAuth();
    }
  }, [session, pathname]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleClientLogout = async () => {
    try {
      await fetch('/api/client/auth/logout', { method: 'POST' });
      setIsClient(false);
      router.push('/');
      router.refresh();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleAdminLogout = async () => {
    await signOut({ redirect: false });
    router.push('/');
    router.refresh();
  };

  // Don't show navbar on admin/client dashboard pages
  if (pathname.startsWith('/admin/dashboard') || pathname.startsWith('/client/dashboard') || pathname.startsWith('/client/gallery')) {
    return null;
  }

  // Don't show navbar when in simple mode (Instagram-like experience)
  if (currentTheme === 'simple') {
    return null;
  }

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled 
          ? 'glass shadow-xl border-b' 
          : 'bg-white/30 dark:bg-dark-900/30 backdrop-blur-md'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 md:h-20">
          {/* Logo */}
          <Link href="/" className="group transform transition-transform hover:scale-105">
            <Logo size="md" variant="light" />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-all duration-200 relative group px-3 py-2 rounded-xl ${
                  link.highlight
                    ? 'bg-gradient-to-r from-[#c67548] to-[#8B5CF6] text-white shadow-lg hover:shadow-xl'
                    : pathname === link.href
                    ? 'text-primary-600 dark:text-primary-400 glass'
                    : 'text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:glass'
                }`}
              >
                {link.label}
                {pathname === link.href && !link.highlight && (
                  <motion.div
                    layoutId="activeNav"
                    className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full"
                    initial={false}
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
              </Link>
            ))}
            
            {/* Admin Session - Show Dashboard & Logout */}
            {session ? (
              <div className="flex items-center space-x-3">
                <Link
                  href="/admin/dashboard"
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-800 dark:bg-gray-700 text-white rounded-lg hover:bg-gray-900 dark:hover:bg-gray-600 transition-all"
                >
                  <FiSettings className="w-4 h-4" />
                  <span className="text-sm font-medium">Admin Panel</span>
                </Link>
                <button
                  onClick={handleAdminLogout}
                  className="flex items-center space-x-2 px-4 py-2 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
                >
                  <FiLogOut className="w-4 h-4" />
                  <span className="text-sm font-medium">Logout</span>
                </button>
              </div>
            ) : isClient ? (
              /* Client Session - Show Dashboard & Logout */
              <div className="flex items-center space-x-3">
                <Link
                  href="/client/dashboard"
                  className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-all"
                >
                  <FiUser className="w-4 h-4" />
                  <span className="text-sm font-medium">{clientName}</span>
                </Link>
                <button
                  onClick={handleClientLogout}
                  className="flex items-center space-x-2 px-4 py-2 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
                >
                  <FiLogOut className="w-4 h-4" />
                  <span className="text-sm font-medium">Logout</span>
                </button>
              </div>
            ) : (
              /* Guest - Show Client Login */
              <Link
                href="/client/login"
                className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-all"
              >
                <FiUser className="w-4 h-4" />
                <span className="text-sm font-medium">Client Login</span>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button - Larger touch target */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-3 -mr-3 text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-500 transition-colors"
            aria-label="Toggle menu"
          >
            {isOpen ? <FiX className="w-7 h-7" /> : <FiMenu className="w-7 h-7" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white dark:bg-dark-800 border-t border-gray-200 dark:border-gray-700"
          >
            <div className="px-4 py-6 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className={`block py-3.5 px-4 text-base font-medium rounded-lg transition-all ${
                    pathname === link.href
                      ? 'text-primary-600 dark:text-primary-500 bg-primary-50 dark:bg-primary-900/20'
                      : 'text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-500 hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              
              {/* Mobile Auth Buttons */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4 space-y-3">
                {session ? (
                  <>
                    <Link
                      href="/admin/dashboard"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center justify-center space-x-2 w-full px-4 py-3.5 bg-gray-800 dark:bg-gray-700 text-white rounded-lg hover:bg-gray-900 dark:hover:bg-gray-600 transition-colors active:scale-95"
                    >
                      <FiSettings className="w-5 h-5" />
                      <span className="text-base font-medium">Admin Panel</span>
                    </Link>
                    <button
                      onClick={() => {
                        handleAdminLogout();
                        setIsOpen(false);
                      }}
                      className="flex items-center justify-center space-x-2 w-full px-4 py-3.5 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors active:scale-95"
                    >
                      <FiLogOut className="w-5 h-5" />
                      <span className="text-base font-medium">Logout</span>
                    </button>
                  </>
                ) : isClient ? (
                  <>
                    <Link
                      href="/client/dashboard"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center justify-center space-x-2 w-full px-4 py-3.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors active:scale-95"
                    >
                      <FiUser className="w-5 h-5" />
                      <span className="text-base font-medium">{clientName}</span>
                    </Link>
                    <button
                      onClick={() => {
                        handleClientLogout();
                        setIsOpen(false);
                      }}
                      className="flex items-center justify-center space-x-2 w-full px-4 py-3.5 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors active:scale-95"
                    >
                      <FiLogOut className="w-5 h-5" />
                      <span className="text-base font-medium">Logout</span>
                    </button>
                  </>
                ) : (
                  <Link
                    href="/client/login"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center justify-center space-x-2 w-full px-4 py-3.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors active:scale-95"
                  >
                    <FiUser className="w-5 h-5" />
                    <span className="text-base font-medium">Client Login</span>
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
