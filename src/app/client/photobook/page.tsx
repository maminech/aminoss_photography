'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';

// Dynamically import PhotobookEditorV3 (client-side only)
const PhotobookEditorV3 = dynamic(
  () => import('@/components/PhotobookEditorV3'),
  { ssr: false }
);

export default function PhotobookEditorPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const galleryId = searchParams.get('galleryId');
  const photobookId = searchParams.get('photobookId');
  
  const [photos, setPhotos] = useState<Array<{
    id: string;
    url: string;
    width?: number;
    height?: number;
  }>>([]);
  const [photobook, setPhotobook] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        // If photobookId provided, load existing photobook first
        if (photobookId) {
          const photobookRes = await fetch(`/api/client/photobook?photobookId=${photobookId}`);
          if (photobookRes.ok) {
            const photobookData = await photobookRes.json();
            setPhotobook(photobookData.photobook);
            
            // If no galleryId in URL but photobook has one, we can proceed
            if (!galleryId && photobookData.photobook?.galleryId) {
              // Update URL to include galleryId
              window.history.replaceState(
                null,
                '',
                `/client/photobook?galleryId=${photobookData.photobook.galleryId}&photobookId=${photobookId}`
              );
              // Continue loading with the gallery ID from photobook
              const actualGalleryId = photobookData.photobook.galleryId;
              
              // Fetch gallery photos using client galleries API
              const galleriesRes = await fetch('/api/client/galleries');
              if (galleriesRes.ok) {
                const galleries = await galleriesRes.json();
                const gallery = galleries.find((g: any) => g.id === actualGalleryId);
                if (gallery && gallery.photos) {
                  setPhotos(gallery.photos.map((p: any) => ({
                    id: p.id,
                    url: p.url,
                    thumbnailUrl: p.thumbnailUrl,
                    width: p.width,
                    height: p.height,
                  })));
                }
              }
              
              setLoading(false);
              return;
            }
          } else {
            throw new Error('Failed to load photobook');
          }
        }
        
        // If no galleryId at this point, show error
        if (!galleryId) {
          setError('No gallery selected. Please select photos from a gallery first.');
          setLoading(false);
          return;
        }

        // Fetch gallery photos using client galleries API
        const galleriesRes = await fetch('/api/client/galleries');
        if (galleriesRes.ok) {
          const galleries = await galleriesRes.json();
          const gallery = galleries.find((g: any) => g.id === galleryId);
          if (gallery && gallery.photos) {
            setPhotos(gallery.photos.map((p: any) => ({
              id: p.id,
              url: p.url,
              thumbnailUrl: p.thumbnailUrl,
              width: p.width,
              height: p.height,
            })));
          } else {
            throw new Error('Gallery not found');
          }
        } else {
          throw new Error('Failed to load galleries');
        }

        setLoading(false);
      } catch (err) {
        console.error('Error loading data:', err);
        setError('Failed to load data. Please try again.');
        setLoading(false);
      }
    };

    loadData();
  }, [galleryId, photobookId]);

  const handleSave = async (design: any) => {
    try {
      // Always use POST endpoint - it handles both create and update
      const body: any = {
        galleryId,
        design,
        title: photobook?.title || `Photobook ${new Date().toLocaleDateString()}`,
      };
      
      // If we have a photobookId, include it for update
      if (photobookId || photobook?.id) {
        body.photobookId = photobookId || photobook.id;
      }

      const response = await fetch('/api/client/photobook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save photobook');
      }

      const data = await response.json();
      
      // Update photobook state with returned data
      if (data.photobook) {
        setPhotobook(data.photobook);
        
        // Update URL if this was a new photobook (no photobookId in URL yet)
        if (!photobookId && data.photobook.id) {
          const newUrl = `/client/photobook?galleryId=${galleryId}&photobookId=${data.photobook.id}`;
          window.history.replaceState(null, '', newUrl);
        }
      }
      
      return { success: true, photobook: data.photobook };
    } catch (error) {
      console.error('Error saving photobook:', error);
      throw error; // Let the editor handle the error display
    }
  };

  const handleSubmit = async (design: any, coverPhotoUrl: string | null) => {
    try {
      // First, ensure the photobook is saved with latest design
      let currentPhotobookId = photobookId || photobook?.id;
      
      if (!currentPhotobookId) {
        // If no photobook ID yet, save it first
        const saveResult = await handleSave(design);
        if (saveResult && saveResult.photobook) {
          currentPhotobookId = saveResult.photobook.id;
        }
      }

      if (!currentPhotobookId) {
        throw new Error('Failed to save photobook before submission');
      }

      // Now submit the photobook
      const response = await fetch('/api/client/photobook/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          photobookId: currentPhotobookId,
          title: photobook?.title || `Photobook ${new Date().toLocaleDateString()}`,
          design,
          coverPhotoUrl,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit photobook');
      }

      const data = await response.json();
      
      // Show success message and redirect
      alert(data.message || 'Photobook submitted successfully! Our team will review it shortly.');
      router.push('/client/photobooks');
    } catch (error: any) {
      console.error('Error submitting photobook:', error);
      alert(error.message || 'Failed to submit photobook. Please try again.');
      throw error; // Re-throw to let the editor handle it
    }
  };

  const handleExport = (blob: Blob) => {
    // Create download link
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `photobook-${Date.now()}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full mx-auto mb-4"
          />
          <p className="text-gray-600 dark:text-gray-400">
            Loading your photos...
          </p>
        </div>
      </div>
    );
  }

  if (error || !galleryId) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center max-w-md p-8">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {error || 'No Gallery Selected'}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Please select a gallery to create a photobook from.
          </p>
          <button
            onClick={() => router.back()}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <PhotobookEditorV3
      galleryId={galleryId}
      photobookId={photobookId || undefined}
      photos={photos}
      initialDesign={photobook?.design}
      onSave={handleSave}
      onSubmit={handleSubmit}
      onExport={handleExport}
      onClose={() => router.push('/client/photobooks')}
    />
  );
}
