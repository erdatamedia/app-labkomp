import { prisma } from '@/lib/prisma'
import { createSession } from '@/lib/session'
import bcrypt from 'bcrypt'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const { email, password } = await req.json()

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) {
    return NextResponse.json({ error: 'Email atau password salah' }, { status: 401 })
  }

  const valid = await bcrypt.compare(password, user.password)
  if (!valid) {
    return NextResponse.json({ error: 'Email atau password salah' }, { status: 401 })
  }

  if (!user.isApproved) {
    return NextResponse.json(
      { error: 'Akun Anda belum disetujui admin. Silakan tunggu konfirmasi.' },
      { status: 403 }
    )
  }

  await createSession({
    userId: user.id,
    role: user.role,
    name: user.name,
    email: user.email,
  })

  return NextResponse.json({ role: user.role, name: user.name })
}
