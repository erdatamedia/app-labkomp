'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

const selectStyle: React.CSSProperties = {
  fontSize: '12px',
  border: '1px solid var(--c-border)',
  borderRadius: '7px',
  padding: '6px 10px',
  background: '#fff',
  color: 'var(--c-text)',
  outline: 'none',
  cursor: 'pointer',
}

function Filters({ weeks }: { weeks: number[] }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const hari   = searchParams.get('hari')   ?? ''
  const minggu = searchParams.get('minggu') ?? ''

  function update(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (value) params.set(key, value)
    else params.delete(key)
    router.push(`/admin?${params.toString()}`)
  }

  return (
    <div style={{ display: 'flex', gap: '8px' }}>
      <select value={hari} onChange={(e) => update('hari', e.target.value)} style={selectStyle}>
        <option value="">Semua Hari</option>
        {['Senin','Selasa','Rabu','Kamis','Jumat'].map((d) => (
          <option key={d} value={d}>{d}</option>
        ))}
      </select>
      <select value={minggu} onChange={(e) => update('minggu', e.target.value)} style={selectStyle}>
        <option value="">Semua Minggu</option>
        {weeks.map((w) => (
          <option key={w} value={w}>Minggu {w}</option>
        ))}
      </select>
    </div>
  )
}

export default function AdminFilters({ weeks }: { weeks: number[] }) {
  return (
    <Suspense fallback={
      <div style={{ display: 'flex', gap: '8px' }}>
        <div className="skeleton" style={{ width: '110px', height: '34px' }} />
        <div className="skeleton" style={{ width: '110px', height: '34px' }} />
      </div>
    }>
      <Filters weeks={weeks} />
    </Suspense>
  )
}
