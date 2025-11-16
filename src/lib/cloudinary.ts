import { v2 as cloudinary } from 'cloudinary';
import { MediaItem, VideoItem, Category, CloudinaryResource } from '@/types';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Fetch images from Cloudinary by category
 */
export async function getImagesByCategory(category: Category, limit: number = 50): Promise<MediaItem[]> {
  try {
    const folderPath = category === 'all' ? 'Innov8_photography' : `Innov8_photography/${category}`;
    
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
      prefix: 'Innov8_photography/videos',
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
