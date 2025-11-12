'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { FiLogOut, FiBook, FiEdit, FiEye, FiClock, FiCheckCircle, FiPackage, FiTruck } from 'react-icons/fi';
import Logo from '@/components/Logo';

interface Photobook {
  id: string;
  title: string;
  format: string;
  status: string;
  coverPhotoUrl?: string;
  totalPages: number;
  submittedAt?: string;
  approvedAt?: string;
  createdAt: string;
  gallery: {
    id: string;
    name: string;
  };
}

export default function ClientPhotobooksPage() {
  const router = useRouter();
  const [client, setClient] = useState<any>(null);
  const [photobooks, setPhotobooks] = useState<Photobook[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Fetch client info
      const clientRes = await fetch('/api/client/auth/me');
      if (clientRes.ok) {
        const clientData = await clientRes.json();
        setClient(clientData.client);
      } else {
        handleLogout();
        return;
      }

      // Fetch photobooks
      const photobooksRes = await fetch('/api/client/photobooks');
      if (photobooksRes.ok) {
        const photobooksData = await photobooksRes.json();
        setPhotobooks(photobooksData.photobooks || []);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/client/auth/logout', { method: 'POST' });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      window.location.href = '/client/login';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'submitted': return 'bg-blue-100 text-blue-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'printing': return 'bg-purple-100 text-purple-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft': return <FiEdit className="w-4 h-4" />;
      case 'submitted': return <FiClock className="w-4 h-4" />;
      case 'approved': return <FiCheckCircle className="w-4 h-4" />;
      case 'printing': return <FiPackage className="w-4 h-4" />;
      case 'completed': return <FiTruck className="w-4 h-4" />;
      default: return <FiBook className="w-4 h-4" />;
    }
  };

  const getStatusMessage = (status: string) => {
    switch (status) {
      case 'draft': return 'Continue editing your photobook';
      case 'submitted': return 'Waiting for admin review';
      case 'approved': return 'Your photobook has been approved!';
      case 'printing': return 'Your photobook is being printed';
      case 'completed': return 'Your photobook is ready!';
      default: return '';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Logo size="sm" variant="light" />
              <div>
                <h1 className="text-lg font-semibold text-gray-900">My Photobooks</h1>
                <p className="text-xs text-gray-500">Welcome, {client?.name}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/client/dashboard"
                className="text-sm text-gray-600 hover:text-primary-600 transition"
              >
                Back to Dashboard
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:text-primary-600 transition"
              >
                <FiLogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">My Photobooks</h2>
          <p className="text-gray-600">
            Create and manage your custom photobooks
          </p>
        </div>

        {photobooks.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <FiBook className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No Photobooks Yet
            </h3>
            <p className="text-gray-600 mb-6">
              Create your first photobook from your gallery photos.
            </p>
            <Link
              href="/client/dashboard"
              className="inline-flex items-center px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
            >
              View Your Galleries
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {photobooks.map((photobook) => (
              <div
                key={photobook.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition"
              >
                {/* Cover Image */}
                <div className="relative aspect-[3/2] bg-gray-100">
                  {photobook.coverPhotoUrl ? (
                    <Image
                      src={photobook.coverPhotoUrl}
                      alt={photobook.title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <FiBook className="w-12 h-12 text-gray-400" />
                    </div>
                  )}
                  <div className={`absolute top-2 right-2 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${getStatusColor(photobook.status)}`}>
                    {getStatusIcon(photobook.status)}
                    {photobook.status}
                  </div>
                </div>

                {/* Content */}
                <div className="p-5">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 truncate">
                    {photobook.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    {photobook.gallery.name}
                  </p>

                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <span>{photobook.format}</span>
                    <span>{photobook.totalPages} pages</span>
                  </div>

                  {/* Status Message */}
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-700">
                      {getStatusMessage(photobook.status)}
                    </p>
                    {photobook.approvedAt && (
                      <p className="text-xs text-gray-500 mt-1">
                        Approved on {new Date(photobook.approvedAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    {photobook.status === 'draft' && (
                      <Link
                        href={`/client/gallery/${photobook.gallery.id}/photobook/${photobook.id}`}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
                      >
                        <FiEdit className="w-4 h-4" />
                        <span className="text-sm font-medium">Continue Editing</span>
                      </Link>
                    )}
                    {photobook.status !== 'draft' && (
                      <button
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
                      >
                        <FiEye className="w-4 h-4" />
                        <span className="text-sm font-medium">View</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Info Section */}
        {photobooks.length > 0 && (
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="font-semibold text-gray-900 mb-2">📖 Photobook Status Guide</h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-700">
              <div>
                <span className="font-medium">Draft:</span> Continue working on your photobook
              </div>
              <div>
                <span className="font-medium">Submitted:</span> Under review by our team
              </div>
              <div>
                <span className="font-medium">Approved:</span> Ready for printing
              </div>
              <div>
                <span className="font-medium">Printing:</span> Being printed
              </div>
              <div>
                <span className="font-medium">Completed:</span> Ready for pickup/delivery
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
