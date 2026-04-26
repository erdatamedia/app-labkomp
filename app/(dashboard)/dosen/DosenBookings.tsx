'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

type BookingStatus = 'PENDING' | 'WD2_ACC' | 'APPROVED' | 'REJECTED'
type TabKey = 'ALL' | BookingStatus

export type SerializedBooking = {
  id: number
  mataKuliah: string
  prodi: string
  hari: string
  jamMulai: string
  jamSelesai: string
  mingguMulai: number
  mingguSelesai: number
  software: string
  jumlahMahasiswa: number | null
  status: BookingStatus
  createdAt: string
}

// ── Helpers ───────────────────────────────────────────────────────────

function formatHHMM(isoStr: string) {
  return isoStr.substring(11, 16)
}

const TABS: { key: TabKey; label: string }[] = [
  { key: 'ALL',      label: 'Semua'    },
  { key: 'PENDING',  label: 'Menunggu' },
  { key: 'APPROVED', label: 'Disetujui'},
  { key: 'REJECTED', label: 'Ditolak'  },
]

const statusCfg: Record<BookingStatus, { bg: string; color: string; dot: string; pulse: boolean; label: string }> = {
  PENDING:  { bg: '#FEF3C7', color: '#92400E', dot: 'var(--c-amber)', pulse: true,  label: 'Menunggu'      },
  WD2_ACC:  { bg: '#EFF6FF', color: '#1D4ED8', dot: '#3B82F6',        pulse: true,  label: 'Menunggu Admin' },
  APPROVED: { bg: '#DCFCE7', color: '#166534', dot: 'var(--c-green)', pulse: false, label: 'Disetujui'     },
  REJECTED: { bg: '#FEE2E2', color: '#991B1B', dot: 'var(--c-red)',   pulse: false, label: 'Ditolak'       },
}

const stripColor: Record<BookingStatus, string> = {
  PENDING:  'var(--c-amber)',
  WD2_ACC:  '#3B82F6',
  APPROVED: 'var(--c-green)',
  REJECTED: 'var(--c-red)',
}

// ── Small icon components ─────────────────────────────────────────────

function Icon({ d, size = 11 }: { d: string; size?: number }) {
  return (
    <svg width={size} height={size} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d={d} />
    </svg>
  )
}

function MetaItem({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
      <span style={{ color: 'var(--c-text3)', display: 'flex', alignItems: 'center' }}>{icon}</span>
      <span style={{ fontSize: '11px', color: 'var(--c-text3)', whiteSpace: 'nowrap' }}>{text}</span>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────

export default function DosenBookings({ bookings }: { bookings: SerializedBooking[] }) {
  const router = useRouter()
  const [tab, setTab]               = useState<TabKey>('ALL')
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [deletedIds, setDeletedIds] = useState<Set<number>>(new Set())
  const [cancelError, setCancelError] = useState('')

  const filtered = bookings
    .filter((b) => !deletedIds.has(b.id))
    .filter((b) => tab === 'ALL' || b.status === tab)

  async function handleCancel(id: number) {
    setDeletingId(id)
    setCancelError('')

    const res = await fetch(`/api/bookings/${id}`, { method: 'DELETE' })

    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      setCancelError(data.error ?? 'Gagal membatalkan booking')
      setDeletingId(null)
      return
    }

    setDeletedIds((prev) => new Set([...prev, id]))
    setDeletingId(null)
    router.refresh()
  }

  return (
    <div>
      {/* ── Filter tabs ───────────────────────────────────────────── */}
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '20px' }}>
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            style={{
              background: tab === t.key ? 'var(--c-blue)' : '#fff',
              color: tab === t.key ? '#fff' : 'var(--c-text2)',
              border: `1px solid ${tab === t.key ? 'var(--c-blue)' : 'var(--c-border)'}`,
              borderRadius: '20px',
              fontSize: '12px', fontWeight: 500,
              padding: '6px 16px',
              cursor: 'pointer',
              transition: 'all 150ms',
              fontFamily: 'var(--font-sans)',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Cancel error ──────────────────────────────────────────── */}
      {cancelError && (
        <div
          className="animate-fade-up"
          style={{
            background: '#FEF2F2', border: '1px solid #FECACA',
            borderRadius: '8px', padding: '10px 14px', marginBottom: '12px',
            fontSize: '12px', color: '#991B1B',
          }}
        >
          {cancelError}
        </div>
      )}

      {/* ── Booking list ─────────────────────────────────────────── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {filtered.length === 0 ? (
          <div style={{
            background: '#fff', border: '1px solid var(--c-border)',
            borderRadius: '12px', padding: '48px', textAlign: 'center',
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
              <svg width="40" height="40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2} style={{ color: 'var(--c-text3)', opacity: 0.5 }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" />
              </svg>
              <div>
                <p style={{ fontSize: '15px', fontWeight: 500, color: 'var(--c-text)', margin: '0 0 4px' }}>
                  Belum ada booking
                </p>
                <p style={{ fontSize: '13px', color: 'var(--c-text3)', margin: '0 0 16px' }}>
                  Klik '+ Buat Booking' untuk mengajukan jadwal lab
                </p>
                <Link
                  href="/booking"
                  style={{
                    display: 'inline-block',
                    background: 'var(--c-blue)', color: '#fff',
                    padding: '8px 18px', borderRadius: '8px',
                    fontSize: '13px', fontWeight: 500,
                    textDecoration: 'none',
                  }}
                >
                  + Buat Booking
                </Link>
              </div>
            </div>
          </div>
        ) : (
          filtered.map((b, index) => {
            console.log('booking status:', b.status)
            const cfg = statusCfg[b.status] ?? { bg: '#F1F5F9', color: '#475569', dot: '#94A3B8', pulse: false, label: b.status }
            if (!cfg) return null
            const isDeleting = deletingId === b.id
            const weekLabel = b.mingguMulai === b.mingguSelesai
              ? `Minggu ${b.mingguMulai}`
              : `Minggu ${b.mingguMulai}–${b.mingguSelesai}`

            return (
              <div
                key={b.id}
                className="booking-card animate-fade-up"
                style={{
                  background: '#fff',
                  border: '1px solid var(--c-border)',
                  borderRadius: '12px',
                  padding: '16px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  animationDelay: `${Math.min(index * 60, 300)}ms`,
                  opacity: isDeleting ? 0.5 : 1,
                  transition: 'opacity 200ms',
                }}
              >
                {/* Color strip */}
                <div style={{
                  width: '3px', borderRadius: '2px', alignSelf: 'stretch',
                  background: stripColor[b.status], flexShrink: 0, minHeight: '44px',
                }} />

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--c-text)', margin: '0 0 6px', lineHeight: 1.3 }}>
                    {b.mataKuliah}
                  </p>
                  <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                    <MetaItem
                      icon={<Icon d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />}
                      text={`${b.hari}, ${formatHHMM(b.jamMulai)}–${formatHHMM(b.jamSelesai)}`}
                    />
                    <MetaItem
                      icon={<Icon d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12" />}
                      text={weekLabel}
                    />
                    <MetaItem
                      icon={<Icon d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />}
                      text={b.prodi}
                    />
                    <MetaItem
                      icon={<Icon d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0H3" />}
                      text={b.software}
                    />
                  </div>
                </div>

                {/* Right: badge + cancel */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px', flexShrink: 0 }}>
                  {/* Status badge */}
                  <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: '5px',
                    background: cfg.bg, color: cfg.color,
                    padding: '4px 10px', borderRadius: '20px',
                    fontSize: '11px', fontWeight: 500,
                    whiteSpace: 'nowrap',
                  }}>
                    <span
                      className={cfg.pulse ? 'animate-pulse-dot' : undefined}
                      style={{
                        width: '5px', height: '5px', borderRadius: '50%',
                        background: cfg.dot, display: 'inline-block', flexShrink: 0,
                      }}
                    />
                    {cfg.label}
                  </div>

                  {/* Cancel button */}
                  {b.status === 'PENDING' && (
                    <button
                      onClick={() => handleCancel(b.id)}
                      disabled={isDeleting || deletingId !== null}
                      className="btn-cancel"
                      style={{
                        fontSize: '11px', fontWeight: 500,
                        color: 'var(--c-text3)',
                        border: '1px solid var(--c-border)',
                        borderRadius: '6px', padding: '5px 12px',
                        background: 'none', cursor: 'pointer',
                        fontFamily: 'var(--font-sans)',
                        opacity: deletingId !== null && !isDeleting ? 0.4 : 1,
                      }}
                    >
                      {isDeleting ? '...' : 'Batalkan'}
                    </button>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
