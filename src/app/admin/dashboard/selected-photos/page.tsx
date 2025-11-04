'use client';

import { useState, useEffect } from 'react';
import { FiImage, FiUser, FiDownload, FiCheck } from 'react-icons/fi';

interface Client {
  id: string;
  name: string;
  email: string;
}

interface Photo {
  id: string;
  url: string;
  thumbnailUrl: string;
  photoNumber: number;
  galleryName: string;
}

interface GroupedData {
  client: Client;
  photos: Photo[];
}

export default function SelectedPhotosPage() {
  const [data, setData] = useState<Record<string, GroupedData>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSelectedPhotos();
  }, []);

  const fetchSelectedPhotos = async () => {
    try {
      const res = await fetch('/api/admin/selected-photos');
      if (res.ok) {
        const groupedData = await res.json();
        setData(groupedData);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalPhotos = Object.values(data).reduce((sum, group) => sum + group.photos.length, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="px-6 py-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Photos Selected for Print</h1>
            <p className="text-sm text-gray-600 mt-1">
              {Object.keys(data).length} clients • {totalPhotos} total photos selected
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6">
        {Object.keys(data).length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <FiImage className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Photos Selected Yet</h3>
            <p className="text-gray-600">
              Photos selected by clients for printing will appear here
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(data).map(([clientName, group]) => (
              <div key={group.client.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                {/* Client Header */}
                <div className="bg-gradient-to-r from-primary/10 to-primary/5 px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center font-semibold">
                        {clientName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-gray-900">{clientName}</h2>
                        <p className="text-sm text-gray-600">{group.client.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="px-3 py-1 bg-primary text-white rounded-full text-sm font-semibold">
                        {group.photos.length} photo{group.photos.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Photos Grid */}
                <div className="p-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
                    {group.photos.map((photo) => (
                      <div key={photo.id} className="relative group">
                        <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 border-primary shadow-md">
                          <img
                            src={photo.thumbnailUrl}
                            alt={`Photo #${photo.photoNumber}`}
                            className="w-full h-full object-cover"
                          />
                          
                          {/* Photo Number */}
                          <div className="absolute top-2 left-2 bg-primary text-white px-2 py-1 rounded font-bold text-sm shadow-lg">
                            #{photo.photoNumber}
                          </div>

                          {/* Check Mark */}
                          <div className="absolute top-2 right-2 w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center shadow-lg">
                            <FiCheck className="w-4 h-4" />
                          </div>

                          {/* Gallery Name on Hover */}
                          <div className="absolute bottom-0 left-0 right-0 bg-black/80 text-white text-xs p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            {photo.galleryName}
                          </div>
                        </div>

                        {/* Download Button */}
                        <a
                          href={photo.url}
                          download
                          target="_blank"
                          rel="noopener noreferrer"
                          className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/50 opacity-0 group-hover:opacity-100 transition-all rounded-lg"
                        >
                          <div className="bg-white text-gray-900 p-2 rounded-full shadow-lg transform scale-0 group-hover:scale-100 transition-transform">
                            <FiDownload className="w-5 h-5" />
                          </div>
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
