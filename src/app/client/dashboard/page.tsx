'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { FiLogOut, FiDownload, FiImage, FiCalendar, FiClock } from 'react-icons/fi';
import Logo from '@/components/Logo';

interface Gallery {
  id: string;
  name: string;
  description: string | null;
  coverImage: string | null;
  expiresAt: string | null;
  createdAt: string;
  _count: {
    photos: number;
  };
}

interface Client {
  id: string;
  name: string;
  email: string;
}

export default function ClientDashboardPage() {
  const router = useRouter();
  const [client, setClient] = useState<Client | null>(null);
  const [galleries, setGalleries] = useState<Gallery[]>([]);
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    // Middleware ensures we're authenticated, just fetch data
    loadClientData();
  }, []);

  const loadClientData = async () => {
    try {
      // Fetch client info
      const clientRes = await fetch('/api/client/auth/me');
      if (clientRes.ok) {
        const clientData = await clientRes.json();
        setClient(clientData.client);
        setAuthChecked(true);
      } else {
        // Session expired, logout
        handleLogout();
        return;
      }

      // Fetch galleries
      const galleriesRes = await fetch('/api/client/galleries');
      if (galleriesRes.ok) {
        const galleriesData = await galleriesRes.json();
        setGalleries(galleriesData);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      handleLogout();
    } finally {
      setLoading(false);
    }
  };

  const fetchGalleries = async () => {
    try {
      const res = await fetch('/api/client/galleries');
      if (res.ok) {
        const data = await res.json();
        setGalleries(data);
      }
    } catch (error) {
      console.error('Error fetching galleries:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/client/auth/logout', { method: 'POST' });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Always redirect to login after logout
      window.location.href = '/client/login';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const isExpiringSoon = (expiresAt: string | null) => {
    if (!expiresAt) return false;
    const daysLeft = Math.ceil(
      (new Date(expiresAt).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    );
    return daysLeft <= 7 && daysLeft > 0;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-900">
      {/* Header */}
      <header className="bg-white dark:bg-dark-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Logo size="sm" variant="light" />
              <div>
                <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Client Portal</h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">Welcome, {client?.name}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition"
            >
              <FiLogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Link
            href="#galleries"
            onClick={(e) => {
              e.preventDefault();
              document.getElementById('galleries-section')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="bg-white dark:bg-dark-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md hover:border-primary-300 dark:hover:border-primary-600 transition group"
          >
            <div className="flex items-center space-x-3">
              <div className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 p-3 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition">
                <FiImage className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">My Galleries</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{galleries.length} galleries</p>
              </div>
            </div>
          </Link>

          <Link
            href="/client/guest-uploads"
            className="bg-white dark:bg-dark-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md hover:border-primary-300 dark:hover:border-primary-600 transition group"
          >
            <div className="flex items-center space-x-3">
              <div className="bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 p-3 rounded-lg group-hover:bg-green-600 group-hover:text-white transition">
                <FiDownload className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">Guest Uploads</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">All photos from guests</p>
              </div>
            </div>
          </Link>

          {galleries.length > 0 && (
            <Link
              href="/client/photobooks"
              className="bg-white dark:bg-dark-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md hover:border-primary-300 dark:hover:border-primary-600 transition group"
            >
              <div className="flex items-center space-x-3">
                <div className="bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 p-3 rounded-lg group-hover:bg-purple-600 group-hover:text-white transition">
                  <FiCalendar className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">My Photobooks</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Create & manage</p>
                </div>
              </div>
            </Link>
          )}

          {galleries.length > 0 && (
            <Link
              href="/client/photobooths"
              className="bg-white dark:bg-dark-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md hover:border-primary-300 dark:hover:border-primary-600 transition group"
            >
              <div className="flex items-center space-x-3">
                <div className="bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 p-3 rounded-lg group-hover:bg-orange-600 group-hover:text-white transition">
                  <FiImage className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">Photobooth Prints</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">View edited photos</p>
                </div>
              </div>
            </Link>
          )}
        </div>

        <div className="mb-8" id="galleries-section">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Your Galleries</h2>
          <p className="text-gray-600 dark:text-gray-400">
            View and download your professional photos
          </p>
        </div>

        {galleries.length === 0 ? (
          <div className="bg-white dark:bg-dark-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
            <FiImage className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              No Galleries Yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Your photographer hasn't shared any galleries with you yet.
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500">
              Check back soon or contact your photographer for more information.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {galleries.map((gallery) => (
              <Link
                key={gallery.id}
                href={`/client/gallery/${gallery.id}`}
                className="group bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition"
              >
                {/* Cover Image */}
                <div className="relative aspect-video bg-gray-100 dark:bg-gray-800">
                  {gallery.coverImage ? (
                    <Image
                      src={gallery.coverImage}
                      alt={gallery.name}
                      fill
                      className="object-cover group-hover:scale-105 transition duration-300"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <FiImage className="w-16 h-16 text-gray-300 dark:text-gray-600" />
                    </div>
                  )}
                  
                  {/* Expiring Soon Badge */}
                  {isExpiringSoon(gallery.expiresAt) && (
                    <div className="absolute top-2 right-2 bg-orange-500 text-white px-2 py-1 rounded text-xs font-semibold">
                      Expiring Soon
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="p-5">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition">
                    {gallery.name}
                  </h3>
                  {gallery.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                      {gallery.description}
                    </p>
                  )}

                  <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center space-x-1">
                      <FiImage className="w-4 h-4" />
                      <span>{gallery._count.photos} photos</span>
                    </div>
                    {gallery.expiresAt && (
                      <div className="flex items-center space-x-1">
                        <FiClock className="w-4 h-4" />
                        <span>
                          Expires {formatDate(gallery.expiresAt)}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400 flex items-center space-x-1">
                    <FiCalendar className="w-3 h-3" />
                    <span>Added {formatDate(gallery.createdAt)}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
