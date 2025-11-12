import type { PhotoItem, Page, PhotoSlot } from '@/types/photobook';

export default class AutoLayoutEngine {
  private photos: PhotoItem[];

  constructor(photos: PhotoItem[]) {
    this.photos = photos;
  }

  /**
   * Generate optimal photobook layout based on photo characteristics
   */
  generateOptimalLayout(): Page[] {
    const pages: Page[] = [];
    const groupedPhotos = this.groupPhotosByOrientation();
    
    let pageNumber = 1;

    // Process landscape photos
    if (groupedPhotos.landscape.length > 0) {
      pages.push(...this.createPagesForOrientation(groupedPhotos.landscape, 'landscape', pageNumber));
      pageNumber += pages.length;
    }

    // Process portrait photos
    if (groupedPhotos.portrait.length > 0) {
      pages.push(...this.createPagesForOrientation(groupedPhotos.portrait, 'portrait', pageNumber));
      pageNumber += pages.length - pageNumber + 1;
    }

    // Process square photos
    if (groupedPhotos.square.length > 0) {
      pages.push(...this.createPagesForOrientation(groupedPhotos.square, 'square', pageNumber));
    }

    return pages;
  }

  /**
   * Group photos by orientation for better layout decisions
   */
  private groupPhotosByOrientation() {
    const landscape: PhotoItem[] = [];
    const portrait: PhotoItem[] = [];
    const square: PhotoItem[] = [];

    this.photos.forEach(photo => {
      const ratio = (photo.width || 1) / (photo.height || 1);
      
      if (ratio > 1.2) {
        landscape.push(photo);
      } else if (ratio < 0.8) {
        portrait.push(photo);
      } else {
        square.push(photo);
      }
    });

    return { landscape, portrait, square };
  }

  /**
   * Create pages optimized for specific photo orientation
   */
  private createPagesForOrientation(
    photos: PhotoItem[],
    orientation: 'landscape' | 'portrait' | 'square',
    startPageNumber: number
  ): Page[] {
    const pages: Page[] = [];
    let currentIndex = 0;

    while (currentIndex < photos.length) {
      const remainingPhotos = photos.length - currentIndex;
      const page = this.selectOptimalTemplate(photos.slice(currentIndex), orientation);
      
      if (page) {
        page.pageNumber = startPageNumber + pages.length;
        pages.push(page);
        currentIndex += page.slots.filter(s => s.photo).length;
      } else {
        break;
      }
    }

    return pages;
  }

  /**
   * Select the best template based on photo count and orientation
   */
  private selectOptimalTemplate(photos: PhotoItem[], orientation: string): Page | null {
    if (photos.length === 0) return null;

    const photoCount = Math.min(photos.length, 6);
    
    // Template selection logic based on orientation and count
    const templates = {
      landscape: {
        1: this.createSinglePhotoPage(photos[0], 'landscape'),
        2: this.createTwoPhotoHorizontalPage(photos.slice(0, 2)),
        3: this.createThreePhotoPage(photos.slice(0, 3), 'landscape'),
        4: this.createFourPhotoGridPage(photos.slice(0, 4)),
        5: this.createFivePhotoPage(photos.slice(0, 5)),
        6: this.createSixPhotoGridPage(photos.slice(0, 6))
      },
      portrait: {
        1: this.createSinglePhotoPage(photos[0], 'portrait'),
        2: this.createTwoPhotoVerticalPage(photos.slice(0, 2)),
        3: this.createThreePhotoPage(photos.slice(0, 3), 'portrait'),
        4: this.createFourPhotoGridPage(photos.slice(0, 4)),
        5: this.createFivePhotoPage(photos.slice(0, 5)),
        6: this.createSixPhotoGridPage(photos.slice(0, 6))
      },
      square: {
        1: this.createSinglePhotoPage(photos[0], 'square'),
        2: this.createTwoPhotoHorizontalPage(photos.slice(0, 2)),
        3: this.createThreePhotoPage(photos.slice(0, 3), 'square'),
        4: this.createFourPhotoGridPage(photos.slice(0, 4)),
        5: this.createFivePhotoPage(photos.slice(0, 5)),
        6: this.createSixPhotoGridPage(photos.slice(0, 6))
      }
    };

    return templates[orientation][photoCount as keyof typeof templates.landscape] || null;
  }

  // Template Builders

  private createSinglePhotoPage(photo: PhotoItem, orientation: string): Page {
    return {
      id: this.generateId(),
      template: 'single-full',
      pageNumber: 0,
      backgroundColor: '#ffffff',
      padding: '0px',
      gridColumns: 1,
      gridRows: 1,
      slots: [
        {
          id: '1',
          span: { col: 1, row: 1 },
          photo,
          fit: 'cover',
          borderRadius: '0px'
        }
      ]
    };
  }

  private createTwoPhotoHorizontalPage(photos: PhotoItem[]): Page {
    return {
      id: this.generateId(),
      template: 'two-horizontal',
      pageNumber: 0,
      backgroundColor: '#ffffff',
      padding: '20px',
      gridColumns: 2,
      gridRows: 1,
      slots: photos.slice(0, 2).map((photo, i) => ({
        id: String(i + 1),
        span: { col: 1, row: 1 },
        photo,
        fit: 'cover',
        borderRadius: '8px'
      }))
    };
  }

  private createTwoPhotoVerticalPage(photos: PhotoItem[]): Page {
    return {
      id: this.generateId(),
      template: 'two-vertical',
      pageNumber: 0,
      backgroundColor: '#ffffff',
      padding: '20px',
      gridColumns: 1,
      gridRows: 2,
      slots: photos.slice(0, 2).map((photo, i) => ({
        id: String(i + 1),
        span: { col: 1, row: 1 },
        photo,
        fit: 'cover',
        borderRadius: '8px'
      }))
    };
  }

  private createThreePhotoPage(photos: PhotoItem[], orientation: string): Page {
    const isLandscape = orientation === 'landscape';
    
    return {
      id: this.generateId(),
      template: isLandscape ? 'three-right' : 'three-left',
      pageNumber: 0,
      backgroundColor: '#ffffff',
      padding: '20px',
      gridColumns: 2,
      gridRows: 2,
      slots: isLandscape ? [
        { id: '1', span: { col: 1, row: 1 }, photo: photos[0], fit: 'cover', borderRadius: '8px' },
        { id: '2', span: { col: 1, row: 1 }, photo: photos[1], fit: 'cover', borderRadius: '8px' },
        { id: '3', span: { col: 1, row: 2 }, photo: photos[2], fit: 'cover', borderRadius: '8px' }
      ] : [
        { id: '1', span: { col: 1, row: 2 }, photo: photos[0], fit: 'cover', borderRadius: '8px' },
        { id: '2', span: { col: 1, row: 1 }, photo: photos[1], fit: 'cover', borderRadius: '8px' },
        { id: '3', span: { col: 1, row: 1 }, photo: photos[2], fit: 'cover', borderRadius: '8px' }
      ]
    };
  }

  private createFourPhotoGridPage(photos: PhotoItem[]): Page {
    return {
      id: this.generateId(),
      template: 'four-grid',
      pageNumber: 0,
      backgroundColor: '#ffffff',
      padding: '20px',
      gridColumns: 2,
      gridRows: 2,
      slots: photos.slice(0, 4).map((photo, i) => ({
        id: String(i + 1),
        span: { col: 1, row: 1 },
        photo,
        fit: 'cover',
        borderRadius: '8px'
      }))
    };
  }

  private createFivePhotoPage(photos: PhotoItem[]): Page {
    return {
      id: this.generateId(),
      template: 'five-featured',
      pageNumber: 0,
      backgroundColor: '#ffffff',
      padding: '20px',
      gridColumns: 3,
      gridRows: 3,
      slots: [
        { id: '1', span: { col: 3, row: 2 }, photo: photos[0], fit: 'cover', borderRadius: '8px' },
        { id: '2', span: { col: 1, row: 1 }, photo: photos[1], fit: 'cover', borderRadius: '8px' },
        { id: '3', span: { col: 1, row: 1 }, photo: photos[2], fit: 'cover', borderRadius: '8px' },
        { id: '4', span: { col: 1, row: 1 }, photo: photos[3], fit: 'cover', borderRadius: '8px' },
        { id: '5', span: { col: 1, row: 1 }, photo: photos[4], fit: 'cover', borderRadius: '8px' }
      ]
    };
  }

  private createSixPhotoGridPage(photos: PhotoItem[]): Page {
    return {
      id: this.generateId(),
      template: 'six-grid',
      pageNumber: 0,
      backgroundColor: '#ffffff',
      padding: '20px',
      gridColumns: 3,
      gridRows: 2,
      slots: photos.slice(0, 6).map((photo, i) => ({
        id: String(i + 1),
        span: { col: 1, row: 1 },
        photo,
        fit: 'cover',
        borderRadius: '8px'
      }))
    };
  }

  private generateId(): string {
    return `page_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
