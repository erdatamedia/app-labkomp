import { getStatusBadge } from '@/lib/statusBadge'

export default function StatusBadge({ status }: { status: string }) {
  const { bg, color, dot, label } = getStatusBadge(status)
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '5px',
      padding: '2px 10px', borderRadius: '20px',
      background: bg, color,
      fontSize: '11px', fontWeight: 500,
      fontFamily: 'var(--font-jetbrains)',
      whiteSpace: 'nowrap',
    }}>
      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: dot, flexShrink: 0 }} />
      {label}
    </span>
  )
}
