import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'
import bcrypt from 'bcrypt'
import { NextResponse } from 'next/server'

const USER_SELECT = {
  id: true,
  name: true,
  email: true,
  role: true,
  nip: true,
  prodi: true,
  jabatan: true,
  noHp: true,
  isActive: true,
  createdAt: true,
}

const ALLOWED_ROLES = ['ADMIN', 'DOSEN', 'WD2'] as const

export async function GET(req: Request) {
  const session = await getSession()
  if (!session || session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { searchParams } = new URL(req.url)
  const role = searchParams.get('role')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {}
  if (role) where.role = role

  const users = await prisma.user.findMany({ where, select: USER_SELECT, orderBy: { createdAt: 'desc' } })
  return NextResponse.json(users)
}

export async function POST(req: Request) {
  const session = await getSession()
  if (!session || session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await req.json()
  const { name, email, password, role, nip, prodi, jabatan, noHp } = body

  if (!ALLOWED_ROLES.includes(role)) {
    return NextResponse.json({ error: 'Role harus ADMIN, DOSEN, atau WD2' }, { status: 400 })
  }

  if (!password || password.length < 6) {
    return NextResponse.json({ error: 'Password minimal 6 karakter' }, { status: 400 })
  }

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    return NextResponse.json({ error: 'Email sudah terdaftar' }, { status: 409 })
  }

  const hashed = await bcrypt.hash(password, 10)
  const user = await prisma.user.create({
    data: { name, email, password: hashed, role, nip, prodi, jabatan, noHp },
    select: USER_SELECT,
  })

  return NextResponse.json(user, { status: 201 })
}
