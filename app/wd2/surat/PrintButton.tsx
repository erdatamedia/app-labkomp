'use client'

export default function PrintButton() {
  return (
    <button
      className="no-print"
      onClick={() => window.print()}
      style={{
        fontSize: '12px', fontWeight: 500,
        color: '#2563EB', background: 'transparent',
        border: '1px solid #BFDBFE', borderRadius: '7px',
        padding: '6px 16px', cursor: 'pointer',
      }}
    >
      Cetak Surat
    </button>
  )
}
