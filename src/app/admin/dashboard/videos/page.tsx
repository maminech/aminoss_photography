'use client';

import { useState, useEffect } from 'react';
import { FiRefreshCw, FiUpload, FiTrash2, FiEdit2, FiX, FiStar, FiPlay, FiVideo } from 'react-icons/fi';
import Image from 'next/image';
import { CldUploadWidget } from 'next-cloudinary';

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
  showOnHomepage: boolean;
  showInGallery: boolean;
  showInProfessionalMode?: boolean;
  backgroundVideo?: boolean;
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
  const [selectedVideos, setSelectedVideos] = useState<Set<string>>(new Set());
  const [bulkEditMode, setBulkEditMode] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [syncModalOpen, setSyncModalOpen] = useState(false);
  const [bulkEditModalOpen, setBulkEditModalOpen] = useState(false);
  const [syncFolder, setSyncFolder] = useState('videos');
  const [filterCategory, setFilterCategory] = useState('all');

  const categories = ['all', 'weddings', 'events', 'fashion', 'travel', 'reels', 'commercial'];
  
  // Recommended folder structure
  const cloudinaryFolders = [
    { value: 'videos', label: '🎥 Videos (Main Portfolio)', description: 'Your main website portfolio videos' },
    { value: 'reels', label: '📱 Reels/Social Media', description: 'Short-form content and reels' },
    { value: '', label: '📁 Root Folder', description: 'All videos in root (not recommended)' },
  ];

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
        body: JSON.stringify({ folder: syncFolder, action: 'sync' }),
      });

      if (res.ok) {
        const data = await res.json();
        alert(`✅ ${data.message}`);
        setSyncModalOpen(false);
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

  // Bulk update videos
  const bulkUpdateVideos = async (data: Partial<VideoData>) => {
    try {
      const promises = Array.from(selectedVideos).map(id =>
        fetch('/api/admin/videos', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id, ...data }),
        })
      );

      await Promise.all(promises);
      alert(`✅ Updated ${selectedVideos.size} videos`);
      fetchVideos();
      setBulkEditModalOpen(false);
      setSelectedVideos(new Set());
      setBulkEditMode(false);
    } catch (error) {
      console.error('Error bulk updating:', error);
      alert('❌ Failed to update videos');
    }
  };

  // Toggle video selection
  const toggleVideoSelection = (id: string) => {
    const newSelection = new Set(selectedVideos);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    setSelectedVideos(newSelection);
  };

  // Select all filtered videos
  const selectAll = () => {
    const filtered = filteredVideos;
    const allIds = new Set(filtered.map((v: VideoData) => v.id));
    setSelectedVideos(allIds);
  };

  // Clear selection
  const clearSelection = () => {
    setSelectedVideos(new Set());
    setBulkEditMode(false);
  };

  // Delete video
  const deleteVideo = async (id: string, cloudinaryId: string) => {
    const options = await new Promise<'database' | 'both' | null>((resolve) => {
      const choice = confirm(
        '❌ Delete this video?\n\n' +
        'Click OK to delete from DATABASE ONLY (keeps in Cloudinary)\n' +
        'Click Cancel then choose "Delete from Both" to delete everywhere'
      );
      
      if (choice) {
        resolve('database');
      } else {
        const deleteBoth = confirm(
          '⚠️ DELETE FROM BOTH?\n\n' +
          'This will permanently delete the video from:\n' +
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
      const res = await fetch(`/api/admin/videos?id=${id}&deleteFromCloudinary=${deleteFromCloudinary}`, {
        method: 'DELETE',
      });

      const data = await res.json();
      
      if (res.ok) {
        alert(`✅ ${data.message}`);
        fetchVideos();
      } else {
        console.error('Delete video error:', data);
        alert(`❌ Failed to delete video: ${data.error || 'Unknown error'}\n${data.details || ''}`);
      }
    } catch (error) {
      console.error('Error deleting video:', error);
      alert(`❌ Failed to delete video: ${error instanceof Error ? error.message : 'Network error'}`);
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
                {videos.length} videos • {videos.filter(v => v.featured).length} featured • {videos.filter(v => v.showOnHomepage).length} on homepage
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setSyncModalOpen(true)}
                disabled={syncing}
                className="flex items-center space-x-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition disabled:opacity-50"
              >
                <FiRefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
                <span>{syncing ? 'Syncing...' : 'Sync from Cloudinary'}</span>
              </button>
              <CldUploadWidget
                uploadPreset="innov8_portfolio"
                options={{
                  resourceType: 'video',
                  sources: ['local', 'url'],
                  multiple: true,
                  maxFiles: 10,
                  clientAllowedFormats: ['mp4', 'mov', 'avi', 'webm', 'mkv', 'flv', 'wmv'],
                  maxFileSize: 500000000, // 500MB (increased)
                  folder: 'videos',
                  showAdvancedOptions: true,
                  cropping: false,
                  styles: {
                    palette: {
                      window: "#ffffff",
                      windowBorder: "#90a0b3",
                      tabIcon: "#0078FF",
                      menuIcons: "#5A616A",
                      textDark: "#000000",
                      textLight: "#FFFFFF",
                      link: "#0078FF",
                      action: "#FF620C",
                      inactiveTabIcon: "#0E2F5A",
                      error: "#F44235",
                      inProgress: "#0078FF",
                      complete: "#20B832",
                      sourceBg: "#E4EBF1"
                    }
                  }
                }}
                onSuccess={(result: any) => {
                  console.log('Upload success:', result);
                  if (result?.info?.resource_type === 'video') {
                    alert('✅ Video uploaded successfully! Syncing...');
                    // Auto sync after upload
                    setTimeout(() => {
                      fetchVideos();
                    }, 2000);
                  }
                }}
                onError={(error: any) => {
                  console.error('Upload error:', error);
                  const errorMsg = error?.status === 'error' 
                    ? 'Upload failed. Please check file format and size.' 
                    : error?.message || 'Unknown error';
                  alert('❌ Upload failed: ' + errorMsg);
                }}
              >
                {({ open }) => (
                  <button
                    onClick={() => open?.()}
                    className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                  >
                    <FiUpload className="w-4 h-4" />
                    <span>Upload Videos</span>
                  </button>
                )}
              </CldUploadWidget>
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
                <li>Click "Upload Videos" button above to upload directly (MP4, MOV, AVI, WebM, MKV supported)</li>
                <li>Or manually upload to <a href="https://cloudinary.com/console" target="_blank" className="underline font-medium">Cloudinary Console</a> and click "Sync from Cloudinary"</li>
                <li>Edit titles, descriptions, and categories for each video</li>
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
                  
                  {/* Badges */}
                  <div className="absolute top-2 right-2 flex flex-col gap-1 z-10">
                    {video.featured && (
                      <div className="bg-yellow-400 text-gray-900 px-2 py-1 rounded-full text-xs font-semibold flex items-center space-x-1">
                        <FiStar className="w-3 h-3" />
                        <span>Featured</span>
                      </div>
                    )}
                    {video.showOnHomepage && (
                      <div className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                        Homepage
                      </div>
                    )}
                    {!video.showInGallery && (
                      <div className="bg-gray-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                        Hidden
                      </div>
                    )}
                  </div>
                  
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
                      onClick={() => deleteVideo(video.id, video.cloudinaryId)}
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

      {/* Sync Modal */}
      {syncModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-dark-800 rounded-xl max-w-2xl w-full">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Sync Videos from Cloudinary</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Select which folder to sync videos from
                </p>
              </div>
              <button 
                onClick={() => setSyncModalOpen(false)} 
                className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Folder Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Select Cloudinary Folder
                </label>
                <div className="space-y-3">
                  {cloudinaryFolders.map((folder) => (
                    <label
                      key={folder.value}
                      className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition ${
                        syncFolder === folder.value
                          ? 'border-primary bg-primary/5 dark:bg-primary/10'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                    >
                      <input
                        type="radio"
                        name="syncFolder"
                        value={folder.value}
                        checked={syncFolder === folder.value}
                        onChange={(e) => setSyncFolder(e.target.value)}
                        className="mt-1 w-4 h-4 text-primary border-gray-300 dark:border-gray-600 focus:ring-primary"
                      />
                      <div className="ml-3 flex-1">
                        <div className="font-medium text-gray-900 dark:text-gray-100">
                          {folder.label}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {folder.description}
                        </div>
                        {folder.value && (
                          <div className="text-xs text-gray-500 dark:text-gray-500 mt-1 font-mono">
                            Path: /{folder.value}
                          </div>
                        )}
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Info Box */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <FiVideo className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="ml-3 flex-1">
                    <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300">
                      Recommended Folder Structure
                    </h3>
                    <div className="mt-2 text-sm text-blue-700 dark:text-blue-400">
                      <p className="mb-2">Organize your Cloudinary videos like this:</p>
                      <ul className="list-disc list-inside space-y-1 font-mono text-xs">
                        <li><strong>videos/</strong> - Main portfolio videos</li>
                        <li><strong>reels/</strong> - Short-form content</li>
                        <li><strong>clients/[name]/videos/</strong> - Client deliveries</li>
                      </ul>
                      <p className="mt-2">This prevents syncing personal or client-only videos!</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => setSyncModalOpen(false)}
                  className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-700 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={syncFromCloudinary}
                  disabled={syncing}
                  className="flex items-center space-x-2 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition disabled:opacity-50"
                >
                  <FiRefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
                  <span>{syncing ? 'Syncing...' : `Sync from ${syncFolder || 'root'}`}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
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
    showOnHomepage: video.showOnHomepage,
    showInGallery: video.showInGallery,
    showInProfessionalMode: video.showInProfessionalMode || false,
    backgroundVideo: video.backgroundVideo || false,
    order: video.order,
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
              ⭐ Set as featured video (highlighted everywhere)
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
              className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
            />
            <label htmlFor="showOnHomepage" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              🏠 Show on homepage video section
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
              className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
            />
            <label htmlFor="showInGallery" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              🎥 Show in videos page
            </label>
          </div>

          {/* Background Video */}
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="backgroundVideo"
              checked={formData.backgroundVideo}
              onChange={(e) =>
                setFormData({ ...formData, backgroundVideo: e.target.checked })
              }
              className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
            />
            <label htmlFor="backgroundVideo" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              🎬 Use as background video in professional mode hero section
            </label>
          </div>

          {/* Show in Professional Mode */}
          <div className="flex items-center space-x-3 p-3 rounded-lg bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 border border-amber-200 dark:border-amber-700">
            <input
              type="checkbox"
              id="showInProfessionalMode"
              checked={formData.showInProfessionalMode}
              onChange={(e) =>
                setFormData({ ...formData, showInProfessionalMode: e.target.checked })
              }
              className="w-4 h-4 text-amber-600 border-amber-300 dark:border-amber-600 rounded focus:ring-amber-500"
            />
            <label htmlFor="showInProfessionalMode" className="text-sm font-medium text-amber-900 dark:text-amber-300 flex items-center gap-2">
              <span className="text-lg">✨</span>
              <div>
                <div>Show in Professional Mode Gallery</div>
                <div className="text-xs font-normal opacity-75">Display in professional/luxury theme</div>
              </div>
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
              className="input-field"
              placeholder="0"
            />
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
