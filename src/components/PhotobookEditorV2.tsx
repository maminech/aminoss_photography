'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import Image from 'next/image';
import {
  FiX,
  FiPlus,
  FiTrash2,
  FiChevronLeft,
  FiChevronRight,
  FiRotateCw,
  FiSave,
  FiSend,
  FiBook,
  FiMaximize2,
  FiMinimize2,
  FiCopy,
  FiLayers,
  FiImage,
} from 'react-icons/fi';

interface Photo {
  id: string;
  url: string;
  thumbnailUrl: string;
  photoNumber: number;
  width?: number;
  height?: number;
}

interface PhotoOnPage {
  id: string;
  photoId: string;
  url: string;
  x: number; // percentage
  y: number; // percentage
  width: number; // percentage
  height: number; // percentage
  rotation: number; // degrees
  zIndex: number;
}

interface PhotobookPage {
  id?: string;
  pageNumber: number;
  photos: PhotoOnPage[];
  backgroundColor?: string;
  backgroundImage?: string;
}

interface PhotobookEditorProps {
  galleryId: string;
  selectedPhotos: Photo[];
  onClose: () => void;
  onComplete: () => void;
}

export default function PhotobookEditorV2({
  galleryId,
  selectedPhotos,
  onClose,
  onComplete
}: PhotobookEditorProps) {
  const [step, setStep] = useState<'format' | 'design' | 'review'>('format');
  const [format, setFormat] = useState<'20x30' | '30x30' | null>(null);
  const [pages, setPages] = useState<PhotobookPage[]>([]);
  const [currentSpreadIndex, setCurrentSpreadIndex] = useState(0); // Each spread shows 2 pages
  const [availablePhotos, setAvailablePhotos] = useState<Photo[]>(selectedPhotos);
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoOnPage | null>(null);
  const [selectedPageIndex, setSelectedPageIndex] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [title, setTitle] = useState('My Photobook');
  const [notes, setNotes] = useState('');
  const [photobookId, setPhotobookId] = useState<string | null>(null);
  const [creatingPhotobook, setCreatingPhotobook] = useState(false);
  const [draggedPhoto, setDraggedPhoto] = useState<Photo | null>(null);
  const [showTools, setShowTools] = useState(false);

  const pageRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});

  useEffect(() => {
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
          if (data.photobook.pages && data.photobook.pages.length > 0) {
            const convertedPages = data.photobook.pages.map((page: any) => ({
              id: page.id,
              pageNumber: page.pageNumber,
              photos: Array.isArray(page.photos) ? page.photos : [],
              backgroundColor: page.backgroundColor || '#ffffff',
            }));
            setPages(convertedPages);
            setStep('design');
          }
        }
      }
    } catch (error) {
      console.error('Error loading photobook:', error);
    }
  };

  const selectFormat = async (selectedFormat: '20x30' | '30x30') => {
    if (creatingPhotobook) return;
    
    setCreatingPhotobook(true);
    setFormat(selectedFormat);
    
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
        
        // Create first 2 pages
        setPages([
          { pageNumber: 1, photos: [], backgroundColor: '#ffffff' },
          { pageNumber: 2, photos: [], backgroundColor: '#ffffff' },
        ]);
        
        setTimeout(() => {
          setStep('design');
          setCreatingPhotobook(false);
        }, 300);
      } else {
        const error = await res.json();
        alert(`Error creating photobook: ${error.error}`);
        setCreatingPhotobook(false);
        setFormat(null);
      }
    } catch (error: any) {
      alert(`Error creating photobook: ${error.message}`);
      setCreatingPhotobook(false);
      setFormat(null);
    }
  };

  const addPages = () => {
    const newPages = [
      { pageNumber: pages.length + 1, photos: [], backgroundColor: '#ffffff' },
      { pageNumber: pages.length + 2, photos: [], backgroundColor: '#ffffff' },
    ];
    setPages([...pages, ...newPages]);
  };

  const handlePhotoDropOnPage = (photo: Photo, pageIndex: number, event: any) => {
    const pageRef = pageRefs.current[pageIndex];
    if (!pageRef) return;

    const rect = pageRef.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;

    const newPhoto: PhotoOnPage = {
      id: `${Date.now()}_${Math.random()}`,
      photoId: photo.id,
      url: photo.url,
      x: Math.max(0, Math.min(75, x)), // Keep within bounds
      y: Math.max(0, Math.min(75, y)),
      width: 25, // Default 25% of page
      height: 25,
      rotation: 0,
      zIndex: pages[pageIndex].photos.length + 1,
    };

    const updatedPages = [...pages];
    updatedPages[pageIndex].photos.push(newPhoto);
    setPages(updatedPages);
  };

  const updatePhotoPosition = (pageIndex: number, photoId: string, deltaX: number, deltaY: number) => {
    const pageRef = pageRefs.current[pageIndex];
    if (!pageRef) return;

    const rect = pageRef.getBoundingClientRect();
    const deltaXPercent = (deltaX / rect.width) * 100;
    const deltaYPercent = (deltaY / rect.height) * 100;

    const updatedPages = [...pages];
    const photo = updatedPages[pageIndex].photos.find(p => p.id === photoId);
    if (photo) {
      photo.x = Math.max(0, Math.min(100 - photo.width, photo.x + deltaXPercent));
      photo.y = Math.max(0, Math.min(100 - photo.height, photo.y + deltaYPercent));
      setPages(updatedPages);
    }
  };

  const updatePhotoSize = (pageIndex: number, photoId: string, deltaWidth: number, deltaHeight: number) => {
    const pageRef = pageRefs.current[pageIndex];
    if (!pageRef) return;

    const rect = pageRef.getBoundingClientRect();
    const deltaWPercent = (deltaWidth / rect.width) * 100;
    const deltaHPercent = (deltaHeight / rect.height) * 100;

    const updatedPages = [...pages];
    const photo = updatedPages[pageIndex].photos.find(p => p.id === photoId);
    if (photo) {
      photo.width = Math.max(10, Math.min(100 - photo.x, photo.width + deltaWPercent));
      photo.height = Math.max(10, Math.min(100 - photo.y, photo.height + deltaHPercent));
      setPages(updatedPages);
    }
  };

  const rotatePhoto = (pageIndex: number, photoId: string) => {
    const updatedPages = [...pages];
    const photo = updatedPages[pageIndex].photos.find(p => p.id === photoId);
    if (photo) {
      photo.rotation = (photo.rotation + 90) % 360;
      setPages(updatedPages);
    }
  };

  const deletePhoto = (pageIndex: number, photoId: string) => {
    const updatedPages = [...pages];
    updatedPages[pageIndex].photos = updatedPages[pageIndex].photos.filter(p => p.id !== photoId);
    setPages(updatedPages);
    setSelectedPhoto(null);
    setSelectedPageIndex(null);
  };

  const bringToFront = (pageIndex: number, photoId: string) => {
    const updatedPages = [...pages];
    const maxZIndex = Math.max(...updatedPages[pageIndex].photos.map(p => p.zIndex), 0);
    const photo = updatedPages[pageIndex].photos.find(p => p.id === photoId);
    if (photo) {
      photo.zIndex = maxZIndex + 1;
      setPages(updatedPages);
    }
  };

  const duplicatePhoto = (pageIndex: number, photoId: string) => {
    const updatedPages = [...pages];
    const photo = updatedPages[pageIndex].photos.find(p => p.id === photoId);
    if (photo) {
      const newPhoto = {
        ...photo,
        id: `${Date.now()}_${Math.random()}`,
        x: Math.min(90, photo.x + 5),
        y: Math.min(90, photo.y + 5),
        zIndex: Math.max(...updatedPages[pageIndex].photos.map(p => p.zIndex)) + 1,
      };
      updatedPages[pageIndex].photos.push(newPhoto);
      setPages(updatedPages);
    }
  };

  const changeBackgroundColor = (pageIndex: number, color: string) => {
    const updatedPages = [...pages];
    updatedPages[pageIndex].backgroundColor = color;
    setPages(updatedPages);
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
          pages: pages.map(page => ({
            pageNumber: page.pageNumber,
            layoutType: 'freeform',
            photos: page.photos,
            backgroundColor: page.backgroundColor,
          })),
        }),
      });

      if (res.ok) {
        // Show success message
        setTimeout(() => setSaving(false), 500);
      } else {
        alert('Error saving photobook');
        setSaving(false);
      }
    } catch (error) {
      alert('Error saving photobook');
      setSaving(false);
    }
  };

  const submitPhotobook = async () => {
    if (!photobookId) return;
    
    setSubmitting(true);
    try {
      const res = await fetch('/api/client/photobook/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          photobookId,
          title,
          notes,
          pages: pages.map(page => ({
            pageNumber: page.pageNumber,
            layoutType: 'freeform',
            photos: page.photos,
            backgroundColor: page.backgroundColor,
          })),
        }),
      });

      if (res.ok) {
        alert('Photobook submitted successfully!');
        onComplete();
      } else {
        alert('Error submitting photobook');
        setSubmitting(false);
      }
    } catch (error) {
      alert('Error submitting photobook');
      setSubmitting(false);
    }
  };

  const leftPage = pages[currentSpreadIndex * 2];
  const rightPage = pages[currentSpreadIndex * 2 + 1];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-gray-900/95 backdrop-blur-sm"
    >
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-gray-800 to-gray-900 border-b border-gray-700 px-4 md:px-6 py-3 md:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 md:gap-4">
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-700 rounded-lg transition touch-manipulation"
              >
                <FiX className="w-5 h-5 md:w-6 md:h-6 text-gray-300" />
              </button>
              {step === 'design' && (
                <div>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="text-lg md:text-xl font-bold bg-transparent text-white border-b border-transparent hover:border-gray-600 focus:border-primary focus:outline-none px-2 py-1 transition"
                  />
                  <p className="text-xs text-gray-400 mt-1 px-2">{format} • {pages.length} pages</p>
                </div>
              )}
            </div>

            {step === 'design' && (
              <div className="flex items-center gap-2">
                <button
                  onClick={saveProgress}
                  disabled={saving}
                  className="flex items-center gap-2 px-3 md:px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition text-sm md:text-base font-medium"
                >
                  <FiSave className="w-4 h-4" />
                  <span className="hidden sm:inline">{saving ? 'Saving...' : 'Save'}</span>
                </button>
                <button
                  onClick={() => setStep('review')}
                  className="flex items-center gap-2 px-3 md:px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition text-sm md:text-base font-medium"
                >
                  <FiBook className="w-4 h-4" />
                  <span className="hidden sm:inline">Review</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Format Selection */}
        {step === 'format' && (
          <div className="flex-1 overflow-y-auto p-4 md:p-8 flex items-center justify-center">
            <div className="max-w-4xl w-full">
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="text-center mb-8"
              >
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
                  Choose Your Photobook Format
                </h2>
                <p className="text-gray-400 text-lg">
                  Select the perfect size for your memories
                </p>
              </motion.div>

              <div className="grid md:grid-cols-2 gap-6">
                <motion.button
                  whileHover={{ scale: 1.02, y: -5 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => selectFormat('20x30')}
                  disabled={creatingPhotobook}
                  className="relative bg-gradient-to-br from-blue-600/20 to-blue-800/20 border-2 border-blue-500/50 rounded-2xl p-8 text-left hover:border-blue-400 transition group disabled:opacity-60 min-h-[320px] backdrop-blur-sm"
                >
                  {creatingPhotobook && format === null ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-2xl">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                    </div>
                  ) : null}
                  <div className="aspect-[2/3] bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl shadow-2xl mb-6 flex items-center justify-center border-4 border-blue-400/50 group-hover:scale-105 transition-transform">
                    <span className="text-6xl">📖</span>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">
                    20cm × 30cm
                  </h3>
                  <p className="text-blue-300 text-sm">
                    Portrait • Perfect for vertical photos • Classic size
                  </p>
                  <div className="absolute top-4 right-4 bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                    Portrait
                  </div>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02, y: -5 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => selectFormat('30x30')}
                  disabled={creatingPhotobook}
                  className="relative bg-gradient-to-br from-purple-600/20 to-purple-800/20 border-2 border-purple-500/50 rounded-2xl p-8 text-left hover:border-purple-400 transition group disabled:opacity-60 min-h-[320px] backdrop-blur-sm"
                >
                  {creatingPhotobook && format === null ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-2xl">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
                    </div>
                  ) : null}
                  <div className="aspect-square bg-gradient-to-br from-purple-500 to-purple-700 rounded-xl shadow-2xl mb-6 flex items-center justify-center border-4 border-purple-400/50 group-hover:scale-105 transition-transform">
                    <span className="text-6xl">📕</span>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">
                    30cm × 30cm
                  </h3>
                  <p className="text-purple-300 text-sm">
                    Square • Instagram-style • Modern design
                  </p>
                  <div className="absolute top-4 right-4 bg-purple-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                    Square
                  </div>
                </motion.button>
              </div>

              {creatingPhotobook && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 p-4 bg-blue-500/20 border border-blue-500/50 rounded-xl text-center backdrop-blur-sm"
                >
                  <div className="flex items-center justify-center gap-3">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-400"></div>
                    <p className="text-blue-200 font-medium">
                      Creating your photobook...
                    </p>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        )}

        {/* Design Page */}
        {step === 'design' && (
          <div className="flex-1 flex overflow-hidden">
            {/* Left Sidebar - Photo Library */}
            <motion.div
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              className="w-64 bg-gray-800 border-r border-gray-700 flex flex-col overflow-hidden"
            >
              <div className="p-4 border-b border-gray-700">
                <h3 className="text-white font-semibold flex items-center gap-2">
                  <FiImage className="w-5 h-5" />
                  Your Photos ({selectedPhotos.length})
                </h3>
                <p className="text-xs text-gray-400 mt-1">Drag photos onto pages</p>
              </div>
              <div className="flex-1 overflow-y-auto p-3 space-y-3">
                {selectedPhotos.map((photo) => (
                  <div
                    key={photo.id}
                    draggable
                    onDragStart={(e: React.DragEvent<HTMLDivElement>) => {
                      setDraggedPhoto(photo);
                      e.dataTransfer.effectAllowed = 'copy';
                    }}
                    onDragEnd={() => setDraggedPhoto(null)}
                    className="relative aspect-square rounded-lg overflow-hidden cursor-grab active:cursor-grabbing shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95 border-2 border-gray-700 hover:border-primary"
                  >
                    <Image
                      src={photo.thumbnailUrl || photo.url}
                      alt={`Photo ${photo.photoNumber}`}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 hover:opacity-100 transition-opacity flex items-end">
                      <span className="text-white text-xs font-medium p-2">
                        #{photo.photoNumber}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Center - Book Spread */}
            <div className="flex-1 flex flex-col overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
              {/* Book Controls */}
              <div className="p-4 flex items-center justify-between border-b border-gray-700">
                <button
                  onClick={() => setCurrentSpreadIndex(Math.max(0, currentSpreadIndex - 1))}
                  disabled={currentSpreadIndex === 0}
                  className="p-2 bg-gray-700 hover:bg-gray-600 disabled:opacity-30 disabled:cursor-not-allowed rounded-lg transition text-white"
                >
                  <FiChevronLeft className="w-6 h-6" />
                </button>
                <div className="text-center">
                  <p className="text-white font-semibold">
                    Pages {leftPage?.pageNumber || '—'} - {rightPage?.pageNumber || '—'}
                  </p>
                  <p className="text-xs text-gray-400">Spread {currentSpreadIndex + 1}</p>
                </div>
                <button
                  onClick={() => setCurrentSpreadIndex(currentSpreadIndex + 1)}
                  disabled={!rightPage}
                  className="p-2 bg-gray-700 hover:bg-gray-600 disabled:opacity-30 disabled:cursor-not-allowed rounded-lg transition text-white"
                >
                  <FiChevronRight className="w-6 h-6" />
                </button>
              </div>

              {/* Book Spread Container */}
              <div className="flex-1 overflow-auto p-8 flex items-center justify-center">
                <div className="relative">
                  {/* 3D Book Effect */}
                  <div className="flex gap-1 perspective-1000" style={{ perspective: '2000px' }}>
                    {/* Left Page */}
                    {leftPage && (
                      <PhotobookPageCanvas
                        page={leftPage}
                        pageIndex={currentSpreadIndex * 2}
                        format={format!}
                        pageRef={(el) => (pageRefs.current[currentSpreadIndex * 2] = el)}
                        onDrop={(e) => {
                          e.preventDefault();
                          if (draggedPhoto) {
                            handlePhotoDropOnPage(draggedPhoto, currentSpreadIndex * 2, e);
                          }
                        }}
                        selectedPhoto={selectedPhoto}
                        selectedPageIndex={selectedPageIndex}
                        onSelectPhoto={(photo) => {
                          setSelectedPhoto(photo);
                          setSelectedPageIndex(currentSpreadIndex * 2);
                        }}
                        onUpdatePosition={(photoId, deltaX, deltaY) => 
                          updatePhotoPosition(currentSpreadIndex * 2, photoId, deltaX, deltaY)
                        }
                        onUpdateSize={(photoId, deltaWidth, deltaHeight) =>
                          updatePhotoSize(currentSpreadIndex * 2, photoId, deltaWidth, deltaHeight)
                        }
                        onRotate={(photoId) => rotatePhoto(currentSpreadIndex * 2, photoId)}
                        onDelete={(photoId) => deletePhoto(currentSpreadIndex * 2, photoId)}
                        onBringToFront={(photoId) => bringToFront(currentSpreadIndex * 2, photoId)}
                        onDuplicate={(photoId) => duplicatePhoto(currentSpreadIndex * 2, photoId)}
                      />
                    )}

                    {/* Right Page */}
                    {rightPage && (
                      <PhotobookPageCanvas
                        page={rightPage}
                        pageIndex={currentSpreadIndex * 2 + 1}
                        format={format!}
                        pageRef={(el) => (pageRefs.current[currentSpreadIndex * 2 + 1] = el)}
                        onDrop={(e) => {
                          e.preventDefault();
                          if (draggedPhoto) {
                            handlePhotoDropOnPage(draggedPhoto, currentSpreadIndex * 2 + 1, e);
                          }
                        }}
                        selectedPhoto={selectedPhoto}
                        selectedPageIndex={selectedPageIndex}
                        onSelectPhoto={(photo) => {
                          setSelectedPhoto(photo);
                          setSelectedPageIndex(currentSpreadIndex * 2 + 1);
                        }}
                        onUpdatePosition={(photoId, deltaX, deltaY) =>
                          updatePhotoPosition(currentSpreadIndex * 2 + 1, photoId, deltaX, deltaY)
                        }
                        onUpdateSize={(photoId, deltaWidth, deltaHeight) =>
                          updatePhotoSize(currentSpreadIndex * 2 + 1, photoId, deltaWidth, deltaHeight)
                        }
                        onRotate={(photoId) => rotatePhoto(currentSpreadIndex * 2 + 1, photoId)}
                        onDelete={(photoId) => deletePhoto(currentSpreadIndex * 2 + 1, photoId)}
                        onBringToFront={(photoId) => bringToFront(currentSpreadIndex * 2 + 1, photoId)}
                        onDuplicate={(photoId) => duplicatePhoto(currentSpreadIndex * 2 + 1, photoId)}
                      />
                    )}
                  </div>

                  {/* Book Spine Shadow */}
                  <div className="absolute top-0 bottom-0 left-1/2 w-2 bg-gradient-to-r from-black/40 via-black/60 to-black/40 transform -translate-x-1/2 blur-sm pointer-events-none" />
                </div>
              </div>

              {/* Page Navigation */}
              <div className="p-4 border-t border-gray-700 flex items-center justify-center gap-2 overflow-x-auto">
                <button
                  onClick={addPages}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium flex items-center gap-2 transition"
                >
                  <FiPlus className="w-4 h-4" />
                  Add 2 Pages
                </button>
                <div className="flex gap-2 ml-4">
                  {pages.map((page, index) => (
                    <button
                      key={page.pageNumber}
                      onClick={() => setCurrentSpreadIndex(Math.floor(index / 2))}
                      className={`w-12 h-16 rounded border-2 transition ${
                        Math.floor(index / 2) === currentSpreadIndex
                          ? 'border-primary bg-primary/20'
                          : 'border-gray-600 bg-gray-700 hover:border-gray-500'
                      }`}
                    >
                      <span className="text-xs text-white">{page.pageNumber}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Sidebar - Tools */}
            {selectedPhoto && selectedPageIndex !== null && (
              <motion.div
                initial={{ x: 300 }}
                animate={{ x: 0 }}
                className="w-64 bg-gray-800 border-l border-gray-700 p-4 overflow-y-auto"
              >
                <h3 className="text-white font-semibold mb-4">Photo Tools</h3>
                <div className="space-y-3">
                  <button
                    onClick={() => {
                      if (selectedPageIndex !== null && selectedPhoto) {
                        rotatePhoto(selectedPageIndex, selectedPhoto.id);
                      }
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition text-white"
                  >
                    <FiRotateCw className="w-5 h-5" />
                    <span>Rotate 90°</span>
                  </button>
                  <button
                    onClick={() => {
                      if (selectedPageIndex !== null && selectedPhoto) {
                        bringToFront(selectedPageIndex, selectedPhoto.id);
                      }
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition text-white"
                  >
                    <FiLayers className="w-5 h-5" />
                    <span>Bring to Front</span>
                  </button>
                  <button
                    onClick={() => {
                      if (selectedPageIndex !== null && selectedPhoto) {
                        duplicatePhoto(selectedPageIndex, selectedPhoto.id);
                      }
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition text-white"
                  >
                    <FiCopy className="w-5 h-5" />
                    <span>Duplicate</span>
                  </button>
                  <button
                    onClick={() => {
                      if (selectedPageIndex !== null && selectedPhoto) {
                        deletePhoto(selectedPageIndex, selectedPhoto.id);
                      }
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 bg-red-600 hover:bg-red-700 rounded-lg transition text-white"
                  >
                    <FiTrash2 className="w-5 h-5" />
                    <span>Delete Photo</span>
                  </button>
                </div>

                <div className="mt-6">
                  <h4 className="text-white font-medium mb-3">Background Color</h4>
                  <div className="grid grid-cols-4 gap-2">
                    {['#ffffff', '#f3f4f6', '#e5e7eb', '#d1d5db', '#9ca3af', '#6b7280', '#1f2937', '#111827', '#fecaca', '#fed7aa', '#fef08a', '#d9f99d', '#bfdbfe', '#ddd6fe', '#fbcfe8', '#fda4af'].map((color) => (
                      <button
                        key={color}
                        onClick={() => {
                          if (selectedPageIndex !== null) {
                            changeBackgroundColor(selectedPageIndex, color);
                          }
                        }}
                        className="w-full aspect-square rounded-lg border-2 border-gray-600 hover:border-white transition"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        )}

        {/* Review Page */}
        {step === 'review' && (
          <div className="flex-1 overflow-y-auto p-8 bg-gray-900">
            <div className="max-w-6xl mx-auto">
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="text-center mb-8"
              >
                <h2 className="text-3xl font-bold text-white mb-3">Review Your Photobook</h2>
                <p className="text-gray-400">Check everything before submitting</p>
              </motion.div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {pages.map((page) => (
                  <div
                    key={page.pageNumber}
                    className="bg-gray-800 rounded-xl p-4 border border-gray-700"
                  >
                    <div
                      className={`${format === '20x30' ? 'aspect-[2/3]' : 'aspect-square'} rounded-lg mb-3 relative`}
                      style={{ backgroundColor: page.backgroundColor || '#ffffff' }}
                    >
                      {page.photos.map((photo) => (
                        <div
                          key={photo.id}
                          className="absolute"
                          style={{
                            left: `${photo.x}%`,
                            top: `${photo.y}%`,
                            width: `${photo.width}%`,
                            height: `${photo.height}%`,
                            transform: `rotate(${photo.rotation}deg)`,
                            zIndex: photo.zIndex,
                          }}
                        >
                          <img src={photo.url} alt="" className="w-full h-full object-cover rounded shadow-lg" />
                        </div>
                      ))}
                    </div>
                    <p className="text-white text-sm text-center">
                      Page {page.pageNumber} • {page.photos.length} photos
                    </p>
                  </div>
                ))}
              </div>

              <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 mb-6">
                <label className="block text-white font-medium mb-2">Notes for Admin (Optional)</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any special instructions or requests..."
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-primary focus:outline-none"
                  rows={3}
                />
              </div>

              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => setStep('design')}
                  className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition"
                >
                  Back to Editing
                </button>
                <button
                  onClick={submitPhotobook}
                  disabled={submitting || pages.length === 0}
                  className="px-8 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-lg font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <FiSend className="w-5 h-5" />
                  {submitting ? 'Submitting...' : 'Submit Photobook'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// PhotobookPageCanvas Component
interface PhotobookPageCanvasProps {
  page: PhotobookPage;
  pageIndex: number;
  format: '20x30' | '30x30';
  pageRef: (el: HTMLDivElement | null) => void;
  onDrop: (e: React.DragEvent) => void;
  selectedPhoto: PhotoOnPage | null;
  selectedPageIndex: number | null;
  onSelectPhoto: (photo: PhotoOnPage) => void;
  onUpdatePosition: (photoId: string, deltaX: number, deltaY: number) => void;
  onUpdateSize: (photoId: string, deltaWidth: number, deltaHeight: number) => void;
  onRotate: (photoId: string) => void;
  onDelete: (photoId: string) => void;
  onBringToFront: (photoId: string) => void;
  onDuplicate: (photoId: string) => void;
}

function PhotobookPageCanvas({
  page,
  pageIndex,
  format,
  pageRef,
  onDrop,
  selectedPhoto,
  selectedPageIndex,
  onSelectPhoto,
  onUpdatePosition,
  onUpdateSize,
  onRotate,
  onDelete,
  onBringToFront,
  onDuplicate,
}: PhotobookPageCanvasProps) {
  const [isDragOver, setIsDragOver] = useState(false);

  return (
    <motion.div
      ref={pageRef}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`relative ${
        format === '20x30' ? 'w-[300px] h-[450px]' : 'w-[400px] h-[400px]'
      } bg-white shadow-2xl rounded-lg overflow-hidden`}
      style={{
        backgroundColor: page.backgroundColor || '#ffffff',
        transformStyle: 'preserve-3d',
        transform: pageIndex % 2 === 0 ? 'rotateY(2deg)' : 'rotateY(-2deg)',
      }}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragOver(true);
      }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={(e) => {
        setIsDragOver(false);
        onDrop(e);
      }}
    >
      {/* Drop Zone Indicator */}
      {isDragOver && (
        <div className="absolute inset-0 bg-primary/20 border-4 border-dashed border-primary z-50 flex items-center justify-center">
          <div className="text-center">
            <FiImage className="w-12 h-12 text-primary mx-auto mb-2" />
            <p className="text-primary font-semibold">Drop photo here</p>
          </div>
        </div>
      )}

      {/* Page Number */}
      <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded z-10">
        {page.pageNumber}
      </div>

      {/* Photos on Page */}
      {page.photos
        .sort((a, b) => a.zIndex - b.zIndex)
        .map((photo) => (
          <DraggablePhoto
            key={photo.id}
            photo={photo}
            isSelected={selectedPhoto?.id === photo.id && selectedPageIndex === pageIndex}
            onSelect={() => onSelectPhoto(photo)}
            onUpdatePosition={(deltaX, deltaY) => onUpdatePosition(photo.id, deltaX, deltaY)}
            onUpdateSize={(deltaWidth, deltaHeight) => onUpdateSize(photo.id, deltaWidth, deltaHeight)}
            onRotate={() => onRotate(photo.id)}
            onDelete={() => onDelete(photo.id)}
          />
        ))}

      {/* Empty State */}
      {page.photos.length === 0 && !isDragOver && (
        <div className="absolute inset-0 flex items-center justify-center opacity-30">
          <div className="text-center">
            <FiImage className="w-16 h-16 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-400 font-medium">Drag photos here</p>
          </div>
        </div>
      )}
    </motion.div>
  );
}

// DraggablePhoto Component
interface DraggablePhotoProps {
  photo: PhotoOnPage;
  isSelected: boolean;
  onSelect: () => void;
  onUpdatePosition: (deltaX: number, deltaY: number) => void;
  onUpdateSize: (deltaWidth: number, deltaHeight: number) => void;
  onRotate: () => void;
  onDelete: () => void;
}

function DraggablePhoto({
  photo,
  isSelected,
  onSelect,
  onUpdatePosition,
  onUpdateSize,
  onRotate,
  onDelete,
}: DraggablePhotoProps) {
  return (
    <motion.div
      drag
      dragMomentum={false}
      dragElastic={0}
      onDragEnd={(_, info: PanInfo) => {
        onUpdatePosition(info.offset.x, info.offset.y);
      }}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
      className="absolute cursor-move group"
      style={{
        left: `${photo.x}%`,
        top: `${photo.y}%`,
        width: `${photo.width}%`,
        height: `${photo.height}%`,
        transform: `rotate(${photo.rotation}deg)`,
        zIndex: photo.zIndex,
      }}
      whileHover={{ scale: 1.02 }}
    >
      {/* Photo Image */}
      <div className="relative w-full h-full">
        <img
          src={photo.url}
          alt=""
          className={`w-full h-full object-cover rounded shadow-lg ${
            isSelected ? 'ring-4 ring-primary' : ''
          }`}
          draggable={false}
        />

        {/* Selection Handles */}
        {isSelected && (
          <>
            {/* Resize Handle */}
            <motion.div
              drag
              dragMomentum={false}
              onDrag={(_, info: PanInfo) => {
                onUpdateSize(info.offset.x, info.offset.y);
              }}
              className="absolute -bottom-2 -right-2 w-6 h-6 bg-primary rounded-full cursor-nwse-resize shadow-lg flex items-center justify-center z-10"
              onClick={(e) => e.stopPropagation()}
            >
              <FiMaximize2 className="w-3 h-3 text-white" />
            </motion.div>

            {/* Quick Actions */}
            <div className="absolute -top-10 left-0 right-0 flex gap-1 justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRotate();
                }}
                className="p-1.5 bg-blue-600 hover:bg-blue-700 rounded shadow-lg text-white"
              >
                <FiRotateCw className="w-3 h-3" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
                className="p-1.5 bg-red-600 hover:bg-red-700 rounded shadow-lg text-white"
              >
                <FiTrash2 className="w-3 h-3" />
              </button>
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
}
