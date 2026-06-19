/**
 * Next.js Middleware - Route Protection
 * 
 * Protects all /admin routes except /admin/login
 * - If no token and not on login page → redirect to /admin/login
 * - If token exists and on login page → redirect to /admin/dashboard
 * 
 * This runs on Edge Runtime for optimal performance
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const TOKEN_COOKIE_NAME = 'access_token';
const LOGIN_PATH = '/admin/login';
const DASHBOARD_PATH = '/admin/dashboard';

/**
 * Middleware function to protect admin routes
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Get access token from cookies
  const token = request.cookies.get(TOKEN_COOKIE_NAME)?.value;
  
  // Check if user is authenticated
  const isAuthenticated = !!token;
  
  // Check if current path is the login page
  const isLoginPage = pathname === LOGIN_PATH;
  
  // Check if trying to access protected admin routes
  const isAdminRoute = pathname.startsWith('/admin');

  // CASE 1: User has token and is on login page
  // → Redirect to dashboard (already logged in)
  if (isAuthenticated && isLoginPage) {
    const dashboardUrl = new URL(DASHBOARD_PATH, request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  // CASE 2: User has NO token and is on a protected admin route (not login)
  // → Redirect to login page
  if (!isAuthenticated && isAdminRoute && !isLoginPage) {
    const loginUrl = new URL(LOGIN_PATH, request.url);
    // Preserve the original URL as a redirect parameter (optional)
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // CASE 3: All other cases - allow request to proceed
  return NextResponse.next();
}

/**
 * Configure which routes this middleware should run on
 * 
 * Matches:
 * - /admin
 * - /admin/dashboard
 * - /admin/posts
 * - /admin/users
 * - etc.
 */
export const config = {
  matcher: [
    '/admin/:path*',
  ],
};
