import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'
import bcrypt from 'bcrypt'
import { NextResponse } from 'next/server'

const PROFILE_SELECT = {
  id: true,
  name: true,
  email: true,
  role: true,
  nip: true,
  prodi: true,
  jabatan: true,
  noHp: true,
  avatarUrl: true,
}

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await prisma.user.findUnique({ where: { id: session.userId }, select: PROFILE_SELECT })
  if (!user) return NextResponse.json({ error: 'User tidak ditemukan' }, { status: 404 })

  return NextResponse.json(user)
}

export async function PATCH(req: Request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data: any = {}
  if (body.name    !== undefined) data.name    = body.name
  if (body.nip     !== undefined) data.nip     = body.nip
  if (body.noHp    !== undefined) data.noHp    = body.noHp
  if (body.prodi   !== undefined) data.prodi   = body.prodi
  if (body.jabatan !== undefined) data.jabatan = body.jabatan

  if (body.oldPassword !== undefined || body.newPassword !== undefined) {
    if (!body.oldPassword || !body.newPassword) {
      return NextResponse.json({ error: 'Password lama dan baru wajib diisi' }, { status: 400 })
    }
    if (body.newPassword.length < 6) {
      return NextResponse.json({ error: 'Password baru minimal 6 karakter' }, { status: 400 })
    }
    const currentUser = await prisma.user.findUnique({ where: { id: session.userId } })
    if (!currentUser) return NextResponse.json({ error: 'User tidak ditemukan' }, { status: 404 })

    const valid = await bcrypt.compare(body.oldPassword, currentUser.password)
    if (!valid) return NextResponse.json({ error: 'Password lama tidak sesuai' }, { status: 400 })

    data.password = await bcrypt.hash(body.newPassword, 10)
  }

  const user = await prisma.user.update({ where: { id: session.userId }, data, select: PROFILE_SELECT })
  return NextResponse.json(user)
}
