export interface MediaItem {
  id: string;
  publicId: string;
  url: string;
  thumbnailUrl: string;
  title: string;
  description?: string;
  category: Category;
  width: number;
  height: number;
  format: string;
  createdAt: string;
  tags?: string[];
  exif?: {
    camera?: string;
    lens?: string;
    focalLength?: string;
    aperture?: string;
    shutterSpeed?: string;
    iso?: string;
  };
}

export interface VideoItem extends MediaItem {
  duration: number;
  videoUrl: string;
}

export type Category = 'all' | 'weddings' | 'portraits' | 'travel' | 'fashion' | 'videos';

export interface ContactFormData {
  name: string;
  email: string;
  message: string;
}

export interface CloudinaryResource {
  asset_id: string;
  public_id: string;
  format: string;
  version: number;
  resource_type: string;
  type: string;
  created_at: string;
  bytes: number;
  width: number;
  height: number;
  url: string;
  secure_url: string;
  tags?: string[];
  context?: {
    custom?: {
      title?: string;
      description?: string;
      category?: string;
      camera?: string;
      lens?: string;
    };
  };
}
