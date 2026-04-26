import { getSession } from '@/lib/session'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import Navbar from './components/Navbar'
import StatusBadge from './components/StatusBadge'
import LogoutButton from './LogoutButton'
import type { SessionUser } from '@/lib/session'
import type { Booking, User } from '@prisma/client'

type BookingWithUser = Booking & { user: User }

function formatTime(d: Date) {
  return new Date(d).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
}

function getGreeting() {
  const h = parseInt(
    new Date().toLocaleString('en-US', { timeZone: 'Asia/Jakarta', hour: 'numeric', hour12: false })
  )
  if (h < 12) return 'pagi'
  if (h < 15) return 'siang'
  return 'sore'
}

// ─────────────────────────────────────────────────────────────────────────────
// Landing page (unauthenticated)
// ─────────────────────────────────────────────────────────────────────────────

function LandingPage() {
  return (
    <div style={{ background: 'var(--c-navy)' }}>
      {/* Landing Navbar */}
      <nav style={{
        background: 'rgba(15,23,42,0.95)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        padding: '0 32px',
        height: '58px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '26px', height: '26px', borderRadius: '7px',
            background: 'var(--c-blue)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <rect x="1" y="1" width="5" height="5" rx="1" fill="white" />
              <rect x="8" y="1" width="5" height="5" rx="1" fill="white" />
              <rect x="1" y="8" width="5" height="5" rx="1" fill="white" />
              <rect x="8" y="8" width="5" height="5" rx="1" fill="white" />
            </svg>
          </div>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 600, color: '#fff', lineHeight: 1.2 }}>LabKomp</div>
            <div style={{ fontSize: '10px', color: 'var(--c-slate2)', textTransform: 'uppercase', letterSpacing: '0.06em', lineHeight: 1.2 }}>Sistem Booking</div>
          </div>
        </div>

        <Link href="/login" style={{
          fontSize: '13px', fontWeight: 500,
          color: 'rgba(255,255,255,0.85)',
          border: '1px solid rgba(255,255,255,0.15)',
          borderRadius: '7px', padding: '6px 16px',
          textDecoration: 'none',
          transition: 'all 150ms',
        }}>
          Masuk
        </Link>
      </nav>

      {/* Hero */}
      <div style={{
        position: 'relative', minHeight: '70vh',
        display: 'flex', alignItems: 'center', overflow: 'hidden',
      }}>
        {/* Grid overlay */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)
          `,
          backgroundSize: '32px 32px',
          opacity: 0.04,
          pointerEvents: 'none',
        }} />

        <div style={{
          textAlign: 'center', maxWidth: '560px',
          margin: '0 auto', padding: '64px 24px',
          position: 'relative', zIndex: 1,
          display: 'flex', flexDirection: 'column', alignItems: 'center',
        }}>
          {/* Live chip */}
          <div className="animate-fade-up delay-1" style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            background: 'rgba(59,130,246,0.12)',
            border: '1px solid rgba(59,130,246,0.25)',
            borderRadius: '20px', padding: '4px 14px 4px 10px',
            marginBottom: '24px',
          }}>
            <span className="animate-pulse-dot" style={{
              width: '6px', height: '6px', borderRadius: '50%',
              background: 'var(--c-blue2)', display: 'inline-block',
            }} />
            <span style={{ fontSize: '11px', color: 'var(--c-blue2)' }}>Sistem aktif</span>
          </div>

          {/* Heading */}
          <h1 className="animate-fade-up delay-2" style={{
            fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 700,
            color: '#fff', letterSpacing: '-0.03em',
            lineHeight: 1.15, marginBottom: '16px', margin: '0 0 16px',
          }}>
            Booking Lab Komputer{' '}
            <span style={{ color: 'var(--c-blue2)' }}>Lebih Mudah</span>
          </h1>

          {/* Subtext */}
          <p className="animate-fade-up delay-3" style={{
            fontSize: '14px', color: 'rgba(255,255,255,0.5)',
            maxWidth: '400px', lineHeight: 1.7, margin: '0 0 32px',
          }}>
            Ajukan permintaan lab, cek konflik jadwal otomatis, dan dapatkan
            persetujuan admin — semua dalam satu platform.
          </p>

          {/* CTAs */}
          <div className="animate-fade-up delay-4" style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
            <Link href="/login" className="btn-spring" style={{
              background: 'var(--c-blue)', color: '#fff',
              padding: '11px 28px', borderRadius: '9px',
              fontWeight: 500, fontSize: '14px',
              textDecoration: 'none', display: 'inline-block',
            }}>
              Masuk Sekarang
            </Link>
            <Link href="/schedule" className="btn-ghost-light" style={{
              background: 'transparent',
              border: '1px solid rgba(255,255,255,0.18)',
              color: 'rgba(255,255,255,0.7)',
              padding: '11px 24px', borderRadius: '9px',
              fontSize: '14px', textDecoration: 'none', display: 'inline-block',
            }}>
              Lihat Jadwal
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div style={{
        borderTop: '1px solid rgba(255,255,255,0.07)',
        background: 'rgba(255,255,255,0.02)',
        display: 'grid', gridTemplateColumns: '1fr 1fr 1fr',
      }}>
        {[
          { value: '24',   label: 'Lab Tersedia' },
          { value: '142+', label: 'Booking/Bulan' },
          { value: '98%',  label: 'Disetujui' },
        ].map((stat, i) => (
          <div key={stat.label} style={{
            textAlign: 'center', padding: '24px 16px',
            borderRight: i < 2 ? '1px solid rgba(255,255,255,0.07)' : 'none',
          }}>
            <div style={{
              fontSize: '24px', fontWeight: 600, color: '#fff',
              fontFamily: 'var(--font-mono)',
            }}>
              {stat.value}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--c-slate2)', marginTop: '4px' }}>
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* Features */}
      <div style={{ background: 'var(--c-surface)', padding: '64px 32px' }}>
        <div style={{ maxWidth: '960px', margin: '0 auto' }}>
          <h2 style={{
            textAlign: 'center', fontSize: '20px', fontWeight: 600,
            color: 'var(--c-text)', marginBottom: '40px',
          }}>
            Kenapa LabKomp?
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
            {[
              {
                title: 'Booking Cepat',
                desc: 'Ajukan permintaan lab dalam hitungan menit dengan form yang sederhana dan intuitif.',
                icon: <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /></svg>,
              },
              {
                title: 'Deteksi Konflik Otomatis',
                desc: 'Sistem mencegah double-booking dan memberi tahu jika terjadi konflik jadwal.',
                icon: <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" /></svg>,
              },
              {
                title: 'Persetujuan Mudah',
                desc: 'Admin bisa menyetujui atau menolak permintaan dengan satu klik dari dashboard.',
                icon: <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M10.125 2.25h-4.5c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125v-9M10.125 2.25h.375a9 9 0 019 9v.375M10.125 2.25A3.375 3.375 0 0113.5 5.625v1.5c0 .621.504 1.125 1.125 1.125h1.5a3.375 3.375 0 013.375 3.375M9 15l2.25 2.25L15 12" /></svg>,
              },
            ].map((feat) => (
              <div key={feat.title} style={{
                background: 'var(--c-white)',
                border: '1px solid var(--c-border)',
                borderRadius: '12px', padding: '24px',
                boxShadow: 'var(--shadow-card)',
              }}>
                <div style={{
                  width: '40px', height: '40px', borderRadius: '10px',
                  background: 'rgba(37,99,235,0.08)', color: 'var(--c-blue)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: '14px',
                }}>
                  {feat.icon}
                </div>
                <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--c-text)', marginBottom: '6px' }}>
                  {feat.title}
                </h3>
                <p style={{ fontSize: '13px', color: 'var(--c-text2)', lineHeight: 1.6, margin: 0 }}>
                  {feat.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Admin Home
// ─────────────────────────────────────────────────────────────────────────────

function AdminHome({
  session,
  totalCount,
  pendingCount,
  approvedThisWeek,
  latestPending,
}: {
  session: SessionUser
  totalCount: number
  pendingCount: number
  approvedThisWeek: number
  latestPending: BookingWithUser[]
}) {
  const today = new Date().toLocaleDateString('id-ID', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })

  return (
    <div style={{ minHeight: '100vh', background: 'var(--c-surface)' }}>
      <Navbar user={{ name: session.name, role: session.role }} />

      <div className="animate-fade-up max-w-5xl mx-auto px-6 py-10 space-y-8">
        {/* Greeting */}
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 600, color: 'var(--c-text)', marginBottom: '4px' }}>
            Selamat datang, {session.name}!
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--c-text3)', fontFamily: 'var(--font-mono)' }}>{today}</p>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            {
              label: 'Total Booking',
              value: totalCount,
              color: 'text-slate-900',
              bg: 'bg-white',
              icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /></svg>,
              iconBg: 'bg-slate-100 text-slate-500',
            },
            {
              label: 'Menunggu Persetujuan',
              value: pendingCount,
              color: 'text-amber-700',
              bg: 'bg-amber-50',
              icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
              iconBg: 'bg-amber-100 text-amber-600',
            },
            {
              label: 'Disetujui Minggu Ini',
              value: approvedThisWeek,
              color: 'text-emerald-700',
              bg: 'bg-emerald-50',
              icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
              iconBg: 'bg-emerald-100 text-emerald-600',
            },
          ].map((stat) => (
            <div key={stat.label} className={`${stat.bg} rounded-xl border border-slate-200 p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.04)]`}>
              <div className="flex items-start justify-between mb-3">
                <p className="text-xs font-medium text-slate-500">{stat.label}</p>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${stat.iconBg}`}>
                  {stat.icon}
                </div>
              </div>
              <p className={`text-3xl font-bold font-[family-name:var(--font-jetbrains)] ${stat.color}`}>
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        {/* Shortcut buttons */}
        <div className="flex flex-wrap gap-3">
          <Link
            href="/admin"
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2.5 rounded-lg text-sm transition-colors"
          >
            Ke Dashboard Admin
          </Link>
          <Link
            href="/schedule"
            className="border border-slate-300 hover:bg-slate-100 text-slate-700 font-medium px-5 py-2.5 rounded-lg text-sm transition-colors"
          >
            Lihat Jadwal
          </Link>
        </div>

        {/* Mini pending table */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-slate-700">Booking Terbaru Menunggu</h2>
            <Link href="/admin" className="text-xs text-blue-600 hover:text-blue-800 transition-colors">
              Lihat semua →
            </Link>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-[0_1px_3px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.04)] overflow-hidden">
            {latestPending.length === 0 ? (
              <div className="py-10 text-center">
                <p className="text-sm text-slate-400">Tidak ada booking yang menunggu</p>
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    {['Dosen', 'Mata Kuliah', 'Hari & Jam', 'Status'].map((h) => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {latestPending.map((b) => (
                    <tr key={b.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3.5 font-medium text-slate-900">{b.user.name}</td>
                      <td className="px-4 py-3.5 text-slate-600">{b.mataKuliah}</td>
                      <td className="px-4 py-3.5 text-slate-600">
                        <span>{b.hari}</span>
                        <span className="ml-2 font-[family-name:var(--font-jetbrains)] text-xs text-slate-500">
                          {formatTime(b.jamMulai)}–{formatTime(b.jamSelesai)}
                        </span>
                      </td>
                      <td className="px-4 py-3.5"><StatusBadge status={b.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <div className="pt-2">
          <LogoutButton />
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Dosen Home
// ─────────────────────────────────────────────────────────────────────────────

function DosenHome({
  session,
  activeCount,
  latestBookings,
}: {
  session: SessionUser
  activeCount: number
  latestBookings: Booking[]
}) {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--c-surface)' }}>
      <Navbar user={{ name: session.name, role: session.role }} />

      <div className="animate-fade-up max-w-3xl mx-auto px-6 py-10 space-y-8">
        {/* Greeting */}
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 600, color: 'var(--c-text)', marginBottom: '4px' }}>
            Halo, {session.name}!
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--c-text3)' }}>
            Kamu punya{' '}
            <span className="font-semibold text-emerald-600 font-[family-name:var(--font-jetbrains)]">
              {activeCount}
            </span>
            {' '}booking aktif
          </p>
        </div>

        {/* Shortcut cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            {
              href: '/booking',
              label: 'Buat Booking Baru',
              desc: 'Ajukan permintaan penggunaan lab',
              icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>,
              primary: true,
            },
            {
              href: '/dosen',
              label: 'Lihat Booking Saya',
              desc: 'Riwayat dan status permintaan',
              icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" /></svg>,
              primary: false,
            },
          ].map((card) => (
            <Link
              key={card.href}
              href={card.href}
              className={`flex items-center gap-4 p-5 rounded-xl border transition-all group ${
                card.primary
                  ? 'bg-blue-600 border-blue-600 hover:bg-blue-700 hover:border-blue-700'
                  : 'bg-white border-slate-200 hover:border-blue-300 hover:bg-blue-50/40'
              }`}
            >
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                card.primary ? 'bg-white/15 text-white' : 'bg-slate-100 text-slate-500 group-hover:bg-blue-100 group-hover:text-blue-600'
              } transition-colors`}>
                {card.icon}
              </div>
              <div>
                <p className={`text-sm font-semibold ${card.primary ? 'text-white' : 'text-slate-900 group-hover:text-blue-700'} transition-colors`}>
                  {card.label}
                </p>
                <p className={`text-xs mt-0.5 ${card.primary ? 'text-blue-200' : 'text-slate-500'}`}>
                  {card.desc}
                </p>
              </div>
            </Link>
          ))}
        </div>

        {/* Recent bookings */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-slate-700">Booking Terbaru</h2>
            <Link href="/dosen" className="text-xs text-blue-600 hover:text-blue-800 transition-colors">
              Lihat semua →
            </Link>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-[0_1px_3px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.04)] overflow-hidden">
            {latestBookings.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-sm text-slate-400">Belum ada booking</p>
                <Link href="/booking" className="mt-3 inline-block text-xs text-blue-600 hover:underline">
                  Buat booking pertama →
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {latestBookings.map((b) => (
                  <div key={b.id} className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50 transition-colors">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate">{b.mataKuliah}</p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {b.hari} ·{' '}
                        <span className="font-[family-name:var(--font-jetbrains)]">
                          {formatTime(b.jamMulai)}–{formatTime(b.jamSelesai)}
                        </span>
                        {' '}· Minggu {b.mingguMulai}
                      </p>
                    </div>
                    <StatusBadge status={b.status} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="pt-2">
          <LogoutButton />
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// WD2 Home
// ─────────────────────────────────────────────────────────────────────────────

function WD2Home({
  session,
  pendingCount,
}: {
  session: SessionUser
  pendingCount: number
}) {
  const greeting = getGreeting()

  return (
    <div style={{ minHeight: '100vh', background: 'var(--c-surface)' }}>
      <Navbar user={{ name: session.name, role: session.role }} />

      <div className="animate-fade-up max-w-3xl mx-auto px-6 py-10 space-y-8">
        {/* Greeting */}
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 600, color: 'var(--c-text)', marginBottom: '4px' }}>
            Selamat {greeting}, {session.name}!
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--c-text3)' }}>
            Ada{' '}
            <span className="font-semibold text-amber-600 font-[family-name:var(--font-jetbrains)]">
              {pendingCount}
            </span>
            {' '}booking menunggu persetujuan Anda
          </p>
        </div>

        {/* Stat card */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className={`${pendingCount > 0 ? 'bg-amber-50' : 'bg-white'} rounded-xl border border-slate-200 p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.04)]`}>
            <div className="flex items-start justify-between mb-3">
              <p className="text-xs font-medium text-slate-500">Menunggu Persetujuan</p>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${pendingCount > 0 ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-500'}`}>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <p className={`text-3xl font-bold font-[family-name:var(--font-jetbrains)] ${pendingCount > 0 ? 'text-amber-700' : 'text-slate-900'}`}>
              {pendingCount}
            </p>
          </div>
        </div>

        {/* Shortcuts */}
        <div className="flex flex-wrap gap-3">
          <Link
            href="/wd2"
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2.5 rounded-lg text-sm transition-colors"
          >
            Lihat Booking Masuk
          </Link>
          <Link
            href="/schedule"
            className="border border-slate-300 hover:bg-slate-100 text-slate-700 font-medium px-5 py-2.5 rounded-lg text-sm transition-colors"
          >
            Lihat Jadwal
          </Link>
        </div>

        <div className="pt-2">
          <LogoutButton />
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Mahasiswa Home
// ─────────────────────────────────────────────────────────────────────────────

function MahasiswaHome({ session }: { session: SessionUser }) {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--c-surface)' }}>
      <Navbar user={{ name: session.name, role: session.role }} />
      <div className="flex items-center justify-center min-h-[calc(100vh-58px)] px-6">
        <div className="text-center space-y-4">
          <p className="text-lg font-semibold text-slate-900">Halo, {session.name}</p>
          <Link
            href="/schedule"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2.5 rounded-lg text-sm transition-colors"
          >
            Lihat Jadwal Lab
          </Link>
          <div className="pt-2">
            <LogoutButton />
          </div>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Main export
// ─────────────────────────────────────────────────────────────────────────────

export default async function Home() {
  const session = await getSession()

  if (!session) {
    return <LandingPage />
  }

  if (session.role === 'ADMIN') {
    const startOfWeek = new Date()
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay())
    startOfWeek.setHours(0, 0, 0, 0)

    const [totalCount, pendingCount, approvedThisWeek, latestPending] = await Promise.all([
      prisma.booking.count(),
      prisma.booking.count({ where: { status: 'PENDING' } }),
      prisma.booking.count({ where: { status: 'APPROVED', createdAt: { gte: startOfWeek } } }),
      prisma.booking.findMany({
        where: { status: 'PENDING' },
        include: { user: true },
        orderBy: { createdAt: 'desc' },
        take: 3,
      }),
    ])

    return (
      <AdminHome
        session={session}
        totalCount={totalCount}
        pendingCount={pendingCount}
        approvedThisWeek={approvedThisWeek}
        latestPending={latestPending}
      />
    )
  }

  if (session.role === 'WD2') {
    const pendingCount = await prisma.booking.count({ where: { status: 'PENDING' } })
    return <WD2Home session={session} pendingCount={pendingCount} />
  }

  if (['DOSEN', 'KAPRODI', 'DEKAN'].includes(session.role)) {
    const [activeCount, latestBookings] = await Promise.all([
      prisma.booking.count({ where: { userId: session.userId, status: 'APPROVED' } }),
      prisma.booking.findMany({
        where: { userId: session.userId },
        orderBy: { createdAt: 'desc' },
        take: 3,
      }),
    ])

    return (
      <DosenHome
        session={session}
        activeCount={activeCount}
        latestBookings={latestBookings}
      />
    )
  }

  return <MahasiswaHome session={session} />
}
