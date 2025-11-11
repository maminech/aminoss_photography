import React from 'react';
import { NextRequest, NextResponse } from 'next/server';
import { renderToBuffer } from '@react-pdf/renderer';
import { v2 as cloudinary } from 'cloudinary';
import { prisma } from '@/lib/prisma';
import InvoicePDF from '@/components/invoice/InvoicePDF';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: NextRequest) {
  try {
    const { invoiceId } = await req.json();

    if (!invoiceId) {
      return NextResponse.json(
        { error: 'Invoice ID is required' },
        { status: 400 }
      );
    }

    // Fetch invoice data
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: {
        booking: true,
      },
    });

    if (!invoice) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      );
    }

    // Prepare invoice data for PDF
    const invoiceData = {
      invoiceNumber: invoice.invoiceNumber,
      issueDate: invoice.issueDate.toISOString(),
      clientName: invoice.clientName,
      clientEmail: invoice.clientEmail,
      clientPhone: invoice.clientPhone,
      clientAddress: invoice.clientAddress,
      eventType: invoice.eventType,
      eventDate: invoice.eventDate.toISOString(),
      eventLocation: invoice.eventLocation,
      items: invoice.items as Array<{
        description: string;
        quantity: number;
        unitPrice: number;
        total: number;
      }>,
      subtotal: invoice.subtotal,
      discount: invoice.discount,
      totalAmount: invoice.totalAmount,
      paidAmount: invoice.paidAmount,
      paymentStatus: invoice.paymentStatus,
      notes: invoice.notes,
    };

    // Generate PDF buffer
    const pdfBuffer = await renderToBuffer(
      React.createElement(InvoicePDF, { invoiceData })
    );

    // Upload to Cloudinary
    const uploadResult = await new Promise<any>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: 'raw',
          folder: 'invoices',
          public_id: `invoice_${invoice.invoiceNumber}`,
          format: 'pdf',
          overwrite: true,
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );

      uploadStream.end(pdfBuffer);
    });

    // Update invoice with PDF URL
    const updatedInvoice = await prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        notes: invoice.notes
          ? `${invoice.notes}\n\nPDF URL: ${uploadResult.secure_url}`
          : `PDF URL: ${uploadResult.secure_url}`,
      },
    });

    return NextResponse.json({
      success: true,
      pdfUrl: uploadResult.secure_url,
      invoice: updatedInvoice,
    });
  } catch (error) {
    console.error('Error generating invoice PDF:', error);
    return NextResponse.json(
      { error: 'Failed to generate invoice PDF' },
      { status: 500 }
    );
  }
}
