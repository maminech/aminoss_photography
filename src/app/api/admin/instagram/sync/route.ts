import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

interface InstagramMedia {
  id: string;
  media_type: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM';
  media_url: string;
  thumbnail_url?: string;
  timestamp: string;
  caption?: string;
  permalink?: string;
  like_count?: number;
  comments_count?: number;
}

interface InstagramHighlight {
  id: string;
  name: string;
  cover_media: {
    thumbnail_url: string;
  };
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get Instagram credentials from settings
    const settings = await prisma.siteSettings.findFirst();
    
    if (!settings?.instagramAccessToken) {
      return NextResponse.json(
        { error: 'Instagram not connected. Please connect your Instagram account first.' },
        { status: 400 }
      );
    }

    const accessToken = settings.instagramAccessToken;
    const userId = settings.instagramUserId;

    if (!userId) {
      return NextResponse.json(
        { error: 'Instagram user ID not found.' },
        { status: 400 }
      );
    }

    console.log('🔄 Starting Instagram sync...');

    // Try to fetch Instagram Media (Feed Posts)
    const mediaResponse = await fetch(
      `https://graph.instagram.com/${userId}/media?fields=id,caption,media_type,media_url,thumbnail_url,permalink,timestamp&limit=50&access_token=${accessToken}`
    );

    let mediaPosts: InstagramMedia[] = [];
    
    if (!mediaResponse.ok) {
      const error = await mediaResponse.json();
      console.error('Instagram Media API Error:', error);
      
      if (error.error?.code === 190 || error.error?.code === 10 || error.error?.message?.includes('business')) {
        return NextResponse.json({
          error: 'Instagram Business Account Required',
          message: 'To sync Instagram feed posts, you need:\n1. Convert your Instagram to a Business Account\n2. Connect it to a Facebook Page\n3. Generate a new access token with instagram_business_basic permission',
          details: error
        }, { status: 400 });
      }
      
      console.log('⚠️ Skipping feed posts');
    } else {
      const mediaData = await mediaResponse.json();
      mediaPosts = mediaData.data || [];
      console.log(`📸 Found ${mediaPosts.length} Instagram posts`);
    }

    let syncedPosts = 0;
    let syncedHighlights = 0;
    let syncedStories = 0;
    let uploadedToCloudinary = 0;

    // Import Cloudinary
    const cloudinary = await import('cloudinary').then(m => m.v2);
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    // Sync Instagram Feed Posts and upload to Cloudinary
    for (const post of mediaPosts) {
      try {
        // Handle CAROUSEL_ALBUM
        if (post.media_type === 'CAROUSEL_ALBUM') {
          console.log(`📦 Found carousel album ${post.id}`);
          
          try {
            const childrenResponse = await fetch(
              `https://graph.instagram.com/${post.id}/children?fields=id,media_type,media_url,thumbnail_url&access_token=${accessToken}`
            );

            if (childrenResponse.ok) {
              const childrenData = await childrenResponse.json();
              const children = childrenData.data || [];
              
              for (const child of children) {
                if (child.media_type === 'IMAGE') {
                  let cloudinaryUrl = child.media_url;
                  let cloudinaryThumbnail = child.media_url;

                  try {
                    const uploadResult = await cloudinary.uploader.upload(child.media_url, {
                      folder: 'innov8_portfolio/instagram',
                      resource_type: 'image',
                    });

                    cloudinaryUrl = uploadResult.secure_url;
                    cloudinaryThumbnail = uploadResult.secure_url.replace(
                      '/upload/',
                      '/upload/w_800,h_800,c_fill,q_90,f_auto/'
                    );
                    uploadedToCloudinary++;
                  } catch (uploadError) {
                    console.error(`Upload failed:`, uploadError);
                  }

                  await prisma.instagramPost.upsert({
                    where: { instagramId: child.id },
                    update: {
                      caption: post.caption || '',
                      mediaType: 'IMAGE',
                      mediaUrl: cloudinaryUrl,
                      thumbnailUrl: cloudinaryThumbnail,
                      permalink: post.permalink || '',
                      timestamp: new Date(post.timestamp),
                      active: true,
                      updatedAt: new Date(),
                    },
                    create: {
                      instagramId: child.id,
                      caption: post.caption || '',
                      mediaType: 'IMAGE',
                      mediaUrl: cloudinaryUrl,
                      thumbnailUrl: cloudinaryThumbnail,
                      permalink: post.permalink || '',
                      timestamp: new Date(post.timestamp),
                      active: true,
                    },
                  });
                  syncedPosts++;
                }
              }
            }
          } catch (carouselError) {
            console.error(`Carousel error:`, carouselError);
          }
          
          continue;
        }

        // Sync images and videos
        if (post.media_type === 'IMAGE' || post.media_type === 'VIDEO') {
          let cloudinaryUrl = post.media_url;
          let cloudinaryThumbnail = post.thumbnail_url || post.media_url;

          try {
            if (post.media_type === 'VIDEO') {
              const uploadResult = await cloudinary.uploader.upload(post.media_url, {
                folder: 'innov8_portfolio/instagram/reels',
                resource_type: 'video',
              });

              cloudinaryUrl = uploadResult.secure_url;
              
              if (post.thumbnail_url) {
                const thumbResult = await cloudinary.uploader.upload(post.thumbnail_url, {
                  folder: 'innov8_portfolio/instagram/reels',
                  resource_type: 'image',
                });
                cloudinaryThumbnail = thumbResult.secure_url;
              }
              uploadedToCloudinary++;
            } else {
              const uploadResult = await cloudinary.uploader.upload(post.media_url, {
                folder: 'innov8_portfolio/instagram',
                resource_type: 'image',
              });

              cloudinaryUrl = uploadResult.secure_url;
              cloudinaryThumbnail = uploadResult.secure_url.replace(
                '/upload/',
                '/upload/w_800,h_800,c_fill,q_90,f_auto/'
              );
              uploadedToCloudinary++;
            }
          } catch (uploadError) {
            console.error(`Upload failed:`, uploadError);
          }

          await prisma.instagramPost.upsert({
            where: { instagramId: post.id },
            update: {
              caption: post.caption || '',
              mediaType: post.media_type,
              mediaUrl: cloudinaryUrl,
              thumbnailUrl: cloudinaryThumbnail,
              permalink: post.permalink || '',
              timestamp: new Date(post.timestamp),
              active: true,
              updatedAt: new Date(),
            },
            create: {
              instagramId: post.id,
              caption: post.caption || '',
              mediaType: post.media_type,
              mediaUrl: cloudinaryUrl,
              thumbnailUrl: cloudinaryThumbnail,
              permalink: post.permalink || '',
              timestamp: new Date(post.timestamp),
              active: true,
            },
          });
          syncedPosts++;
        }
      } catch (error) {
        console.error(`Error syncing post:`, error);
      }
    }

    // Update last sync time
    await prisma.siteSettings.update({
      where: { id: settings.id },
      data: { instagramLastSync: new Date() },
    });

    return NextResponse.json({
      success: true,
      message: `Successfully synced ${syncedPosts} posts. Uploaded ${uploadedToCloudinary} files to Cloudinary.`,
      data: {
        posts: syncedPosts,
        uploaded: uploadedToCloudinary,
      },
    });
  } catch (error: any) {
    console.error('Instagram sync error:', error);
    return NextResponse.json(
      { error: 'Failed to sync Instagram data', details: error.message },
      { status: 500 }
    );
  }
}

// GET endpoint
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const settings = await prisma.siteSettings.findFirst();
    const postsCount = await prisma.instagramPost.count();

    return NextResponse.json({
      connected: !!settings?.instagramAccessToken,
      username: settings?.instagramUsername,
      lastSync: settings?.instagramLastSync,
      postsCount,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to get sync status' },
      { status: 500 }
    );
  }
}
