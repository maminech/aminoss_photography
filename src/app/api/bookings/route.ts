import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { notifyNewBooking } from '@/lib/notifications';

// GET - Get all bookings (admin only)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const grouped = searchParams.get('grouped') === 'true';
    const includeTracking = searchParams.get('includeTracking') === 'true';

    const bookings = await prisma.booking.findMany({
      where: includeTracking ? {} : {
        status: {
          not: 'tracking', // Exclude incomplete tracking records unless requested
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        pack: true,
      },
    });

    // If grouped by client name is requested
    if (grouped) {
      const groupedBookings = bookings.reduce((acc: any, booking: any) => {
        const clientName = booking.name;
        if (!acc[clientName]) {
          acc[clientName] = {
            clientName,
            clientPhone: booking.phone,
            clientEmail: booking.email,
            bookings: [],
            totalBookings: 0,
          };
        }
        acc[clientName].bookings.push(booking);
        acc[clientName].totalBookings++;
        return acc;
      }, {});

      // Convert to array and sort by most recent booking
      const groupedArray = Object.values(groupedBookings).sort((a: any, b: any) => {
        const latestA = new Date(a.bookings[0].createdAt).getTime();
        const latestB = new Date(b.bookings[0].createdAt).getTime();
        return latestB - latestA;
      });

      return NextResponse.json(groupedArray);
    }

    return NextResponse.json(bookings);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 });
  }
}

// POST - Create booking request (supports multi-event)
export async function POST(request: NextRequest) {
  try {
    const {
      clientName,
      clientEmail,
      clientPhone,
      events, // NEW: Array of events
      eventType, // Legacy field (fallback to first event)
      requestedDate, // Legacy field (fallback to first event)
      timeSlot, // Legacy field (fallback to first event)
      location, // Legacy field (fallback to first event)
      message,
      packName,
    } = await request.json();

    // Email is now optional, only name and phone are required
    // Either events array OR legacy fields must be provided
    if (!clientName || !clientPhone) {
      return NextResponse.json({ error: 'Missing required fields (name, phone)' }, { status: 400 });
    }

    // Validate events data (must have at least one event with required fields)
    if (events && Array.isArray(events) && events.length > 0) {
      // Validate each event has required fields
      const hasInvalidEvent = events.some((evt: any) => 
        !evt.eventType || !evt.eventDate || !evt.timeSlot
      );
      
      if (hasInvalidEvent) {
        return NextResponse.json({ 
          error: 'Each event must have eventType, eventDate, and timeSlot' 
        }, { status: 400 });
      }
    } else if (!eventType || !requestedDate) {
      // If no events array, require legacy fields
      return NextResponse.json({ 
        error: 'Missing required fields (events or eventType/requestedDate)' 
      }, { status: 400 });
    }

    // Get IP and user agent for tracking
    const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Prepare event data (use events array if provided, otherwise create from legacy fields)
    const eventData = events && events.length > 0 ? events : [{
      eventType,
      eventDate: requestedDate,
      timeSlot,
      location,
    }];

    // Use first event for legacy fields
    const firstEvent = eventData[0];

    // Check if there's an existing tracking record to update
    const existingTracking = await prisma.booking.findFirst({
      where: {
        name: clientName,
        phone: clientPhone,
        status: 'tracking', // Incomplete forms
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Within last 24 hours
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    let booking;

    if (existingTracking) {
      // Update existing tracking record with complete data
      booking = await prisma.booking.update({
        where: { id: existingTracking.id },
        data: {
          email: clientEmail,
          events: eventData, // Store all events
          eventType: firstEvent.eventType, // Legacy field
          eventDate: new Date(firstEvent.eventDate), // Legacy field
          timeSlot: firstEvent.timeSlot, // Legacy field
          location: firstEvent.location || location || 'pending', // Legacy field
          message: message || null,
          packageName: packName || existingTracking.packageName,
          status: 'pending', // Change from 'tracking' to 'pending'
          ipAddress,
          userAgent,
        } as any, // Type assertion until Prisma client is regenerated
      });
    } else {
      // Create new booking
      booking = await prisma.booking.create({
        data: {
          name: clientName,
          email: clientEmail,
          phone: clientPhone,
          events: eventData, // Store all events
          eventType: firstEvent.eventType, // Legacy field
          eventDate: new Date(firstEvent.eventDate), // Legacy field
          timeSlot: firstEvent.timeSlot, // Legacy field
          location: firstEvent.location || location || 'pending', // Legacy field
          message: message || null,
          packageName: packName || null,
          status: 'pending',
          ipAddress,
          userAgent,
        } as any, // Type assertion until Prisma client is regenerated
      });
    }

    // Send push notification to admin
    try {
      await notifyNewBooking(booking);
    } catch (err) {
      console.error('Failed to send push notification:', err);
      // Don't fail the request if notification fails
    }

    return NextResponse.json(booking, { status: 201 });
  } catch (error) {
    console.error('Error creating booking:', error);
    return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 });
  }
}
