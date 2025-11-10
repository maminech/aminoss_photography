import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Get single booking by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: params.id },
      include: {
        pack: true,
      },
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    return NextResponse.json(booking);
  } catch (error) {
    console.error('Error fetching booking:', error);
    return NextResponse.json({ error: 'Failed to fetch booking' }, { status: 500 });
  }
}

// PATCH - Update booking status and sync to calendar
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { status, adminNotes } = await request.json();

    if (!status || !['pending', 'approved', 'rejected', 'cancelled'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    // Update booking status
    const booking = await prisma.booking.update({
      where: { id: params.id },
      data: {
        status,
        ...(adminNotes !== undefined && { adminNotes }),
      },
      include: {
        pack: true,
      },
    });

    // If approved, sync to calendar
    if (status === 'approved' && !booking.calendarEventId) {
      try {
        const calendarEvent = await prisma.calendarEvent.create({
          data: {
            date: booking.eventDate,
            title: `${booking.eventType} - ${booking.name}`,
            clientName: booking.name,
            eventType: booking.eventType,
            location: booking.location,
            notes: booking.message || undefined,
            status: 'confirmed',
            price: booking.packagePrice || undefined,
          },
        });

        // Link calendar event to booking
        await prisma.booking.update({
          where: { id: params.id },
          data: {
            calendarEventId: calendarEvent.id,
          },
        });
      } catch (calendarError) {
        console.error('Error creating calendar event:', calendarError);
        // Continue even if calendar sync fails
      }
    }

    return NextResponse.json(booking);
  } catch (error) {
    console.error('Error updating booking:', error);
    return NextResponse.json({ error: 'Failed to update booking' }, { status: 500 });
  }
}

// DELETE - Delete booking
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.booking.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'Booking deleted successfully' });
  } catch (error) {
    console.error('Error deleting booking:', error);
    return NextResponse.json({ error: 'Failed to delete booking' }, { status: 500 });
  }
}
