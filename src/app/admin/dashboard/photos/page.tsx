'use client';

import { useState, useEffect } from 'react';
import { FiRefreshCw, FiUpload, FiTrash2, FiEdit2, FiX, FiStar, FiCheck } from 'react-icons/fi';
import Image from 'next/image';

interface ImageData {
  id: string;
  cloudinaryId: string;
  url: string;
  thumbnailUrl: string;
  title?: string;
  description?: string;
  category: string;
  tags: string[];
  featured: boolean;
  order: number;
  width?: number;
  height?: number;
  format?: string;
  createdAt: string;
  updatedAt: string;
}

export default function AdminPhotosPage() {
  const [images, setImages] = useState<ImageData[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [selectedImage, setSelectedImage] = useState<ImageData | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [filterCategory, setFilterCategory] = useState('all');

  const categories = ['all', 'weddings', 'portraits', 'travel', 'fashion', 'events'];

  // Fetch images
  const fetchImages = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/images');
      if (res.ok) {
        const data = await res.json();
        setImages(data);
      }
    } catch (error) {
      console.error('Error fetching images:', error);
    } finally {
      setLoading(false);
    }
  };

  // Sync from Cloudinary
  const syncFromCloudinary = async () => {
    try {
      setSyncing(true);
      const res = await fetch('/api/admin/images', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ folder: '' }), // Empty string = root folder
      });

      if (res.ok) {
        const data = await res.json();
        alert(`✅ ${data.message}`);
        fetchImages();
      } else {
        const error = await res.json();
        alert(`❌ Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Error syncing:', error);
      alert('❌ Failed to sync images');
    } finally {
      setSyncing(false);
    }
  };

  // Update image
  const updateImage = async (id: string, data: Partial<ImageData>) => {
    try {
      const res = await fetch('/api/admin/images', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...data }),
      });

      if (res.ok) {
        fetchImages();
        setEditModalOpen(false);
        setSelectedImage(null);
      }
    } catch (error) {
      console.error('Error updating image:', error);
    }
  };

  // Delete image
  const deleteImage = async (id: string) => {
    if (!confirm('Are you sure you want to delete this image?')) return;

    try {
      const res = await fetch(`/api/admin/images?id=${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        fetchImages();
      }
    } catch (error) {
      console.error('Error deleting image:', error);
    }
  };

  // Toggle featured
  const toggleFeatured = async (image: ImageData) => {
    await updateImage(image.id, { featured: !image.featured });
  };

  useEffect(() => {
    fetchImages();
  }, []);

  const filteredImages = filterCategory === 'all'
    ? images
    : images.filter((img) => img.category === filterCategory);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-900">
      {/* Header */}
      <header className="bg-white dark:bg-dark-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-30">
        <div className="px-6 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Photos Management</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {images.length} photos • {images.filter(i => i.featured).length} featured
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={syncFromCloudinary}
                disabled={syncing}
                className="flex items-center space-x-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition disabled:opacity-50"
              >
                <FiRefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
                <span>{syncing ? 'Syncing...' : 'Sync from Cloudinary'}</span>
              </button>
              <a
                href="https://cloudinary.com/console"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 px-4 py-2 bg-gray-100 dark:bg-dark-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-dark-600 transition"
              >
                <FiUpload className="w-4 h-4" />
                <span>Upload to Cloudinary</span>
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6">
        {/* Category Filter */}
        <div className="bg-white dark:bg-dark-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
          <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-3">Filter by Category</h3>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  filterCategory === cat
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 dark:bg-dark-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-dark-600'
                }`}
              >
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Images Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : filteredImages.length === 0 ? (
          <div className="bg-white dark:bg-dark-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
            <FiUpload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              No Photos Yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Upload photos to your Cloudinary folder, then click "Sync from Cloudinary"
            </p>
            <a
              href="https://cloudinary.com/console"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition"
            >
              <FiUpload className="w-5 h-5" />
              <span>Go to Cloudinary</span>
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredImages.map((image) => (
              <div
                key={image.id}
                className="bg-white dark:bg-dark-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden group"
              >
                {/* Image */}
                <div className="relative aspect-square">
                  <Image
                    src={image.thumbnailUrl}
                    alt={image.title || 'Photo'}
                    fill
                    className="object-cover"
                  />
                  {image.featured && (
                    <div className="absolute top-2 right-2 bg-yellow-400 text-gray-900 px-2 py-1 rounded-full text-xs font-semibold flex items-center space-x-1">
                      <FiStar className="w-3 h-3" />
                      <span>Featured</span>
                    </div>
                  )}
                  
                  {/* Overlay Actions */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center space-x-2">
                    <button
                      onClick={() => {
                        setSelectedImage(image);
                        setEditModalOpen(true);
                      }}
                      className="p-2 bg-white dark:bg-dark-700 text-gray-900 dark:text-gray-100 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-600 transition"
                    >
                      <FiEdit2 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => toggleFeatured(image)}
                      className="p-2 bg-white dark:bg-dark-700 text-gray-900 dark:text-gray-100 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-600 transition"
                    >
                      <FiStar className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => deleteImage(image.id)}
                      className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                    >
                      <FiTrash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Info */}
                <div className="p-4">
                  <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-1 truncate">
                    {image.title || 'Untitled'}
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                    {image.category} • {image.width}x{image.height}
                  </p>
                  {image.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                      {image.description}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Edit Modal */}
      {editModalOpen && selectedImage && (
        <EditImageModal
          image={selectedImage}
          onClose={() => {
            setEditModalOpen(false);
            setSelectedImage(null);
          }}
          onSave={(data) => updateImage(selectedImage.id, data)}
          categories={categories.filter((c) => c !== 'all')}
        />
      )}
    </div>
  );
}

function EditImageModal({
  image,
  onClose,
  onSave,
  categories,
}: {
  image: ImageData;
  onClose: () => void;
  onSave: (data: Partial<ImageData>) => void;
  categories: string[];
}) {
  const [formData, setFormData] = useState({
    title: image.title || '',
    description: image.description || '',
    category: image.category,
    featured: image.featured,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-dark-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Edit Photo</h2>
          <button
            onClick={onClose}
            className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
          >
            <FiX className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Preview */}
          <div className="relative aspect-video rounded-lg overflow-hidden">
            <Image
              src={image.url}
              alt={image.title || 'Photo'}
              fill
              className="object-cover"
            />
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Title
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-dark-700 text-gray-900 dark:text-gray-100"
              placeholder="Photo title"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-dark-700 text-gray-900 dark:text-gray-100"
              placeholder="Photo description"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Category
            </label>
            <select
              value={formData.category}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-dark-700 text-gray-900 dark:text-gray-100"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Featured */}
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="featured"
              checked={formData.featured}
              onChange={(e) =>
                setFormData({ ...formData, featured: e.target.checked })
              }
              className="w-4 h-4 text-primary border-gray-300 dark:border-gray-600 rounded focus:ring-primary"
            />
            <label htmlFor="featured" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Set as featured photo
            </label>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-700 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

