import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const month = searchParams.get('month'); // Format: YYYY-MM
    const year = searchParams.get('year'); // Format: YYYY

    // Determine date range
    let startDate: Date;
    let endDate: Date;

    if (month) {
      const [yearNum, monthNum] = month.split('-');
      startDate = new Date(parseInt(yearNum), parseInt(monthNum) - 1, 1);
      endDate = new Date(parseInt(yearNum), parseInt(monthNum), 0, 23, 59, 59);
    } else if (year) {
      startDate = new Date(parseInt(year), 0, 1);
      endDate = new Date(parseInt(year), 11, 31, 23, 59, 59);
    } else {
      // Current month by default
      const now = new Date();
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    }

    // Get revenue from invoices
    const invoices = await (prisma as any).invoice.findMany({
      where: {
        issueDate: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    const totalRevenue = invoices.reduce((sum: number, inv: any) => sum + inv.totalAmount, 0);
    const paidRevenue = invoices.reduce((sum: number, inv: any) => sum + inv.paidAmount, 0);
    const pendingRevenue = totalRevenue - paidRevenue;

    // Payment status breakdown
    const paidInvoices = invoices.filter((inv: any) => inv.paymentStatus === 'paid').length;
    const partialInvoices = invoices.filter((inv: any) => inv.paymentStatus === 'partial').length;
    const unpaidInvoices = invoices.filter((inv: any) => inv.paymentStatus === 'unpaid').length;

    // Get expenses
    const expenses = await (prisma as any).expense.findMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    const totalExpenses = expenses.reduce((sum: number, exp: any) => sum + exp.amount, 0);

    // Expense breakdown by category
    const expensesByCategory: any = {};
    expenses.forEach((exp: any) => {
      expensesByCategory[exp.category] = (expensesByCategory[exp.category] || 0) + exp.amount;
    });

    // Get salary payments
    const salaries = await (prisma as any).salaryPayment.findMany({
      where: {
        paymentDate: {
          gte: startDate,
          lte: endDate,
        },
        status: 'paid',
      },
    });

    const totalSalaries = salaries.reduce((sum: number, sal: any) => sum + sal.netAmount, 0);

    // Calculate profit
    const totalCosts = totalExpenses + totalSalaries;
    const profit = paidRevenue - totalCosts;
    const profitMargin = paidRevenue > 0 ? (profit / paidRevenue) * 100 : 0;

    // Get previous period for comparison
    const prevStartDate = new Date(startDate);
    const prevEndDate = new Date(endDate);
    
    if (month) {
      prevStartDate.setMonth(prevStartDate.getMonth() - 1);
      prevEndDate.setMonth(prevEndDate.getMonth() - 1);
    } else {
      prevStartDate.setFullYear(prevStartDate.getFullYear() - 1);
      prevEndDate.setFullYear(prevEndDate.getFullYear() - 1);
    }

    const prevInvoices = await (prisma as any).invoice.findMany({
      where: {
        issueDate: {
          gte: prevStartDate,
          lte: prevEndDate,
        },
      },
    });

    const prevRevenue = prevInvoices.reduce((sum: number, inv: any) => sum + inv.paidAmount, 0);
    const revenueGrowth = prevRevenue > 0 ? ((paidRevenue - prevRevenue) / prevRevenue) * 100 : 0;

    // Insights and recommendations
    const insights: string[] = [];

    if (unpaidInvoices > 0) {
      insights.push(`${unpaidInvoices} invoice${unpaidInvoices > 1 ? 's' : ''} pending payment - Follow up needed`);
    }

    if (revenueGrowth > 10) {
      insights.push(`Revenue up ${revenueGrowth.toFixed(1)}% from last period! 🎉`);
    } else if (revenueGrowth < -10) {
      insights.push(`Revenue down ${Math.abs(revenueGrowth).toFixed(1)}% - Consider marketing efforts`);
    }

    if (totalExpenses > paidRevenue * 0.5) {
      insights.push('Expenses are over 50% of revenue - Review cost optimization');
    }

    if (profitMargin < 20) {
      insights.push('Profit margin below 20% - Consider price adjustments');
    }

    const topExpenseCategory = Object.entries(expensesByCategory)
      .sort((a: any, b: any) => b[1] - a[1])[0];
    
    if (topExpenseCategory) {
      insights.push(`Highest expense: ${topExpenseCategory[0]} (${((topExpenseCategory[1] as number / totalExpenses) * 100).toFixed(0)}%)`);
    }

    return NextResponse.json({
      period: {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        label: month || year || 'Current Month',
      },
      revenue: {
        total: totalRevenue,
        paid: paidRevenue,
        pending: pendingRevenue,
        invoiceCount: invoices.length,
        paidCount: paidInvoices,
        partialCount: partialInvoices,
        unpaidCount: unpaidInvoices,
        growth: revenueGrowth,
      },
      expenses: {
        total: totalExpenses,
        count: expenses.length,
        byCategory: expensesByCategory,
      },
      salaries: {
        total: totalSalaries,
        count: salaries.length,
      },
      profit: {
        amount: profit,
        margin: profitMargin,
      },
      insights,
    });
  } catch (error: any) {
    console.error('Error fetching financial stats:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch financial stats' },
      { status: 500 }
    );
  }
}
