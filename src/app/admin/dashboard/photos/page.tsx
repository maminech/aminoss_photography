'use client';

import { useState, useEffect } from 'react';
import { FiUpload, FiTrash2, FiEdit2, FiX, FiStar, FiCheck } from 'react-icons/fi';
import Image from 'next/image';
import { CldUploadWidget } from 'next-cloudinary';
import InstagramSync from '@/components/InstagramSync';

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
  showOnHomepage: boolean;
  showInGallery: boolean;
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
  const [uploading, setUploading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<ImageData | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [filterCategory, setFilterCategory] = useState('all');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [selectAll, setSelectAll] = useState(false);

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

  // Handle upload success
  const handleUploadSuccess = async (result: any) => {
    try {
      setUploading(true);
      
      // Generate thumbnail URL with Cloudinary transformation
      // Using larger size and higher quality for crisp display
      const thumbnailUrl = result.info.secure_url.replace(
        '/upload/',
        '/upload/w_800,h_800,c_fill,q_90,f_auto/'
      );
      
      // Extract filename from public_id and clean it up for title
      const filename = result.info.public_id.split('/').pop() || 'Untitled';
      // Remove Cloudinary ID suffix (e.g., "_abc123") and replace underscores/hyphens with spaces
      const cleanTitle = filename
        .replace(/_[a-z0-9]{6}$/i, '') // Remove Cloudinary suffix
        .replace(/[_-]/g, ' ') // Replace underscores and hyphens with spaces
        .replace(/\s+/g, ' ') // Normalize multiple spaces
        .trim();
      
      const response = await fetch('/api/admin/images/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cloudinaryId: result.info.public_id,
          url: result.info.secure_url,
          thumbnailUrl: thumbnailUrl,
          title: cleanTitle || null,
          width: result.info.width,
          height: result.info.height,
          format: result.info.format,
          category: 'weddings', // default category
          tags: [],
          featured: false,
          showOnHomepage: false,
          showInGallery: true,
        }),
      });

      if (response.ok) {
        alert('✅ Photo uploaded successfully!');
        fetchImages();
      } else {
        const error = await response.json();
        alert(`❌ Error: ${error.error || 'Failed to save photo'}`);
      }
    } catch (error) {
      console.error('Error saving photo:', error);
      alert('❌ Failed to save photo');
    } finally {
      setUploading(false);
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
  const deleteImage = async (id: string, cloudinaryId: string) => {
    const options = await new Promise<'database' | 'both' | null>((resolve) => {
      const choice = confirm(
        '❌ Delete this photo?\n\n' +
        'Click OK to delete from DATABASE ONLY (keeps in Cloudinary)\n' +
        'Click Cancel then choose "Delete from Both" to delete everywhere'
      );
      
      if (choice) {
        resolve('database');
      } else {
        const deleteBoth = confirm(
          '⚠️ DELETE FROM BOTH?\n\n' +
          'This will permanently delete the photo from:\n' +
          '✓ Your website database\n' +
          '✓ Cloudinary storage\n\n' +
          'This CANNOT be undone!\n\n' +
          'Click OK to delete from BOTH'
        );
        resolve(deleteBoth ? 'both' : null);
      }
    });

    if (!options) return; // User cancelled

    try {
      const deleteFromCloudinary = options === 'both';
      const res = await fetch(`/api/admin/images?id=${id}&deleteFromCloudinary=${deleteFromCloudinary}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        const data = await res.json();
        alert(`✅ ${data.message}`);
        fetchImages();
      } else {
        alert('❌ Failed to delete image');
      }
    } catch (error) {
      console.error('Error deleting image:', error);
      alert('❌ Failed to delete image');
    }
  };

  // Toggle featured
  const toggleFeatured = async (image: ImageData) => {
    await updateImage(image.id, { featured: !image.featured });
  };

  // Bulk helpers
  const toggleSelectOne = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedIds(new Set());
      setSelectAll(false);
    } else {
      const ids = new Set(filteredImages.map((i) => i.id));
      setSelectedIds(ids);
      setSelectAll(true);
    }
  };

  const bulkUpdate = async (data: Partial<ImageData>) => {
    if (selectedIds.size === 0) return;
    try {
      const res = await fetch('/api/admin/images/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: Array.from(selectedIds), action: 'update', data }),
      });

      if (res.ok) {
        const json = await res.json();
        alert(json.message || 'Updated selected photos');
        setSelectedIds(new Set());
        setSelectAll(false);
        fetchImages();
      } else {
        const err = await res.json();
        alert(`❌ ${err.error || 'Bulk update failed'}`);
      }
    } catch (error) {
      console.error('Bulk update error:', error);
      alert('❌ Bulk update failed');
    }
  };

  const bulkDelete = async () => {
    if (selectedIds.size === 0) return;
    const confirmDelete = confirm(
      `Delete ${selectedIds.size} selected photos?\n\nClick OK to delete from DATABASE ONLY. Click Cancel then choose "Delete from Both" to delete everywhere.`
    );

    let deleteBoth = false;
    if (!confirmDelete) {
      deleteBoth = confirm('⚠️ DELETE FROM BOTH? This will remove files from Cloudinary too. Click OK to proceed.');
      if (!deleteBoth) return;
    }

    try {
      const res = await fetch('/api/admin/images/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: Array.from(selectedIds), action: 'delete', deleteFromCloudinary: deleteBoth }),
      });

      if (res.ok) {
        const json = await res.json();
        alert(json.message || 'Deleted selected photos');
        setSelectedIds(new Set());
        setSelectAll(false);
        fetchImages();
      } else {
        const err = await res.json();
        alert(`❌ ${err.error || 'Bulk delete failed'}`);
      }
    } catch (error) {
      console.error('Bulk delete error:', error);
      alert('❌ Bulk delete failed');
    }
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
                {images.length} photos • {images.filter(i => i.featured).length} featured • {images.filter(i => i.showOnHomepage).length} on homepage
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              {/* Instagram Sync Button */}
              <InstagramSync />
              
              {/* Upload Photos Button */}
              <CldUploadWidget
                uploadPreset="aminoss_portfolio"
                options={{
                  folder: 'portfolio',
                  resourceType: 'image',
                  clientAllowedFormats: ['jpg', 'jpeg', 'png', 'webp'],
                  multiple: true,
                  maxFiles: 50,
                }}
                onSuccess={(result: any) => {
                  handleUploadSuccess(result);
                }}
              >
                {({ open }) => (
                  <button
                    onClick={() => open()}
                    disabled={uploading}
                    className="flex items-center space-x-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition disabled:opacity-50 active:scale-95"
                  >
                    <FiUpload className="w-4 h-4" />
                    <span>{uploading ? 'Uploading...' : 'Upload Photos'}</span>
                  </button>
                )}
              </CldUploadWidget>
            </div>

            {/* Bulk actions bar (visible when photos are selected) */}
            {selectedIds.size > 0 && (
              <div className="mt-3 p-3 rounded-lg bg-white dark:bg-dark-800 border border-gray-200 dark:border-gray-700 flex items-center gap-3">
                <div className="text-sm text-gray-800 dark:text-gray-200">
                  {selectedIds.size} selected
                </div>
                <button
                  onClick={() => bulkDelete()}
                  className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                >
                  Delete
                </button>
                <button
                  onClick={() => bulkDelete()}
                  className="px-3 py-2 bg-red-600/90 text-white rounded-lg hover:bg-red-700 transition"
                >
                  Delete from both
                </button>
                <button
                  onClick={() => bulkUpdate({ featured: true })}
                  className="px-3 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition"
                >
                  Set Featured
                </button>
                <button
                  onClick={() => bulkUpdate({ showOnHomepage: true })}
                  className="px-3 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition"
                >
                  Show on Homepage
                </button>
                <button
                  onClick={() => {
                    setSelectedIds(new Set());
                    setSelectAll(false);
                  }}
                  className="px-3 py-2 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-700 transition"
                >
                  Clear
                </button>
                <div className="ml-auto">
                  <label className="inline-flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                    <input
                      type="checkbox"
                      checked={selectAll}
                      onChange={toggleSelectAll}
                      className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 bg-white dark:bg-dark-700"
                    />
                    Select all
                  </label>
                </div>
              </div>
            )}
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
              Click "Upload Photos" to add your portfolio images
            </p>
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
                  {/* Selection checkbox */}
                  <div className="absolute top-2 left-2 z-30">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(image.id)}
                      onChange={() => toggleSelectOne(image.id)}
                      className="w-5 h-5 rounded border-gray-300 dark:border-gray-600 bg-white dark:bg-dark-700 text-primary focus:ring-primary"
                    />
                  </div>

                  <Image
                    src={image.thumbnailUrl}
                    alt={image.title || 'Photo'}
                    fill
                    className="object-cover"
                  />
                  
                  {/* Badges */}
                  <div className="absolute top-2 right-2 flex flex-col gap-1">
                    {image.featured && (
                      <div className="bg-yellow-400 text-gray-900 px-2 py-1 rounded-full text-xs font-semibold flex items-center space-x-1">
                        <FiStar className="w-3 h-3" />
                        <span>Featured</span>
                      </div>
                    )}
                    {image.showOnHomepage && (
                      <div className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                        Homepage
                      </div>
                    )}
                    {!image.showInGallery && (
                      <div className="bg-gray-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                        Hidden
                      </div>
                    )}
                  </div>
                  
                  {/* Overlay Actions */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center space-x-2">
                    <button
                      onClick={() => {
                        setSelectedImage(image);
                        setEditModalOpen(true);
                      }}
                      className="p-2 bg-white/95 dark:bg-dark-700/95 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-600 transition shadow-sm"
                    >
                      <FiEdit2 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => toggleFeatured(image)}
                      className="p-2 bg-white/95 dark:bg-dark-700/95 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-600 transition shadow-sm"
                    >
                      <FiStar className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => deleteImage(image.id, image.cloudinaryId)}
                      className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition shadow-sm"
                    >
                      <FiTrash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Info */}
                <div className="p-4">
                  <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-1 truncate">
                    {image.title || 
                      (image.cloudinaryId.split('/').pop()?.replace(/_[a-z0-9]{6}$/i, '').replace(/[_-]/g, ' ') || 'Untitled')}
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
    showOnHomepage: image.showOnHomepage,
    showInGallery: image.showInGallery,
    order: image.order,
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
              ⭐ Set as featured photo (highlighted everywhere)
            </label>
          </div>

          {/* Show on Homepage */}
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="showOnHomepage"
              checked={formData.showOnHomepage}
              onChange={(e) =>
                setFormData({ ...formData, showOnHomepage: e.target.checked })
              }
              className="w-4 h-4 text-primary border-gray-300 dark:border-gray-600 rounded focus:ring-primary"
            />
            <label htmlFor="showOnHomepage" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              🏠 Show on homepage gallery
            </label>
          </div>

          {/* Show in Gallery */}
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="showInGallery"
              checked={formData.showInGallery}
              onChange={(e) =>
                setFormData({ ...formData, showInGallery: e.target.checked })
              }
              className="w-4 h-4 text-primary border-gray-300 dark:border-gray-600 rounded focus:ring-primary"
            />
            <label htmlFor="showInGallery" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              📸 Show in gallery page
            </label>
          </div>

          {/* Display Order */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Display Order (lower numbers appear first)
            </label>
            <input
              type="number"
              value={formData.order}
              onChange={(e) =>
                setFormData({ ...formData, order: parseInt(e.target.value) || 0 })
              }
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-dark-700 text-gray-900 dark:text-gray-100"
              placeholder="0"
            />
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


