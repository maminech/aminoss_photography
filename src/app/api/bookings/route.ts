import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// POST - Create booking request
export async function POST(request: Request) {
  try {
    const { clientName, clientEmail, clientPhone, packId, packName, requestedDate, alternateDate, message } = await request.json();

    if (!clientName || !clientEmail || !packName || !requestedDate) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const booking = await prisma.booking.create({
      data: {
        clientName,
        clientEmail,
        clientPhone: clientPhone || null,
        packId: packId || null,
        packName,
        requestedDate: new Date(requestedDate),
        alternateDate: alternateDate ? new Date(alternateDate) : null,
        message: message || null,
        status: 'pending',
      },
    });

    return NextResponse.json(booking, { status: 201 });
  } catch (error) {
    console.error('Error creating booking:', error);
    return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 });
  }
}
