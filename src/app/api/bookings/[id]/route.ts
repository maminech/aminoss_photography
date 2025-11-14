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

    // If approved, sync ALL events to calendar
    if (status === 'approved') {
      try {
        // Check if booking has multiple events (new format)
        if (booking.events && Array.isArray(booking.events) && booking.events.length > 0) {
          // Create calendar event for EACH event in the booking
          const calendarEventIds: string[] = [];
          
          for (const event of booking.events as any[]) {
            const calendarEvent = await prisma.calendarEvent.create({
              data: {
                date: new Date(event.eventDate),
                title: `${event.eventType} - ${booking.name}`,
                clientName: booking.name,
                eventType: event.eventType,
                location: booking.location || event.eventName || undefined,
                notes: `${event.eventName || ''}\nPackage: ${event.packageType || ''} ${event.packageLevel || ''}\nTime: ${event.timeSlot || ''}\n${booking.message || ''}`.trim(),
                status: 'confirmed',
                price: booking.packagePrice || undefined,
              },
            });
            
            calendarEventIds.push(calendarEvent.id);
          }
          
          // Store all calendar event IDs in the booking (as JSON array)
          await prisma.booking.update({
            where: { id: params.id },
            data: {
              calendarEventId: calendarEventIds[0], // First event ID for backward compatibility
              // Store all IDs in adminNotes for reference
              adminNotes: `${booking.adminNotes || ''}\n[Calendar Events: ${calendarEventIds.join(', ')}]`.trim(),
            },
          });
        } 
        // Fallback for old single-event bookings
        else if (!booking.calendarEventId) {
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
        }
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
