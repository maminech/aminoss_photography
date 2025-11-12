// Photobook Type Definitions

export interface PhotoItem {
  id: string;
  url: string;
  thumbnailUrl?: string;
  width?: number;
  height?: number;
  title?: string;
  alt?: string;
}

export interface PhotoSlot {
  id: string;
  span?: {
    col: number;
    row: number;
  };
  photo: PhotoItem | null;
  fit?: 'cover' | 'contain' | 'fill';
  position?: string;
  borderRadius?: string;
  caption?: string;
  // Photo adjustment properties
  scale?: number; // 1.0 = 100%, 1.5 = 150% zoom
  offsetX?: number; // Horizontal offset in pixels
  offsetY?: number; // Vertical offset in pixels
}

export interface Page {
  id: string;
  template: string;
  pageNumber: number;
  backgroundColor?: string;
  padding?: string;
  gridColumns: number;
  gridRows: number;
  slots: PhotoSlot[];
}

export interface PageTemplate {
  id: string;
  name: string;
  gridColumns: number;
  gridRows: number;
  slots: PhotoSlot[];
  thumbnail?: string;
}

export interface PhotobookSettings {
  title: string;
  coverImage: string;
  pageCount: number;
  createdAt: string;
  updatedAt: string;
  theme?: 'classic' | 'modern' | 'minimal';
  orientation?: 'landscape' | 'portrait';
}

export interface PhotobookData {
  galleryId: string;
  pages: Page[];
  settings: PhotobookSettings;
}

export interface PhotobookState {
  pages: Page[];
  currentPageIndex: number;
  history: Page[][];
  historyIndex: number;
}

// Export/Import Types

export interface ExportOptions {
  dpi: 300 | 150 | 72;
  colorMode: 'RGB' | 'CMYK';
  bleed: boolean;
  quality?: 'high' | 'medium' | 'low';
}

export interface PDFExportResult {
  url: string;
  size: number;
  pages: number;
}
