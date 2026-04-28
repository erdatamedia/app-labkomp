import type { Booking } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'
import StatusBadge from '@/app/components/StatusBadge'
import AdminActions from './AdminActions'
import AdminFilters from './AdminFilters'

function formatTime(d: Date) {
  return new Date(d).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
}

const thStyle: React.CSSProperties = {
  fontSize: '10px', fontWeight: 600, textTransform: 'uppercase',
  letterSpacing: '0.06em', color: 'var(--c-text3)',
  padding: '10px 20px', background: '#FAFBFC',
  borderBottom: '1px solid #F1F5F9', textAlign: 'left',
  whiteSpace: 'nowrap',
}

const tdStyle: React.CSSProperties = {
  fontSize: '12px', color: 'var(--c-text2)',
  padding: '12px 20px', borderBottom: '1px solid #F8FAFC',
}

const cardStyle: React.CSSProperties = {
  background: '#fff',
  border: '1px solid var(--c-border)',
  borderRadius: '12px',
  overflow: 'hidden',
}

const cardHeaderStyle: React.CSSProperties = {
  padding: '14px 20px',
  borderBottom: '1px solid var(--c-border)',
  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
}

type PageProps = {
  searchParams: Promise<{ hari?: string; minggu?: string }>
}

export default async function AdminPage({ searchParams }: PageProps) {
  const session = await getSession()
  if (!session || session.role !== 'ADMIN') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '64px 32px' }}>
        <div style={{ ...cardStyle, padding: '40px', textAlign: 'center', maxWidth: '320px' }}>
          <p style={{ fontWeight: 600, color: 'var(--c-text)', marginBottom: '6px' }}>Akses Ditolak</p>
          <p style={{ fontSize: '13px', color: 'var(--c-text3)', margin: 0 }}>Halaman ini hanya untuk administrator</p>
        </div>
      </div>
    )
  }

  const { hari: filterHari = '', minggu: filterMinggu = '' } = await searchParams

  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)

  const [totalCount, pendingCount, wd2AccCount, approvedThisMonth, wd2Acc, allApproved] = await Promise.all([
    prisma.booking.count(),
    prisma.booking.count({ where: { status: 'PENDING' } }),
    prisma.booking.count({ where: { status: 'WD2_ACC' } }),
    prisma.booking.count({ where: { status: 'APPROVED', createdAt: { gte: startOfMonth } } }),
    prisma.booking.findMany({
      where: { status: 'WD2_ACC' },
      include: { user: true },
      orderBy: { createdAt: 'asc' },
    }),
    prisma.booking.findMany({
      where: { status: 'APPROVED' },
      include: { user: true },
      orderBy: [{ mingguMulai: 'asc' }, { hari: 'asc' }, { jamMulai: 'asc' }],
    }),
  ])

  const approved = (allApproved as Booking[]).filter((b) => {
    if (filterHari   && b.hari !== filterHari) return false
    if (filterMinggu && b.mingguMulai !== Number(filterMinggu)) return false
    return true
  })

  const availableWeeks = [...new Set(allApproved.map((b) => b.mingguMulai))].sort((a, b) => a - b)

  const today = new Date().toLocaleDateString('id-ID', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })

  const statCards = [
    {
      label: 'Total Booking',
      value: totalCount,
      valueColor: 'var(--c-text)',
      dot: 'var(--c-green)',
      sub: 'semua status',
      delay: 'delay-1',
    },
    {
      label: 'Menunggu dari WD2',
      value: pendingCount,
      valueColor: 'var(--c-amber)',
      dot: 'var(--c-amber)',
      sub: 'belum di-ACC WD2',
      delay: 'delay-2',
    },
    {
      label: 'Siap Diproses',
      value: wd2AccCount,
      valueColor: 'var(--c-blue)',
      dot: 'var(--c-blue)',
      sub: 'sudah ACC WD2',
      delay: 'delay-3',
    },
    {
      label: 'Disetujui',
      value: approvedThisMonth,
      valueColor: 'var(--c-green)',
      dot: 'var(--c-green)',
      sub: 'bulan ini',
      delay: 'delay-4',
    },
  ]

  return (
    <div className="animate-fade-up" style={{ padding: '32px', maxWidth: '1100px', margin: '0 auto' }}>

      {/* ── Header ──────────────────────────────────────────────── */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{
          fontSize: '22px', fontWeight: 700, letterSpacing: '-0.02em',
          color: 'var(--c-text)', margin: '0 0 4px',
        }}>
          Dashboard Admin
        </h1>
        <p style={{ fontSize: '12px', color: 'var(--c-text3)', margin: 0, fontFamily: 'var(--font-mono)' }}>
          {today}
        </p>
      </div>

      {/* ── Stat Cards ──────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '24px' }}>
        {statCards.map((card) => (
          <div
            key={card.label}
            className={`stat-card animate-fade-up ${card.delay}`}
            style={{
              background: '#fff',
              border: '1px solid var(--c-border)',
              borderRadius: '10px',
              padding: '18px 20px',
            }}
          >
            <p style={{
              fontSize: '10px', fontWeight: 600, textTransform: 'uppercase',
              letterSpacing: '0.06em', color: 'var(--c-text3)',
              margin: '0 0 10px',
            }}>
              {card.label}
            </p>
            <p style={{
              fontSize: '28px', fontWeight: 700, letterSpacing: '-0.03em',
              color: card.valueColor, margin: '0 0 8px',
              fontFamily: 'var(--font-mono)',
            }}>
              {card.value}
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: card.dot, display: 'inline-block' }} />
              <span style={{ fontSize: '11px', color: 'var(--c-text3)' }}>{card.sub}</span>
            </div>
          </div>
        ))}
      </div>

      {/* ── Info: Menunggu WD2 (info-only) ─────────────────────── */}
      {pendingCount > 0 && (
        <div style={{
          borderLeft: '3px solid var(--c-amber)',
          background: '#FFFBEB',
          borderRadius: '8px',
          padding: '12px 16px',
          marginBottom: '16px',
          fontSize: '13px',
          color: '#92400E',
        }}>
          Ada <strong>{pendingCount}</strong> booking menunggu persetujuan Wakil Dekan 2 dan belum bisa diproses admin.
        </div>
      )}

      {/* ── WD2_ACC Section ─────────────────────────────────────── */}
      <div style={{ ...cardStyle, marginBottom: '20px' }}>
        <div style={cardHeaderStyle}>
          <div>
            <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--c-text)', display: 'block' }}>
              Siap Disetujui (Sudah ACC WD2)
            </span>
            <span style={{ fontSize: '11px', color: 'var(--c-text3)' }}>
              Booking berikut telah mendapat persetujuan Wakil Dekan 2
            </span>
          </div>
          {wd2AccCount > 0 && (
            <span style={{
              background: '#DBEAFE', color: '#1E40AF',
              padding: '2px 10px', borderRadius: '20px',
              fontSize: '11px', fontWeight: 500,
            }}>
              {wd2AccCount}
            </span>
          )}
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['Dosen','Prodi','Mata Kuliah','Hari & Jam','No. Surat WD2','Aksi'].map((h) => (
                  <th key={h} style={thStyle}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {wd2Acc.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: '32px', textAlign: 'center', color: 'var(--c-text3)' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                      <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2} style={{ opacity: 0.35 }}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" />
                      </svg>
                      <span style={{ fontSize: '13px' }}>Belum ada booking yang siap diproses</span>
                    </div>
                  </td>
                </tr>
              ) : (
                wd2Acc.map((b) => (
                  <tr key={b.id} className="admin-row">
                    <td style={{ ...tdStyle, fontWeight: 500, color: 'var(--c-text)', whiteSpace: 'nowrap' }}>
                      {b.user.name}
                    </td>
                    <td style={tdStyle}>{b.prodi}</td>
                    <td style={tdStyle}>{b.mataKuliah}</td>
                    <td style={{ ...tdStyle, fontFamily: 'var(--font-mono)', fontSize: '11px', whiteSpace: 'nowrap' }}>
                      {b.hari}{'  '}
                      <span style={{ opacity: 0.7 }}>
                        {formatTime(b.jamMulai)}–{formatTime(b.jamSelesai)}
                      </span>
                    </td>
                    <td style={{ ...tdStyle, fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--c-text3)' }}>
                      {b.nomorSurat ?? '—'}
                    </td>
                    <td style={tdStyle}>
                      <AdminActions bookingId={b.id} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Approved Section ────────────────────────────────────── */}
      <div style={cardStyle}>
        <div style={cardHeaderStyle}>
          <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--c-text)' }}>
            Jadwal Disetujui
          </span>
          <AdminFilters weeks={availableWeeks} />
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['Dosen','Mata Kuliah','Hari','Jam','Minggu','Software','Status'].map((h) => (
                  <th key={h} style={thStyle}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {approved.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: '32px', textAlign: 'center', color: 'var(--c-text3)' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                      <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2} style={{ opacity: 0.35 }}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                      </svg>
                      <span style={{ fontSize: '13px' }}>
                        {filterHari || filterMinggu ? 'Tidak ada jadwal untuk filter ini' : 'Belum ada jadwal yang disetujui'}
                      </span>
                    </div>
                  </td>
                </tr>
              ) : (
                approved.map((b) => (
                  <tr key={b.id} className="admin-row">
                    <td style={{ ...tdStyle, fontWeight: 500, color: 'var(--c-text)', whiteSpace: 'nowrap' }}>
                      {b.user.name}
                    </td>
                    <td style={tdStyle}>{b.mataKuliah}</td>
                    <td style={tdStyle}>{b.hari}</td>
                    <td style={{ ...tdStyle, fontFamily: 'var(--font-mono)', fontSize: '11px', whiteSpace: 'nowrap' }}>
                      {formatTime(b.jamMulai)}–{formatTime(b.jamSelesai)}
                    </td>
                    <td style={{ ...tdStyle, fontFamily: 'var(--font-mono)', fontSize: '11px' }}>
                      {b.mingguMulai === b.mingguSelesai
                        ? `${b.mingguMulai}`
                        : `${b.mingguMulai}–${b.mingguSelesai}`}
                    </td>
                    <td style={tdStyle}>{b.software}</td>
                    <td style={tdStyle}>
                      <StatusBadge status={b.status} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {approved.length > 0 && (
          <div style={{
            padding: '10px 20px',
            borderTop: '1px solid var(--c-border)',
            fontSize: '11px', color: 'var(--c-text3)',
            fontFamily: 'var(--font-mono)',
          }}>
            {approved.length} jadwal ditampilkan
            {(filterHari || filterMinggu) && ` · filter aktif`}
          </div>
        )}
      </div>
    </div>
  )
}
