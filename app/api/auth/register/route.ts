import { prisma } from '@/lib/prisma'
import bcrypt from 'bcrypt'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const body = await req.json()
  const { name, email, password, prodi, nip, noHp } = body

  if (!name || name.trim().length < 3) {
    return NextResponse.json({ error: 'Nama minimal 3 karakter' }, { status: 400 })
  }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Format email tidak valid' }, { status: 400 })
  }

  if (!password || password.length < 6) {
    return NextResponse.json({ error: 'Password minimal 6 karakter' }, { status: 400 })
  }

  if (!prodi || prodi.trim().length === 0) {
    return NextResponse.json({ error: 'Program Studi wajib diisi' }, { status: 400 })
  }

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    return NextResponse.json({ error: 'Email sudah terdaftar' }, { status: 400 })
  }

  const hashed = await bcrypt.hash(password, 10)

  await prisma.user.create({
    data: {
      name: name.trim(),
      email,
      password: hashed,
      role: 'DOSEN',
      prodi: prodi.trim(),
      nip: nip?.trim() || null,
      noHp: noHp?.trim() || null,
      isApproved: false,
      isActive: true,
    },
  })

  return NextResponse.json(
    { message: 'Registrasi berhasil, menunggu persetujuan admin' },
    { status: 201 }
  )
}
