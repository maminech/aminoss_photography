'use client';

import { useState, useEffect, DragEvent, useRef, TouchEvent } from 'react';
import { motion, AnimatePresence, Reorder, useDragControls, PanInfo } from 'framer-motion';
import Image from 'next/image';
import {
  FiX,
  FiPlus,
  FiTrash2,
  FiChevronLeft,
  FiChevronRight,
  FiGrid,
  FiLayers,
  FiCheck,
  FiAlertCircle,
  FiSave,
  FiSend,
  FiBook,
  FiImage,
  FiRotateCw,
  FiZoomIn,
  FiMove,
  FiMaximize2
} from 'react-icons/fi';

interface Photo {
  id: string;
  url: string;
  thumbnailUrl: string;
  photoNumber: number;
  width?: number;
  height?: number;
}

interface PhotoInLayout {
  photoId: string;
  url: string;
  position: number;
  rotation?: number;
  zoom?: number;
}

interface PhotobookPage {
  id?: string;
  pageNumber: number;
  layoutType: string;
  photos: PhotoInLayout[];
  notes?: string;
}

interface PhotobookEditorProps {
  galleryId: string;
  selectedPhotos: Photo[];
  onClose: () => void;
  onComplete: () => void;
}

const LAYOUT_TEMPLATES = {
  full: {
    name: 'Full Page',
    icon: '🖼️',
    slots: 1,
    description: 'One large photo fills the entire page'
  },
  split: {
    name: 'Split',
    icon: '📑',
    slots: 2,
    description: 'Two photos side by side'
  },
  triple: {
    name: 'Triple',
    icon: '🎞️',
    slots: 3,
    description: 'Three photos in a row'
  },
  quad: {
    name: 'Quad',
    icon: '⚏',
    slots: 4,
    description: 'Four photos in a grid'
  },
  'collage-3': {
    name: 'Collage 3',
    icon: '🎨',
    slots: 3,
    description: 'Creative layout with 3 photos'
  },
  'collage-4': {
    name: 'Collage 4',
    icon: '🎭',
    slots: 4,
    description: 'Creative layout with 4 photos'
  }
};

export default function PhotobookEditor({
  galleryId,
  selectedPhotos,
  onClose,
  onComplete
}: PhotobookEditorProps) {
  const [step, setStep] = useState<'format' | 'design' | 'review'>('format');
  const [format, setFormat] = useState<'20x30' | '30x30' | null>(null);
  const [pages, setPages] = useState<PhotobookPage[]>([]);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [availablePhotos, setAvailablePhotos] = useState<Photo[]>(selectedPhotos);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [title, setTitle] = useState('My Photobook');
  const [notes, setNotes] = useState('');
  const [photobookId, setPhotobookId] = useState<string | null>(null);
  const [creatingPhotobook, setCreatingPhotobook] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [touchStartPos, setTouchStartPos] = useState<{ x: number; y: number } | null>(null);
  const [draggedPhotoData, setDraggedPhotoData] = useState<Photo | null>(null);

  // Detect mobile on mount with improved detection
  useEffect(() => {
    const checkMobile = () => {
      const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      const isSmallScreen = window.innerWidth < 768;
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      setIsMobile(isTouchDevice || isSmallScreen || isIOS);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    // Load existing photobook if any
    loadPhotobook();
  }, []);

  const loadPhotobook = async () => {
    try {
      const res = await fetch(`/api/client/photobook?galleryId=${galleryId}`);
      if (res.ok) {
        const data = await res.json();
        if (data.photobook) {
          setPhotobookId(data.photobook.id);
          setFormat(data.photobook.format);
          setTitle(data.photobook.title);
          setNotes(data.photobook.notes || '');
          setPages(data.photobook.pages || []);
          if (data.photobook.pages.length > 0) {
            setStep('design');
          }
        }
      }
    } catch (error) {
      console.error('Error loading photobook:', error);
    }
  };

  const selectFormat = async (selectedFormat: '20x30' | '30x30') => {
    if (creatingPhotobook) return; // Prevent double-click
    
    setCreatingPhotobook(true);
    setFormat(selectedFormat);
    
    console.log('Selecting format:', selectedFormat, 'for gallery:', galleryId);
    
    // Create photobook in database
    try {
      const res = await fetch('/api/client/photobook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          galleryId,
          format: selectedFormat,
          title
        })
      });

      console.log('Response status:', res.status);
      const data = await res.json();
      console.log('Response data:', data);

      if (res.ok) {
        setPhotobookId(data.photobook.id);
        
        // Add a small delay for smooth transition
        setTimeout(() => {
          setStep('design');
          setCreatingPhotobook(false);
        }, 300);
      } else {
        console.error('Error creating photobook:', data);
        alert(`Error creating photobook: ${data.error || 'Unknown error'}${data.details ? '\n' + data.details : ''}`);
        setCreatingPhotobook(false);
        setFormat(null);
      }
    } catch (error: any) {
      console.error('Error creating photobook:', error);
      alert(`Error creating photobook: ${error.message || 'Network error'}`);
      setCreatingPhotobook(false);
      setFormat(null);
    }
  };

  const addPage = () => {
    const newPage: PhotobookPage = {
      pageNumber: pages.length + 1,
      layoutType: 'full',
      photos: []
    };
    setPages([...pages, newPage]);
    setCurrentPageIndex(pages.length);
  };

  const deletePage = (index: number) => {
    const updatedPages = pages.filter((_, i) => i !== index).map((page, i) => ({
      ...page,
      pageNumber: i + 1
    }));
    setPages(updatedPages);
    if (currentPageIndex >= updatedPages.length) {
      setCurrentPageIndex(Math.max(0, updatedPages.length - 1));
    }
  };

  const changeLayout = (pageIndex: number, newLayout: string) => {
    const updatedPages = [...pages];
    const oldPhotos = updatedPages[pageIndex].photos;
    const newTemplate = LAYOUT_TEMPLATES[newLayout as keyof typeof LAYOUT_TEMPLATES];
    
    updatedPages[pageIndex].layoutType = newLayout;
    
    // Try to preserve photos if new layout has enough slots
    if (oldPhotos.length <= newTemplate.slots) {
      updatedPages[pageIndex].photos = oldPhotos;
    } else {
      // Return excess photos to available photos
      const excessPhotos = oldPhotos.slice(newTemplate.slots);
      excessPhotos.forEach(photo => {
        const originalPhoto = selectedPhotos.find(p => p.id === photo.photoId);
        if (originalPhoto && !availablePhotos.find(p => p.id === originalPhoto.id)) {
          setAvailablePhotos(prev => [...prev, originalPhoto]);
        }
      });
      updatedPages[pageIndex].photos = oldPhotos.slice(0, newTemplate.slots);
    }
    
    setPages(updatedPages);
  };

  const addPhotoToPage = (pageIndex: number, photo: Photo) => {
    const page = pages[pageIndex];
    const template = LAYOUT_TEMPLATES[page.layoutType as keyof typeof LAYOUT_TEMPLATES];
    
    if (page.photos.length >= template.slots) {
      alert(`This layout can only hold ${template.slots} photo${template.slots > 1 ? 's' : ''}`);
      return;
    }

    const updatedPages = [...pages];
    updatedPages[pageIndex].photos.push({
      photoId: photo.id,
      url: photo.url,
      position: page.photos.length,
      rotation: 0,
      zoom: 1
    });
    setPages(updatedPages);

    // Remove from available photos
    setAvailablePhotos(availablePhotos.filter(p => p.id !== photo.id));
  };

  const removePhotoFromPage = (pageIndex: number, photoIndex: number) => {
    const photo = pages[pageIndex].photos[photoIndex];
    const originalPhoto = selectedPhotos.find(p => p.id === photo.photoId);
    
    const updatedPages = [...pages];
    updatedPages[pageIndex].photos = updatedPages[pageIndex].photos.filter((_, i) => i !== photoIndex);
    setPages(updatedPages);

    // Add back to available photos
    if (originalPhoto) {
      setAvailablePhotos([...availablePhotos, originalPhoto]);
    }
  };

  const swapPhotosInPage = (pageIndex: number, fromSlot: number, toSlot: number) => {
    const updatedPages = [...pages];
    const photos = updatedPages[pageIndex].photos;
    
    // If both slots have photos, swap them
    if (photos[fromSlot] && photos[toSlot]) {
      [photos[fromSlot], photos[toSlot]] = [photos[toSlot], photos[fromSlot]];
    } 
    // If only source has photo, move it to target
    else if (photos[fromSlot]) {
      photos[toSlot] = photos[fromSlot];
      photos[fromSlot] = null as any;
      // Clean up null values
      updatedPages[pageIndex].photos = photos.filter(p => p);
    }
    
    setPages(updatedPages);
  };

  const dropPhotoOnPage = (pageIndex: number, slotIndex: number, photo: Photo) => {
    const updatedPages = [...pages];
    const page = updatedPages[pageIndex];
    
    // If slot already has a photo, replace it
    if (page.photos[slotIndex]) {
      const replacedPhoto = page.photos[slotIndex];
      const originalPhoto = selectedPhotos.find(p => p.id === replacedPhoto.photoId);
      if (originalPhoto) {
        setAvailablePhotos(prev => [...prev, originalPhoto]);
      }
    }
    
    // Add new photo to slot
    page.photos[slotIndex] = {
      photoId: photo.id,
      url: photo.url,
      position: slotIndex,
      rotation: 0,
      zoom: 1
    };
    
    setPages(updatedPages);
    
    // Remove from available photos
    setAvailablePhotos(prev => prev.filter(p => p.id !== photo.id));
  };

  const autoFillPages = () => {
    const newPages: PhotobookPage[] = [];
    let photoIndex = 0;
    
    while (photoIndex < availablePhotos.length) {
      // Alternate between layouts for variety
      const layouts = ['full', 'split', 'quad'];
      const layoutType = layouts[newPages.length % layouts.length];
      const template = LAYOUT_TEMPLATES[layoutType as keyof typeof LAYOUT_TEMPLATES];
      
      const page: PhotobookPage = {
        pageNumber: pages.length + newPages.length + 1,
        layoutType,
        photos: []
      };

      for (let i = 0; i < template.slots && photoIndex < availablePhotos.length; i++) {
        const photo = availablePhotos[photoIndex];
        page.photos.push({
          photoId: photo.id,
          url: photo.url,
          position: i,
          rotation: 0,
          zoom: 1
        });
        photoIndex++;
      }

      newPages.push(page);
    }

    setPages([...pages, ...newPages]);
    setAvailablePhotos([]);
  };

  const saveProgress = async () => {
    if (!photobookId) return;

    setSaving(true);
    try {
      const res = await fetch('/api/client/photobook', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          photobookId,
          title,
          notes,
          pages
        })
      });

      if (res.ok) {
        alert('✅ Progress saved!');
      }
    } catch (error) {
      alert('Error saving progress');
    } finally {
      setSaving(false);
    }
  };

  const submitPhotobook = async () => {
    if (!photobookId || pages.length === 0) {
      alert('Please add at least one page to your photobook');
      return;
    }

    setSubmitting(true);
    try {
      console.log('Submitting photobook:', {
        photobookId,
        title,
        pagesCount: pages.length,
        hasNotes: !!notes
      });

      const res = await fetch('/api/client/photobook/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          photobookId,
          title,
          notes,
          pages
        })
      });

      const data = await res.json();
      console.log('Submit response:', { ok: res.ok, status: res.status, data });

      if (res.ok) {
        alert('🎉 Photobook submitted successfully! We will review it and get back to you.');
        onComplete();
      } else {
        alert(`Error: ${data.error || 'Failed to submit photobook'}`);
      }
    } catch (error) {
      console.error('Submit error:', error);
      alert('Error submitting photobook');
    } finally {
      setSubmitting(false);
    }
  };

  const currentPage = pages[currentPageIndex];
  const currentTemplate = currentPage ? LAYOUT_TEMPLATES[currentPage.layoutType as keyof typeof LAYOUT_TEMPLATES] : null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="fixed inset-1 sm:inset-2 md:inset-4 bg-white dark:bg-dark-800 rounded-lg md:rounded-xl shadow-2xl overflow-hidden flex flex-col h-[calc(100vh-0.5rem)] sm:h-[calc(100vh-1rem)] md:h-[calc(100vh-2rem)]"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-3 sm:p-4 md:p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-primary/10 to-purple-500/10 flex-shrink-0">
            <div className="flex items-center gap-2 md:gap-3 min-w-0">
              <FiBook className="w-5 h-5 md:w-8 md:h-8 text-primary flex-shrink-0" />
              <div className="min-w-0">
                <h2 className="text-base sm:text-lg md:text-2xl font-bold text-gray-900 dark:text-gray-100 truncate">
                  {step === 'format' && 'Choose Format'}
                  {step === 'design' && 'Design Photobook'}
                  {step === 'review' && 'Review & Submit'}
                </h2>
                <p className="text-[10px] sm:text-xs md:text-sm text-gray-600 dark:text-gray-400 mt-0.5 md:mt-1 truncate">
                  {step === 'format' && 'Select your size'}
                  {step === 'design' && `${pages.length} pages • ${availablePhotos.length} remaining`}
                  {step === 'review' && 'Final check'}
                </p>
              </div>
            </div>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="p-1.5 md:p-2 hover:bg-gray-100 dark:hover:bg-dark-700 rounded-lg transition active:scale-95 touch-manipulation flex-shrink-0"
            >
              <FiX className="w-5 h-5 md:w-6 md:h-6 text-gray-600 dark:text-gray-400" />
            </motion.button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6">
            {/* Step 1: Format Selection */}
            {step === 'format' && (
              <div className="max-w-4xl mx-auto">
                <div className="grid md:grid-cols-2 gap-4 md:gap-6">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => selectFormat('20x30')}
                    disabled={creatingPhotobook}
                    className="relative bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-2 border-blue-200 dark:border-blue-700 rounded-xl p-6 md:p-8 text-left hover:border-blue-400 dark:hover:border-blue-500 transition group disabled:opacity-60 disabled:cursor-not-allowed min-h-[280px] md:min-h-[320px] touch-manipulation active:scale-95"
                  >
                    {creatingPhotobook && format === null ? (
                      <div className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-dark-900/80 rounded-xl">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                      </div>
                    ) : null}
                    <div className="aspect-[2/3] bg-white dark:bg-dark-700 rounded-lg shadow-lg mb-4 flex items-center justify-center border-4 border-blue-300 dark:border-blue-600 group-hover:scale-105 transition">
                      <span className="text-4xl md:text-6xl">📖</span>
                    </div>
                    <h3 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                      20cm × 30cm
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Portrait format • Perfect for vertical photos • Classic photobook size
                    </p>
                    <div className="absolute top-4 right-4 bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                      Portrait
                    </div>
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => selectFormat('30x30')}
                    disabled={creatingPhotobook}
                    className="relative bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-2 border-purple-200 dark:border-purple-700 rounded-xl p-6 md:p-8 text-left hover:border-purple-400 dark:hover:border-purple-500 transition group disabled:opacity-60 disabled:cursor-not-allowed min-h-[280px] md:min-h-[320px] touch-manipulation active:scale-95"
                  >
                    {creatingPhotobook && format === null ? (
                      <div className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-dark-900/80 rounded-xl">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                      </div>
                    ) : null}
                    <div className="aspect-square bg-white dark:bg-dark-700 rounded-lg shadow-lg mb-4 flex items-center justify-center border-4 border-purple-300 dark:border-purple-600 group-hover:scale-105 transition">
                      <span className="text-4xl md:text-6xl">📕</span>
                    </div>
                    <h3 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                      30cm × 30cm
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Square format • Ideal for Instagram-style layouts • Modern design
                    </p>
                    <div className="absolute top-4 right-4 bg-purple-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                      Square
                    </div>
                  </motion.button>
                </div>

                {creatingPhotobook && (
                  <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
                    <div className="flex items-center justify-center gap-3">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                      <p className="text-blue-900 dark:text-blue-100 font-medium">
                        Creating your photobook...
                      </p>
                    </div>
                  </div>
                )}

                <div className="mt-6 md:mt-8 p-4 md:p-6 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
                  <div className="flex items-start gap-3">
                    <FiAlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-amber-900 dark:text-amber-100">
                      <p className="font-semibold mb-1">What's Next?</p>
                      <ul className="list-disc list-inside space-y-1 text-amber-800 dark:text-amber-200">
                        <li>Choose your preferred format above</li>
                        <li>Design your photobook page by page</li>
                        <li>Arrange photos using drag & drop</li>
                        <li>Submit for review when complete</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Design Pages */}
            {step === 'design' && (
              <div className="h-full flex flex-col gap-4">
                {/* Toolbar */}
                <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-gray-50 dark:bg-dark-700 rounded-xl">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={addPage}
                      className="flex items-center gap-2 px-3 md:px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition active:scale-95 text-sm md:text-base"
                    >
                      <FiPlus className="w-4 h-4" />
                      <span>Add Page</span>
                    </button>
                    <button
                      onClick={autoFillPages}
                      disabled={availablePhotos.length === 0}
                      className="flex items-center gap-2 px-3 md:px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base"
                    >
                      <FiLayers className="w-4 h-4" />
                      <span className="hidden sm:inline">Auto-Fill</span>
                      <span className="sm:hidden">Auto</span>
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={saveProgress}
                      disabled={saving}
                      className="flex items-center gap-2 px-3 md:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition active:scale-95 text-sm md:text-base"
                    >
                      <FiSave className="w-4 h-4" />
                      <span>{saving ? 'Saving...' : 'Save'}</span>
                    </button>
                    <button
                      onClick={() => setStep('review')}
                      className="flex items-center gap-2 px-3 md:px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition active:scale-95 text-sm md:text-base"
                    >
                      <FiCheck className="w-4 h-4" />
                      <span className="hidden sm:inline">Review</span>
                      <span className="sm:hidden">→</span>
                    </button>
                  </div>
                </div>

                {pages.length === 0 ? (
                  <div className="flex-1 flex items-center justify-center">
                    <div className="text-center p-8">
                      <FiImage className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                        No Pages Yet
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-4">
                        Click "Add Page" to start designing your photobook
                      </p>
                      <button
                        onClick={addPage}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition"
                      >
                        <FiPlus className="w-5 h-5" />
                        <span>Add First Page</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col lg:grid lg:grid-cols-[280px_1fr_240px] gap-2 md:gap-4 overflow-hidden">
                    {/* Page List (Mobile: Hidden, Desktop: Sidebar) */}
                    <div className="hidden lg:block overflow-y-auto bg-gray-50 dark:bg-dark-700 rounded-lg md:rounded-xl p-3 md:p-4">
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">Pages ({pages.length})</h3>
                      <div className="space-y-2">
                        {pages.map((page, index) => (
                          <div key={index} className="relative group">
                            <button
                              onClick={() => setCurrentPageIndex(index)}
                              className={`w-full text-left p-3 rounded-lg transition ${
                                currentPageIndex === index
                                  ? 'bg-primary text-white'
                                  : 'bg-white dark:bg-dark-600 hover:bg-gray-100 dark:hover:bg-dark-500'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-medium">Page {page.pageNumber}</span>
                                <span className="text-xs opacity-75">
                                  {page.photos.length}/{LAYOUT_TEMPLATES[page.layoutType as keyof typeof LAYOUT_TEMPLATES].slots}
                                </span>
                              </div>
                              <div className="text-xs opacity-75 mt-1">
                                {LAYOUT_TEMPLATES[page.layoutType as keyof typeof LAYOUT_TEMPLATES].name}
                              </div>
                            </button>
                            {pages.length > 1 && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (confirm(`Delete page ${page.pageNumber}?`)) {
                                    deletePage(index);
                                  }
                                }}
                                className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded opacity-0 group-hover:opacity-100 hover:bg-red-600 transition-all shadow-lg z-10"
                                title="Delete this page"
                              >
                                <FiTrash2 className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Current Page Editor */}
                    <div className="flex flex-col gap-4">
                      {/* Mobile Page Navigation */}
                      <div className="md:hidden flex items-center justify-between p-3 bg-gray-50 dark:bg-dark-700 rounded-lg">
                        <button
                          onClick={() => setCurrentPageIndex(Math.max(0, currentPageIndex - 1))}
                          disabled={currentPageIndex === 0}
                          className="p-2 disabled:opacity-30"
                        >
                          <FiChevronLeft className="w-5 h-5" />
                        </button>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Page {currentPageIndex + 1} of {pages.length}</span>
                          {pages.length > 1 && (
                            <button
                              onClick={() => {
                                if (confirm(`Delete page ${currentPageIndex + 1}?`)) {
                                  deletePage(currentPageIndex);
                                }
                              }}
                              className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition"
                              title="Delete this page"
                            >
                              <FiTrash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                        <button
                          onClick={() => setCurrentPageIndex(Math.min(pages.length - 1, currentPageIndex + 1))}
                          disabled={currentPageIndex === pages.length - 1}
                          className="p-2 disabled:opacity-30"
                        >
                          <FiChevronRight className="w-5 h-5" />
                        </button>
                      </div>

                      {currentPage && (
                        <>
                          {/* Layout Selection */}
                          <div className="p-4 bg-gray-50 dark:bg-dark-700 rounded-xl">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Page Layout
                            </label>
                            <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                              {Object.entries(LAYOUT_TEMPLATES).map(([key, template]) => (
                                <button
                                  key={key}
                                  onClick={() => changeLayout(currentPageIndex, key)}
                                  className={`p-3 rounded-lg border-2 transition text-center ${
                                    currentPage.layoutType === key
                                      ? 'border-primary bg-primary/10'
                                      : 'border-gray-200 dark:border-gray-600 hover:border-primary/50'
                                  }`}
                                >
                                  <div className="text-2xl mb-1">{template.icon}</div>
                                  <div className="text-xs font-medium">{template.name}</div>
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Page Canvas */}
                          <div className="flex-1 bg-gray-100 dark:bg-dark-900 rounded-xl p-4 md:p-8 flex items-center justify-center">
                            <div
                              className={`bg-white shadow-2xl relative ${
                                format === '20x30' ? 'aspect-[2/3] w-full max-w-md' : 'aspect-square w-full max-w-md'
                              }`}
                            >
                              <PhotobookPageCanvas
                                page={currentPage}
                                template={currentTemplate!}
                                onRemovePhoto={(photoIndex) => removePhotoFromPage(currentPageIndex, photoIndex)}
                                onSwapPhotos={(fromIndex, toIndex) => swapPhotosInPage(currentPageIndex, fromIndex, toIndex)}
                                onDropPhoto={(slotIndex, photo) => dropPhotoOnPage(currentPageIndex, slotIndex, photo)}
                              />
                            </div>
                          </div>

                          {/* Page Actions */}
                          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-dark-700 rounded-lg">
                            <button
                              onClick={() => deletePage(currentPageIndex)}
                              className="flex items-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
                            >
                              <FiTrash2 className="w-4 h-4" />
                              <span className="text-sm">Delete Page</span>
                            </button>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Available Photos - Draggable */}
                    <div className="overflow-y-auto bg-gray-50 dark:bg-dark-700 rounded-lg md:rounded-xl p-3 md:p-4 max-h-[30vh] lg:max-h-full">
                      <h3 className="text-sm md:text-base font-semibold text-gray-900 dark:text-gray-100 mb-2 md:mb-3">
                        Available Photos ({availablePhotos.length})
                      </h3>
                      <p className="text-[10px] md:text-xs text-gray-600 dark:text-gray-400 mb-2 md:mb-3">
                        💡 Drag or tap to add photos
                      </p>
                      <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-2 gap-1.5 md:gap-2">
                        {availablePhotos.map((photo) => (
                          <motion.div
                            key={photo.id}
                            whileTap={{ scale: 0.95 }}
                            whileHover={{ scale: 1.05 }}
                            draggable={!isMobile}
                            onDragStart={(e) => {
                              e.dataTransfer.effectAllowed = 'copy';
                              e.dataTransfer.setData('photo', JSON.stringify(photo));
                            }}
                            onClick={() => currentPage && addPhotoToPage(currentPageIndex, photo)}
                            className="relative aspect-square bg-gray-200 dark:bg-dark-600 rounded overflow-hidden hover:ring-2 hover:ring-primary transition-all cursor-pointer touch-manipulation shadow-sm hover:shadow-md"
                          >
                            <Image
                              src={photo.thumbnailUrl}
                              alt={`Photo ${photo.photoNumber}`}
                              fill
                              className="object-cover pointer-events-none select-none"
                              sizes="(max-width: 640px) 30vw, (max-width: 1024px) 25vw, 150px"
                            />
                            <div className="absolute top-0.5 left-0.5 md:top-1 md:left-1 bg-black/70 text-white px-1 md:px-1.5 py-0.5 rounded text-[9px] md:text-xs font-medium">
                              #{photo.photoNumber}
                            </div>
                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 hover:opacity-100 active:opacity-100 transition-opacity flex items-center justify-center">
                              <motion.div 
                                initial={{ scale: 0 }}
                                whileHover={{ scale: 1 }}
                                className="text-white text-[10px] md:text-xs bg-primary/90 px-2 py-1 rounded backdrop-blur-sm font-medium flex items-center gap-1"
                              >
                                <FiPlus className="w-2.5 h-2.5 md:w-3 md:h-3" />
                                <span className="hidden sm:inline">Add</span>
                              </motion.div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                      {availablePhotos.length === 0 && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">
                          All photos used! 🎉
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Review */}
            {step === 'review' && (
              <div className="max-w-4xl mx-auto">
                <div className="space-y-6">
                  {/* Photobook Details */}
                  <div className="p-6 bg-gray-50 dark:bg-dark-700 rounded-xl">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Photobook Details</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Title
                        </label>
                        <input
                          type="text"
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-600 text-gray-900 dark:text-gray-100"
                          placeholder="My Photobook"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Notes (optional)
                        </label>
                        <textarea
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          rows={3}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-600 text-gray-900 dark:text-gray-100"
                          placeholder="Any special instructions or preferences..."
                        />
                      </div>
                    </div>
                  </div>

                  {/* Summary */}
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="p-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-xl">
                      <div className="text-3xl mb-2">📏</div>
                      <div className="text-sm text-blue-800 dark:text-blue-200 mb-1">Format</div>
                      <div className="text-xl font-bold text-blue-900 dark:text-blue-100">{format}</div>
                    </div>
                    <div className="p-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-xl">
                      <div className="text-3xl mb-2">📄</div>
                      <div className="text-sm text-green-800 dark:text-green-200 mb-1">Pages</div>
                      <div className="text-xl font-bold text-green-900 dark:text-green-100">{pages.length}</div>
                    </div>
                    <div className="p-6 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700 rounded-xl">
                      <div className="text-3xl mb-2">📸</div>
                      <div className="text-sm text-purple-800 dark:text-purple-200 mb-1">Photos</div>
                      <div className="text-xl font-bold text-purple-900 dark:text-purple-100">
                        {selectedPhotos.length - availablePhotos.length}
                      </div>
                    </div>
                  </div>

                  {/* Page Previews */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Page Previews</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {pages.map((page, index) => (
                        <div key={index} className="bg-white dark:bg-dark-600 rounded-lg p-3 shadow">
                          <div className={`bg-gray-100 dark:bg-dark-700 ${format === '20x30' ? 'aspect-[2/3]' : 'aspect-square'} rounded mb-2`} />
                          <div className="text-xs text-gray-600 dark:text-gray-400">Page {page.pageNumber}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-500">
                            {LAYOUT_TEMPLATES[page.layoutType as keyof typeof LAYOUT_TEMPLATES].name} • {page.photos.length} photos
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={() => setStep('design')}
                      className="flex-1 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-700 transition"
                    >
                      Back to Editing
                    </button>
                    <button
                      onClick={submitPhotobook}
                      disabled={submitting || pages.length === 0}
                      className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                    >
                      <FiSend className="w-5 h-5" />
                      <span>{submitting ? 'Submitting...' : 'Submit Photobook'}</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// Enhanced Page Canvas Component with Mobile Support
function PhotobookPageCanvas({
  page,
  template,
  onRemovePhoto,
  onSwapPhotos,
  onDropPhoto
}: {
  page: PhotobookPage;
  template: typeof LAYOUT_TEMPLATES[keyof typeof LAYOUT_TEMPLATES];
  onRemovePhoto: (photoIndex: number) => void;
  onSwapPhotos: (fromIndex: number, toIndex: number) => void;
  onDropPhoto: (slotIndex: number, photo: Photo) => void;
}) {
  const [draggedSlot, setDraggedSlot] = useState<number | null>(null);
  const [dragOverSlot, setDragOverSlot] = useState<number | null>(null);
  const [touchDraggedSlot, setTouchDraggedSlot] = useState<number | null>(null);
  const [touchStartPos, setTouchStartPos] = useState<{ x: number; y: number } | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile('ontouchstart' in window);
  }, []);

  const getGridClass = () => {
    switch (page.layoutType) {
      case 'full':
        return 'grid-cols-1 grid-rows-1';
      case 'split':
        return 'grid-cols-2 grid-rows-1';
      case 'triple':
        return 'grid-cols-3 grid-rows-1';
      case 'quad':
        return 'grid-cols-2 grid-rows-2';
      case 'collage-3':
        return 'grid-cols-2 grid-rows-2';
      case 'collage-4':
        return 'grid-cols-2 grid-rows-2';
      default:
        return 'grid-cols-1 grid-rows-1';
    }
  };

  const handleDragStart = (e: React.DragEvent, slotIndex: number) => {
    if (page.photos[slotIndex]) {
      setDraggedSlot(slotIndex);
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('slotIndex', slotIndex.toString());
    }
  };

  const handleDragOver = (e: React.DragEvent, slotIndex: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverSlot(slotIndex);
  };

  const handleDragLeave = () => {
    setDragOverSlot(null);
  };

  const handleDrop = (e: React.DragEvent, toSlotIndex: number) => {
    e.preventDefault();
    setDragOverSlot(null);
    
    // Check if dropping from available photos list
    const photoData = e.dataTransfer.getData('photo');
    if (photoData) {
      try {
        const photo = JSON.parse(photoData);
        onDropPhoto(toSlotIndex, photo);
        return;
      } catch (err) {
        console.error('Error parsing photo data:', err);
      }
    }
    
    // Otherwise, swapping within page
    const fromSlotIndex = parseInt(e.dataTransfer.getData('slotIndex'));
    if (!isNaN(fromSlotIndex) && fromSlotIndex !== toSlotIndex) {
      onSwapPhotos(fromSlotIndex, toSlotIndex);
    }
    setDraggedSlot(null);
  };

  const handleDragEnd = () => {
    setDraggedSlot(null);
    setDragOverSlot(null);
  };

  // Mobile touch handlers
  const handleTouchStart = (e: React.TouchEvent, slotIndex: number) => {
    if (!page.photos[slotIndex]) return;
    
    const touch = e.touches[0];
    setTouchStartPos({ x: touch.clientX, y: touch.clientY });
    setTouchDraggedSlot(slotIndex);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchDraggedSlot === null || !touchStartPos) return;
    
    const touch = e.touches[0];
    const deltaX = Math.abs(touch.clientX - touchStartPos.x);
    const deltaY = Math.abs(touch.clientY - touchStartPos.y);
    
    // If moved more than 10px, it's a drag
    if (deltaX > 10 || deltaY > 10) {
      e.preventDefault();
      
      // Find slot under touch point
      const element = document.elementFromPoint(touch.clientX, touch.clientY);
      const slotElement = element?.closest('[data-slot-index]');
      if (slotElement) {
        const targetIndex = parseInt(slotElement.getAttribute('data-slot-index') || '-1');
        if (targetIndex >= 0 && targetIndex !== touchDraggedSlot) {
          setDragOverSlot(targetIndex);
        }
      }
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchDraggedSlot === null) return;
    
    if (dragOverSlot !== null && dragOverSlot !== touchDraggedSlot) {
      // Check if dropping a photo from available list
      const touch = e.changedTouches[0];
      const element = document.elementFromPoint(touch.clientX, touch.clientY);
      const slotElement = element?.closest('[data-slot-index]');
      
      if (slotElement) {
        const targetIndex = parseInt(slotElement.getAttribute('data-slot-index') || '-1');
        if (targetIndex >= 0) {
          onSwapPhotos(touchDraggedSlot, targetIndex);
        }
      }
    }
    
    setTouchDraggedSlot(null);
    setTouchStartPos(null);
    setDragOverSlot(null);
  };

  return (
    <div className={`w-full h-full grid ${getGridClass()} gap-0.5 md:gap-1 p-1 md:p-2`}>
      {Array.from({ length: template.slots }).map((_, index) => {
        const photo = page.photos[index];
        const isDragging = draggedSlot === index || touchDraggedSlot === index;
        const isDragOver = dragOverSlot === index;
        
        return (
          <motion.div 
            key={index}
            data-slot-index={index}
            layout
            animate={{
              scale: isDragging ? 0.95 : isDragOver ? 1.05 : 1,
              opacity: isDragging ? 0.5 : 1
            }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className={`relative bg-gradient-to-br from-gray-100 to-gray-200 dark:from-dark-700 dark:to-dark-600 rounded overflow-hidden group touch-manipulation ${
              isDragOver ? 'ring-2 md:ring-4 ring-primary ring-opacity-70' : ''
            } ${!photo ? 'border-2 border-dashed border-gray-300 dark:border-gray-600' : ''}`}
            draggable={!!photo}
            onDragStart={(e) => handleDragStart(e, index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, index)}
            onDragEnd={handleDragEnd}
            onTouchStart={(e) => handleTouchStart(e, index)}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {photo ? (
              <>
                <Image
                  src={photo.url}
                  alt={`Photo ${index + 1}`}
                  fill
                  className="object-cover pointer-events-none select-none"
                  sizes="(max-width: 768px) 50vw, 400px"
                  priority={index === 0}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 group-active:opacity-100 transition-opacity flex items-end justify-center pb-2">
                  <div className="flex items-center gap-1 md:gap-2">
                    <div className="text-white text-[10px] md:text-xs bg-black/70 px-1.5 md:px-2 py-0.5 md:py-1 rounded backdrop-blur-sm flex items-center gap-1">
                      <FiMove className="w-2.5 h-2.5 md:w-3 md:h-3" />
                      <span className="hidden md:inline">Drag to move</span>
                      <span className="md:hidden">Move</span>
                    </div>
                  </div>
                </div>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemovePhoto(index);
                  }}
                  className="absolute top-0.5 md:top-1 right-0.5 md:right-1 p-1 md:p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 group-active:opacity-100 transition-all active:scale-95 shadow-lg z-10 touch-manipulation"
                >
                  <FiX className="w-2.5 h-2.5 md:w-3 md:h-3" />
                </motion.button>
              </>
            ) : (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="w-full h-full flex flex-col items-center justify-center text-gray-400"
              >
                <FiImage className="w-6 h-6 md:w-8 md:h-8 mb-1 md:mb-2 opacity-30" />
                <div className="text-[10px] md:text-xs font-medium">Drop photo here</div>
                <div className="text-[8px] md:text-[10px] opacity-60 mt-0.5">or click to add</div>
              </motion.div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}
