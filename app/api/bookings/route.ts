import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const mine       = searchParams.get('mine') === 'true'
  const status     = searchParams.get('status')
  const approved   = searchParams.get('approved') === 'true'
  const pendingWD2 = searchParams.get('pending_wd2') === 'true'

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {}
  if (mine)         where.userId = session.userId
  if (pendingWD2)   where.status = 'PENDING'
  else if (approved) where.status = 'APPROVED'
  else if (status)   where.status = status

  const bookings = await prisma.booking.findMany({
    where,
    include: { user: { select: { name: true } } },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(bookings)
}

export async function POST(req: Request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const {
    mataKuliah,
    prodi,
    hari,
    jamMulai,
    jamSelesai,
    software,
    jumlahMahasiswa,
    mingguMulai,
    recurring,
    totalMinggu,
  } = body

  const jamMulaiDate = new Date(`1970-01-01T${jamMulai}:00`)
  const jamSelesaiDate = new Date(`1970-01-01T${jamSelesai}:00`)
  const startWeek = Number(mingguMulai) || 1

  if (recurring) {
    const count = Math.max(1, Number(totalMinggu) || 1)
    const targetWeeks = Array.from({ length: count }, (_, i) => startWeek + i)

    const conflict = await prisma.booking.findFirst({
      where: {
        status: 'APPROVED',
        hari,
        AND: [
          { jamMulai: { lt: jamSelesaiDate } },
          { jamSelesai: { gt: jamMulaiDate } },
          {
            OR: targetWeeks.map((w) => ({
              AND: [{ mingguMulai: { lte: w } }, { mingguSelesai: { gte: w } }],
            })),
          },
        ],
      },
    })

    if (conflict) {
      return NextResponse.json(
        {
          error: `Jadwal bentrok pada hari ${conflict.hari}, ${new Date(conflict.jamMulai).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}–${new Date(conflict.jamSelesai).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} dengan booking "${conflict.mataKuliah}"`,
        },
        { status: 409 }
      )
    }

    await prisma.booking.createMany({
      data: targetWeeks.map((w) => ({
        userId: session.userId,
        mataKuliah,
        prodi: prodi ?? '',
        hari,
        jamMulai: jamMulaiDate,
        jamSelesai: jamSelesaiDate,
        mingguMulai: w,
        mingguSelesai: w,
        software,
        jumlahMahasiswa: jumlahMahasiswa ? Number(jumlahMahasiswa) : null,
        status: 'PENDING' as const,
      })),
    })

    return NextResponse.json({ ok: true, count: targetWeeks.length })
  }

  const conflict = await prisma.booking.findFirst({
    where: {
      status: 'APPROVED',
      hari,
      mingguMulai: { lte: startWeek },
      mingguSelesai: { gte: startWeek },
      AND: [
        { jamMulai: { lt: jamSelesaiDate } },
        { jamSelesai: { gt: jamMulaiDate } },
      ],
    },
  })

  if (conflict) {
    return NextResponse.json(
      {
        error: `Jadwal bentrok dengan booking yang sudah disetujui (${conflict.mataKuliah}, ${new Date(conflict.jamMulai).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}–${new Date(conflict.jamSelesai).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })})`,
      },
      { status: 409 }
    )
  }

  const booking = await prisma.booking.create({
    data: {
      userId: session.userId,
      mataKuliah,
      prodi: prodi ?? '',
      hari,
      jamMulai: jamMulaiDate,
      jamSelesai: jamSelesaiDate,
      mingguMulai: startWeek,
      mingguSelesai: startWeek,
      software,
      jumlahMahasiswa: jumlahMahasiswa ? Number(jumlahMahasiswa) : null,
      status: 'PENDING',
    },
  })

  return NextResponse.json(booking)
}
