'use client';

import { useState, useEffect } from 'react';
import { motion, Reorder, AnimatePresence } from 'framer-motion';
import { CldUploadWidget } from 'next-cloudinary';
import { FiPlus, FiEdit2, FiTrash2, FiMove, FiEye, FiEyeOff, FiX, FiImage, FiVideo, FiCheckCircle } from 'react-icons/fi';
import Image from 'next/image';

interface HighlightItem {
  id: string;
  cloudinaryId: string;
  mediaType: 'image' | 'video';
  mediaUrl: string;
  thumbnailUrl: string;
  title?: string;
  description?: string;
  width?: number;
  height?: number;
  duration?: number;
  order: number;
}

interface Highlight {
  id: string;
  title: string;
  coverImage: string;
  description?: string;
  order: number;
  active: boolean;
  items: HighlightItem[];
}

export default function HighlightsManager() {
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingHighlight, setEditingHighlight] = useState<Highlight | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newHighlightTitle, setNewHighlightTitle] = useState('');
  const [newHighlightCover, setNewHighlightCover] = useState('');
  const [newHighlightDescription, setNewHighlightDescription] = useState('');

  // Fetch highlights
  const fetchHighlights = async () => {
    try {
      const res = await fetch('/api/admin/highlights');
      if (res.ok) {
        const data = await res.json();
        setHighlights(data);
      }
    } catch (error) {
      console.error('Error fetching highlights:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHighlights();
  }, []);

  // Create new highlight
  const handleCreateHighlight = async () => {
    if (!newHighlightTitle || !newHighlightCover) {
      alert('Please provide a title and cover image');
      return;
    }

    try {
      const res = await fetch('/api/admin/highlights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newHighlightTitle,
          coverImage: newHighlightCover,
          description: newHighlightDescription,
          order: highlights.length
        })
      });

      if (res.ok) {
        const newHighlight = await res.json();
        setHighlights([...highlights, newHighlight]);
        setShowCreateModal(false);
        setNewHighlightTitle('');
        setNewHighlightCover('');
        setNewHighlightDescription('');
      }
    } catch (error) {
      console.error('Error creating highlight:', error);
      alert('Failed to create highlight');
    }
  };

  // Toggle active
  const handleToggleActive = async (highlight: Highlight) => {
    try {
      const res = await fetch('/api/admin/highlights', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: highlight.id,
          active: !highlight.active
        })
      });

      if (res.ok) {
        const updated = await res.json();
        setHighlights(highlights.map(h => h.id === updated.id ? updated : h));
      }
    } catch (error) {
      console.error('Error toggling highlight:', error);
    }
  };

  // Delete highlight
  const handleDeleteHighlight = async (id: string) => {
    if (!confirm('Delete this highlight? All items will be deleted.')) return;

    try {
      const res = await fetch(`/api/admin/highlights?id=${id}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        setHighlights(highlights.filter(h => h.id !== id));
      }
    } catch (error) {
      console.error('Error deleting highlight:', error);
      alert('Failed to delete highlight');
    }
  };

  // Add item to highlight
  const handleAddItem = async (highlightId: string, uploadResult: any): Promise<void> => {
    const isVideo = uploadResult.resource_type === 'video';
    
    try {
      const res = await fetch('/api/admin/highlights/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          highlightId,
          cloudinaryId: uploadResult.public_id,
          mediaType: isVideo ? 'video' : 'image',
          mediaUrl: uploadResult.secure_url,
          thumbnailUrl: isVideo ? uploadResult.thumbnail_url : uploadResult.secure_url,
          width: uploadResult.width,
          height: uploadResult.height,
          duration: uploadResult.duration || null,
          order: editingHighlight?.items.length || 0
        })
      });

      if (res.ok) {
        const newItem = await res.json();
        
        // Refresh the entire highlights list
        await fetchHighlights();
        
        // Update editing highlight if it's currently open
        if (editingHighlight && editingHighlight.id === highlightId) {
          const updatedHighlight = await fetch('/api/admin/highlights').then(r => r.json());
          const refreshed = updatedHighlight.find((h: Highlight) => h.id === highlightId);
          if (refreshed) {
            setEditingHighlight(refreshed);
          }
        }
      }
    } catch (error) {
      console.error('Error adding item:', error);
      alert('Failed to add item');
    }
  };

  // Delete item
  const handleDeleteItem = async (itemId: string, highlightId: string) => {
    if (!confirm('Delete this item?')) return;

    try {
      const res = await fetch(`/api/admin/highlights/items?id=${itemId}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        // Refresh the entire highlights list
        await fetchHighlights();
        
        // Update editing highlight if it's currently open
        if (editingHighlight && editingHighlight.id === highlightId) {
          const updatedHighlight = await fetch('/api/admin/highlights').then(r => r.json());
          const refreshed = updatedHighlight.find((h: Highlight) => h.id === highlightId);
          if (refreshed) {
            setEditingHighlight(refreshed);
          }
        }
      }
    } catch (error) {
      console.error('Error deleting item:', error);
      alert('Failed to delete item');
    }
  };

  // Reorder items
  const handleReorderItems = async (newOrder: HighlightItem[]) => {
    if (!editingHighlight) return;

    // Update local state immediately for smooth UX
    const updatedHighlight = { ...editingHighlight, items: newOrder };
    setEditingHighlight(updatedHighlight);

    // Update each item's order in the database
    try {
      await Promise.all(
        newOrder.map((item, index) =>
          fetch('/api/admin/highlights/items', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: item.id, order: index })
          })
        )
      );

      // Update highlights list
      setHighlights(highlights.map(h => 
        h.id === editingHighlight.id ? updatedHighlight : h
      ));
    } catch (error) {
      console.error('Error reordering items:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Highlights Manager
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Create Instagram-style story highlights for your homepage
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowCreateModal(true)}
          className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
        >
          <FiPlus className="w-5 h-5" />
          New Highlight
        </motion.button>
      </div>

      {/* Highlights Grid */}
      {highlights.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-24 bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 dark:from-gray-800 dark:via-gray-800 dark:to-gray-800 rounded-3xl border-2 border-dashed border-purple-300 dark:border-gray-700 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-purple-100/50 via-pink-100/50 to-orange-100/50 dark:from-purple-900/10 dark:via-pink-900/10 dark:to-orange-900/10 animate-pulse" />
          <div className="relative">
            <motion.div
              animate={{ 
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ duration: 3, repeat: Infinity }}
              className="inline-block"
            >
              <FiImage className="w-20 h-20 mx-auto text-purple-400 dark:text-purple-500 mb-6" />
            </motion.div>
            <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 bg-clip-text text-transparent mb-3">
              No highlights yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto text-lg">
              Create your first highlight to showcase Instagram-style stories on your homepage
            </p>
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: '0 10px 30px rgba(168, 85, 247, 0.3)' }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowCreateModal(true)}
              className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all"
            >
              ✨ Create First Highlight
            </motion.button>
          </div>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {highlights.map((highlight) => (
            <motion.div
              key={highlight.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              whileHover={{ y: -8, transition: { duration: 0.3 } }}
              className="bg-white dark:bg-gray-800 rounded-3xl shadow-lg overflow-hidden group hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-primary/30"
            >
              {/* Cover Image */}
              <div className="relative aspect-square overflow-hidden">
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  transition={{ duration: 0.6 }}
                  className="absolute inset-0"
                >
                  <Image
                    src={highlight.coverImage}
                    alt={highlight.title}
                    fill
                    className="object-cover"
                  />
                </motion.div>
                
                {/* Animated Gradient Ring (Instagram style) */}
                <motion.div 
                  initial={{ opacity: 0 }}
                  whileHover={{ opacity: 0.3 }}
                  transition={{ duration: 0.3 }}
                  className="absolute inset-0 bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400"
                />
                
                {/* Status Badge */}
                {!highlight.active && (
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-3 right-3 bg-gray-900/90 backdrop-blur-md text-white px-4 py-1.5 rounded-full text-xs font-semibold shadow-lg"
                  >
                    Hidden
                  </motion.div>
                )}
              </div>

              {/* Content */}
              <div className="p-4">
                <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-1 truncate">
                  {highlight.title}
                </h3>
                {highlight.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                    {highlight.description}
                  </p>
                )}
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-4">
                  <FiImage className="w-4 h-4" /> {highlight.items.length} items
                </div>

                {/* Actions */}
                <div className="grid grid-cols-3 gap-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setEditingHighlight(highlight)}
                    className="px-3 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors flex items-center justify-center gap-1"
                  >
                    <FiEdit2 className="w-4 h-4" />
                    <span className="text-xs font-medium">Edit</span>
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleToggleActive(highlight)}
                    className={`px-3 py-2 rounded-lg transition-colors flex items-center justify-center gap-1 ${
                      highlight.active
                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {highlight.active ? (
                      <><FiEye className="w-4 h-4" /><span className="text-xs font-medium">Live</span></>
                    ) : (
                      <><FiEyeOff className="w-4 h-4" /><span className="text-xs font-medium">Off</span></>
                    )}
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleDeleteHighlight(highlight.id)}
                    className="px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors flex items-center justify-center gap-1"
                  >
                    <FiTrash2 className="w-4 h-4" />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
              onClick={() => setShowCreateModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="fixed top-4 left-4 right-4 bottom-4 sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-full sm:max-w-lg bg-white dark:bg-gray-800 rounded-2xl shadow-2xl z-[60] flex flex-col max-h-[calc(100vh-2rem)]"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Create New Highlight
                </h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-6 pb-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Highlight Title *
                  </label>
                  <input
                    type="text"
                    value={newHighlightTitle}
                    onChange={(e) => setNewHighlightTitle(e.target.value)}
                    placeholder="e.g., Wedding, Travel, Behind the Scenes"
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description (Optional)
                  </label>
                  <textarea
                    value={newHighlightDescription}
                    onChange={(e) => setNewHighlightDescription(e.target.value)}
                    placeholder="Short description of this highlight..."
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Cover Image *
                  </label>
                  {newHighlightCover ? (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="relative aspect-square rounded-xl overflow-hidden mb-3 ring-4 ring-primary/20"
                    >
                      <Image
                        src={newHighlightCover}
                        alt="Cover"
                        fill
                        className="object-cover"
                      />
                      <motion.button
                        whileHover={{ scale: 1.1, rotate: 90 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setNewHighlightCover('')}
                        className="absolute top-3 right-3 p-2.5 bg-red-500/90 backdrop-blur-sm text-white rounded-full hover:bg-red-600 shadow-lg transition-all"
                      >
                        <FiX className="w-5 h-5" />
                      </motion.button>
                    </motion.div>
                  ) : (
                    <CldUploadWidget
                      uploadPreset="aminoss_portfolio"
                      options={{
                        maxFiles: 1,
                        resourceType: 'image',
                        clientAllowedFormats: ['jpg', 'jpeg', 'png', 'webp'],
                        maxFileSize: 10000000,
                        sources: ['local', 'url', 'camera'],
                        showSkipCropButton: false,
                        cropping: true,
                        croppingAspectRatio: 1,
                        croppingShowDimensions: true,
                      }}
                      onSuccess={(result: any) => {
                        setNewHighlightCover(result.info.secure_url);
                      }}
                    >
                      {({ open }) => (
                        <motion.button
                          type="button"
                          onClick={() => open()}
                          whileHover={{ scale: 1.02, borderColor: 'var(--primary)' }}
                          whileTap={{ scale: 0.98 }}
                          className="group w-full aspect-square border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl hover:border-primary hover:bg-primary/5 transition-all flex flex-col items-center justify-center gap-3 text-gray-500 dark:text-gray-400 hover:text-primary relative overflow-hidden"
                        >
                          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                          <motion.div
                            whileHover={{ scale: 1.1, rotate: 5 }}
                            className="relative"
                          >
                            <FiImage className="w-14 h-14" />
                          </motion.div>
                          <div className="relative text-center">
                            <span className="font-semibold text-base block">Upload Cover Image</span>
                            <span className="text-xs text-gray-400 mt-1 block">Square format recommended</span>
                          </div>
                        </motion.button>
                      )}
                    </CldUploadWidget>
                  )}
                </div>

              </div>
              </div>
              
              {/* Fixed Footer */}
              <div className="border-t border-gray-200 dark:border-gray-700 p-6 bg-white dark:bg-gray-800">
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors touch-manipulation active:scale-95"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateHighlight}
                    disabled={!newHighlightTitle || !newHighlightCover}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation active:scale-95"
                  >
                    Create Highlight
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Edit Modal - will be continued... */}
      <AnimatePresence>
        {editingHighlight && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
              onClick={() => setEditingHighlight(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="fixed inset-2 sm:inset-4 md:inset-8 lg:inset-16 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl z-[70] overflow-hidden flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
                <div className="flex items-center gap-4">
                  <div className="relative w-16 h-16 rounded-full overflow-hidden ring-4 ring-gradient-to-br from-purple-600 to-pink-600">
                    <Image
                      src={editingHighlight.coverImage}
                      alt={editingHighlight.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {editingHighlight.title}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                      {editingHighlight.items.length} items
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setEditingHighlight(null)}
                  className="p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
                >
                  <FiX className="w-6 h-6" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6">
                {/* Instruction Banner */}
                {editingHighlight.items.length === 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-xl"
                  >
                    <div className="flex items-start gap-3">
                      <div className="text-3xl">👇</div>
                      <div>
                        <h3 className="font-bold text-gray-900 dark:text-white mb-1">
                          Get Started!
                        </h3>
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          Click the button below to upload photos or videos. You can add multiple items, drag to reorder them, and they'll save automatically.
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
                
                {/* Upload Button */}
                <div className="mb-6">
                  <CldUploadWidget
                    uploadPreset="aminoss_portfolio"
                    options={{
                      multiple: true,
                      maxFiles: 10,
                      resourceType: 'auto',
                      clientAllowedFormats: ['jpg', 'jpeg', 'png', 'webp', 'mp4', 'mov', 'avi'],
                      maxFileSize: 100000000,
                      sources: ['local', 'url', 'camera'],
                      showSkipCropButton: true,
                      styles: {
                        palette: {
                          window: '#FFFFFF',
                          windowBorder: '#90A0B3',
                          tabIcon: '#c67548',
                          menuIcons: '#5A616A',
                          textDark: '#000000',
                          textLight: '#FFFFFF',
                          link: '#c67548',
                          action: '#c67548',
                          inactiveTabIcon: '#0E2F5A',
                          error: '#F44235',
                          inProgress: '#0078FF',
                          complete: '#20B832',
                          sourceBg: '#E4EBF1'
                        }
                      }
                    }}
                    onSuccess={async (result: any) => {
                      await handleAddItem(editingHighlight.id, result.info);
                      // Refresh the highlight data
                      await fetchHighlights();
                      // Show success feedback
                      const notification = document.createElement('div');
                      notification.className = 'fixed top-20 right-6 z-[100] bg-green-500 text-white px-6 py-4 rounded-xl shadow-2xl font-semibold animate-bounce';
                      notification.textContent = '✓ Item added successfully!';
                      document.body.appendChild(notification);
                      setTimeout(() => notification.remove(), 3000);
                    }}
                  >
                    {({ open }) => (
                      <motion.button
                        whileHover={{ scale: 1.02, boxShadow: '0 20px 40px rgba(168, 85, 247, 0.4)' }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => open()}
                        className="group relative w-full px-8 py-6 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 text-white rounded-2xl font-bold text-xl shadow-xl hover:shadow-2xl transition-all overflow-hidden animate-pulse hover:animate-none"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="relative flex items-center justify-center gap-4">
                          <motion.div
                            animate={{ rotate: [0, 180, 360] }}
                            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                            className="opacity-0 group-hover:opacity-100"
                          >
                            <FiPlus className="w-7 h-7" />
                          </motion.div>
                          <FiPlus className="w-7 h-7 group-hover:opacity-0" />
                          <div className="flex flex-col items-start">
                            <span>📸 Upload Photos or Videos</span>
                            <span className="text-sm font-normal opacity-90">Click here or drag & drop files</span>
                          </div>
                        </div>
                      </motion.button>
                    )}
                  </CldUploadWidget>
                </div>

                {/* Items Grid - Reorderable */}
                {editingHighlight.items.length === 0 ? (
                  <div className="text-center py-16 text-gray-500 dark:text-gray-400">
                    <FiImage className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium">No items yet</p>
                    <p className="text-sm">Upload photos or videos to create your story</p>
                  </div>
                ) : (
                  <Reorder.Group
                    axis="y"
                    values={editingHighlight.items}
                    onReorder={handleReorderItems}
                    className="space-y-4"
                  >
                    {editingHighlight.items.map((item) => (
                      <Reorder.Item
                        key={item.id}
                        value={item}
                        className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 cursor-move hover:shadow-lg transition-shadow"
                      >
                        <div className="flex items-center gap-4">
                          {/* Drag Handle */}
                          <FiMove className="w-5 h-5 text-gray-400 flex-shrink-0" />

                          {/* Preview */}
                          <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                            {item.mediaType === 'video' ? (
                              <video
                                src={item.mediaUrl}
                                className="w-full h-full object-cover"
                                muted
                              />
                            ) : (
                              <Image
                                src={item.thumbnailUrl}
                                alt={item.title || 'Item'}
                                fill
                                className="object-cover"
                              />
                            )}
                            <div className="absolute top-1 right-1">
                              {item.mediaType === 'video' ? (
                                <div className="bg-black/70 text-white px-1.5 py-0.5 rounded text-xs flex items-center gap-1">
                                  <FiVideo className="w-3 h-3" />
                                </div>
                              ) : (
                                <div className="bg-black/70 text-white px-1.5 py-0.5 rounded text-xs flex items-center gap-1">
                                  <FiImage className="w-3 h-3" />
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-gray-900 dark:text-white truncate">
                              {item.title || `Item ${item.order + 1}`}
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {item.mediaType === 'video' 
                                ? `Video • ${item.duration ? `${Math.round(item.duration)}s` : ''}`
                                : `Image • ${item.width}×${item.height}`
                              }
                            </p>
                          </div>

                          {/* Delete Button */}
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={async (e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              await handleDeleteItem(item.id, editingHighlight.id);
                              await fetchHighlights();
                            }}
                            className="p-3 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors flex-shrink-0 touch-manipulation active:bg-red-300 min-w-[44px] min-h-[44px] flex items-center justify-center"
                          >
                            <FiTrash2 className="w-5 h-5" />
                          </motion.button>
                        </div>
                      </Reorder.Item>
                    ))}
                  </Reorder.Group>
                )}
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-gray-200 dark:border-gray-800">
                <div className="flex items-center gap-3">
                  <FiCheckCircle className="w-6 h-6 text-green-500" />
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 dark:text-white">
                      Changes saved automatically
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Drag items to reorder • Add or remove items anytime
                    </p>
                  </div>
                  <button
                    onClick={() => setEditingHighlight(null)}
                    className="px-6 py-3 bg-primary text-white rounded-xl font-semibold hover:opacity-90 transition-opacity"
                  >
                    Done
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
