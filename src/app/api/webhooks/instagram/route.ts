import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const VERIFY_TOKEN = process.env.INSTAGRAM_WEBHOOK_VERIFY_TOKEN || 'aminoss_instagram_webhook_2025_secure';

// Webhook verification (GET request from Facebook)
export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  console.log('Instagram webhook verification request:', { mode, token });

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('✅ Instagram webhook verified successfully');
    return new NextResponse(challenge, { status: 200 });
  }

  console.error('❌ Instagram webhook verification failed');
  return NextResponse.json({ error: 'Verification failed' }, { status: 403 });
}

// Webhook notifications (POST request from Instagram)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log('📨 Instagram webhook received:', JSON.stringify(body, null, 2));

    // Process webhook events
    if (body.object === 'instagram') {
      for (const entry of body.entry || []) {
        const changes = entry.changes || [];
        
        for (const change of changes) {
          const { field, value } = change;
          
          console.log(`📢 Instagram change detected: ${field}`, value);

          // Handle different event types
          switch (field) {
            case 'media':
              // New post published
              console.log('🆕 New Instagram post detected');
              // Trigger sync in background
              await triggerInstagramSync();
              break;
              
            case 'comments':
              // New comment on post
              console.log('💬 New Instagram comment detected');
              break;
              
            case 'mentions':
              // Account mentioned in a post
              console.log('🏷️ Instagram mention detected');
              break;
              
            default:
              console.log(`ℹ️ Unhandled Instagram event: ${field}`);
          }
        }
      }
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error('❌ Instagram webhook error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}

// Trigger Instagram sync
async function triggerInstagramSync() {
  try {
    const settings = await prisma.siteSettings.findFirst();
    
    if (!settings?.instagramAccessToken || !settings.instagramAutoSync) {
      console.log('⏭️ Auto-sync disabled or Instagram not connected');
      return;
    }

    console.log('🔄 Triggering Instagram sync...');
    
    // Call the sync API internally
    const response = await fetch(`${process.env.NEXTAUTH_URL}/api/admin/instagram/sync`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      console.log('✅ Instagram sync triggered successfully');
    } else {
      console.error('❌ Failed to trigger Instagram sync');
    }
  } catch (error) {
    console.error('❌ Error triggering Instagram sync:', error);
  }
}
