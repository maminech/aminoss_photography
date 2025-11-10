import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * Track user interactions with booking form
 * POST: Track when user views packages (step 2) and package selections
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, phone, action, packageName, packagePrice } = body;

    // Get IP and user agent for tracking
    const ipAddress = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    const userAgent = req.headers.get('user-agent') || 'unknown';

    if (action === 'view-packages') {
      // User reached step 2 - create or update tracking record
      const existingTracking = await prisma.booking.findFirst({
        where: {
          name,
          phone,
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Within last 24 hours
          },
        },
      });

      if (existingTracking) {
        // Update existing record
        await prisma.booking.update({
          where: { id: existingTracking.id },
          data: {
            ipAddress,
            userAgent,
          } as any, // Type assertion until Prisma client is regenerated
        });

        return NextResponse.json({
          success: true,
          trackingId: existingTracking.id,
        });
      } else {
        // Create new tracking record
        const tracking = await prisma.booking.create({
          data: {
            name,
            email: 'tracking@pending.com', // Placeholder until form is completed
            phone,
            eventType: 'pending',
            eventDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now (placeholder)
            timeSlot: 'pending',
            location: 'pending',
            status: 'tracking', // Special status for incomplete forms
            ipAddress,
            userAgent,
          } as any, // Type assertion until Prisma client is regenerated
        });

        return NextResponse.json({
          success: true,
          trackingId: tracking.id,
        });
      }
    }

    if (action === 'select-package') {
      // User selected a package
      const tracking = await prisma.booking.findFirst({
        where: {
          name,
          phone,
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      if (tracking) {
        // Update current package selection
        await prisma.booking.update({
          where: { id: tracking.id },
          data: {
            packageName, // Update current selection
            packagePrice,
          } as any, // Type assertion until Prisma client is regenerated
        });

        return NextResponse.json({
          success: true,
          trackingId: tracking.id,
        });
      }
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Tracking error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to track interaction' },
      { status: 500 }
    );
  }
}
