'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { FiCheck, FiHeart } from 'react-icons/fi';
import Image from 'next/image';

interface Photo {
  id: string;
  fileUrl: string;
  thumbnailUrl: string;
  isSelectedForPrint: boolean;
}

export default function SelectPhotoPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const uploadGroupId = searchParams.get('groupId');

  const [uploaderName, setUploaderName] = useState('');
  const [message, setMessage] = useState('');
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [selectedPhotoId, setSelectedPhotoId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!uploadGroupId) {
      router.push(`/events/${params.eventId}/guest-upload`);
      return;
    }

    fetchPhotos();
  }, [uploadGroupId]);

  const fetchPhotos = async () => {
    try {
      const res = await fetch(
        `/api/events/${params.eventId}/guest-upload/photos?groupId=${uploadGroupId}`
      );

      if (!res.ok) {
        throw new Error('Failed to load photos');
      }

      const data = await res.json();
      setUploaderName(data.uploaderName);
      setMessage(data.message);
      setPhotos(data.photos);
      
      // Pre-select if one is already selected
      const selected = data.photos.find((p: Photo) => p.isSelectedForPrint);
      if (selected) {
        setSelectedPhotoId(selected.id);
      }
      
      setLoading(false);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleSelectPhoto = (photoId: string) => {
    setSelectedPhotoId(photoId);
  };

  const handleSubmit = async () => {
    if (!selectedPhotoId) {
      setError('Please select a photo for the memory book');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const res = await fetch(`/api/events/${params.eventId}/guest-upload/select-print`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uploadGroupId,
          photoId: selectedPhotoId,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to select photo');
      }

      router.push(`/events/${params.eventId}/guest-upload/success`);
    } catch (err: any) {
      setError(err.message);
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading your photos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900 p-4">
      <div className="max-w-4xl mx-auto pt-8 sm:pt-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 sm:p-8"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <FiHeart className="w-12 h-12 sm:w-16 sm:h-16 mx-auto text-pink-500 mb-4" />
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Choose Your Favorite! 📸
            </h1>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
              Select one photo to be printed in the couple's memory book
            </p>
          </div>

          {/* Message Card */}
          <div className="bg-gradient-to-r from-pink-50 to-purple-50 dark:from-pink-900/20 dark:to-purple-900/20 rounded-xl p-4 sm:p-6 mb-6 border border-pink-200 dark:border-pink-800">
            <p className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              From: <span className="font-bold">{uploaderName}</span>
            </p>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 italic">
              "{message}"
            </p>
          </div>

          {/* Photo Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 mb-6">
            {photos.map((photo) => (
              <motion.div
                key={photo.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.05 }}
                onClick={() => handleSelectPhoto(photo.id)}
                className={`relative aspect-square rounded-lg overflow-hidden cursor-pointer transition-all ${
                  selectedPhotoId === photo.id
                    ? 'ring-4 ring-pink-500 shadow-xl'
                    : 'ring-2 ring-gray-200 dark:ring-gray-700 hover:ring-pink-300'
                }`}
              >
                <Image
                  src={photo.thumbnailUrl}
                  alt="Guest photo"
                  fill
                  className="object-cover"
                />
                {selectedPhotoId === photo.id && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="absolute inset-0 bg-pink-500/30 flex items-center justify-center"
                  >
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white rounded-full flex items-center justify-center">
                      <FiCheck className="w-6 h-6 sm:w-8 sm:h-8 text-pink-500" />
                    </div>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-800 dark:text-red-200 text-sm mb-6"
            >
              {error}
            </motion.div>
          )}

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={submitting || !selectedPhotoId}
            className="w-full py-4 bg-gradient-to-r from-pink-500 to-purple-500 text-white font-semibold rounded-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
          >
            {submitting ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Saving...
              </span>
            ) : (
              'Confirm Selection'
            )}
          </button>
        </motion.div>
      </div>
    </div>
  );
}
