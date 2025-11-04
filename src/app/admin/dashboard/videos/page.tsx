'use client';

import { useState, useEffect } from 'react';
import { FiRefreshCw, FiUpload, FiTrash2, FiEdit2, FiX, FiStar, FiPlay, FiVideo } from 'react-icons/fi';
import Image from 'next/image';

interface VideoData {
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
  duration?: number;
  format?: string;
  createdAt: string;
  updatedAt: string;
}

export default function AdminVideosPage() {
  const [videos, setVideos] = useState<VideoData[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<VideoData | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [filterCategory, setFilterCategory] = useState('all');

  const categories = ['all', 'weddings', 'events', 'fashion', 'travel', 'reels', 'commercial'];

  // Fetch videos
  const fetchVideos = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/videos');
      if (res.ok) {
        const data = await res.json();
        setVideos(data);
      }
    } catch (error) {
      console.error('Error fetching videos:', error);
    } finally {
      setLoading(false);
    }
  };

  // Sync from Cloudinary
  const syncFromCloudinary = async () => {
    try {
      setSyncing(true);
      const res = await fetch('/api/admin/videos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ folder: '', action: 'sync' }),
      });

      if (res.ok) {
        const data = await res.json();
        alert(`✅ ${data.message}`);
        fetchVideos();
      } else {
        const error = await res.json();
        alert(`❌ Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Error syncing:', error);
      alert('❌ Failed to sync videos');
    } finally {
      setSyncing(false);
    }
  };

  // Update video
  const updateVideo = async (id: string, data: Partial<VideoData>) => {
    try {
      const res = await fetch('/api/admin/videos', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...data }),
      });

      if (res.ok) {
        fetchVideos();
        setEditModalOpen(false);
        setSelectedVideo(null);
      }
    } catch (error) {
      console.error('Error updating video:', error);
    }
  };

  // Delete video
  const deleteVideo = async (id: string) => {
    if (!confirm('Are you sure you want to delete this video?')) return;

    try {
      const res = await fetch(`/api/admin/videos?id=${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        fetchVideos();
      }
    } catch (error) {
      console.error('Error deleting video:', error);
    }
  };

  // Toggle featured
  const toggleFeatured = async (video: VideoData) => {
    await updateVideo(video.id, { featured: !video.featured });
  };

  // Format duration
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  const filteredVideos = filterCategory === 'all'
    ? videos
    : videos.filter((vid) => vid.category === filterCategory);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-900">
      {/* Header */}
      <header className="bg-white dark:bg-dark-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-30">
        <div className="px-6 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Videos & Reels</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {videos.length} videos • {videos.filter(v => v.featured).length} featured
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
        {/* Instructions */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
          <div className="flex items-start space-x-3">
            <FiVideo className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                How to Upload Videos
              </h3>
              <ol className="text-sm text-blue-800 dark:text-blue-200 space-y-1 list-decimal list-inside">
                <li>Go to <a href="https://cloudinary.com/console" target="_blank" className="underline font-medium">Cloudinary Console</a></li>
                <li>Upload your videos (MP4, MOV, AVI, etc.)</li>
                <li>Click "Sync from Cloudinary" button above</li>
                <li>Edit titles, descriptions, and categories</li>
                <li>Mark videos as featured for homepage display</li>
              </ol>
            </div>
          </div>
        </div>

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

        {/* Videos Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : filteredVideos.length === 0 ? (
          <div className="bg-white dark:bg-dark-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
            <FiVideo className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              No Videos Yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Upload videos to your Cloudinary folder, then click "Sync from Cloudinary"
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
            {filteredVideos.map((video) => (
              <div
                key={video.id}
                className="bg-white dark:bg-dark-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden group"
              >
                {/* Thumbnail */}
                <div className="relative aspect-video bg-gray-900">
                  <Image
                    src={video.thumbnailUrl}
                    alt={video.title || 'Video'}
                    fill
                    className="object-cover"
                  />
                  {video.featured && (
                    <div className="absolute top-2 right-2 bg-yellow-400 text-gray-900 px-2 py-1 rounded-full text-xs font-semibold flex items-center space-x-1 z-10">
                      <FiStar className="w-3 h-3" />
                      <span>Featured</span>
                    </div>
                  )}
                  
                  {/* Duration Badge */}
                  {video.duration && (
                    <div className="absolute bottom-2 right-2 bg-black/80 text-white px-2 py-0.5 rounded text-xs font-medium z-10">
                      {formatDuration(video.duration)}
                    </div>
                  )}

                  {/* Play Icon */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 transition">
                      <FiPlay className="w-8 h-8 text-gray-900 ml-1" />
                    </div>
                  </div>
                  
                  {/* Overlay Actions */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center space-x-2">
                    <button
                      onClick={() => {
                        setSelectedVideo(video);
                        setPreviewModalOpen(true);
                      }}
                      className="p-2 bg-white dark:bg-dark-700 text-gray-900 dark:text-gray-100 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-600 transition"
                      title="Preview"
                    >
                      <FiPlay className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => {
                        setSelectedVideo(video);
                        setEditModalOpen(true);
                      }}
                      className="p-2 bg-white dark:bg-dark-700 text-gray-900 dark:text-gray-100 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-600 transition"
                      title="Edit"
                    >
                      <FiEdit2 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => toggleFeatured(video)}
                      className="p-2 bg-white dark:bg-dark-700 text-gray-900 dark:text-gray-100 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-600 transition"
                      title="Toggle Featured"
                    >
                      <FiStar className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => deleteVideo(video.id)}
                      className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                      title="Delete"
                    >
                      <FiTrash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Info */}
                <div className="p-4">
                  <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-1 truncate">
                    {video.title || 'Untitled'}
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                    {video.category} • {video.width}x{video.height}
                  </p>
                  {video.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                      {video.description}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Edit Modal */}
      {editModalOpen && selectedVideo && (
        <EditVideoModal
          video={selectedVideo}
          onClose={() => {
            setEditModalOpen(false);
            setSelectedVideo(null);
          }}
          onSave={(data) => updateVideo(selectedVideo.id, data)}
          categories={categories.filter((c) => c !== 'all')}
        />
      )}

      {/* Preview Modal */}
      {previewModalOpen && selectedVideo && (
        <PreviewVideoModal
          video={selectedVideo}
          onClose={() => {
            setPreviewModalOpen(false);
            setSelectedVideo(null);
          }}
        />
      )}
    </div>
  );
}

function EditVideoModal({
  video,
  onClose,
  onSave,
  categories,
}: {
  video: VideoData;
  onClose: () => void;
  onSave: (data: Partial<VideoData>) => void;
  categories: string[];
}) {
  const [formData, setFormData] = useState({
    title: video.title || '',
    description: video.description || '',
    category: video.category,
    featured: video.featured,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-dark-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Edit Video</h2>
          <button
            onClick={onClose}
            className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
          >
            <FiX className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Preview */}
          <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-900">
            <Image
              src={video.thumbnailUrl}
              alt={video.title || 'Video'}
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <FiPlay className="w-16 h-16 text-white/80" />
            </div>
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
              className="input-field"
              placeholder="Video title"
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
              className="input-field"
              placeholder="Video description"
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
              className="input-field"
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
              className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
            />
            <label htmlFor="featured" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Set as featured video
            </label>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function PreviewVideoModal({
  video,
  onClose,
}: {
  video: VideoData;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
      <div className="relative w-full max-w-5xl">
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 text-white hover:text-gray-300 transition"
        >
          <FiX className="w-8 h-8" />
        </button>
        
        <div className="bg-black rounded-lg overflow-hidden">
          <video
            src={video.url}
            controls
            autoPlay
            className="w-full"
          >
            Your browser does not support the video tag.
          </video>
        </div>

        <div className="mt-4 text-white">
          <h3 className="text-xl font-bold mb-2">{video.title || 'Untitled'}</h3>
          {video.description && (
            <p className="text-gray-300">{video.description}</p>
          )}
        </div>
      </div>
    </div>
  );
}
