'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

type Role = 'ADMIN' | 'WD2' | 'DOSEN' | 'KAPRODI' | 'DEKAN' | 'MAHASISWA'

export type NavbarUser = {
  name: string
  role: Role
}

type SiteSettings = {
  namaInstansi: string
  logoUrl: string | null
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

function getAvatarStyle(role: Role): React.CSSProperties {
  if (role === 'WD2') return { background: 'rgba(99,102,241,0.15)', color: '#6366F1' }
  return { background: 'rgba(59,130,246,0.2)', color: '#93C5FD' }
}

const navByRole: Record<string, { href: string; label: string }[]> = {
  ADMIN:     [
    { href: '/admin',       label: 'Dashboard' },
    { href: '/schedule',    label: 'Jadwal' },
    { href: '/admin/users', label: 'Pengguna' },
  ],
  WD2:       [
    { href: '/wd2',      label: 'Dashboard' },
    { href: '/schedule', label: 'Jadwal Lab' },
  ],
  DOSEN:     [
    { href: '/dosen',    label: 'Booking Saya' },
    { href: '/booking',  label: 'Buat Booking' },
    { href: '/schedule', label: 'Jadwal' },
  ],
  KAPRODI:   [
    { href: '/dosen',    label: 'Booking Saya' },
    { href: '/booking',  label: 'Buat Booking' },
    { href: '/schedule', label: 'Jadwal' },
  ],
  DEKAN:     [
    { href: '/dosen',    label: 'Booking Saya' },
    { href: '/booking',  label: 'Buat Booking' },
    { href: '/schedule', label: 'Jadwal' },
  ],
  MAHASISWA: [
    { href: '/schedule', label: 'Jadwal' },
  ],
}

function NavLink({ href, label, isActive }: { href: string; label: string; isActive: boolean }) {
  const [hovered, setHovered] = useState(false)

  return (
    <Link
      href={href}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        fontSize: '13px',
        padding: '6px 12px',
        borderRadius: '7px',
        textDecoration: 'none',
        fontWeight: isActive ? 500 : 400,
        transition: 'all 150ms',
        color: isActive || hovered ? '#fff' : 'rgba(255,255,255,0.55)',
        background: isActive
          ? 'rgba(59,130,246,0.15)'
          : hovered
          ? 'rgba(255,255,255,0.07)'
          : 'transparent',
      }}
    >
      {label}
    </Link>
  )
}

function GearIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  )
}

export default function Navbar({ user }: { user: NavbarUser }) {
  const pathname = usePathname()
  const router = useRouter()
  const [loggingOut, setLoggingOut] = useState(false)
  const [logoutHovered, setLogoutHovered] = useState(false)
  const [settingsHovered, setSettingsHovered] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const [siteSettings, setSiteSettings] = useState<SiteSettings>({ namaInstansi: 'LabKomp', logoUrl: null })
  const [logoVer, setLogoVer] = useState(0)

  useEffect(() => {
    fetch('/api/settings')
      .then((r) => r.json())
      .then((data: SiteSettings) => setSiteSettings(data))
      .catch(() => {})
  }, [])

  useEffect(() => {
    function onLogoUpdated(e: Event) {
      const detail = (e as CustomEvent<{ logoUrl: string }>).detail
      setSiteSettings((prev) => ({ ...prev, logoUrl: detail.logoUrl }))
      setLogoVer((v) => v + 1)
    }
    function onSettingsUpdated(e: Event) {
      const detail = (e as CustomEvent<{ namaInstansi?: string }>).detail
      if (detail.namaInstansi) setSiteSettings((prev) => ({ ...prev, namaInstansi: detail.namaInstansi! }))
    }
    window.addEventListener('settings:logo-updated', onLogoUpdated)
    window.addEventListener('settings:updated', onSettingsUpdated)
    return () => {
      window.removeEventListener('settings:logo-updated', onLogoUpdated)
      window.removeEventListener('settings:updated', onSettingsUpdated)
    }
  }, [])

  useEffect(() => {
    function handleOutsideClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    if (dropdownOpen) document.addEventListener('mousedown', handleOutsideClick)
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [dropdownOpen])

  const links = navByRole[user.role] ?? []
  const initials = getInitials(user.name)
  const avatarStyle = getAvatarStyle(user.role)

  async function handleLogout() {
    setLoggingOut(true)
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/')
  }

  return (
    <nav
      style={{
        background: 'var(--c-navy)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        backdropFilter: 'blur(12px)',
        padding: '0 32px',
        height: '58px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}
    >
      {/* Left — Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {siteSettings.logoUrl ? (
          <img
            src={`${siteSettings.logoUrl}?v=${logoVer}`}
            alt="Logo"
            style={{ width: '28px', height: '28px', objectFit: 'contain', flexShrink: 0 }}
          />
        ) : (
          <div
            style={{
              width: '26px',
              height: '26px',
              borderRadius: '7px',
              background: 'var(--c-blue)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <rect x="1" y="1" width="5" height="5" rx="1" fill="white" />
              <rect x="8" y="1" width="5" height="5" rx="1" fill="white" />
              <rect x="1" y="8" width="5" height="5" rx="1" fill="white" />
              <rect x="8" y="8" width="5" height="5" rx="1" fill="white" />
            </svg>
          </div>
        )}
        <div>
          <div style={{ fontSize: '13px', fontWeight: 600, color: '#fff', lineHeight: 1.2 }}>
            {siteSettings.namaInstansi}
          </div>
          <div
            style={{
              fontSize: '10px',
              color: 'var(--c-slate2)',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              lineHeight: 1.2,
            }}
          >
            Sistem Booking
          </div>
        </div>
      </div>

      {/* Center — Nav links */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
        {links.map((link) => (
          <NavLink
            key={link.href}
            href={link.href}
            label={link.label}
            isActive={
              pathname === link.href ||
              (link.href !== '/' && pathname.startsWith(link.href + '/'))
            }
          />
        ))}
      </div>

      {/* Right — User area */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>

        {/* Gear icon — ADMIN only */}
        {user.role === 'ADMIN' && (
          <Link
            href="/admin/settings"
            onMouseEnter={() => setSettingsHovered(true)}
            onMouseLeave={() => setSettingsHovered(false)}
            title="Pengaturan"
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: '30px', height: '30px', borderRadius: '7px',
              color: settingsHovered || pathname.startsWith('/admin/settings') ? '#fff' : 'var(--c-slate2)',
              background: pathname.startsWith('/admin/settings')
                ? 'rgba(59,130,246,0.15)'
                : settingsHovered ? 'rgba(255,255,255,0.07)' : 'transparent',
              transition: 'all 150ms', textDecoration: 'none',
            }}
          >
            <GearIcon />
          </Link>
        )}

        {/* Avatar + name — clickable, opens dropdown */}
        <div ref={dropdownRef} style={{ position: 'relative' }}>
          <button
            onClick={() => setDropdownOpen((v) => !v)}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              background: dropdownOpen ? 'rgba(255,255,255,0.06)' : 'none',
              border: 'none', cursor: 'pointer',
              padding: '4px 8px 4px 4px', borderRadius: '8px',
              transition: 'background 150ms',
            }}
            onMouseEnter={(e) => { if (!dropdownOpen) e.currentTarget.style.background = 'rgba(255,255,255,0.06)' }}
            onMouseLeave={(e) => { if (!dropdownOpen) e.currentTarget.style.background = 'none' }}
          >
            <div style={{
              width: '30px', height: '30px', borderRadius: '50%',
              ...avatarStyle, fontSize: '11px', fontWeight: 600,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0, fontFamily: 'var(--font-mono)',
            }}>
              {initials}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
              <span style={{ fontSize: '12px', fontWeight: 500, color: '#fff', lineHeight: 1.3 }}>
                {user.name}
              </span>
              <span style={{ fontSize: '10px', color: 'var(--c-slate2)', lineHeight: 1.3 }}>
                {user.role}
              </span>
            </div>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}
              style={{ color: 'var(--c-slate2)', marginLeft: '2px', transition: 'transform 150ms', transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Dropdown */}
          {dropdownOpen && (
            <div style={{
              position: 'absolute', top: '46px', right: 0, minWidth: '160px', zIndex: 100,
              background: '#fff', border: '1px solid var(--c-border)',
              borderRadius: '10px', boxShadow: 'var(--shadow-dropdown)',
              overflow: 'hidden',
              animation: 'fadeInUp 200ms ease forwards',
            }}>
              <Link
                href="/profile"
                onClick={() => setDropdownOpen(false)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '10px 14px', fontSize: '13px', color: 'var(--c-text)',
                  textDecoration: 'none', transition: 'background 100ms',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#F8FAFC')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
                Profil Saya
              </Link>

              <div style={{ borderTop: '1px solid var(--c-border)', margin: '0' }} />

              <button
                onClick={() => { setDropdownOpen(false); handleLogout() }}
                disabled={loggingOut}
                onMouseEnter={() => setLogoutHovered(true)}
                onMouseLeave={() => setLogoutHovered(false)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '10px', width: '100%',
                  padding: '10px 14px', fontSize: '13px',
                  color: logoutHovered ? 'var(--c-red)' : 'var(--c-text2)',
                  background: logoutHovered ? '#FEF2F2' : 'transparent',
                  border: 'none', cursor: loggingOut ? 'not-allowed' : 'pointer',
                  textAlign: 'left', transition: 'all 100ms',
                  opacity: loggingOut ? 0.5 : 1,
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                </svg>
                {loggingOut ? 'Keluar…' : 'Keluar'}
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}
