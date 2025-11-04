import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET - Get all active packs
export async function GET() {
  try {
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
