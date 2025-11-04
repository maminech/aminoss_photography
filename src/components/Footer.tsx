'use client';

import Link from 'next/link';
import Logo from './Logo';
import { FiInstagram, FiFacebook, FiYoutube, FiMail, FiHeart } from 'react-icons/fi';

const socialLinks = [
  { icon: FiInstagram, href: 'https://www.instagram.com/ami_noss.photography', label: 'Instagram' },
  { icon: FiFacebook, href: 'https://www.facebook.com/mohamed.chalghoum.266885', label: 'Facebook' },
  { icon: FiYoutube, href: 'https://youtube.com/@aminoss', label: 'YouTube' },
  { icon: FiMail, href: 'mailto:aminoss.photography@gmail.com', label: 'Email' },
];

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 dark:bg-dark-800 text-gray-300 dark:text-gray-400 border-t border-gray-800 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Brand */}
          <div>
            <div className="mb-4">
              <Logo size="md" variant="dark" />
            </div>
            <p className="text-sm text-gray-400 dark:text-gray-500">
              Professional photography and videography services in Tunisia.
              Capturing moments that last forever.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold text-white dark:text-gray-200 mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/gallery" className="text-sm hover:text-primary-400 dark:hover:text-primary-500 transition-colors">
                  Gallery
                </Link>
              </li>
              <li>
                <Link href="/videos" className="text-sm hover:text-primary-400 dark:hover:text-primary-500 transition-colors">
                  Videos
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-sm hover:text-primary-400 dark:hover:text-primary-500 transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-sm hover:text-primary-400 dark:hover:text-primary-500 transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Social & Contact */}
          <div>
            <h4 className="text-lg font-semibold text-white dark:text-gray-200 mb-4">Connect</h4>
            <div className="flex space-x-4 mb-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-gray-800 dark:bg-dark-700 rounded-full hover:bg-primary-600 dark:hover:bg-primary-600 transition-colors"
                  aria-label={social.label}
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
            <p className="text-sm text-gray-400 dark:text-gray-500">
              📍 Sousse, Tunisia<br />
              📧 aminoss.photography@gmail.com
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-gray-800 dark:border-gray-700 text-center text-sm">
          <p className="flex items-center justify-center gap-1">
            © {currentYear} Aminoss Photography. Made with{' '}
            <FiHeart className="text-red-500 w-4 h-4" /> in Tunisia.
          </p>
        </div>
      </div>
    </footer>
  );
}
