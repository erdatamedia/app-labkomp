import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'
import { writeFile, mkdir } from 'fs/promises'
import { NextResponse } from 'next/server'
import path from 'path'

const MAX_SIZE = 2 * 1024 * 1024 // 2 MB
const ALLOWED_TYPES = ['image/png', 'image/jpeg']

export async function POST(req: Request) {
  const session = await getSession()
  if (!session || session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const formData = await req.formData()
  const file = formData.get('logo')

  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'Field "logo" wajib diisi' }, { status: 400 })
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: 'Tipe file harus PNG atau JPEG' }, { status: 400 })
  }

  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: 'Ukuran file maksimal 2MB' }, { status: 400 })
  }

  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)

  const uploadDir = path.join(process.cwd(), 'public/uploads')
  await mkdir(uploadDir, { recursive: true })
  await writeFile(path.join(uploadDir, 'logo.png'), buffer)

  const logoUrl = `/uploads/logo.png?v=${Date.now()}`
  await prisma.appSettings.upsert({
    where: { id: 'singleton' },
    update: { logoUrl },
    create: { id: 'singleton', logoUrl },
  })

  return NextResponse.json({ logoUrl })
}
