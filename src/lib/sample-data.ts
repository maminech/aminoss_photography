import { MediaItem, VideoItem, Category } from '@/types';

// Sample data - Replace these with your actual Cloudinary URLs
// Format: https://res.cloudinary.com/YOUR_CLOUD_NAME/image/upload/YOUR_IMAGE_PATH

const CLOUDINARY_BASE = 'https://res.cloudinary.com/dc67gl8fu/image/upload';

export const sampleImages: MediaItem[] = [
  {
    id: '1',
    publicId: '099_dsnltg',
    url: 'https://res.cloudinary.com/dc67gl8fu/image/upload/v1762140287/099_dsnltg.jpg',
    thumbnailUrl: 'https://res.cloudinary.com/dc67gl8fu/image/upload/w_800,h_800,c_fill,q_auto,f_auto/v1762140287/099_dsnltg.jpg',
    title: 'Aminoss Photography',
    description: 'Professional photography by Aminoss',
    category: 'all',
    width: 1200,
    height: 800,
    format: 'jpg',
    createdAt: '2024-01-15T10:00:00Z',
    tags: ['photography', 'aminoss'],
  },
  {
    id: '2',
    publicId: '105_pzgmgt',
    url: 'https://res.cloudinary.com/dc67gl8fu/image/upload/v1762140283/105_pzgmgt.jpg',
    thumbnailUrl: 'https://res.cloudinary.com/dc67gl8fu/image/upload/w_800,h_800,c_fill,q_auto,f_auto/v1762140283/105_pzgmgt.jpg',
    title: 'Aminoss Photography',
    description: 'Professional photography by Aminoss',
    category: 'all',
    width: 1200,
    height: 1600,
    format: 'jpg',
    createdAt: '2024-02-10T14:30:00Z',
    tags: ['photography', 'aminoss'],
  },
  {
    id: '3',
    publicId: '089_jdagpy',
    url: 'https://res.cloudinary.com/dc67gl8fu/image/upload/v1762140280/089_jdagpy.jpg',
    thumbnailUrl: 'https://res.cloudinary.com/dc67gl8fu/image/upload/w_800,h_800,c_fill,q_auto,f_auto/v1762140280/089_jdagpy.jpg',
    title: 'Aminoss Photography',
    description: 'Professional photography by Aminoss',
    category: 'all',
    width: 1200,
    height: 800,
    format: 'jpg',
    createdAt: '2024-03-05T08:00:00Z',
    tags: ['photography', 'aminoss'],
  },
  {
    id: '4',
    publicId: 'sample/fashion-1',
    url: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=1200',
    thumbnailUrl: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=800',
    title: 'Fashion Editorial',
    description: 'Modern fashion photography',
    category: 'fashion',
    width: 1200,
    height: 1600,
    format: 'jpg',
    createdAt: '2024-04-20T16:00:00Z',
    tags: ['fashion', 'editorial', 'style'],
  },
  {
    id: '5',
    publicId: 'sample/wedding-2',
    url: 'https://images.unsplash.com/photo-1606800052052-a08af7148866?w=1200',
    thumbnailUrl: 'https://images.unsplash.com/photo-1606800052052-a08af7148866?w=800',
    title: 'Wedding Reception',
    description: 'Capturing joyful moments at the reception',
    category: 'weddings',
    width: 1200,
    height: 800,
    format: 'jpg',
    createdAt: '2024-01-20T19:00:00Z',
    tags: ['wedding', 'reception', 'celebration'],
  },
  {
    id: '6',
    publicId: 'sample/portrait-2',
    url: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=1200',
    thumbnailUrl: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=800',
    title: 'Corporate Portrait',
    description: 'Professional business portrait',
    category: 'portraits',
    width: 1200,
    height: 1600,
    format: 'jpg',
    createdAt: '2024-02-25T11:00:00Z',
    tags: ['portrait', 'corporate', 'professional'],
  },
];

export const sampleVideos: VideoItem[] = [
  {
    id: 'v1',
    publicId: 'sample/wedding-video-1',
    url: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=1200',
    thumbnailUrl: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    title: 'Wedding Highlight Reel',
    description: 'A cinematic wedding video',
    category: 'videos',
    width: 1920,
    height: 1080,
    format: 'mp4',
    duration: 180,
    createdAt: '2024-01-25T10:00:00Z',
    tags: ['wedding', 'video', 'cinematic'],
  },
  {
    id: 'v2',
    publicId: 'sample/travel-video-1',
    url: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=1200',
    thumbnailUrl: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=800',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    title: 'Tunisia Travel Vlog',
    description: 'Exploring the beauty of Tunisia',
    category: 'videos',
    width: 1920,
    height: 1080,
    format: 'mp4',
    duration: 240,
    createdAt: '2024-03-10T12:00:00Z',
    tags: ['travel', 'video', 'vlog'],
  },
];

/**
 * Filter images by category
 */
export function filterImagesByCategory(images: MediaItem[], category: Category): MediaItem[] {
  if (category === 'all') return images;
  return images.filter(img => img.category === category);
}

/**
 * Get sample data (for development)
 */
export async function getSampleImages(category: Category = 'all'): Promise<MediaItem[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  return filterImagesByCategory(sampleImages, category);
}

export async function getSampleVideos(): Promise<VideoItem[]> {
  await new Promise(resolve => setTimeout(resolve, 500));
  return sampleVideos;
}
