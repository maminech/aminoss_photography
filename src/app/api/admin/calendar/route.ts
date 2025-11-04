import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

// GET - Fetch all blocked dates
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const blockedDates = await prisma.blockedDate.findMany({
      orderBy: { date: 'asc' },
    });

    return NextResponse.json(blockedDates);
  } catch (error) {
    console.error('Error fetching blocked dates:', error);
    return NextResponse.json({ error: 'Failed to fetch blocked dates' }, { status: 500 });
  }
}

// POST - Add a blocked date
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { date, reason } = await request.json();

    if (!date) {
      return NextResponse.json({ error: 'Date is required' }, { status: 400 });
    }

    // Create blocked date
    const blockedDate = await prisma.blockedDate.create({
      data: {
        date: new Date(date),
        reason: reason || null,
      },
    });

    return NextResponse.json(blockedDate);
  } catch (error: any) {
    console.error('Error creating blocked date:', error);
    
    // Handle duplicate date
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'This date is already blocked' }, { status: 400 });
    }
    
    return NextResponse.json({ error: 'Failed to block date' }, { status: 500 });
  }
}

// DELETE - Remove a blocked date
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    await prisma.blockedDate.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Date unblocked successfully' });
  } catch (error) {
    console.error('Error deleting blocked date:', error);
    return NextResponse.json({ error: 'Failed to unblock date' }, { status: 500 });
  }
}
