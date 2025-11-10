import { prisma } from '@/lib/prisma';
import webpush from 'web-push';

// Configure VAPID keys
if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    'mailto:' + (process.env.ADMIN_EMAIL || 'aminoss.photography@gmail.com'),
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
}

interface NotificationData {
  title: string;
  body: string;
  url?: string;
  tag?: string;
  requireInteraction?: boolean;
}

/**
 * Send push notification to all admin subscriptions
 */
export async function sendPushNotification(data: NotificationData) {
  try {
    // Get all push subscriptions
    const subscriptions = await (prisma as any).pushSubscription?.findMany() || [];

    if (subscriptions.length === 0) {
      console.log('No push subscriptions found');
      return { sentCount: 0, totalSubscriptions: 0 };
    }

    const payload = JSON.stringify({
      title: data.title,
      body: data.body,
      url: data.url || '/admin/dashboard',
      tag: data.tag || 'general',
      requireInteraction: data.requireInteraction || false
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
        return { success: true };
      } catch (error: any) {
        console.error('Error sending to:', subscription.endpoint, error);
        
        // If subscription is invalid (410 Gone), delete it
        if (error.statusCode === 410) {
          await (prisma as any).pushSubscription?.delete({
            where: { endpoint: subscription.endpoint }
          }).catch(() => {});
        }
        
        return { success: false };
      }
    });

    const results = await Promise.all(sendPromises);
    const sentCount = results.filter((r: any) => r.success).length;

    console.log(`Push notification sent: ${sentCount}/${subscriptions.length} successful`);

    return {
      sentCount,
      totalSubscriptions: subscriptions.length,
      results
    };
  } catch (error) {
    console.error('Error sending push notifications:', error);
    return { sentCount: 0, totalSubscriptions: 0, error };
  }
}

/**
 * Event-specific notification helpers
 */

export async function notifyNewBooking(booking: any) {
  return sendPushNotification({
    title: '📅 New Booking Request',
    body: `${booking.name} requested ${booking.eventType} on ${new Date(booking.eventDate).toLocaleDateString()}`,
    url: '/admin/bookings',
    tag: 'new-booking',
    requireInteraction: true
  });
}

export async function notifyNewMessage(message: any) {
  return sendPushNotification({
    title: '💬 New Message',
    body: `${message.name}: ${message.message.substring(0, 100)}${message.message.length > 100 ? '...' : ''}`,
    url: '/admin/messages',
    tag: 'new-message',
    requireInteraction: true
  });
}

export async function notifyInvoicePaid(invoice: any) {
  return sendPushNotification({
    title: '💰 Invoice Paid',
    body: `${invoice.clientName} paid ${invoice.totalAmount} TND for ${invoice.invoiceNumber}`,
    url: '/admin/invoices',
    tag: 'invoice-paid',
    requireInteraction: false
  });
}

export async function notifyGuestUpload(gallery: any, uploaderName: string, count: number) {
  return sendPushNotification({
    title: '📸 New Guest Photos',
    body: `${uploaderName} uploaded ${count} photo${count > 1 ? 's' : ''} to ${gallery.name}`,
    url: `/admin/client-galleries/${gallery.id}/guest-uploads`,
    tag: 'guest-upload',
    requireInteraction: false
  });
}

export async function notifyPhotobookSubmitted(photobook: any, clientName: string) {
  return sendPushNotification({
    title: '📖 Photobook Submitted',
    body: `${clientName} submitted "${photobook.title}" for review`,
    url: `/admin/photobooks/${photobook.id}`,
    tag: 'photobook-submitted',
    requireInteraction: true
  });
}
