import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import webpush from 'web-push';

// Configure web-push with VAPID keys (you'll need to generate these)
if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    'mailto:' + (process.env.ADMIN_EMAIL || 'admin@aminoss.com'),
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { title, body, url, tag, requireInteraction } = await req.json();

    if (!title || !body) {
      return NextResponse.json({ error: 'Title and body are required' }, { status: 400 });
    }

    // Get all push subscriptions
    const subscriptions = await prisma.pushSubscription.findMany();

    if (subscriptions.length === 0) {
      return NextResponse.json({ message: 'No subscriptions found', sentCount: 0 });
    }

    const payload = JSON.stringify({
      title,
      body,
      url: url || '/admin/dashboard',
      tag: tag || 'general',
      requireInteraction: requireInteraction || false
    });

    // Send notifications to all subscriptions
    const sendPromises = subscriptions.map(async (subscription: any) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: subscription.endpoint,
            keys: subscription.keys as any
          },
          payload
        );
        return { success: true, endpoint: subscription.endpoint };
      } catch (error: any) {
        console.error('Error sending to:', subscription.endpoint, error);
        
        // If subscription is invalid (410 Gone), delete it
        if (error.statusCode === 410) {
          await prisma.pushSubscription.delete({
            where: { endpoint: subscription.endpoint }
          }).catch(() => {});
        }
        
        return { success: false, endpoint: subscription.endpoint, error: error.message };
      }
    });

    const results = await Promise.all(sendPromises);
    const sentCount = results.filter((r: any) => r.success).length;

    return NextResponse.json({ 
      message: `Sent ${sentCount} notifications`,
      sentCount,
      totalSubscriptions: subscriptions.length,
      results
    });
  } catch (error) {
    console.error('Error sending push notifications:', error);
    return NextResponse.json({ error: 'Failed to send notifications' }, { status: 500 });
  }
}
