'use client';

import React, { useRef, useEffect, useState } from 'react';
import { createStore } from 'polotno/model/store';
import { PolotnoContainer, SidePanelWrap, WorkspaceWrap } from 'polotno';
import { Toolbar } from 'polotno/toolbar/toolbar';
import { ZoomButtons } from 'polotno/toolbar/zoom-buttons';
import { SidePanel, DEFAULT_SECTIONS } from 'polotno/side-panel';
import { Workspace } from 'polotno/canvas/workspace';
import { PagesTimeline } from 'polotno/pages-timeline';
import { GalleryPhotosSection } from './polotno/GalleryPhotosSection';
import { PhotobookTemplatesSection } from './polotno/PhotobookTemplatesSection';
import '@blueprintjs/core/lib/css/blueprint.css';

interface PhotobookEditorV3Props {
  galleryId: string;
  photos: Array<{
    id: string;
    url: string;
    width?: number;
    height?: number;
  }>;
  onSave?: (design: any) => void;
  onExport?: (blob: Blob) => void;
  initialDesign?: any;
}

export default function PhotobookEditorV3({
  galleryId,
  photos,
  onSave,
  onExport,
  initialDesign,
}: PhotobookEditorV3Props) {
  const [store] = useState(() => {
    const newStore = createStore({
      key: process.env.NEXT_PUBLIC_POLOTNO_KEY || 'free-key',
      showCredit: !process.env.NEXT_PUBLIC_POLOTNO_KEY, // Show credit if using free key
    });
    
    // Set default page size for photobook (8.5" x 11" at 300 DPI)
    newStore.setSize(2550, 3300);
    
    return newStore;
  });

  const [isClient, setIsClient] = useState(false);

  // Create custom sections with gallery photos
  const sections = [
    PhotobookTemplatesSection,
    {
      ...GalleryPhotosSection,
      Panel: (props: any) => <GalleryPhotosSection.Panel {...props} photos={photos} />,
    },
    ...DEFAULT_SECTIONS.filter(
      (section) =>
        section.name === 'text' ||
        section.name === 'elements' ||
        section.name === 'background'
    ),
  ];

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (initialDesign && store) {
      store.loadJSON(initialDesign);
    }
  }, [initialDesign, store]);

  // Add custom photo section for Cloudinary images
  useEffect(() => {
    if (!store || !photos.length) return;

    // Add photos to store's custom data for easy access
    (store as any).customData = {
      ...(store as any).customData,
      galleryPhotos: photos,
    };
  }, [photos, store]);

  const handleSave = async () => {
    if (!store || !onSave) return;
    
    const design = store.toJSON();
    onSave(design);
  };

  const handleExportPDF = async () => {
    if (!store || !onExport) return;

    try {
      // Use Polotno's built-in PDF export
      await store.saveAsPDF({
        fileName: 'photobook.pdf',
        pixelRatio: 2, // High quality export
      });
    } catch (error) {
      console.error('Error exporting PDF:', error);
      alert('Failed to export photobook. Please try again.');
    }
  };

  const handleExportImages = async () => {
    if (!store) return;

    try {
      // Export each page as high-quality image
      for (let i = 0; i < store.pages.length; i++) {
        const page = store.pages[i];
        await store.saveAsImage({
          pageId: page.id,
          pixelRatio: 3, // 300 DPI quality
          fileName: `photobook-page-${i + 1}.jpg`,
        });
      }
    } catch (error) {
      console.error('Error exporting images:', error);
      alert('Failed to export images. Please try again.');
    }
  };

  if (!isClient) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading photobook editor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Custom Toolbar */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Photobook Editor
          </h2>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {store.pages.length} pages
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Save Design
          </button>
          <button
            onClick={handleExportPDF}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Export PDF
          </button>
          <button
            onClick={handleExportImages}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Export Images
          </button>
        </div>
      </div>

      {/* Polotno Editor */}
      <div className="flex-1 overflow-hidden">
        <PolotnoContainer style={{ width: '100%', height: '100%' }}>
          <SidePanelWrap>
            <SidePanel store={store} sections={sections} />
          </SidePanelWrap>
          
          <WorkspaceWrap>
            <Toolbar store={store} />
            <Workspace store={store} />
            <ZoomButtons store={store} />
            <PagesTimeline store={store} />
          </WorkspaceWrap>
        </PolotnoContainer>
      </div>
    </div>
  );
}
