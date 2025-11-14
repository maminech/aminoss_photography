import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET - Get all active packs (Admin only)
export async function GET() {
  try {
    // Check authentication - only admins can access packages
    const session = await getServerSession(authOptions);
    
    if (!session || session.user?.role?.toLowerCase() !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 401 }
      );
    }

    const packs = await prisma.pack.findMany({
      where: { active: true },
      orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
    });

    return NextResponse.json(packs);
  } catch (error) {
    console.error('Error fetching packs:', error);
    return NextResponse.json({ error: 'Failed to fetch packs' }, { status: 500 });
  }
}
