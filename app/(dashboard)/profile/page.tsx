'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'

type Role = 'ADMIN' | 'WD2' | 'DOSEN' | 'KAPRODI' | 'DEKAN' | 'MAHASISWA'

type UserProfile = {
  id: number
  name: string
  email: string
  role: Role
  nip: string | null
  prodi: string | null
  jabatan: string | null
  noHp: string | null
  avatarUrl: string | null
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

const roleAvatarStyle: Record<Role, React.CSSProperties> = {
  ADMIN:     { background: 'rgba(37,99,235,0.25)',  color: '#93C5FD' },
  DOSEN:     { background: 'rgba(16,185,129,0.2)',  color: '#6EE7B7' },
  WD2:       { background: 'rgba(99,102,241,0.25)', color: '#C7D2FE' },
  KAPRODI:   { background: 'rgba(16,185,129,0.2)',  color: '#6EE7B7' },
  DEKAN:     { background: 'rgba(245,158,11,0.2)',  color: '#FCD34D' },
  MAHASISWA: { background: 'rgba(100,116,139,0.2)', color: '#CBD5E1' },
}

const roleBadgeStyle: Record<Role, React.CSSProperties> = {
  ADMIN:     { background: 'rgba(37,99,235,0.2)',   color: '#93C5FD' },
  DOSEN:     { background: 'rgba(16,185,129,0.18)', color: '#6EE7B7' },
  WD2:       { background: 'rgba(99,102,241,0.2)',  color: '#C7D2FE' },
  KAPRODI:   { background: 'rgba(16,185,129,0.18)', color: '#6EE7B7' },
  DEKAN:     { background: 'rgba(245,158,11,0.18)', color: '#FCD34D' },
  MAHASISWA: { background: 'rgba(100,116,139,0.2)', color: '#CBD5E1' },
}

const roleHome: Record<Role, string> = {
  ADMIN: '/admin', WD2: '/wd2', DOSEN: '/dosen',
  KAPRODI: '/dosen', DEKAN: '/dosen', MAHASISWA: '/schedule',
}

function Toast({ message, type, onDone }: { message: string; type: 'success' | 'error'; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 3200)
    return () => clearTimeout(t)
  }, [onDone])
  return (
    <div style={{
      position: 'fixed', bottom: '24px', right: '24px', zIndex: 999,
      background: type === 'success' ? '#ECFDF5' : '#FEF2F2',
      border: `1px solid ${type === 'success' ? '#A7F3D0' : '#FECACA'}`,
      color: type === 'success' ? '#065F46' : '#991B1B',
      borderRadius: '10px', padding: '12px 20px',
      fontSize: '13px', fontWeight: 500,
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
      animation: 'fadeInUp 200ms ease forwards',
    }}>
      {message}
    </div>
  )
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [form, setForm] = useState({ name: '', nip: '', noHp: '', prodi: '', jabatan: '' })
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [fieldError, setFieldError] = useState<string | null>(null)

  const [pwOpen, setPwOpen] = useState(false)
  const [pw, setPw] = useState({ oldPassword: '', newPassword: '', confirm: '' })
  const [pwError, setPwError] = useState<string | null>(null)
  const pwSectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch('/api/profile')
      .then((r) => r.json())
      .then((data: UserProfile) => {
        setProfile(data)
        setForm({
          name:    data.name    ?? '',
          nip:     data.nip     ?? '',
          noHp:    data.noHp    ?? '',
          prodi:   data.prodi   ?? '',
          jabatan: data.jabatan ?? '',
        })
      })
  }, [])

  function togglePw() {
    setPwOpen((v) => !v)
    setPwError(null)
    setPw({ oldPassword: '', newPassword: '', confirm: '' })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setFieldError(null)
    setPwError(null)

    if (!form.name.trim()) {
      setFieldError('Nama lengkap wajib diisi')
      return
    }

    const body: Record<string, string> = {
      name:    form.name,
      nip:     form.nip,
      noHp:    form.noHp,
      prodi:   form.prodi,
      jabatan: form.jabatan,
    }

    if (pwOpen) {
      if (!pw.oldPassword || !pw.newPassword) {
        setPwError('Password lama dan baru wajib diisi')
        return
      }
      if (pw.newPassword.length < 6) {
        setPwError('Password baru minimal 6 karakter')
        return
      }
      if (pw.newPassword !== pw.confirm) {
        setPwError('Konfirmasi password tidak cocok')
        return
      }
      body.oldPassword = pw.oldPassword
      body.newPassword = pw.newPassword
    }

    setSaving(true)
    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const json = await res.json()
      if (!res.ok) {
        const msg: string = json.error ?? 'Gagal menyimpan'
        if (msg.toLowerCase().includes('password')) setPwError(msg)
        else setFieldError(msg)
        return
      }
      setProfile(json)
      if (pwOpen) { setPwOpen(false); setPw({ oldPassword: '', newPassword: '', confirm: '' }) }
      setToast({ message: 'Profil berhasil diperbarui', type: 'success' })
    } catch {
      setFieldError('Terjadi kesalahan, coba lagi')
    } finally {
      setSaving(false)
    }
  }

  if (!profile) {
    return (
      <div style={{ padding: '64px 16px', textAlign: 'center', color: 'var(--c-text3)', fontSize: '13px' }}>
        Memuat profil…
      </div>
    )
  }

  const initials = getInitials(profile.name)
  const backHref = roleHome[profile.role] ?? '/'

  const inputStyle: React.CSSProperties = {
    width: '100%', border: '1px solid var(--c-border)',
    borderRadius: '8px', padding: '9px 12px',
    fontSize: '13px', color: 'var(--c-text)',
    background: '#fff', outline: 'none',
  }
  const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: '12px', fontWeight: 500,
    color: 'var(--c-text2)', marginBottom: '6px',
  }

  return (
    <div className="animate-fade-up" style={{ maxWidth: '600px', margin: '0 auto', padding: '32px 16px' }}>
      {toast && <Toast message={toast.message} type={toast.type} onDone={() => setToast(null)} />}

      {/* Back link */}
      <Link href={backHref} style={{ fontSize: '13px', color: 'var(--c-text3)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px', marginBottom: '20px' }}
        className="back-link">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Kembali
      </Link>

      {/* ── Card Profil Atas ──────────────────────────────────── */}
      <div style={{
        background: 'var(--c-navy)', borderRadius: '14px', padding: '28px',
        display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '16px',
      }}>
        {/* Avatar */}
        <div style={{
          width: '72px', height: '72px', borderRadius: '50%', flexShrink: 0,
          overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '22px', fontWeight: 700, fontFamily: 'var(--font-mono)',
          ...roleAvatarStyle[profile.role],
        }}>
          {profile.avatarUrl ? (
            <img src={profile.avatarUrl} alt={profile.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            initials
          )}
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '18px', fontWeight: 600, color: '#fff', marginBottom: '6px', lineHeight: 1.3 }}>
            {profile.name}
          </div>
          <span style={{
            display: 'inline-block',
            fontSize: '11px', fontWeight: 500, letterSpacing: '0.04em',
            padding: '2px 10px', borderRadius: '20px',
            marginBottom: '8px',
            ...roleBadgeStyle[profile.role],
          }}>
            {profile.role}
          </span>
          <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginBottom: '2px' }}>
            {profile.email}
          </div>
          {profile.nip && (
            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', fontFamily: 'var(--font-mono)' }}>
              NIP {profile.nip}
            </div>
          )}
        </div>
      </div>

      {/* ── Card Form Edit ──────────────────────────────────── */}
      <div style={{ background: '#fff', border: '1px solid var(--c-border)', borderRadius: '12px', padding: '24px' }}>
        <h2 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--c-text)', margin: '0 0 20px' }}>
          Edit Profil
        </h2>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

          {/* Nama */}
          <div>
            <label style={labelStyle}>Nama Lengkap <span style={{ color: 'var(--c-red)' }}>*</span></label>
            <input value={form.name} required onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} style={inputStyle} />
          </div>

          {/* NIP */}
          <div>
            <label style={labelStyle}>NIP</label>
            <input value={form.nip} onChange={(e) => setForm((f) => ({ ...f, nip: e.target.value }))} style={inputStyle} placeholder="Nomor Induk Pegawai" />
          </div>

          {/* No HP */}
          <div>
            <label style={labelStyle}>No. HP</label>
            <input value={form.noHp} onChange={(e) => setForm((f) => ({ ...f, noHp: e.target.value }))} style={inputStyle} placeholder="08xxxxxxxxxx" />
          </div>

          {/* Prodi — hanya DOSEN & KAPRODI */}
          {(profile.role === 'DOSEN' || profile.role === 'KAPRODI') && (
            <div>
              <label style={labelStyle}>Program Studi</label>
              <input value={form.prodi} onChange={(e) => setForm((f) => ({ ...f, prodi: e.target.value }))} style={inputStyle} placeholder="Contoh: Teknik Informatika" />
            </div>
          )}

          {/* Jabatan — hanya WD2 */}
          {profile.role === 'WD2' && (
            <div>
              <label style={labelStyle}>Jabatan</label>
              <input value={form.jabatan} onChange={(e) => setForm((f) => ({ ...f, jabatan: e.target.value }))} style={inputStyle} placeholder="Contoh: Wakil Dekan II Bidang Sumber Daya" />
            </div>
          )}

          {fieldError && (
            <p style={{ fontSize: '12px', color: 'var(--c-red)', margin: 0 }}>{fieldError}</p>
          )}

          {/* Divider */}
          <div style={{ borderTop: '1px solid var(--c-border)', margin: '4px 0' }} />

          {/* Ganti Password — collapsible */}
          <div>
            <button
              type="button"
              onClick={togglePw}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                background: 'none', border: 'none', cursor: 'pointer',
                fontSize: '13px', fontWeight: 500, color: 'var(--c-text2)',
                padding: '2px 0',
              }}
            >
              <svg
                width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
                style={{ transition: 'transform 200ms', transform: pwOpen ? 'rotate(90deg)' : 'rotate(0deg)' }}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
              Ganti Password
            </button>

            <div
              ref={pwSectionRef}
              style={{
                overflow: 'hidden',
                maxHeight: pwOpen ? '260px' : '0',
                transition: 'max-height 250ms ease',
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', paddingTop: '14px' }}>
                <div>
                  <label style={labelStyle}>Password Lama</label>
                  <input
                    type="password" value={pw.oldPassword}
                    onChange={(e) => setPw((p) => ({ ...p, oldPassword: e.target.value }))}
                    style={inputStyle} autoComplete="current-password"
                  />
                </div>
                <div>
                  <label style={labelStyle}>Password Baru <span style={{ color: 'var(--c-text3)', fontWeight: 400 }}>(min. 6 karakter)</span></label>
                  <input
                    type="password" value={pw.newPassword}
                    onChange={(e) => setPw((p) => ({ ...p, newPassword: e.target.value }))}
                    style={inputStyle} autoComplete="new-password"
                  />
                </div>
                <div>
                  <label style={labelStyle}>Konfirmasi Password Baru</label>
                  <input
                    type="password" value={pw.confirm}
                    onChange={(e) => setPw((p) => ({ ...p, confirm: e.target.value }))}
                    style={{
                      ...inputStyle,
                      borderColor: pw.confirm && pw.confirm !== pw.newPassword ? 'var(--c-red)' : undefined,
                    }}
                    autoComplete="new-password"
                  />
                  {pw.confirm && pw.confirm !== pw.newPassword && (
                    <p style={{ fontSize: '11px', color: 'var(--c-red)', margin: '4px 0 0' }}>Password tidak cocok</p>
                  )}
                </div>
                {pwError && (
                  <p style={{ fontSize: '12px', color: 'var(--c-red)', margin: 0 }}>{pwError}</p>
                )}
              </div>
            </div>
          </div>

          {/* Submit */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '4px' }}>
            <button
              type="submit"
              disabled={saving}
              className="btn-spring"
              style={{
                background: 'var(--c-blue)', color: '#fff',
                border: 'none', borderRadius: '8px',
                padding: '9px 24px', fontSize: '13px', fontWeight: 500,
                cursor: saving ? 'not-allowed' : 'pointer',
                opacity: saving ? 0.7 : 1,
                display: 'flex', alignItems: 'center', gap: '8px',
              }}
            >
              {saving && (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}
                  style={{ animation: 'spin 0.8s linear infinite' }}>
                  <path strokeLinecap="round" d="M12 2a10 10 0 0 1 10 10" />
                </svg>
              )}
              {saving ? 'Menyimpan…' : 'Simpan Profil'}
            </button>
          </div>
        </form>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}
