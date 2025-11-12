'use client';

import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useDrag, useDrop } from 'react-dnd';
import Image from 'next/image';
import { FiX, FiMaximize2, FiEdit3, FiZoomIn, FiZoomOut, FiMove } from 'react-icons/fi';
import type { Page, PhotoSlot, PhotoItem } from '@/types/photobook';

interface PhotobookPageProps {
  page: Page;
  onUpdate: (page: Page) => void;
  isPreview?: boolean;
}

export default function PhotobookPage({ page, onUpdate, isPreview }: PhotobookPageProps) {
  const [selectedSlotIndex, setSelectedSlotIndex] = useState<number | null>(null);

  const handlePhotoRemove = (slotIndex: number) => {
    const updatedSlots = [...page.slots];
    updatedSlots[slotIndex] = {
      ...updatedSlots[slotIndex],
      photo: null
    };
    onUpdate({ ...page, slots: updatedSlots });
  };

  const handleSlotUpdate = (slotIndex: number, updates: Partial<PhotoSlot>) => {
    const updatedSlots = [...page.slots];
    updatedSlots[slotIndex] = {
      ...updatedSlots[slotIndex],
      ...updates
    };
    onUpdate({ ...page, slots: updatedSlots });
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, rotateY: -15 }}
      animate={{ opacity: 1, scale: 1, rotateY: 0 }}
      exit={{ opacity: 0, scale: 0.95, rotateY: 15 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="relative w-full h-full max-w-[800px] max-h-[600px]"
      style={{
        transformStyle: 'preserve-3d',
        aspectRatio: '4/3'
      }}
    >
      {/* Page Shadow */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900/50 to-transparent rounded-lg blur-2xl transform translate-y-4" />

      {/* Page Content */}
      <div 
        className="relative w-full h-full bg-white rounded-lg shadow-2xl overflow-hidden"
        style={{
          backgroundColor: page.backgroundColor || '#ffffff',
          padding: page.padding || '20px'
        }}
      >
        {/* Grid Layout */}
        <div 
          className="w-full h-full grid gap-2 sm:gap-4"
          style={{
            gridTemplateColumns: `repeat(${page.gridColumns || 2}, 1fr)`,
            gridTemplateRows: `repeat(${page.gridRows || 2}, 1fr)`
          }}
        >
          {page.slots.map((slot, index) => (
            <PhotoSlot
              key={index}
              slot={slot}
              index={index}
              onRemove={() => handlePhotoRemove(index)}
              onUpdate={(updates) => handleSlotUpdate(index, updates)}
              isSelected={selectedSlotIndex === index}
              onSelect={() => setSelectedSlotIndex(index)}
              isPreview={isPreview}
            />
          ))}
        </div>

        {/* Page Number */}
        {!isPreview && (
          <div className="absolute bottom-4 right-4 text-xs text-gray-400 font-medium">
            {page.pageNumber}
          </div>
        )}
      </div>
    </motion.div>
  );
}

interface PhotoSlotProps {
  slot: PhotoSlot;
  index: number;
  onRemove: () => void;
  onUpdate: (updates: Partial<PhotoSlot>) => void;
  isSelected: boolean;
  onSelect: () => void;
  isPreview?: boolean;
}

function PhotoSlot({ slot, index, onRemove, onUpdate, isSelected, onSelect, isPreview }: PhotoSlotProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isAdjusting, setIsAdjusting] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  
  const scale = slot.scale || 1;
  const offsetX = slot.offsetX || 0;
  const offsetY = slot.offsetY || 0;

  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'PHOTO',
    item: { slot, index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging()
    }),
    canDrag: () => !isAdjusting
  }), [slot, isAdjusting]);

  const [{ isOver }, drop] = useDrop(() => ({
    accept: ['PHOTO', 'GALLERY_PHOTO'],
    drop: (item: any) => {
      if (item.photo) {
        // Dropped from gallery
        onUpdate({ photo: item.photo, scale: 1, offsetX: 0, offsetY: 0 });
      } else if (item.slot) {
        // Swapped with another slot
        onUpdate({ photo: item.slot.photo });
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver()
    })
  }), []);

  const handleZoomIn = () => {
    const newScale = Math.min((scale || 1) + 0.1, 3);
    onUpdate({ scale: newScale });
  };

  const handleZoomOut = () => {
    const newScale = Math.max((scale || 1) - 0.1, 0.5);
    onUpdate({ scale: newScale });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isAdjusting) return;
    e.stopPropagation();
    setDragStart({ x: e.clientX - offsetX, y: e.clientY - offsetY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isAdjusting || !dragStart) return;
    e.stopPropagation();
    const newOffsetX = e.clientX - dragStart.x;
    const newOffsetY = e.clientY - dragStart.y;
    onUpdate({ offsetX: newOffsetX, offsetY: newOffsetY });
  };

  const handleMouseUp = () => {
    setDragStart(null);
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (!isAdjusting) return;
    e.stopPropagation();
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.05 : 0.05;
    const newScale = Math.max(0.5, Math.min(3, (scale || 1) + delta));
    onUpdate({ scale: newScale });
  };

  const resetAdjustments = () => {
    onUpdate({ scale: 1, offsetX: 0, offsetY: 0 });
  };

  return (
    <motion.div
      ref={(node) => drag(drop(node))}
      layout
      onClick={onSelect}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`
        relative rounded-lg overflow-hidden cursor-pointer transition-all
        ${isSelected ? 'ring-4 ring-blue-500 ring-offset-4 ring-offset-white' : ''}
        ${isOver ? 'ring-4 ring-green-500 ring-offset-4 ring-offset-white' : ''}
        ${isDragging ? 'opacity-50' : 'opacity-100'}
      `}
      style={{
        gridColumn: `span ${slot.span?.col || 1}`,
        gridRow: `span ${slot.span?.row || 1}`,
        backgroundColor: slot.photo ? 'transparent' : '#f3f4f6',
        borderRadius: slot.borderRadius || '8px'
      }}
      whileHover={{ scale: isPreview ? 1 : 1.02 }}
      transition={{ duration: 0.2 }}
    >
      {slot.photo ? (
        <>
          {/* Photo */}
          <div 
            ref={imageRef}
            className="relative w-full h-full overflow-hidden"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onWheel={handleWheel}
            style={{ cursor: isAdjusting ? 'move' : 'pointer' }}
          >
            <div
              className="relative w-full h-full"
              style={{
                transform: `scale(${scale}) translate(${offsetX / scale}px, ${offsetY / scale}px)`,
                transformOrigin: 'center center',
                transition: dragStart ? 'none' : 'transform 0.1s ease-out'
              }}
            >
              <Image
                src={slot.photo.url}
                alt={slot.photo.title || 'Photo'}
                fill
                className="object-cover pointer-events-none"
                style={{
                  objectFit: slot.fit || 'cover',
                  objectPosition: slot.position || 'center'
                }}
                draggable={false}
              />
            </div>
            
            {/* Adjustment Mode Indicator */}
            {!isPreview && isAdjusting && (
              <div className="absolute top-1 sm:top-2 left-1 sm:left-2 bg-blue-500 text-white px-2 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-medium flex items-center gap-1 shadow-lg">
                <FiMove className="w-2 h-2 sm:w-3 sm:h-3" />
                <span className="hidden sm:inline">Drag to move • Scroll to zoom</span>
                <span className="sm:hidden">Adjust</span>
              </div>
            )}

            {/* Overlay Controls - Touch-friendly */}
            {!isPreview && (isHovered || isSelected) && !isAdjusting && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 bg-black/40 flex items-center justify-center gap-1 sm:gap-2"
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemove();
                  }}
                  className="p-2 sm:p-3 bg-red-500 hover:bg-red-600 rounded-lg transition-colors shadow-lg touch-manipulation"
                  title="Remove photo"
                >
                  <FiX className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    // Toggle fit mode
                    onUpdate({ fit: slot.fit === 'cover' ? 'contain' : 'cover' });
                  }}
                  className="p-2 sm:p-3 bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors shadow-lg touch-manipulation"
                  title="Toggle fit mode"
                >
                  <FiMaximize2 className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsAdjusting(!isAdjusting);
                  }}
                  className={`p-2 sm:p-3 ${isAdjusting ? 'bg-green-500 hover:bg-green-600' : 'bg-purple-500 hover:bg-purple-600'} rounded-lg transition-colors shadow-lg touch-manipulation`}
                  title="Adjust position and zoom"
                >
                  <FiEdit3 className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </button>
              </motion.div>
            )}

            {/* Adjustment Controls - Mobile optimized */}
            {!isPreview && isAdjusting && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute bottom-1 sm:bottom-2 left-1/2 transform -translate-x-1/2 bg-white/95 backdrop-blur-sm rounded-full shadow-lg px-2 sm:px-4 py-1.5 sm:py-2 flex items-center gap-2 sm:gap-3 text-xs sm:text-sm"
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleZoomOut();
                  }}
                  className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-full transition-colors touch-manipulation"
                  title="Zoom out"
                >
                  <FiZoomOut className="w-3 h-3 sm:w-4 sm:h-4 text-gray-700" />
                </button>
                
                <span className="text-xs sm:text-sm font-medium text-gray-700 min-w-[40px] sm:min-w-[50px] text-center">
                  {Math.round(scale * 100)}%
                </span>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleZoomIn();
                  }}
                  className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-full transition-colors touch-manipulation"
                  title="Zoom in"
                >
                  <FiZoomIn className="w-3 h-3 sm:w-4 sm:h-4 text-gray-700" />
                </button>

                <div className="w-px h-4 sm:h-6 bg-gray-300" />

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    resetAdjustments();
                  }}
                  className="px-2 sm:px-3 py-1 text-xs sm:text-sm text-gray-700 hover:bg-gray-100 rounded-full transition-colors touch-manipulation"
                  title="Reset adjustments"
                >
                  Reset
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsAdjusting(false);
                  }}
                  className="px-2 sm:px-3 py-1 text-xs sm:text-sm bg-green-500 text-white hover:bg-green-600 rounded-full transition-colors touch-manipulation"
                  title="Done adjusting"
                >
                  Done
                </button>
              </motion.div>
            )}

            {/* Caption */}
            {slot.caption && !isAdjusting && (
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                <p className="text-white text-sm font-medium">{slot.caption}</p>
              </div>
            )}
          </div>
        </>
      ) : (
        // Empty Slot
        <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
          <svg
            className="w-12 h-12 mb-2"
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
          <p className="text-sm">Drop photo here</p>
        </div>
      )}

      {/* Border Effect */}
      {isSelected && (
        <motion.div
          layoutId="selected-border"
          className="absolute inset-0 border-4 border-blue-500 rounded-lg pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        />
      )}
    </motion.div>
  );
}
