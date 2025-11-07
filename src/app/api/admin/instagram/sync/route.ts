import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';

interface InstagramMedia {
  id: string;
  media_type: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM';
  media_url: string;
  thumbnail_url?: string;
  timestamp: string;
  caption?: string;
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

    // Fetch Instagram Highlights (Stories)
    const highlightsResponse = await fetch(
      `https://graph.instagram.com/${userId}/stories?fields=id,name,cover_media{thumbnail_url}&access_token=${accessToken}`
    );

    if (!highlightsResponse.ok) {
      const error = await highlightsResponse.json();
      console.error('Instagram API Error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch Instagram highlights', details: error },
        { status: highlightsResponse.status }
      );
    }

    const highlightsData = await highlightsResponse.json();
    const highlights: InstagramHighlight[] = highlightsData.data || [];

    console.log(`📚 Found ${highlights.length} highlights`);

    let syncedHighlights = 0;
    let syncedStories = 0;

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

    // Update last sync time
    await prisma.siteSettings.update({
      where: { id: settings.id },
      data: { instagramLastSync: new Date() },
    });

    console.log(`✅ Sync complete: ${syncedHighlights} highlights, ${syncedStories} stories`);

    return NextResponse.json({
      success: true,
      message: `Successfully synced ${syncedHighlights} highlights with ${syncedStories} stories`,
      data: {
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
    const highlightsCount = await prisma.instagramHighlight.count();
    const storiesCount = await prisma.instagramStory.count();

    return NextResponse.json({
      connected: !!settings?.instagramAccessToken,
      username: settings?.instagramUsername,
      lastSync: settings?.instagramLastSync,
      autoSync: settings?.instagramAutoSync,
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
