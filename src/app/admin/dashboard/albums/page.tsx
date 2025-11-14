'use client';

import { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiImage, FiX, FiStar, FiEye, FiEyeOff } from 'react-icons/fi';
import Image from 'next/image';

interface ImageData {
  id: string;
  url: string;
  thumbnailUrl: string;
  title?: string;
  order: number;
}

interface AlbumData {
  id: string;
  title: string;
  description?: string;
  coverImageUrl?: string;
  category: string;
  featured: boolean;
  showOnHomepage: boolean;
  showInGallery: boolean;
  order: number;
  images: ImageData[];
  _count: { images: number };
  createdAt: string;
  updatedAt: string;
}

export default function AdminAlbumsPage() {
  const [albums, setAlbums] = useState<AlbumData[]>([]);
  const [loading, setLoading] = useState(true);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [managePhotosModalOpen, setManagePhotosModalOpen] = useState(false);
  const [selectedAlbum, setSelectedAlbum] = useState<AlbumData | null>(null);
  const [filterCategory, setFilterCategory] = useState('all');

  const categories = ['all', 'weddings', 'portraits', 'travel', 'fashion', 'events'];

  // Fetch albums
  const fetchAlbums = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/albums');
      if (res.ok) {
        const data = await res.json();
        setAlbums(data);
      }
    } catch (error) {
      console.error('Error fetching albums:', error);
    } finally {
      setLoading(false);
    }
  };

  // Create album
  const createAlbum = async (data: Partial<AlbumData>) => {
    try {
      console.log('Creating album with data:', data);
      const res = await fetch('/api/admin/albums', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      console.log('Response status:', res.status);
      const responseData = await res.json();
      console.log('Response data:', responseData);

      if (res.ok) {
        alert('✅ Album created successfully!');
        fetchAlbums();
        setCreateModalOpen(false);
      } else {
        alert(`❌ Error: ${responseData.error || 'Failed to create album'}\n\nStatus: ${res.status}`);
      }
    } catch (error) {
      console.error('Error creating album:', error);
      alert(`❌ Failed to create album\n\nError: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // Update album
  const updateAlbum = async (id: string, data: Partial<AlbumData>) => {
    try {
      const res = await fetch('/api/admin/albums', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...data }),
      });

      if (res.ok) {
        fetchAlbums();
        setEditModalOpen(false);
        setSelectedAlbum(null);
      }
    } catch (error) {
      console.error('Error updating album:', error);
    }
  };

  // Delete album
  const deleteAlbum = async (id: string) => {
    const confirmDelete = confirm(
      '❌ Delete this album?\n\n' +
      'Photos will NOT be deleted, only unlinked from this album.\n' +
      'Click OK to continue.'
    );

    if (!confirmDelete) return;

    try {
      const res = await fetch(`/api/admin/albums?id=${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        alert('✅ Album deleted successfully!');
        fetchAlbums();
      } else {
        alert('❌ Failed to delete album');
      }
    } catch (error) {
      console.error('Error deleting album:', error);
      alert('❌ Failed to delete album');
    }
  };

  // Toggle featured
  const toggleFeatured = async (album: AlbumData) => {
    await updateAlbum(album.id, { featured: !album.featured });
  };

  // Toggle visibility
  const toggleVisibility = async (album: AlbumData) => {
    await updateAlbum(album.id, { showInGallery: !album.showInGallery });
  };

  useEffect(() => {
    fetchAlbums();
  }, []);

  const filteredAlbums = filterCategory === 'all'
    ? albums
    : albums.filter((album) => album.category === filterCategory);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-900">
      {/* Header */}
      <header className="bg-white dark:bg-dark-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-30">
        <div className="px-3 sm:px-4 md:px-6 py-3 sm:py-4">
          <div className="flex flex-col gap-3 sm:gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
                📸 Albums Management
              </h1>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
                Instagram-style photo albums • {albums.length} albums • {albums.reduce((acc, a) => acc + a._count.images, 0)} photos
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <button
                onClick={() => setCreateModalOpen(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition active:scale-95"
              >
                <FiPlus className="w-4 h-4" />
                <span>Create Album</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-3 sm:p-4 md:p-6">
        {/* Category Filter */}
        <div className="bg-white dark:bg-dark-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-3 sm:p-4 mb-4 sm:mb-6">
          <h3 className="text-sm sm:text-base font-medium text-gray-900 dark:text-gray-100 mb-3">Filter by Category</h3>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`px-3 xs:px-4 py-2 min-h-[44px] text-sm rounded-lg font-medium transition active:scale-95 ${
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

        {/* Albums Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : filteredAlbums.length === 0 ? (
          <div className="bg-white dark:bg-dark-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
            <FiImage className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              No Albums Yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Click "Create Album" to start organizing your photos like Instagram posts
            </p>
            <button
              onClick={() => setCreateModalOpen(true)}
              className="inline-flex items-center space-x-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition active:scale-95"
            >
              <FiPlus className="w-5 h-5" />
              <span>Create Your First Album</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {filteredAlbums.map((album) => (
              <div
                key={album.id}
                className="bg-white dark:bg-dark-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden group hover:shadow-lg transition-shadow"
              >
                {/* Cover Image */}
                <div className="relative aspect-square bg-gray-100 dark:bg-dark-700">
                  {album.coverImageUrl ? (
                    <Image
                      src={album.coverImageUrl}
                      alt={album.title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <FiImage className="w-16 h-16 text-gray-300 dark:text-gray-600" />
                    </div>
                  )}
                  
                  {/* Photo Count Badge */}
                  <div className="absolute top-2 right-2 bg-black/70 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center space-x-1">
                    <FiImage className="w-4 h-4" />
                    <span>{album._count.images}</span>
                  </div>
                  
                  {/* Status Badges */}
                  <div className="absolute top-2 left-2 flex flex-col gap-1">
                    {album.featured && (
                      <div className="bg-yellow-400 text-gray-900 px-2 py-1 rounded-full text-xs font-semibold flex items-center space-x-1">
                        <FiStar className="w-3 h-3" />
                        <span>Featured</span>
                      </div>
                    )}
                    {album.showOnHomepage && (
                      <div className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                        Homepage
                      </div>
                    )}
                    {!album.showInGallery && (
                      <div className="bg-gray-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                        Hidden
                      </div>
                    )}
                  </div>
                  
                  {/* Overlay Actions */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center space-x-2">
                    <button
                      onClick={() => {
                        setSelectedAlbum(album);
                        setManagePhotosModalOpen(true);
                      }}
                      className="p-3 bg-white/95 dark:bg-dark-700/95 text-gray-900 dark:text-gray-100 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-600 transition active:scale-95"
                      title="Manage Photos"
                    >
                      <FiImage className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => {
                        setSelectedAlbum(album);
                        setEditModalOpen(true);
                      }}
                      className="p-3 bg-white/95 dark:bg-dark-700/95 text-gray-900 dark:text-gray-100 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-600 transition active:scale-95"
                      title="Edit Album"
                    >
                      <FiEdit2 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => toggleFeatured(album)}
                      className="p-3 bg-white/95 dark:bg-dark-700/95 text-gray-900 dark:text-gray-100 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-600 transition active:scale-95"
                      title="Toggle Featured"
                    >
                      <FiStar className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => toggleVisibility(album)}
                      className="p-3 bg-white/95 dark:bg-dark-700/95 text-gray-900 dark:text-gray-100 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-600 transition active:scale-95"
                      title="Toggle Visibility"
                    >
                      {album.showInGallery ? (
                        <FiEye className="w-5 h-5" />
                      ) : (
                        <FiEyeOff className="w-5 h-5" />
                      )}
                    </button>
                    <button
                      onClick={() => deleteAlbum(album.id)}
                      className="p-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition active:scale-95"
                      title="Delete Album"
                    >
                      <FiTrash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Info */}
                <div className="p-4">
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1 truncate">
                    {album.title}
                  </h4>
                  {album.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">
                      {album.description}
                    </p>
                  )}
                  <p className="text-xs text-gray-500 dark:text-gray-500">
                    {album.category} • {album._count.images} {album._count.images === 1 ? 'photo' : 'photos'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Create Modal */}
      {createModalOpen && (
        <CreateAlbumModal
          onClose={() => setCreateModalOpen(false)}
          onSave={createAlbum}
          categories={categories.filter((c) => c !== 'all')}
        />
      )}

      {/* Edit Modal */}
      {editModalOpen && selectedAlbum && (
        <EditAlbumModal
          album={selectedAlbum}
          onClose={() => {
            setEditModalOpen(false);
            setSelectedAlbum(null);
          }}
          onSave={(data) => updateAlbum(selectedAlbum.id, data)}
          categories={categories.filter((c) => c !== 'all')}
        />
      )}

      {/* Manage Photos Modal */}
      {managePhotosModalOpen && selectedAlbum && (
        <ManagePhotosModal
          album={selectedAlbum}
          onClose={() => {
            setManagePhotosModalOpen(false);
            setSelectedAlbum(null);
            fetchAlbums();
          }}
        />
      )}
    </div>
  );
}

// Create Album Modal
function CreateAlbumModal({
  onClose,
  onSave,
  categories,
}: {
  onClose: () => void;
  onSave: (data: Partial<AlbumData>) => void;
  categories: string[];
}) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'weddings',
    featured: false,
    showOnHomepage: false,
    showInGallery: true,
    order: 0,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      alert('❌ Please enter an album title');
      return;
    }
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white dark:bg-dark-800 rounded-xl max-w-2xl w-full my-auto">
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100">Create New Album</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 active:scale-95 transition"
          >
            <FiX className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-5">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Album Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 min-h-[48px] border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-dark-700 text-gray-900 dark:text-gray-100"
              placeholder="e.g., Sarah & John's Wedding"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-dark-700 text-gray-900 dark:text-gray-100"
              placeholder="Album description..."
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Category
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-4 py-2 min-h-[48px] border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-dark-700 text-gray-900 dark:text-gray-100"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Checkboxes */}
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="featured"
                checked={formData.featured}
                onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                className="w-4 h-4 text-primary border-gray-300 dark:border-gray-600 rounded focus:ring-primary"
              />
              <label htmlFor="featured" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                ⭐ Set as featured album
              </label>
            </div>

            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="showOnHomepage"
                checked={formData.showOnHomepage}
                onChange={(e) => setFormData({ ...formData, showOnHomepage: e.target.checked })}
                className="w-4 h-4 text-primary border-gray-300 dark:border-gray-600 rounded focus:ring-primary"
              />
              <label htmlFor="showOnHomepage" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                🏠 Show on homepage
              </label>
            </div>

            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="showInGallery"
                checked={formData.showInGallery}
                onChange={(e) => setFormData({ ...formData, showInGallery: e.target.checked })}
                className="w-4 h-4 text-primary border-gray-300 dark:border-gray-600 rounded focus:ring-primary"
              />
              <label htmlFor="showInGallery" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                📸 Show in gallery
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 min-h-[48px] border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-700 transition active:scale-95"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 min-h-[48px] bg-primary text-white rounded-lg hover:bg-primary/90 transition active:scale-95"
            >
              Create Album
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Edit Album Modal (similar to Create)
function EditAlbumModal({
  album,
  onClose,
  onSave,
  categories,
}: {
  album: AlbumData;
  onClose: () => void;
  onSave: (data: Partial<AlbumData>) => void;
  categories: string[];
}) {
  const [formData, setFormData] = useState({
    title: album.title,
    description: album.description || '',
    category: album.category,
    featured: album.featured,
    showOnHomepage: album.showOnHomepage,
    showInGallery: album.showInGallery,
    order: album.order,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white dark:bg-dark-800 rounded-xl max-w-2xl w-full my-auto">
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100">Edit Album</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 active:scale-95 transition"
          >
            <FiX className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-5">
          {/* Same fields as CreateAlbumModal */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Album Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 min-h-[48px] border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-dark-700 text-gray-900 dark:text-gray-100"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-dark-700 text-gray-900 dark:text-gray-100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Category
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-4 py-2 min-h-[48px] border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-dark-700 text-gray-900 dark:text-gray-100"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="edit-featured"
                checked={formData.featured}
                onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                className="w-4 h-4 text-primary border-gray-300 dark:border-gray-600 rounded focus:ring-primary"
              />
              <label htmlFor="edit-featured" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                ⭐ Set as featured album
              </label>
            </div>

            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="edit-showOnHomepage"
                checked={formData.showOnHomepage}
                onChange={(e) => setFormData({ ...formData, showOnHomepage: e.target.checked })}
                className="w-4 h-4 text-primary border-gray-300 dark:border-gray-600 rounded focus:ring-primary"
              />
              <label htmlFor="edit-showOnHomepage" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                🏠 Show on homepage
              </label>
            </div>

            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="edit-showInGallery"
                checked={formData.showInGallery}
                onChange={(e) => setFormData({ ...formData, showInGallery: e.target.checked })}
                className="w-4 h-4 text-primary border-gray-300 dark:border-gray-600 rounded focus:ring-primary"
              />
              <label htmlFor="edit-showInGallery" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                📸 Show in gallery
              </label>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 min-h-[48px] border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-700 transition active:scale-95"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 min-h-[48px] bg-primary text-white rounded-lg hover:bg-primary/90 transition active:scale-95"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Manage Photos Modal
function ManagePhotosModal({
  album,
  onClose,
}: {
  album: AlbumData;
  onClose: () => void;
}) {
  const [availableImages, setAvailableImages] = useState<ImageData[]>([]);
  const [selectedImageIds, setSelectedImageIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  // Fetch available images (not in any album)
  const fetchAvailableImages = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/images');
      if (res.ok) {
        const data = await res.json();
        // Filter images that are not in any album
        const unassignedImages = data.filter((img: any) => !img.albumId);
        setAvailableImages(unassignedImages);
      }
    } catch (error) {
      console.error('Error fetching images:', error);
    } finally {
      setLoading(false);
    }
  };

  // Add photos to album
  const addPhotosToAlbum = async () => {
    if (selectedImageIds.size === 0) {
      alert('❌ Please select at least one photo');
      return;
    }

    try {
      const res = await fetch(`/api/admin/albums/${album.id}/photos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageIds: Array.from(selectedImageIds) }),
      });

      if (res.ok) {
        alert(`✅ Added ${selectedImageIds.size} photo(s) to album!`);
        setSelectedImageIds(new Set());
        fetchAvailableImages();
        onClose();
      } else {
        alert('❌ Failed to add photos');
      }
    } catch (error) {
      console.error('Error adding photos:', error);
      alert('❌ Failed to add photos');
    }
  };

  // Remove photo from album
  const removePhotoFromAlbum = async (imageId: string) => {
    if (!confirm('Remove this photo from the album?')) return;

    try {
      const res = await fetch(
        `/api/admin/albums/${album.id}/photos?imageId=${imageId}`,
        { method: 'DELETE' }
      );

      if (res.ok) {
        alert('✅ Photo removed from album!');
        onClose();
      } else {
        alert('❌ Failed to remove photo');
      }
    } catch (error) {
      console.error('Error removing photo:', error);
      alert('❌ Failed to remove photo');
    }
  };

  // Toggle image selection
  const toggleImageSelection = (id: string) => {
    setSelectedImageIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  useEffect(() => {
    fetchAvailableImages();
  }, []);

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white dark:bg-dark-800 rounded-xl max-w-6xl w-full my-auto max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100">
              Manage Photos - {album.title}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {album._count.images} photos in album • {selectedImageIds.size} selected
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 active:scale-95 transition"
          >
            <FiX className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {/* Current Photos in Album */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Photos in This Album ({album._count.images})
            </h3>
            {album.images.length === 0 ? (
              <p className="text-gray-600 dark:text-gray-400 text-center py-8">
                No photos yet. Add photos from the available images below.
              </p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {album.images.map((img) => (
                  <div key={img.id} className="relative group aspect-square rounded-lg overflow-hidden">
                    <Image
                      src={img.thumbnailUrl}
                      alt={img.title || 'Photo'}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                      <button
                        onClick={() => removePhotoFromAlbum(img.id)}
                        className="p-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition active:scale-95"
                      >
                        <FiTrash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Available Photos to Add */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Available Photos ({availableImages.length})
            </h3>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : availableImages.length === 0 ? (
              <p className="text-gray-600 dark:text-gray-400 text-center py-8">
                No available photos. All photos are already in albums.
              </p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {availableImages.map((img) => (
                  <div
                    key={img.id}
                    className="relative group aspect-square rounded-lg overflow-hidden cursor-pointer"
                    onClick={() => toggleImageSelection(img.id)}
                  >
                    <Image
                      src={img.thumbnailUrl}
                      alt={img.title || 'Photo'}
                      fill
                      className="object-cover"
                    />
                    {selectedImageIds.has(img.id) && (
                      <div className="absolute inset-0 bg-primary/50 flex items-center justify-center">
                        <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                          <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-6 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-6 py-2 min-h-[48px] border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-700 transition active:scale-95"
          >
            Close
          </button>
          <button
            onClick={addPhotosToAlbum}
            disabled={selectedImageIds.size === 0}
            className="px-6 py-2 min-h-[48px] bg-primary text-white rounded-lg hover:bg-primary/90 transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Add {selectedImageIds.size > 0 ? `${selectedImageIds.size} ` : ''}Selected Photo{selectedImageIds.size !== 1 ? 's' : ''}
          </button>
        </div>
      </div>
    </div>
  );
}
