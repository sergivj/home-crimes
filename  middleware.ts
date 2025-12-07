import { NextRequest, NextResponse } from 'next/server';
import { defaultLocale } from './src/i18n/config';

export function middleware(request: NextRequest) {
  // Get locale from cookie or use default
  const locale = request.cookies.get('NEXT_LOCALE')?.value || defaultLocale;
  
  // Add locale to response headers for next-intl
  const response = NextResponse.next();
  response.headers.set('x-locale', locale);
  
  return response;
}

export const config = {
  matcher: [
    // Match all pathnames except for
    // - api routes
    // - _next (Next.js internals)
    // - static files
    '/((?!api|_next|.*\\..*).*)',
  ],
};
