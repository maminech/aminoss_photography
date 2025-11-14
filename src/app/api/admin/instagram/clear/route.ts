import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Delete all Instagram posts
    const result = await prisma.instagramPost.deleteMany({});

    return NextResponse.json({
      success: true,
      message: `Deleted ${result.count} Instagram posts`,
      count: result.count,
    });
  } catch (error: any) {
    console.error('Error deleting Instagram posts:', error);
    return NextResponse.json(
      { error: 'Failed to delete Instagram posts', details: error.message },
      { status: 500 }
    );
  }
}
