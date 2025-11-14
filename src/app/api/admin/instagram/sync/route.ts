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

    // Try to fetch Instagram Media (Feed Posts) - requires Business account
    const mediaResponse = await fetch(
      `https://graph.instagram.com/${userId}/media?fields=id,caption,media_type,media_url,thumbnail_url,permalink,timestamp&limit=50&access_token=${accessToken}`
    );

    let mediaPosts: InstagramMedia[] = [];
    
    if (!mediaResponse.ok) {
      const error = await mediaResponse.json();
      console.error('Instagram Media API Error:', error);
      console.log('ℹ️ Note: Feed posts require Instagram Business Account with proper permissions');
      
      // Check if it's a permissions error
      if (error.error?.code === 190 || error.error?.code === 10 || error.error?.message?.includes('business')) {
        return NextResponse.json({
          error: 'Instagram Business Account Required',
          message: 'To sync Instagram feed posts, you need:\n1. Convert your Instagram to a Business Account\n2. Connect it to a Facebook Page\n3. Generate a new access token with instagram_business_basic permission',
          details: error
        }, { status: 400 });
      }
      
      // Continue with highlights/stories only
      console.log('⚠️ Skipping feed posts, will try highlights only');
    } else {
      const mediaData = await mediaResponse.json();
      mediaPosts = mediaData.data || [];
      console.log(`📸 Found ${mediaPosts.length} Instagram posts`);
    }

    let syncedPosts = 0;
    let syncedHighlights = 0;
    let syncedStories = 0;
    let uploadedToCloudinary = 0;

    // Sync Instagram Feed Posts and upload to Cloudinary
    for (const post of mediaPosts) {
      try {
        // Only sync images (videos can be added later)
        if (post.media_type === 'IMAGE') {
          let cloudinaryUrl = post.media_url;
          let cloudinaryThumbnail = post.thumbnail_url || post.media_url;

          // Always upload to Cloudinary (using fetch API to avoid cloudinary package issues)
          console.log(`📤 Uploading ${post.id} to Cloudinary...`);
          try {
            const uploadResponse = await fetch(
              `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
              {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  file: post.media_url,
                  upload_preset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'aminoss_portfolio',
                  folder: 'aminoss_portfolio/instagram',
                }),
              }
            );

            if (uploadResponse.ok) {
              const uploadResult = await uploadResponse.json();
              cloudinaryUrl = uploadResult.secure_url;
              cloudinaryThumbnail = uploadResult.secure_url.replace(
                '/upload/',
                '/upload/w_800,h_800,c_fill,q_90,f_auto/'
              );
              uploadedToCloudinary++;
              console.log(`✅ Uploaded to Cloudinary: ${cloudinaryUrl}`);
            } else {
              console.error(`Failed to upload ${post.id} to Cloudinary`);
            }
          } catch (uploadError) {
            console.error(`Upload error for ${post.id}:`, uploadError);
            // Keep Instagram URL as fallback
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
        console.error(`Error syncing post ${post.id}:`, error);
      }
    }

    // Also fetch Instagram Highlights (Stories) if available
    try {
      const highlightsResponse = await fetch(
        `https://graph.instagram.com/${userId}/stories?fields=id,name,cover_media{thumbnail_url}&access_token=${accessToken}`
      );

      if (highlightsResponse.ok) {
        const highlightsData = await highlightsResponse.json();
        const highlights: InstagramHighlight[] = highlightsData.data || [];

        console.log(`📚 Found ${highlights.length} highlights`);

        // Sync each highlight
        for (let index = 0; index < highlights.length; index++) {
          const highlight = highlights[index];
          
          try {
            // Fetch stories in this highlight
            const storiesResponse = await fetch(
              `https://graph.instagram.com/${highlight.id}/stories?fields=id,media_type,media_url,thumbnail_url,timestamp&access_token=${accessToken}`
            );

            if (!storiesResponse.ok) {
              console.error(`Failed to fetch stories for highlight ${highlight.id}`);
              continue;
            }

            const storiesData = await storiesResponse.json();
            const stories: InstagramMedia[] = storiesData.data || [];

            console.log(`  📖 Highlight "${highlight.name}": ${stories.length} stories`);

            // Upsert highlight
            const dbHighlight = await prisma.instagramHighlight.upsert({
              where: { instagramId: highlight.id },
              update: {
                name: highlight.name,
                coverImage: highlight.cover_media?.thumbnail_url || '',
                order: index,
                active: true,
                updatedAt: new Date(),
              },
              create: {
                instagramId: highlight.id,
                name: highlight.name,
                coverImage: highlight.cover_media?.thumbnail_url || '',
                order: index,
                active: true,
              },
            });

            syncedHighlights++;

            // Delete existing stories for this highlight
            await prisma.instagramStory.deleteMany({
              where: { highlightId: dbHighlight.id },
            });

            // Insert stories
            for (let storyIndex = 0; storyIndex < stories.length; storyIndex++) {
              const story = stories[storyIndex];
              
              await prisma.instagramStory.create({
                data: {
                  highlightId: dbHighlight.id,
                  instagramId: story.id,
                  mediaType: story.media_type,
                  mediaUrl: story.media_url,
                  thumbnailUrl: story.thumbnail_url || story.media_url,
                  timestamp: new Date(story.timestamp),
                  order: storyIndex,
                },
              });

              syncedStories++;
            }
          } catch (error) {
            console.error(`Error syncing highlight ${highlight.id}:`, error);
          }
        }
      }
    } catch (highlightError) {
      console.log('ℹ️ Stories/highlights not available or not supported');
    }

    // Update last sync time
    await prisma.siteSettings.update({
      where: { id: settings.id },
      data: { instagramLastSync: new Date() },
    });

    console.log(`✅ Sync complete: ${syncedPosts} posts, ${syncedHighlights} highlights, ${syncedStories} stories`);

    return NextResponse.json({
      success: true,
      message: `Successfully synced ${syncedPosts} posts, ${syncedHighlights} highlights, ${syncedStories} stories`,
      data: {
        posts: syncedPosts,
        highlights: syncedHighlights,
        stories: syncedStories,
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

// GET endpoint to check sync status
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const settings = await prisma.siteSettings.findFirst();
    const postsCount = await prisma.instagramPost.count();
    const highlightsCount = await prisma.instagramHighlight.count();
    const storiesCount = await prisma.instagramStory.count();

    return NextResponse.json({
      connected: !!settings?.instagramAccessToken,
      username: settings?.instagramUsername,
      lastSync: settings?.instagramLastSync,
      autoSync: settings?.instagramAutoSync,
      postsCount,
      highlightsCount,
      storiesCount,
    });
  } catch (error: any) {
    console.error('Error getting sync status:', error);
    return NextResponse.json(
      { error: 'Failed to get sync status' },
      { status: 500 }
    );
  }
}
