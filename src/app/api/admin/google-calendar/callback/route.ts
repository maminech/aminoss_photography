import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/admin/google-calendar/callback
 * Handle Google OAuth callback
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    if (error) {
      // Redirect to calendar integration page with error
      return NextResponse.redirect(
        new URL('/admin/dashboard/calendar-integration?error=access_denied', req.url)
      );
    }

    if (!code) {
      return NextResponse.redirect(
        new URL('/admin/dashboard/calendar-integration?error=no_code', req.url)
      );
    }

    // Exchange code for tokens
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = process.env.GOOGLE_REDIRECT_URI;

    if (!clientId || !clientSecret || !redirectUri) {
      return NextResponse.redirect(
        new URL('/admin/dashboard/calendar-integration?error=not_configured', req.url)
      );
    }

    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenResponse.ok) {
      return NextResponse.redirect(
        new URL('/admin/dashboard/calendar-integration?error=token_exchange_failed', req.url)
      );
    }

    const tokens = await tokenResponse.json();

    // Get user info
    const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${tokens.access_token}`,
      },
    });

    const userInfo = await userInfoResponse.json();

    // Store tokens in database
    const settings = await prisma.siteSettings.findFirst();
    
    if (settings) {
      await prisma.siteSettings.update({
        where: { id: settings.id },
        data: {
          googleCalendarAccessToken: tokens.access_token,
          googleCalendarRefreshToken: tokens.refresh_token,
          googleCalendarEmail: userInfo.email,
          googleCalendarLastSync: new Date(),
        },
      });
    } else {
      await prisma.siteSettings.create({
        data: {
          googleCalendarAccessToken: tokens.access_token,
          googleCalendarRefreshToken: tokens.refresh_token,
          googleCalendarEmail: userInfo.email,
          googleCalendarLastSync: new Date(),
          aboutContent: '',
        },
      });
    }

    // Redirect to calendar integration page with success
    return NextResponse.redirect(
      new URL('/admin/dashboard/calendar-integration?success=connected', req.url)
    );
  } catch (error: any) {
    console.error('Error in Google Calendar callback:', error);
    return NextResponse.redirect(
      new URL('/admin/dashboard/calendar-integration?error=unknown', req.url)
    );
  }
}
