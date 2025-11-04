'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { FiArrowLeft, FiCheck, FiDownload, FiImage } from 'react-icons/fi';

interface Photo {
  id: string;
  url: string;
  thumbnailUrl: string;
  photoNumber: number;
  selectedForPrint: boolean;
  width?: number;
  height?: number;
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

  const togglePhotoSelection = async (photoId: string) => {
    const isSelected = selectedPhotos.has(photoId);
    
    try {
      const res = await fetch('/api/client/photos/select', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          photoId,
          selected: !isSelected,
        }),
      });

      if (res.ok) {
        setSelectedPhotos((prev) => {
          const newSet = new Set(prev);
          if (isSelected) {
            newSet.delete(photoId);
          } else {
            newSet.add(photoId);
          }
          return newSet;
        });
      } else {
        alert('Failed to update selection');
      }
    } catch (error) {
      alert('Error updating selection');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!gallery) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/client/dashboard')}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <FiArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{gallery.name}</h1>
                {gallery.description && (
                  <p className="text-sm text-gray-600">{gallery.description}</p>
                )}
              </div>
            </div>
            <div className="text-sm text-gray-600">
              <span className="font-semibold text-primary">{selectedPhotos.size}</span> of{' '}
              <span className="font-semibold">{gallery.photos.length}</span> selected for print
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6">
        {gallery.photos.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <FiImage className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Photos Yet</h3>
            <p className="text-gray-600">
              Photos will appear here once they've been uploaded
            </p>
          </div>
        ) : (
          <>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-900">
                <strong>Select photos for printing:</strong> Click on any photo to select it for printing. 
                Selected photos will be marked with a checkmark and highlighted border.
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
              {gallery.photos.map((photo) => {
                const isSelected = selectedPhotos.has(photo.id);
                
                return (
                  <div
                    key={photo.id}
                    onClick={() => togglePhotoSelection(photo.id)}
                    className={`relative aspect-square bg-gray-100 rounded-lg overflow-hidden cursor-pointer group transition-all touch-manipulation ${
                      isSelected
                        ? 'ring-4 ring-primary shadow-lg scale-105'
                        : 'hover:ring-2 hover:ring-gray-300 active:scale-95'
                    }`}
                  >
                    <img
                      src={photo.thumbnailUrl}
                      alt={`Photo ${photo.photoNumber}`}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    
                    {/* Photo Number Badge */}
                    <div className="absolute top-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-xs md:text-sm font-semibold">
                      #{photo.photoNumber}
                    </div>

                    {/* Selection Indicator */}
                    <div
                      className={`absolute top-2 right-2 w-10 h-10 md:w-8 md:h-8 rounded-full flex items-center justify-center transition-all ${
                        isSelected
                          ? 'bg-primary text-white scale-100'
                          : 'bg-white/90 text-gray-400 scale-90 group-hover:scale-100'
                      }`}
                    >
                      <FiCheck className="w-6 h-6 md:w-5 md:h-5" />
                    </div>

                    {/* Overlay on hover */}
                    <div
                      className={`absolute inset-0 transition-opacity ${
                        isSelected
                          ? 'bg-primary/20 opacity-100'
                          : 'bg-black/0 group-hover:bg-black/10 opacity-0 group-hover:opacity-100'
                      }`}
                    />

                    {/* Selected Label */}
                    {isSelected && (
                      <div className="absolute bottom-0 left-0 right-0 bg-primary text-white text-center py-2 text-sm font-semibold">
                        Selected for Print
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </main>

      {/* Floating Action Button */}
      {selectedPhotos.size > 0 && (
        <div className="fixed bottom-6 right-6 bg-primary text-white px-6 py-3 rounded-full shadow-2xl flex items-center space-x-2 animate-bounce">
          <FiCheck className="w-5 h-5" />
          <span className="font-semibold">{selectedPhotos.size} photo{selectedPhotos.size !== 1 ? 's' : ''} selected</span>
        </div>
      )}
    </div>
  );
}
