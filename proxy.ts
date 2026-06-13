import { verifyJWT } from '@/lib/jwt'
import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value
  const { pathname } = request.nextUrl

  // 1. If trying to access dashboard paths
  if (pathname.startsWith('/dashboard')) {
    if (!token) {
      const url = request.nextUrl.clone()
      url.pathname = '/auth/login'
      return NextResponse.redirect(url)
    }

    const payload = await verifyJWT(token)
    if (!payload) {
      const response = NextResponse.redirect(new URL('/auth/login', request.url))
      response.cookies.delete('auth_token')
      return response
    }

    // 2. Role-based access control
    const role = payload.role

    // Manager-only routes
    const managerRoutes = [
      '/dashboard/payments',
      '/dashboard/expenses',
      '/dashboard/clients',
    ]

    // Designer-only routes
    const designerRoutes: string[] = []

    const isManagerRoute = managerRoutes.some(route => pathname.startsWith(route))
    const isDesignerRoute = designerRoutes.some(route => pathname.startsWith(route))

    if (isManagerRoute && role !== 'manager') {
      return NextResponse.redirect(new URL('/dashboard/access-denied', request.url))
    }

    if (isDesignerRoute && role !== 'designer') {
      return NextResponse.redirect(new URL('/dashboard/access-denied', request.url))
    }
  }

  // 3. If logged in, prevent accessing auth pages
  if (pathname.startsWith('/auth/login') || pathname.startsWith('/auth/sign-up')) {
    if (token) {
      const payload = await verifyJWT(token)
      if (payload) {
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/auth/login',
    '/auth/sign-up',
  ],
}
