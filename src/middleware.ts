import { NextRequest } from 'next/server';

// This is a simplified middleware for Cloudflare Pages
export async function middleware(request: NextRequest) {
  // You can implement authentication checks, redirects, etc. here
  return;
}

export const config = {
  matcher: [
    // Apply middleware to all routes except static files and api routes
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
