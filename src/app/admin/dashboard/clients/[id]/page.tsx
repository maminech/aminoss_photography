'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { FiArrowLeft, FiUpload, FiPlus, FiImage, FiCalendar, FiTrash2, FiEye, FiDownload, FiX } from 'react-icons/fi';
import { CldUploadWidget } from 'next-cloudinary';

interface Client {
  id: string;
  name: string;
  email: string;
  phone?: string;
  galleries: Gallery[];
}

interface Gallery {
  id: string;
  name: string;
  description?: string;
  coverImage?: string;
  expiresAt?: string;
  allowDownload: boolean;
  createdAt: string;
  _count: {
    photos: number;
  };
}

interface UploadedPhoto {
  cloudinaryId: string;
  url: string;
  thumbnailUrl: string;
  width: number;
  height: number;
  fileSize: number;
}

export default function ClientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const clientId = params.id as string;

  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [galleryModalOpen, setGalleryModalOpen] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [selectedGallery, setSelectedGallery] = useState<string>('');
  const [uploadedPhotos, setUploadedPhotos] = useState<UploadedPhoto[]>([]);
  const [uploading, setUploading] = useState(false);

  const [galleryForm, setGalleryForm] = useState({
    name: '',
    description: '',
    expiresAt: '',
    allowDownload: true,
    password: '',
  });

  useEffect(() => {
    fetchClientData();
  }, [clientId]);

  const fetchClientData = async () => {
    try {
      const res = await fetch(`/api/admin/clients/${clientId}`);
      if (res.ok) {
        const data = await res.json();
        setClient(data);
      } else {
        alert('Client not found');
        router.push('/admin/dashboard/clients');
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGallery = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await fetch('/api/admin/galleries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...galleryForm,
          clientId,
        }),
      });

      if (res.ok) {
        alert('✅ Gallery created!');
        setGalleryModalOpen(false);
        fetchClientData();
        setGalleryForm({
          name: '',
          description: '',
          expiresAt: '',
          allowDownload: true,
          password: '',
        });
      } else {
        const data = await res.json();
        alert(`❌ ${data.error}`);
      }
    } catch (error) {
      alert('❌ Failed to create gallery');
    }
  };

  const handleUploadSuccess = (result: any) => {
    const photo: UploadedPhoto = {
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
    if (!selectedGallery || uploadedPhotos.length === 0) {
      alert('Please select a gallery and upload photos');
      return;
    }

    setUploading(true);

    try {
      const res = await fetch('/api/admin/galleries/photos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          galleryId: selectedGallery,
          photos: uploadedPhotos,
        }),
      });

      if (res.ok) {
        alert(`✅ ${uploadedPhotos.length} photos added to gallery!`);
        setUploadModalOpen(false);
        setUploadedPhotos([]);
        setSelectedGallery('');
        fetchClientData();
      } else {
        const data = await res.json();
        alert(`❌ ${data.error}`);
      }
    } catch (error) {
      alert('❌ Failed to save photos');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteGallery = async (galleryId: string) => {
    if (!confirm('Delete this gallery and all its photos?')) return;

    try {
      const res = await fetch(`/api/admin/galleries?id=${galleryId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        alert('✅ Gallery deleted');
        fetchClientData();
      }
    } catch (error) {
      alert('❌ Failed to delete gallery');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!client) {
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
                onClick={() => router.push('/admin/dashboard/clients')}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <FiArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{client.name}</h1>
                <p className="text-sm text-gray-600">{client.email}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setGalleryModalOpen(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
              >
                <FiPlus className="w-4 h-4" />
                <span>New Gallery</span>
              </button>
              <button
                onClick={() => setUploadModalOpen(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition"
              >
                <FiUpload className="w-4 h-4" />
                <span>Bulk Upload</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6">
        {client.galleries.length === 0 ? (
          <div className="bg-white dark:bg-dark-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
            <FiImage className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">No Galleries Yet</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Create a gallery to organize and share photos with {client.name}
            </p>
            <button
              onClick={() => setGalleryModalOpen(true)}
              className="inline-flex items-center space-x-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition"
            >
              <FiPlus className="w-5 h-5" />
              <span>Create First Gallery</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {client.galleries.map((gallery) => (
              <div
                key={gallery.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition"
              >
                {gallery.coverImage ? (
                  <div className="aspect-video bg-gray-100 relative">
                    <img
                      src={gallery.coverImage}
                      alt={gallery.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                    <FiImage className="w-12 h-12 text-gray-400" />
                  </div>
                )}

                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    {gallery.name}
                  </h3>
                  
                  {gallery.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                      {gallery.description}
                    </p>
                  )}

                  <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                    <span className="flex items-center">
                      <FiImage className="w-4 h-4 mr-1" />
                      {gallery._count.photos} photos
                    </span>
                    {gallery.expiresAt && (
                      <span className="flex items-center">
                        <FiCalendar className="w-4 h-4 mr-1" />
                        {new Date(gallery.expiresAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center space-x-2 pt-3 border-t border-gray-100">
                    <button
                      onClick={() => {
                        setSelectedGallery(gallery.id);
                        setUploadModalOpen(true);
                      }}
                      className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-primary/10 text-primary rounded hover:bg-primary/20 transition text-sm"
                    >
                      <FiUpload className="w-4 h-4" />
                      <span>Upload</span>
                    </button>
                    <button
                      onClick={() => handleDeleteGallery(gallery.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Create Gallery Modal */}
      {galleryModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Create New Gallery</h2>
              <button onClick={() => setGalleryModalOpen(false)} className="text-gray-500 hover:text-gray-700">
                <FiX className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleCreateGallery} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gallery Name *
                </label>
                <input
                  type="text"
                  value={galleryForm.name}
                  onChange={(e) => setGalleryForm({ ...galleryForm, name: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Wedding Photos - June 2025"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={galleryForm.description}
                  onChange={(e) => setGalleryForm({ ...galleryForm, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Beautiful moments from your special day..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Expiration Date (optional)
                </label>
                <input
                  type="date"
                  value={galleryForm.expiresAt}
                  onChange={(e) => setGalleryForm({ ...galleryForm, expiresAt: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gallery Password (optional)
                </label>
                <input
                  type="password"
                  value={galleryForm.password}
                  onChange={(e) => setGalleryForm({ ...galleryForm, password: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Extra protection for this gallery"
                />
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="allowDownload"
                  checked={galleryForm.allowDownload}
                  onChange={(e) => setGalleryForm({ ...galleryForm, allowDownload: e.target.checked })}
                  className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                />
                <label htmlFor="allowDownload" className="text-sm font-medium text-gray-700">
                  Allow downloads
                </label>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setGalleryModalOpen(false)}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition"
                >
                  Create Gallery
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Upload Modal */}
      {uploadModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Bulk Upload Photos</h2>
              <button onClick={() => { setUploadModalOpen(false); setUploadedPhotos([]); }} className="text-gray-500 hover:text-gray-700">
                <FiX className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Gallery *
                </label>
                <select
                  value={selectedGallery}
                  onChange={(e) => setSelectedGallery(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="">Choose a gallery...</option>
                  {client.galleries.map((gallery) => (
                    <option key={gallery.id} value={gallery.id}>
                      {gallery.name} ({gallery._count.photos} photos)
                    </option>
                  ))}
                </select>
              </div>

              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <CldUploadWidget
                  cloudName="dc67gl8fu"
                  uploadPreset="aminoss_portfolio"
                  onSuccess={handleUploadSuccess}
                  options={{
                    multiple: true,
                    maxFiles: 50,
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
                <p className="text-sm text-gray-600 mt-3">
                  Upload multiple photos at once (JPG, PNG, WEBP)
                </p>
              </div>

              {uploadedPhotos.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-3">
                    Uploaded Photos ({uploadedPhotos.length})
                  </h3>
                  <div className="grid grid-cols-4 gap-3 max-h-80 overflow-y-auto">
                    {uploadedPhotos.map((photo, idx) => (
                      <div key={idx} className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden group">
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

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => { setUploadModalOpen(false); setUploadedPhotos([]); }}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSavePhotos}
                  disabled={!selectedGallery || uploadedPhotos.length === 0 || uploading}
                  className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploading ? 'Saving...' : `Save ${uploadedPhotos.length} Photos`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
