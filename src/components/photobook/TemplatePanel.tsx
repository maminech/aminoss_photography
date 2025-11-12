'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { FiCheck } from 'react-icons/fi';
import type { PageTemplate } from '@/types/photobook';

interface TemplatePanelProps {
  onTemplateSelect: (template: PageTemplate) => void;
  currentTemplate?: string;
}

const TEMPLATES: PageTemplate[] = [
  {
    id: 'single-full',
    name: 'Single Photo - Full',
    gridColumns: 1,
    gridRows: 1,
    slots: [
      { id: '1', span: { col: 1, row: 1 }, photo: null, fit: 'cover', borderRadius: '0px' }
    ]
  },
  {
    id: 'two-horizontal',
    name: 'Two Photos - Horizontal',
    gridColumns: 2,
    gridRows: 1,
    slots: [
      { id: '1', span: { col: 1, row: 1 }, photo: null, fit: 'cover' },
      { id: '2', span: { col: 1, row: 1 }, photo: null, fit: 'cover' }
    ]
  },
  {
    id: 'two-vertical',
    name: 'Two Photos - Vertical',
    gridColumns: 1,
    gridRows: 2,
    slots: [
      { id: '1', span: { col: 1, row: 1 }, photo: null, fit: 'cover' },
      { id: '2', span: { col: 1, row: 1 }, photo: null, fit: 'cover' }
    ]
  },
  {
    id: 'three-left',
    name: 'Three Photos - Left Focus',
    gridColumns: 2,
    gridRows: 2,
    slots: [
      { id: '1', span: { col: 1, row: 2 }, photo: null, fit: 'cover' },
      { id: '2', span: { col: 1, row: 1 }, photo: null, fit: 'cover' },
      { id: '3', span: { col: 1, row: 1 }, photo: null, fit: 'cover' }
    ]
  },
  {
    id: 'three-right',
    name: 'Three Photos - Right Focus',
    gridColumns: 2,
    gridRows: 2,
    slots: [
      { id: '1', span: { col: 1, row: 1 }, photo: null, fit: 'cover' },
      { id: '2', span: { col: 1, row: 1 }, photo: null, fit: 'cover' },
      { id: '3', span: { col: 1, row: 2 }, photo: null, fit: 'cover' }
    ]
  },
  {
    id: 'four-grid',
    name: 'Four Photos - Grid',
    gridColumns: 2,
    gridRows: 2,
    slots: [
      { id: '1', span: { col: 1, row: 1 }, photo: null, fit: 'cover' },
      { id: '2', span: { col: 1, row: 1 }, photo: null, fit: 'cover' },
      { id: '3', span: { col: 1, row: 1 }, photo: null, fit: 'cover' },
      { id: '4', span: { col: 1, row: 1 }, photo: null, fit: 'cover' }
    ]
  },
  {
    id: 'five-featured',
    name: 'Five Photos - Featured Top',
    gridColumns: 3,
    gridRows: 3,
    slots: [
      { id: '1', span: { col: 3, row: 2 }, photo: null, fit: 'cover' },
      { id: '2', span: { col: 1, row: 1 }, photo: null, fit: 'cover' },
      { id: '3', span: { col: 1, row: 1 }, photo: null, fit: 'cover' },
      { id: '4', span: { col: 1, row: 1 }, photo: null, fit: 'cover' },
      { id: '5', span: { col: 1, row: 1 }, photo: null, fit: 'cover', position: 'center' }
    ]
  },
  {
    id: 'six-grid',
    name: 'Six Photos - Grid',
    gridColumns: 3,
    gridRows: 2,
    slots: [
      { id: '1', span: { col: 1, row: 1 }, photo: null, fit: 'cover' },
      { id: '2', span: { col: 1, row: 1 }, photo: null, fit: 'cover' },
      { id: '3', span: { col: 1, row: 1 }, photo: null, fit: 'cover' },
      { id: '4', span: { col: 1, row: 1 }, photo: null, fit: 'cover' },
      { id: '5', span: { col: 1, row: 1 }, photo: null, fit: 'cover' },
      { id: '6', span: { col: 1, row: 1 }, photo: null, fit: 'cover' }
    ]
  },
  {
    id: 'collage-creative',
    name: 'Creative Collage',
    gridColumns: 4,
    gridRows: 3,
    slots: [
      { id: '1', span: { col: 2, row: 2 }, photo: null, fit: 'cover' },
      { id: '2', span: { col: 2, row: 1 }, photo: null, fit: 'cover' },
      { id: '3', span: { col: 1, row: 1 }, photo: null, fit: 'cover' },
      { id: '4', span: { col: 1, row: 1 }, photo: null, fit: 'cover' },
      { id: '5', span: { col: 2, row: 1 }, photo: null, fit: 'cover' }
    ]
  },
  {
    id: 'magazine-layout',
    name: 'Magazine Layout',
    gridColumns: 3,
    gridRows: 4,
    slots: [
      { id: '1', span: { col: 2, row: 3 }, photo: null, fit: 'cover' },
      { id: '2', span: { col: 1, row: 2 }, photo: null, fit: 'cover' },
      { id: '3', span: { col: 1, row: 2 }, photo: null, fit: 'cover' },
      { id: '4', span: { col: 2, row: 1 }, photo: null, fit: 'cover' }
    ]
  }
];

export default function TemplatePanel({ onTemplateSelect, currentTemplate }: TemplatePanelProps) {
  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <h2 className="text-lg font-semibold text-white mb-2">Page Templates</h2>
        <p className="text-sm text-gray-400">
          Choose a layout for your page
        </p>
      </div>

      {/* Template Grid */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="grid grid-cols-1 gap-4">
          {TEMPLATES.map((template) => (
            <TemplatePreview
              key={template.id}
              template={template}
              isSelected={currentTemplate === template.id}
              onSelect={() => onTemplateSelect(template)}
            />
          ))}
        </div>
      </div>

      {/* Tips */}
      <div className="p-4 border-t border-gray-700 bg-gray-800/50">
        <div className="flex items-start gap-2 text-xs text-gray-400">
          <div className="mt-0.5">💡</div>
          <div>
            <p className="font-medium text-gray-300 mb-1">Pro Tip</p>
            <p>Drag photos from the gallery or click a template slot to add photos. Use Auto-Fill for instant layouts!</p>
          </div>
        </div>
      </div>
    </div>
  );
}

interface TemplatePreviewProps {
  template: PageTemplate;
  isSelected: boolean;
  onSelect: () => void;
}

function TemplatePreview({ template, isSelected, onSelect }: TemplatePreviewProps) {
  return (
    <motion.button
      onClick={onSelect}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`
        relative w-full p-4 rounded-lg border-2 transition-all text-left
        ${isSelected
          ? 'border-blue-500 bg-blue-500/10'
          : 'border-gray-700 bg-gray-800 hover:border-gray-600 hover:bg-gray-750'
        }
      `}
    >
      {/* Template Name */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-white">{template.name}</h3>
        {isSelected && (
          <div className="p-1 bg-blue-500 rounded-full">
            <FiCheck className="w-3 h-3 text-white" />
          </div>
        )}
      </div>

      {/* Template Preview */}
      <div className="aspect-[4/3] bg-gray-900 rounded-md overflow-hidden relative">
        <div
          className="w-full h-full grid gap-1 p-2"
          style={{
            gridTemplateColumns: `repeat(${template.gridColumns}, 1fr)`,
            gridTemplateRows: `repeat(${template.gridRows}, 1fr)`
          }}
        >
          {template.slots.map((slot, index) => (
            <div
              key={slot.id}
              className="bg-gradient-to-br from-gray-700 to-gray-800 rounded flex items-center justify-center"
              style={{
                gridColumn: `span ${slot.span?.col || 1}`,
                gridRow: `span ${slot.span?.row || 1}`
              }}
            >
              <span className="text-xs text-gray-500 font-medium">{index + 1}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Photo Count */}
      <div className="mt-2 flex items-center gap-2 text-xs text-gray-400">
        <span>{template.slots.length} photos</span>
        <span>•</span>
        <span>{template.gridColumns}×{template.gridRows} grid</span>
      </div>
    </motion.button>
  );
}
