'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiLogOut, 
  FiDownload, 
  FiImage, 
  FiFilter, 
  FiChevronDown,
  FiHeart,
  FiCalendar,
  FiMessageSquare,
  FiCamera,
  FiZoomIn
} from 'react-icons/fi';
import Logo from '@/components/Logo';

interface PhotoboothPrint {
  id: string;
  photoboothPrintUrl: string;
  createdAt: string;
  gallery: {
    id: string;
    name: string;
    eventDate?: string;
    brideName?: string;
    groomName?: string;
  };
  guestName?: string;
  guestEmail?: string;
  message?: string;
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
  const [selectedPrint, setSelectedPrint] = useState<PhotoboothPrint | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'polaroid'>('polaroid');

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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 dark:from-dark-900 dark:via-dark-800 dark:to-dark-900">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="relative w-24 h-24 mx-auto mb-4">
            <div className="absolute inset-0 border-4 border-pink-200 dark:border-pink-900 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-pink-600 border-t-transparent rounded-full animate-spin"></div>
            <FiCamera className="absolute inset-0 m-auto w-10 h-10 text-pink-600" />
          </div>
          <p className="text-gray-600 dark:text-gray-300 animate-pulse">Loading your photobooth memories...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 dark:from-dark-900 dark:via-dark-800 dark:to-dark-900">
      {/* Header */}
      <motion.header 
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white/80 dark:bg-dark-800/80 backdrop-blur-xl border-b border-pink-200 dark:border-pink-900/30 sticky top-0 z-30 shadow-lg"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Logo size="sm" variant="light" />
              <div>
                <h1 className="text-lg font-bold bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
                  📸 Photobooth Prints
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">Welcome, {client?.name}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  href="/client/dashboard"
                  className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:text-pink-600 dark:hover:text-pink-400 transition rounded-lg hover:bg-pink-50 dark:hover:bg-pink-900/20"
                >
                  Back to Dashboard
                </Link>
              </motion.div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleLogout}
                className="flex items-center space-x-2 px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-pink-600 dark:hover:text-pink-400 transition rounded-lg hover:bg-pink-50 dark:hover:bg-pink-900/20"
              >
                <FiLogOut className="w-4 h-4" />
                <span className="text-sm">Sign Out</span>
              </motion.button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 rounded-2xl p-8 text-white shadow-2xl relative overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-2xl"></div>
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <motion.h2 
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="text-4xl font-bold mb-2 flex items-center gap-3"
                  >
                    <FiCamera className="w-10 h-10" />
                    Photobooth Memories
                  </motion.h2>
                  <motion.p 
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-pink-100 text-lg"
                  >
                    Beautiful framed photos with wedding details and guest messages
                  </motion.p>
                </div>
                {filteredPrints.length > 0 && (
                  <motion.button
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.3, type: 'spring' }}
                    whileHover={{ scale: 1.05, rotate: 2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={downloadAll}
                    disabled={downloading}
                    className="flex items-center space-x-2 px-6 py-3 bg-white text-pink-600 rounded-xl hover:bg-pink-50 transition disabled:opacity-50 shadow-xl font-semibold"
                  >
                    <FiDownload className="w-5 h-5" />
                    <span>{downloading ? 'Downloading...' : `Download All (${filteredPrints.length})`}</span>
                  </motion.button>
                )}
              </div>

              {/* Stats */}
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="grid grid-cols-3 gap-4"
              >
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center">
                  <div className="text-3xl font-bold">{filteredPrints.length}</div>
                  <div className="text-sm text-pink-100">Total Prints</div>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center">
                  <div className="text-3xl font-bold">{galleries.length}</div>
                  <div className="text-sm text-pink-100">Galleries</div>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center">
                  <div className="text-3xl font-bold">📸</div>
                  <div className="text-sm text-pink-100">Ready to Print</div>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Filters & View Mode */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mb-6 flex items-center justify-between flex-wrap gap-4"
        >
          {/* Gallery Filter */}
          {galleries.length > 1 && (
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-gray-700 dark:text-gray-300">
                <FiFilter className="w-5 h-5" />
                <span className="text-sm font-medium">Filter:</span>
              </div>
              <div className="relative">
                <select
                  value={selectedGallery}
                  onChange={(e) => setSelectedGallery(e.target.value)}
                  className="appearance-none pl-4 pr-10 py-2.5 bg-white dark:bg-dark-800 border-2 border-pink-200 dark:border-pink-900/30 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 dark:text-white text-sm font-medium shadow-sm"
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

          {/* View Mode Toggle */}
          <div className="flex items-center space-x-2 bg-white dark:bg-dark-800 rounded-xl p-1 shadow-sm border-2 border-pink-200 dark:border-pink-900/30">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setViewMode('polaroid')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                viewMode === 'polaroid'
                  ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-lg'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-700'
              }`}
            >
              📷 Polaroid
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setViewMode('grid')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                viewMode === 'grid'
                  ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-lg'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-700'
              }`}
            >
              ⊞ Grid
            </motion.button>
          </div>
        </motion.div>

        {/* Prints Display */}
        {filteredPrints.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-dark-800 rounded-2xl shadow-xl border-2 border-pink-200 dark:border-pink-900/30 p-12 text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-pink-500 via-purple-500 to-blue-500 rounded-full flex items-center justify-center shadow-2xl"
            >
              <FiCamera className="w-12 h-12 text-white" />
            </motion.div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
              No Photobooth Prints Yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
              When guests upload photos and select one for printing, beautiful photobooth-style prints will appear here with wedding details and guest messages!
            </p>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                href="/client/dashboard"
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-xl hover:shadow-2xl transition font-semibold"
              >
                Back to Dashboard
              </Link>
            </motion.div>
          </motion.div>
        ) : viewMode === 'polaroid' ? (
          // Polaroid View
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredPrints.map((print, index) => (
              <motion.div
                key={print.id}
                initial={{ opacity: 0, y: 20, rotate: 0 }}
                animate={{ opacity: 1, y: 0, rotate: index % 2 === 0 ? -2 : 2 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ 
                  scale: 1.05, 
                  rotate: 0, 
                  zIndex: 10,
                  transition: { duration: 0.2 }
                }}
                className="group cursor-pointer"
                onClick={() => setSelectedPrint(print)}
              >
                {/* Polaroid Frame */}
                <div className="bg-white dark:bg-gray-100 rounded-lg shadow-2xl p-4 pb-16 hover:shadow-pink-300/50 transition-all duration-300">
                  {/* Photo */}
                  <div className="relative aspect-square bg-gray-200 mb-3 overflow-hidden">
                    <Image
                      src={print.photoboothPrintUrl}
                      alt={`Photobooth from ${print.gallery.name}`}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {/* Zoom overlay */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <div className="bg-white/90 backdrop-blur-sm rounded-full p-3">
                        <FiZoomIn className="w-6 h-6 text-pink-600" />
                      </div>
                    </div>
                  </div>

                  {/* Handwritten style caption */}
                  <div className="text-center space-y-1">
                    <p className="text-sm font-handwriting text-gray-700">
                      {print.gallery.name}
                    </p>
                    {print.guestName && (
                      <p className="text-xs text-gray-500 font-handwriting">
                        from {print.guestName}
                      </p>
                    )}
                  </div>

                  {/* Corner curl effect */}
                  <div className="absolute bottom-2 right-2 w-8 h-8 bg-gradient-to-br from-gray-200 to-gray-300 opacity-30 rounded-tl-lg shadow-inner"></div>
                </div>

                {/* Download button floating */}
                <motion.button
                  initial={{ opacity: 0 }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    downloadImage(
                      print.photoboothPrintUrl,
                      `photobooth_${print.gallery.name.replace(/\s+/g, '_')}_${index + 1}.jpg`
                    );
                  }}
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-pink-600 hover:bg-pink-700 text-white p-2 rounded-full shadow-lg"
                >
                  <FiDownload className="w-4 h-4" />
                </motion.button>
              </motion.div>
            ))}
          </div>
        ) : (
          // Grid View
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPrints.map((print, index) => (
              <motion.div
                key={print.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ y: -8 }}
                className="group bg-white dark:bg-dark-800 rounded-2xl shadow-xl border-2 border-pink-200 dark:border-pink-900/30 overflow-hidden cursor-pointer"
                onClick={() => setSelectedPrint(print)}
              >
                {/* Image */}
                <div className="relative aspect-[3/4] bg-gray-100">
                  <Image
                    src={print.photoboothPrintUrl}
                    alt={`Photobooth from ${print.gallery.name}`}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {/* Badge */}
                  <div className="absolute top-3 right-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
                    <FiCamera className="w-3 h-3" />
                    PHOTOBOOTH
                  </div>
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          downloadImage(
                            print.photoboothPrintUrl,
                            `photobooth_${print.gallery.name.replace(/\s+/g, '_')}_${index + 1}.jpg`
                          );
                        }}
                        className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-xl hover:bg-white/30 transition border border-white/30"
                      >
                        <FiDownload className="w-4 h-4" />
                        <span className="font-semibold">Download</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Info */}
                <div className="p-4 bg-gradient-to-br from-pink-50 to-purple-50 dark:from-pink-900/20 dark:to-purple-900/20">
                  <h3 className="font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                    <FiHeart className="w-4 h-4 text-pink-500" />
                    {print.gallery.name}
                  </h3>
                  {print.guestName && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1 flex items-center gap-2">
                      <FiMessageSquare className="w-3 h-3" />
                      By: {print.guestName}
                    </p>
                  )}
                  <p className="text-xs text-gray-500 dark:text-gray-500 flex items-center gap-2">
                    <FiCalendar className="w-3 h-3" />
                    {new Date(print.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Info Box */}
        {filteredPrints.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-8 bg-gradient-to-r from-pink-50 via-purple-50 to-blue-50 dark:from-pink-900/20 dark:via-purple-900/20 dark:to-blue-900/20 border-2 border-pink-200 dark:border-pink-900/30 rounded-2xl p-6 shadow-lg"
          >
            <h3 className="font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <FiCamera className="w-5 h-5 text-pink-500" />
              About Photobooth Prints
            </h3>
            <div className="grid md:grid-cols-3 gap-4 text-sm text-gray-700 dark:text-gray-300">
              <div className="flex items-start gap-3">
                <div className="bg-pink-500 text-white p-2 rounded-lg">
                  <FiImage className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-semibold mb-1">Professional Framing</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Each photo is beautifully framed with wedding details</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="bg-purple-500 text-white p-2 rounded-lg">
                  <FiMessageSquare className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-semibold mb-1">Guest Messages</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Includes heartfelt messages from your guests</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="bg-blue-500 text-white p-2 rounded-lg">
                  <FiDownload className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-semibold mb-1">Print Ready</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">High-quality 4x6" format ready to print</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </main>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {selectedPrint && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedPrint(null)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="relative max-w-4xl w-full"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <button
                onClick={() => setSelectedPrint(null)}
                className="absolute -top-12 right-0 text-white hover:text-pink-400 transition"
              >
                <span className="text-4xl">×</span>
              </button>

              {/* Image */}
              <div className="relative aspect-[3/4] w-full max-w-2xl mx-auto rounded-2xl overflow-hidden shadow-2xl">
                <Image
                  src={selectedPrint.photoboothPrintUrl}
                  alt="Photobooth print"
                  fill
                  className="object-contain"
                />
              </div>

              {/* Details */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="mt-6 bg-white/10 backdrop-blur-lg rounded-2xl p-6 text-white"
              >
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                      <FiHeart className="text-pink-400" />
                      {selectedPrint.gallery.name}
                    </h3>
                    {selectedPrint.guestName && (
                      <p className="text-pink-200 mb-2 flex items-center gap-2">
                        <FiMessageSquare className="w-4 h-4" />
                        From: {selectedPrint.guestName}
                      </p>
                    )}
                    <p className="text-gray-300 text-sm flex items-center gap-2">
                      <FiCalendar className="w-4 h-4" />
                      {new Date(selectedPrint.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                  <div className="flex items-center justify-end">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => downloadImage(
                        selectedPrint.photoboothPrintUrl,
                        `photobooth_${selectedPrint.gallery.name.replace(/\s+/g, '_')}.jpg`
                      )}
                      className="flex items-center space-x-2 px-8 py-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl hover:shadow-2xl transition font-semibold"
                    >
                      <FiDownload className="w-5 h-5" />
                      <span>Download</span>
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
