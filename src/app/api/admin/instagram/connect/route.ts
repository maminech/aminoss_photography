import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { accessToken } = body;

    if (!accessToken) {
      return NextResponse.json(
        { error: 'Access token is required' },
        { status: 400 }
      );
    }

    // Verify token and get user info
    const response = await fetch(
      `https://graph.instagram.com/me?fields=id,username&access_token=${accessToken}`
    );

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json(
        { error: 'Invalid access token', details: error },
        { status: 400 }
      );
    }

    const userData = await response.json();

    // Update settings with Instagram credentials
    const settings = await prisma.siteSettings.findFirst();

    if (settings) {
      await prisma.siteSettings.update({
        where: { id: settings.id },
        data: {
          instagramAccessToken: accessToken,
          instagramUserId: userData.id,
          instagramUsername: userData.username,
          instagramAutoSync: false, // Can be enabled later
        },
      });
    } else {
      await prisma.siteSettings.create({
        data: {
          instagramAccessToken: accessToken,
          instagramUserId: userData.id,
          instagramUsername: userData.username,
          instagramAutoSync: false,
          aboutContent: '',
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Instagram connected successfully',
      username: userData.username,
    });
  } catch (error: any) {
    console.error('Instagram connect error:', error);
    return NextResponse.json(
      { error: 'Failed to connect Instagram', details: error.message },
      { status: 500 }
    );
  }
}

// Disconnect Instagram
export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const settings = await prisma.siteSettings.findFirst();

    if (settings) {
      await prisma.siteSettings.update({
        where: { id: settings.id },
        data: {
          instagramAccessToken: null,
          instagramUserId: null,
          instagramUsername: null,
          instagramAutoSync: false,
          instagramLastSync: null,
        },
      });

      // Optionally delete all synced data
      await prisma.instagramStory.deleteMany({});
      await prisma.instagramHighlight.deleteMany({});
    }

    return NextResponse.json({
      success: true,
      message: 'Instagram disconnected successfully',
    });
  } catch (error: any) {
    console.error('Instagram disconnect error:', error);
    return NextResponse.json(
      { error: 'Failed to disconnect Instagram', details: error.message },
      { status: 500 }
    );
  }
}
