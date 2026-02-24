import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
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
          request.cookies.set({ name, value, ...options })
          response = NextResponse.next({
            request: { headers: request.headers },
          })
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: '', ...options })
          response = NextResponse.next({
            request: { headers: request.headers },
          })
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  // Refresh session if exists
  const { data: { user } } = await supabase.auth.getUser()

  // TODO: Fix session persistence before re-enabling middleware protection
  // For now, let the client-side auth checks handle protection
  
  // NOTE: Disabled dashboard/guide route protection in middleware
  // The client-side dashboard page will handle its own auth checks
  // This was causing 307 redirects to /login before session could load
  
  // Old code (disabled):
  // if (request.nextUrl.pathname.startsWith('/dashboard') && !user) {
  //   return NextResponse.redirect(new URL('/login', request.url))
  // }
  // if (request.nextUrl.pathname.startsWith('/guide/') && 
  //     request.nextUrl.pathname.includes('/edit') && !user) {
  //   return NextResponse.redirect(new URL('/login', request.url))
  // }

  return response
}
