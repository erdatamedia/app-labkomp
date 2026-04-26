'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminActions({ bookingId }: { bookingId: number }) {
  const router = useRouter()
  const [loading, setLoading]               = useState<'approve' | 'reject' | null>(null)
  const [error, setError]                   = useState('')
  const [approveHovered, setApproveHovered] = useState(false)
  const [rejectHovered, setRejectHovered]   = useState(false)

  async function handleAction(action: 'approve' | 'reject') {
    setLoading(action)
    setError('')

    const res = await fetch(`/api/bookings/${bookingId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action }),
    })

    const data = await res.json()

    if (!res.ok) {
      setError(data.error ?? 'Terjadi kesalahan')
      setLoading(null)
      return
    }

    setLoading(null)
    router.refresh()
  }

  const disabled = loading !== null

  return (
    <div>
      <div style={{ display: 'flex', gap: '6px' }}>
        <button
          onClick={() => handleAction('approve')}
          disabled={disabled}
          onMouseEnter={() => setApproveHovered(true)}
          onMouseLeave={() => setApproveHovered(false)}
          style={{
            background: approveHovered && !disabled ? '#BBF7D0' : '#DCFCE7',
            color: '#166534',
            border: 'none',
            fontSize: '11px', fontWeight: 600,
            borderRadius: '6px', padding: '5px 12px',
            cursor: disabled ? 'not-allowed' : 'pointer',
            transition: 'all 150ms',
            opacity: disabled ? 0.5 : 1,
            fontFamily: 'var(--font-sans)',
          }}
        >
          {loading === 'approve' ? '...' : 'Setujui'}
        </button>
        <button
          onClick={() => handleAction('reject')}
          disabled={disabled}
          onMouseEnter={() => setRejectHovered(true)}
          onMouseLeave={() => setRejectHovered(false)}
          style={{
            background: rejectHovered && !disabled ? '#FECACA' : '#FEE2E2',
            color: '#991B1B',
            border: 'none',
            fontSize: '11px', fontWeight: 600,
            borderRadius: '6px', padding: '5px 12px',
            cursor: disabled ? 'not-allowed' : 'pointer',
            transition: 'all 150ms',
            opacity: disabled ? 0.5 : 1,
            fontFamily: 'var(--font-sans)',
          }}
        >
          {loading === 'reject' ? '...' : 'Tolak'}
        </button>
      </div>
      {error && (
        <p style={{
          fontSize: '11px', color: '#991B1B', marginTop: '6px',
          maxWidth: '240px', background: '#FEF2F2',
          borderRadius: '4px', padding: '4px 8px', lineHeight: 1.4,
        }}>
          {error}
        </p>
      )}
    </div>
  )
}
