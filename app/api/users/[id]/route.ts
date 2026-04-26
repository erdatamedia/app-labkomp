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
  avatarUrl: true,
  isActive: true,
  createdAt: true,
}

type Params = { params: Promise<{ id: string }> }

export async function GET(_req: Request, { params }: Params) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const userId = Number(id)

  if (session.role !== 'ADMIN' && session.userId !== userId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const user = await prisma.user.findUnique({ where: { id: userId }, select: USER_SELECT })
  if (!user) return NextResponse.json({ error: 'User tidak ditemukan' }, { status: 404 })

  return NextResponse.json(user)
}

export async function PATCH(req: Request, { params }: Params) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const userId = Number(id)

  const isSelf = session.userId === userId
  const isAdmin = session.role === 'ADMIN'

  if (!isAdmin && !isSelf) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await req.json()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data: any = {}

  if (isAdmin) {
    if (body.name     !== undefined) data.name     = body.name
    if (body.email    !== undefined) data.email    = body.email
    if (body.role     !== undefined) data.role     = body.role
    if (body.nip      !== undefined) data.nip      = body.nip
    if (body.prodi    !== undefined) data.prodi    = body.prodi
    if (body.jabatan  !== undefined) data.jabatan  = body.jabatan
    if (body.noHp     !== undefined) data.noHp     = body.noHp
    if (body.isActive !== undefined) data.isActive = body.isActive
  } else {
    if (body.name !== undefined)    data.name = body.name
    if (body.nip !== undefined)     data.nip = body.nip
    if (body.prodi !== undefined)   data.prodi = body.prodi
    if (body.jabatan !== undefined) data.jabatan = body.jabatan
    if (body.noHp !== undefined)    data.noHp = body.noHp
  }

  if (body.newPassword !== undefined) {
    if (body.newPassword.length < 6) {
      return NextResponse.json({ error: 'Password minimal 6 karakter' }, { status: 400 })
    }
    data.password = await bcrypt.hash(body.newPassword, 10)
  }

  const user = await prisma.user.update({ where: { id: userId }, data, select: USER_SELECT })
  return NextResponse.json(user)
}

export async function DELETE(_req: Request, { params }: Params) {
  const session = await getSession()
  if (!session || session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id } = await params
  const userId = Number(id)

  if (session.userId === userId) {
    return NextResponse.json({ error: 'Tidak bisa menonaktifkan akun sendiri' }, { status: 400 })
  }

  const activeBookings = await prisma.booking.count({
    where: { userId, status: { in: ['PENDING', 'WD2_ACC'] } },
  })

  if (activeBookings > 0) {
    return NextResponse.json(
      { error: 'User masih memiliki booking yang sedang diproses' },
      { status: 400 }
    )
  }

  await prisma.user.update({ where: { id: userId }, data: { isActive: false } })
  return NextResponse.json({ message: 'Pengguna dinonaktifkan' })
}
