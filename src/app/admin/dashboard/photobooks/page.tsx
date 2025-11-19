'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { useSession } from 'next-auth/react';
import {
  FiBook,
  FiCheck,
  FiX,
  FiEye,
  FiClock,
  FiCheckCircle,
  FiPackage,
  FiTruck,
  FiFilter,
  FiSearch,
  FiChevronLeft,
  FiChevronRight,
  FiDownload,
  FiStar,
  FiTrash2,
  FiUser,
  FiCalendar,
  FiChevronDown,
  FiChevronUp,
  FiImage,
} from 'react-icons/fi';

// Dynamically import PhotobookEditor for viewing photobook designs
const PhotobookEditor = dynamic(
  () => import('@/components/PhotobookEditor'),
  { ssr: false }
);

interface PhotobookPhoto {
  photoId: string;
  url: string;
  position?: { x: number; y: number };
  rotation?: number;
  zoom?: number;
}

interface PhotobookPage {
  id: string;
  pageNumber: number;
  layoutType: string;
  photos: PhotobookPhoto[];
  notes?: string;
}

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
  notes?: string;
  adminNotes?: string;
  client: {
    name: string;
    email: string;
  };
  gallery: {
    name: string;
  };
  pages: PhotobookPage[];
}

type StatusFilter = 'all' | 'submitted' | 'approved' | 'printing' | 'completed' | 'draft';

// Interface for custom editor photobooks
interface CustomEditorPhotobook {
  id: string;
  title: string;
  status: string;
  totalPages: number;
  design: any;
  createdAt: string;
  client?: {
    name: string;
    email: string;
  };
  gallery?: {
    name: string;
    photos: Array<{
      id: string;
      url: string;
    }>;
  };
}

export default function AdminPhotobooksPage() {
  const { data: session } = useSession();
  const [photobooks, setPhotobooks] = useState<Photobook[]>([]);
  const [customEditorPhotobooks, setCustomEditorPhotobooks] = useState<CustomEditorPhotobook[]>([]);
  const [viewingCustomDesign, setViewingCustomDesign] = useState<CustomEditorPhotobook | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPhotobook, setSelectedPhotobook] = useState<Photobook | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [updating, setUpdating] = useState(false);
  const [expandedClients, setExpandedClients] = useState<Set<string>>(new Set());
  const [expandedGalleries, setExpandedGalleries] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Fetch all photobooks (both old-style and custom editor)
    fetchPhotobooks();
    // Note: All photobooks are fetched together
  }, []);

  const fetchPhotobooks = async () => {
    try {
      const res = await fetch('/api/admin/photobooks', {
        cache: 'no-store',
      });
      
      if (res.ok) {
        const data = await res.json();
        const allPhotobooks = data.photobooks || [];
        
        // Separate photobooks by type
        const customEditorBooks = allPhotobooks.filter((pb: any) => 
          pb.design !== null && pb.design !== undefined
        );
        
        const pageBasedBooks = allPhotobooks.filter((pb: any) => 
          (pb.design === null || pb.design === undefined) && 
          pb.pages && Array.isArray(pb.pages)
        );
        
        setPhotobooks(pageBasedBooks);
        setCustomEditorPhotobooks(customEditorBooks);
        
        // Auto-expand all clients for better mobile UX
        const allClients = new Set(allPhotobooks.map((p: any) => p.client?.name).filter(Boolean));
        setExpandedClients(allClients);
        
        const allGalleries = new Set<string>();
        allPhotobooks.forEach((p: any) => {
          if (p.client?.name && p.gallery?.name) {
            allGalleries.add(`${p.client.name}-${p.gallery.name}`);
          }
        });
        setExpandedGalleries(allGalleries);
      } else if (res.status === 401) {
        window.location.href = '/admin/login';
      }
    } catch (error) {
      console.error('Error fetching photobooks:', error);
    } finally {
      setLoading(false);
    }
  };

  // REMOVED: No need for separate fetch since we fetch everything together above
  const fetchCustomEditorPhotobooks = async () => {
    // This is now handled in fetchPhotobooks() above
    // Keeping function for backward compatibility but it does nothing
  };

  const updateCustomEditorPhotobookStatus = async (photobookId: string, status: string) => {
    try {
      const res = await fetch(`/api/admin/photobooks/${photobookId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      if (res.ok) {
        await fetchCustomEditorPhotobooks();
        alert(`Photobook status updated to: ${status}`);
      }
    } catch (error) {
      console.error('Error updating photobook:', error);
      alert('Failed to update status');
    }
  };

  const updatePhotobookStatus = async (photobookId: string, status: string, adminNotes?: string) => {
    setUpdating(true);
    try {
      const res = await fetch('/api/admin/photobooks/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ photobookId, status, adminNotes }),
      });

      if (res.ok) {
        await fetchPhotobooks();
        if (selectedPhotobook?.id === photobookId) {
          const updated = photobooks.find(p => p.id === photobookId);
          if (updated) setSelectedPhotobook({ ...updated, status, adminNotes: adminNotes || updated.adminNotes });
        }
      } else {
        alert('Error updating photobook status');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error updating photobook status');
    } finally {
      setUpdating(false);
    }
  };

  const deletePhotobook = async (photobookId: string) => {
    if (!confirm('Are you sure you want to delete this photobook? This action cannot be undone.')) {
      return;
    }

    setUpdating(true);
    try {
      const res = await fetch(`/api/admin/photobooks/${photobookId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        await fetchPhotobooks();
        if (selectedPhotobook?.id === photobookId) {
          setPreviewOpen(false);
          setSelectedPhotobook(null);
        }
        alert('Photobook deleted successfully');
      } else {
        alert('Error deleting photobook');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error deleting photobook');
    } finally {
      setUpdating(false);
    }
  };

  const toggleClient = (clientName: string) => {
    const newExpanded = new Set(expandedClients);
    if (newExpanded.has(clientName)) {
      newExpanded.delete(clientName);
    } else {
      newExpanded.add(clientName);
    }
    setExpandedClients(newExpanded);
  };

  const toggleGallery = (galleryKey: string) => {
    const newExpanded = new Set(expandedGalleries);
    if (newExpanded.has(galleryKey)) {
      newExpanded.delete(galleryKey);
    } else {
      newExpanded.add(galleryKey);
    }
    setExpandedGalleries(newExpanded);
  };

  const openPreview = (photobook: Photobook) => {
    setSelectedPhotobook(photobook);
    setCurrentPageIndex(0);
    setPreviewOpen(true);
  };

  const filteredPhotobooks = photobooks.filter(photobook => {
    const matchesStatus = statusFilter === 'all' || photobook.status === statusFilter;
    const matchesSearch = (photobook.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (photobook.client?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (photobook.gallery?.name || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const filteredCustomEditorPhotobooks = customEditorPhotobooks.filter(photobook => {
    const matchesStatus = statusFilter === 'all' || photobook.status === statusFilter;
    const matchesSearch = (photobook.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (photobook.client?.name || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Group photobooks by client, then by gallery (event)
  const groupedPhotobooks = filteredPhotobooks.reduce((acc, photobook) => {
    const clientName = photobook.client?.name || 'Unknown Client';
    const galleryName = photobook.gallery?.name || 'Unknown Gallery';
    
    if (!acc[clientName]) {
      acc[clientName] = {};
    }
    if (!acc[clientName][galleryName]) {
      acc[clientName][galleryName] = [];
    }
    acc[clientName][galleryName].push(photobook);
    
    return acc;
  }, {} as Record<string, Record<string, Photobook[]>>);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'approved': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'printing': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
      case 'completed': return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
      default: return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'submitted': return <FiClock className="w-4 h-4" />;
      case 'approved': return <FiCheckCircle className="w-4 h-4" />;
      case 'printing': return <FiPackage className="w-4 h-4" />;
      case 'completed': return <FiTruck className="w-4 h-4" />;
      default: return <FiBook className="w-4 h-4" />;
    }
  };

  const stats = {
    total: photobooks.length + customEditorPhotobooks.length,
    submitted: photobooks.filter(p => p.status === 'submitted').length + customEditorPhotobooks.filter(p => p.status === 'submitted').length,
    approved: photobooks.filter(p => p.status === 'approved').length + customEditorPhotobooks.filter(p => p.status === 'approved').length,
    printing: photobooks.filter(p => p.status === 'printing').length + customEditorPhotobooks.filter(p => p.status === 'printing').length,
    completed: photobooks.filter(p => p.status === 'completed').length + customEditorPhotobooks.filter(p => p.status === 'completed').length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          📚 Photobook Management
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Review, approve, and manage client photobook submissions
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4 mb-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-4 rounded-xl shadow-lg text-white">
          <div className="text-2xl md:text-3xl font-bold">{stats.total}</div>
          <div className="text-sm opacity-90">Total</div>
        </div>
        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 p-4 rounded-xl shadow-lg text-white">
          <div className="text-2xl md:text-3xl font-bold">{stats.submitted}</div>
          <div className="text-sm opacity-90">Submitted</div>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 p-4 rounded-xl shadow-lg text-white">
          <div className="text-2xl md:text-3xl font-bold">{stats.approved}</div>
          <div className="text-sm opacity-90">Approved</div>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-4 rounded-xl shadow-lg text-white">
          <div className="text-2xl md:text-3xl font-bold">{stats.printing}</div>
          <div className="text-sm opacity-90">Printing</div>
        </div>
        <div className="bg-gradient-to-br from-gray-500 to-gray-600 p-4 rounded-xl shadow-lg text-white">
          <div className="text-2xl md:text-3xl font-bold">{stats.completed}</div>
          <div className="text-sm opacity-90">Completed</div>
        </div>
      </div>

      {/* Custom Editor Photobook Designs Section */}
      {filteredCustomEditorPhotobooks.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <FiStar className="w-6 h-6 text-purple-600" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              Custom Editor Photobooks ({filteredCustomEditorPhotobooks.length})
            </h2>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredCustomEditorPhotobooks.map((pb) => (
              <div key={pb.id} className="bg-white dark:bg-dark-800 rounded-lg border-2 border-purple-500 shadow-lg overflow-hidden">
                <div className="h-40 bg-gradient-to-br from-purple-500 to-primary flex items-center justify-center">
                  <FiBook className="w-16 h-16 text-white opacity-50" />
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-gray-900 dark:text-white mb-1">{pb.title}</h3>
                  {pb.client && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      By: {pb.client.name}
                    </p>
                  )}
                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-500 mb-3">
                    <span>{pb.totalPages} pages</span>
                    <span>{new Date(pb.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setViewingCustomDesign(pb)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg text-sm font-medium transition"
                    >
                      <FiEye className="w-4 h-4" />
                      View Design
                    </button>
                    <button
                      onClick={() => updateCustomEditorPhotobookStatus(pb.id, pb.status === 'draft' ? 'approved' : 'completed')}
                      className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm transition"
                      title="Approve"
                    >
                      <FiCheck className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white dark:bg-dark-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by title, client, or gallery..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-dark-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
            <FiFilter className="text-gray-400 w-5 h-5 flex-shrink-0" />
            {(['all', 'submitted', 'approved', 'printing', 'completed', 'draft'] as StatusFilter[]).map(status => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2 rounded-lg font-medium transition whitespace-nowrap ${
                  statusFilter === status
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 dark:bg-dark-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-dark-600'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Photobooks Organized by Client and Event */}
      {Object.keys(groupedPhotobooks).length === 0 && filteredCustomEditorPhotobooks.length === 0 ? (
        <div className="text-center py-12">
          <FiBook className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">
            {searchQuery || statusFilter !== 'all' ? 'No photobooks match your filters' : 'No photobooks yet'}
          </p>
        </div>
      ) : Object.keys(groupedPhotobooks).length > 0 ? (
        <div className="space-y-6">
          {Object.entries(groupedPhotobooks).map(([clientName, galleries]) => {
            const isClientExpanded = expandedClients.has(clientName);
            const clientPhotobookCount = Object.values(galleries).flat().length;

            return (
              <motion.div
                key={clientName}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-dark-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
              >
                {/* Client Header */}
                <button
                  onClick={() => toggleClient(clientName)}
                  className="w-full p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-dark-700 transition"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center">
                      <FiUser className="w-5 h-5 text-primary" />
                    </div>
                    <div className="text-left">
                      <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                        {clientName}
                      </h2>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {clientPhotobookCount} photobook{clientPhotobookCount !== 1 ? 's' : ''} • {Object.keys(galleries).length} event{Object.keys(galleries).length !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  {isClientExpanded ? (
                    <FiChevronUp className="w-6 h-6 text-gray-400" />
                  ) : (
                    <FiChevronDown className="w-6 h-6 text-gray-400" />
                  )}
                </button>

                {/* Client's Galleries/Events */}
                <AnimatePresence>
                  {isClientExpanded && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: 'auto' }}
                      exit={{ height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="p-4 pt-0 space-y-4">
                        {Object.entries(galleries).map(([galleryName, galleryPhotobooks]) => {
                          const galleryKey = `${clientName}-${galleryName}`;
                          const isGalleryExpanded = expandedGalleries.has(galleryKey);

                          return (
                            <div
                              key={galleryKey}
                              className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
                            >
                              {/* Gallery/Event Header */}
                              <button
                                onClick={() => toggleGallery(galleryKey)}
                                className="w-full p-3 flex items-center justify-between bg-gray-50 dark:bg-dark-700 hover:bg-gray-100 dark:hover:bg-dark-600 transition"
                              >
                                <div className="flex items-center gap-2">
                                  <FiCalendar className="w-4 h-4 text-gray-500" />
                                  <span className="font-semibold text-gray-900 dark:text-gray-100">
                                    {galleryName}
                                  </span>
                                  <span className="text-sm text-gray-500 dark:text-gray-400">
                                    ({galleryPhotobooks.length})
                                  </span>
                                </div>
                                {isGalleryExpanded ? (
                                  <FiChevronUp className="w-5 h-5 text-gray-400" />
                                ) : (
                                  <FiChevronDown className="w-5 h-5 text-gray-400" />
                                )}
                              </button>

                              {/* Photobooks in this Gallery */}
                              <AnimatePresence>
                                {isGalleryExpanded && (
                                  <motion.div
                                    initial={{ height: 0 }}
                                    animate={{ height: 'auto' }}
                                    exit={{ height: 0 }}
                                    className="overflow-hidden"
                                  >
                                    <div className="p-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                      {galleryPhotobooks.map((photobook) => (
                                        <div
                                          key={photobook.id}
                                          className="bg-white dark:bg-dark-900 rounded-lg border border-gray-200 dark:border-gray-600 overflow-hidden hover:shadow-lg transition"
                                        >
                                          {/* Cover Image */}
                                          <div className="relative aspect-[3/2] bg-gray-100 dark:bg-dark-700">
                                            {photobook.coverPhotoUrl ? (
                                              <Image
                                                src={photobook.coverPhotoUrl}
                                                alt={photobook.title}
                                                fill
                                                className="object-cover"
                                              />
                                            ) : (
                                              <div className="absolute inset-0 flex items-center justify-center">
                                                <FiBook className="w-12 h-12 text-gray-400" />
                                              </div>
                                            )}
                                            <div className={`absolute top-2 right-2 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${getStatusColor(photobook.status)}`}>
                                              {getStatusIcon(photobook.status)}
                                              {photobook.status}
                                            </div>
                                          </div>

                                          {/* Content */}
                                          <div className="p-3">
                                            <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-1 truncate">
                                              {photobook.title}
                                            </h3>
                                            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-3">
                                              <span>{photobook.format}</span>
                                              <span>{photobook.totalPages} pages</span>
                                            </div>

                                            {/* Actions */}
                                            <div className="space-y-2">
                                              <div className="grid grid-cols-2 gap-2">
                                                <button
                                                  onClick={() => openPreview(photobook)}
                                                  className="flex items-center justify-center gap-1 px-3 py-2 bg-gray-100 dark:bg-dark-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-dark-600 transition text-xs font-medium"
                                                >
                                                  <FiEye className="w-3 h-3" />
                                                  Preview
                                                </button>
                                                {photobook.status === 'submitted' && (
                                                  <button
                                                    onClick={() => updatePhotobookStatus(photobook.id, 'approved')}
                                                    disabled={updating}
                                                    className="flex items-center justify-center gap-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 text-xs font-medium"
                                                  >
                                                    <FiCheck className="w-3 h-3" />
                                                    Approve
                                                  </button>
                                                )}
                                              </div>
                                              <div className="grid grid-cols-2 gap-2">
                                                <a
                                                  href={`/api/admin/photobooks/${photobook.id}/export-pdf`}
                                                  target="_blank"
                                                  className="flex items-center justify-center gap-1 px-3 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition text-xs font-medium"
                                                >
                                                  <FiDownload className="w-3 h-3" />
                                                  PDF
                                                </a>
                                                {photobook.status === 'submitted' && (
                                                  <button
                                                    onClick={() => {
                                                      const reason = prompt('Rejection reason:');
                                                      if (reason) {
                                                        updatePhotobookStatus(photobook.id, 'draft', reason);
                                                      }
                                                    }}
                                                    disabled={updating}
                                                    className="flex items-center justify-center gap-1 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50 text-xs font-medium"
                                                  >
                                                    <FiX className="w-3 h-3" />
                                                    Reject
                                                  </button>
                                                )}
                                              </div>
                                              <button
                                                onClick={() => deletePhotobook(photobook.id)}
                                                disabled={updating}
                                                className="w-full flex items-center justify-center gap-1 px-3 py-2 bg-gray-100 dark:bg-dark-700 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition disabled:opacity-50 text-xs font-medium"
                                              >
                                                <FiTrash2 className="w-3 h-3" />
                                                Delete
                                              </button>
                                            </div>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      ) : null}

      {/* Preview Modal */}
      <AnimatePresence>
        {previewOpen && selectedPhotobook && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setPreviewOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-dark-800 rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col"
            >
              {/* Modal Header */}
              <div className="p-4 md:p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                      {selectedPhotobook.title}
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {selectedPhotobook.client.name} • {selectedPhotobook.gallery.name} • {selectedPhotobook.format}
                    </p>
                    {selectedPhotobook.notes && (
                      <p className="text-sm text-gray-700 dark:text-gray-300 mt-2 italic">
                        "{selectedPhotobook.notes}"
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => setPreviewOpen(false)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-dark-700 rounded-lg transition"
                  >
                    <FiX className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* Page Preview */}
              <div className="flex-1 overflow-y-auto p-4 md:p-6">
                {selectedPhotobook.pages.length > 0 ? (
                  <div className="max-w-4xl mx-auto">
                    {/* Current Page */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                          Page {currentPageIndex + 1} of {selectedPhotobook.pages.length}
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          Layout: {selectedPhotobook.pages[currentPageIndex].layoutType}
                        </span>
                      </div>
                      <div className={`bg-gray-100 dark:bg-dark-700 rounded-lg p-4 ${
                        selectedPhotobook.format === '30x30' ? 'aspect-square' : 'aspect-[2/3]'
                      }`}>
                        <div className="grid gap-2 h-full">
                          {selectedPhotobook.pages[currentPageIndex].photos.map((photo, idx) => (
                            <div key={idx} className="relative bg-gray-200 dark:bg-dark-600 rounded overflow-hidden">
                              <Image
                                src={photo.url}
                                alt={`Photo ${idx + 1}`}
                                fill
                                className="object-cover"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Page Navigation */}
                    {selectedPhotobook.pages.length > 1 && (
                      <div className="flex items-center justify-center gap-4 mb-6">
                        <button
                          onClick={() => setCurrentPageIndex(Math.max(0, currentPageIndex - 1))}
                          disabled={currentPageIndex === 0}
                          className="p-2 rounded-lg bg-gray-100 dark:bg-dark-700 disabled:opacity-50 hover:bg-gray-200 dark:hover:bg-dark-600 transition"
                        >
                          <FiChevronLeft className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => setCurrentPageIndex(Math.min(selectedPhotobook.pages.length - 1, currentPageIndex + 1))}
                          disabled={currentPageIndex === selectedPhotobook.pages.length - 1}
                          className="p-2 rounded-lg bg-gray-100 dark:bg-dark-700 disabled:opacity-50 hover:bg-gray-200 dark:hover:bg-dark-600 transition"
                        >
                          <FiChevronRight className="w-5 h-5" />
                        </button>
                      </div>
                    )}

                    {/* All Pages Thumbnails */}
                    <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                      {selectedPhotobook.pages.map((page, idx) => (
                        <button
                          key={page.id}
                          onClick={() => setCurrentPageIndex(idx)}
                          className={`relative aspect-square bg-gray-100 dark:bg-dark-700 rounded-lg overflow-hidden border-2 transition ${
                            currentPageIndex === idx
                              ? 'border-primary'
                              : 'border-transparent hover:border-gray-300 dark:hover:border-gray-600'
                          }`}
                        >
                          {page.photos[0] && (
                            <Image
                              src={page.photos[0].url}
                              alt={`Page ${page.pageNumber}`}
                              fill
                              className="object-cover"
                            />
                          )}
                          <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs py-1 text-center">
                            {page.pageNumber}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <FiBook className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">No pages in this photobook</p>
                  </div>
                )}
              </div>

              {/* Modal Footer - Actions */}
              <div className="p-4 md:p-6 border-t border-gray-200 dark:border-gray-700">
                <div className="flex flex-wrap gap-3">
                  {selectedPhotobook.status === 'submitted' && (
                    <>
                      <button
                        onClick={() => {
                          updatePhotobookStatus(selectedPhotobook.id, 'approved');
                          setPreviewOpen(false);
                        }}
                        disabled={updating}
                        className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 font-semibold"
                      >
                        <FiCheck className="w-5 h-5" />
                        Approve Photobook
                      </button>
                      <button
                        onClick={() => {
                          const notes = prompt('Rejection reason:');
                          if (notes) {
                            updatePhotobookStatus(selectedPhotobook.id, 'draft', notes);
                            setPreviewOpen(false);
                          }
                        }}
                        disabled={updating}
                        className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50 font-semibold"
                      >
                        <FiX className="w-5 h-5" />
                        Reject
                      </button>
                    </>
                  )}
                  {selectedPhotobook.status === 'approved' && (
                    <button
                      onClick={() => {
                        updatePhotobookStatus(selectedPhotobook.id, 'printing');
                        setPreviewOpen(false);
                      }}
                      disabled={updating}
                      className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition disabled:opacity-50 font-semibold"
                    >
                      <FiPackage className="w-5 h-5" />
                      Mark as Printing
                    </button>
                  )}
                  {selectedPhotobook.status === 'printing' && (
                    <button
                      onClick={() => {
                        updatePhotobookStatus(selectedPhotobook.id, 'completed');
                        setPreviewOpen(false);
                      }}
                      disabled={updating}
                      className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition disabled:opacity-50 font-semibold"
                    >
                      <FiTruck className="w-5 h-5" />
                      Mark as Completed
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Custom Design Viewer Modal */}
      <AnimatePresence>
        {viewingCustomDesign && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-white dark:bg-dark-900"
          >
            <div className="h-full flex flex-col">
              {/* Header */}
              <div className="bg-white dark:bg-dark-800 border-b border-gray-200 dark:border-gray-700 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                      {viewingCustomDesign.title}
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {viewingCustomDesign.client?.name} • {viewingCustomDesign.totalPages} pages
                    </p>
                  </div>
                  <button
                    onClick={() => setViewingCustomDesign(null)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-dark-700 rounded-lg transition"
                  >
                    <FiX className="w-6 h-6 text-gray-700 dark:text-gray-300" />
                  </button>
                </div>
              </div>

              {/* Editor (Read-Only View) */}
              <div className="flex-1 overflow-hidden">
                {viewingCustomDesign.gallery && (
                  <PhotobookEditor
                    galleryId={viewingCustomDesign.id}
                    selectedPhotos={viewingCustomDesign.gallery.photos.map((p: any, idx: number) => ({
                      id: p.id,
                      url: p.url,
                      thumbnailUrl: p.url,
                      photoNumber: idx + 1,
                    }))}
                    onClose={() => setViewingCustomDesign(null)}
                    onComplete={() => {}} // Admin view is read-only
                  />
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
