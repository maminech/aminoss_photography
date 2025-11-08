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
  
  const [photos, setPhotos] = useState<Array<{
    id: string;
    url: string;
    width?: number;
    height?: number;
  }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!galleryId) {
      setError('No gallery selected');
      setLoading(false);
      return;
    }

    // Fetch gallery photos
    fetch(`/api/galleries/${galleryId}/photos`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load gallery photos');
        return res.json();
      })
      .then((data) => {
        setPhotos(data.photos || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error loading photos:', err);
        setError('Failed to load gallery photos');
        setLoading(false);
      });
  }, [galleryId]);

  const handleSave = async (design: any) => {
    try {
      const response = await fetch('/api/photobooks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          galleryId,
          design,
          name: `Photobook ${new Date().toLocaleDateString()}`,
        }),
      });

      if (!response.ok) throw new Error('Failed to save photobook');

      const data = await response.json();
      alert('Photobook saved successfully!');
    } catch (error) {
      console.error('Error saving photobook:', error);
      alert('Failed to save photobook. Please try again.');
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
      photos={photos}
      onSave={handleSave}
      onExport={handleExport}
    />
  );
}
