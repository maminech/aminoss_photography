/**
 * Database Query Optimization Utilities
 * 
 * Provides caching, query batching, and optimization helpers
 * for Prisma database queries to improve performance.
 */

import { prisma } from '@/lib/prisma';
import { unstable_cache } from 'next/cache';

/**
 * Cache configuration
 */
export const CACHE_TAGS = {
  PHOTOS: 'photos',
  VIDEOS: 'videos',
  ALBUMS: 'albums',
  POSTS: 'posts',
  TESTIMONIALS: 'testimonials',
  BOOKINGS: 'bookings',
  CLIENTS: 'clients',
  MESSAGES: 'messages',
  SETTINGS: 'settings',
  TEAM: 'team',
} as const;

export const CACHE_DURATION = {
  SHORT: 60, // 1 minute
  MEDIUM: 300, // 5 minutes
  LONG: 3600, // 1 hour
  DAY: 86400, // 24 hours
} as const;

/**
 * Optimized image queries with caching
 */
export const imageQueries = {
  /**
   * Get featured images with caching
   */
  getFeaturedImages: unstable_cache(
    async (limit: number = 20) => {
      return await prisma.image.findMany({
        where: {
          featured: true,
          showInGallery: true,
        },
        select: {
          id: true,
          url: true,
          thumbnailUrl: true,
          title: true,
          description: true,
          category: true,
          width: true,
          height: true,
        },
        orderBy: { order: 'desc' },
        take: limit,
      });
    },
    ['featured-images'],
    {
      tags: [CACHE_TAGS.PHOTOS],
      revalidate: CACHE_DURATION.MEDIUM,
    }
  ),

  /**
   * Get gallery images with pagination and caching
   */
  getGalleryImages: async (page: number = 1, limit: number = 20) => {
    const skip = (page - 1) * limit;
    
    const [images, total] = await Promise.all([
      prisma.image.findMany({
        where: { showInGallery: true },
        select: {
          id: true,
          url: true,
          thumbnailUrl: true,
          title: true,
          category: true,
          width: true,
          height: true,
        },
        orderBy: [
          { order: 'desc' },
          { createdAt: 'desc' },
        ],
        skip,
        take: limit,
      }),
      prisma.image.count({
        where: { showInGallery: true },
      }),
    ]);

    return {
      images,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: skip + images.length < total,
      },
    };
  },

  /**
   * Get image by ID with related data
   */
  getImageById: async (id: string) => {
    return await prisma.image.findUnique({
      where: { id },
      include: {
        album: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });
  },
};

/**
 * Optimized album queries with caching
 */
export const albumQueries = {
  /**
   * Get homepage albums (Instagram-style posts)
   */
  getHomepageAlbums: unstable_cache(
    async (limit: number = 20) => {
      return await prisma.album.findMany({
        where: {
          showOnHomepage: true,
          images: {
            some: {}, // Only albums with images
          },
        },
        include: {
          images: {
            orderBy: { order: 'asc' },
            select: {
              id: true,
              url: true,
              thumbnailUrl: true,
              width: true,
              height: true,
              title: true,
              description: true,
            },
          },
        },
        orderBy: [
          { order: 'desc' },
          { createdAt: 'desc' },
        ],
        take: limit,
      });
    },
    ['homepage-albums'],
    {
      tags: [CACHE_TAGS.ALBUMS, CACHE_TAGS.POSTS],
      revalidate: CACHE_DURATION.SHORT,
    }
  ),

  /**
   * Get all albums for gallery with efficient loading
   */
  getGalleryAlbums: async (limit: number = 50) => {
    return await prisma.album.findMany({
      where: {
        showInGallery: true,
        images: {
          some: {},
        },
      },
      select: {
        id: true,
        title: true,
        description: true,
        category: true,
        coverImageUrl: true,
        createdAt: true,
        featured: true,
        // Only get count and first image for performance
        _count: {
          select: { images: true },
        },
        images: {
          take: 1,
          orderBy: { order: 'asc' },
          select: {
            thumbnailUrl: true,
          },
        },
      },
      orderBy: [
        { order: 'desc' },
        { createdAt: 'desc' },
      ],
      take: limit,
    });
  },
};

/**
 * Optimized video queries
 */
export const videoQueries = {
  /**
   * Get public videos with caching
   */
  getPublicVideos: unstable_cache(
    async (limit: number = 20) => {
      return await prisma.video.findMany({
        where: {
          showInGallery: true,
          cloudinaryId: {
            not: null,
          },
        },
        select: {
          id: true,
          title: true,
          description: true,
          cloudinaryId: true,
          url: true,
          thumbnailUrl: true,
          category: true,
          featured: true,
          createdAt: true,
        },
        orderBy: [
          { order: 'desc' },
          { createdAt: 'desc' },
        ],
        take: limit,
      });
    },
    ['public-videos'],
    {
      tags: [CACHE_TAGS.VIDEOS],
      revalidate: CACHE_DURATION.MEDIUM,
    }
  ),
};

/**
 * Optimized testimonial queries
 */
export const testimonialQueries = {
  /**
   * Get approved testimonials with caching
   */
  getApprovedTestimonials: unstable_cache(
    async () => {
      return await prisma.testimonial.findMany({
        where: { approved: true },
        select: {
          id: true,
          clientName: true,
          content: true,
          rating: true,
          eventType: true,
          eventDate: true,
          showOnHomepage: true,
        },
        orderBy: [
          { createdAt: 'desc' },
        ],
      });
    },
    ['approved-testimonials'],
    {
      tags: [CACHE_TAGS.TESTIMONIALS],
      revalidate: CACHE_DURATION.LONG,
    }
  ),
};

/**
 * Optimized dashboard stats query
 */
export const dashboardQueries = {
  /**
   * Get dashboard stats with single optimized query
   */
  getStats: async () => {
    // Use Promise.all for parallel execution
    const [
      totalPhotos,
      totalVideos,
      featuredPhotos,
      totalClients,
      totalBookings,
      totalTeamMembers,
      unreadMessages,
      tracking,
    ] = await Promise.all([
      prisma.image.count(),
      prisma.video.count(),
      prisma.image.count({ where: { featured: true } }),
      prisma.client.count(),
      prisma.booking.count(),
      prisma.teamMember.count(),
      prisma.contactMessage.count({ where: { read: false } }),
      prisma.leadTracking.count({ where: { status: { not: 'completed' } } }),
    ]);

    return {
      totalPhotos,
      totalVideos,
      featuredPhotos,
      totalClients,
      totalBookings,
      totalTeamMembers,
      unreadMessages,
      tracking,
    };
  },
};

/**
 * Batch query helper to reduce database round trips
 */
export async function batchQuery<T>(
  queries: (() => Promise<T>)[]
): Promise<T[]> {
  return await Promise.all(queries.map((query) => query()));
}

/**
 * Revalidate cache by tag
 */
export async function revalidateCache(tag: string) {
  if (process.env.NODE_ENV === 'production') {
    // Next.js revalidateTag function
    const { revalidateTag } = await import('next/cache');
    revalidateTag(tag);
  }
}

/**
 * Revalidate multiple cache tags
 */
export async function revalidateCacheTags(tags: string[]) {
  await Promise.all(tags.map(revalidateCache));
}

/**
 * Common select patterns for optimization
 */
export const SELECT_PATTERNS = {
  // Minimal image data for lists
  imageList: {
    id: true,
    url: true,
    thumbnailUrl: true,
    title: true,
    category: true,
    width: true,
    height: true,
  },
  
  // Minimal album data for lists
  albumList: {
    id: true,
    title: true,
    description: true,
    category: true,
    coverImageUrl: true,
    createdAt: true,
    featured: true,
  },
  
  // Minimal video data for lists
  videoList: {
    id: true,
    title: true,
    description: true,
    cloudinaryId: true,
    thumbnailUrl: true,
    category: true,
    featured: true,
  },
  
  // User data for authentication
  userAuth: {
    id: true,
    name: true,
    email: true,
    role: true,
  },
} as const;

/**
 * Pagination helper
 */
export function getPaginationParams(page: number = 1, limit: number = 20) {
  const skip = (page - 1) * limit;
  return { skip, take: limit };
}

/**
 * Build pagination response
 */
export function buildPaginationResponse<T>(
  data: T[],
  total: number,
  page: number,
  limit: number
) {
  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasMore: (page * limit) < total,
      hasPrevious: page > 1,
    },
  };
}

/**
 * Database connection health check
 */
export async function checkDatabaseHealth(): Promise<boolean> {
  try {
    await prisma.user.count();
    return true;
  } catch (error) {
    console.error('Database health check failed:', error);
    return false;
  }
}

/**
 * Close database connection (for serverless cleanup)
 */
export async function closeDatabaseConnection() {
  await prisma.$disconnect();
}
