/**
 * Photobook Template Library
 * Ready-made templates for different photobook layouts
 */

export interface PhotobookTemplate {
  id: string;
  name: string;
  description: string;
  thumbnail: string;
  category: 'grid' | 'collage' | 'magazine' | 'minimal' | 'custom';
  pageSize: {
    width: number;
    height: number;
    unit: 'px' | 'mm' | 'in';
  };
  pages: Array<{
    id: string;
    children: Array<{
      type: 'image' | 'text' | 'svg';
      x: number;
      y: number;
      width: number;
      height: number;
      rotation?: number;
      [key: string]: any;
    }>;
  }>;
}

// Standard photobook size (8.5" x 11" at 300 DPI)
const STANDARD_WIDTH = 2550;
const STANDARD_HEIGHT = 3300;

// Margin for safe printing area
const MARGIN = 150;

/**
 * Grid Layout Templates
 */
export const GRID_TEMPLATES: PhotobookTemplate[] = [
  {
    id: 'grid-2x2',
    name: '2x2 Grid',
    description: 'Four equal photos in a grid layout',
    thumbnail: '/templates/grid-2x2.jpg',
    category: 'grid',
    pageSize: { width: STANDARD_WIDTH, height: STANDARD_HEIGHT, unit: 'px' },
    pages: [
      {
        id: 'page-1',
        children: [
          {
            type: 'image',
            x: MARGIN,
            y: MARGIN,
            width: (STANDARD_WIDTH - 3 * MARGIN) / 2,
            height: (STANDARD_HEIGHT - 3 * MARGIN) / 2,
            placeholder: true,
          },
          {
            type: 'image',
            x: STANDARD_WIDTH / 2 + MARGIN / 2,
            y: MARGIN,
            width: (STANDARD_WIDTH - 3 * MARGIN) / 2,
            height: (STANDARD_HEIGHT - 3 * MARGIN) / 2,
            placeholder: true,
          },
          {
            type: 'image',
            x: MARGIN,
            y: STANDARD_HEIGHT / 2 + MARGIN / 2,
            width: (STANDARD_WIDTH - 3 * MARGIN) / 2,
            height: (STANDARD_HEIGHT - 3 * MARGIN) / 2,
            placeholder: true,
          },
          {
            type: 'image',
            x: STANDARD_WIDTH / 2 + MARGIN / 2,
            y: STANDARD_HEIGHT / 2 + MARGIN / 2,
            width: (STANDARD_WIDTH - 3 * MARGIN) / 2,
            height: (STANDARD_HEIGHT - 3 * MARGIN) / 2,
            placeholder: true,
          },
        ],
      },
    ],
  },
  {
    id: 'grid-3x3',
    name: '3x3 Grid',
    description: 'Nine photos in a uniform grid',
    thumbnail: '/templates/grid-3x3.jpg',
    category: 'grid',
    pageSize: { width: STANDARD_WIDTH, height: STANDARD_HEIGHT, unit: 'px' },
    pages: [
      {
        id: 'page-1',
        children: Array.from({ length: 9 }, (_, i) => {
          const row = Math.floor(i / 3);
          const col = i % 3;
          const imgWidth = (STANDARD_WIDTH - 4 * MARGIN) / 3;
          const imgHeight = (STANDARD_HEIGHT - 4 * MARGIN) / 3;
          return {
            type: 'image',
            x: MARGIN + col * (imgWidth + MARGIN),
            y: MARGIN + row * (imgHeight + MARGIN),
            width: imgWidth,
            height: imgHeight,
            placeholder: true,
          };
        }),
      },
    ],
  },
];

/**
 * Collage Templates
 */
export const COLLAGE_TEMPLATES: PhotobookTemplate[] = [
  {
    id: 'collage-hero',
    name: 'Hero Collage',
    description: 'One large hero image with smaller supporting photos',
    thumbnail: '/templates/collage-hero.jpg',
    category: 'collage',
    pageSize: { width: STANDARD_WIDTH, height: STANDARD_HEIGHT, unit: 'px' },
    pages: [
      {
        id: 'page-1',
        children: [
          // Hero image
          {
            type: 'image',
            x: MARGIN,
            y: MARGIN,
            width: STANDARD_WIDTH - 2 * MARGIN,
            height: (STANDARD_HEIGHT - 2 * MARGIN) * 0.65,
            placeholder: true,
          },
          // Small image 1
          {
            type: 'image',
            x: MARGIN,
            y: MARGIN + (STANDARD_HEIGHT - 2 * MARGIN) * 0.65 + MARGIN,
            width: (STANDARD_WIDTH - 3 * MARGIN) / 2,
            height: (STANDARD_HEIGHT - 2 * MARGIN) * 0.35 - MARGIN,
            placeholder: true,
          },
          // Small image 2
          {
            type: 'image',
            x: STANDARD_WIDTH / 2 + MARGIN / 2,
            y: MARGIN + (STANDARD_HEIGHT - 2 * MARGIN) * 0.65 + MARGIN,
            width: (STANDARD_WIDTH - 3 * MARGIN) / 2,
            height: (STANDARD_HEIGHT - 2 * MARGIN) * 0.35 - MARGIN,
            placeholder: true,
          },
        ],
      },
    ],
  },
  {
    id: 'collage-asymmetric',
    name: 'Asymmetric Collage',
    description: 'Creative asymmetric photo arrangement',
    thumbnail: '/templates/collage-asymmetric.jpg',
    category: 'collage',
    pageSize: { width: STANDARD_WIDTH, height: STANDARD_HEIGHT, unit: 'px' },
    pages: [
      {
        id: 'page-1',
        children: [
          {
            type: 'image',
            x: MARGIN,
            y: MARGIN,
            width: (STANDARD_WIDTH - 3 * MARGIN) * 0.6,
            height: (STANDARD_HEIGHT - 2 * MARGIN) * 0.5,
            placeholder: true,
          },
          {
            type: 'image',
            x: (STANDARD_WIDTH - 3 * MARGIN) * 0.6 + 2 * MARGIN,
            y: MARGIN,
            width: (STANDARD_WIDTH - 3 * MARGIN) * 0.4,
            height: (STANDARD_HEIGHT - 3 * MARGIN) * 0.3,
            placeholder: true,
          },
          {
            type: 'image',
            x: (STANDARD_WIDTH - 3 * MARGIN) * 0.6 + 2 * MARGIN,
            y: MARGIN + (STANDARD_HEIGHT - 3 * MARGIN) * 0.3 + MARGIN,
            width: (STANDARD_WIDTH - 3 * MARGIN) * 0.4,
            height: (STANDARD_HEIGHT - 3 * MARGIN) * 0.2,
            placeholder: true,
          },
          {
            type: 'image',
            x: MARGIN,
            y: MARGIN + (STANDARD_HEIGHT - 2 * MARGIN) * 0.5 + MARGIN,
            width: STANDARD_WIDTH - 2 * MARGIN,
            height: (STANDARD_HEIGHT - 2 * MARGIN) * 0.5 - MARGIN,
            placeholder: true,
          },
        ],
      },
    ],
  },
];

/**
 * Magazine Style Templates
 */
export const MAGAZINE_TEMPLATES: PhotobookTemplate[] = [
  {
    id: 'magazine-feature',
    name: 'Magazine Feature',
    description: 'Large photo with title and caption',
    thumbnail: '/templates/magazine-feature.jpg',
    category: 'magazine',
    pageSize: { width: STANDARD_WIDTH, height: STANDARD_HEIGHT, unit: 'px' },
    pages: [
      {
        id: 'page-1',
        children: [
          {
            type: 'text',
            x: MARGIN,
            y: MARGIN,
            width: STANDARD_WIDTH - 2 * MARGIN,
            height: 200,
            text: 'Your Story Title',
            fontSize: 72,
            fontWeight: 'bold',
            align: 'center',
          },
          {
            type: 'image',
            x: MARGIN,
            y: MARGIN + 250,
            width: STANDARD_WIDTH - 2 * MARGIN,
            height: STANDARD_HEIGHT - MARGIN - 250 - 200,
            placeholder: true,
          },
          {
            type: 'text',
            x: MARGIN,
            y: STANDARD_HEIGHT - MARGIN - 150,
            width: STANDARD_WIDTH - 2 * MARGIN,
            height: 150,
            text: 'Add your caption or description here...',
            fontSize: 24,
            align: 'center',
          },
        ],
      },
    ],
  },
  {
    id: 'magazine-sidebar',
    name: 'Magazine Sidebar',
    description: 'Photo with sidebar text layout',
    thumbnail: '/templates/magazine-sidebar.jpg',
    category: 'magazine',
    pageSize: { width: STANDARD_WIDTH, height: STANDARD_HEIGHT, unit: 'px' },
    pages: [
      {
        id: 'page-1',
        children: [
          {
            type: 'image',
            x: MARGIN,
            y: MARGIN,
            width: (STANDARD_WIDTH - 3 * MARGIN) * 0.65,
            height: STANDARD_HEIGHT - 2 * MARGIN,
            placeholder: true,
          },
          {
            type: 'text',
            x: (STANDARD_WIDTH - 3 * MARGIN) * 0.65 + 2 * MARGIN,
            y: MARGIN,
            width: (STANDARD_WIDTH - 3 * MARGIN) * 0.35,
            height: 200,
            text: 'Story Title',
            fontSize: 48,
            fontWeight: 'bold',
          },
          {
            type: 'text',
            x: (STANDARD_WIDTH - 3 * MARGIN) * 0.65 + 2 * MARGIN,
            y: MARGIN + 250,
            width: (STANDARD_WIDTH - 3 * MARGIN) * 0.35,
            height: STANDARD_HEIGHT - 2 * MARGIN - 250,
            text: 'Add your story text here. Describe the moment, the emotions, and the memories captured in your photos.',
            fontSize: 20,
          },
        ],
      },
    ],
  },
];

/**
 * Minimal Templates
 */
export const MINIMAL_TEMPLATES: PhotobookTemplate[] = [
  {
    id: 'minimal-fullbleed',
    name: 'Full Bleed',
    description: 'Single photo filling the entire page',
    thumbnail: '/templates/minimal-fullbleed.jpg',
    category: 'minimal',
    pageSize: { width: STANDARD_WIDTH, height: STANDARD_HEIGHT, unit: 'px' },
    pages: [
      {
        id: 'page-1',
        children: [
          {
            type: 'image',
            x: 0,
            y: 0,
            width: STANDARD_WIDTH,
            height: STANDARD_HEIGHT,
            placeholder: true,
          },
        ],
      },
    ],
  },
  {
    id: 'minimal-centered',
    name: 'Centered',
    description: 'Single centered photo with white space',
    thumbnail: '/templates/minimal-centered.jpg',
    category: 'minimal',
    pageSize: { width: STANDARD_WIDTH, height: STANDARD_HEIGHT, unit: 'px' },
    pages: [
      {
        id: 'page-1',
        children: [
          {
            type: 'image',
            x: MARGIN * 2,
            y: MARGIN * 2,
            width: STANDARD_WIDTH - 4 * MARGIN,
            height: STANDARD_HEIGHT - 4 * MARGIN,
            placeholder: true,
          },
        ],
      },
    ],
  },
];

/**
 * All templates combined
 */
export const ALL_TEMPLATES: PhotobookTemplate[] = [
  ...GRID_TEMPLATES,
  ...COLLAGE_TEMPLATES,
  ...MAGAZINE_TEMPLATES,
  ...MINIMAL_TEMPLATES,
];

/**
 * Get template by ID
 */
export function getTemplateById(id: string): PhotobookTemplate | undefined {
  return ALL_TEMPLATES.find((template) => template.id === id);
}

/**
 * Get templates by category
 */
export function getTemplatesByCategory(
  category: PhotobookTemplate['category']
): PhotobookTemplate[] {
  return ALL_TEMPLATES.filter((template) => template.category === category);
}
