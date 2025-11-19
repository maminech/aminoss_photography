import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('🧹 Cleaning up old Cloudinary data...');
    
    // Delete posts with old account URLs
    const deletedPosts = await prisma.instagramPost.deleteMany({
      where: {
        OR: [
          { mediaUrl: { contains: 'dc67gl8fu' } },
          { thumbnailUrl: { contains: 'dc67gl8fu' } },
          { mediaUrl: { contains: 'cdninstagram.com' } }, // Also delete Instagram URLs
        ],
      },
    });
    
    console.log(`✅ Deleted ${deletedPosts.count} old posts`);
    
    // Delete highlights with old account URLs
    const deletedHighlights = await prisma.instagramHighlight.deleteMany({
      where: {
        coverImage: { contains: 'dc67gl8fu' },
      },
    });
    
    console.log(`✅ Deleted ${deletedHighlights.count} old highlights`);
    
    // Delete all stories (they'll be re-synced)
    const deletedStories = await prisma.instagramStory.deleteMany({});
    
    console.log(`✅ Deleted ${deletedStories.count} stories`);
    
    return NextResponse.json({
      success: true,
      message: `Cleaned up ${deletedPosts.count} posts, ${deletedHighlights.count} highlights, ${deletedStories.count} stories`,
      data: {
        deletedPosts: deletedPosts.count,
        deletedHighlights: deletedHighlights.count,
        deletedStories: deletedStories.count,
      },
    });
  } catch (error: any) {
    console.error('Cleanup error:', error);
    return NextResponse.json(
      { error: 'Failed to cleanup', details: error.message },
      { status: 500 }
    );
  }
}
