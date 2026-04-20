import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyToken } from '../.././lib/auth'

export function middleware(req: NextRequest) {
  const token = req.cookies.get('session')?.value

  // các route cần bảo vệ
  if (req.nextUrl.pathname.startsWith('/app')) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', req.url))
    }

    const user = verifyToken(token)

    if (!user) {
      return NextResponse.redirect(new URL('/login', req.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/app/:path*'],
}