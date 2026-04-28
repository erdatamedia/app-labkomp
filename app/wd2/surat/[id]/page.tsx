import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'
import { notFound, redirect } from 'next/navigation'
import PrintButton from '../PrintButton'

function formatNip(nip: string): string {
  if (!nip || nip.length !== 18) return nip ?? '-'
  return `${nip.slice(0, 8)} ${nip.slice(8, 14)} ${nip.slice(14, 15)} ${nip.slice(15)}`
}

function formatTime(d: Date) {
  return new Date(d).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
}

function formatDateLong(d: Date) {
  return new Date(d).toLocaleDateString('id-ID', {
    day: 'numeric', month: 'long', year: 'numeric',
  })
}

function TTEBox({ tanggalSurat, nomorSurat }: { tanggalSurat: Date; nomorSurat: string }) {
  return (
    <div className="tte-box" style={{
      border: '1px solid #E2E8F0',
      borderRadius: '8px',
      padding: '10px 14px',
      background: '#F0FDF4',
      display: 'inline-block',
      marginBottom: '8px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '2px' }}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#166534" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
        </svg>
        <span style={{ fontSize: '10px', color: '#166534', fontWeight: 500 }}>
          Telah ditandatangani secara elektronik
        </span>
      </div>
      <div style={{ fontSize: '10px', color: '#4ADE80', marginBottom: '2px' }}>
        pada {formatDateLong(tanggalSurat)}
      </div>
      <div style={{ fontSize: '10px', color: '#166534', fontFamily: 'monospace' }}>
        Nomor: {nomorSurat}
      </div>
    </div>
  )
}

export default async function SuratPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await getSession()
  if (!session) redirect('/login')
  if (session.role !== 'WD2' && session.role !== 'ADMIN') redirect('/')

  const { id } = await params
  const [booking, appSettings, wd2User] = await Promise.all([
    prisma.booking.findUnique({
      where: { id: Number(id) },
      include: { user: { select: { name: true } } },
    }),
    prisma.appSettings.findUnique({ where: { id: 'singleton' } }),
    prisma.user.findFirst({
      where: { role: 'WD2', isActive: true },
      select: { name: true, jabatan: true, nip: true },
    }),
  ])

  const namaInstansi = appSettings?.namaInstansi ?? 'Universitas'
  const namaFakultas = appSettings?.namaFakultas ?? 'Fakultas Teknik'
  const namaJurusan  = appSettings?.namaJurusan  ?? 'Teknik Informatika'
  const alamat       = appSettings?.alamat        ?? null
  const logoUrl      = appSettings?.logoUrl       ?? null

  if (!booking) notFound()

  const tanggal = booking.tanggalSurat
    ? formatDateLong(booking.tanggalSurat)
    : formatDateLong(new Date())

  const ttdSpaceHeight = booking.isTTE ? '16px' : '48px'

  return (
    <>
      <style>{`
        @media print {
          .no-print,
          nav,
          header,
          footer,
          .navbar,
          button {
            display: none !important;
          }

          @page {
            size: A4;
            margin: 2cm 2.5cm;
          }

          body {
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          .surat-wrap {
            padding: 0 !important;
            background: white !important;
            min-height: unset !important;
          }

          .surat-container {
            max-width: 100% !important;
            padding: 0 !important;
            margin: 0 !important;
            box-shadow: none !important;
            border: none !important;
            border-radius: 0 !important;
          }

          table { page-break-inside: avoid; }

          .ttd-grid {
            display: grid !important;
            grid-template-columns: 1fr 1fr !important;
          }

          .tte-box {
            border: 1px solid #000 !important;
            background: #f9f9f9 !important;
            -webkit-print-color-adjust: exact;
          }
        }
      `}</style>

      {/* ── Toolbar (hidden on print) ─────────────────────────────── */}
      <div className="no-print" style={{
        position: 'sticky', top: 0, zIndex: 10,
        background: 'rgba(255,255,255,0.95)',
        backdropFilter: 'blur(8px)',
        borderBottom: '1px solid #E2E8F0',
        padding: '10px 32px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '12px', color: '#64748B' }}>Surat Persetujuan</span>
          <span style={{ color: '#CBD5E1', fontSize: '12px' }}>/</span>
          <span style={{ fontSize: '12px', color: '#334155', fontWeight: 500, fontFamily: 'var(--font-mono)' }}>
            #{booking.id}
          </span>
        </div>
        <PrintButton />
      </div>

      {/* ── Surat ─────────────────────────────────────────────────── */}
      <div className="surat-wrap" style={{
        minHeight: '100vh', background: '#F8FAFC',
        padding: '40px 24px',
      }}>
        <div className="surat-container" style={{
          maxWidth: '720px', margin: '0 auto',
          background: '#fff',
          border: '1px solid #E2E8F0',
          borderRadius: '4px',
          padding: '48px 56px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
          fontFamily: '"Times New Roman", Times, serif',
          fontSize: '12px',
          lineHeight: 1.8,
          color: '#0F172A',
        }}>

          {/* KOP SURAT */}
          <div style={{ textAlign: 'center', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '20px', marginBottom: '10px' }}>
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt="Logo"
                  style={{ height: '60px', width: 'auto', flexShrink: 0, objectFit: 'contain' }}
                />
              ) : (
                <div style={{
                  width: '60px', height: '60px', flexShrink: 0,
                  background: '#E2E8F0', borderRadius: '4px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#94A3B8', fontSize: '10px', fontFamily: 'sans-serif',
                }}>
                  LOGO
                </div>
              )}
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '14px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  {namaInstansi}
                </div>
                <div style={{ fontSize: '13px', marginTop: '2px' }}>
                  {namaFakultas}
                </div>
                <div style={{ fontSize: '13px' }}>
                  {namaJurusan}
                </div>
                {alamat && (
                  <div style={{ fontSize: '11px', color: '#475569', marginTop: '2px' }}>
                    {alamat}
                  </div>
                )}
              </div>
            </div>

            {/* Garis kop ganda */}
            <div style={{ borderTop: '3px solid #0F172A', marginTop: '10px' }} />
            <div style={{ borderTop: '1px solid #0F172A', marginTop: '2px' }} />
          </div>

          {/* JUDUL */}
          <div style={{
            textAlign: 'center', margin: '16px 0',
            fontWeight: 700, fontSize: '13px',
            textTransform: 'uppercase', letterSpacing: '0.04em',
          }}>
            Surat Persetujuan Penggunaan {booking.namaLab ?? 'Laboratorium Komputer'}
          </div>

          {/* NOMOR & PERIHAL */}
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
            <tbody>
              {[
                ['Nomor',    booking.nomorSurat ?? '—'],
                ['Lampiran', '—'],
                ['Perihal',  `Persetujuan Penggunaan ${booking.namaLab ?? 'Laboratorium Komputer'}`],
              ].map(([label, value]) => (
                <tr key={label}>
                  <td style={{ width: '120px', verticalAlign: 'top', paddingBottom: '2px', fontSize: '12px', lineHeight: 2 }}>{label}</td>
                  <td style={{ width: '16px', verticalAlign: 'top', paddingBottom: '2px', fontSize: '12px', lineHeight: 2 }}>:</td>
                  <td style={{ verticalAlign: 'top', paddingBottom: '2px', fontSize: '12px', lineHeight: 2 }}>{value}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* TANGGAL */}
          <div style={{ textAlign: 'right', marginBottom: '20px', fontSize: '12px' }}>
            Malang, {tanggal}
          </div>

          {/* PENERIMA */}
          <div style={{ marginBottom: '20px', fontSize: '12px' }}>
            <div>Kepada Yth.</div>
            <div>Bapak/Ibu {booking.user.name}</div>
            <div>di Tempat</div>
          </div>

          {/* PEMBUKA */}
          <div style={{ marginBottom: '16px' }}>
            <p style={{ margin: '0 0 12px', textAlign: 'justify', fontSize: '12px', lineHeight: 1.8 }}>
              Dengan hormat, sehubungan dengan permohonan penggunaan {booking.namaLab ?? 'Laboratorium Komputer'}
              yang diajukan oleh Bapak/Ibu <strong>{booking.user.name}</strong> dari Program
              Studi <strong>{booking.prodi}</strong>, bersama surat ini kami sampaikan bahwa
              permohonan tersebut telah kami terima dan disetujui.
            </p>
          </div>

          {/* TABEL DATA BOOKING */}
          <table style={{
            width: '100%', borderCollapse: 'collapse',
            border: '1px solid #000',
            marginBottom: '20px', fontSize: '12px',
          }}>
            <thead>
              <tr style={{ background: '#f0f0f0' }}>
                <th style={{
                  padding: '8px 12px', textAlign: 'left',
                  border: '1px solid #000', fontWeight: 600,
                  width: '40%',
                }}>
                  Keterangan
                </th>
                <th style={{
                  padding: '8px 12px', textAlign: 'left',
                  border: '1px solid #000', fontWeight: 600,
                }}>
                  Detail
                </th>
              </tr>
            </thead>
            <tbody>
              {[
                ['Mata Kuliah',   booking.mataKuliah],
                ['Dosen',         booking.user.name],
                ['Program Studi', booking.prodi],
                ['Hari',          booking.hari],
                ['Jam',           `${formatTime(booking.jamMulai)} – ${formatTime(booking.jamSelesai)} WIB`],
                ['Periode',       `Minggu ke-${booking.mingguMulai}${booking.mingguMulai !== booking.mingguSelesai ? ` s.d. ke-${booking.mingguSelesai}` : ''}`],
                ['Software',      booking.software],
              ].map(([label, value]) => (
                <tr key={label}>
                  <td style={{ padding: '8px 12px', border: '1px solid #000', fontWeight: 500 }}>
                    {label}
                  </td>
                  <td style={{ padding: '8px 12px', border: '1px solid #000' }}>
                    {value}
                  </td>
                </tr>
              ))}
              <tr>
                <td style={{ padding: '8px 12px', border: '1px solid #000', fontWeight: 500 }}>
                  Status
                </td>
                <td style={{ padding: '8px 12px', border: '1px solid #000', color: '#166534', fontWeight: 700 }}>
                  DISETUJUI
                </td>
              </tr>
            </tbody>
          </table>

          {/* PENUTUP */}
          <p style={{ margin: '0 0 32px', textAlign: 'justify', fontSize: '12px', lineHeight: 1.8 }}>
            Demikian surat persetujuan ini dibuat untuk dapat digunakan sebagaimana mestinya.
            Atas perhatian dan kerjasamanya, kami ucapkan terima kasih.
          </p>

          {/* TANDA TANGAN — 2 KOLOM */}
          <div className="ttd-grid" style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '32px',
            marginTop: '40px',
          }}>
            {/* KOLOM KIRI — Wakil Dekan II */}
            <div style={{ textAlign: 'center' }}>
              <div style={{ marginBottom: '0', fontSize: '12px' }}>
                Wakil Dekan II Bidang Sumber Daya,
              </div>
              {booking.isTTE && booking.tanggalSurat && booking.nomorSurat && (
                <TTEBox tanggalSurat={booking.tanggalSurat} nomorSurat={booking.nomorSurat} />
              )}
              <div style={{ height: ttdSpaceHeight }} />
              <div style={{ fontWeight: 600, fontSize: '12px', borderTop: '1px solid #0F172A', paddingTop: '4px' }}>
                {wd2User?.name ?? '-'}
              </div>
              <div style={{ fontSize: '11px', marginTop: '2px' }}>
                NIP. {wd2User?.nip ? formatNip(wd2User.nip) : '—'}
              </div>
            </div>

            {/* KOLOM KANAN — Kepala Lab */}
            <div style={{ textAlign: 'center' }}>
              <div style={{ marginBottom: '0', fontSize: '12px' }}>Mengetahui,</div>
              <div style={{ marginBottom: '8px', fontSize: '12px' }}>
                {appSettings?.jabatanKepalaLab ?? 'Kepala Laboratorium Komputer'},
              </div>
              {booking.isTTE && booking.tanggalSurat && booking.nomorSurat && (
                <TTEBox tanggalSurat={booking.tanggalSurat} nomorSurat={booking.nomorSurat} />
              )}
              <div style={{ height: ttdSpaceHeight }} />
              <div style={{ fontWeight: 600, fontSize: '12px', borderTop: '1px solid #0F172A', paddingTop: '4px' }}>
                {appSettings?.namaKepalaLab ?? '________________________'}
              </div>
              <div style={{ fontSize: '11px', marginTop: '2px' }}>
                NIP. {appSettings?.nipKepalaLab
                  ? formatNip(appSettings.nipKepalaLab)
                  : '________________________'}
              </div>
            </div>
          </div>

          {/* CATATAN WD2 */}
          {booking.catatanWD2 && (
            <div style={{
              marginTop: '32px',
              background: '#F8FAFC',
              border: '1px solid #E2E8F0',
              borderRadius: '4px',
              padding: '10px 14px',
              fontSize: '11px',
              fontStyle: 'italic',
              color: '#475569',
              fontFamily: 'sans-serif',
            }}>
              <strong style={{ fontStyle: 'normal' }}>Catatan:</strong> {booking.catatanWD2}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
