'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { FiArrowLeft, FiUpload, FiEdit2, FiTrash2, FiDownload, FiCheck, FiX } from 'react-icons/fi';
import { CldUploadWidget } from 'next-cloudinary';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

interface Photo {
  id: string;
  cloudinaryId: string;
  url: string;
  thumbnailUrl: string;
  title?: string;
  description?: string;
  width: number;
  height: number;
  photoNumber: number;
  selectedForPrint: boolean;
  order: number;
}

interface Gallery {
  id: string;
  name: string;
  description?: string;
  expiresAt?: string;
  allowDownload: boolean;
  _count: {
    photos: number;
  };
  client: {
    id: string;
    name: string;
    email: string;
  };
}

export default function GalleryPhotosPage() {
  const params = useParams();
  const router = useRouter();
  const galleryId = params.id as string;

  const [gallery, setGallery] = useState<Gallery | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPhotos, setSelectedPhotos] = useState<Set<string>>(new Set());
  const [bulkEditMode, setBulkEditMode] = useState(false);
  const [uploadedPhotos, setUploadedPhotos] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const [bulkEditData, setBulkEditData] = useState({
    title: '',
    description: '',
    selectedForPrint: false,
  });

  useEffect(() => {
    fetchGalleryData();
  }, [galleryId]);

  const fetchGalleryData = async () => {
    try {
      const [galleryRes, photosRes] = await Promise.all([
        fetch(`/api/admin/galleries/${galleryId}`),
        fetch(`/api/admin/galleries/${galleryId}/photos`),
      ]);

      if (galleryRes.ok) {
        const galleryData = await galleryRes.json();
        setGallery(galleryData);
      }

      if (photosRes.ok) {
        const photosData = await photosRes.json();
        setPhotos(photosData);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadSuccess = (result: any) => {
    const photo = {
      cloudinaryId: result.info.public_id,
      url: result.info.secure_url,
      thumbnailUrl: result.info.thumbnail_url || result.info.secure_url,
      width: result.info.width,
      height: result.info.height,
      fileSize: result.info.bytes,
    };
    setUploadedPhotos((prev) => [...prev, photo]);
  };

  const handleSavePhotos = async () => {
    if (uploadedPhotos.length === 0) return;

    setUploading(true);
    try {
      const res = await fetch('/api/admin/galleries/photos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          galleryId,
          photos: uploadedPhotos,
        }),
      });

      if (res.ok) {
        alert(`✅ ${uploadedPhotos.length} photos uploaded successfully!`);
        setUploadedPhotos([]);
        fetchGalleryData();
      } else {
        alert('❌ Failed to upload photos');
      }
    } catch (error) {
      alert('❌ An error occurred');
    } finally {
      setUploading(false);
    }
  };

  const togglePhotoSelection = (photoId: string) => {
    const newSelection = new Set(selectedPhotos);
    if (newSelection.has(photoId)) {
      newSelection.delete(photoId);
    } else {
      newSelection.add(photoId);
    }
    setSelectedPhotos(newSelection);
  };

  const selectAll = () => {
    setSelectedPhotos(new Set(photos.map(p => p.id)));
  };

  const deselectAll = () => {
    setSelectedPhotos(new Set());
  };

  const handleBulkEdit = async () => {
    if (selectedPhotos.size === 0) return;

    try {
      const res = await fetch('/api/admin/galleries/photos/bulk-edit', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          photoIds: Array.from(selectedPhotos),
          updates: bulkEditData,
        }),
      });

      if (res.ok) {
        alert(`✅ ${selectedPhotos.size} photos updated successfully!`);
        setBulkEditMode(false);
        setSelectedPhotos(new Set());
        setBulkEditData({ title: '', description: '', selectedForPrint: false });
        fetchGalleryData();
      } else {
        alert('❌ Failed to update photos');
      }
    } catch (error) {
      alert('❌ An error occurred');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedPhotos.size === 0) return;
    if (!confirm(`Delete ${selectedPhotos.size} selected photos?`)) return;

    try {
      const res = await fetch('/api/admin/galleries/photos/bulk-delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          photoIds: Array.from(selectedPhotos),
        }),
      });

      if (res.ok) {
        alert(`✅ ${selectedPhotos.size} photos deleted successfully!`);
        setSelectedPhotos(new Set());
        fetchGalleryData();
      } else {
        alert('❌ Failed to delete photos');
      }
    } catch (error) {
      alert('❌ An error occurred');
    }
  };

  const downloadAllPhotos = async () => {
    if (photos.length === 0) return;

    setDownloading(true);
    try {
      const zip = new JSZip();
      const folder = zip.folder(gallery?.name || 'gallery');

      // Download all photos
      await Promise.all(
        photos.map(async (photo, index) => {
          const response = await fetch(photo.url);
          const blob = await response.blob();
          folder!.file(`${photo.photoNumber || index + 1}.jpg`, blob);
        })
      );

      const content = await zip.generateAsync({ type: 'blob' });
      saveAs(content, `${gallery?.name || 'gallery'}.zip`);
      alert('✅ All photos downloaded successfully!');
    } catch (error) {
      alert('❌ Failed to download photos');
    } finally {
      setDownloading(false);
    }
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-900">
      {/* Header */}
      <header className="bg-white dark:bg-dark-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-30">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push(`/admin/dashboard/clients/${gallery.client.id}`)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-dark-700 rounded-lg transition"
              >
                <FiArrowLeft className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{gallery.name}</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {gallery.client.name} • {photos.length} photos
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {photos.length > 0 && (
                <button
                  onClick={downloadAllPhotos}
                  disabled={downloading}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
                >
                  <FiDownload className="w-4 h-4" />
                  <span>{downloading ? 'Downloading...' : 'Download All'}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Upload Section */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-dark-800">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Upload Photos</h2>
            {uploadedPhotos.length > 0 && (
              <button
                onClick={handleSavePhotos}
                disabled={uploading}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition disabled:opacity-50"
              >
                {uploading ? 'Saving...' : `Save ${uploadedPhotos.length} Photos`}
              </button>
            )}
          </div>
          
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center bg-gray-50 dark:bg-dark-700/50">
            <CldUploadWidget
              uploadPreset="innov8_portfolio"
              onSuccess={handleUploadSuccess}
              options={{
                multiple: true,
                maxFiles: 100,
                resourceType: 'image',
                clientAllowedFormats: ['jpg', 'jpeg', 'png', 'webp'],
              }}
            >
              {({ open }) => (
                <button
                  type="button"
                  onClick={() => open()}
                  className="inline-flex items-center space-x-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition"
                >
                  <FiUpload className="w-5 h-5" />
                  <span>Upload Photos</span>
                </button>
              )}
            </CldUploadWidget>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-3">
              Upload multiple photos at once (JPG, PNG, WEBP)
            </p>
          </div>

          {uploadedPhotos.length > 0 && (
            <div className="mt-4">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Ready to Upload ({uploadedPhotos.length})
              </h3>
              <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
                {uploadedPhotos.map((photo, idx) => (
                  <div key={idx} className="relative aspect-square bg-gray-100 dark:bg-dark-700 rounded-lg overflow-hidden group">
                    <img
                      src={photo.thumbnailUrl}
                      alt={`Upload ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={() => setUploadedPhotos(prev => prev.filter((_, i) => i !== idx))}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition"
                    >
                      <FiX className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {selectedPhotos.size > 0 && (
        <div className="sticky top-16 z-20 bg-primary text-white p-4 shadow-lg">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="font-semibold">{selectedPhotos.size} photo(s) selected</span>
              <button
                onClick={selectAll}
                className="text-sm underline hover:no-underline"
              >
                Select All
              </button>
              <button
                onClick={deselectAll}
                className="text-sm underline hover:no-underline"
              >
                Deselect All
              </button>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setBulkEditMode(!bulkEditMode)}
                className="flex items-center space-x-2 px-4 py-2 bg-white/20 rounded-lg hover:bg-white/30 transition"
              >
                <FiEdit2 className="w-4 h-4" />
                <span>Bulk Edit</span>
              </button>
              <button
                onClick={handleBulkDelete}
                className="flex items-center space-x-2 px-4 py-2 bg-red-600 rounded-lg hover:bg-red-700 transition"
              >
                <FiTrash2 className="w-4 h-4" />
                <span>Delete Selected</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Edit Panel */}
      {bulkEditMode && selectedPhotos.size > 0 && (
        <div className="bg-blue-50 dark:bg-blue-900/30 border-b border-blue-200 dark:border-blue-700 p-6">
          <div className="max-w-7xl mx-auto">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Bulk Edit {selectedPhotos.size} Photo(s)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Title (Optional)
                </label>
                <input
                  type="text"
                  value={bulkEditData.title}
                  onChange={(e) => setBulkEditData({ ...bulkEditData, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-dark-700 text-gray-900 dark:text-gray-100"
                  placeholder="Add title to all selected photos"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description (Optional)
                </label>
                <input
                  type="text"
                  value={bulkEditData.description}
                  onChange={(e) => setBulkEditData({ ...bulkEditData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-dark-700 text-gray-900 dark:text-gray-100"
                  placeholder="Add description to all selected photos"
                />
              </div>
              <div className="flex items-end">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={bulkEditData.selectedForPrint}
                    onChange={(e) => setBulkEditData({ ...bulkEditData, selectedForPrint: e.target.checked })}
                    className="w-5 h-5 text-primary border-gray-300 dark:border-gray-600 rounded focus:ring-primary"
                  />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Mark for Print
                  </span>
                </label>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleBulkEdit}
                className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition"
              >
                Apply Changes
              </button>
              <button
                onClick={() => {
                  setBulkEditMode(false);
                  setBulkEditData({ title: '', description: '', selectedForPrint: false });
                }}
                className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-700 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Photos Grid */}
      <main className="p-6">
        <div className="max-w-7xl mx-auto">
          {photos.length === 0 ? (
            <div className="text-center py-20">
              <FiUpload className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                No Photos Yet
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Upload photos to this gallery using the form above
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {photos.map((photo) => (
                <div
                  key={photo.id}
                  className={`relative aspect-square bg-gray-100 dark:bg-dark-700 rounded-lg overflow-hidden group cursor-pointer ${
                    selectedPhotos.has(photo.id) ? 'ring-4 ring-primary' : ''
                  }`}
                  onClick={() => togglePhotoSelection(photo.id)}
                >
                  <img
                    src={photo.thumbnailUrl}
                    alt={photo.title || `Photo ${photo.photoNumber}`}
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Selection Checkbox */}
                  <div className="absolute top-2 left-2 z-10">
                    <div className={`w-6 h-6 rounded-full ${
                      selectedPhotos.has(photo.id) 
                        ? 'bg-primary text-white' 
                        : 'bg-white/80 text-gray-600'
                    } flex items-center justify-center shadow-lg`}>
                      {selectedPhotos.has(photo.id) && <FiCheck className="w-4 h-4" />}
                    </div>
                  </div>

                  {/* Photo Number */}
                  <div className="absolute bottom-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-xs font-semibold">
                    #{photo.photoNumber}
                  </div>

                  {/* Print Badge */}
                  {photo.selectedForPrint && (
                    <div className="absolute top-2 right-2 bg-yellow-400 text-gray-900 px-2 py-1 rounded-full text-xs font-semibold">
                      PRINT
                    </div>
                  )}

                  {/* Overlay on Hover */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                    <div className="text-white text-center p-2">
                      <p className="text-sm font-semibold truncate">{photo.title || 'Untitled'}</p>
                      {photo.description && (
                        <p className="text-xs truncate mt-1">{photo.description}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
