'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { FiLogOut, FiBook, FiEdit, FiEye, FiClock, FiCheckCircle, FiPackage, FiTruck, FiTrash2, FiPlus, FiArrowLeft } from 'react-icons/fi';
import Logo from '@/components/Logo';

interface Photobook {
  id: string;
  title: string;
  format: string;
  status: string;
  coverPhotoUrl?: string;
  totalPages: number;
  submittedAt?: string;
  approvedAt?: string;
  createdAt: string;
  gallery: {
    id: string;
    name: string;
  };
}

export default function ClientPhotobooksPage() {
  const router = useRouter();
  const [client, setClient] = useState<any>(null);
  const [photobooks, setPhotobooks] = useState<Photobook[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [galleries, setGalleries] = useState<any[]>([]);
  const [showGallerySelector, setShowGallerySelector] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Fetch client info
      const clientRes = await fetch('/api/client/auth/me');
      if (clientRes.ok) {
        const clientData = await clientRes.json();
        setClient(clientData.client);
      } else {
        handleLogout();
        return;
      }

      // Fetch photobooks
      try {
        const photobooksRes = await fetch('/api/client/photobooks');
        if (photobooksRes.ok) {
          const photobooksData = await photobooksRes.json();
          setPhotobooks(photobooksData.photobooks || []);
        } else {
          console.error('Failed to fetch photobooks:', photobooksRes.status);
        }
      } catch (err) {
        console.error('Error fetching photobooks:', err);
        // Continue even if photobooks fail
      }

      // Fetch galleries for photobook creation
      try {
        const galleriesRes = await fetch('/api/client/galleries');
        if (galleriesRes.ok) {
          const galleriesData = await galleriesRes.json();
          setGalleries(galleriesData);
        } else {
          console.error('Failed to fetch galleries:', galleriesRes.status);
        }
      } catch (err) {
        console.error('Error fetching galleries:', err);
        // Continue even if galleries fail
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePhotobook = async (photobookId: string) => {
    if (deleting) return;
    
    setDeleting(true);
    try {
      const res = await fetch(`/api/client/photobook`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ photobookId }),
      });

      if (res.ok) {
        setPhotobooks(prev => prev.filter(p => p.id !== photobookId));
        setDeleteConfirm(null);
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to delete photobook');
      }
    } catch (error) {
      console.error('Error deleting photobook:', error);
      alert('Failed to delete photobook');
    } finally {
      setDeleting(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/client/auth/logout', { method: 'POST' });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      window.location.href = '/client/login';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'submitted': return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'approved': return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'printing': return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      case 'completed': return 'bg-pink-500/20 text-pink-300 border-pink-500/30';
      default: return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft': return <FiEdit className="w-4 h-4" />;
      case 'submitted': return <FiClock className="w-4 h-4" />;
      case 'approved': return <FiCheckCircle className="w-4 h-4" />;
      case 'printing': return <FiPackage className="w-4 h-4" />;
      case 'completed': return <FiTruck className="w-4 h-4" />;
      default: return <FiBook className="w-4 h-4" />;
    }
  };

  const getStatusMessage = (status: string) => {
    switch (status) {
      case 'draft': return 'Continue editing your photobook';
      case 'submitted': return 'Waiting for admin review';
      case 'approved': return 'Your photobook has been approved!';
      case 'printing': return 'Your photobook is being printed';
      case 'completed': return 'Your photobook is ready!';
      default: return '';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-pink-500/30 border-t-pink-500 rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* Header */}
      <header className="relative backdrop-blur-xl bg-gray-900/50 border-b border-white/10 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center space-x-4"
            >
              <Logo size="sm" variant="dark" />
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
                  My Photobooks
                </h1>
                <p className="text-sm text-gray-400">Welcome back, {client?.name}</p>
              </div>
            </motion.div>
            <div className="flex items-center space-x-3">
              <Link
                href="/client/dashboard"
                className="flex items-center gap-2 px-4 py-2 text-gray-300 hover:text-white transition rounded-lg hover:bg-white/5"
              >
                <FiArrowLeft className="w-4 h-4" />
                <span>Dashboard</span>
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-gray-300 hover:text-white transition rounded-lg hover:bg-white/5"
              >
                <FiLogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6"
        >
          <div>
            <h2 className="text-5xl font-bold text-white mb-4 tracking-tight">
              Your Photobook Collection
            </h2>
            <p className="text-xl text-gray-400">
              Create, edit, and manage your beautiful custom photobooks
            </p>
          </div>
          {!loading && photobooks.length > 0 && galleries.length > 0 && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowGallerySelector(true)}
              className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-xl hover:shadow-lg hover:shadow-pink-500/50 transition-all duration-300 font-semibold whitespace-nowrap"
            >
              <FiPlus className="w-5 h-5" />
              Create New Photobook
            </motion.button>
          )}
        </motion.div>

        {photobooks.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative backdrop-blur-xl bg-white/5 rounded-2xl border border-white/10 p-16 text-center overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 via-purple-500/10 to-blue-500/10" />
            <div className="relative">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <FiBook className="w-24 h-24 text-pink-500/50 mx-auto mb-6" />
              </motion.div>
              <h3 className="text-2xl font-bold text-white mb-3">
                Start Your First Photobook
              </h3>
              <p className="text-gray-400 mb-8 max-w-md mx-auto">
                Transform your precious memories into a beautiful printed photobook. 
                Select photos from your galleries and create something unforgettable.
              </p>
              <button
                onClick={() => {
                  if (galleries.length > 0) {
                    setShowGallerySelector(true);
                  }
                }}
                disabled={loading || galleries.length === 0}
                className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-xl hover:shadow-lg hover:shadow-pink-500/50 transition-all duration-300 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FiPlus className="w-5 h-5" />
                {loading ? 'Loading...' : galleries.length === 0 ? 'No Galleries Available' : 'Create Your First Photobook'}
              </button>
            </div>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {photobooks.map((photobook, index) => (
              <motion.div
                key={photobook.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="group relative"
              >
                <div className="relative backdrop-blur-xl bg-white/5 rounded-2xl border border-white/10 overflow-hidden hover:border-pink-500/50 transition-all duration-500">
                  {/* Hover Glow Effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-pink-500/0 via-purple-500/0 to-blue-500/0 group-hover:from-pink-500/10 group-hover:via-purple-500/10 group-hover:to-blue-500/10 transition-all duration-500" />
                  
                  {/* Cover Image */}
                  <div className="relative aspect-[3/2] bg-gray-900/50 overflow-hidden">
                    {photobook.coverPhotoUrl ? (
                      <>
                        <Image
                          src={photobook.coverPhotoUrl}
                          alt={photobook.title}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/20 to-transparent opacity-60" />
                      </>
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-pink-500/20 to-purple-500/20">
                        <FiBook className="w-16 h-16 text-pink-500/50" />
                      </div>
                    )}
                    
                    {/* Status Badge */}
                    <div className={`absolute top-3 right-3 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 backdrop-blur-xl border ${getStatusColor(photobook.status)}`}>
                      {getStatusIcon(photobook.status)}
                      <span className="uppercase tracking-wide">{photobook.status}</span>
                    </div>

                    {/* Delete Button - Only for drafts */}
                    {photobook.status === 'draft' && (
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setDeleteConfirm(photobook.id)}
                        className="absolute top-3 left-3 p-2 backdrop-blur-xl bg-red-500/20 border border-red-500/30 text-red-300 rounded-lg hover:bg-red-500/30 transition-all duration-300"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </motion.button>
                    )}
                  </div>

                  {/* Content */}
                  <div className="relative p-6">
                    <h3 className="text-xl font-bold text-white mb-2 truncate group-hover:text-pink-400 transition-colors">
                      {photobook.title}
                    </h3>
                    <p className="text-sm text-gray-400 mb-4 flex items-center gap-2">
                      <FiBook className="w-4 h-4" />
                      {photobook.gallery.name}
                    </p>

                    <div className="flex items-center justify-between text-sm text-gray-500 mb-5 pb-5 border-b border-white/10">
                      <span className="font-medium">{photobook.format}</span>
                      <span className="text-pink-400 font-semibold">{photobook.totalPages} pages</span>
                    </div>

                    {/* Status Message */}
                    <div className="mb-5 p-4 bg-white/5 rounded-xl border border-white/10">
                      <p className="text-sm text-gray-300 leading-relaxed">
                        {getStatusMessage(photobook.status)}
                      </p>
                      {photobook.approvedAt && (
                        <p className="text-xs text-pink-400 mt-2 font-medium">
                          ✓ Approved {new Date(photobook.approvedAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3">
                      {photobook.status === 'draft' && (
                        <Link
                          href={`/client/photobook?galleryId=${photobook.gallery.id}&photobookId=${photobook.id}`}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-xl hover:shadow-lg hover:shadow-pink-500/50 transition-all duration-300 font-semibold"
                        >
                          <FiEdit className="w-4 h-4" />
                          <span>Continue Editing</span>
                        </Link>
                      )}
                      {photobook.status !== 'draft' && (
                        <button
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-white/10 text-gray-300 rounded-xl hover:bg-white/20 transition-all duration-300 font-semibold"
                        >
                          <FiEye className="w-4 h-4" />
                          <span>View Details</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Status Guide */}
        {photobooks.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-12 relative backdrop-blur-xl bg-white/5 rounded-2xl border border-white/10 p-8 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 via-purple-500/5 to-blue-500/5" />
            <div className="relative">
              <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <span className="text-3xl">📖</span>
                Photobook Status Guide
              </h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  { status: 'Draft', icon: <FiEdit />, desc: 'Continue working on your photobook', color: 'yellow' },
                  { status: 'Submitted', icon: <FiClock />, desc: 'Under review by our team', color: 'blue' },
                  { status: 'Approved', icon: <FiCheckCircle />, desc: 'Ready for printing', color: 'green' },
                  { status: 'Printing', icon: <FiPackage />, desc: 'Being printed with care', color: 'purple' },
                  { status: 'Completed', icon: <FiTruck />, desc: 'Ready for pickup/delivery', color: 'pink' },
                ].map((item, i) => (
                  <motion.div
                    key={item.status}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + i * 0.1 }}
                    className="flex items-start gap-4 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300"
                  >
                    <div className={`p-3 rounded-lg bg-${item.color}-500/20 text-${item.color}-400 text-xl`}>
                      {item.icon}
                    </div>
                    <div>
                      <h4 className="font-semibold text-white mb-1">{item.status}</h4>
                      <p className="text-sm text-gray-400">{item.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </main>

      {/* Gallery Selector Modal */}
      <AnimatePresence>
        {showGallerySelector && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setShowGallerySelector(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gray-800 rounded-2xl p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto border border-white/10"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-white">
                  Select a Gallery
                </h3>
                <button
                  onClick={() => setShowGallerySelector(false)}
                  className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/10 transition"
                >
                  <FiArrowLeft className="w-6 h-6" />
                </button>
              </div>
              <p className="text-gray-400 mb-6">
                Choose a gallery to create your photobook from:
              </p>
              {galleries.length === 0 ? (
                <div className="text-center py-12">
                  <FiBook className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">No galleries available yet</p>
                  <Link
                    href="/client/dashboard"
                    className="inline-flex items-center gap-2 mt-4 px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-lg hover:shadow-lg transition"
                  >
                    <FiArrowLeft className="w-4 h-4" />
                    Go to Dashboard
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {galleries.map((gallery) => (
                    <Link
                      key={gallery.id}
                      href={`/client/photobook?galleryId=${gallery.id}`}
                      className="group relative bg-gray-700/50 rounded-xl overflow-hidden border border-white/10 hover:border-pink-500/50 transition-all"
                    >
                      <div className="relative aspect-video bg-gray-900">
                        {gallery.coverImage ? (
                          <Image
                            src={gallery.coverImage}
                            alt={gallery.name}
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <FiBook className="w-12 h-12 text-gray-600" />
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <h4 className="font-semibold text-white mb-1 group-hover:text-pink-400 transition">
                          {gallery.name}
                        </h4>
                        <p className="text-sm text-gray-400">
                          {gallery._count?.photos || 0} photos
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Gallery Selector Modal */}
      <AnimatePresence>
        {showGallerySelector && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setShowGallerySelector(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gray-800 rounded-2xl p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto border border-white/10"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-white">
                  Select a Gallery
                </h3>
                <button
                  onClick={() => setShowGallerySelector(false)}
                  className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/10 transition"
                >
                  <FiArrowLeft className="w-6 h-6" />
                </button>
              </div>
              <p className="text-gray-400 mb-6">
                Choose a gallery to create your photobook from:
              </p>
              {galleries.length === 0 ? (
                <div className="text-center py-12">
                  <FiBook className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">No galleries available yet</p>
                  <Link
                    href="/client/dashboard"
                    className="inline-flex items-center gap-2 mt-4 px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-lg hover:shadow-lg transition"
                  >
                    <FiArrowLeft className="w-4 h-4" />
                    Go to Dashboard
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {galleries.map((gallery) => (
                    <Link
                      key={gallery.id}
                      href={`/client/photobook?galleryId=${gallery.id}`}
                      className="group relative bg-gray-700/50 rounded-xl overflow-hidden border border-white/10 hover:border-pink-500/50 transition-all"
                    >
                      <div className="relative aspect-video bg-gray-900">
                        {gallery.coverImage ? (
                          <Image
                            src={gallery.coverImage}
                            alt={gallery.name}
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <FiBook className="w-12 h-12 text-gray-600" />
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <h4 className="font-semibold text-white mb-1 group-hover:text-pink-400 transition">
                          {gallery.name}
                        </h4>
                        <p className="text-sm text-gray-400">
                          {gallery._count?.photos || 0} photos
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => !deleting && setDeleteConfirm(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-md w-full backdrop-blur-xl bg-gray-900/90 rounded-2xl border border-red-500/30 p-8 shadow-2xl"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-pink-500/10 rounded-2xl" />
              <div className="relative">
                <div className="flex items-center justify-center w-16 h-16 mx-auto mb-6 rounded-full bg-red-500/20 border border-red-500/30">
                  <FiTrash2 className="w-8 h-8 text-red-400" />
                </div>
                <h3 className="text-2xl font-bold text-white text-center mb-3">
                  Delete Photobook?
                </h3>
                <p className="text-gray-400 text-center mb-8">
                  Are you sure you want to delete this photobook? This action cannot be undone.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setDeleteConfirm(null)}
                    disabled={deleting}
                    className="flex-1 px-6 py-3 bg-white/10 text-gray-300 rounded-xl hover:bg-white/20 transition-all duration-300 font-semibold disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleDeletePhotobook(deleteConfirm)}
                    disabled={deleting}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl hover:shadow-lg hover:shadow-red-500/50 transition-all duration-300 font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {deleting ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                        />
                        Deleting...
                      </>
                    ) : (
                      <>
                        <FiTrash2 className="w-4 h-4" />
                        Delete
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
