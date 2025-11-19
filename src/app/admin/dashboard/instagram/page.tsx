'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { 
  FiInstagram, 
  FiRefreshCw, 
  FiCheckCircle, 
  FiXCircle, 
  FiClock,
  FiDownload,
  FiTrash2,
  FiAlertCircle,
  FiImage,
  FiVideo
} from 'react-icons/fi';

interface SyncStatus {
  connected: boolean;
  username?: string;
  lastSync?: string;
  autoSync: boolean;
  postsCount?: number;
  highlightsCount: number;
  storiesCount: number;
}

export default function InstagramIntegrationPage() {
  const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null);
  const [accessToken, setAccessToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchSyncStatus();
  }, []);

  const fetchSyncStatus = async () => {
    try {
      const response = await fetch('/api/admin/instagram/sync');
      if (response.ok) {
        const data = await response.json();
        setSyncStatus(data);
      }
    } catch (error) {
      console.error('Error fetching sync status:', error);
    }
  };

  const handleConnect = async () => {
    if (!accessToken.trim()) {
      setMessage({ type: 'error', text: 'Please enter an access token' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch('/api/admin/instagram/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessToken: accessToken.trim() }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(`Instagram connected as @${data.username}`);
        setAccessToken('');
        fetchSyncStatus();
      } else {
        toast.error(data.error || 'Failed to connect Instagram');
      }
    } catch (error) {
      toast.error('Failed to connect Instagram');
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    setMessage(null);

    try {
      const response = await fetch('/api/admin/instagram/sync', {
        method: 'POST',
      });

      const data = await response.json();

      if (response.ok) {
        const postsText = data.data.posts ? `${data.data.posts} posts` : '';
        const uploaded = data.data.uploaded ? `, uploaded ${data.data.uploaded} files` : '';
        toast.success(`✅ Synced ${postsText}${uploaded}`);
        fetchSyncStatus();
      } else {
        toast.error(data.error || 'Failed to sync Instagram');
      }
    } catch (error) {
      toast.error('Failed to sync Instagram');
    } finally {
      setSyncing(false);
    }
  };

  const handleClearPosts = async () => {
    if (!confirm('Delete all synced Instagram posts? This will remove them from the homepage. You can re-sync anytime.')) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/admin/instagram/clear', {
        method: 'DELETE',
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(`Deleted ${data.count} Instagram posts. Click Sync Now to re-sync with Cloudinary URLs.`);
        fetchSyncStatus();
      } else {
        toast.error(data.error || 'Failed to clear posts');
      }
    } catch (error) {
      toast.error('Failed to clear Instagram posts');
    } finally {
      setLoading(false);
    }
  };

  const handleImportToPhotos = async (type?: 'photos' | 'videos') => {
    const typeText = type === 'photos' ? 'Photos' : type === 'videos' ? 'Videos' : 'Photos and Videos';
    if (!confirm(`Import all Instagram ${typeText.toLowerCase()} to ${typeText} section? This will skip already imported items.`)) {
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch('/api/admin/instagram/import-to-photos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ 
          type: 'success', 
          text: `✅ ${data.message}. Total imported: ${data.stats.imported}, Skipped: ${data.stats.skipped}` 
        });
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to import posts' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to import Instagram posts' });
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    if (!confirm('Are you sure you want to disconnect Instagram? All synced data will be deleted.')) {
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch('/api/admin/instagram/connect', {
        method: 'DELETE',
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Instagram disconnected successfully' });
        fetchSyncStatus();
      } else {
        setMessage({ type: 'error', text: 'Failed to disconnect Instagram' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to disconnect Instagram' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-900 p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Instagram Integration
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Connect your Instagram account to automatically sync feed posts, highlights, and stories
          </p>
        </div>

        {/* Message */}
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mb-6 p-4 rounded-lg flex items-start gap-3 ${
              message.type === 'success'
                ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200'
                : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200'
            }`}
          >
            {message.type === 'success' ? (
              <FiCheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
            ) : (
              <FiXCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
            )}
            <p>{message.text}</p>
          </motion.div>
        )}

        {/* Status Card */}
        {syncStatus && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <FiInstagram className="w-6 h-6 text-pink-500" />
                Connection Status
              </h2>
              {syncStatus.connected ? (
                <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 text-sm font-medium rounded-full flex items-center gap-1.5">
                  <FiCheckCircle className="w-4 h-4" />
                  Connected
                </span>
              ) : (
                <span className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 text-sm font-medium rounded-full flex items-center gap-1.5">
                  <FiXCircle className="w-4 h-4" />
                  Not Connected
                </span>
              )}
            </div>

            {syncStatus.connected && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Username:</span>
                  <span className="text-gray-900 dark:text-white font-medium">
                    @{syncStatus.username}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Feed Posts:</span>
                  <span className="text-gray-900 dark:text-white font-medium">
                    {syncStatus.postsCount || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Highlights:</span>
                  <span className="text-gray-900 dark:text-white font-medium">
                    {syncStatus.highlightsCount}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Stories:</span>
                  <span className="text-gray-900 dark:text-white font-medium">
                    {syncStatus.storiesCount}
                  </span>
                </div>
                {syncStatus.lastSync && (
                  <div className="flex items-center justify-between text-sm pt-2 border-t border-gray-200 dark:border-gray-700">
                    <span className="text-gray-600 dark:text-gray-400 flex items-center gap-1.5">
                      <FiClock className="w-4 h-4" />
                      Last Sync:
                    </span>
                    <span className="text-gray-900 dark:text-white font-medium">
                      {new Date(syncStatus.lastSync).toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}

        {/* Connect Card */}
        {!syncStatus?.connected && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6"
          >
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Connect Instagram Account
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Instagram Access Token
                </label>
                <input
                  type="password"
                  value={accessToken}
                  onChange={(e) => setAccessToken(e.target.value)}
                  placeholder="Enter your Instagram User Access Token"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-dark-700 text-gray-900 dark:text-white"
                />
              </div>

              <button
                onClick={handleConnect}
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <FiRefreshCw className="w-5 h-5 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <FiInstagram className="w-5 h-5" />
                    Connect Instagram
                  </>
                )}
              </button>
            </div>

            {/* Instructions */}
            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-200 mb-2 flex items-center gap-2">
                <FiAlertCircle className="w-4 h-4" />
                How to get your Access Token:
              </h3>
              <ol className="text-sm text-blue-800 dark:text-blue-300 space-y-1 list-decimal list-inside">
                <li>Go to <a href="https://developers.facebook.com" target="_blank" rel="noopener noreferrer" className="underline">Facebook Developers</a></li>
                <li>Create a new App or use existing one</li>
                <li>Add Instagram Basic Display API</li>
                <li>Generate User Access Token</li>
                <li>Copy and paste it above</li>
              </ol>
            </div>
          </motion.div>
        )}

        {/* Sync Actions */}
        {syncStatus?.connected && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6"
          >
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Sync Actions
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Sync fetches posts from Instagram and uploads to Cloudinary. Import adds them to Photos section.
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <button
                onClick={handleSync}
                disabled={syncing}
                className="py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {syncing ? (
                  <>
                    <FiRefreshCw className="w-5 h-5 animate-spin" />
                    Syncing...
                  </>
                ) : (
                  <>
                    <FiDownload className="w-5 h-5" />
                    Sync Now
                  </>
                )}
              </button>

              <button
                onClick={() => handleImportToPhotos('photos')}
                disabled={loading}
                className="py-3 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <FiRefreshCw className="w-5 h-5 animate-spin" />
                    Importing...
                  </>
                ) : (
                  <>
                    <FiImage className="w-5 h-5" />
                    Import Photos
                  </>
                )}
              </button>

              <button
                onClick={() => handleImportToPhotos('videos')}
                disabled={loading}
                className="py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <FiRefreshCw className="w-5 h-5 animate-spin" />
                    Importing...
                  </>
                ) : (
                  <>
                    <FiVideo className="w-5 h-5" />
                    Import Videos
                  </>
                )}
              </button>

              <button
                onClick={handleClearPosts}
                disabled={loading}
                className="py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <FiTrash2 className="w-5 h-5" />
                Clear Posts
              </button>

              <button
                onClick={handleDisconnect}
                disabled={loading}
                className="py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <FiTrash2 className="w-5 h-5" />
                Disconnect
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
