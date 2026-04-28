import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'
import { generateNomorSurat } from '@/lib/nomorSurat'
import { NextResponse } from 'next/server'

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const bookingId = Number(id)
  const body = await req.json()
  const { action, catatanWD2 } = body

  // ── WD2 ───────────────────────────────────────────────────────────────
  if (session.role === 'WD2') {
    const booking = await prisma.booking.findUnique({ where: { id: bookingId } })
    if (!booking) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    if (booking.status !== 'PENDING') {
      return NextResponse.json({ error: 'Booking harus berstatus PENDING' }, { status: 400 })
    }

    if (action === 'acc') {
      const nomorSurat = await generateNomorSurat(
        booking.prodi,
        booking.jenisKegiatan,
        booking.namaLab,
      )
      const updated = await prisma.booking.update({
        where: { id: bookingId },
        data: {
          status: 'WD2_ACC',
          nomorSurat,
          tanggalSurat: new Date(),
          catatanWD2: catatanWD2 ?? null,
          isTTE: true,
        },
      })
      return NextResponse.json(updated)
    }

    if (action === 'reject') {
      await prisma.booking.update({
        where: { id: bookingId },
        data: { status: 'REJECTED', catatanWD2: catatanWD2 ?? null },
      })
      return NextResponse.json({ ok: true })
    }

    return NextResponse.json({ error: 'Action tidak valid' }, { status: 400 })
  }

  // ── ADMIN ─────────────────────────────────────────────────────────────
  if (session.role === 'ADMIN') {
    const booking = await prisma.booking.findUnique({ where: { id: bookingId } })
    if (!booking) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    if (action === 'approve') {
      if (booking.status !== 'WD2_ACC') {
        return NextResponse.json(
          { error: 'Booking belum mendapat persetujuan Wakil Dekan 2' },
          { status: 400 }
        )
      }

      const targetWeeks = Array.from(
        { length: booking.mingguSelesai - booking.mingguMulai + 1 },
        (_, i) => booking.mingguMulai + i
      )

      const conflict = await prisma.booking.findFirst({
        where: {
          id: { not: bookingId },
          status: 'APPROVED',
          hari: booking.hari,
          AND: [
            { jamMulai: { lt: booking.jamSelesai } },
            { jamSelesai: { gt: booking.jamMulai } },
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
            error: `Jadwal bentrok dengan booking yang sudah disetujui (${conflict.mataKuliah}, ${new Date(conflict.jamMulai).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}–${new Date(conflict.jamSelesai).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}, hari ${conflict.hari})`,
          },
          { status: 409 }
        )
      }

      await prisma.booking.update({ where: { id: bookingId }, data: { status: 'APPROVED' } })
      return NextResponse.json({ ok: true })
    }

    if (action === 'reject') {
      if (booking.status !== 'WD2_ACC') {
        return NextResponse.json(
          { error: 'Booking belum mendapat persetujuan Wakil Dekan 2' },
          { status: 400 }
        )
      }
      await prisma.booking.update({ where: { id: bookingId }, data: { status: 'REJECTED' } })
      return NextResponse.json({ ok: true })
    }

    return NextResponse.json({ error: 'Action tidak valid' }, { status: 400 })
  }

  return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const bookingId = Number(id)

  const booking = await prisma.booking.findUnique({ where: { id: bookingId } })
  if (!booking) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (booking.userId !== session.userId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  if (booking.status !== 'PENDING') {
    return NextResponse.json(
      { error: 'Hanya booking dengan status Menunggu yang bisa dibatalkan' },
      { status: 400 }
    )
  }

  await prisma.booking.delete({ where: { id: bookingId } })
  return NextResponse.json({ ok: true })
}
