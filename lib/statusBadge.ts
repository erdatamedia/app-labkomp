type BadgeConfig = {
  label: string
  bg: string
  color: string
  dot: string
}

const statusMap: Record<string, BadgeConfig> = {
  PENDING:  { label: 'Menunggu WD2',  bg: '#FEF3C7', color: '#92400E', dot: '#F59E0B' },
  WD2_ACC:  { label: 'Menunggu Admin', bg: '#EFF6FF', color: '#1D4ED8', dot: '#3B82F6' },
  APPROVED: { label: 'Disetujui',      bg: '#DCFCE7', color: '#166534', dot: '#10B981' },
  REJECTED: { label: 'Ditolak',        bg: '#FEE2E2', color: '#991B1B', dot: '#EF4444' },
}

export function getStatusBadge(status: string): BadgeConfig {
  return statusMap[status] ?? { label: status, bg: '#F1F5F9', color: '#475569', dot: '#94A3B8' }
}
