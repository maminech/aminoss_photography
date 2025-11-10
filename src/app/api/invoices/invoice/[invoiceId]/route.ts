import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Get single invoice
export async function GET(
  req: NextRequest,
  { params }: { params: { invoiceId: string } }
) {
  try {
    const { invoiceId } = params;

    const invoice = await (prisma as any).invoice.findUnique({
      where: { id: invoiceId },
      include: {
        booking: {
          include: {
            pack: true
          }
        }
      }
    });

    if (!invoice) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(invoice);
  } catch (error) {
    console.error('Error fetching invoice:', error);
    return NextResponse.json(
      { error: 'Failed to fetch invoice' },
      { status: 500 }
    );
  }
}

// Update invoice
export async function PATCH(
  req: NextRequest,
  { params }: { params: { invoiceId: string } }
) {
  try {
    const { invoiceId } = params;
    const body = await req.json();

    // Calculate totals if items changed
    let updateData: any = { ...body };
    
    // If marking as paid without full invoice data
    if (body.paymentStatus === 'paid' && !body.items) {
      // Get existing invoice to set paidAmount = totalAmount
      const existingInvoice = await (prisma as any).invoice.findUnique({
        where: { id: invoiceId }
      });
      
      if (existingInvoice) {
        updateData.paidAmount = existingInvoice.totalAmount;
        updateData.paymentMethod = updateData.paymentMethod || 'cash';
      }
    }
    
    if (body.items) {
      const subtotal = body.items.reduce((sum: number, item: any) => sum + item.total, 0);
      const taxAmount = subtotal * (body.taxRate || 0) / 100;
      const totalAmount = subtotal + taxAmount - (body.discount || 0);
      
      updateData.subtotal = subtotal;
      updateData.taxAmount = taxAmount;
      updateData.totalAmount = totalAmount;
      
      // Update payment status
      if (body.paidAmount !== undefined) {
        if (body.paidAmount >= totalAmount) {
          updateData.paymentStatus = 'paid';
        } else if (body.paidAmount > 0) {
          updateData.paymentStatus = 'partial';
        } else {
          updateData.paymentStatus = 'unpaid';
        }
      }
    }

    // Convert date strings to Date objects
    if (updateData.issueDate) updateData.issueDate = new Date(updateData.issueDate);
    if (updateData.dueDate) updateData.dueDate = new Date(updateData.dueDate);
    if (updateData.paymentDate) updateData.paymentDate = new Date(updateData.paymentDate);
    if (updateData.eventDate) updateData.eventDate = new Date(updateData.eventDate);

    const invoice = await (prisma as any).invoice.update({
      where: { id: invoiceId },
      data: updateData,
      include: {
        booking: true
      }
    });

    return NextResponse.json(invoice);
  } catch (error) {
    console.error('Error updating invoice:', error);
    return NextResponse.json(
      { error: 'Failed to update invoice' },
      { status: 500 }
    );
  }
}

// Delete invoice
export async function DELETE(
  req: NextRequest,
  { params }: { params: { invoiceId: string } }
) {
  try {
    const { invoiceId } = params;

    await (prisma as any).invoice.delete({
      where: { id: invoiceId }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting invoice:', error);
    return NextResponse.json(
      { error: 'Failed to delete invoice' },
      { status: 500 }
    );
  }
}
