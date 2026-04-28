import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'
import { NextResponse } from 'next/server'

const DEFAULT_SETTINGS = {
  namaInstansi: 'Universitas',
  namaFakultas: 'Fakultas Teknik',
  namaJurusan: 'Teknik Informatika',
  logoUrl: null,
  alamat: null,
  namaKepalaLab: null,
  nipKepalaLab: null,
  jabatanKepalaLab: 'Kepala Laboratorium Komputer',
}

export async function GET() {
  const settings = await prisma.appSettings.findUnique({ where: { id: 'singleton' } })
  if (!settings) return NextResponse.json(DEFAULT_SETTINGS)

  const {
    namaInstansi, namaFakultas, namaJurusan, logoUrl, alamat,
    namaKepalaLab, nipKepalaLab, jabatanKepalaLab,
  } = settings
  return NextResponse.json({
    namaInstansi, namaFakultas, namaJurusan, logoUrl, alamat,
    namaKepalaLab, nipKepalaLab, jabatanKepalaLab,
  })
}

export async function PATCH(req: Request) {
  const session = await getSession()
  if (!session || session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await req.json()
  const {
    namaInstansi, namaFakultas, namaJurusan, alamat,
    namaKepalaLab, nipKepalaLab, jabatanKepalaLab,
  } = body

  const settings = await prisma.appSettings.upsert({
    where: { id: 'singleton' },
    update: {
      namaInstansi, namaFakultas, namaJurusan, alamat,
      namaKepalaLab, nipKepalaLab, jabatanKepalaLab,
    },
    create: {
      id: 'singleton',
      namaInstansi: namaInstansi ?? DEFAULT_SETTINGS.namaInstansi,
      namaFakultas: namaFakultas ?? DEFAULT_SETTINGS.namaFakultas,
      namaJurusan: namaJurusan ?? DEFAULT_SETTINGS.namaJurusan,
      alamat,
      namaKepalaLab,
      nipKepalaLab,
      jabatanKepalaLab,
    },
  })

  const {
    namaInstansi: ni, namaFakultas: nf, namaJurusan: nj, logoUrl, alamat: al,
    namaKepalaLab: nkl, nipKepalaLab: nipkl, jabatanKepalaLab: jkl,
  } = settings
  return NextResponse.json({
    namaInstansi: ni, namaFakultas: nf, namaJurusan: nj, logoUrl, alamat: al,
    namaKepalaLab: nkl, nipKepalaLab: nipkl, jabatanKepalaLab: jkl,
  })
}
