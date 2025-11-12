'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiPlus, FiMinus, FiRotateCcw, FiRotateCw, FiSave, FiDownload,
  FiEye, FiZap, FiLayout, FiImage, FiX, FiChevronLeft, 
  FiChevronRight, FiGrid, FiMaximize2, FiCheck
} from 'react-icons/fi';
import PhotobookPage from './PhotobookPage';
import PhotoGalleryPanel from './PhotoGalleryPanel';
import TemplatePanel from './TemplatePanel';
import AutoLayoutEngine from './AutoLayoutEngine';
import { usePhotobookState } from '@/hooks/usePhotobookState';
import type { PhotobookData, PageTemplate, PhotoItem } from '@/types/photobook';

interface SmartPhotobookBuilderProps {
  galleryId: string;
  photos: PhotoItem[];
  onSave?: (data: PhotobookData) => Promise<void>;
  onClose?: () => void;
  initialData?: PhotobookData;
}

export default function SmartPhotobookBuilder({
  galleryId,
  photos,
  onSave,
  onClose,
  initialData
}: SmartPhotobookBuilderProps) {
  const {
    pages,
    currentPageIndex,
    history,
    historyIndex,
    addPage,
    removePage,
    updatePage,
    setCurrentPage,
    undo,
    redo,
    canUndo,
    canRedo,
    saveState,
    loadState
  } = usePhotobookState(initialData);

  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const [showTemplatePanel, setShowTemplatePanel] = useState(false);
  const [showGalleryPanel, setShowGalleryPanel] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState<PageTemplate | null>(null);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [isExporting, setIsExporting] = useState(false);
  const autoSaveTimerRef = useRef<NodeJS.Timeout>();

  // Auto-save functionality
  useEffect(() => {
    if (!autoSaveEnabled || !onSave) return;

    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    autoSaveTimerRef.current = setTimeout(() => {
      handleSave(true);
    }, 3000); // Auto-save after 3 seconds of inactivity

    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [pages, autoSaveEnabled]);

  const handleSave = async (isAutoSave = false) => {
    if (!onSave) return;
    
    try {
      setIsSaving(true);
      const photobookData: PhotobookData = {
        galleryId,
        pages,
        settings: {
          title: `Photobook - ${new Date().toLocaleDateString()}`,
          coverImage: pages[0]?.slots[0]?.photo?.url || '',
          pageCount: pages.length,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      };
      
      await onSave(photobookData);
      
      if (!isAutoSave) {
        // Show success notification
        console.log('Photobook saved successfully!');
      }
    } catch (error) {
      console.error('Failed to save photobook:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAutoFill = useCallback(() => {
    const unusedPhotos = photos.filter(photo => 
      !pages.some(page => 
        page.slots.some(slot => slot.photo?.id === photo.id)
      )
    );

    if (unusedPhotos.length === 0) return;

    const autoLayoutEngine = new AutoLayoutEngine(unusedPhotos);
    const newPages = autoLayoutEngine.generateOptimalLayout();
    
    newPages.forEach(page => addPage(page));
  }, [photos, pages, addPage]);

  const handleTemplateSelect = (template: PageTemplate) => {
    if (pages[currentPageIndex]) {
      updatePage(currentPageIndex, {
        ...pages[currentPageIndex],
        template: template.id,
        slots: template.slots.map((slot, index) => ({
          ...slot,
          photo: pages[currentPageIndex].slots[index]?.photo || null
        }))
      });
    }
    setShowTemplatePanel(false);
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      // Dynamic import for heavy PDF library
      const { exportToPDF } = await import('@/lib/photobook/pdfExporter');
      await exportToPDF(pages, {
        dpi: 300,
        colorMode: 'CMYK',
        bleed: true
      });
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-gray-900 flex flex-col">
      {/* Top Toolbar */}
      <div className="bg-gray-800 border-b border-gray-700 px-2 sm:px-4 py-2 sm:py-3 flex items-center justify-between overflow-x-auto">
        <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors flex-shrink-0"
          >
            <FiX className="w-5 h-5 text-gray-300" />
          </button>
          
          <div className="h-6 sm:h-8 w-px bg-gray-700 hidden sm:block" />
          
          <h1 className="text-sm sm:text-lg font-semibold text-white whitespace-nowrap">
            <span className="hidden sm:inline">Smart Photobook Builder</span>
            <span className="sm:hidden">Photobook</span>
          </h1>
          
          <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-gray-400">
            <span>{pages.length}p</span>
            <span className="hidden sm:inline">•</span>
            <span className="hidden sm:inline">Page {currentPageIndex + 1}</span>
          </div>
        </div>

        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
          {/* Undo/Redo - Hidden on mobile */}
          <div className="hidden md:flex items-center gap-1 bg-gray-700/50 rounded-lg p-1">
            <button
              onClick={undo}
              disabled={!canUndo}
              className="p-2 hover:bg-gray-600 rounded disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              title="Undo"
            >
              <FiRotateCcw className="w-4 h-4 text-gray-300" />
            </button>
            <button
              onClick={redo}
              disabled={!canRedo}
              className="p-2 hover:bg-gray-600 rounded disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              title="Redo"
            >
              <FiRotateCw className="w-4 h-4 text-gray-300" />
            </button>
          </div>

          {/* Auto-fill */}
          <button
            onClick={handleAutoFill}
            className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-lg transition-all text-white font-medium text-xs sm:text-sm"
          >
            <FiZap className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Auto-Fill</span>
            <span className="sm:hidden">Auto</span>
          </button>

          {/* Zoom controls - Hidden on mobile */}
          <div className="hidden lg:flex items-center gap-1 bg-gray-700/50 rounded-lg p-1">
            <button
              onClick={() => setZoomLevel(Math.max(50, zoomLevel - 10))}
              className="p-2 hover:bg-gray-600 rounded transition-colors"
            >
              <FiMinus className="w-4 h-4 text-gray-300" />
            </button>
            <span className="text-sm text-gray-300 px-2 min-w-[4rem] text-center">
              {zoomLevel}%
            </span>
            <button
              onClick={() => setZoomLevel(Math.min(150, zoomLevel + 10))}
              className="p-2 hover:bg-gray-600 rounded transition-colors"
            >
              <FiPlus className="w-4 h-4 text-gray-300" />
            </button>
          </div>

          {/* Preview - Icon only on mobile */}
          <button
            onClick={() => setIsPreviewMode(!isPreviewMode)}
            className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 rounded-lg transition-colors text-xs sm:text-sm ${
              isPreviewMode 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            <FiEye className="w-4 h-4" />
            <span className="hidden sm:inline">Preview</span>
          </button>

          {/* Save */}
          <button
            onClick={() => handleSave(false)}
            disabled={isSaving}
            className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-800 disabled:cursor-not-allowed rounded-lg transition-colors text-white font-medium text-xs sm:text-sm"
          >
            {isSaving ? (
              <>
                <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span className="hidden sm:inline">Saving...</span>
              </>
            ) : (
              <>
                <FiSave className="w-4 h-4" />
                <span className="hidden sm:inline">Save</span>
              </>
            )}
          </button>

          {/* Export - Hidden on mobile, show in dropdown */}
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="hidden md:flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:cursor-not-allowed rounded-lg transition-colors text-white font-medium text-xs sm:text-sm"
          >
            {isExporting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <FiDownload className="w-4 h-4" />
                Export PDF
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Sidebar - Gallery (Overlay on mobile) */}
        <AnimatePresence>
          {showGalleryPanel && !isPreviewMode && (
            <motion.div
              initial={{ x: -320, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -320, opacity: 0 }}
              className="w-full sm:w-80 bg-gray-800 border-r border-gray-700 flex flex-col absolute sm:relative z-20 inset-y-0 left-0"
            >
              <PhotoGalleryPanel 
                photos={photos}
                usedPhotoIds={pages.flatMap(p => p.slots.map(s => s.photo?.id).filter(Boolean))}
                onPhotoSelect={(photo) => {
                  // Add photo to current page's first empty slot
                  const page = pages[currentPageIndex];
                  if (!page) return;
                  
                  const emptySlotIndex = page.slots.findIndex(slot => !slot.photo);
                  if (emptySlotIndex !== -1) {
                    const updatedSlots = [...page.slots];
                    updatedSlots[emptySlotIndex] = {
                      ...updatedSlots[emptySlotIndex],
                      photo
                    };
                    updatePage(currentPageIndex, {
                      ...page,
                      slots: updatedSlots
                    });
                  }
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Center - Canvas */}
        <div className="flex-1 flex flex-col bg-gradient-to-br from-gray-900 via-gray-850 to-gray-900 relative overflow-hidden">
          {/* Canvas Controls - Mobile friendly */}
          <div className="absolute top-2 sm:top-4 left-2 sm:left-4 z-10 flex flex-col gap-2">
            <button
              onClick={() => setShowGalleryPanel(!showGalleryPanel)}
              className="p-2 sm:p-3 bg-gray-800/90 backdrop-blur-sm hover:bg-gray-700 rounded-lg transition-colors shadow-lg touch-manipulation"
              title={showGalleryPanel ? 'Hide Gallery' : 'Show Gallery'}
            >
              <FiImage className="w-4 h-4 sm:w-5 sm:h-5 text-gray-300" />
            </button>
            <button
              onClick={() => setShowTemplatePanel(!showTemplatePanel)}
              className="p-2 sm:p-3 bg-gray-800/90 backdrop-blur-sm hover:bg-gray-700 rounded-lg transition-colors shadow-lg touch-manipulation"
              title="Templates"
            >
              <FiLayout className="w-4 h-4 sm:w-5 sm:h-5 text-gray-300" />
            </button>
            <button
              onClick={() => setShowTemplatePanel(!showTemplatePanel)}
              className="p-2 sm:p-3 bg-gray-800/90 backdrop-blur-sm hover:bg-gray-700 rounded-lg transition-colors shadow-lg touch-manipulation"
              title="Grid View"
            >
              <FiGrid className="w-4 h-4 sm:w-5 sm:h-5 text-gray-300" />
            </button>
          </div>

          {/* Page Navigation - Mobile optimized */}
          <div className="absolute bottom-4 sm:bottom-8 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2 sm:gap-4 bg-gray-800/90 backdrop-blur-sm px-3 sm:px-6 py-2 sm:py-3 rounded-full shadow-2xl">
            <button
              onClick={() => setCurrentPage(Math.max(0, currentPageIndex - 1))}
              disabled={currentPageIndex === 0}
              className="p-2 hover:bg-gray-700 rounded-full disabled:opacity-30 disabled:cursor-not-allowed transition-colors touch-manipulation"
            >
              <FiChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 text-gray-300" />
            </button>
            
            <div className="flex items-center gap-1 sm:gap-2">
              <span className="text-white font-medium text-sm sm:text-base">
                {currentPageIndex + 1}
              </span>
              <span className="text-gray-500 text-sm sm:text-base">/</span>
              <span className="text-gray-400 text-sm sm:text-base">{pages.length}</span>
            </div>
            
            <button
              onClick={() => setCurrentPage(Math.min(pages.length - 1, currentPageIndex + 1))}
              disabled={currentPageIndex === pages.length - 1}
              className="p-2 hover:bg-gray-700 rounded-full disabled:opacity-30 disabled:cursor-not-allowed transition-colors touch-manipulation"
            >
              <FiChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-300" />
            </button>

            <div className="h-6 w-px bg-gray-700 mx-2" />

            <button
              onClick={() => addPage()}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-full transition-colors text-white text-sm font-medium"
            >
              <FiPlus className="w-4 h-4" />
              Add Page
            </button>
          </div>

          {/* Canvas Content */}
          <div className="flex-1 flex items-center justify-center p-8 overflow-auto">
            <motion.div
              style={{
                transform: `scale(${zoomLevel / 100})`
              }}
              className="transition-transform duration-200 origin-center"
            >
              {pages[currentPageIndex] && (
                <PhotobookPage
                  page={pages[currentPageIndex]}
                  onUpdate={(updatedPage) => updatePage(currentPageIndex, updatedPage)}
                  isPreview={isPreviewMode}
                />
              )}
            </motion.div>
          </div>
        </div>

        {/* Right Sidebar - Templates */}
        <AnimatePresence>
          {showTemplatePanel && !isPreviewMode && (
            <motion.div
              initial={{ x: 320, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 320, opacity: 0 }}
              className="w-80 bg-gray-800 border-l border-gray-700"
            >
              <TemplatePanel
                onTemplateSelect={handleTemplateSelect}
                currentTemplate={pages[currentPageIndex]?.template}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Status Bar */}
      <div className="bg-gray-800 border-t border-gray-700 px-4 py-2 flex items-center justify-between text-sm">
        <div className="flex items-center gap-4 text-gray-400">
          <span>
            {photos.length} photos available
          </span>
          <span>•</span>
          <span>
            {pages.flatMap(p => p.slots).filter(s => s.photo).length} photos used
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          {autoSaveEnabled && (
            <div className="flex items-center gap-2 text-gray-400">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span>Auto-save enabled</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
