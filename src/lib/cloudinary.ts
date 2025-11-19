import { v2 as cloudinary } from 'cloudinary';
import { MediaItem, VideoItem, Category, CloudinaryResource } from '@/types';

// NEW Cloudinary Account Configuration
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dm22wlmpx',
  api_key: process.env.CLOUDINARY_API_KEY || '816775898924348',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'mbU--NngMju5dzFgvO_LExO7nnc',
});

/**
 * Fetch images from Cloudinary by category
 */
export async function getImagesByCategory(category: Category, limit: number = 50): Promise<MediaItem[]> {
  try {
    const folderPath = category === 'all' ? 'innov8_portfolio/photos' : `innov8_portfolio/photos/${category}`;
    
    const result = await cloudinary.api.resources({
      type: 'upload',
      prefix: folderPath,
      max_results: limit,
      resource_type: 'image',
      context: true,
      tags: true,
    });

    return result.resources.map((resource: CloudinaryResource) => transformToMediaItem(resource, category));
  } catch (error) {
    console.error('Error fetching images from Cloudinary:', error);
    return [];
  }
}

/**
 * Fetch videos from Cloudinary
 */
export async function getVideos(limit: number = 30): Promise<VideoItem[]> {
  try {
    const result = await cloudinary.api.resources({
      type: 'upload',
      prefix: 'innov8_portfolio/videos',
      max_results: limit,
      resource_type: 'video',
      context: true,
      tags: true,
    });

    return result.resources.map((resource: any) => ({
      ...transformToMediaItem(resource, 'videos'),
      duration: resource.duration || 0,
      videoUrl: resource.secure_url,
    })) as VideoItem[];
  } catch (error) {
    console.error('Error fetching videos from Cloudinary:', error);
    return [];
  }
}

/**
 * Get featured/hero image for homepage
 */
export async function getFeaturedImage(): Promise<MediaItem | null> {
  try {
    const result = await cloudinary.api.resources_by_tag('featured', {
      max_results: 1,
      resource_type: 'image',
      context: true,
    });

    if (result.resources.length > 0) {
      return transformToMediaItem(result.resources[0], 'all');
    }
    return null;
  } catch (error) {
    console.error('Error fetching featured image:', error);
    return null;
  }
}

/**
 * Transform Cloudinary resource to MediaItem
 */
function transformToMediaItem(resource: any, category: Category): MediaItem {
  const customContext = resource.context?.custom || {};
  
  return {
    id: resource.asset_id || resource.public_id,
    publicId: resource.public_id,
    url: resource.secure_url,
    thumbnailUrl: cloudinary.url(resource.public_id, {
      transformation: [
        { width: 800, height: 800, crop: 'fill', quality: 'auto', fetch_format: 'auto' }
      ]
    }),
    title: customContext.title || resource.public_id.split('/').pop() || 'Untitled',
    description: customContext.description,
    category,
    width: resource.width,
    height: resource.height,
    format: resource.format,
    createdAt: resource.created_at,
    tags: resource.tags || [],
    exif: {
      camera: customContext.camera,
      lens: customContext.lens,
    },
  };
}

/**
 * Get optimized image URL with transformations
 */
export function getOptimizedImageUrl(publicId: string, options?: {
  width?: number;
  height?: number;
  quality?: string;
  crop?: string;
}): string {
  return cloudinary.url(publicId, {
    transformation: [
      {
        width: options?.width || 1200,
        height: options?.height,
        crop: options?.crop as any || 'fill',
        quality: options?.quality || 'auto',
        fetch_format: 'auto',
      }
    ]
  });
}

export default cloudinary;
