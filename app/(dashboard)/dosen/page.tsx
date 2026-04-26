import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'
import Link from 'next/link'
import DosenBookings from './DosenBookings'
import type { SerializedBooking } from './DosenBookings'

function getGreeting() {
  const h = new Date().getHours()
  if (h < 11) return 'pagi'
  if (h < 15) return 'siang'
  return 'sore'
}

export default async function DosenPage() {
  const session = await getSession()
  if (!session) return null

  const bookings = await prisma.booking.findMany({
    where: { userId: session.userId },
    orderBy: { createdAt: 'desc' },
  })

  const pendingCount = bookings.filter((b) => b.status === 'PENDING').length

  const serialized: SerializedBooking[] = bookings.map((b) => ({
    id:             b.id,
    mataKuliah:     b.mataKuliah,
    prodi:          b.prodi,
    hari:           b.hari,
    jamMulai:       b.jamMulai.toISOString(),
    jamSelesai:     b.jamSelesai.toISOString(),
    mingguMulai:    b.mingguMulai,
    mingguSelesai:  b.mingguSelesai,
    software:       b.software,
    jumlahMahasiswa: b.jumlahMahasiswa,
    status:         b.status as 'PENDING' | 'APPROVED' | 'REJECTED',
    createdAt:      b.createdAt.toISOString(),
  }))

  return (
    <div className="animate-fade-up" style={{ maxWidth: '800px', margin: '0 auto', padding: '32px' }}>

      {/* ── Header ──────────────────────────────────────────────── */}
      <div style={{
        display: 'flex', alignItems: 'flex-start',
        justifyContent: 'space-between', gap: '16px',
        marginBottom: '24px',
      }}>
        <div>
          <h1 style={{
            fontSize: '22px', fontWeight: 700, letterSpacing: '-0.02em',
            color: 'var(--c-text)', margin: '0 0 4px',
          }}>
            Selamat {getGreeting()}, {session.name}! 👋
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--c-text3)', margin: 0 }}>
            {pendingCount > 0
              ? `Kamu punya ${pendingCount} booking menunggu persetujuan`
              : 'Semua booking sudah diproses'}
          </p>
        </div>

        <Link
          href="/booking"
          className="btn-primary-sm"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            background: 'var(--c-blue)', color: '#fff',
            borderRadius: '9px', padding: '9px 18px',
            fontSize: '13px', fontWeight: 500,
            textDecoration: 'none', flexShrink: 0, whiteSpace: 'nowrap',
          }}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          Buat Booking
        </Link>
      </div>

      {/* ── Booking list (client) ────────────────────────────────── */}
      <DosenBookings bookings={serialized} />
    </div>
  )
}
