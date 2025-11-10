import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { endpoint, keys, userAgent } = await req.json();

    if (!endpoint || !keys || !keys.p256dh || !keys.auth) {
      return NextResponse.json({ error: 'Invalid subscription data' }, { status: 400 });
    }

    // Check if subscription already exists
    const existing = await prisma.pushSubscription.findUnique({
      where: { endpoint }
    });

    if (existing) {
      // Update existing subscription
      await prisma.pushSubscription.update({
        where: { endpoint },
        data: {
          keys,
          userAgent,
          updatedAt: new Date()
        }
      });
      return NextResponse.json({ message: 'Subscription updated', success: true });
    }

    // Create new subscription
    await prisma.pushSubscription.create({
      data: {
        userId: session.user.id,
        endpoint,
        keys,
        userAgent
      }
    });

    return NextResponse.json({ message: 'Subscribed successfully', success: true });
  } catch (error) {
    console.error('Error subscribing to push notifications:', error);
    return NextResponse.json({ error: 'Failed to subscribe' }, { status: 500 });
  }
}
