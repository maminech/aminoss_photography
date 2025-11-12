'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiArrowLeft, 
  FiUsers, 
  FiImage, 
  FiDownload, 
  FiEye, 
  FiX,
  FiPrinter,
  FiCalendar,
  FiMessageCircle,
  FiCheckCircle,
  FiXCircle
} from 'react-icons/fi';

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
  approved: number;
  pending: number;
}

export default function ClientGuestUploadsPage() {
  const params = useParams();
  const router = useRouter();
  const [uploads, setUploads] = useState<GuestUpload[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [viewingPhotos, setViewingPhotos] = useState<GuestUpload | null>(null);
  const [viewingPhotobooth, setViewingPhotobooth] = useState<string | null>(null);
  const [galleryName, setGalleryName] = useState('');

  useEffect(() => {
    fetchUploads();
  }, []);

  const fetchUploads = async () => {
    try {
      const res = await fetch(`/api/client/galleries/${params.id}/guest-uploads`);
      
      if (!res.ok) {
        if (res.status === 404) {
          throw new Error('Gallery not found');
        }
        throw new Error('Failed to load guest uploads');
      }

      const data = await res.json();
      setUploads(data.uploads);
      setStats(data.stats);
      setGalleryName(data.galleryName || 'Event');
      setLoading(false);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const downloadPhoto = async (url: string, guestName: string, index: number) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `${guestName.replace(/\s+/g, '_')}_photo_${index + 1}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      alert('Failed to download photo');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading guest uploads...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiXCircle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Error Loading Uploads</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => router.back()}
            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.back()}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <FiArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Guest Uploads</h1>
                <p className="text-sm text-gray-600">{galleryName}</p>
              </div>
            </div>
            <a
              href={`/api/client/galleries/${params.id}/guest-uploads/export-zip`}
              download
              className="px-6 py-2.5 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white rounded-lg font-medium transition-all flex items-center gap-2 shadow-md hover:shadow-lg transform hover:scale-105"
            >
              <FiDownload className="w-5 h-5" />
              <span>Download All Photos</span>
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center gap-3">
                <FiUsers className="w-8 h-8 text-blue-500" />
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalGuests}</p>
                  <p className="text-sm text-gray-600">Guests</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center gap-3">
                <FiImage className="w-8 h-8 text-green-500" />
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalPhotos}</p>
                  <p className="text-sm text-gray-600">Photos</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center gap-3">
                <FiPrinter className="w-8 h-8 text-pink-500" />
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stats.printSelected}</p>
                  <p className="text-sm text-gray-600">For Print</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center gap-3">
                <FiCheckCircle className="w-8 h-8 text-purple-500" />
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stats.approved}</p>
                  <p className="text-sm text-gray-600">Approved</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Guest Uploads List */}
        {uploads.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <FiUsers className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No Guest Uploads Yet
            </h3>
            <p className="text-gray-600">
              When guests upload photos to your event, they'll appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {uploads.map((upload) => (
              <motion.div
                key={upload.uploadGroupId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
              >
                {/* Upload Header */}
                <div className="p-6 border-b border-gray-100">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                        {upload.uploaderName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">{upload.uploaderName}</h3>
                        <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                          <div className="flex items-center gap-1">
                            <FiCalendar className="w-4 h-4" />
                            {formatDate(upload.uploadedAt)}
                          </div>
                          <div className="flex items-center gap-1">
                            <FiImage className="w-4 h-4" />
                            {upload.photoCount} photos
                          </div>
                        </div>
                      </div>
                    </div>
                    <span
                      className={`px-3 py-1 text-xs font-medium rounded-full ${
                        upload.status === 'approved'
                          ? 'bg-green-100 text-green-800'
                          : upload.status === 'rejected'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {upload.status}
                    </span>
                  </div>

                  {/* Message */}
                  {upload.message && (
                    <div className="mt-4 flex items-start gap-2 p-4 bg-gray-50 rounded-lg">
                      <FiMessageCircle className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                      <p className="text-gray-700 italic">"{upload.message}"</p>
                    </div>
                  )}
                </div>

                {/* Photos Grid */}
                <div className="p-6">
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3 mb-4">
                    {upload.photos.map((photo, index) => (
                      <div
                        key={photo.id}
                        className="relative aspect-square rounded-lg overflow-hidden group cursor-pointer bg-gray-100"
                        onClick={() => setViewingPhotos(upload)}
                      >
                        <Image
                          src={photo.fileUrl}
                          alt={`Photo ${index + 1}`}
                          fill
                          className="object-cover group-hover:scale-110 transition duration-300"
                          quality={100}
                          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 16vw"
                        />
                        {photo.isSelectedForPrint && (
                          <div className="absolute top-2 right-2 bg-pink-500 text-white rounded-full p-1.5 shadow-lg">
                            <FiPrinter className="w-3 h-3" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition flex items-center justify-center gap-2">
                          <FiEye className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition drop-shadow-lg" />
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              downloadPhoto(photo.fileUrl, upload.uploaderName, index);
                            }}
                            className="opacity-0 group-hover:opacity-100 transition"
                          >
                            <FiDownload className="w-6 h-6 text-white drop-shadow-lg" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Photobooth Print Section */}
                  {upload.photoboothPrintUrl && (
                    <div className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-xl p-6 border-2 border-pink-200">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <FiPrinter className="w-5 h-5 text-pink-600" />
                          <h4 className="font-bold text-gray-900">Photobooth Print</h4>
                        </div>
                        <button
                          onClick={() => downloadPhoto(upload.photoboothPrintUrl!, upload.uploaderName, 0)}
                          className="flex items-center gap-2 px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-lg transition text-sm font-medium"
                        >
                          <FiDownload className="w-4 h-4" />
                          Download
                        </button>
                      </div>
                      <div 
                        className="relative w-48 h-72 mx-auto rounded-lg overflow-hidden shadow-xl cursor-pointer"
                        onClick={() => setViewingPhotobooth(upload.photoboothPrintUrl!)}
                      >
                        <Image
                          src={upload.photoboothPrintUrl}
                          alt="Photobooth Print"
                          fill
                          className="object-contain"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Photo Viewer Modal */}
      <AnimatePresence>
        {viewingPhotos && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
            onClick={() => setViewingPhotos(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-6 max-w-5xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-1">
                    {viewingPhotos.uploaderName}'s Photos
                  </h2>
                  {viewingPhotos.message && (
                    <p className="text-gray-600 italic">"{viewingPhotos.message}"</p>
                  )}
                </div>
                <button
                  onClick={() => setViewingPhotos(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition"
                >
                  <FiX className="w-6 h-6 text-gray-600" />
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {viewingPhotos.photos.map((photo, index) => (
                  <div key={photo.id} className="relative group">
                    <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
                      <Image
                        src={photo.fileUrl}
                        alt={`Photo ${index + 1}`}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-300"
                        quality={100}
                        sizes="(max-width: 640px) 50vw, 33vw"
                      />
                      {photo.isSelectedForPrint && (
                        <div className="absolute top-2 right-2 bg-pink-500 text-white rounded-full p-2 shadow-lg">
                          <FiPrinter className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                    <div className="absolute bottom-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <a
                        href={photo.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 bg-white/95 hover:bg-white rounded-lg shadow-lg transition"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <FiEye className="w-4 h-4 text-gray-700" />
                      </a>
                      <button
                        onClick={() => downloadPhoto(photo.fileUrl, viewingPhotos.uploaderName, index)}
                        className="p-2 bg-white/95 hover:bg-white rounded-lg shadow-lg transition"
                      >
                        <FiDownload className="w-4 h-4 text-gray-700" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Photobooth Print Viewer Modal */}
      <AnimatePresence>
        {viewingPhotobooth && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4"
            onClick={() => setViewingPhotobooth(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative max-w-2xl w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setViewingPhotobooth(null)}
                className="absolute -top-12 right-0 p-2 bg-white/10 hover:bg-white/20 rounded-lg transition"
              >
                <FiX className="w-6 h-6 text-white" />
              </button>
              <div className="relative w-full h-[80vh]">
                <Image
                  src={viewingPhotobooth}
                  alt="Photobooth Print"
                  fill
                  className="object-contain"
                  quality={100}
                  sizes="100vw"
                />
              </div>
              <a
                href={viewingPhotobooth}
                download
                className="absolute bottom-4 right-4 p-3 bg-white/90 hover:bg-white rounded-lg shadow-lg transition flex items-center gap-2"
              >
                <FiDownload className="w-5 h-5 text-gray-700" />
                <span className="text-gray-700 font-medium">Download</span>
              </a>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
