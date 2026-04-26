'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function WD2Actions({
  bookingId,
  mataKuliah,
}: {
  bookingId: number
  mataKuliah: string
}) {
  const router = useRouter()
  const [showModal, setShowModal]   = useState(false)
  const [nomorSurat, setNomorSurat] = useState('')
  const [catatan, setCatatan]       = useState('')
  const [loading, setLoading]       = useState<'acc' | 'reject' | null>(null)
  const [error, setError]           = useState('')

  async function handleACC() {
    setLoading('acc')
    setError('')
    const res = await fetch(`/api/bookings/${bookingId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'acc', nomorSurat, catatanWD2: catatan }),
    })
    const data = await res.json()
    if (!res.ok) {
      setError(data.error ?? 'Terjadi kesalahan')
      setLoading(null)
      return
    }
    setLoading(null)
    setShowModal(false)
    router.refresh()
  }

  async function handleReject() {
    if (!confirm(`Tolak booking "${mataKuliah}"?`)) return
    setLoading('reject')
    setError('')
    const res = await fetch(`/api/bookings/${bookingId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'reject' }),
    })
    if (res.ok) {
      router.refresh()
      return
    }
    const data = await res.json()
    setError(data.error ?? 'Terjadi kesalahan')
    setLoading(null)
  }

  const disabled = loading !== null

  return (
    <div>
      <div style={{ display: 'flex', gap: '6px' }}>
        <button
          onClick={() => { setShowModal(!showModal); setError('') }}
          disabled={disabled}
          style={{
            background: showModal ? '#BBF7D0' : '#DCFCE7',
            color: '#166534',
            border: 'none', fontSize: '11px', fontWeight: 600,
            borderRadius: '6px', padding: '5px 12px',
            cursor: disabled ? 'not-allowed' : 'pointer',
            transition: 'background 150ms', opacity: disabled ? 0.5 : 1,
            fontFamily: 'var(--font-sans)',
          }}
        >
          ACC
        </button>
        <button
          onClick={handleReject}
          disabled={disabled}
          style={{
            background: '#FEE2E2', color: '#991B1B',
            border: 'none', fontSize: '11px', fontWeight: 600,
            borderRadius: '6px', padding: '5px 12px',
            cursor: disabled ? 'not-allowed' : 'pointer',
            transition: 'background 150ms', opacity: disabled ? 0.5 : 1,
            fontFamily: 'var(--font-sans)',
          }}
        >
          {loading === 'reject' ? '...' : 'Tolak'}
        </button>
      </div>

      {showModal && (
        <div style={{
          marginTop: '10px',
          padding: '14px',
          background: '#F0FDF4',
          border: '1px solid #BBF7D0',
          borderRadius: '8px',
          minWidth: '260px',
        }}>
          <p style={{ fontSize: '12px', fontWeight: 600, color: '#166534', margin: '0 0 10px' }}>
            ACC: {mataKuliah}
          </p>

          <div style={{ marginBottom: '8px' }}>
            <label style={{ fontSize: '11px', fontWeight: 500, color: '#374151', display: 'block', marginBottom: '4px' }}>
              Nomor Surat <span style={{ color: '#DC2626' }}>*</span>
            </label>
            <input
              value={nomorSurat}
              onChange={(e) => setNomorSurat(e.target.value)}
              placeholder="B/XXX/WD2/IV/2025"
              style={{
                width: '100%', boxSizing: 'border-box',
                fontFamily: 'var(--font-mono)', fontSize: '12px',
                padding: '7px 10px',
                border: '1px solid #D1D5DB', borderRadius: '8px',
                outline: 'none', background: '#fff',
              }}
            />
          </div>

          <div style={{ marginBottom: '10px' }}>
            <label style={{ fontSize: '11px', fontWeight: 500, color: '#374151', display: 'block', marginBottom: '4px' }}>
              Catatan{' '}
              <span style={{ fontSize: '10px', color: '#9CA3AF' }}>(opsional)</span>
            </label>
            <textarea
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              placeholder="Disetujui untuk penggunaan..."
              rows={2}
              style={{
                width: '100%', boxSizing: 'border-box',
                fontSize: '12px', fontFamily: 'var(--font-sans)',
                padding: '7px 10px',
                border: '1px solid #D1D5DB', borderRadius: '8px',
                outline: 'none', resize: 'vertical', background: '#fff',
              }}
            />
          </div>

          {error && (
            <p style={{ fontSize: '11px', color: '#991B1B', margin: '0 0 8px' }}>{error}</p>
          )}

          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              onClick={handleACC}
              disabled={disabled || !nomorSurat.trim()}
              style={{
                background: disabled || !nomorSurat.trim() ? '#93C5FD' : '#2563EB',
                color: '#fff',
                border: 'none', fontSize: '11px', fontWeight: 600,
                borderRadius: '6px', padding: '6px 14px',
                cursor: disabled || !nomorSurat.trim() ? 'not-allowed' : 'pointer',
                transition: 'background 150ms',
                fontFamily: 'var(--font-sans)',
              }}
            >
              {loading === 'acc' ? '...' : 'Konfirmasi ACC'}
            </button>
            <button
              onClick={() => { setShowModal(false); setError('') }}
              disabled={disabled}
              style={{
                background: 'transparent', color: '#6B7280',
                border: '1px solid #D1D5DB', fontSize: '11px', fontWeight: 500,
                borderRadius: '6px', padding: '6px 12px',
                cursor: disabled ? 'not-allowed' : 'pointer',
                fontFamily: 'var(--font-sans)',
              }}
            >
              Batal
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
