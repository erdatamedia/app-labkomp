import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

const secret = new TextEncoder().encode(
  process.env.SESSION_SECRET ?? 'fallback-secret-key-change-in-production'
)

async function getSessionFromRequest(req: NextRequest) {
  const token = req.cookies.get('session')?.value
  if (!token) return null
  try {
    const { payload } = await jwtVerify(token, secret)
    return payload as { userId: number; role: string; name: string; email: string }
  } catch {
    return null
  }
}

function roleHome(role: string): string {
  if (role === 'ADMIN') return '/admin'
  if (role === 'WD2')   return '/wd2'
  if (role === 'DOSEN') return '/dosen'
  return '/'
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  const session = await getSessionFromRequest(req)

  if (pathname.startsWith('/login') || pathname.startsWith('/register')) {
    if (session) return NextResponse.redirect(new URL(roleHome(session.role), req.url))
    return NextResponse.next()
  }

  if (pathname.startsWith('/wd2')) {
    if (!session) return NextResponse.redirect(new URL(`/login?from=${pathname}`, req.url))
    if (session.role !== 'WD2') return NextResponse.redirect(new URL('/', req.url))
    return NextResponse.next()
  }

  if (pathname.startsWith('/admin')) {
    if (!session) return NextResponse.redirect(new URL(`/login?from=${pathname}`, req.url))
    if (session.role !== 'ADMIN') return NextResponse.redirect(new URL('/', req.url))
    return NextResponse.next()
  }

  if (pathname.startsWith('/profile')) {
    if (!session) return NextResponse.redirect(new URL(`/login?from=${pathname}`, req.url))
    return NextResponse.next()
  }

  if (pathname.startsWith('/dosen')) {
    if (!session) return NextResponse.redirect(new URL(`/login?from=${pathname}`, req.url))
    if (session.role !== 'DOSEN') return NextResponse.redirect(new URL('/', req.url))
    return NextResponse.next()
  }

  if (pathname.startsWith('/booking')) {
    if (!session) return NextResponse.redirect(new URL(`/login?from=${pathname}`, req.url))
    if (session.role !== 'DOSEN') return NextResponse.redirect(new URL('/', req.url))
    return NextResponse.next()
  }

  // /schedule is public — no auth required

  return NextResponse.next()
}

export const config = {
  matcher: ['/login', '/register', '/profile/:path*', '/profile', '/wd2/:path*', '/booking/:path*', '/dosen/:path*', '/admin/:path*'],
}
