import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';
import { getToken } from 'next-auth/jwt';

const JWT_SECRET = new TextEncoder().encode(
  process.env.NEXTAUTH_SECRET || 'your-secret-key'
);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  console.log('=== MIDDLEWARE ===');
  console.log('Path:', pathname);
  console.log('Cookies:', request.cookies.getAll().map(c => c.name).join(', '));

  // Admin routes protection
  if (pathname.startsWith('/admin/dashboard')) {
    try {
      const token = await getToken({
        req: request,
        secret: process.env.NEXTAUTH_SECRET,
      });

      console.log('Token for /admin/dashboard:', token ? JSON.stringify({ email: token.email, role: (token as any).role }) : 'NOT FOUND');

      if (!token) {
        console.log('No token - redirecting to login');
        const url = new URL('/admin/login', request.url);
        url.searchParams.set('callbackUrl', pathname);
        return NextResponse.redirect(url);
      }
      
      console.log('Token valid - allowing access');
    } catch (error) {
      console.error('Middleware error checking token:', error);
      const url = new URL('/admin/login', request.url);
      url.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(url);
    }
  }

  // Client routes protection
  if (pathname.startsWith('/client/dashboard') || pathname.startsWith('/client/gallery')) {
    const clientToken = request.cookies.get('client-token')?.value;

    if (!clientToken) {
      const url = new URL('/client/login', request.url);
      url.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(url);
    }

    try {
      // Verify token is valid
      await jwtVerify(clientToken, JWT_SECRET);
    } catch (error) {
      // Token invalid or expired
      const url = new URL('/client/login', request.url);
      url.searchParams.set('callbackUrl', pathname);
      url.searchParams.set('expired', 'true');
      
      const response = NextResponse.redirect(url);
      response.cookies.delete('client-token');
      return response;
    }
  }

  // Redirect logged-in users away from login pages
  if (pathname === '/admin/login') {
    try {
      const token = await getToken({
        req: request,
        secret: process.env.NEXTAUTH_SECRET,
      });

      console.log('Checking /admin/login - token:', token ? 'FOUND' : 'NOT FOUND');

      if (token) {
        console.log('User already logged in - redirecting to dashboard');
        return NextResponse.redirect(new URL('/admin/dashboard', request.url));
      }
    } catch (error) {
      console.error('Error checking login page token:', error);
    }
  }

  if (pathname === '/client/login') {
    const clientToken = request.cookies.get('client-token')?.value;

    if (clientToken) {
      try {
        await jwtVerify(clientToken, JWT_SECRET);
        return NextResponse.redirect(new URL('/client/dashboard', request.url));
      } catch {
        // Token invalid, allow login page
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/dashboard/:path*',
    '/admin/login',
    '/client/dashboard/:path*',
    '/client/gallery/:path*',
    '/client/login',
  ],
};
