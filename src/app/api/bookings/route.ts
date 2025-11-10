import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { notifyNewBooking } from '@/lib/notifications';

// GET - Get all bookings (admin only)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const grouped = searchParams.get('grouped') === 'true';

    const bookings = await prisma.booking.findMany({
      where: {
        status: {
          not: 'tracking', // Exclude incomplete tracking records
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

// POST - Create booking request
export async function POST(request: NextRequest) {
  try {
    const {
      clientName,
      clientEmail,
      clientPhone,
      eventType,
      requestedDate,
      timeSlot,
      location,
      message,
      packName,
    } = await request.json();

    // Email is now optional, only name, phone, eventType, and date are required
    if (!clientName || !clientPhone || !eventType || !requestedDate) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get IP and user agent for tracking
    const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

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
          eventType,
          eventDate: new Date(requestedDate),
          timeSlot: timeSlot || 'pending',
          location: location || 'pending',
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
          eventType,
          eventDate: new Date(requestedDate),
          timeSlot: timeSlot || 'pending',
          location: location || 'pending',
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
