'use client';

import React, { useRef, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

interface PhotobookEditorV3Props {
  galleryId: string;
  photobookId?: string;
  photos: Array<{
    id: string;
    url: string;
    width?: number;
    height?: number;
    title?: string;
  }>;
  onSave?: (design: any) => void;
  onSubmit?: (design: any, coverPhotoUrl: string | null) => Promise<void>;
  onExport?: (blob: Blob) => void;
  onClose?: () => void;
  initialDesign?: any;
}

export default function PhotobookEditorV3(props: PhotobookEditorV3Props) {
  const [isClient, setIsClient] = useState(false);
  const [PolotnoEditor, setPolotnoEditor] = useState<any>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    setIsClient(true);
    
    // Dynamically import Polotno and all dependencies only on client
    const loadPolotno = async () => {
      try {
        setLoadError(null);
        console.log('Loading Polotno modules...');
        
        const [
          { createStore },
          { PolotnoContainer, SidePanelWrap, WorkspaceWrap },
          { Toolbar },
          { ZoomButtons },
          { SidePanel, DEFAULT_SECTIONS },
          { Workspace },
          { PagesTimeline },
          { GalleryPhotosSection },
          { PhotobookTemplatesSection },
        ] = await Promise.all([
          import('polotno/model/store'),
          import('polotno'),
          import('polotno/toolbar/toolbar'),
          import('polotno/toolbar/zoom-buttons'),
          import('polotno/side-panel'),
          import('polotno/canvas/workspace'),
          import('polotno/pages-timeline'),
          import('./polotno/GalleryPhotosSection'),
          import('./polotno/PhotobookTemplatesSection'),
        ]);
        
        console.log('Polotno modules loaded successfully');

        setPolotnoEditor({
          createStore,
          PolotnoContainer,
          SidePanelWrap,
          WorkspaceWrap,
          Toolbar,
          ZoomButtons,
          SidePanel,
          DEFAULT_SECTIONS,
          Workspace,
          PagesTimeline,
          GalleryPhotosSection,
          PhotobookTemplatesSection,
        });
      } catch (error) {
        console.error('Error loading Polotno:', error);
        setLoadError(error instanceof Error ? error.message : 'Failed to load editor');
      }
    };

    loadPolotno();
  }, []);

  if (loadError) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-900 p-8">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Unable to Load Editor
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {loadError}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!isClient || !PolotnoEditor) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading photobook editor...</p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">This may take a few seconds...</p>
        </div>
      </div>
    );
  }

  return <PhotobookEditorInner {...props} polotno={PolotnoEditor} />;
}

// Separate component that uses Polotno after it's loaded
function PhotobookEditorInner({
  galleryId,
  photobookId,
  photos,
  onSave,
  onSubmit,
  onExport,
  onClose,
  initialDesign,
  polotno,
}: PhotobookEditorV3Props & { polotno: any }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [store] = useState(() => {
    const newStore = polotno.createStore({
      key: process.env.NEXT_PUBLIC_POLOTNO_KEY || 'free-key',
      showCredit: !process.env.NEXT_PUBLIC_POLOTNO_KEY,
    });
    
    newStore.setSize(2550, 3300);
    return newStore;
  });

  // Create custom sections with gallery photos
  const sections = [
    polotno.PhotobookTemplatesSection,
    {
      ...polotno.GalleryPhotosSection,
      Panel: (props: any) => <polotno.GalleryPhotosSection.Panel {...props} photos={photos} />,
    },
    ...polotno.DEFAULT_SECTIONS.filter(
      (section: any) =>
        section.name === 'text' ||
        section.name === 'elements' ||
        section.name === 'background'
    ),
  ];

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

  const handleSubmit = async () => {
    if (!store || !onSubmit || isSubmitting) return;

    try {
      setIsSubmitting(true);
      
      // Get the design
      const design = store.toJSON();
      
      // Try to extract cover photo from first page
      let coverPhotoUrl: string | null = null;
      if (design.pages && design.pages[0]) {
        const firstPage = design.pages[0];
        const imageElement = firstPage.children?.find((child: any) => child.type === 'image');
        if (imageElement && imageElement.src) {
          coverPhotoUrl = imageElement.src;
        }
      }
      
      // Call the onSubmit callback
      await onSubmit(design, coverPhotoUrl);
    } catch (error) {
      console.error('Error submitting photobook:', error);
      alert('Failed to submit photobook. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
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

  const {
    PolotnoContainer,
    SidePanelWrap,
    WorkspaceWrap,
    Toolbar,
    ZoomButtons,
    SidePanel,
    Workspace,
    PagesTimeline,
  } = polotno;

  return (
    <div className="w-full h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Custom Toolbar */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onClose}
            className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            title="Close Editor"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
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
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isSubmitting}
          >
            Save Design
          </button>
          {onSubmit && photobookId && (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || !store || store.pages.length === 0}
              className="px-6 py-2 bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-lg hover:from-pink-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-lg"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Submitting...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Submit for Review
                </span>
              )}
            </button>
          )}
          <button
            onClick={handleExportPDF}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isSubmitting}
          >
            Export PDF
          </button>
          <button
            onClick={handleExportImages}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isSubmitting}
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
