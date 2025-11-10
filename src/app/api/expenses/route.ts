import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

// GET: Fetch all expenses (with optional filters)
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const month = searchParams.get('month'); // Format: YYYY-MM

    const where: any = {};

    if (category && category !== 'all') {
      where.category = category;
    }

    // Date filtering
    if (month) {
      // Get expenses for specific month
      const [year, monthNum] = month.split('-');
      const startOfMonth = new Date(parseInt(year), parseInt(monthNum) - 1, 1);
      const endOfMonth = new Date(parseInt(year), parseInt(monthNum), 0, 23, 59, 59);
      where.date = {
        gte: startOfMonth,
        lte: endOfMonth,
      };
    } else if (startDate && endDate) {
      where.date = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    const expenses = await (prisma as any).expense.findMany({
      where,
      orderBy: { date: 'desc' },
    });

    return NextResponse.json(expenses);
  } catch (error: any) {
    console.error('Error fetching expenses:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch expenses' },
      { status: 500 }
    );
  }
}

// POST: Create expense
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await req.json();

    const expense = await (prisma as any).expense.create({
      data: {
        ...data,
        date: new Date(data.date),
      },
    });

    return NextResponse.json(expense);
  } catch (error: any) {
    console.error('Error creating expense:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create expense' },
      { status: 500 }
    );
  }
}

// PUT: Update expense
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, ...data } = await req.json();

    if (!id) {
      return NextResponse.json({ error: 'Expense ID required' }, { status: 400 });
    }

    const expense = await (prisma as any).expense.update({
      where: { id },
      data: {
        ...data,
        date: data.date ? new Date(data.date) : undefined,
      },
    });

    return NextResponse.json(expense);
  } catch (error: any) {
    console.error('Error updating expense:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update expense' },
      { status: 500 }
    );
  }
}

// DELETE: Delete expense
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Expense ID required' }, { status: 400 });
    }

    await (prisma as any).expense.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Expense deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting expense:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete expense' },
      { status: 500 }
    );
  }
}
