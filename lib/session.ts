import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'

export type SessionUser = {
  userId: number
  role: 'ADMIN' | 'WD2' | 'DOSEN' | 'KAPRODI' | 'DEKAN' | 'MAHASISWA'
  name: string
  email: string
}

const secret = new TextEncoder().encode(
  process.env.SESSION_SECRET ?? 'fallback-secret-key-change-in-production'
)

export async function createSession(user: SessionUser) {
  const token = await new SignJWT({ ...user })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret)

  const cookieStore = await cookies()
  cookieStore.set('session', token, {
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  })
}

export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get('session')?.value
  if (!token) return null

  try {
    const { payload } = await jwtVerify(token, secret)
    return payload as unknown as SessionUser
  } catch {
    return null
  }
}

export async function deleteSession() {
  const cookieStore = await cookies()
  cookieStore.delete('session')
}
