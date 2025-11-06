import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

// Instagram Graph API (for Creator/Business accounts)
// Docs: https://developers.facebook.com/docs/instagram-api

const INSTAGRAM_APP_ID = process.env.INSTAGRAM_APP_ID;
const INSTAGRAM_APP_SECRET = process.env.INSTAGRAM_APP_SECRET;
const INSTAGRAM_REDIRECT_URI = process.env.INSTAGRAM_REDIRECT_URI;
const FACEBOOK_PAGE_ID = process.env.FACEBOOK_PAGE_ID; // We'll get this after connecting

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if Instagram credentials are configured
    if (!INSTAGRAM_APP_ID || !INSTAGRAM_APP_SECRET || !INSTAGRAM_REDIRECT_URI) {
      return NextResponse.json(
        {
          error: 'Instagram API not configured',
          message: 'Please add INSTAGRAM_APP_ID, INSTAGRAM_APP_SECRET, and INSTAGRAM_REDIRECT_URI to your .env file',
          documentation: 'https://developers.facebook.com/docs/instagram-basic-display-api/getting-started'
        },
        { status: 503 }
      );
    }

    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');

    if (!code) {
      // Step 1: Redirect to Facebook OAuth (for Instagram Graph API)
      const authUrl = `https://www.facebook.com/v18.0/dialog/oauth?client_id=${INSTAGRAM_APP_ID}&redirect_uri=${INSTAGRAM_REDIRECT_URI}&scope=instagram_basic,instagram_content_publish,pages_show_list,pages_read_engagement&response_type=code`;
      
      return NextResponse.json({ authUrl });
    }

    // Step 2: Exchange code for access token (Facebook Graph API)
    const tokenResponse = await fetch(
      `https://graph.facebook.com/v18.0/oauth/access_token?client_id=${INSTAGRAM_APP_ID}&redirect_uri=${INSTAGRAM_REDIRECT_URI}&client_secret=${INSTAGRAM_APP_SECRET}&code=${code}`
    );

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json();
      throw new Error(`Failed to get access token: ${JSON.stringify(errorData)}`);
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    // Step 3: Get user's Facebook pages
    const pagesResponse = await fetch(
      `https://graph.facebook.com/v18.0/me/accounts?access_token=${accessToken}`
    );

    if (!pagesResponse.ok) {
      throw new Error('Failed to fetch Facebook pages');
    }

    const pagesData = await pagesResponse.json();
    
    if (!pagesData.data || pagesData.data.length === 0) {
      return NextResponse.json({
        error: 'No Facebook page found',
        message: 'Please create a Facebook page and connect it to your Instagram account',
        documentation: 'https://www.facebook.com/pages/creation/'
      }, { status: 400 });
    }

    const pageAccessToken = pagesData.data[0].access_token;
    const pageId = pagesData.data[0].id;

    // Step 4: Get Instagram Business Account ID
    const igAccountResponse = await fetch(
      `https://graph.facebook.com/v18.0/${pageId}?fields=instagram_business_account&access_token=${pageAccessToken}`
    );

    if (!igAccountResponse.ok) {
      throw new Error('Failed to get Instagram account');
    }

    const igAccountData = await igAccountResponse.json();
    
    if (!igAccountData.instagram_business_account) {
      return NextResponse.json({
        error: 'Instagram account not connected',
        message: 'Please connect your Instagram Creator account to your Facebook page',
        documentation: 'https://help.instagram.com/570895513091465'
      }, { status: 400 });
    }

    const instagramAccountId = igAccountData.instagram_business_account.id;

    // Step 5: Fetch Instagram media
    const mediaResponse = await fetch(
      `https://graph.facebook.com/v18.0/${instagramAccountId}/media?fields=id,caption,media_type,media_url,thumbnail_url,permalink,timestamp&access_token=${pageAccessToken}`
    );

    if (!mediaResponse.ok) {
      throw new Error('Failed to fetch Instagram media');
    }

    const mediaData = await mediaResponse.json();

    return NextResponse.json({
      success: true,
      media: mediaData.data,
      count: mediaData.data.length,
    });
  } catch (error) {
    console.error('Instagram sync error:', error);
    return NextResponse.json(
      { error: 'Failed to sync Instagram photos', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { media, cloudinaryUrl } = body;

    if (!media || !Array.isArray(media)) {
      return NextResponse.json({ error: 'Invalid media data' }, { status: 400 });
    }

    let imported = 0;
    let skipped = 0;
    const errors: string[] = [];

      for (const item of media) {
      try {
        // Import both images and videos
        if (item.media_type !== 'IMAGE' && item.media_type !== 'VIDEO') {
          skipped++;
          continue;
        }

        // Check if already imported
        const existing = await prisma.image.findFirst({
          where: {
            OR: [
              { url: item.media_url },
              { title: item.caption?.substring(0, 100) || `Instagram import ${item.id}` }
            ]
          }
        });

        if (existing) {
          skipped++;
          continue;
        }

        // Upload to Cloudinary
        const uploadResponse = await fetch('/api/admin/cloudinary-upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageUrl: item.media_url,
            folder: 'instagram-imports',
          }),
        });

        if (!uploadResponse.ok) {
          errors.push(`Failed to upload ${item.id} to Cloudinary`);
          continue;
        }

        const uploadData = await uploadResponse.json();

        // Save to database (use Image model for both images and videos for now)
        await prisma.image.create({
          data: {
            cloudinaryId: uploadData.public_id,
            url: uploadData.secure_url,
            thumbnailUrl: uploadData.thumbnail_url || uploadData.secure_url,
            title: item.caption?.substring(0, 100) || `Instagram ${item.media_type.toLowerCase()} ${item.id}`,
            description: item.caption || '',
            category: 'travel', // Default category
            tags: ['instagram', 'import', item.media_type.toLowerCase()],
            featured: false,
            showOnHomepage: false,
            showInGallery: true,
            order: 0,
            width: uploadData.width,
            height: uploadData.height,
            format: uploadData.format,
          },
        });

        imported++;
      } catch (itemError) {
        console.error(`Error importing ${item.id}:`, itemError);
        errors.push(`Error importing ${item.id}`);
      }
    }    return NextResponse.json({
      success: true,
      imported,
      skipped,
      errors,
      message: `Successfully imported ${imported} photos. Skipped ${skipped}.`
    });
  } catch (error) {
    console.error('Instagram import error:', error);
    return NextResponse.json(
      { error: 'Failed to import Instagram photos', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
