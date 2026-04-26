import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'
import Link from 'next/link'
import Navbar from '@/app/components/Navbar'
import ScheduleFilters from './ScheduleFilters'

// ── Config ────────────────────────────────────────────────────────────

const PAGE_SIZE = 15

const hariBadge: Record<string, { bg: string; color: string }> = {
  Senin:   { bg: '#EFF6FF', color: '#1D4ED8' },
  Selasa:  { bg: '#F0FDF4', color: '#166534' },
  Rabu:    { bg: '#FFFBEB', color: '#92400E' },
  Kamis:   { bg: '#FDF4FF', color: '#7E22CE' },
  Jumat:   { bg: '#FFF1F2', color: '#9F1239' },
}

// ── Helpers ───────────────────────────────────────────────────────────

function formatTime(d: Date) {
  return new Date(d).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
}

function buildUrl(base: Record<string, string>, overrides: Record<string, string | undefined>) {
  const merged: Record<string, string> = { ...base }
  for (const [k, v] of Object.entries(overrides)) {
    if (v !== undefined) {
      if (v) merged[k] = v; else delete merged[k]
    }
  }
  const params = new URLSearchParams(merged)
  const qs = params.toString()
  return `/schedule${qs ? `?${qs}` : ''}`
}

// ── Shared table styles ───────────────────────────────────────────────

const thStyle: React.CSSProperties = {
  fontSize: '10px', fontWeight: 600, textTransform: 'uppercase',
  letterSpacing: '0.05em', color: 'var(--c-text3)',
  padding: '10px 18px', background: '#FAFBFC',
  borderBottom: '1px solid #F1F5F9', textAlign: 'left',
  whiteSpace: 'nowrap',
}

const tdStyle: React.CSSProperties = {
  fontSize: '12px', color: 'var(--c-text2)',
  padding: '13px 18px', borderBottom: '1px solid #F8FAFC',
}

// ── Page ──────────────────────────────────────────────────────────────

type PageProps = {
  searchParams: Promise<{ hari?: string; minggu?: string; q?: string; page?: string }>
}

export default async function SchedulePage({ searchParams }: PageProps) {
  const [session, params] = await Promise.all([getSession(), searchParams])

  const hari   = params.hari   ?? ''
  const minggu = params.minggu ?? ''
  const q      = params.q      ?? ''
  const pageNum = Math.max(1, Number(params.page) || 1)
  const skip    = (pageNum - 1) * PAGE_SIZE

  // Build Prisma where clause
  const where = {
    status: 'APPROVED' as const,
    ...(hari   ? { hari }                              : {}),
    ...(minggu ? { mingguMulai: Number(minggu) }       : {}),
    ...(q      ? {
      OR: [
        { mataKuliah: { contains: q, mode: 'insensitive' as const } },
        { user: { name: { contains: q, mode: 'insensitive' as const } } },
      ],
    } : {}),
  }

  const [total, bookings, weekRows] = await Promise.all([
    prisma.booking.count({ where }),
    prisma.booking.findMany({
      where, include: { user: true },
      orderBy: [{ mingguMulai: 'asc' }, { hari: 'asc' }, { jamMulai: 'asc' }],
      skip, take: PAGE_SIZE,
    }),
    prisma.booking.findMany({
      where: { status: 'APPROVED' },
      select: { mingguMulai: true },
    }),
  ])

  const availableWeeks = [...new Set(weekRows.map((b) => b.mingguMulai))].sort((a, b) => a - b)
  const totalPages = Math.ceil(total / PAGE_SIZE)
  const from = total === 0 ? 0 : skip + 1
  const to   = Math.min(skip + PAGE_SIZE, total)

  // Preserve current params for pagination links
  const currentParams: Record<string, string> = {}
  if (hari)   currentParams.hari   = hari
  if (minggu) currentParams.minggu = minggu
  if (q)      currentParams.q      = q

  return (
    <div style={{ minHeight: '100vh', background: 'var(--c-surface)' }}>
      {/* Navbar — only when logged in */}
      {session && <Navbar user={{ name: session.name, role: session.role }} />}

      <div className="animate-fade-up" style={{ maxWidth: '1000px', margin: '0 auto', padding: '32px 16px' }}>

        {/* ── Header ─────────────────────────────────────────────── */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', marginBottom: '24px' }}>
          <div>
            <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--c-text)', margin: '0 0 4px', letterSpacing: '-0.02em' }}>
              Jadwal Penggunaan Lab
            </h1>
            <p style={{ fontSize: '13px', color: 'var(--c-text3)', margin: 0 }}>
              Daftar jadwal yang telah disetujui
            </p>
          </div>
          <Link
            href="/"
            style={{
              fontSize: '12px', color: 'var(--c-text3)',
              textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px',
              whiteSpace: 'nowrap', marginTop: '4px',
              transition: 'color 150ms',
            }}
            className="back-link"
          >
            ← {session ? 'Kembali' : 'Beranda'}
          </Link>
        </div>

        {/* ── Filter bar (client) ─────────────────────────────────── */}
        <ScheduleFilters weeks={availableWeeks} />

        {/* ── Table card ──────────────────────────────────────────── */}
        <div style={{
          background: '#fff',
          border: '1px solid var(--c-border)',
          borderRadius: '12px',
          overflow: 'hidden',
        }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {['Hari','Jam','Mata Kuliah','Dosen','Prodi','Software'].map((h) => (
                    <th key={h} style={thStyle}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {bookings.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ padding: '48px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                        <svg width="36" height="36" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2} style={{ color: 'var(--c-text3)', opacity: 0.4 }}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                        </svg>
                        <span style={{ fontSize: '13px', color: 'var(--c-text3)' }}>
                          {q || hari || minggu
                            ? 'Tidak ada jadwal yang cocok dengan filter ini'
                            : 'Belum ada jadwal disetujui'}
                        </span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  bookings.map((b) => {
                    const badge = hariBadge[b.hari] ?? { bg: '#F1F5F9', color: '#475569' }
                    return (
                      <tr key={b.id} className="admin-row">
                        {/* Hari badge */}
                        <td style={tdStyle}>
                          <span style={{
                            fontSize: '11px', fontWeight: 600,
                            padding: '3px 10px', borderRadius: '20px',
                            background: badge.bg, color: badge.color,
                            whiteSpace: 'nowrap',
                          }}>
                            {b.hari}
                          </span>
                        </td>
                        {/* Jam */}
                        <td style={{ ...tdStyle, fontFamily: 'var(--font-mono)', fontSize: '11px', whiteSpace: 'nowrap' }}>
                          {formatTime(b.jamMulai)}–{formatTime(b.jamSelesai)}
                        </td>
                        {/* Mata Kuliah */}
                        <td style={{ ...tdStyle, fontWeight: 500, color: 'var(--c-text)' }}>
                          {b.mataKuliah}
                        </td>
                        {/* Dosen */}
                        <td style={tdStyle}>{b.user.name}</td>
                        {/* Prodi */}
                        <td style={tdStyle}>{b.prodi}</td>
                        {/* Software */}
                        <td style={{
                          ...tdStyle,
                          fontFamily: 'var(--font-mono)', fontSize: '11px',
                          color: 'var(--c-text3)',
                        }}>
                          {b.software}
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* ── Pagination ──────────────────────────────────────────── */}
          {total > 0 && (
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '12px 18px', borderTop: '1px solid var(--c-border)',
              flexWrap: 'wrap', gap: '8px',
            }}>
              <span style={{
                fontSize: '12px', color: 'var(--c-text3)',
                fontFamily: 'var(--font-mono)',
              }}>
                {from}–{to} dari {total} jadwal
              </span>

              {totalPages > 1 && (
                <div style={{ display: 'flex', gap: '6px' }}>
                  {pageNum > 1 ? (
                    <Link
                      href={buildUrl(currentParams, { page: String(pageNum - 1) })}
                      style={pageBtnStyle}
                    >
                      Sebelumnya
                    </Link>
                  ) : (
                    <span style={{ ...pageBtnStyle, opacity: 0.35, pointerEvents: 'none' }}>Sebelumnya</span>
                  )}

                  <span style={{
                    fontSize: '12px', color: 'var(--c-text3)', padding: '5px 8px',
                    fontFamily: 'var(--font-mono)',
                  }}>
                    {pageNum} / {totalPages}
                  </span>

                  {pageNum < totalPages ? (
                    <Link
                      href={buildUrl(currentParams, { page: String(pageNum + 1) })}
                      style={pageBtnStyle}
                    >
                      Selanjutnya
                    </Link>
                  ) : (
                    <span style={{ ...pageBtnStyle, opacity: 0.35, pointerEvents: 'none' }}>Selanjutnya</span>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

const pageBtnStyle: React.CSSProperties = {
  fontSize: '12px', color: 'var(--c-text2)',
  border: '1px solid var(--c-border)', borderRadius: '7px',
  padding: '5px 14px', textDecoration: 'none',
  transition: 'all 150ms', background: '#fff',
  display: 'inline-block',
}
