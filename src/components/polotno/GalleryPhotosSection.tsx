'use client';

import React from 'react';
import { observer } from 'mobx-react-lite';
import { SectionTab } from 'polotno/side-panel';
import { ImagesGrid } from 'polotno/side-panel/images-grid';
import { getImageSize } from 'polotno/utils/image';

// Custom icon for gallery photos
const GalleryIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M19 3H5C3.89543 3 3 3.89543 3 5V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19V5C21 3.89543 20.1046 3 19 3Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" />
    <path
      d="M21 15L16 10L5 21"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

interface GalleryPhoto {
  id: string;
  url: string;
  width?: number;
  height?: number;
  title?: string;
}

interface GalleryPhotosPanelProps {
  store: any;
  photos: GalleryPhoto[];
}

// Panel component that displays gallery photos
export const GalleryPhotosPanel = observer(({ store, photos }: GalleryPhotosPanelProps) => {
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '20px', paddingBottom: '10px' }}>
        <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold' }}>
          Your Gallery Photos
        </h3>
        <p style={{ margin: '8px 0 0', fontSize: '13px', opacity: 0.7 }}>
          Drag and drop photos onto your photobook pages
        </p>
      </div>

      <div style={{ flex: 1, overflow: 'auto' }}>
        <ImagesGrid
          images={photos}
          getPreview={(photo) => photo.url}
          isLoading={false}
          onSelect={async (photo, pos, element) => {
            // If clicking on an existing image element, replace it
            if (element && element.type === 'image') {
              const { width, height } = await getImageSize(photo.url);
              
              // Calculate scaling to fit the element
              const scale = Math.min(
                element.width / width,
                element.height / height
              );
              
              element.set({
                src: photo.url,
              });
              return;
            }

            // Otherwise, add new image to the page
            const { width, height } = await getImageSize(photo.url);
            
            // Scale image to fit page if it's too large
            const maxWidth = store.width * 0.8;
            const maxHeight = store.height * 0.8;
            const scale = Math.min(1, maxWidth / width, maxHeight / height);
            
            const scaledWidth = width * scale;
            const scaledHeight = height * scale;
            
            // Center the image on the page
            const x = (pos?.x || store.width / 2) - scaledWidth / 2;
            const y = (pos?.y || store.height / 2) - scaledHeight / 2;

            store.activePage?.addElement({
              type: 'image',
              src: photo.url,
              x,
              y,
              width: scaledWidth,
              height: scaledHeight,
            });
          }}
          rowsNumber={2}
        />
      </div>
    </div>
  );
});

// Section configuration for Polotno
export const GalleryPhotosSection = {
  name: 'gallery-photos',
  Tab: (props: any) => (
    <SectionTab name="Gallery Photos" {...props}>
      <GalleryIcon />
    </SectionTab>
  ),
  Panel: GalleryPhotosPanel,
};
