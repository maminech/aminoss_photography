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
    if (!galleryId) {
      setError('No gallery selected');
      setLoading(false);
      return;
    }

    const loadData = async () => {
      try {
        // Fetch gallery photos
        const photosRes = await fetch(`/api/galleries/${galleryId}/photos`);
        if (!photosRes.ok) throw new Error('Failed to load gallery photos');
        const photosData = await photosRes.json();
        setPhotos(photosData.photos || []);

        // If photobookId provided, load existing photobook
        if (photobookId) {
          const photobookRes = await fetch(`/api/client/photobook?photobookId=${photobookId}`);
          if (photobookRes.ok) {
            const photobookData = await photobookRes.json();
            setPhotobook(photobookData.photobook);
          }
        }

        setLoading(false);
      } catch (err) {
        console.error('Error loading data:', err);
        setError('Failed to load data');
        setLoading(false);
      }
    };

    loadData();
  }, [galleryId, photobookId]);

  const handleSave = async (design: any) => {
    try {
      // If we have a photobookId, update existing, otherwise create new
      let endpoint = '/api/client/photobook';
      let method = photobookId ? 'PUT' : 'POST';
      
      const body: any = {
        galleryId,
        design,
        title: `Photobook ${new Date().toLocaleDateString()}`,
      };
      
      if (photobookId) {
        body.photobookId = photobookId;
      }

      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!response.ok) throw new Error('Failed to save photobook');

      const data = await response.json();
      
      // Update photobook state with returned data
      if (data.photobook) {
        setPhotobook(data.photobook);
        // Update URL if this was a new photobook
        if (!photobookId && data.photobook.id) {
          window.history.replaceState(
            null,
            '',
            `/client/photobook?galleryId=${galleryId}&photobookId=${data.photobook.id}`
          );
        }
      }
      
      alert('Photobook saved successfully!');
    } catch (error) {
      console.error('Error saving photobook:', error);
      alert('Failed to save photobook. Please try again.');
    }
  };

  const handleSubmit = async (design: any, coverPhotoUrl: string | null) => {
    if (!photobookId) {
      alert('Please save your photobook first before submitting.');
      return;
    }

    try {
      const response = await fetch('/api/client/photobook/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          photobookId,
          title: photobook?.title || `Photobook ${new Date().toLocaleDateString()}`,
          design,
          coverPhotoUrl,
        }),
      });

      if (!response.ok) throw new Error('Failed to submit photobook');

      alert('Photobook submitted successfully! Our team will review it shortly.');
      router.push('/client/photobooks');
    } catch (error) {
      console.error('Error submitting photobook:', error);
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
