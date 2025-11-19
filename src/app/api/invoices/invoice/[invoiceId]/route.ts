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

    console.log('📝 Updating invoice:', invoiceId, 'with data:', body);

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
    
    // Recalculate totals if items exist
    if (body.items && Array.isArray(body.items)) {
      const subtotal = body.items.reduce((sum: number, item: any) => {
        const itemTotal = Number(item.total) || 0;
        return sum + itemTotal;
      }, 0);
      const taxAmount = subtotal * (Number(body.taxRate) || 0) / 100;
      const totalAmount = subtotal + taxAmount - (Number(body.discount) || 0);
      
      updateData.subtotal = subtotal;
      updateData.taxAmount = taxAmount;
      updateData.totalAmount = totalAmount;
    }
    
    // Always update payment status based on paidAmount and totalAmount
    const finalTotal = updateData.totalAmount || body.totalAmount || 0;
    const finalPaid = Number(updateData.paidAmount) || 0;
    
    if (finalPaid >= finalTotal && finalTotal > 0) {
      updateData.paymentStatus = 'paid';
    } else if (finalPaid > 0) {
      updateData.paymentStatus = 'partial';
    } else {
      updateData.paymentStatus = 'unpaid';
    }

    // Convert date strings to Date objects
    if (updateData.issueDate) {
      updateData.issueDate = new Date(updateData.issueDate);
    }
    if (updateData.dueDate) {
      updateData.dueDate = new Date(updateData.dueDate);
    }
    if (updateData.paymentDate) {
      updateData.paymentDate = new Date(updateData.paymentDate);
    }
    if (updateData.eventDate) {
      updateData.eventDate = new Date(updateData.eventDate);
    }

    // Remove undefined values to avoid Prisma errors
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    });

    console.log('💾 Final update data:', updateData);

    const invoice = await (prisma as any).invoice.update({
      where: { id: invoiceId },
      data: updateData,
      include: {
        booking: true
      }
    });

    console.log('✅ Invoice updated successfully');
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
