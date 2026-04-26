'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useEffect, Suspense } from 'react'

const controlStyle: React.CSSProperties = {
  fontSize: '13px',
  border: '1px solid var(--c-border)',
  borderRadius: '8px',
  padding: '8px 12px',
  background: '#fff',
  color: 'var(--c-text)',
  outline: 'none',
  fontFamily: 'var(--font-sans)',
}

function Filters({ weeks }: { weeks: number[] }) {
  const router       = useRouter()
  const searchParams = useSearchParams()

  const hari   = searchParams.get('hari')   ?? ''
  const minggu = searchParams.get('minggu') ?? ''
  const q      = searchParams.get('q')      ?? ''

  const [searchVal, setSearchVal] = useState(q)

  // Debounce search → update URL
  useEffect(() => {
    if (searchVal === q) return
    const timer = setTimeout(() => updateParam('q', searchVal), 400)
    return () => clearTimeout(timer)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchVal])

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (value) params.set(key, value); else params.delete(key)
    params.delete('page')
    router.push(`/schedule?${params.toString()}`)
  }

  return (
    <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
      {/* Hari */}
      <select
        value={hari}
        onChange={(e) => updateParam('hari', e.target.value)}
        style={controlStyle}
      >
        <option value="">Semua Hari</option>
        {['Senin','Selasa','Rabu','Kamis','Jumat'].map((d) => (
          <option key={d} value={d}>{d}</option>
        ))}
      </select>

      {/* Minggu */}
      <select
        value={minggu}
        onChange={(e) => updateParam('minggu', e.target.value)}
        style={controlStyle}
      >
        <option value="">Semua Minggu</option>
        {weeks.map((w) => (
          <option key={w} value={w}>Minggu {w}</option>
        ))}
      </select>

      {/* Search */}
      <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
        <svg
          width="14" height="14" fill="none" viewBox="0 0 24 24"
          stroke="currentColor" strokeWidth={2}
          style={{
            position: 'absolute', left: '10px', top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--c-text3)', pointerEvents: 'none',
          }}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
        </svg>
        <input
          type="text"
          value={searchVal}
          onChange={(e) => setSearchVal(e.target.value)}
          placeholder="Cari mata kuliah / dosen..."
          style={{ ...controlStyle, width: '100%', paddingLeft: '32px' }}
        />
      </div>
    </div>
  )
}

export default function ScheduleFilters({ weeks }: { weeks: number[] }) {
  return (
    <Suspense fallback={
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        <div className="skeleton" style={{ width: '110px', height: '38px' }} />
        <div className="skeleton" style={{ width: '110px', height: '38px' }} />
        <div className="skeleton" style={{ flex: 1, minWidth: '200px', height: '38px' }} />
      </div>
    }>
      <Filters weeks={weeks} />
    </Suspense>
  )
}
