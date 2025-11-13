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
      <div className="min-h-screen bg-gray-50 dark:bg-dark-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
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

              <button
                onClick={saveSelections}
                disabled={saving}
                className="flex items-center gap-2 px-3 md:px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation text-sm md:text-base font-semibold"
              >
                <FiCheckCircle className="w-4 h-4 md:w-5 md:h-5" />
                <span className="hidden md:inline">{saving ? 'Saving...' : 'Approve'}</span>
                <span className="md:hidden">✓</span>
              </button>
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

      {/* Floating Photobook Button */}
      {selectedPhotos.size > 0 && (
        <motion.button
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            if (selectedPhotos.size === 0) {
              alert('Please select at least one photo to create a photobook');
              return;
            }
            setPhotobookEditorOpen(true);
          }}
          className="fixed bottom-6 right-6 z-40 flex items-center gap-3 px-6 py-4 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 text-white rounded-full shadow-2xl hover:shadow-purple-500/50 transition-all touch-manipulation font-bold text-base md:text-lg"
        >
          <FiBook className="w-6 h-6" />
          <span className="hidden sm:inline">Create Photobook</span>
          <span className="sm:inline md:hidden">Photobook</span>
          <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 text-purple-900 rounded-full flex items-center justify-center text-sm font-bold shadow-lg">
            {selectedPhotos.size}
          </div>
        </motion.button>
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
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 md:p-5 mb-4 md:mb-6 shadow-sm">
              <div className="flex items-start gap-3 md:gap-4">
                <div className="p-2 bg-blue-600 rounded-lg">
                  <FiAlertCircle className="w-5 h-5 text-white flex-shrink-0" />
                </div>
                <div className="text-sm md:text-base text-blue-900 dark:text-blue-100">
                  <p className="font-bold mb-2 text-lg">📸 How to Create Your Photobook:</p>
                  <ul className="space-y-2 text-blue-800 dark:text-blue-200">
                    <li className="flex items-start gap-2">
                      <span className="text-purple-600 font-bold">1.</span>
                      <span>Click the checkmark on photos you want in your photobook</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-600 font-bold">2.</span>
                      <span>See the purple "Create Photobook" button appear at bottom-right</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-600 font-bold">3.</span>
                      <span>Click it to design your beautiful photobook!</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-600 font-bold">4.</span>
                      <span>Don't forget to "Approve Selection" to save your choices</span>
                    </li>
                    {gallery.allowDownload && (
                      <li className="flex items-start gap-2">
                        <span className="text-green-600 font-bold">•</span>
                        <span>Download individual photos or all selected at once</span>
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 md:gap-3">
              {gallery.photos.map((photo, index) => {
                const isSelected = selectedPhotos.has(photo.id);
                
                return (
                  <motion.div
                    key={photo.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.02 }}
                    className={`relative aspect-square bg-gray-200 dark:bg-dark-700 rounded-lg overflow-hidden group transition-all ${
                      isSelected
                        ? 'ring-4 ring-green-500 shadow-xl shadow-green-500/20'
                        : 'hover:ring-2 hover:ring-gray-300 dark:hover:ring-gray-600'
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
                    <div className="absolute top-2 left-2 bg-black/70 backdrop-blur-sm text-white px-2 py-1 rounded text-xs font-semibold z-10">
                      #{photo.photoNumber}
                    </div>

                    {/* Selection Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        togglePhotoSelection(photo.id);
                      }}
                      className={`absolute top-2 right-2 w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center transition-all z-10 touch-manipulation ${
                        isSelected
                          ? 'bg-primary text-white scale-100'
                          : 'bg-white/90 dark:bg-dark-800/90 text-gray-400 scale-90 group-hover:scale-100'
                      }`}
                    >
                      <FiCheck className="w-4 h-4 md:w-5 md:h-5" />
                    </button>

                    {/* Hover Actions */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-2 md:p-3">
                      <div className="flex items-center justify-between">
                        <button
                          onClick={() => openLightbox(index)}
                          className="p-1.5 md:p-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white rounded-lg transition touch-manipulation"
                          title="View full size"
                        >
                          <FiMaximize2 className="w-4 h-4" />
                        </button>
                        {gallery.allowDownload && (
                          <button
                            onClick={() => downloadPhoto(photo.url, photo.photoNumber)}
                            className="p-1.5 md:p-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white rounded-lg transition touch-manipulation"
                            title="Download"
                          >
                            <FiDownload className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Selection Overlay */}
                    {isSelected && (
                      <div className="absolute inset-0 bg-primary/20 pointer-events-none" />
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
                    className={`p-2 md:p-2.5 rounded-full backdrop-blur-sm transition touch-manipulation ${
                      selectedPhotos.has(currentPhoto.id)
                        ? 'bg-primary text-white'
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
