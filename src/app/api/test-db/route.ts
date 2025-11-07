import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Test database connection
    const userCount = await prisma.user.count();
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      connected: true,
      userCount,
      users: users.map(u => ({
        ...u,
        hasAccount: true,
      })),
      message: 'Database connected successfully',
    });
  } catch (error) {
    console.error('Database test error:', error);
    return NextResponse.json({
      success: false,
      connected: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Database connection failed',
    }, { status: 500 });
  }
}
