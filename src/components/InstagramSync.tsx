'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiInstagram, FiDownload, FiCheck, FiX, FiAlertCircle } from 'react-icons/fi';

interface InstagramMedia {
  id: string;
  caption?: string;
  media_type: string;
  media_url: string;
  thumbnail_url?: string;
  permalink: string;
  timestamp: string;
}

export default function InstagramSync() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [media, setMedia] = useState<InstagramMedia[]>([]);
  const [selectedMedia, setSelectedMedia] = useState<Set<string>>(new Set());
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Auto-fetch photos if code is in URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    
    if (code && !media.length && !loading) {
      setIsOpen(true);
      fetchMedia();
    }
  }, []);

  const handleConnect = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/admin/instagram-sync');
      const data = await response.json();

      if (!response.ok) {
        if (response.status === 503) {
          // API not configured
          setError(data.message || 'Instagram API not configured');
          return;
        }
        throw new Error(data.error || 'Failed to connect to Instagram');
      }

      if (data.authUrl) {
        // Open Instagram OAuth in new window
        const width = 600;
        const height = 700;
        const left = window.screen.width / 2 - width / 2;
        const top = window.screen.height / 2 - height / 2;
        
        const authWindow = window.open(
          data.authUrl,
          'Instagram Authorization',
          `width=${width},height=${height},left=${left},top=${top}`
        );

        // Listen for OAuth callback
        const checkAuth = setInterval(() => {
          if (authWindow?.closed) {
            clearInterval(checkAuth);
            fetchMedia();
          }
        }, 1000);
      } else if (data.media) {
        setMedia(data.media.filter((m: InstagramMedia) => m.media_type === 'IMAGE'));
      }
    } catch (err) {
      console.error('Instagram connect error:', err);
      setError(err instanceof Error ? err.message : 'Failed to connect to Instagram');
    } finally {
      setLoading(false);
    }
  };

  const fetchMedia = async () => {
    try {
      setLoading(true);
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');

      if (!code) {
        setError('No authorization code received');
        return;
      }

      const response = await fetch(`/api/admin/instagram-sync?code=${code}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch media');
      }

      setMedia(data.media); // Include both IMAGE and VIDEO
      const imageCount = data.media.filter((m: InstagramMedia) => m.media_type === 'IMAGE').length;
      const videoCount = data.media.filter((m: InstagramMedia) => m.media_type === 'VIDEO').length;
      setSuccess(`Found ${imageCount} photos${videoCount > 0 ? ` and ${videoCount} videos` : ''} from Instagram`);
      
      // Clear the code from URL to prevent reuse
      window.history.replaceState({}, document.title, window.location.pathname);
    } catch (err) {
      console.error('Fetch media error:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch media');
    } finally {
      setLoading(false);
    }
  };

  const toggleSelection = (mediaId: string) => {
    const newSelected = new Set(selectedMedia);
    if (newSelected.has(mediaId)) {
      newSelected.delete(mediaId);
    } else {
      newSelected.add(mediaId);
    }
    setSelectedMedia(newSelected);
  };

  const selectAll = () => {
    setSelectedMedia(new Set(media.map(m => m.id)));
  };

  const deselectAll = () => {
    setSelectedMedia(new Set());
  };

  const handleImport = async () => {
    try {
      setImporting(true);
      setError(null);

      const selectedItems = media.filter(m => selectedMedia.has(m.id));

      const response = await fetch('/api/admin/instagram-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ media: selectedItems }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to import photos');
      }

      setSuccess(data.message);
      setMedia([]);
      setSelectedMedia(new Set());
      
      // Refresh page after 2 seconds
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (err) {
      console.error('Import error:', err);
      setError(err instanceof Error ? err.message : 'Failed to import photos');
    } finally {
      setImporting(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-3 xs:px-4 py-2 min-h-[44px] text-sm sm:text-base bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all active:scale-95 shadow-lg"
      >
        <FiInstagram className="w-4 h-4 sm:w-5 sm:h-5" />
        <span className="font-medium hidden xs:inline">Sync from Instagram</span>
        <span className="font-medium xs:hidden">Sync IG</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50"
              onClick={() => setIsOpen(false)}
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100%-2rem)] xs:w-[calc(100%-3rem)] sm:w-full max-w-4xl max-h-[90vh] bg-white dark:bg-dark-800 rounded-xl shadow-2xl z-50 overflow-hidden flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                    <FiInstagram className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-base sm:text-xl font-bold text-gray-900 dark:text-gray-100">
                      Instagram Sync
                    </h2>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 hidden xs:block">
                      Import photos and videos from your Instagram account
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 min-w-[44px] min-h-[44px] hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition active:scale-95"
                >
                  <FiX className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </button>
              </div>

              {/* Content */}
              <div className="p-4 sm:p-6 overflow-y-auto flex-1">
                {/* Alerts */}
                {error && (
                  <div className="mb-4 p-3 sm:p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-2 sm:gap-3">
                    <FiAlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm font-medium text-red-900 dark:text-red-100 break-words">
                        {error}
                      </p>
                      {error.includes('not configured') && (
                        <p className="text-[10px] xs:text-xs text-red-700 dark:text-red-300 mt-2 break-words">
                          Add these to your .env file:
                          <br />
                          • INSTAGRAM_APP_ID
                          <br />
                          • INSTAGRAM_APP_SECRET
                          <br />
                          • INSTAGRAM_REDIRECT_URI
                          <br />
                          <a
                            href="https://developers.facebook.com/docs/instagram-basic-display-api/getting-started"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="underline hover:text-red-900 dark:hover:text-red-100 break-all"
                          >
                            View Setup Guide
                          </a>
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {success && (
                  <div className="mb-4 p-3 sm:p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-start gap-2 sm:gap-3">
                    <FiCheck className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                    <p className="text-xs sm:text-sm font-medium text-green-900 dark:text-green-100 break-words">
                      {success}
                    </p>
                  </div>
                )}

                {/* Empty State */}
                {media.length === 0 && (
                  <div className="text-center py-8 sm:py-12">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-3 sm:mb-4 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20 flex items-center justify-center">
                      <FiInstagram className="w-8 h-8 sm:w-10 sm:h-10 text-purple-600 dark:text-purple-400" />
                    </div>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                      Connect Your Instagram Account
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-5 sm:mb-6 max-w-md mx-auto px-4">
                      Import your Instagram photos and videos directly to your portfolio.
                    </p>
                    <button
                      onClick={handleConnect}
                      disabled={loading}
                      className="px-5 sm:px-6 py-2.5 sm:py-3 min-h-[48px] text-sm sm:text-base bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                    >
                      {loading ? 'Connecting...' : 'Connect Instagram'}
                    </button>
                  </div>
                )}

                {/* Media Grid */}
                {media.length > 0 && (
                  <>
                    {/* Selection Controls */}
                    <div className="flex items-center justify-between mb-3 sm:mb-4 pb-3 sm:pb-4 border-b border-gray-200 dark:border-gray-700">
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                        {selectedMedia.size} of {media.length} selected
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={selectAll}
                          className="text-xs sm:text-sm px-2 xs:px-3 py-1.5 min-h-[44px] text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition active:scale-95"
                        >
                          Select All
                        </button>
                        <button
                          onClick={deselectAll}
                          className="text-xs sm:text-sm px-2 xs:px-3 py-1.5 min-h-[44px] text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition active:scale-95"
                        >
                          Deselect
                        </button>
                      </div>
                    </div>

                    {/* Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
                      {media.map((item) => (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className={`relative aspect-square rounded-lg overflow-hidden cursor-pointer group ${
                            selectedMedia.has(item.id)
                              ? 'ring-4 ring-primary-500'
                              : 'hover:ring-2 hover:ring-gray-300 dark:hover:ring-gray-600'
                          }`}
                          onClick={() => toggleSelection(item.id)}
                        >
                          <img
                            src={item.thumbnail_url || item.media_url}
                            alt={item.caption || `Instagram ${item.media_type.toLowerCase()}`}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                          
                          {/* Video indicator */}
                          {item.media_type === 'VIDEO' && (
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                              <div className="w-12 h-12 bg-black/60 rounded-full flex items-center justify-center">
                                <div className="w-0 h-0 border-l-[12px] border-l-white border-y-[8px] border-y-transparent ml-1"></div>
                              </div>
                            </div>
                          )}
                          
                          {selectedMedia.has(item.id) && (
                            <div className="absolute top-2 right-2 w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center z-10">
                              <FiCheck className="w-4 h-4 text-white" />
                            </div>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Footer */}
              {media.length > 0 && (
                <div className="flex flex-col xs:flex-row items-stretch xs:items-center justify-end gap-2 xs:gap-3 p-4 sm:p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-dark-900 flex-shrink-0">
                  <button
                    onClick={() => setIsOpen(false)}
                    className="px-4 py-2 min-h-[48px] text-sm sm:text-base text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition active:scale-95"
                  >
                    Cancel
                  </button>
                    <button
                      onClick={handleImport}
                      disabled={selectedMedia.size === 0 || importing}
                      className="flex items-center justify-center gap-2 px-5 sm:px-6 py-2 min-h-[48px] text-sm sm:text-base bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                    >
                      <FiDownload className="w-4 h-4" />
                      {importing
                        ? 'Importing...'
                        : `Import ${selectedMedia.size} Item${selectedMedia.size !== 1 ? 's' : ''}`}
                    </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
