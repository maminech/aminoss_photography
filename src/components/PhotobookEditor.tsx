'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
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
  FiImage
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
    setFormat(selectedFormat);
    
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

      if (res.ok) {
        const data = await res.json();
        setPhotobookId(data.photobook.id);
        setStep('design');
      }
    } catch (error) {
      alert('Error creating photobook. Please try again.');
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
    updatedPages[pageIndex].layoutType = newLayout;
    updatedPages[pageIndex].photos = []; // Clear photos when changing layout
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

      if (res.ok) {
        alert('🎉 Photobook submitted successfully! We will review it and get back to you.');
        onComplete();
      }
    } catch (error) {
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
          className="fixed inset-4 md:inset-8 bg-white dark:bg-dark-800 rounded-xl shadow-2xl overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 md:p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-primary/10 to-purple-500/10">
            <div className="flex items-center gap-3">
              <FiBook className="w-6 h-6 md:w-8 md:h-8 text-primary" />
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {step === 'format' && 'Choose Photobook Format'}
                  {step === 'design' && 'Design Your Photobook'}
                  {step === 'review' && 'Review & Submit'}
                </h2>
                <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {step === 'format' && 'Select the size for your photobook'}
                  {step === 'design' && `${pages.length} pages • ${availablePhotos.length} photos remaining`}
                  {step === 'review' && 'Final check before submission'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-dark-700 rounded-lg transition active:scale-95"
            >
              <FiX className="w-6 h-6 text-gray-600 dark:text-gray-400" />
            </button>
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
                    className="relative bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-2 border-blue-200 dark:border-blue-700 rounded-xl p-6 md:p-8 text-left hover:border-blue-400 dark:hover:border-blue-500 transition group"
                  >
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
                    className="relative bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-2 border-purple-200 dark:border-purple-700 rounded-xl p-6 md:p-8 text-left hover:border-purple-400 dark:hover:border-purple-500 transition group"
                  >
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
                  <div className="flex-1 grid md:grid-cols-[300px_1fr_250px] gap-4 overflow-hidden">
                    {/* Page List (Mobile: Hidden, Desktop: Sidebar) */}
                    <div className="hidden md:block overflow-y-auto bg-gray-50 dark:bg-dark-700 rounded-xl p-4">
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">Pages ({pages.length})</h3>
                      <div className="space-y-2">
                        {pages.map((page, index) => (
                          <button
                            key={index}
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
                        <span className="font-medium">Page {currentPageIndex + 1} of {pages.length}</span>
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

                    {/* Available Photos */}
                    <div className="overflow-y-auto bg-gray-50 dark:bg-dark-700 rounded-xl p-4">
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
                        Available Photos ({availablePhotos.length})
                      </h3>
                      <div className="grid grid-cols-2 gap-2">
                        {availablePhotos.map((photo) => (
                          <button
                            key={photo.id}
                            onClick={() => currentPage && addPhotoToPage(currentPageIndex, photo)}
                            className="relative aspect-square bg-gray-200 dark:bg-dark-600 rounded-lg overflow-hidden hover:ring-2 hover:ring-primary transition active:scale-95"
                          >
                            <Image
                              src={photo.thumbnailUrl}
                              alt={`Photo ${photo.photoNumber}`}
                              fill
                              className="object-cover"
                              sizes="150px"
                            />
                            <div className="absolute top-1 left-1 bg-black/70 text-white px-1.5 py-0.5 rounded text-xs">
                              #{photo.photoNumber}
                            </div>
                          </button>
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

// Page Canvas Component
function PhotobookPageCanvas({
  page,
  template,
  onRemovePhoto
}: {
  page: PhotobookPage;
  template: typeof LAYOUT_TEMPLATES[keyof typeof LAYOUT_TEMPLATES];
  onRemovePhoto: (photoIndex: number) => void;
}) {
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

  return (
    <div className={`w-full h-full grid ${getGridClass()} gap-1 p-2`}>
      {Array.from({ length: template.slots }).map((_, index) => {
        const photo = page.photos[index];
        
        return (
          <div key={index} className="relative bg-gray-100 dark:bg-dark-700 rounded overflow-hidden group">
            {photo ? (
              <>
                <Image
                  src={photo.url}
                  alt={`Photo ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="400px"
                />
                <button
                  onClick={() => onRemovePhoto(index)}
                  className="absolute top-1 right-1 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition active:scale-95"
                >
                  <FiX className="w-3 h-3" />
                </button>
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                Empty
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
