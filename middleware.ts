import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

function logDebug(message: string, request: NextRequest) {
  console.log(`[Middleware] ${message} - Path: ${request.nextUrl.pathname}`)
}

export async function middleware(request: NextRequest) {
  logDebug('Starting middleware check', request)

  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  const { data: { session } } = await supabase.auth.getSession()
  logDebug(`Session status: ${session ? 'Authenticated' : 'Not authenticated'}`, request)

  // Auth routes - redirect to dashboard if already logged in
  if (request.nextUrl.pathname.startsWith('/login') || 
      request.nextUrl.pathname.startsWith('/signup') ||
      request.nextUrl.pathname === '/') {
    if (session) {
      logDebug('Authenticated user accessing auth route, redirecting to /chat', request)
      return NextResponse.redirect(new URL('/chat', request.url))
    }
    logDebug('Unauthenticated user accessing auth route, allowing access', request)
    return response
  }

  // Protected routes - redirect to login if not authenticated
  if (request.nextUrl.pathname.startsWith('/chat') ||
      request.nextUrl.pathname.startsWith('/birth-chart')) {
    if (!session) {
      logDebug('Unauthenticated user accessing protected route, redirecting to /login', request)
      return NextResponse.redirect(new URL('/login', request.url))
    }
    logDebug('Authenticated user accessing protected route, allowing access', request)
    return response
  }

  // Public routes - allow access
  if (request.nextUrl.pathname.startsWith('/auth') ||
      request.nextUrl.pathname.startsWith('/forgot-password') ||
      request.nextUrl.pathname.startsWith('/reset-password')) {
    logDebug('User accessing public route, allowing access', request)
    return response
  }

  logDebug('Default response', request)
  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
