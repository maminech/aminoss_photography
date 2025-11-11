import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST - Create or update tracking record (partial submission)
export async function POST(request: NextRequest) {
  try {
    const {
      clientName,
      clientEmail,
      clientPhone,
      eventType,
      eventName,
      eventDate,
      viewedPackages, // Array of package IDs or names viewed
      selectedPackId,
      packName,
      timeSlot,
      message,
    } = await request.json();

    // Get IP and user agent for tracking
    const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Check if there's a recent tracking record for this visitor (within last 24 hours)
    let existingTracking = null;
    
    if (clientPhone) {
      existingTracking = await prisma.booking.findFirst({
        where: {
          phone: clientPhone,
          status: 'tracking',
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Within last 24 hours
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    } else if (ipAddress !== 'unknown') {
      existingTracking = await prisma.booking.findFirst({
        where: {
          ipAddress,
          status: 'tracking',
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Within last 24 hours
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    }

    let tracking;

    if (existingTracking) {
      // Update existing tracking record
      tracking = await prisma.booking.update({
        where: { id: existingTracking.id },
        data: {
          name: clientName || existingTracking.name,
          email: clientEmail || existingTracking.email,
          phone: clientPhone || existingTracking.phone,
          eventType: eventType || existingTracking.eventType,
          eventDate: eventDate ? new Date(eventDate) : existingTracking.eventDate,
          timeSlot: timeSlot || existingTracking.timeSlot,
          location: eventName || existingTracking.location, // Store event name in location field
          message: message || existingTracking.message,
          packageName: packName || selectedPackId || existingTracking.packageName,
          viewedPackages: true,
          packageViewedAt: new Date(),
          selectedPackages: viewedPackages || existingTracking.selectedPackages,
          updatedAt: new Date(),
        },
      });
    } else {
      // Create new tracking record
      tracking = await prisma.booking.create({
        data: {
          name: clientName || 'Anonymous Visitor',
          email: clientEmail,
          phone: clientPhone || '',
          eventType: eventType || 'other',
          eventDate: eventDate ? new Date(eventDate) : new Date(),
          timeSlot: timeSlot || 'all-day',
          location: eventName || 'pending', // Store event name in location field
          message: message,
          packageName: packName || selectedPackId,
          status: 'tracking', // Mark as tracking/incomplete
          viewedPackages: true,
          packageViewedAt: new Date(),
          selectedPackages: viewedPackages || [],
          ipAddress,
          userAgent,
        },
      });
    }

    return NextResponse.json({ success: true, tracking }, { status: 200 });
  } catch (error) {
    console.error('Error creating tracking record:', error);
    return NextResponse.json({ error: 'Failed to create tracking record' }, { status: 500 });
  }
}
