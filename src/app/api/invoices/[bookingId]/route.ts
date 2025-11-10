import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Generate invoice for a booking
export async function POST(
  req: NextRequest,
  { params }: { params: { bookingId: string } }
) {
  try {
    const { bookingId } = params;
    const body = await req.json();

    // Get the booking
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { pack: true }
    });

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    // Generate invoice number (INV-YYYY-XXX)
    const year = new Date().getFullYear();
    const latestInvoice = await (prisma as any).invoice.findFirst({
      where: {
        invoiceNumber: {
          startsWith: `INV-${year}-`
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    let invoiceNumber: string;
    if (latestInvoice) {
      const lastNumber = parseInt(latestInvoice.invoiceNumber.split('-')[2]);
      invoiceNumber = `INV-${year}-${String(lastNumber + 1).padStart(3, '0')}`;
    } else {
      invoiceNumber = `INV-${year}-001`;
    }

    // Prepare invoice items
    const items = body.items || [
      {
        description: body.serviceDescription || `${booking.eventType} - ${booking.packageName || 'Service photographique'}`,
        quantity: 1,
        unitPrice: body.totalAmount || booking.packagePrice || 0,
        total: body.totalAmount || booking.packagePrice || 0
      }
    ];

    const subtotal = body.subtotal || items.reduce((sum: number, item: any) => sum + item.total, 0);
    const taxRate = body.taxRate || 0;
    const taxAmount = body.taxAmount || (subtotal * taxRate / 100);
    const discount = body.discount || 0;
    const totalAmount = body.totalAmount || (subtotal + taxAmount - discount);

    // Create invoice
    const invoice = await (prisma as any).invoice.create({
      data: {
        invoiceNumber,
        bookingId: booking.id,
        clientName: booking.name,
        clientEmail: booking.email,
        clientPhone: booking.phone,
        clientAddress: body.clientAddress || booking.location,
        eventType: booking.eventType,
        eventDate: booking.eventDate,
        eventLocation: booking.location,
        items,
        subtotal,
        taxRate,
        taxAmount,
        discount,
        totalAmount,
        paidAmount: body.paidAmount || 0,
        paymentStatus: body.paidAmount >= totalAmount ? 'paid' : body.paidAmount > 0 ? 'partial' : 'unpaid',
        paymentMethod: body.paymentMethod || null,
        paymentDate: body.paymentDate ? new Date(body.paymentDate) : null,
        issueDate: body.issueDate ? new Date(body.issueDate) : new Date(),
        dueDate: body.dueDate ? new Date(body.dueDate) : null,
        notes: body.notes || null,
        termsConditions: body.termsConditions || null,
      }
    });

    return NextResponse.json(invoice);
  } catch (error) {
    console.error('Error creating invoice:', error);
    return NextResponse.json(
      { error: 'Failed to create invoice' },
      { status: 500 }
    );
  }
}

// Get invoices for a booking
export async function GET(
  req: NextRequest,
  { params }: { params: { bookingId: string } }
) {
  try {
    const { bookingId } = params;

    const invoices = await (prisma as any).invoice.findMany({
      where: { bookingId },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(invoices);
  } catch (error) {
    console.error('Error fetching invoices:', error);
    return NextResponse.json(
      { error: 'Failed to fetch invoices' },
      { status: 500 }
    );
  }
}
