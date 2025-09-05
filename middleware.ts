import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow access to login page and API routes
  if (pathname.startsWith('/login') || pathname.startsWith('/api') || pathname.startsWith('/_next') || pathname.includes('.')) {
    return NextResponse.next()
  }

  // Check for authentication token
  const token = request.cookies.get('solar-auth-token')?.value
  const tokenExpiry = request.cookies.get('solar-auth-expiry')?.value

  // If no token, redirect to login
  if (!token || !tokenExpiry) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Check if token is expired
  const now = new Date().getTime()
  const expiry = parseInt(tokenExpiry)
  
  if (now >= expiry) {
    // Token expired, clear cookies and redirect to login
    const response = NextResponse.redirect(new URL('/login', request.url))
    response.cookies.delete('solar-auth-token')
    response.cookies.delete('solar-auth-expiry')
    return response
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}