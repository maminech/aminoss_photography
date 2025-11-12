'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { FiDownload, FiCheck, FiX, FiEye, FiUsers, FiImage, FiPrinter } from 'react-icons/fi';
import Image from 'next/image';

interface Photo {
  id: string;
  fileUrl: string;
  thumbnailUrl: string;
  isSelectedForPrint: boolean;
}

interface GuestUpload {
  uploadGroupId: string;
  uploaderName: string;
  message: string;
  uploadedAt: string;
  photos: Photo[];
  photoCount: number;
  printPhoto: Photo | null;
  photoboothPrintUrl: string | null;
  status: string;
}

interface Stats {
  totalGuests: number;
  totalPhotos: number;
  printSelected: number;
  pending: number;
  approved: number;
}

export default function AdminGuestUploadsPage() {
  const params = useParams();
  const [uploads, setUploads] = useState<GuestUpload[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [filter, setFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [viewingPhotos, setViewingPhotos] = useState<GuestUpload | null>(null);

  useEffect(() => {
    fetchUploads();
  }, []);

  const fetchUploads = async () => {
    try {
      const res = await fetch(`/api/admin/events/${params.eventId}/guest-uploads`);
      
      if (!res.ok) {
        throw new Error('Failed to load guest uploads');
      }

      const data = await res.json();
      setUploads(data.uploads);
      setStats(data.stats);
      setLoading(false);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (uploadGroupId: string, status: string) => {
    try {
      const res = await fetch(`/api/admin/events/${params.eventId}/guest-uploads`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uploadGroupId, status }),
      });

      if (!res.ok) {
        throw new Error('Failed to update status');
      }

      // Refresh data
      fetchUploads();
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  const filteredUploads = uploads.filter((upload) => {
    if (filter === 'all') return true;
    return upload.status === filter;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading guest uploads...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Guest Uploads
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
            Manage photos uploaded by wedding guests
          </p>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-md">
              <div className="flex items-center gap-3">
                <FiUsers className="w-8 h-8 text-blue-500" />
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalGuests}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Guests</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-md">
              <div className="flex items-center gap-3">
                <FiImage className="w-8 h-8 text-green-500" />
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalPhotos}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Photos</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-md">
              <div className="flex items-center gap-3">
                <FiPrinter className="w-8 h-8 text-pink-500" />
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.printSelected}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">For Print</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-md">
              <div className="flex items-center gap-3">
                <FiCheck className="w-8 h-8 text-purple-500" />
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.approved}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Approved</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters & Export */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-md mb-6 flex flex-col sm:flex-row justify-between gap-4">
          <div className="flex gap-2 flex-wrap">
            {['all', 'pending', 'approved', 'rejected'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  filter === f
                    ? 'bg-pink-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            <a
              href={`/api/admin/events/${params.eventId}/guest-uploads/export-zip`}
              download
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-all flex items-center gap-2"
            >
              <FiDownload className="w-4 h-4" />
              <span className="hidden sm:inline">Export ZIP</span>
            </a>
            <a
              href={`/api/admin/events/${params.eventId}/guest-uploads/export-csv`}
              download
              className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-all flex items-center gap-2"
            >
              <FiDownload className="w-4 h-4" />
              <span className="hidden sm:inline">Export CSV</span>
            </a>
          </div>
        </div>

        {/* Uploads Table */}
        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-800 dark:text-red-200 text-sm mb-6">
            {error}
          </div>
        )}

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
          {filteredUploads.length === 0 ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              No uploads found for this filter
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase">Guest</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase">Message</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase">Photos</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase">Print Photo</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase">Photobooth</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredUploads.map((upload) => (
                    <tr key={upload.uploadGroupId} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-900 dark:text-white">{upload.uploaderName}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(upload.uploadedAt).toLocaleDateString()}
                        </p>
                      </td>
                      <td className="px-4 py-3 max-w-xs">
                        <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                          {upload.message}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {upload.photoCount} photos
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {upload.printPhoto ? (
                          <a 
                            href={upload.printPhoto.fileUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="block w-12 h-12 relative rounded-lg overflow-hidden border-2 border-pink-500 hover:scale-110 transition-transform cursor-pointer"
                          >
                            <Image
                              src={upload.printPhoto.fileUrl}
                              alt="Print photo"
                              fill
                              className="object-cover"
                              quality={90}
                            />
                          </a>
                        ) : (
                          <span className="text-xs text-gray-400 dark:text-gray-500">None selected</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {upload.photoboothPrintUrl ? (
                          <div className="flex flex-col gap-1">
                            <a
                              href={upload.photoboothPrintUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:underline"
                            >
                              <FiPrinter className="w-3 h-3" />
                              View
                            </a>
                            <a
                              href={upload.photoboothPrintUrl}
                              download
                              className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400 hover:underline"
                            >
                              <FiDownload className="w-3 h-3" />
                              Download
                            </a>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400 dark:text-gray-500">Not generated</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${
                            upload.status === 'approved'
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                              : upload.status === 'rejected'
                              ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                              : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                          }`}
                        >
                          {upload.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => setViewingPhotos(upload)}
                            className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-all"
                            title="View all photos"
                          >
                            <FiEye className="w-4 h-4" />
                          </button>
                          {upload.status !== 'approved' && (
                            <button
                              onClick={() => handleStatusUpdate(upload.uploadGroupId, 'approved')}
                              className="p-2 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/50 transition-all"
                              title="Approve"
                            >
                              <FiCheck className="w-4 h-4" />
                            </button>
                          )}
                          {upload.status !== 'rejected' && (
                            <button
                              onClick={() => handleStatusUpdate(upload.uploadGroupId, 'rejected')}
                              className="p-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-all"
                              title="Reject"
                            >
                              <FiX className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Photo Viewer Modal */}
      {viewingPhotos && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setViewingPhotos(null)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                  {viewingPhotos.uploaderName}'s Photos
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 italic">
                  "{viewingPhotos.message}"
                </p>
              </div>
              <button
                onClick={() => setViewingPhotos(null)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all"
              >
                <FiX className="w-6 h-6 text-gray-600 dark:text-gray-400" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {viewingPhotos.photos.map((photo) => (
                <div key={photo.id} className="group relative aspect-square rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
                  <Image
                    src={photo.fileUrl}
                    alt="Guest photo"
                    fill
                    className="object-cover hover:scale-110 transition-transform duration-300"
                    quality={100}
                    sizes="(max-width: 768px) 50vw, 33vw"
                  />
                  {photo.isSelectedForPrint && (
                    <div className="absolute top-2 right-2 bg-pink-500 text-white rounded-full p-2 shadow-lg">
                      <FiPrinter className="w-4 h-4" />
                    </div>
                  )}
                  {/* Hover overlay with actions */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2">
                    <a
                      href={photo.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 bg-white/90 hover:bg-white rounded-full transition-all transform hover:scale-110"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <FiEye className="w-5 h-5 text-gray-900" />
                    </a>
                    <a
                      href={photo.fileUrl}
                      download
                      className="p-3 bg-white/90 hover:bg-white rounded-full transition-all transform hover:scale-110"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <FiDownload className="w-5 h-5 text-gray-900" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
