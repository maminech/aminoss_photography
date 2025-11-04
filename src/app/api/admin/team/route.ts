import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

// GET: Fetch all team members
export async function GET() {
  try {
    const teamMembers = await prisma.teamMember.findMany({
      orderBy: { order: 'asc' },
    });

    return NextResponse.json(teamMembers);
  } catch (error: any) {
    console.error('Error fetching team members:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch team members' },
      { status: 500 }
    );
  }
}

// POST: Create team member
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await req.json();

    const teamMember = await prisma.teamMember.create({
      data,
    });

    return NextResponse.json(teamMember);
  } catch (error: any) {
    console.error('Error creating team member:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create team member' },
      { status: 500 }
    );
  }
}

// PUT: Update team member
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, ...data } = await req.json();

    const teamMember = await prisma.teamMember.update({
      where: { id },
      data,
    });

    return NextResponse.json(teamMember);
  } catch (error: any) {
    console.error('Error updating team member:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update team member' },
      { status: 500 }
    );
  }
}

// DELETE: Delete team member
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID required' }, { status: 400 });
    }

    await prisma.teamMember.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Team member deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting team member:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete team member' },
      { status: 500 }
    );
  }
}
