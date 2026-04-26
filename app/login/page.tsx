'use client'

import { useState, FormEvent, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [email, setEmail]                     = useState('')
  const [password, setPassword]               = useState('')
  const [loading, setLoading]                 = useState(false)
  const [error, setError]                     = useState('')
  const [emailFocused, setEmailFocused]       = useState(false)
  const [passwordFocused, setPasswordFocused] = useState(false)
  const [btnHovered, setBtnHovered]           = useState(false)

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })

    const data = await res.json()

    if (!res.ok) {
      setError(data.error ?? 'Login gagal')
      setLoading(false)
      return
    }

    router.push(searchParams.get('from') ?? '/')
  }

  const inputStyle = (focused: boolean): React.CSSProperties => ({
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
  })

  const features = [
    'Booking berulang (recurring) otomatis',
    'Notifikasi status persetujuan real-time',
    'Deteksi konflik jadwal otomatis',
    'Dashboard admin yang komprehensif',
  ]

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', minHeight: '100vh' }}>

      {/* ── Panel Kiri (branding) ────────────────────────────────── */}
      <div
        className="hidden md:flex flex-col justify-between"
        style={{ background: 'var(--c-navy)', padding: '48px 44px' }}
      >
        {/* Logo */}
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

          {/* Copy */}
          <div>
            <p style={{ fontSize: '10px', color: 'var(--c-blue2)', letterSpacing: '0.1em', fontWeight: 500, marginBottom: '10px' }}>
              SELAMAT DATANG
            </p>
            <h1 style={{
              fontSize: '26px', fontWeight: 700, color: '#fff',
              letterSpacing: '-0.02em', lineHeight: 1.25, marginBottom: '12px', margin: '0 0 12px',
            }}>
              Kelola jadwal lab dengan mudah
            </h1>
            <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.45)', lineHeight: 1.65, margin: 0 }}>
              Platform terpadu untuk booking laboratorium komputer,
              manajemen jadwal, dan persetujuan penggunaan lab.
            </p>

            {/* Feature list */}
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

        {/* Footer */}
        <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.2)', margin: 0 }}>
          © 2025 Laboratorium Komputer
        </p>
      </div>

      {/* ── Panel Kanan (form) ───────────────────────────────────── */}
      <div style={{
        background: '#fff',
        padding: '0 48px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{ maxWidth: '340px', width: '100%' }}>
          <h2 style={{
            fontSize: '22px', fontWeight: 700,
            letterSpacing: '-0.02em', color: 'var(--c-text)',
            marginBottom: '6px', margin: '0 0 6px',
          }}>
            Masuk ke akun
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--c-text3)', marginBottom: '32px', margin: '0 0 32px' }}>
            Gunakan email dan password yang terdaftar
          </p>

          <form onSubmit={handleSubmit}>
            {/* Email */}
            <div style={{ marginBottom: '14px' }}>
              <label style={{
                display: 'block', fontSize: '11px', fontWeight: 500,
                color: 'var(--c-text3)', letterSpacing: '0.05em',
                textTransform: 'uppercase', marginBottom: '6px',
              }}>
                Email
              </label>
              <input
                type="email"
                required
                autoComplete="email"
                placeholder="nama@institusi.ac.id"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setEmailFocused(true)}
                onBlur={() => setEmailFocused(false)}
                style={inputStyle(emailFocused)}
              />
            </div>

            {/* Password */}
            <div style={{ marginBottom: '14px' }}>
              <label style={{
                display: 'block', fontSize: '11px', fontWeight: 500,
                color: 'var(--c-text3)', letterSpacing: '0.05em',
                textTransform: 'uppercase', marginBottom: '6px',
              }}>
                Password
              </label>
              <input
                type="password"
                required
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setPasswordFocused(true)}
                onBlur={() => setPasswordFocused(false)}
                style={inputStyle(passwordFocused)}
              />
            </div>

            {/* Error */}
            {error && (
              <div
                className="animate-fade-up"
                style={{
                  background: '#FEF2F2',
                  border: '1px solid #FECACA',
                  borderRadius: '8px',
                  padding: '10px 14px',
                  marginBottom: '14px',
                  fontSize: '12px',
                  color: '#991B1B',
                }}
              >
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
                width: '100%',
                padding: '12px',
                background: loading
                  ? 'rgba(37,99,235,0.65)'
                  : btnHovered
                  ? 'var(--c-blue3)'
                  : 'var(--c-blue)',
                color: '#fff',
                border: 'none',
                borderRadius: '9px',
                fontSize: '13px',
                fontWeight: 600,
                fontFamily: 'var(--font-sans)',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 200ms var(--ease-spring)',
                transform: btnHovered && !loading ? 'translateY(-1px)' : 'translateY(0)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
              }}
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin"
                    width="14" height="14"
                    viewBox="0 0 24 24" fill="none"
                    style={{ flexShrink: 0 }}
                  >
                    <circle
                      cx="12" cy="12" r="10"
                      stroke="currentColor" strokeWidth="4"
                      style={{ opacity: 0.25 }}
                    />
                    <path
                      fill="currentColor"
                      style={{ opacity: 0.75 }}
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Memproses...
                </>
              ) : (
                'Masuk'
              )}
            </button>
          </form>

          <p style={{ fontSize: '11px', color: 'var(--c-text3)', textAlign: 'center', marginTop: '20px' }}>
            Lupa password? Hubungi admin lab
          </p>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}
