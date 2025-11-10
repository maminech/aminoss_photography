'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { FiX, FiDownload, FiSave, FiGrid, FiImage } from 'react-icons/fi';

interface SimplePhotobookEditorProps {
  galleryId: string;
  photos: Array<{
    id: string;
    url: string;
    width?: number;
    height?: number;
    title?: string;
  }>;
  onSave?: (design: any) => void;
  onClose?: () => void;
}

type LayoutType = 'single' | 'grid-2' | 'grid-3' | 'grid-4' | 'collage';

interface Page {
  id: string;
  layout: LayoutType;
  photoIds: string[];
}

export default function SimplePhotobookEditor({
  galleryId,
  photos,
  onSave,
  onClose,
}: SimplePhotobookEditorProps) {
  const [pages, setPages] = useState<Page[]>([
    { id: '1', layout: 'grid-2', photoIds: [] }
  ]);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [saving, setSaving] = useState(false);

  const currentPage = pages[currentPageIndex];

  const layouts: { type: LayoutType; name: string; slots: number }[] = [
    { type: 'single', name: 'Single Photo', slots: 1 },
    { type: 'grid-2', name: '2 Photos', slots: 2 },
    { type: 'grid-3', name: '3 Photos', slots: 3 },
    { type: 'grid-4', name: '4 Photos', slots: 4 },
    { type: 'collage', name: 'Collage (6)', slots: 6 },
  ];

  const addPage = () => {
    const newPage: Page = {
      id: Date.now().toString(),
      layout: 'grid-2',
      photoIds: [],
    };
    setPages([...pages, newPage]);
    setCurrentPageIndex(pages.length);
  };

  const deletePage = (index: number) => {
    if (pages.length === 1) return;
    const newPages = pages.filter((_, i) => i !== index);
    setPages(newPages);
    if (currentPageIndex >= newPages.length) {
      setCurrentPageIndex(newPages.length - 1);
    }
  };

  const changeLayout = (layout: LayoutType) => {
    const newPages = [...pages];
    newPages[currentPageIndex] = {
      ...currentPage,
      layout,
      photoIds: [],
    };
    setPages(newPages);
  };

  const addPhotoToSlot = (photoId: string, slotIndex: number) => {
    const newPages = [...pages];
    const newPhotoIds = [...currentPage.photoIds];
    newPhotoIds[slotIndex] = photoId;
    newPages[currentPageIndex] = {
      ...currentPage,
      photoIds: newPhotoIds,
    };
    setPages(newPages);
  };

  const removePhotoFromSlot = (slotIndex: number) => {
    const newPages = [...pages];
    const newPhotoIds = [...currentPage.photoIds];
    newPhotoIds.splice(slotIndex, 1);
    newPages[currentPageIndex] = {
      ...currentPage,
      photoIds: newPhotoIds,
    };
    setPages(newPages);
  };

  const handleSave = async () => {
    if (!onSave) return;
    setSaving(true);
    try {
      await onSave({ pages, galleryId });
    } finally {
      setSaving(false);
    }
  };

  const getLayoutClass = (layout: LayoutType) => {
    switch (layout) {
      case 'single':
        return 'grid-cols-1';
      case 'grid-2':
        return 'grid-cols-2';
      case 'grid-3':
        return 'grid-cols-3';
      case 'grid-4':
        return 'grid-cols-2 grid-rows-2';
      case 'collage':
        return 'grid-cols-3 grid-rows-2';
      default:
        return 'grid-cols-2';
    }
  };

  const getSlotsForLayout = (layout: LayoutType) => {
    return layouts.find(l => l.type === layout)?.slots || 2;
  };

  return (
    <div className="fixed inset-0 z-[200] bg-white dark:bg-dark-900 flex flex-col">
      {/* Header */}
      <div className="bg-white dark:bg-dark-800 border-b border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onClose}
              className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
              title="Close Editor"
            >
              <FiX className="w-6 h-6" />
            </button>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Photobook Editor
            </h2>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {pages.length} {pages.length === 1 ? 'page' : 'pages'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition disabled:opacity-50"
            >
              <FiSave className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save Photobook'}
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar - Photo Gallery */}
        <div className="w-64 bg-gray-50 dark:bg-dark-800 border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
          <div className="p-4">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
              Your Photos ({photos.length})
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {photos.map((photo) => (
                <div
                  key={photo.id}
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData('photoId', photo.id);
                  }}
                  className="relative aspect-square bg-gray-200 dark:bg-dark-700 rounded overflow-hidden cursor-grab active:cursor-grabbing group"
                >
                  <Image
                    src={photo.url}
                    alt={photo.title || 'Photo'}
                    fill
                    className="object-cover"
                    sizes="128px"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                    <p className="text-white text-xs text-center px-2">
                      Drag to page
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Editor Area */}
        <div className="flex-1 flex flex-col">
          {/* Layout Options */}
          <div className="bg-gray-50 dark:bg-dark-800 border-b border-gray-200 dark:border-gray-700 p-4">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
              Layout
            </h3>
            <div className="flex gap-2 flex-wrap">
              {layouts.map((layout) => (
                <button
                  key={layout.type}
                  onClick={() => changeLayout(layout.type)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                    currentPage.layout === layout.type
                      ? 'bg-primary text-white'
                      : 'bg-white dark:bg-dark-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-600'
                  }`}
                >
                  <FiGrid className="w-4 h-4 inline mr-1" />
                  {layout.name}
                </button>
              ))}
            </div>
          </div>

          {/* Page Canvas */}
          <div className="flex-1 overflow-auto bg-gray-100 dark:bg-dark-900 p-8">
            <div className="max-w-4xl mx-auto">
              {/* Page Preview */}
              <div className="bg-white dark:bg-dark-800 shadow-2xl rounded-lg p-8 aspect-[8.5/11]">
                <div className={`grid ${getLayoutClass(currentPage.layout)} gap-4 h-full`}>
                  {Array.from({ length: getSlotsForLayout(currentPage.layout) }).map((_, index) => {
                    const photoId = currentPage.photoIds[index];
                    const photo = photos.find(p => p.id === photoId);

                    return (
                      <div
                        key={index}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => {
                          e.preventDefault();
                          const photoId = e.dataTransfer.getData('photoId');
                          if (photoId) {
                            addPhotoToSlot(photoId, index);
                          }
                        }}
                        className="relative bg-gray-100 dark:bg-dark-700 rounded-lg overflow-hidden group border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-primary transition"
                      >
                        {photo ? (
                          <>
                            <Image
                              src={photo.url}
                              alt={photo.title || 'Photo'}
                              fill
                              className="object-cover"
                              sizes="(max-width: 768px) 50vw, 33vw"
                            />
                            <button
                              onClick={() => removePhotoFromSlot(index)}
                              className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition hover:bg-red-700"
                            >
                              <FiX className="w-4 h-4" />
                            </button>
                          </>
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center text-gray-400 dark:text-gray-500">
                            <div className="text-center">
                              <FiImage className="w-8 h-8 mx-auto mb-2" />
                              <p className="text-sm">Drop photo here</p>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Pages Timeline */}
          <div className="bg-gray-50 dark:bg-dark-800 border-t border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center gap-2 overflow-x-auto">
              {pages.map((page, index) => (
                <div
                  key={page.id}
                  className={`relative flex-shrink-0 w-24 h-32 rounded-lg cursor-pointer transition ${
                    currentPageIndex === index
                      ? 'ring-2 ring-primary'
                      : 'ring-1 ring-gray-300 dark:ring-gray-600 hover:ring-primary'
                  }`}
                  onClick={() => setCurrentPageIndex(index)}
                >
                  <div className="w-full h-full bg-white dark:bg-dark-700 rounded-lg p-2">
                    <div className={`grid ${getLayoutClass(page.layout)} gap-1 h-full`}>
                      {Array.from({ length: getSlotsForLayout(page.layout) }).map((_, i) => (
                        <div key={i} className="bg-gray-200 dark:bg-dark-600 rounded" />
                      ))}
                    </div>
                  </div>
                  <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs text-gray-600 dark:text-gray-400">
                    Page {index + 1}
                  </span>
                  {pages.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deletePage(index);
                      }}
                      className="absolute -top-2 -right-2 p-1 bg-red-600 text-white rounded-full hover:bg-red-700 transition"
                    >
                      <FiX className="w-3 h-3" />
                    </button>
                  )}
                </div>
              ))}
              <button
                onClick={addPage}
                className="flex-shrink-0 w-24 h-32 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-center hover:border-primary transition text-gray-400 hover:text-primary"
              >
                <span className="text-2xl">+</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
