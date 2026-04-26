import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'
import StatusBadge from '@/app/components/StatusBadge'
import WD2Actions from './WD2Actions'

function formatTime(d: Date) {
  return new Date(d).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
}

function formatDate(d: Date) {
  return new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
}

const thStyle: React.CSSProperties = {
  fontSize: '10px', fontWeight: 600, textTransform: 'uppercase',
  letterSpacing: '0.06em', color: 'var(--c-text3)',
  padding: '10px 16px', background: '#FAFBFC',
  borderBottom: '1px solid #F1F5F9', textAlign: 'left',
  whiteSpace: 'nowrap',
}

const tdStyle: React.CSSProperties = {
  fontSize: '12px', color: 'var(--c-text2)',
  padding: '12px 16px', borderBottom: '1px solid #F8FAFC',
  verticalAlign: 'top',
}

const cardStyle: React.CSSProperties = {
  background: '#fff',
  border: '1px solid var(--c-border)',
  borderRadius: '12px',
  overflow: 'hidden',
}

const cardHeaderStyle: React.CSSProperties = {
  padding: '14px 20px',
  borderBottom: '1px solid var(--c-border)',
  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
}

const EmptyRow = ({ colSpan, label }: { colSpan: number; label: string }) => (
  <tr>
    <td colSpan={colSpan} style={{ padding: '32px', textAlign: 'center', color: 'var(--c-text3)' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
        <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2} style={{ opacity: 0.35 }}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" />
        </svg>
        <span style={{ fontSize: '13px' }}>{label}</span>
      </div>
    </td>
  </tr>
)

export default async function WD2Page() {
  const session = await getSession()
  if (!session || session.role !== 'WD2') return null

  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const [pendingCount, wd2AccCount, processedCount, pending, history] = await Promise.all([
    prisma.booking.count({ where: { status: 'PENDING' } }),
    prisma.booking.count({ where: { status: 'WD2_ACC' } }),
    prisma.booking.count({ where: { status: { in: ['WD2_ACC', 'APPROVED', 'REJECTED'] } } }),
    prisma.booking.findMany({
      where: { status: 'PENDING' },
      include: { user: { select: { name: true } } },
      orderBy: { createdAt: 'asc' },
    }),
    prisma.booking.findMany({
      where: {
        status: { in: ['WD2_ACC', 'APPROVED', 'REJECTED'] },
        createdAt: { gte: thirtyDaysAgo },
      },
      include: { user: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
    }),
  ])

  const statCards = [
    {
      label: 'Menunggu Review',
      value: pendingCount,
      valueColor: '#92400E',
      cardBg: pendingCount > 0 ? '#FFFBEB' : '#fff',
      dot: '#F59E0B',
      sub: 'belum diproses',
    },
    {
      label: 'Sudah di-ACC',
      value: wd2AccCount,
      valueColor: '#0E7490',
      cardBg: '#F0FDFA',
      dot: '#0EA5E9',
      sub: 'menunggu admin',
    },
    {
      label: 'Total Diproses',
      value: processedCount,
      valueColor: 'var(--c-text)',
      cardBg: '#fff',
      dot: '#94A3B8',
      sub: 'ACC + disetujui + ditolak',
    },
  ]

  return (
    <div className="animate-fade-up" style={{ padding: '32px', maxWidth: '1000px', margin: '0 auto' }}>

      {/* ── Header ──────────────────────────────────────────────── */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{
          fontSize: '22px', fontWeight: 700, letterSpacing: '-0.02em',
          color: 'var(--c-text)', margin: '0 0 4px',
        }}>
          Dashboard Wakil Dekan 2
        </h1>
        <p style={{ fontSize: '13px', color: 'var(--c-text3)', margin: 0 }}>
          Kelola persetujuan penggunaan Laboratorium Komputer
        </p>
      </div>

      {/* ── Stat Cards ──────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '24px' }}>
        {statCards.map((card) => (
          <div
            key={card.label}
            style={{
              background: card.cardBg,
              border: '1px solid var(--c-border)',
              borderRadius: '10px',
              padding: '18px 20px',
            }}
          >
            <p style={{
              fontSize: '10px', fontWeight: 600, textTransform: 'uppercase',
              letterSpacing: '0.06em', color: 'var(--c-text3)',
              margin: '0 0 10px',
            }}>
              {card.label}
            </p>
            <p style={{
              fontSize: '28px', fontWeight: 700, letterSpacing: '-0.03em',
              color: card.valueColor, margin: '0 0 8px',
              fontFamily: 'var(--font-mono)',
            }}>
              {card.value}
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: card.dot, display: 'inline-block' }} />
              <span style={{ fontSize: '11px', color: 'var(--c-text3)' }}>{card.sub}</span>
            </div>
          </div>
        ))}
      </div>

      {/* ── Pending Section ─────────────────────────────────────── */}
      <div style={{ ...cardStyle, marginBottom: '20px' }}>
        <div style={cardHeaderStyle}>
          <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--c-text)' }}>
            Menunggu Persetujuan
          </span>
          {pendingCount > 0 && (
            <span style={{
              background: '#FEF3C7', color: '#92400E',
              padding: '2px 10px', borderRadius: '20px',
              fontSize: '11px', fontWeight: 500,
            }}>
              {pendingCount}
            </span>
          )}
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['No', 'Dosen', 'Prodi', 'Mata Kuliah', 'Hari & Jam', 'Minggu', 'Software', 'Aksi'].map((h) => (
                  <th key={h} style={thStyle}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pending.length === 0 ? (
                <EmptyRow colSpan={8} label="Tidak ada booking menunggu persetujuan" />
              ) : (
                pending.map((b, i) => (
                  <tr key={b.id} style={{ background: i % 2 === 0 ? '#fff' : '#FAFBFC' }}>
                    <td style={{ ...tdStyle, color: 'var(--c-text3)', fontFamily: 'var(--font-mono)', fontSize: '11px' }}>
                      {i + 1}
                    </td>
                    <td style={{ ...tdStyle, fontWeight: 500, color: 'var(--c-text)', whiteSpace: 'nowrap' }}>
                      {b.user.name}
                    </td>
                    <td style={tdStyle}>{b.prodi}</td>
                    <td style={{ ...tdStyle, fontWeight: 500, color: 'var(--c-text)' }}>{b.mataKuliah}</td>
                    <td style={{ ...tdStyle, fontFamily: 'var(--font-mono)', fontSize: '11px', whiteSpace: 'nowrap' }}>
                      {b.hari}{' '}
                      <span style={{ opacity: 0.7 }}>
                        {formatTime(b.jamMulai)}–{formatTime(b.jamSelesai)}
                      </span>
                    </td>
                    <td style={{ ...tdStyle, fontFamily: 'var(--font-mono)', fontSize: '11px' }}>
                      {b.mingguMulai === b.mingguSelesai
                        ? `${b.mingguMulai}`
                        : `${b.mingguMulai}–${b.mingguSelesai}`}
                    </td>
                    <td style={tdStyle}>{b.software}</td>
                    <td style={{ ...tdStyle, minWidth: '180px' }}>
                      <WD2Actions bookingId={b.id} mataKuliah={b.mataKuliah} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── History Section ─────────────────────────────────────── */}
      <div style={cardStyle}>
        <div style={cardHeaderStyle}>
          <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--c-text)' }}>
            Riwayat yang Sudah Diproses
          </span>
          <span style={{ fontSize: '11px', color: 'var(--c-text3)' }}>30 hari terakhir</span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['Dosen', 'Mata Kuliah', 'Jadwal', 'No. Surat', 'Tgl Surat', 'Status', 'Aksi'].map((h) => (
                  <th key={h} style={thStyle}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {history.length === 0 ? (
                <EmptyRow colSpan={7} label="Belum ada riwayat dalam 30 hari terakhir" />
              ) : (
                history.map((b) => (
                  <tr key={b.id} className="admin-row">
                    <td style={{ ...tdStyle, fontWeight: 500, color: 'var(--c-text)', whiteSpace: 'nowrap' }}>
                      {b.user.name}
                    </td>
                    <td style={tdStyle}>{b.mataKuliah}</td>
                    <td style={{ ...tdStyle, fontFamily: 'var(--font-mono)', fontSize: '11px', whiteSpace: 'nowrap' }}>
                      {b.hari}{' '}
                      <span style={{ opacity: 0.7 }}>
                        {formatTime(b.jamMulai)}–{formatTime(b.jamSelesai)}
                      </span>
                    </td>
                    <td style={{ ...tdStyle, fontFamily: 'var(--font-mono)', fontSize: '11px' }}>
                      {b.nomorSurat ?? <span style={{ opacity: 0.4 }}>—</span>}
                    </td>
                    <td style={{ ...tdStyle, fontSize: '11px', whiteSpace: 'nowrap' }}>
                      {b.tanggalSurat ? formatDate(b.tanggalSurat) : <span style={{ opacity: 0.4 }}>—</span>}
                    </td>
                    <td style={tdStyle}>
                      <StatusBadge status={b.status} />
                    </td>
                    <td style={tdStyle}>
                      {b.nomorSurat ? (
                        <a
                          href={`/wd2/surat/${b.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            fontSize: '11px', fontWeight: 500,
                            color: '#2563EB', textDecoration: 'none',
                            padding: '4px 10px',
                            border: '1px solid #BFDBFE',
                            borderRadius: '6px',
                            background: '#EFF6FF',
                            display: 'inline-block',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          Lihat Surat
                        </a>
                      ) : (
                        <span style={{ fontSize: '11px', color: 'var(--c-text3)', opacity: 0.5 }}>—</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {history.length > 0 && (
          <div style={{
            padding: '10px 20px',
            borderTop: '1px solid var(--c-border)',
            fontSize: '11px', color: 'var(--c-text3)',
            fontFamily: 'var(--font-mono)',
          }}>
            {history.length} entri ditampilkan
          </div>
        )}
      </div>
    </div>
  )
}
