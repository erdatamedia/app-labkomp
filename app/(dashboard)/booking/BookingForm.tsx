'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

// ── Types ─────────────────────────────────────────────────────────────

type Step = 1 | 2 | 3
type Direction = 'right' | 'left'
type ToastType = 'success' | 'error'
type ToastData = { type: ToastType; message: string }

// ── Constants ─────────────────────────────────────────────────────────

const JAM_MULAI   = ['07:00','08:00','09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00']
const JAM_SELESAI = ['08:00','09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00']
const HARI_LIST   = ['Senin','Selasa','Rabu','Kamis','Jumat']
const STEP_LABELS = ['Detail', 'Jadwal', 'Konfirmasi']

// ── Shared styles ─────────────────────────────────────────────────────

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: '12px', fontWeight: 500,
  color: 'var(--c-text2)', marginBottom: '6px',
}

const selectBaseStyle: React.CSSProperties = {
  width: '100%', padding: '10px 14px', fontSize: '13px',
  border: '1px solid var(--c-border)', borderRadius: '8px',
  background: 'var(--c-surface)', fontFamily: 'var(--font-sans)',
  color: 'var(--c-text)', outline: 'none',
}

// ── Helpers ───────────────────────────────────────────────────────────

function addTwoHours(time: string) {
  const h = parseInt(time)
  return `${Math.min(h + 2, 18).toString().padStart(2, '0')}:00`
}

// ── Sub-components ────────────────────────────────────────────────────

function CheckIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <path d="M2 6L5 9L10 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function StepIndicator({ step }: { step: Step }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', marginTop: '20px' }}>
      {[1, 2, 3].map((s, idx) => (
        <div key={s} style={{ display: 'flex', alignItems: 'flex-start', flex: idx < 2 ? 1 : 'none' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
            <div style={{
              width: '28px', height: '28px', borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '11px', fontWeight: 600,
              background: step > s ? 'var(--c-green)' : step === s ? 'var(--c-blue)' : '#fff',
              color: step >= s ? '#fff' : 'var(--c-text3)',
              border: `2px solid ${step > s ? 'var(--c-green)' : step === s ? 'var(--c-blue)' : 'var(--c-border)'}`,
              transition: 'all 250ms var(--ease-out)',
            }}>
              {step > s ? <CheckIcon /> : s}
            </div>
            <span style={{
              fontSize: '10px', fontWeight: step === s ? 500 : 400,
              color: step === s ? 'var(--c-blue)' : 'var(--c-text3)',
              whiteSpace: 'nowrap',
              transition: 'color 200ms',
            }}>
              {STEP_LABELS[idx]}
            </span>
          </div>
          {idx < 2 && (
            <div style={{
              flex: 1, height: '2px', marginTop: '13px', marginLeft: '4px', marginRight: '4px',
              background: step > s ? 'var(--c-green)' : 'var(--c-border)',
              transition: 'background 300ms var(--ease-out)',
            }} />
          )}
        </div>
      ))}
    </div>
  )
}

// Self-managing Toast — auto-dismisses error after 3s, success stays until navigation
function Toast({ data, onDone }: { data: ToastData; onDone: () => void }) {
  const [phase, setPhase] = useState<'enter' | 'exit'>('enter')

  useEffect(() => {
    if (data.type === 'success') return // success: page navigates first
    const exitTimer = setTimeout(() => setPhase('exit'), 2800)
    const doneTimer = setTimeout(onDone, 3100)
    return () => { clearTimeout(exitTimer); clearTimeout(doneTimer) }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const borderColor = data.type === 'success' ? 'var(--c-green)' : 'var(--c-red)'
  const isSuccess   = data.type === 'success'

  return (
    <div
      className={phase === 'enter' ? 'animate-slide-in' : 'toast-exit'}
      style={{
        background: '#fff',
        border: '1px solid var(--c-border)',
        borderLeft: `3px solid ${borderColor}`,
        borderRadius: '10px',
        padding: '12px 16px',
        boxShadow: 'var(--shadow-dropdown)',
        display: 'flex', alignItems: 'center', gap: '10px',
        marginBottom: '16px',
      }}
    >
      {isSuccess ? (
        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} style={{ color: 'var(--c-green)', flexShrink: 0 }}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ) : (
        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} style={{ color: 'var(--c-red)', flexShrink: 0 }}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
        </svg>
      )}
      <span style={{ fontSize: '13px', color: 'var(--c-text)', flex: 1 }}>{data.message}</span>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────

export default function BookingForm({ userName }: { userName: string }) {
  const router = useRouter()

  // Step + animation state
  const [step, setStep]           = useState<Step>(1)
  const [direction, setDirection] = useState<Direction>('right')
  const [focusedField, setFocusedField] = useState<string | null>(null)
  const [stepError, setStepError] = useState('')
  const [loading, setLoading]     = useState(false)
  const [toast, setToast]         = useState<ToastData | null>(null)

  // Step 1
  const [mataKuliah, setMataKuliah]       = useState('')
  const [prodi, setProdi]                 = useState('')
  const [namaDosen, setNamaDosen]         = useState(userName)
  const [software, setSoftware]           = useState('')
  const [jumlahPeserta, setJumlahPeserta] = useState('')
  const [catatan, setCatatan]             = useState('')

  // Step 2
  const [hari, setHari]               = useState('Senin')
  const [jamMulai, setJamMulai]       = useState('07:00')
  const [jamSelesai, setJamSelesai]   = useState('09:00')
  const [mingguMulai, setMingguMulai] = useState('1')
  const [recurring, setRecurring]     = useState(false)
  const [totalMinggu, setTotalMinggu] = useState('2')

  // Input style helper
  const inputStyle = (field: string): React.CSSProperties => ({
    width: '100%', padding: '10px 14px', fontSize: '13px',
    border: `1px solid ${focusedField === field ? 'var(--c-blue)' : 'var(--c-border)'}`,
    borderRadius: '8px', background: 'var(--c-surface)',
    fontFamily: 'var(--font-sans)', color: 'var(--c-text)',
    outline: 'none',
    boxShadow: focusedField === field ? '0 0 0 3px rgba(37,99,235,0.1)' : 'none',
    transition: 'border-color 200ms, box-shadow 200ms',
  })

  const fp = (field: string) => ({
    onFocus: () => setFocusedField(field),
    onBlur:  () => setFocusedField(null),
    style:   inputStyle(field),
  })

  // Validation
  function validate(): boolean {
    if (step === 1) {
      if (!mataKuliah.trim()) { setStepError('Nama mata kuliah harus diisi'); return false }
      if (!prodi.trim())      { setStepError('Program studi harus diisi'); return false }
      if (!software.trim())   { setStepError('Software harus diisi'); return false }
      if (!jumlahPeserta)     { setStepError('Jumlah peserta harus diisi'); return false }
    }
    if (step === 2) {
      if (!mingguMulai || Number(mingguMulai) < 1) { setStepError('Minggu mulai harus diisi'); return false }
      if (recurring && (!totalMinggu || Number(totalMinggu) < 1)) { setStepError('Jumlah minggu harus diisi'); return false }
    }
    setStepError('')
    return true
  }

  function handleNext() {
    if (validate()) {
      setDirection('right')
      setStep((s) => Math.min(s + 1, 3) as Step)
    }
  }

  function handlePrev() {
    setStepError('')
    setDirection('left')
    setStep((s) => Math.max(s - 1, 1) as Step)
  }

  function handleJamMulaiChange(val: string) {
    setJamMulai(val)
    setJamSelesai(addTwoHours(val))
  }

  async function handleSubmit() {
    setLoading(true)
    const res = await fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        mataKuliah: mataKuliah.trim(), prodi: prodi.trim(),
        hari, jamMulai, jamSelesai,
        software: software.trim(),
        jumlahMahasiswa: jumlahPeserta ? Number(jumlahPeserta) : null,
        mingguMulai: Number(mingguMulai),
        recurring,
        totalMinggu: recurring ? Number(totalMinggu) : 1,
      }),
    })
    const data = await res.json()
    setLoading(false)

    if (!res.ok) {
      setToast({ type: 'error', message: data.error ?? 'Terjadi kesalahan' })
      return
    }

    setToast({ type: 'success', message: 'Booking berhasil dikirim! Menunggu persetujuan admin.' })
    setTimeout(() => router.push('/dosen'), 1500)
  }

  // Summary for step 3
  const summary = [
    { label: 'Mata Kuliah',     value: mataKuliah },
    { label: 'Program Studi',   value: prodi },
    { label: 'Nama Dosen',      value: namaDosen },
    { label: 'Software',        value: software },
    { label: 'Jumlah Peserta',  value: jumlahPeserta ? `${jumlahPeserta} orang` : '–' },
    ...(catatan.trim() ? [{ label: 'Catatan', value: catatan }] : []),
    { label: 'Hari',            value: hari },
    { label: 'Jam',             value: `${jamMulai} – ${jamSelesai}` },
    { label: 'Minggu Mulai',    value: `Minggu ke-${mingguMulai}` },
    { label: 'Jadwal Berulang', value: recurring ? `Ya, ${totalMinggu} minggu` : 'Tidak' },
  ]

  // ── Render ─────────────────────────────────────────────────────────

  return (
    <div className="animate-fade-up" style={{ maxWidth: '600px', margin: '0 auto', padding: '32px 16px' }}>

      {/* Back link */}
      <Link href="/dosen" className="back-link" style={{ fontSize: '12px', color: 'var(--c-text3)', display: 'inline-flex', alignItems: 'center', gap: '4px', marginBottom: '24px' }}>
        ← Kembali
      </Link>

      {/* Header */}
      <h1 style={{ fontSize: '22px', fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--c-text)', margin: '0 0 4px' }}>
        Ajukan Booking Lab
      </h1>
      <p style={{ fontSize: '13px', color: 'var(--c-text3)', margin: 0 }}>
        Isi detail jadwal penggunaan laboratorium
      </p>

      {/* Step indicator */}
      <StepIndicator step={step} />

      {/* Toast */}
      <div style={{ marginTop: '20px' }}>
        {toast && <Toast data={toast} onDone={() => setToast(null)} />}
      </div>

      {/* Form card */}
      <div style={{
        background: '#fff', border: '1px solid var(--c-border)',
        borderRadius: '14px', padding: '28px',
        marginTop: toast ? '0' : '24px',
        overflow: 'hidden',
      }}>
        {/* Step content — key forces remount → triggers enter animation */}
        <div key={step} className={direction === 'right' ? 'step-in-right' : 'step-in-left'}>

          {/* ── Step 1: Detail Mata Kuliah ──────────────────────────── */}
          {step === 1 && (
            <div>
              <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--c-text)', margin: '0 0 20px' }}>
                Detail Mata Kuliah
              </p>

              <div style={{ marginBottom: '14px' }}>
                <label style={labelStyle}>Nama Mata Kuliah</label>
                <input value={mataKuliah} onChange={e => setMataKuliah(e.target.value)} placeholder="cth. Algoritma & Pemrograman" {...fp('mataKuliah')} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                <div>
                  <label style={labelStyle}>Program Studi</label>
                  <input value={prodi} onChange={e => setProdi(e.target.value)} placeholder="cth. Teknik Informatika" {...fp('prodi')} />
                </div>
                <div>
                  <label style={labelStyle}>Nama Dosen</label>
                  <input value={namaDosen} onChange={e => setNamaDosen(e.target.value)} {...fp('namaDosen')} />
                </div>
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={labelStyle}>Software yang Dibutuhkan</label>
                <input value={software} onChange={e => setSoftware(e.target.value)} placeholder="Visual Studio Code, MATLAB, ..." {...fp('software')} />
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={labelStyle}>Jumlah Peserta</label>
                <input type="number" min="1" value={jumlahPeserta} onChange={e => setJumlahPeserta(e.target.value)} placeholder="cth. 30" {...fp('jumlahPeserta')} />
              </div>

              <div>
                <label style={labelStyle}>
                  Catatan Tambahan{' '}
                  <span style={{ fontWeight: 400, color: 'var(--c-text3)' }}>(opsional)</span>
                </label>
                <textarea
                  rows={3}
                  value={catatan}
                  onChange={e => setCatatan(e.target.value)}
                  placeholder="Tambahan kebutuhan atau informasi khusus..."
                  onFocus={() => setFocusedField('catatan')}
                  onBlur={() => setFocusedField(null)}
                  style={{ ...inputStyle('catatan'), resize: 'vertical' }}
                />
              </div>
            </div>
          )}

          {/* ── Step 2: Jadwal & Waktu ───────────────────────────────── */}
          {step === 2 && (
            <div>
              <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--c-text)', margin: '0 0 20px' }}>
                Jadwal & Waktu
              </p>

              <div style={{ marginBottom: '14px' }}>
                <label style={labelStyle}>Hari</label>
                <select value={hari} onChange={e => setHari(e.target.value)} style={selectBaseStyle}>
                  {HARI_LIST.map(d => <option key={d}>{d}</option>)}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                <div>
                  <label style={labelStyle}>Jam Mulai</label>
                  <select value={jamMulai} onChange={e => handleJamMulaiChange(e.target.value)} style={selectBaseStyle}>
                    {JAM_MULAI.map(j => <option key={j} value={j}>{j.replace(':', '.')}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Jam Selesai</label>
                  <select value={jamSelesai} onChange={e => setJamSelesai(e.target.value)} style={selectBaseStyle}>
                    {JAM_SELESAI.map(j => <option key={j} value={j}>{j.replace(':', '.')}</option>)}
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={labelStyle}>Minggu Mulai</label>
                <input type="number" min="1" max="16" value={mingguMulai} onChange={e => setMingguMulai(e.target.value)} placeholder="cth. 3" {...fp('mingguMulai')} />
              </div>

              {/* Recurring toggle */}
              <div
                onClick={() => setRecurring(!recurring)}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '14px 16px', background: 'var(--c-surface)',
                  border: '1px solid var(--c-border)', borderRadius: '10px',
                  cursor: 'pointer',
                }}
              >
                <div>
                  <p style={{ fontSize: '13px', fontWeight: 500, color: 'var(--c-text)', margin: '0 0 2px' }}>Jadwal berulang</p>
                  <p style={{ fontSize: '11px', color: 'var(--c-text3)', margin: 0 }}>Booking otomatis untuk beberapa minggu</p>
                </div>
                <div style={{
                  width: '36px', height: '20px', borderRadius: '10px',
                  background: recurring ? 'var(--c-blue)' : 'var(--c-border)',
                  position: 'relative', flexShrink: 0,
                  transition: 'background 200ms var(--ease-spring)',
                }}>
                  <div style={{
                    width: '16px', height: '16px', borderRadius: '50%', background: '#fff',
                    position: 'absolute', top: '2px',
                    left: recurring ? '18px' : '2px',
                    transition: 'left 200ms var(--ease-spring)',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                  }} />
                </div>
              </div>

              {/* Jumlah minggu — slide down */}
              <div style={{
                maxHeight: recurring ? '80px' : '0',
                overflow: 'hidden',
                transition: 'max-height 300ms var(--ease-out)',
              }}>
                <div style={{ marginTop: '12px' }}>
                  <label style={labelStyle}>Jumlah Minggu</label>
                  <input type="number" min="1" max="16" value={totalMinggu} onChange={e => setTotalMinggu(e.target.value)} {...fp('totalMinggu')} />
                </div>
              </div>
            </div>
          )}

          {/* ── Step 3: Konfirmasi ───────────────────────────────────── */}
          {step === 3 && (
            <div>
              <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--c-text)', margin: '0 0 16px' }}>
                Ringkasan Booking
              </p>

              <div style={{ border: '1px solid var(--c-border)', borderRadius: '10px', overflow: 'hidden' }}>
                {summary.map((row, i) => (
                  <div key={row.label} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
                    padding: '10px 14px', gap: '16px',
                    borderBottom: i < summary.length - 1 ? '1px solid var(--c-border)' : 'none',
                    background: i % 2 === 0 ? '#fff' : 'var(--c-surface)',
                  }}>
                    <span style={{ fontSize: '12px', color: 'var(--c-text3)', flexShrink: 0 }}>{row.label}</span>
                    <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--c-text)', textAlign: 'right' }}>{row.value}</span>
                  </div>
                ))}
              </div>

              <div style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '10px 14px', marginTop: '14px',
                background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: '8px',
              }}>
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ color: 'var(--c-amber)', flexShrink: 0 }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
                <span style={{ fontSize: '12px', color: '#92400E' }}>
                  Pastikan data sudah benar sebelum mengirim
                </span>
              </div>
            </div>
          )}

        </div>{/* end keyed step wrapper */}

        {/* Step validation error — outside keyed div so it doesn't animate away */}
        {stepError && (
          <div style={{
            marginTop: '14px', padding: '8px 12px',
            background: '#FEF2F2', border: '1px solid #FECACA',
            borderRadius: '7px', fontSize: '12px', color: '#991B1B',
          }}>
            {stepError}
          </div>
        )}
      </div>

      {/* Navigation buttons */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px' }}>
        {step > 1 ? (
          <button
            onClick={handlePrev}
            className="btn-ghost-light"
            style={{
              fontSize: '13px', fontWeight: 500, color: 'var(--c-text2)',
              background: '#fff', border: '1px solid var(--c-border)',
              borderRadius: '9px', padding: '10px 20px',
              cursor: 'pointer', fontFamily: 'var(--font-sans)',
            }}
          >
            Sebelumnya
          </button>
        ) : (
          <div />
        )}

        {step < 3 ? (
          <button
            onClick={handleNext}
            className="btn-spring"
            style={{
              fontSize: '13px', fontWeight: 500, color: '#fff',
              background: 'var(--c-blue)', border: 'none',
              borderRadius: '9px', padding: '10px 24px',
              cursor: 'pointer', fontFamily: 'var(--font-sans)',
            }}
          >
            Selanjutnya
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="btn-spring"
            style={{
              fontSize: '13px', fontWeight: 500, color: '#fff',
              background: loading ? 'rgba(37,99,235,0.65)' : 'var(--c-blue)',
              border: 'none', borderRadius: '9px', padding: '10px 24px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily: 'var(--font-sans)',
              display: 'flex', alignItems: 'center', gap: '8px',
            }}
          >
            {loading ? (
              <>
                <svg className="animate-spin" width="13" height="13" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" style={{ opacity: 0.25 }} />
                  <path fill="currentColor" style={{ opacity: 0.75 }} d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Mengirim...
              </>
            ) : (
              'Kirim Booking'
            )}
          </button>
        )}
      </div>
    </div>
  )
}
