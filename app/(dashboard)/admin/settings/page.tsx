'use client'

import { useEffect, useRef, useState } from 'react'

type Settings = {
  namaInstansi: string
  namaFakultas: string
  namaJurusan: string
  logoUrl: string | null
  alamat: string | null
}

type Tab = 'identitas' | 'keamanan'

function Toast({ message, type, onDone }: { message: string; type: 'success' | 'error'; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 3000)
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
      boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
      animation: 'fadeInUp 200ms ease forwards',
    }}>
      {message}
    </div>
  )
}

export default function AdminSettingsPage() {
  const [tab, setTab] = useState<Tab>('identitas')
  const [settings, setSettings] = useState<Settings | null>(null)
  const [form, setForm] = useState({ namaInstansi: '', namaFakultas: '', namaJurusan: '', alamat: '' })
  const [saving, setSaving] = useState(false)

  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  useEffect(() => {
    fetch('/api/settings')
      .then((r) => r.json())
      .then((data: Settings) => {
        setSettings(data)
        setForm({
          namaInstansi: data.namaInstansi ?? '',
          namaFakultas: data.namaFakultas ?? '',
          namaJurusan: data.namaJurusan ?? '',
          alamat: data.alamat ?? '',
        })
      })
  }, [])

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setSelectedFile(file)
    setPreviewUrl(URL.createObjectURL(file))
  }

  async function handleLogoUpload() {
    if (!selectedFile) return
    setUploadingLogo(true)
    try {
      const fd = new FormData()
      fd.append('logo', selectedFile)
      const res = await fetch('/api/settings/logo', { method: 'POST', body: fd })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Gagal upload')
      setSettings((prev) => prev ? { ...prev, logoUrl: json.logoUrl } : prev)
      setSelectedFile(null)
      window.dispatchEvent(new CustomEvent('settings:logo-updated', { detail: { logoUrl: json.logoUrl } }))
      setToast({ message: 'Logo berhasil diperbarui', type: 'success' })
    } catch (err: unknown) {
      setToast({ message: err instanceof Error ? err.message : 'Gagal upload logo', type: 'error' })
    } finally {
      setUploadingLogo(false)
    }
  }

  async function handleSaveIdentitas(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch('/api/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Gagal menyimpan')
      setSettings((prev) => prev ? { ...prev, ...json } : prev)
      window.dispatchEvent(new CustomEvent('settings:updated', { detail: json }))
      setToast({ message: 'Pengaturan disimpan', type: 'success' })
    } catch (err: unknown) {
      setToast({ message: err instanceof Error ? err.message : 'Gagal menyimpan', type: 'error' })
    } finally {
      setSaving(false)
    }
  }

  const logoSrc = previewUrl ?? (settings?.logoUrl ? `${settings.logoUrl}?v=${Date.now()}` : null)

  const tabStyle = (active: boolean): React.CSSProperties => ({
    padding: '8px 18px',
    fontSize: '13px',
    fontWeight: active ? 600 : 400,
    color: active ? 'var(--c-blue)' : 'var(--c-text2)',
    background: active ? '#EFF6FF' : 'transparent',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 150ms',
  })

  const inputStyle: React.CSSProperties = {
    width: '100%',
    border: '1px solid var(--c-border)',
    borderRadius: '8px',
    padding: '9px 12px',
    fontSize: '13px',
    color: 'var(--c-text)',
    background: '#fff',
    outline: 'none',
  }

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '12px',
    fontWeight: 500,
    color: 'var(--c-text2)',
    marginBottom: '6px',
  }

  return (
    <div className="animate-fade-up" style={{ padding: '32px', maxWidth: '720px', margin: '0 auto' }}>
      {toast && (
        <Toast message={toast.message} type={toast.type} onDone={() => setToast(null)} />
      )}

      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--c-text)', margin: '0 0 4px' }}>
          Pengaturan Sistem
        </h1>
        <p style={{ fontSize: '12px', color: 'var(--c-text3)', margin: 0 }}>
          Kelola identitas institusi dan konfigurasi aplikasi
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '20px', background: '#F8FAFC', borderRadius: '10px', padding: '4px', width: 'fit-content' }}>
        <button style={tabStyle(tab === 'identitas')} onClick={() => setTab('identitas')}>
          Identitas Institusi
        </button>
        <button style={tabStyle(tab === 'keamanan')} onClick={() => setTab('keamanan')}>
          Keamanan
        </button>
      </div>

      {/* ── TAB: Identitas ─────────────────────────────────── */}
      {tab === 'identitas' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* Logo card */}
          <div style={{ background: '#fff', border: '1px solid var(--c-border)', borderRadius: '12px', padding: '24px' }}>
            <h2 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--c-text)', margin: '0 0 16px' }}>
              Logo Institusi
            </h2>

            {/* Upload area */}
            <div
              onClick={() => fileInputRef.current?.click()}
              style={{
                width: '180px',
                height: '80px',
                border: '2px dashed var(--c-border)',
                borderRadius: '10px',
                background: '#FAFBFC',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                transition: 'border-color 150ms',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--c-blue)')}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--c-border)')}
            >
              {logoSrc ? (
                <img
                  src={logoSrc}
                  alt="Logo"
                  style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '8px' }}
                />
              ) : (
                <div style={{ textAlign: 'center', color: 'var(--c-text3)' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} style={{ display: 'block', margin: '0 auto 4px' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 18.75h16.5a1.5 1.5 0 001.5-1.5V6.75a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6.75v10.5A1.5 1.5 0 003.75 18.75z" />
                  </svg>
                  <span style={{ fontSize: '11px' }}>Klik untuk upload logo</span>
                </div>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg"
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />

            {selectedFile && (
              <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '12px', color: 'var(--c-text2)' }}>
                  {selectedFile.name} · {(selectedFile.size / 1024).toFixed(0)} KB
                </span>
                <button
                  onClick={handleLogoUpload}
                  disabled={uploadingLogo}
                  className="btn-spring"
                  style={{
                    background: 'var(--c-blue)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '7px',
                    padding: '6px 14px',
                    fontSize: '12px',
                    fontWeight: 500,
                    cursor: uploadingLogo ? 'not-allowed' : 'pointer',
                    opacity: uploadingLogo ? 0.7 : 1,
                  }}
                >
                  {uploadingLogo ? 'Menyimpan…' : 'Simpan Logo'}
                </button>
              </div>
            )}

            <p style={{ marginTop: '10px', fontSize: '11px', color: 'var(--c-text3)', margin: '10px 0 0' }}>
              Format PNG atau JPEG, maks. 2 MB
            </p>
          </div>

          {/* Identitas form card */}
          <div style={{ background: '#fff', border: '1px solid var(--c-border)', borderRadius: '12px', padding: '24px' }}>
            <h2 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--c-text)', margin: '0 0 20px' }}>
              Nama Institusi
            </h2>

            <form onSubmit={handleSaveIdentitas} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={labelStyle}>Nama Universitas / Institusi <span style={{ color: 'var(--c-red)' }}>*</span></label>
                <input
                  required
                  value={form.namaInstansi}
                  onChange={(e) => setForm((f) => ({ ...f, namaInstansi: e.target.value }))}
                  style={inputStyle}
                  placeholder="Contoh: Universitas Negeri Malang"
                />
              </div>

              <div>
                <label style={labelStyle}>Nama Fakultas <span style={{ color: 'var(--c-red)' }}>*</span></label>
                <input
                  required
                  value={form.namaFakultas}
                  onChange={(e) => setForm((f) => ({ ...f, namaFakultas: e.target.value }))}
                  style={inputStyle}
                  placeholder="Contoh: Fakultas Teknik"
                />
              </div>

              <div>
                <label style={labelStyle}>Nama Jurusan <span style={{ color: 'var(--c-red)' }}>*</span></label>
                <input
                  required
                  value={form.namaJurusan}
                  onChange={(e) => setForm((f) => ({ ...f, namaJurusan: e.target.value }))}
                  style={inputStyle}
                  placeholder="Contoh: Teknik Informatika"
                />
              </div>

              <div>
                <label style={labelStyle}>Alamat</label>
                <textarea
                  rows={2}
                  value={form.alamat}
                  onChange={(e) => setForm((f) => ({ ...f, alamat: e.target.value }))}
                  style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }}
                  placeholder="Alamat lengkap institusi (opsional)"
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  type="submit"
                  disabled={saving}
                  className="btn-spring"
                  style={{
                    background: 'var(--c-blue)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '9px 22px',
                    fontSize: '13px',
                    fontWeight: 500,
                    cursor: saving ? 'not-allowed' : 'pointer',
                    opacity: saving ? 0.7 : 1,
                  }}
                >
                  {saving ? 'Menyimpan…' : 'Simpan Perubahan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── TAB: Keamanan ──────────────────────────────────── */}
      {tab === 'keamanan' && (
        <div style={{ background: '#fff', border: '1px solid var(--c-border)', borderRadius: '12px', padding: '40px', textAlign: 'center' }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.2} style={{ display: 'block', margin: '0 auto 12px', opacity: 0.3 }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
          </svg>
          <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--c-text)', margin: '0 0 6px' }}>Segera Hadir</p>
          <p style={{ fontSize: '13px', color: 'var(--c-text3)', margin: 0 }}>Fitur ganti password akan tersedia di pembaruan berikutnya.</p>
        </div>
      )}
    </div>
  )
}
