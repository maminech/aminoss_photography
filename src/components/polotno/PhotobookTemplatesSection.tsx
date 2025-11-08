'use client';

import React, { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { SectionTab } from 'polotno/side-panel';
import {
  ALL_TEMPLATES,
  getTemplatesByCategory,
  PhotobookTemplate,
} from '@/lib/photobook-templates';

// Custom icon for templates
const TemplatesIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect
      x="3"
      y="3"
      width="7"
      height="7"
      rx="1"
      stroke="currentColor"
      strokeWidth="2"
    />
    <rect
      x="14"
      y="3"
      width="7"
      height="7"
      rx="1"
      stroke="currentColor"
      strokeWidth="2"
    />
    <rect
      x="3"
      y="14"
      width="7"
      height="7"
      rx="1"
      stroke="currentColor"
      strokeWidth="2"
    />
    <rect
      x="14"
      y="14"
      width="7"
      height="7"
      rx="1"
      stroke="currentColor"
      strokeWidth="2"
    />
  </svg>
);

interface PhotobookTemplatesPanelProps {
  store: any;
}

// Panel component that displays photobook templates
export const PhotobookTemplatesPanel = observer(
  ({ store }: PhotobookTemplatesPanelProps) => {
    const [selectedCategory, setSelectedCategory] = useState<string>('all');

    const categories = [
      { id: 'all', name: 'All Templates' },
      { id: 'grid', name: 'Grid Layouts' },
      { id: 'collage', name: 'Collages' },
      { id: 'magazine', name: 'Magazine Style' },
      { id: 'minimal', name: 'Minimal' },
    ];

    const filteredTemplates =
      selectedCategory === 'all'
        ? ALL_TEMPLATES
        : getTemplatesByCategory(selectedCategory as any);

    const applyTemplate = (template: PhotobookTemplate) => {
      // Create a new page or replace current page with template
      if (store.activePage) {
        // Clear current page
        store.activePage.children.forEach((child: any) => {
          child.remove();
        });

        // Add template elements to the page
        template.pages[0].children.forEach((element: any) => {
          const { placeholder, ...elementProps } = element;
          
          // Add element with placeholder styling if it's a placeholder
          if (placeholder && element.type === 'image') {
            store.activePage.addElement({
              ...elementProps,
              src: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgZmlsbD0iI2YzZjRmNiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IiM5Y2EzYWYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5EcmFnIHBob3RvIGhlcmU8L3RleHQ+PC9zdmc+',
              opacity: 0.6,
            });
          } else {
            store.activePage.addElement(elementProps);
          }
        });
      }
    };

    return (
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <div style={{ padding: '20px', paddingBottom: '10px' }}>
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold' }}>
            Photobook Templates
          </h3>
          <p style={{ margin: '8px 0 0', fontSize: '13px', opacity: 0.7 }}>
            Choose a template to get started
          </p>
        </div>

        {/* Category Filter */}
        <div
          style={{
            padding: '0 20px 15px',
            display: 'flex',
            gap: '8px',
            flexWrap: 'wrap',
          }}
        >
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              style={{
                padding: '6px 12px',
                fontSize: '12px',
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer',
                backgroundColor:
                  selectedCategory === category.id ? '#3b82f6' : '#e5e7eb',
                color: selectedCategory === category.id ? 'white' : '#374151',
                transition: 'all 0.2s',
              }}
            >
              {category.name}
            </button>
          ))}
        </div>

        {/* Templates Grid */}
        <div
          style={{
            flex: 1,
            overflow: 'auto',
            padding: '0 20px 20px',
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '12px',
            }}
          >
            {filteredTemplates.map((template) => (
              <div
                key={template.id}
                onClick={() => applyTemplate(template)}
                style={{
                  cursor: 'pointer',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  border: '2px solid #e5e7eb',
                  transition: 'all 0.2s',
                  backgroundColor: 'white',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#3b82f6';
                  e.currentTarget.style.transform = 'scale(1.02)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#e5e7eb';
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                {/* Template Preview */}
                <div
                  style={{
                    aspectRatio: '8.5 / 11',
                    backgroundColor: '#f9fafb',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '16px',
                  }}
                >
                  {/* Simple visual representation */}
                  <TemplatePreview template={template} />
                </div>

                {/* Template Info */}
                <div style={{ padding: '8px' }}>
                  <div
                    style={{
                      fontSize: '13px',
                      fontWeight: 'bold',
                      marginBottom: '4px',
                    }}
                  >
                    {template.name}
                  </div>
                  <div style={{ fontSize: '11px', opacity: 0.7 }}>
                    {template.description}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
);

// Simple visual preview of template layout
function TemplatePreview({ template }: { template: PhotobookTemplate }) {
  const page = template.pages[0];
  const scale = 0.08; // Scale down for preview

  return (
    <div
      style={{
        position: 'relative',
        width: `${template.pageSize.width * scale}px`,
        height: `${template.pageSize.height * scale}px`,
        backgroundColor: 'white',
        border: '1px solid #d1d5db',
      }}
    >
      {page.children.map((element, index) => (
        <div
          key={index}
          style={{
            position: 'absolute',
            left: `${element.x * scale}px`,
            top: `${element.y * scale}px`,
            width: `${element.width * scale}px`,
            height: `${element.height * scale}px`,
            backgroundColor:
              element.type === 'image' ? '#e5e7eb' : 'transparent',
            border: element.type === 'text' ? '1px dashed #9ca3af' : 'none',
          }}
        />
      ))}
    </div>
  );
}

// Section configuration for Polotno
export const PhotobookTemplatesSection = {
  name: 'photobook-templates',
  Tab: (props: any) => (
    <SectionTab name="Templates" {...props}>
      <TemplatesIcon />
    </SectionTab>
  ),
  Panel: PhotobookTemplatesPanel,
};
