'use client'

import Link from 'next/link'
import { useState, FormEvent } from 'react'

type FormState = {
  name: string
  email: string
  nip: string
  prodi: string
  noHp: string
  password: string
  confirmPassword: string
}

const EMPTY_FORM: FormState = {
  name: '', email: '', nip: '', prodi: '', noHp: '', password: '', confirmPassword: '',
}

const features = [
  'Booking lab kapan saja secara online',
  'Pantau status persetujuan real-time',
  'Jadwal berulang otomatis',
]

function inputStyle(focused: boolean): React.CSSProperties {
  return {
    width: '100%',
    padding: '11px 14px',
    fontSize: '13px',
    border: `1px solid ${focused ? 'var(--c-blue)' : 'var(--c-border)'}`,
    borderRadius: '8px',
    background: 'var(--c-surface)',
    outline: 'none',
    color: 'var(--c-text)',
    boxShadow: focused ? '0 0 0 3px rgba(37,99,235,0.1)' : 'none',
    transition: 'border-color 200ms, box-shadow 200ms',
    boxSizing: 'border-box' as const,
  }
}

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: '11px', fontWeight: 500,
  color: 'var(--c-text3)', letterSpacing: '0.05em',
  textTransform: 'uppercase' as const, marginBottom: '6px',
}

function SuccessCard() {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      minHeight: '100vh', background: '#F8FAFC', padding: '24px',
    }}>
      <div style={{
        background: '#fff', borderRadius: '16px',
        padding: '48px 40px', maxWidth: '420px', width: '100%',
        boxShadow: '0 4px 24px rgba(0,0,0,0.07)',
        textAlign: 'center',
      }}>
        <div style={{
          width: '64px', height: '64px', borderRadius: '50%',
          background: '#DCFCE7', display: 'flex', alignItems: 'center',
          justifyContent: 'center', margin: '0 auto 20px',
        }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
            <path d="M5 13L9 17L19 7" stroke="#16A34A" strokeWidth="2.5"
              strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--c-text)', margin: '0 0 10px' }}>
          Pendaftaran Berhasil!
        </h2>
        <p style={{ fontSize: '13px', color: 'var(--c-text2)', lineHeight: 1.7, margin: '0 0 28px' }}>
          Akun Anda sedang menunggu persetujuan admin.
          Anda akan bisa login setelah admin menyetujui
          pendaftaran Anda.
        </p>
        <Link
          href="/"
          style={{
            display: 'inline-block',
            padding: '11px 28px',
            background: 'var(--c-blue)',
            color: '#fff',
            borderRadius: '9px',
            fontSize: '13px',
            fontWeight: 600,
            textDecoration: 'none',
          }}
        >
          Kembali ke Beranda
        </Link>
      </div>
    </div>
  )
}

export default function RegisterPage() {
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [focused, setFocused] = useState<Partial<Record<keyof FormState, boolean>>>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [btnHovered, setBtnHovered] = useState(false)

  function set(field: keyof FormState) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [field]: e.target.value }))
  }

  function onFocus(field: keyof FormState) { setFocused((f) => ({ ...f, [field]: true })) }
  function onBlur(field: keyof FormState)  { setFocused((f) => ({ ...f, [field]: false })) }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')

    if (form.name.trim().length < 3) { setError('Nama minimal 3 karakter'); return }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) { setError('Format email tidak valid'); return }
    if (!form.prodi.trim()) { setError('Program Studi wajib diisi'); return }
    if (form.password.length < 6) { setError('Password minimal 6 karakter'); return }
    if (form.password !== form.confirmPassword) { setError('Konfirmasi password tidak cocok'); return }

    setLoading(true)

    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: form.name, email: form.email, nip: form.nip,
        prodi: form.prodi, noHp: form.noHp, password: form.password,
      }),
    })

    const data = await res.json()
    setLoading(false)

    if (!res.ok) {
      setError(data.error ?? 'Pendaftaran gagal')
      return
    }

    setSuccess(true)
  }

  if (success) return <SuccessCard />

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', minHeight: '100vh' }}>

      {/* ── Panel Kiri ─────────────────────────────────────────────── */}
      <div
        className="hidden md:flex flex-col justify-between"
        style={{ background: 'var(--c-navy)', padding: '48px 44px' }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '56px' }}>
            <div style={{
              width: '26px', height: '26px', borderRadius: '7px',
              background: 'var(--c-blue)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
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

          <div>
            <p style={{ fontSize: '10px', color: 'var(--c-blue2)', letterSpacing: '0.1em', fontWeight: 500, marginBottom: '10px' }}>
              DAFTAR AKUN
            </p>
            <h1 style={{
              fontSize: '26px', fontWeight: 700, color: '#fff',
              letterSpacing: '-0.02em', lineHeight: 1.25, margin: '0 0 12px',
            }}>
              Daftar sebagai Dosen
            </h1>
            <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.45)', lineHeight: 1.65, margin: 0 }}>
              Ajukan akun untuk menggunakan sistem booking lab
            </p>

            <div style={{ marginTop: '36px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {features.map((feat) => (
                <div key={feat} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    width: '20px', height: '20px', borderRadius: '5px',
                    background: 'rgba(59,130,246,0.15)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <path d="M2 5L4 7L8 3" stroke="var(--c-blue2)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.55)' }}>{feat}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div>
          <Link
            href="/login"
            style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}
          >
            Sudah punya akun?{' '}
            <span style={{ color: 'var(--c-blue2)', fontWeight: 500 }}>Masuk</span>
          </Link>
          <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.2)', marginTop: '16px' }}>
            © 2025 Laboratorium Komputer
          </p>
        </div>
      </div>

      {/* ── Panel Kanan (form) ──────────────────────────────────────── */}
      <div style={{
        background: '#fff',
        padding: '32px 48px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        overflowY: 'auto',
      }}>
        <div style={{ maxWidth: '360px', width: '100%' }}>
          <h2 style={{
            fontSize: '22px', fontWeight: 700,
            letterSpacing: '-0.02em', color: 'var(--c-text)',
            margin: '0 0 6px',
          }}>
            Buat Akun Dosen
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--c-text3)', margin: '0 0 28px' }}>
            Akun akan aktif setelah disetujui admin
          </p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* Nama */}
            <div>
              <label style={labelStyle}>Nama Lengkap <span style={{ color: 'var(--c-red)' }}>*</span></label>
              <input
                type="text" required value={form.name} onChange={set('name')}
                onFocus={() => onFocus('name')} onBlur={() => onBlur('name')}
                placeholder="Dr. Nama Lengkap"
                style={inputStyle(!!focused.name)}
              />
            </div>

            {/* Email */}
            <div>
              <label style={labelStyle}>Email Institusi <span style={{ color: 'var(--c-red)' }}>*</span></label>
              <input
                type="email" required value={form.email} onChange={set('email')}
                onFocus={() => onFocus('email')} onBlur={() => onBlur('email')}
                placeholder="nama@institusi.ac.id"
                style={inputStyle(!!focused.email)}
              />
            </div>

            {/* NIP */}
            <div>
              <label style={labelStyle}>NIP <span style={{ color: 'var(--c-text3)', fontWeight: 400 }}>(opsional)</span></label>
              <input
                type="text" value={form.nip} onChange={set('nip')}
                onFocus={() => onFocus('nip')} onBlur={() => onBlur('nip')}
                placeholder="Nomor Induk Pegawai"
                style={inputStyle(!!focused.nip)}
              />
            </div>

            {/* Prodi */}
            <div>
              <label style={labelStyle}>Program Studi <span style={{ color: 'var(--c-red)' }}>*</span></label>
              <input
                type="text" required value={form.prodi} onChange={set('prodi')}
                onFocus={() => onFocus('prodi')} onBlur={() => onBlur('prodi')}
                placeholder="Contoh: Teknik Informatika"
                style={inputStyle(!!focused.prodi)}
              />
            </div>

            {/* No HP */}
            <div>
              <label style={labelStyle}>No. HP <span style={{ color: 'var(--c-text3)', fontWeight: 400 }}>(opsional)</span></label>
              <input
                type="tel" value={form.noHp} onChange={set('noHp')}
                onFocus={() => onFocus('noHp')} onBlur={() => onBlur('noHp')}
                placeholder="08xxxxxxxxxx"
                style={inputStyle(!!focused.noHp)}
              />
            </div>

            {/* Password */}
            <div>
              <label style={labelStyle}>Password <span style={{ color: 'var(--c-red)' }}>*</span></label>
              <input
                type="password" required value={form.password} onChange={set('password')}
                onFocus={() => onFocus('password')} onBlur={() => onBlur('password')}
                placeholder="Minimal 6 karakter"
                autoComplete="new-password"
                style={inputStyle(!!focused.password)}
              />
            </div>

            {/* Konfirmasi Password */}
            <div>
              <label style={labelStyle}>Konfirmasi Password <span style={{ color: 'var(--c-red)' }}>*</span></label>
              <input
                type="password" required value={form.confirmPassword} onChange={set('confirmPassword')}
                onFocus={() => onFocus('confirmPassword')} onBlur={() => onBlur('confirmPassword')}
                placeholder="Ulangi password"
                autoComplete="new-password"
                style={inputStyle(!!focused.confirmPassword)}
              />
            </div>

            {/* Error */}
            {error && (
              <div style={{
                background: '#FEF2F2', border: '1px solid #FECACA',
                borderRadius: '8px', padding: '10px 14px',
                fontSize: '12px', color: '#991B1B',
              }}>
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              onMouseEnter={() => !loading && setBtnHovered(true)}
              onMouseLeave={() => setBtnHovered(false)}
              style={{
                width: '100%', padding: '12px',
                background: loading ? 'rgba(37,99,235,0.65)' : btnHovered ? 'var(--c-blue3)' : 'var(--c-blue)',
                color: '#fff', border: 'none', borderRadius: '9px',
                fontSize: '13px', fontWeight: 600, fontFamily: 'var(--font-sans)',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 200ms var(--ease-spring)',
                transform: btnHovered && !loading ? 'translateY(-1px)' : 'translateY(0)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              }}
            >
              {loading ? (
                <>
                  <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" style={{ opacity: 0.25 }} />
                    <path fill="currentColor" style={{ opacity: 0.75 }} d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Mendaftarkan...
                </>
              ) : 'Daftar'}
            </button>
          </form>

          <p style={{ fontSize: '12px', color: 'var(--c-text3)', textAlign: 'center', marginTop: '20px' }}>
            Sudah punya akun?{' '}
            <Link href="/login" style={{ color: 'var(--c-blue)', fontWeight: 500, textDecoration: 'none' }}>
              Masuk
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
