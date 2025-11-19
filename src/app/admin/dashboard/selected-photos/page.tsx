'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import {
  FiImage,
  FiUser,
  FiDownload,
  FiCheck,
  FiSearch,
  FiFilter,
  FiChevronDown,
  FiChevronUp,
  FiMail,
  FiCalendar,
  FiGrid,
  FiList,
  FiDownloadCloud,
  FiPrinter,
  FiEye,
  FiX,
  FiPackage
} from 'react-icons/fi';

interface Client {
  id: string;
  name: string;
  email: string;
}

interface Photo {
  id: string;
  url: string;
  thumbnailUrl: string;
  photoNumber: number;
  galleryName: string;
}

interface GroupedData {
  client: Client;
  photos: Photo[];
}

export default function SelectedPhotosPage() {
  const [data, setData] = useState<Record<string, GroupedData>>({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [expandedClients, setExpandedClients] = useState<Set<string>>(new Set());
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [sortBy, setSortBy] = useState<'name' | 'photos' | 'recent'>('name');

  useEffect(() => {
    fetchSelectedPhotos();
  }, []);

  useEffect(() => {
    // Expand all clients by default
    if (Object.keys(data).length > 0) {
      setExpandedClients(new Set(Object.keys(data)));
    }
  }, [data]);

  const fetchSelectedPhotos = async () => {
    try {
      const res = await fetch('/api/admin/selected-photos');
      if (res.ok) {
        const groupedData = await res.json();
        setData(groupedData);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleClient = (clientName: string) => {
    const newExpanded = new Set(expandedClients);
    if (newExpanded.has(clientName)) {
      newExpanded.delete(clientName);
    } else {
      newExpanded.add(clientName);
    }
    setExpandedClients(newExpanded);
  };

  const filteredData = Object.entries(data).filter(([clientName, group]) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      clientName.toLowerCase().includes(searchLower) ||
      group.client.email.toLowerCase().includes(searchLower) ||
      group.photos.some(p => p.galleryName.toLowerCase().includes(searchLower))
    );
  });

  const sortedData = [...filteredData].sort(([nameA, groupA], [nameB, groupB]) => {
    switch (sortBy) {
      case 'photos':
        return groupB.photos.length - groupA.photos.length;
      case 'name':
        return nameA.localeCompare(nameB);
      default:
        return 0;
    }
  });

  const totalPhotos = Object.values(data).reduce((sum, group) => sum + group.photos.length, 0);
  const totalClients = Object.keys(data).length;

  const downloadAllForClient = (clientName: string, photos: Photo[]) => {
    photos.forEach((photo, index) => {
      setTimeout(() => {
        const link = document.createElement('a');
        link.href = photo.url;
        link.download = `${clientName}_photo_${photo.photoNumber}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }, index * 100);
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400 font-medium">Loading selected photos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-900">
      {/* Enhanced Header */}
      <header className="bg-white dark:bg-dark-800 border-b border-gray-200 dark:border-dark-700 sticky top-0 z-30 shadow-sm backdrop-blur-sm bg-white/95 dark:bg-dark-800/95">
        <div className="px-4 md:px-6 py-4 md:py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/70 rounded-xl flex items-center justify-center shadow-lg">
                  <FiPrinter className="w-5 h-5 text-white" />
                </div>
                Photos Selected for Print
              </h1>
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-600 dark:text-gray-400">
                <span className="flex items-center gap-1.5">
                  <FiUser className="w-4 h-4" />
                  <strong>{totalClients}</strong> {totalClients === 1 ? 'client' : 'clients'}
                </span>
                <span className="text-gray-300 dark:text-gray-600">•</span>
                <span className="flex items-center gap-1.5">
                  <FiImage className="w-4 h-4" />
                  <strong>{totalPhotos}</strong> {totalPhotos === 1 ? 'photo' : 'photos'}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                className="p-2.5 bg-gray-100 dark:bg-dark-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-dark-600 transition"
                title={`Switch to ${viewMode === 'grid' ? 'list' : 'grid'} view`}
              >
                {viewMode === 'grid' ? <FiList className="w-5 h-5" /> : <FiGrid className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Search and Filter Bar */}
          <div className="mt-4 flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by client name, email, or gallery..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-100 dark:bg-dark-700 border-0 rounded-lg text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-primary transition"
              />
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-4 py-2.5 bg-gray-100 dark:bg-dark-700 border-0 rounded-lg text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary transition"
            >
              <option value="name">Sort by Name</option>
              <option value="photos">Sort by Photos Count</option>
            </select>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-4 md:p-6">
        {sortedData.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-dark-800 rounded-2xl shadow-sm border border-gray-200 dark:border-dark-700 p-12 text-center"
          >
            <div className="w-20 h-20 bg-gray-100 dark:bg-dark-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <FiImage className="w-10 h-10 text-gray-400 dark:text-gray-500" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              {searchTerm ? 'No Results Found' : 'No Photos Selected Yet'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
              {searchTerm
                ? 'Try adjusting your search terms'
                : 'Photos selected by clients for printing will appear here'}
            </p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition inline-flex items-center gap-2"
              >
                <FiX className="w-4 h-4" />
                Clear Search
              </button>
            )}
          </motion.div>
        ) : (
          <div className="space-y-4">
            {sortedData.map(([clientName, group]) => {
              const isExpanded = expandedClients.has(clientName);
              return (
                <motion.div
                  key={group.client.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white dark:bg-dark-800 rounded-2xl shadow-sm border border-gray-200 dark:border-dark-700 overflow-hidden"
                >
                  {/* Client Header */}
                  <div
                    className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent dark:from-primary/20 dark:via-primary/10 px-4 md:px-6 py-4 border-b border-gray-200 dark:border-dark-700 cursor-pointer hover:bg-primary/15 dark:hover:bg-primary/25 transition"
                    onClick={() => toggleClient(clientName)}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3 md:gap-4 min-w-0 flex-1">
                        <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/70 text-white rounded-xl flex items-center justify-center font-bold text-lg shadow-lg flex-shrink-0">
                          {clientName.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h2 className="text-lg md:text-xl font-bold text-gray-900 dark:text-gray-100 truncate">
                            {clientName}
                          </h2>
                          <div className="flex items-center gap-2 mt-1 text-sm text-gray-600 dark:text-gray-400">
                            <FiMail className="w-3.5 h-3.5 flex-shrink-0" />
                            <span className="truncate">{group.client.email}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <div className="flex items-center gap-2">
                          <span className="px-3 py-1.5 bg-primary text-white rounded-full text-sm font-bold shadow-sm">
                            {group.photos.length}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              downloadAllForClient(clientName, group.photos);
                            }}
                            className="p-2 bg-gray-100 dark:bg-dark-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-dark-600 transition"
                            title="Download all photos"
                          >
                            <FiDownloadCloud className="w-4 h-4" />
                          </button>
                        </div>
                        <motion.div
                          animate={{ rotate: isExpanded ? 180 : 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <FiChevronDown className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                        </motion.div>
                      </div>
                    </div>
                  </div>

                  {/* Photos Grid */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="p-4 md:p-6">
                          <div className={`grid gap-3 md:gap-4 ${
                            viewMode === 'grid'
                              ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8'
                              : 'grid-cols-1'
                          }`}>
                            {group.photos.map((photo) => (
                              <motion.div
                                key={photo.id}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="relative group"
                              >
                                <div className="aspect-square bg-gray-100 dark:bg-dark-700 rounded-xl overflow-hidden border-2 border-primary/30 dark:border-primary/50 shadow-md hover:shadow-xl transition-all hover:border-primary">
                                  <Image
                                    src={photo.thumbnailUrl}
                                    alt={`Photo #${photo.photoNumber}`}
                                    fill
                                    className="object-cover"
                                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                                  />

                                  {/* Photo Number Badge */}
                                  <div className="absolute top-2 left-2 px-2.5 py-1 bg-gradient-to-r from-primary to-primary/80 text-white rounded-lg font-bold text-sm shadow-lg backdrop-blur-sm">
                                    #{photo.photoNumber}
                                  </div>

                                  {/* Check Mark */}
                                  <div className="absolute top-2 right-2 w-7 h-7 bg-green-500 text-white rounded-full flex items-center justify-center shadow-lg">
                                    <FiCheck className="w-4 h-4" />
                                  </div>

                                  {/* Gallery Name */}
                                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent text-white text-xs p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <div className="flex items-center gap-1.5">
                                      <FiPackage className="w-3.5 h-3.5 flex-shrink-0" />
                                      <span className="font-medium truncate">{photo.galleryName}</span>
                                    </div>
                                  </div>

                                  {/* Hover Actions */}
                                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-2">
                                    <button
                                      onClick={() => setSelectedPhoto(photo)}
                                      className="p-2.5 bg-white dark:bg-dark-800 text-gray-900 dark:text-gray-100 rounded-lg shadow-lg transform scale-0 group-hover:scale-100 transition-transform hover:bg-gray-100 dark:hover:bg-dark-700"
                                      title="View full size"
                                    >
                                      <FiEye className="w-5 h-5" />
                                    </button>
                                    <a
                                      href={photo.url}
                                      download
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="p-2.5 bg-primary text-white rounded-lg shadow-lg transform scale-0 group-hover:scale-100 transition-transform hover:bg-primary/90"
                                      title="Download"
                                    >
                                      <FiDownload className="w-5 h-5" />
                                    </a>
                                  </div>
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        )}
      </main>

      {/* Photo Preview Modal */}
      <AnimatePresence>
        {selectedPhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedPhoto(null)}
            className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-5xl w-full bg-white dark:bg-dark-800 rounded-2xl overflow-hidden shadow-2xl"
            >
              <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-dark-700">
                <div>
                  <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100">
                    Photo #{selectedPhoto.photoNumber}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{selectedPhoto.galleryName}</p>
                </div>
                <button
                  onClick={() => setSelectedPhoto(null)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-dark-700 rounded-lg transition"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>
              <div className="relative aspect-video bg-gray-100 dark:bg-dark-900">
                <Image
                  src={selectedPhoto.url}
                  alt={`Photo #${selectedPhoto.photoNumber}`}
                  fill
                  className="object-contain"
                  sizes="(max-width: 1280px) 100vw, 1280px"
                />
              </div>
              <div className="p-4 flex gap-2">
                <a
                  href={selectedPhoto.url}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-2.5 bg-primary text-white rounded-lg hover:bg-primary/90 transition font-medium flex items-center justify-center gap-2"
                >
                  <FiDownload className="w-4 h-4" />
                  Download
                </a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

