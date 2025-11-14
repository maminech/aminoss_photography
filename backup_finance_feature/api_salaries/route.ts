import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

// GET: Fetch salary payments (with optional filters)
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const teamMemberId = searchParams.get('teamMemberId');
    const month = searchParams.get('month'); // Format: YYYY-MM
    const status = searchParams.get('status');

    const where: any = {};

    if (teamMemberId) {
      where.teamMemberId = teamMemberId;
    }

    if (month) {
      where.month = month;
    }

    if (status && status !== 'all') {
      where.status = status;
    }

    const salaryPayments = await (prisma as any).salaryPayment.findMany({
      where,
      include: {
        teamMember: true,
      },
      orderBy: { paymentDate: 'desc' },
    });

    return NextResponse.json(salaryPayments);
  } catch (error: any) {
    console.error('Error fetching salary payments:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch salary payments' },
      { status: 500 }
    );
  }
}

// POST: Create salary payment
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await req.json();

    // Get team member info
    const teamMember = await (prisma as any).teamMember.findUnique({
      where: { id: data.teamMemberId },
    });

    if (!teamMember) {
      return NextResponse.json({ error: 'Team member not found' }, { status: 404 });
    }

    // Calculate net amount
    const netAmount = data.amount + (data.bonus || 0) - (data.deductions || 0);

    const salaryPayment = await (prisma as any).salaryPayment.create({
      data: {
        ...data,
        teamMemberName: teamMember.name,
        teamMemberRole: teamMember.role,
        netAmount,
        paymentDate: new Date(data.paymentDate),
      },
      include: {
        teamMember: true,
      },
    });

    return NextResponse.json(salaryPayment);
  } catch (error: any) {
    console.error('Error creating salary payment:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create salary payment' },
      { status: 500 }
    );
  }
}

// PUT: Update salary payment
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, ...data } = await req.json();

    if (!id) {
      return NextResponse.json({ error: 'Salary payment ID required' }, { status: 400 });
    }

    // Calculate net amount if amounts changed
    let netAmount = data.netAmount;
    if (data.amount !== undefined || data.bonus !== undefined || data.deductions !== undefined) {
      const current = await (prisma as any).salaryPayment.findUnique({
        where: { id },
      });
      
      const amount = data.amount !== undefined ? data.amount : current.amount;
      const bonus = data.bonus !== undefined ? data.bonus : current.bonus;
      const deductions = data.deductions !== undefined ? data.deductions : current.deductions;
      
      netAmount = amount + bonus - deductions;
    }

    const salaryPayment = await (prisma as any).salaryPayment.update({
      where: { id },
      data: {
        ...data,
        netAmount,
        paymentDate: data.paymentDate ? new Date(data.paymentDate) : undefined,
      },
      include: {
        teamMember: true,
      },
    });

    return NextResponse.json(salaryPayment);
  } catch (error: any) {
    console.error('Error updating salary payment:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update salary payment' },
      { status: 500 }
    );
  }
}

// DELETE: Delete salary payment
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Salary payment ID required' }, { status: 400 });
    }

    await (prisma as any).salaryPayment.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Salary payment deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting salary payment:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete salary payment' },
      { status: 500 }
    );
  }
}
