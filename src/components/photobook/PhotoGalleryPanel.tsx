'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDrag } from 'react-dnd';
import Image from 'next/image';
import { FiSearch, FiFilter, FiCheck } from 'react-icons/fi';
import type { PhotoItem } from '@/types/photobook';

interface PhotoGalleryPanelProps {
  photos: PhotoItem[];
  usedPhotoIds: (string | undefined)[];
  onPhotoSelect: (photo: PhotoItem) => void;
}

export default function PhotoGalleryPanel({ photos, usedPhotoIds, onPhotoSelect }: PhotoGalleryPanelProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'unused' | 'used'>('all');
  const [sortMode, setSortMode] = useState<'date' | 'name'>('date');

  const filteredPhotos = useMemo(() => {
    let filtered = photos;

    // Apply filter
    if (filterMode === 'unused') {
      filtered = filtered.filter(photo => !usedPhotoIds.includes(photo.id));
    } else if (filterMode === 'used') {
      filtered = filtered.filter(photo => usedPhotoIds.includes(photo.id));
    }

    // Apply search
    if (searchQuery) {
      filtered = filtered.filter(photo =>
        photo.title?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply sort
    if (sortMode === 'name') {
      filtered = [...filtered].sort((a, b) =>
        (a.title || '').localeCompare(b.title || '')
      );
    }

    return filtered;
  }, [photos, usedPhotoIds, searchQuery, filterMode, sortMode]);

  const stats = useMemo(() => ({
    total: photos.length,
    used: usedPhotoIds.filter(Boolean).length,
    unused: photos.length - usedPhotoIds.filter(Boolean).length
  }), [photos, usedPhotoIds]);

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <h2 className="text-lg font-semibold text-white mb-4">Photo Gallery</h2>
        
        {/* Search */}
        <div className="relative mb-3">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search photos..."
            className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-3">
          {(['all', 'unused', 'used'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setFilterMode(mode)}
              className={`
                flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors capitalize
                ${filterMode === mode
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }
              `}
            >
              {mode}
              {mode === 'all' && ` (${stats.total})`}
              {mode === 'unused' && ` (${stats.unused})`}
              {mode === 'used' && ` (${stats.used})`}
            </button>
          ))}
        </div>

        {/* Sort */}
        <select
          value={sortMode}
          onChange={(e) => setSortMode(e.target.value as 'date' | 'name')}
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="date">Sort by Date</option>
          <option value="name">Sort by Name</option>
        </select>
      </div>

      {/* Photo Grid */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="grid grid-cols-2 gap-3">
          <AnimatePresence mode="popLayout">
            {filteredPhotos.map((photo) => (
              <GalleryPhotoItem
                key={photo.id}
                photo={photo}
                isUsed={usedPhotoIds.includes(photo.id)}
                onSelect={() => onPhotoSelect(photo)}
              />
            ))}
          </AnimatePresence>
        </div>

        {filteredPhotos.length === 0 && (
          <div className="flex flex-col items-center justify-center h-64 text-gray-400">
            <svg
              className="w-16 h-16 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <p className="text-sm">No photos found</p>
          </div>
        )}
      </div>

      {/* Footer Stats */}
      <div className="p-4 border-t border-gray-700 bg-gray-800/50">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400">
            {filteredPhotos.length} of {photos.length} photos
          </span>
          <span className="text-green-400 font-medium">
            {stats.used} used
          </span>
        </div>
      </div>
    </div>
  );
}

interface GalleryPhotoItemProps {
  photo: PhotoItem;
  isUsed: boolean;
  onSelect: () => void;
}

function GalleryPhotoItem({ photo, isUsed, onSelect }: GalleryPhotoItemProps) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'GALLERY_PHOTO',
    item: { photo },
    collect: (monitor) => ({
      isDragging: monitor.isDragging()
    })
  }), [photo]);

  return (
    <motion.div
      ref={drag}
      layout
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      whileHover={{ scale: 1.05, zIndex: 10 }}
      onClick={onSelect}
      className={`
        relative aspect-square rounded-lg overflow-hidden cursor-pointer group
        ${isDragging ? 'opacity-50' : 'opacity-100'}
        ${isUsed ? 'ring-2 ring-green-500' : ''}
      `}
    >
      {/* Photo */}
      <Image
        src={photo.url}
        alt={photo.title || 'Photo'}
        fill
        className="object-cover"
        sizes="(max-width: 768px) 50vw, 150px"
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="absolute bottom-0 left-0 right-0 p-2">
          {photo.title && (
            <p className="text-white text-xs font-medium truncate">
              {photo.title}
            </p>
          )}
        </div>
      </div>

      {/* Used Badge */}
      {isUsed && (
        <div className="absolute top-2 right-2 p-1.5 bg-green-500 rounded-full shadow-lg">
          <FiCheck className="w-3 h-3 text-white" />
        </div>
      )}

      {/* Drag Indicator */}
      {isDragging && (
        <div className="absolute inset-0 border-4 border-dashed border-blue-500 bg-blue-500/20 flex items-center justify-center">
          <span className="text-white font-medium">Dragging...</span>
        </div>
      )}
    </motion.div>
  );
}
