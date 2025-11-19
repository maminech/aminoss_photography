'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiArrowLeft, 
  FiCheck, 
  FiDownload, 
  FiImage, 
  FiX,
  FiMaximize2,
  FiCheckCircle,
  FiAlertCircle,
  FiChevronLeft,
  FiChevronRight,
  FiDownloadCloud,
  FiBook,
  FiUsers,
  FiStar
} from 'react-icons/fi';
import dynamic from 'next/dynamic';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

// Dynamically import Smart Photobook Builder (client-side only)
const SmartPhotobookBuilder = dynamic(
  () => import('@/components/photobook/SmartPhotobookBuilder'),
  { ssr: false }
);

interface Photo {
  id: string;
  url: string;
  thumbnailUrl: string;
  photoNumber: number;
  selectedForPrint: boolean;
  width?: number;
  height?: number;
  title?: string;
}

interface Gallery {
  id: string;
  name: string;
  description?: string;
  allowDownload: boolean;
  photos: Photo[];
}

export default function ClientGalleryPage() {
  const params = useParams();
  const router = useRouter();
  const [gallery, setGallery] = useState<Gallery | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPhotos, setSelectedPhotos] = useState<Set<string>>(new Set());
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [saving, setSaving] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showPhotobookConfirmation, setShowPhotobookConfirmation] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [photobookEditorOpen, setPhotobookEditorOpen] = useState(false);
  const [showPhotobookPrompt, setShowPhotobookPrompt] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [ratingComment, setRatingComment] = useState('');
  const [submittingRating, setSubmittingRating] = useState(false);

  useEffect(() => {
    fetchGallery();
  }, []);

  const fetchGallery = async () => {
    try {
      const res = await fetch('/api/client/galleries');
      if (res.ok) {
        const galleries = await res.json();
        const found = galleries.find((g: Gallery) => g.id === params.id);
        
        if (found) {
          setGallery(found);
          // Initialize selected photos from database
          const selected = new Set<string>(
            found.photos.filter((p: Photo) => p.selectedForPrint).map((p: Photo) => p.id)
          );
          setSelectedPhotos(selected);
        } else {
          router.push('/client/dashboard');
        }
      } else {
        router.push('/client/login');
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const togglePhotoSelection = (photoId: string) => {
    setSelectedPhotos((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(photoId)) {
        newSet.delete(photoId);
      } else {
        newSet.add(photoId);
      }
      return newSet;
    });
  };

  const saveSelections = async () => {
    setSaving(true);
    try {
      // Save all selections in batch
      const promises = gallery?.photos.map((photo) => {
        const isSelected = selectedPhotos.has(photo.id);
        return fetch('/api/client/photos/select', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            photoId: photo.id,
            selected: isSelected,
          }),
        });
      });

      if (promises) {
        await Promise.all(promises);
        setShowConfirmation(true);
        setTimeout(() => {
          setShowConfirmation(false);
          // Optional: Show photobook prompt (user can dismiss or create later from dashboard)
          // Removed auto-popup - let users create photobook when they're ready
        }, 3000);
      }
    } catch (error) {
      alert('Error saving selections. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const downloadPhoto = async (url: string, photoNumber: number) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `photo-${photoNumber}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      alert('Error downloading photo');
    }
  };

  const downloadAllSelected = async () => {
    if (selectedPhotos.size === 0) {
      alert('Please select photos to download');
      return;
    }

    setDownloading(true);
    try {
      const selectedPhotoObjects = gallery?.photos.filter((p) => selectedPhotos.has(p.id)) || [];
      
      for (const photo of selectedPhotoObjects) {
        await downloadPhoto(photo.url, photo.photoNumber);
        // Small delay between downloads
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      alert(`Successfully downloaded ${selectedPhotos.size} photo${selectedPhotos.size > 1 ? 's' : ''}!`);
    } catch (error) {
      alert('Error downloading photos');
    } finally {
      setDownloading(false);
    }
  };

  const submitRating = async () => {
    if (rating === 0) {
      alert('Please select a rating');
      return;
    }

    setSubmittingRating(true);
    try {
      const response = await fetch('/api/client/galleries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          galleryId: gallery?.id,
          rating: rating,
          comment: ratingComment,
        }),
      });

      if (response.ok) {
        alert('Thank you for your feedback! ⭐');
        setShowRatingModal(false);
        setRating(0);
        setRatingComment('');
      } else {
        alert('Failed to submit rating. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting rating:', error);
      alert('Failed to submit rating. Please try again.');
    } finally {
      setSubmittingRating(false);
    }
  };

  const openLightbox = (index: number) => {
    setCurrentImageIndex(index);
    setLightboxOpen(true);
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % (gallery?.photos.length || 1));
  };

  const previousImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + (gallery?.photos.length || 1)) % (gallery?.photos.length || 1));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-900">
        {/* Header Skeleton */}
        <header className="bg-white dark:bg-dark-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-30 shadow-sm">
          <div className="px-4 md:px-6 py-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center space-x-3 md:space-x-4">
                <div className="w-10 h-10 bg-gray-200 dark:bg-dark-700 rounded-lg animate-pulse" />
                <div>
                  <div className="h-6 w-48 bg-gray-200 dark:bg-dark-700 rounded animate-pulse mb-2" />
                  <div className="h-4 w-64 bg-gray-200 dark:bg-dark-700 rounded animate-pulse" />
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <div className="h-10 w-32 bg-gray-200 dark:bg-dark-700 rounded-lg animate-pulse" />
                <div className="h-10 w-24 bg-gray-200 dark:bg-dark-700 rounded-lg animate-pulse" />
                <div className="h-10 w-28 bg-gray-200 dark:bg-dark-700 rounded-lg animate-pulse" />
              </div>
            </div>
          </div>
        </header>

        {/* Content Skeleton */}
        <main className="p-3 md:p-6 pb-24">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 md:p-5 mb-4 md:mb-6 shadow-sm">
            <div className="flex items-start gap-3 md:gap-4">
              <div className="w-10 h-10 bg-blue-200 dark:bg-blue-800 rounded-lg animate-pulse flex-shrink-0" />
              <div className="flex-1 space-y-3">
                <div className="h-5 w-64 bg-blue-200 dark:bg-blue-800 rounded animate-pulse" />
                <div className="space-y-2">
                  <div className="h-4 w-full bg-blue-200 dark:bg-blue-800 rounded animate-pulse" />
                  <div className="h-4 w-full bg-blue-200 dark:bg-blue-800 rounded animate-pulse" />
                  <div className="h-4 w-3/4 bg-blue-200 dark:bg-blue-800 rounded animate-pulse" />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 md:gap-3">
            {[...Array(18)].map((_, i) => (
              <div
                key={i}
                className="aspect-square bg-gray-200 dark:bg-dark-700 rounded-lg animate-pulse"
              />
            ))}
          </div>
        </main>
      </div>
    );
  }

  if (!gallery) {
    return null;
  }

  const currentPhoto = gallery.photos[currentImageIndex];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-900">
      {/* Header */}
      <header className="bg-white dark:bg-dark-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-30 shadow-sm">
        <div className="px-4 md:px-6 py-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center space-x-3 md:space-x-4">
              <button
                onClick={() => router.push('/client/dashboard')}
                className="p-2 hover:bg-gray-100 dark:hover:bg-dark-700 rounded-lg transition touch-manipulation"
              >
                <FiArrowLeft className="w-5 h-5 md:w-6 md:h-6 text-gray-700 dark:text-gray-300" />
              </button>
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-gray-100">{gallery.name}</h1>
                {gallery.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{gallery.description}</p>
                )}
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="text-sm md:text-base text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-dark-700 px-3 md:px-4 py-2 rounded-lg">
                <span className="font-semibold text-primary">{selectedPhotos.size}</span> of{' '}
                <span className="font-semibold text-gray-900 dark:text-gray-100">{gallery.photos.length}</span> selected
              </div>
              
              {/* Rate Gallery Button */}
              <button
                onClick={() => setShowRatingModal(true)}
                className="flex items-center gap-2 px-3 md:px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white rounded-lg transition touch-manipulation text-sm md:text-base font-semibold shadow-lg hover:shadow-xl"
                title="Rate this gallery"
              >
                <FiStar className="w-4 h-4 md:w-5 md:h-5" />
                <span className="hidden lg:inline">Rate Gallery</span>
                <span className="lg:hidden">Rate</span>
              </button>

              <button
                onClick={() => router.push(`/client/gallery/${params.id}/guest-uploads`)}
                className="flex items-center gap-2 px-3 md:px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition touch-manipulation text-sm md:text-base font-semibold"
              >
                <FiUsers className="w-4 h-4 md:w-5 md:h-5" />
                <span className="hidden sm:inline">Guest Uploads</span>
                <span className="sm:hidden">Guests</span>
              </button>
              
              {gallery.allowDownload && selectedPhotos.size > 0 && (
                <button
                  onClick={downloadAllSelected}
                  disabled={downloading}
                  className="flex items-center gap-2 px-3 md:px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation text-sm md:text-base"
                >
                  <FiDownloadCloud className="w-4 h-4 md:w-5 md:h-5" />
                  <span className="hidden sm:inline">{downloading ? 'Downloading...' : 'Download'}</span>
                  <span className="sm:hidden">Download</span>
                </button>
              )}

              <motion.button
                onClick={saveSelections}
                disabled={saving}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative flex items-center gap-2 px-4 md:px-6 py-2.5 md:py-3 bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 hover:from-emerald-600 hover:via-green-600 hover:to-teal-600 text-white rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation text-sm md:text-base font-bold shadow-lg hover:shadow-2xl disabled:hover:scale-100 group overflow-hidden"
              >
                {/* Glowing effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 via-green-400 to-teal-400 opacity-0 group-hover:opacity-30 blur-xl transition-opacity duration-300" />
                
                {/* Shine effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                
                <div className="relative flex items-center gap-2">
                  {saving ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                      />
                      <span className="hidden md:inline">Saving...</span>
                      <span className="md:hidden">...</span>
                    </>
                  ) : (
                    <>
                      <FiCheckCircle className="w-5 h-5 md:w-6 md:h-6 drop-shadow-lg" />
                      <span className="hidden md:inline drop-shadow-lg">Approve Selection</span>
                      <span className="md:hidden drop-shadow-lg">Approve</span>
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="w-2 h-2 bg-white rounded-full absolute -top-0.5 -right-0.5 shadow-lg"
                      />
                    </>
                  )}
                </div>
              </motion.button>
            </div>
          </div>
        </div>
      </header>

      {/* Success Confirmation */}
      <AnimatePresence>
        {showConfirmation && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-2xl flex items-center gap-3"
          >
            <FiCheckCircle className="w-6 h-6" />
            <span className="font-semibold">Selection saved successfully!</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Photobook Confirmation */}
      <AnimatePresence>
        {showPhotobookConfirmation && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-purple-600 text-white px-6 py-3 rounded-lg shadow-2xl flex items-center gap-3 max-w-md"
          >
            <FiBook className="w-6 h-6 flex-shrink-0" />
            <div>
              <p className="font-semibold">Photobook saved successfully! 📖</p>
              <p className="text-sm text-purple-100">The admin will review your design.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Photobook Prompt */}
      <AnimatePresence>
        {showPhotobookPrompt && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setShowPhotobookPrompt(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-dark-800 rounded-2xl p-6 md:p-8 max-w-md w-full shadow-2xl"
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-primary to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FiBook className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                  Create a Photobook? 📖
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  You've selected {selectedPhotos.size} amazing photo{selectedPhotos.size !== 1 ? 's' : ''}! 
                  Would you like to design a beautiful photobook with them?
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => setShowPhotobookPrompt(false)}
                    className="flex-1 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-700 transition font-medium"
                  >
                    Maybe Later
                  </button>
                  <button
                    onClick={() => {
                      setShowPhotobookPrompt(false);
                      setPhotobookEditorOpen(true);
                    }}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-primary to-purple-500 text-white rounded-lg hover:from-primary/90 hover:to-purple-500/90 transition font-semibold shadow-lg"
                  >
                    Let's Create! 🎨
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Smart Photobook Builder */}
      {photobookEditorOpen && gallery && selectedPhotos.size > 0 && (
        <DndProvider backend={HTML5Backend}>
          <SmartPhotobookBuilder
            galleryId={gallery.id}
            photos={gallery.photos.filter(p => selectedPhotos.has(p.id)).map(p => ({
              id: p.id,
              url: p.url,
              thumbnailUrl: p.thumbnailUrl,
              width: p.width,
              height: p.height,
              title: p.title,
            }))}
            onClose={() => setPhotobookEditorOpen(false)}
            onSave={async (photobookData: any) => {
              try {
                setSaving(true);
                const response = await fetch('/api/client/photobook', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    galleryId: gallery.id,
                    design: photobookData,
                    title: photobookData.settings?.title || `${gallery.name} - Photobook`,
                  }),
                });
                
                if (response.ok) {
                  const data = await response.json();
                  console.log('Photobook saved successfully:', data);
                  // Don't close immediately - let them continue editing or submit
                } else {
                  const errorData = await response.json();
                  console.error('Save failed:', errorData);
                  alert(errorData.error || 'Failed to save photobook. Please try again.');
                }
              } catch (error) {
                console.error('Error saving photobook:', error);
                alert('Failed to save photobook. Please check your connection and try again.');
              } finally {
                setSaving(false);
              }
            }}
          />
        </DndProvider>
      )}



      {/* Main Content */}
      <main className="p-3 md:p-6 pb-24">
        {gallery.photos.length === 0 ? (
          <div className="bg-white dark:bg-dark-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8 md:p-12 text-center">
            <FiImage className="w-12 h-12 md:w-16 md:h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">No Photos Yet</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Photos will appear here once they've been uploaded
            </p>
          </div>
        ) : (
          <>
            {/* Beautiful Welcome Message */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative overflow-hidden bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-purple-900/30 dark:via-pink-900/30 dark:to-blue-900/30 rounded-3xl p-6 md:p-8 mb-6 shadow-lg border border-purple-100 dark:border-purple-800/50"
            >
              {/* Decorative Elements */}
              <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-blue-400/20 to-purple-400/20 rounded-full blur-3xl" />
              
              <div className="relative z-10">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring" }}
                  className="inline-flex items-center gap-3 mb-4"
                >
                  <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl shadow-lg">
                    <FiImage className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
                    Your Beautiful Gallery
                  </h2>
                </motion.div>
                
                <p className="text-gray-700 dark:text-gray-300 text-base md:text-lg leading-relaxed mb-4">
                  Select your favorite moments by clicking the checkmark ✓ on each photo. 
                  {gallery.allowDownload && ' Download them individually or all at once. '}
                  Save your selections anytime using the <span className="font-semibold text-purple-600 dark:text-purple-400">Approve</span> button above.
                </p>
                
                <div className="flex flex-wrap gap-3">
                  <div className="flex items-center gap-2 px-4 py-2 bg-white/60 dark:bg-white/10 backdrop-blur-sm rounded-full border border-purple-200 dark:border-purple-700">
                    <span className="text-2xl">📸</span>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {gallery.photos.length} Photos
                    </span>
                  </div>
                  {gallery.allowDownload && (
                    <div className="flex items-center gap-2 px-4 py-2 bg-white/60 dark:bg-white/10 backdrop-blur-sm rounded-full border border-green-200 dark:border-green-700">
                      <span className="text-2xl">⬇️</span>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Download Enabled
                      </span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 px-4 py-2 bg-white/60 dark:bg-white/10 backdrop-blur-sm rounded-full border border-blue-200 dark:border-blue-700">
                    <span className="text-2xl">❤️</span>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Enjoy!
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
              {gallery.photos.map((photo, index) => {
                const isSelected = selectedPhotos.has(photo.id);
                
                return (
                  <motion.div
                    key={photo.id}
                    initial={{ opacity: 0, scale: 0.8, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ 
                      delay: index * 0.03,
                      type: "spring",
                      stiffness: 100,
                      damping: 15
                    }}
                    whileHover={{ y: -8, transition: { duration: 0.2 } }}
                    className={`relative aspect-square bg-gradient-to-br from-gray-100 to-gray-200 dark:from-dark-700 dark:to-dark-600 rounded-2xl overflow-hidden group transition-all duration-300 ${
                      isSelected
                        ? 'ring-4 ring-purple-500 shadow-2xl shadow-purple-500/40 scale-[0.98]'
                        : 'hover:ring-2 hover:ring-purple-300 dark:hover:ring-purple-600 hover:shadow-xl'
                    }`}
                  >
                    {/* Image */}
                    <div
                      onClick={() => openLightbox(index)}
                      className="w-full h-full cursor-pointer"
                    >
                      <Image
                        src={photo.url}
                        alt={`Photo ${photo.photoNumber}`}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                        quality={90}
                      />
                    </div>
                    
                    {/* Photo Number Badge */}
                    <div className="absolute top-3 left-3 bg-gradient-to-br from-black/80 to-black/60 backdrop-blur-md text-white px-3 py-1.5 rounded-full text-xs font-bold z-10 shadow-lg">
                      #{photo.photoNumber}
                    </div>

                    {/* Selection Button */}
                    <motion.button
                      onClick={(e) => {
                        e.stopPropagation();
                        togglePhotoSelection(photo.id);
                      }}
                      whileHover={{ scale: 1.15, rotate: 5 }}
                      whileTap={{ scale: 0.9 }}
                      className={`absolute top-3 right-3 w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center transition-all z-10 touch-manipulation shadow-lg backdrop-blur-md ${
                        isSelected
                          ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white scale-110 shadow-purple-500/60'
                          : 'bg-white/80 dark:bg-dark-800/80 text-gray-400 hover:text-purple-500 scale-95 group-hover:scale-100 hover:bg-white dark:hover:bg-dark-800'
                      }`}
                    >
                      <FiCheck className={`w-5 h-5 md:w-6 md:h-6 transition-transform ${isSelected ? 'scale-100' : 'scale-75'}`} />
                    </motion.button>

                    {/* Hover Actions */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      whileHover={{ opacity: 1, y: 0 }}
                      className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 p-3 md:p-4"
                    >
                      <div className="flex items-center justify-center gap-2">
                        <motion.button
                          onClick={() => openLightbox(index)}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          className="p-2.5 bg-white/20 hover:bg-white/30 backdrop-blur-md text-white rounded-xl transition shadow-lg border border-white/20"
                          title="View full size"
                        >
                          <FiMaximize2 className="w-5 h-5" />
                        </motion.button>
                        {gallery.allowDownload && (
                          <motion.button
                            onClick={() => downloadPhoto(photo.url, photo.photoNumber)}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            className="p-2.5 bg-white/20 hover:bg-white/30 backdrop-blur-md text-white rounded-xl transition shadow-lg border border-white/20"
                            title="Download"
                          >
                            <FiDownload className="w-5 h-5" />
                          </motion.button>
                        )}
                      </div>
                    </motion.div>

                    {/* Selection Overlay */}
                    {isSelected && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="absolute inset-0 bg-gradient-to-br from-purple-500/30 via-pink-500/20 to-blue-500/30 pointer-events-none"
                      >
                        <div className="absolute inset-0 bg-gradient-to-t from-purple-900/40 to-transparent" />
                      </motion.div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </>
        )}
      </main>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {lightboxOpen && currentPhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black"
            onClick={() => setLightboxOpen(false)}
          >
            {/* Header */}
            <div className="absolute top-0 left-0 right-0 z-20 bg-gradient-to-b from-black/80 to-transparent">
              <div className="flex items-center justify-between p-3 md:p-4">
                <div className="flex items-center gap-3">
                  <span className="text-white text-sm md:text-base font-medium">
                    Photo #{currentPhoto.photoNumber} ({currentImageIndex + 1} / {gallery.photos.length})
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {gallery.allowDownload && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        downloadPhoto(currentPhoto.url, currentPhoto.photoNumber);
                      }}
                      className="p-2 md:p-2.5 rounded-full bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 transition touch-manipulation"
                    >
                      <FiDownload className="w-5 h-5" />
                    </button>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      togglePhotoSelection(currentPhoto.id);
                    }}
                    className={`p-2 md:p-2.5 rounded-full backdrop-blur-sm transition touch-manipulation shadow-lg ${
                      selectedPhotos.has(currentPhoto.id)
                        ? 'bg-green-500 text-white shadow-green-500/50'
                        : 'bg-white/10 text-white hover:bg-white/20'
                    }`}
                  >
                    <FiCheck className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setLightboxOpen(false)}
                    className="p-2 md:p-2.5 rounded-full bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 transition touch-manipulation"
                  >
                    <FiX className="w-6 h-6" />
                  </button>
                </div>
              </div>
            </div>

            {/* Navigation Buttons */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                previousImage();
              }}
              className="absolute left-2 md:left-6 top-1/2 -translate-y-1/2 z-20 p-2 md:p-4 rounded-full bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 transition touch-manipulation"
            >
              <FiChevronLeft className="w-6 h-6 md:w-8 md:h-8" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                nextImage();
              }}
              className="absolute right-2 md:right-6 top-1/2 -translate-y-1/2 z-20 p-2 md:p-4 rounded-full bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 transition touch-manipulation"
            >
              <FiChevronRight className="w-6 h-6 md:w-8 md:h-8" />
            </button>

            {/* Image */}
            <div
              className="absolute inset-0 flex items-center justify-center p-4 md:p-8"
              onClick={(e) => e.stopPropagation()}
            >
              <motion.div
                key={currentImageIndex}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="relative max-w-7xl max-h-full w-full h-full"
              >
                <Image
                  src={currentPhoto.url}
                  alt={`Photo ${currentPhoto.photoNumber}`}
                  fill
                  className="object-contain select-none"
                  priority
                  quality={100}
                  sizes="100vw"
                />
              </motion.div>
            </div>

            {/* Mobile Swipe Indicators */}
            <div className="md:hidden absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1.5">
              {gallery.photos.map((_, idx) => (
                <div
                  key={idx}
                  className={`h-1.5 rounded-full transition-all ${
                    idx === currentImageIndex
                      ? 'w-6 bg-white'
                      : 'w-1.5 bg-white/40'
                  }`}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>



      {/* Rating Modal */}
      <AnimatePresence>
        {showRatingModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => !submittingRating && setShowRatingModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-dark-800 rounded-2xl p-6 md:p-8 max-w-lg w-full shadow-2xl border border-gray-200 dark:border-gray-700"
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 via-orange-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <FiStar className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                  Rate This Gallery
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  How would you rate your experience with {gallery.name}?
                </p>
              </div>

              {/* Star Rating */}
              <div className="flex justify-center gap-2 md:gap-3 mb-6">
                {[1, 2, 3, 4, 5].map((star) => (
                  <motion.button
                    key={star}
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="touch-manipulation focus:outline-none"
                  >
                    <FiStar
                      className={`w-10 h-10 md:w-12 md:h-12 transition-all ${
                        star <= (hoverRating || rating)
                          ? 'fill-yellow-400 text-yellow-400 drop-shadow-lg'
                          : 'text-gray-300 dark:text-gray-600'
                      }`}
                    />
                  </motion.button>
                ))}
              </div>

              {rating > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center mb-6"
                >
                  <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {rating === 5 && '🌟 Outstanding!'}
                    {rating === 4 && '😊 Great!'}
                    {rating === 3 && '👍 Good'}
                    {rating === 2 && '😐 Okay'}
                    {rating === 1 && '😕 Needs Improvement'}
                  </p>
                </motion.div>
              )}

              {/* Comment Box */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Additional Comments (Optional)
                </label>
                <textarea
                  value={ratingComment}
                  onChange={(e) => setRatingComment(e.target.value)}
                  placeholder="Tell us more about your experience..."
                  rows={4}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-dark-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition text-gray-900 dark:text-gray-100 placeholder-gray-400 resize-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => setShowRatingModal(false)}
                  disabled={submittingRating}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-dark-700 transition font-semibold disabled:opacity-50 touch-manipulation"
                >
                  Cancel
                </button>
                <button
                  onClick={submitRating}
                  disabled={submittingRating || rating === 0}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-yellow-500 via-orange-500 to-pink-500 text-white rounded-xl hover:from-yellow-600 hover:via-orange-600 hover:to-pink-600 transition font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation flex items-center justify-center gap-2"
                >
                  {submittingRating ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                      />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <FiStar className="w-5 h-5" />
                      Submit Rating
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
