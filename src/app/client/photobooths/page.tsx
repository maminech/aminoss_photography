'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { FiLogOut, FiDownload, FiImage, FiFilter, FiChevronDown } from 'react-icons/fi';
import Logo from '@/components/Logo';

interface PhotoboothPrint {
  id: string;
  photoboothPrintUrl: string;
  createdAt: string;
  gallery: {
    id: string;
    name: string;
  };
  guestName?: string;
  guestEmail?: string;
}

interface Gallery {
  id: string;
  name: string;
}

export default function PhotoboothPrintsPage() {
  const router = useRouter();
  const [client, setClient] = useState<any>(null);
  const [prints, setPrints] = useState<PhotoboothPrint[]>([]);
  const [galleries, setGalleries] = useState<Gallery[]>([]);
  const [selectedGallery, setSelectedGallery] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

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

      // Fetch photobooth prints
      const printsRes = await fetch('/api/client/photobooths');
      if (printsRes.ok) {
        const printsData = await printsRes.json();
        setPrints(printsData.prints || []);
        
        // Extract unique galleries
        const uniqueGalleries: Gallery[] = [];
        const galleryIds = new Set<string>();
        printsData.prints?.forEach((print: PhotoboothPrint) => {
          if (print.gallery && !galleryIds.has(print.gallery.id)) {
            galleryIds.add(print.gallery.id);
            uniqueGalleries.push(print.gallery);
          }
        });
        setGalleries(uniqueGalleries);
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

  const downloadImage = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('Error downloading image:', error);
      alert('Failed to download image');
    }
  };

  const downloadAll = async () => {
    setDownloading(true);
    try {
      const filteredPrints = selectedGallery === 'all' 
        ? prints 
        : prints.filter(p => p.gallery.id === selectedGallery);

      for (let i = 0; i < filteredPrints.length; i++) {
        const print = filteredPrints[i];
        await downloadImage(
          print.photoboothPrintUrl,
          `photobooth_${print.gallery.name.replace(/\s+/g, '_')}_${i + 1}.jpg`
        );
        // Small delay to avoid overwhelming the browser
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      alert('All photobooth prints downloaded!');
    } catch (error) {
      console.error('Error downloading all:', error);
      alert('Failed to download all images');
    } finally {
      setDownloading(false);
    }
  };

  const filteredPrints = selectedGallery === 'all' 
    ? prints 
    : prints.filter(p => p.gallery.id === selectedGallery);

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
                <h1 className="text-lg font-semibold text-gray-900">Photobooth Prints</h1>
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
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">🎉 Photobooth Prints</h2>
              <p className="text-gray-600">
                All your edited photobooth photos in one place
              </p>
            </div>
            {filteredPrints.length > 0 && (
              <button
                onClick={downloadAll}
                disabled={downloading}
                className="flex items-center space-x-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition disabled:opacity-50"
              >
                <FiDownload className="w-5 h-5" />
                <span>{downloading ? 'Downloading...' : `Download All (${filteredPrints.length})`}</span>
              </button>
            )}
          </div>

          {/* Filter by Gallery */}
          {galleries.length > 1 && (
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <FiFilter className="w-5 h-5 text-gray-400" />
                <span className="text-sm font-medium text-gray-700">Filter by Gallery:</span>
              </div>
              <div className="relative">
                <select
                  value={selectedGallery}
                  onChange={(e) => setSelectedGallery(e.target.value)}
                  className="appearance-none pl-4 pr-10 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                >
                  <option value="all">All Galleries ({prints.length})</option>
                  {galleries.map(gallery => (
                    <option key={gallery.id} value={gallery.id}>
                      {gallery.name} ({prints.filter(p => p.gallery.id === gallery.id).length})
                    </option>
                  ))}
                </select>
                <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>
          )}
        </div>

        {/* Prints Grid */}
        {filteredPrints.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-primary-500 to-purple-600 rounded-full flex items-center justify-center">
              <FiImage className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No Photobooth Prints Yet
            </h3>
            <p className="text-gray-600 mb-6">
              Photobooth prints from your events will appear here.
            </p>
            <Link
              href="/client/dashboard"
              className="inline-flex items-center px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
            >
              Back to Dashboard
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredPrints.map((print, index) => (
              <div
                key={print.id}
                className="group bg-white rounded-xl shadow-sm border-2 border-primary-200 overflow-hidden hover:shadow-xl hover:border-primary-400 transition"
              >
                {/* Image */}
                <div className="relative aspect-[3/4] bg-gray-100">
                  <Image
                    src={print.photoboothPrintUrl}
                    alt={`Photobooth print ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                  {/* Photobooth Badge */}
                  <div className="absolute top-2 right-2 bg-gradient-to-r from-primary-500 to-purple-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                    📸 PHOTOBOOTH
                  </div>
                  {/* Download Button Overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <button
                      onClick={() => downloadImage(
                        print.photoboothPrintUrl,
                        `photobooth_${print.gallery.name.replace(/\s+/g, '_')}_${index + 1}.jpg`
                      )}
                      className="flex items-center space-x-2 px-4 py-2 bg-white text-gray-900 rounded-lg hover:bg-gray-100 transition"
                    >
                      <FiDownload className="w-4 h-4" />
                      <span className="font-medium">Download</span>
                    </button>
                  </div>
                </div>

                {/* Info */}
                <div className="p-4 bg-gradient-to-br from-primary-50 to-purple-50">
                  <h3 className="font-semibold text-gray-900 mb-1">
                    {print.gallery.name}
                  </h3>
                  {print.guestName && (
                    <p className="text-sm text-gray-600 mb-2">
                      By: {print.guestName}
                    </p>
                  )}
                  <p className="text-xs text-gray-500">
                    {new Date(print.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Info Box */}
        {filteredPrints.length > 0 && (
          <div className="mt-8 bg-gradient-to-r from-primary-50 to-purple-50 border border-primary-200 rounded-lg p-6">
            <h3 className="font-semibold text-gray-900 mb-2">💡 About Photobooth Prints</h3>
            <p className="text-sm text-gray-700">
              These are special edited photos created from your guest uploads. Each image has been 
              processed with photobooth-style effects and is ready to download and share!
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
