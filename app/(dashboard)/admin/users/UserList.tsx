'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

type Role = 'ADMIN' | 'DOSEN' | 'WD2' | 'KAPRODI' | 'DEKAN' | 'MAHASISWA'

type User = {
  id: number
  name: string
  email: string
  role: Role
  nip: string | null
  prodi: string | null
  jabatan: string | null
  noHp: string | null
  isActive: boolean
  createdAt: Date | string
}

type PendingUser = {
  id: number
  name: string
  email: string
  prodi: string | null
  nip: string | null
  registeredAt: Date | string | null
}

type FilterTab = 'SEMUA' | 'DOSEN' | 'WD2' | 'ADMIN' | 'MENUNGGU'

// ── Styles ────────────────────────────────────────────────────────────

const roleBadge: Record<string, React.CSSProperties> = {
  ADMIN:     { background: '#DBEAFE', color: '#1E40AF' },
  DOSEN:     { background: '#DCFCE7', color: '#166534' },
  WD2:       { background: '#EEF2FF', color: '#3730A3' },
  KAPRODI:   { background: '#DCFCE7', color: '#166534' },
  DEKAN:     { background: '#FEF3C7', color: '#92400E' },
  MAHASISWA: { background: '#F1F5F9', color: '#475569' },
}

const avatarColor: Record<string, React.CSSProperties> = {
  ADMIN:     { background: '#DBEAFE', color: '#1E40AF' },
  DOSEN:     { background: '#DCFCE7', color: '#166534' },
  WD2:       { background: '#EEF2FF', color: '#3730A3' },
  KAPRODI:   { background: '#DCFCE7', color: '#166534' },
  DEKAN:     { background: '#FEF3C7', color: '#92400E' },
  MAHASISWA: { background: '#F1F5F9', color: '#475569' },
}

const thStyle: React.CSSProperties = {
  fontSize: '10px', fontWeight: 600, textTransform: 'uppercase',
  letterSpacing: '0.06em', color: 'var(--c-text3)',
  padding: '10px 16px', background: '#FAFBFC',
  borderBottom: '1px solid #F1F5F9', textAlign: 'left', whiteSpace: 'nowrap',
}

const tdStyle: React.CSSProperties = {
  fontSize: '12px', color: 'var(--c-text2)',
  padding: '11px 16px', borderBottom: '1px solid #F8FAFC', verticalAlign: 'middle',
}

const inputStyle: React.CSSProperties = {
  width: '100%', border: '1px solid var(--c-border)', borderRadius: '8px',
  padding: '9px 12px', fontSize: '13px', color: 'var(--c-text)', background: '#fff', outline: 'none',
}

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: '12px', fontWeight: 500, color: 'var(--c-text2)', marginBottom: '6px',
}

// ── Helpers ───────────────────────────────────────────────────────────

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

function formatDate(val: Date | string | null) {
  if (!val) return '—'
  const d = new Date(val)
  return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
}

// ── Toast ─────────────────────────────────────────────────────────────

function Toast({ message, type, onDone }: { message: string; type: 'success' | 'error'; onDone: () => void }) {
  useEffect(() => { const t = setTimeout(onDone, 3200); return () => clearTimeout(t) }, [onDone])
  return (
    <div style={{
      position: 'fixed', bottom: '24px', right: '24px', zIndex: 999,
      background: type === 'success' ? '#ECFDF5' : '#FEF2F2',
      border: `1px solid ${type === 'success' ? '#A7F3D0' : '#FECACA'}`,
      color: type === 'success' ? '#065F46' : '#991B1B',
      borderRadius: '10px', padding: '12px 20px', fontSize: '13px', fontWeight: 500,
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)', animation: 'fadeInUp 200ms ease forwards',
    }}>
      {message}
    </div>
  )
}

// ── Confirm deactivate dialog ─────────────────────────────────────────

function ConfirmModal({ name, onConfirm, onCancel, loading }: {
  name: string; onConfirm: () => void; onCancel: () => void; loading: boolean
}) {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(15,23,42,0.5)' }}>
      <div style={{ background: '#fff', borderRadius: '14px', padding: '28px', maxWidth: '380px', width: '90%', boxShadow: '0 20px 40px rgba(0,0,0,0.15)' }}>
        <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--c-text)', margin: '0 0 10px' }}>Nonaktifkan Pengguna?</h3>
        <p style={{ fontSize: '13px', color: 'var(--c-text2)', margin: '0 0 20px' }}>
          Akun <strong>{name}</strong> akan dinonaktifkan dan tidak bisa login. Booking aktif harus diselesaikan terlebih dahulu.
        </p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
          <button onClick={onCancel} disabled={loading} style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid var(--c-border)', background: '#fff', fontSize: '13px', cursor: 'pointer', color: 'var(--c-text2)' }}>
            Batal
          </button>
          <button onClick={onConfirm} disabled={loading} style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', background: 'var(--c-red)', color: '#fff', fontSize: '13px', fontWeight: 500, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Memproses…' : 'Ya, Nonaktifkan'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Confirm reject dialog ─────────────────────────────────────────────

function RejectConfirmModal({ name, onConfirm, onCancel, loading }: {
  name: string; onConfirm: () => void; onCancel: () => void; loading: boolean
}) {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(15,23,42,0.5)' }}>
      <div style={{ background: '#fff', borderRadius: '14px', padding: '28px', maxWidth: '380px', width: '90%', boxShadow: '0 20px 40px rgba(0,0,0,0.15)' }}>
        <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--c-text)', margin: '0 0 10px' }}>Tolak Pendaftaran?</h3>
        <p style={{ fontSize: '13px', color: 'var(--c-text2)', margin: '0 0 20px' }}>
          Pendaftaran <strong>{name}</strong> akan ditolak dan data akan dihapus permanen.
        </p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
          <button onClick={onCancel} disabled={loading} style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid var(--c-border)', background: '#fff', fontSize: '13px', cursor: 'pointer', color: 'var(--c-text2)' }}>
            Batal
          </button>
          <button onClick={onConfirm} disabled={loading} style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', background: 'var(--c-red)', color: '#fff', fontSize: '13px', fontWeight: 500, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Memproses…' : 'Ya, Tolak'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── User Form Modal ───────────────────────────────────────────────────

type FormState = {
  name: string; email: string; password: string; role: Role
  nip: string; prodi: string; jabatan: string; noHp: string
}

const EMPTY_FORM: FormState = { name: '', email: '', password: '', role: 'DOSEN', nip: '', prodi: '', jabatan: '', noHp: '' }

function UserModal({ mode, initial, onClose, onSuccess }: {
  mode: 'add' | 'edit'
  initial?: User
  onClose: () => void
  onSuccess: (msg: string) => void
}) {
  const [form, setForm] = useState<FormState>(() =>
    mode === 'edit' && initial
      ? { name: initial.name, email: initial.email, password: '', role: initial.role, nip: initial.nip ?? '', prodi: initial.prodi ?? '', jabatan: initial.jabatan ?? '', noHp: initial.noHp ?? '' }
      : EMPTY_FORM
  )
  const [pwOpen, setPwOpen] = useState(false)
  const [newPw, setNewPw] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const overlayRef = useRef<HTMLDivElement>(null)

  function set(field: keyof FormState) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [field]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (mode === 'add') {
      if (!form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) { setError('Format email tidak valid'); return }
      if (form.password.length < 6) { setError('Password minimal 6 karakter'); return }
    }

    if (pwOpen && newPw && newPw.length < 6) { setError('Password baru minimal 6 karakter'); return }

    const body: Record<string, string> = {
      name: form.name, role: form.role,
      nip: form.nip, prodi: form.prodi, jabatan: form.jabatan, noHp: form.noHp,
    }
    if (mode === 'add') { body.email = form.email; body.password = form.password }
    if (pwOpen && newPw) body.newPassword = newPw

    setSaving(true)
    try {
      const url = mode === 'add' ? '/api/users' : `/api/users/${initial!.id}`
      const res = await fetch(url, {
        method: mode === 'add' ? 'POST' : 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const json = await res.json()
      if (!res.ok) { setError(json.error ?? 'Terjadi kesalahan'); return }
      onSuccess(mode === 'add' ? 'Pengguna berhasil ditambahkan' : 'Pengguna berhasil diperbarui')
    } catch {
      setError('Terjadi kesalahan, coba lagi')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      ref={overlayRef}
      onClick={(e) => { if (e.target === overlayRef.current) onClose() }}
      style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(15,23,42,0.5)', padding: '16px' }}
    >
      <div style={{ background: '#fff', borderRadius: '14px', padding: '28px', maxWidth: '480px', width: '100%', boxShadow: '0 20px 40px rgba(0,0,0,0.15)', maxHeight: '90vh', overflowY: 'auto', animation: 'fadeInUp 200ms ease forwards' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--c-text)', margin: 0 }}>
            {mode === 'add' ? 'Tambah Pengguna' : 'Edit Pengguna'}
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--c-text3)', padding: '4px' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={labelStyle}>Nama Lengkap <span style={{ color: 'var(--c-red)' }}>*</span></label>
            <input required value={form.name} onChange={set('name')} style={inputStyle} />
          </div>

          <div>
            <label style={labelStyle}>Email <span style={{ color: 'var(--c-red)' }}>*</span></label>
            <input
              type="email" required value={form.email} onChange={set('email')}
              disabled={mode === 'edit'}
              style={{ ...inputStyle, background: mode === 'edit' ? '#F8FAFC' : '#fff', color: mode === 'edit' ? 'var(--c-text3)' : 'var(--c-text)', cursor: mode === 'edit' ? 'not-allowed' : 'text' }}
            />
          </div>

          {mode === 'add' && (
            <div>
              <label style={labelStyle}>Password <span style={{ color: 'var(--c-red)' }}>*</span></label>
              <input type="password" required minLength={6} value={form.password} onChange={set('password')} style={inputStyle} autoComplete="new-password" />
            </div>
          )}

          <div>
            <label style={labelStyle}>Role <span style={{ color: 'var(--c-red)' }}>*</span></label>
            <select value={form.role} onChange={set('role')} style={{ ...inputStyle, appearance: 'none' }}>
              <option value="DOSEN">DOSEN</option>
              <option value="WD2">WD2</option>
              <option value="ADMIN">ADMIN</option>
            </select>
          </div>

          <div>
            <label style={labelStyle}>NIP</label>
            <input value={form.nip} onChange={set('nip')} style={inputStyle} placeholder="Nomor Induk Pegawai" />
          </div>

          {form.role === 'DOSEN' && (
            <div>
              <label style={labelStyle}>Program Studi</label>
              <input value={form.prodi} onChange={set('prodi')} style={inputStyle} placeholder="Contoh: Teknik Informatika" />
            </div>
          )}

          {form.role === 'WD2' && (
            <div>
              <label style={labelStyle}>Jabatan</label>
              <input value={form.jabatan} onChange={set('jabatan')} style={inputStyle} placeholder="Contoh: Wakil Dekan II Bidang Sumber Daya" />
            </div>
          )}

          <div>
            <label style={labelStyle}>No. HP</label>
            <input value={form.noHp} onChange={set('noHp')} style={inputStyle} placeholder="08xxxxxxxxxx" />
          </div>

          {mode === 'edit' && (
            <>
              <div style={{ borderTop: '1px solid var(--c-border)' }} />
              <div>
                <button type="button" onClick={() => setPwOpen((v) => !v)} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 500, color: 'var(--c-text2)', padding: '2px 0' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
                    style={{ transition: 'transform 200ms', transform: pwOpen ? 'rotate(90deg)' : 'rotate(0deg)' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                  Ganti Password
                </button>
                <div style={{ overflow: 'hidden', maxHeight: pwOpen ? '80px' : '0', transition: 'max-height 250ms ease' }}>
                  <div style={{ paddingTop: '12px' }}>
                    <label style={labelStyle}>Password Baru <span style={{ color: 'var(--c-text3)', fontWeight: 400 }}>(min. 6 karakter)</span></label>
                    <input type="password" value={newPw} onChange={(e) => setNewPw(e.target.value)} style={inputStyle} autoComplete="new-password" />
                  </div>
                </div>
              </div>
            </>
          )}

          {error && <p style={{ fontSize: '12px', color: 'var(--c-red)', margin: 0 }}>{error}</p>}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', paddingTop: '4px' }}>
            <button type="button" onClick={onClose} style={{ padding: '9px 18px', borderRadius: '8px', border: '1px solid var(--c-border)', background: '#fff', fontSize: '13px', cursor: 'pointer', color: 'var(--c-text2)' }}>
              Batal
            </button>
            <button type="submit" disabled={saving} className="btn-spring" style={{ padding: '9px 22px', borderRadius: '8px', border: 'none', background: 'var(--c-blue)', color: '#fff', fontSize: '13px', fontWeight: 500, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1 }}>
              {saving ? 'Menyimpan…' : 'Simpan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Main Component ────────────────────────────────────────────────────

export default function UserList({
  initialUsers,
  pendingUsers: initialPendingUsers,
}: {
  initialUsers: User[]
  pendingUsers: PendingUser[]
}) {
  const router = useRouter()
  const [users, setUsers] = useState<User[]>(initialUsers)
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>(initialPendingUsers)
  const [tab, setTab] = useState<FilterTab>('SEMUA')
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [showAdd, setShowAdd] = useState(false)
  const [editUser, setEditUser] = useState<User | null>(null)
  const [confirmUser, setConfirmUser] = useState<User | null>(null)
  const [rejectUser, setRejectUser] = useState<PendingUser | null>(null)
  const [actionLoading, setActionLoading] = useState(false)

  const filtered = tab === 'SEMUA' ? users : users.filter((u) => u.role === tab)

  function showToast(message: string, type: 'success' | 'error' = 'success') {
    setToast({ message, type })
  }

  function handleModalSuccess(msg: string) {
    setShowAdd(false)
    setEditUser(null)
    showToast(msg)
    router.refresh()
    fetch('/api/users')
      .then((r) => r.json())
      .then((data: User[]) => setUsers(data))
      .catch(() => {})
  }

  async function handleDeactivate() {
    if (!confirmUser) return
    setActionLoading(true)
    try {
      const res = await fetch(`/api/users/${confirmUser.id}`, { method: 'DELETE' })
      const json = await res.json()
      if (!res.ok) { showToast(json.error ?? 'Gagal menonaktifkan', 'error'); return }
      setUsers((prev) => prev.map((u) => u.id === confirmUser.id ? { ...u, isActive: false } : u))
      showToast('Pengguna berhasil dinonaktifkan')
    } catch {
      showToast('Terjadi kesalahan', 'error')
    } finally {
      setActionLoading(false)
      setConfirmUser(null)
    }
  }

  async function handleActivate(user: User) {
    try {
      const res = await fetch(`/api/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: true }),
      })
      if (!res.ok) { showToast('Gagal mengaktifkan pengguna', 'error'); return }
      setUsers((prev) => prev.map((u) => u.id === user.id ? { ...u, isActive: true } : u))
      showToast('Pengguna berhasil diaktifkan')
    } catch {
      showToast('Terjadi kesalahan', 'error')
    }
  }

  async function handleApprove(pending: PendingUser) {
    setActionLoading(true)
    try {
      const res = await fetch(`/api/users/${pending.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isApproved: true }),
      })
      if (!res.ok) { showToast('Gagal menyetujui pendaftaran', 'error'); return }
      setPendingUsers((prev) => prev.filter((u) => u.id !== pending.id))
      fetch('/api/users')
        .then((r) => r.json())
        .then((data: User[]) => setUsers(data))
        .catch(() => {})
      showToast(`${pending.name} berhasil disetujui`)
    } catch {
      showToast('Terjadi kesalahan', 'error')
    } finally {
      setActionLoading(false)
    }
  }

  async function handleReject() {
    if (!rejectUser) return
    setActionLoading(true)
    try {
      const res = await fetch(`/api/users/${rejectUser.id}`, { method: 'DELETE' })
      const json = await res.json()
      if (!res.ok) { showToast(json.error ?? 'Gagal menolak', 'error'); return }
      setPendingUsers((prev) => prev.filter((u) => u.id !== rejectUser.id))
      showToast(`Pendaftaran ${rejectUser.name} ditolak`)
    } catch {
      showToast('Terjadi kesalahan', 'error')
    } finally {
      setActionLoading(false)
      setRejectUser(null)
    }
  }

  const tabItems: { key: FilterTab; label: string }[] = [
    { key: 'SEMUA',    label: 'Semua' },
    { key: 'DOSEN',    label: 'Dosen' },
    { key: 'WD2',      label: 'WD2' },
    { key: 'ADMIN',    label: 'Admin' },
    { key: 'MENUNGGU', label: 'Menunggu Persetujuan' },
  ]

  return (
    <div className="animate-fade-up" style={{ padding: '32px', maxWidth: '1100px', margin: '0 auto' }}>
      {toast && <Toast message={toast.message} type={toast.type} onDone={() => setToast(null)} />}
      {confirmUser && (
        <ConfirmModal
          name={confirmUser.name}
          onConfirm={handleDeactivate}
          onCancel={() => setConfirmUser(null)}
          loading={actionLoading}
        />
      )}
      {rejectUser && (
        <RejectConfirmModal
          name={rejectUser.name}
          onConfirm={handleReject}
          onCancel={() => setRejectUser(null)}
          loading={actionLoading}
        />
      )}
      {showAdd && (
        <UserModal mode="add" onClose={() => setShowAdd(false)} onSuccess={handleModalSuccess} />
      )}
      {editUser && (
        <UserModal mode="edit" initial={editUser} onClose={() => setEditUser(null)} onSuccess={handleModalSuccess} />
      )}

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--c-text)', margin: '0 0 4px' }}>
            Kelola Pengguna
          </h1>
          <p style={{ fontSize: '12px', color: 'var(--c-text3)', margin: 0, fontFamily: 'var(--font-mono)' }}>
            {users.length} pengguna terdaftar
            {pendingUsers.length > 0 && (
              <span style={{ marginLeft: '8px', color: '#DC2626', fontWeight: 600 }}>
                · {pendingUsers.length} menunggu persetujuan
              </span>
            )}
          </p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="btn-spring"
          style={{ display: 'flex', alignItems: 'center', gap: '7px', background: 'var(--c-blue)', color: '#fff', border: 'none', borderRadius: '9px', padding: '9px 18px', fontSize: '13px', fontWeight: 500, cursor: 'pointer' }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Tambah Pengguna
        </button>
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '16px', background: '#F8FAFC', borderRadius: '10px', padding: '4px', width: 'fit-content' }}>
        {tabItems.map(({ key, label }) => {
          const count = key === 'SEMUA' ? users.length
            : key === 'MENUNGGU' ? pendingUsers.length
            : users.filter((u) => u.role === key).length

          return (
            <button
              key={key}
              onClick={() => setTab(key)}
              style={{
                padding: '7px 16px', fontSize: '13px', border: 'none', borderRadius: '7px', cursor: 'pointer',
                fontWeight: tab === key ? 600 : 400,
                color: tab === key ? (key === 'MENUNGGU' ? '#92400E' : 'var(--c-blue)') : 'var(--c-text2)',
                background: tab === key ? (key === 'MENUNGGU' ? '#FFFBEB' : '#EFF6FF') : 'transparent',
                transition: 'all 150ms',
                position: 'relative' as const,
              }}
            >
              {label}
              <span style={{
                marginLeft: '6px', fontSize: '11px', fontFamily: 'var(--font-mono)',
                color: tab === key
                  ? (key === 'MENUNGGU' ? '#B45309' : 'var(--c-blue)')
                  : 'var(--c-text3)',
              }}>
                {count}
              </span>
              {key === 'MENUNGGU' && pendingUsers.length > 0 && tab !== 'MENUNGGU' && (
                <span style={{
                  position: 'absolute', top: '6px', right: '6px',
                  width: '6px', height: '6px', borderRadius: '50%',
                  background: '#DC2626',
                }} />
              )}
            </button>
          )
        })}
      </div>

      {/* Pending Approval Table */}
      {tab === 'MENUNGGU' && (
        <div style={{ background: '#fff', border: '1px solid #FDE68A', borderRadius: '12px', overflow: 'hidden' }}>
          <div style={{ padding: '12px 16px', background: '#FFFBEB', borderBottom: '1px solid #FDE68A', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
                stroke="#92400E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span style={{ fontSize: '12px', color: '#92400E', fontWeight: 500 }}>
              {pendingUsers.length} dosen menunggu persetujuan pendaftaran
            </span>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {['Nama', 'Email', 'Prodi', 'NIP', 'Tgl Daftar', 'Aksi'].map((h) => (
                    <th key={h} style={thStyle}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pendingUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: 'var(--c-text3)', fontSize: '13px' }}>
                      Tidak ada pendaftaran yang menunggu
                    </td>
                  </tr>
                ) : (
                  pendingUsers.map((u) => (
                    <tr key={u.id} className="admin-row">
                      <td style={{ ...tdStyle, whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{
                            width: '28px', height: '28px', borderRadius: '50%', flexShrink: 0,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '10px', fontWeight: 700, fontFamily: 'var(--font-mono)',
                            background: '#FEF3C7', color: '#92400E',
                          }}>
                            {getInitials(u.name)}
                          </div>
                          <span style={{ fontWeight: 500, color: 'var(--c-text)', fontSize: '13px' }}>{u.name}</span>
                        </div>
                      </td>
                      <td style={{ ...tdStyle, color: 'var(--c-text2)' }}>{u.email}</td>
                      <td style={tdStyle}>{u.prodi ?? '—'}</td>
                      <td style={{ ...tdStyle, fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--c-text3)' }}>
                        {u.nip ?? '—'}
                      </td>
                      <td style={{ ...tdStyle, fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--c-text3)' }}>
                        {formatDate(u.registeredAt)}
                      </td>
                      <td style={tdStyle}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <button
                            onClick={() => handleApprove(u)}
                            disabled={actionLoading}
                            style={{ padding: '5px 12px', borderRadius: '6px', border: '1px solid #A7F3D0', background: '#ECFDF5', fontSize: '12px', cursor: actionLoading ? 'not-allowed' : 'pointer', color: '#059669', transition: 'all 120ms', whiteSpace: 'nowrap', fontWeight: 500, opacity: actionLoading ? 0.6 : 1 }}
                            onMouseEnter={(e) => { if (!actionLoading) e.currentTarget.style.background = '#D1FAE5' }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = '#ECFDF5' }}
                          >
                            Setujui
                          </button>
                          <button
                            onClick={() => setRejectUser(u)}
                            disabled={actionLoading}
                            style={{ padding: '5px 12px', borderRadius: '6px', border: '1px solid #FECACA', background: '#FEF2F2', fontSize: '12px', cursor: actionLoading ? 'not-allowed' : 'pointer', color: '#DC2626', transition: 'all 120ms', whiteSpace: 'nowrap', fontWeight: 500, opacity: actionLoading ? 0.6 : 1 }}
                            onMouseEnter={(e) => { if (!actionLoading) e.currentTarget.style.background = '#FEE2E2' }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = '#FEF2F2' }}
                          >
                            Tolak
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Regular Users Table */}
      {tab !== 'MENUNGGU' && (
        <div style={{ background: '#fff', border: '1px solid var(--c-border)', borderRadius: '12px', overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {['Nama', 'Email', 'Role', 'NIP', 'Prodi / Jabatan', 'Status', 'Aksi'].map((h) => (
                    <th key={h} style={thStyle}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ padding: '40px', textAlign: 'center', color: 'var(--c-text3)', fontSize: '13px' }}>
                      Tidak ada pengguna ditemukan
                    </td>
                  </tr>
                ) : (
                  filtered.map((u) => (
                    <tr key={u.id} className="admin-row">
                      <td style={{ ...tdStyle, whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{
                            width: '28px', height: '28px', borderRadius: '50%', flexShrink: 0,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '10px', fontWeight: 700, fontFamily: 'var(--font-mono)',
                            ...avatarColor[u.role],
                          }}>
                            {getInitials(u.name)}
                          </div>
                          <span style={{ fontWeight: 500, color: 'var(--c-text)', fontSize: '13px' }}>{u.name}</span>
                        </div>
                      </td>
                      <td style={{ ...tdStyle, color: 'var(--c-text2)' }}>{u.email}</td>
                      <td style={tdStyle}>
                        <span style={{ display: 'inline-block', padding: '2px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 600, letterSpacing: '0.03em', ...roleBadge[u.role] }}>
                          {u.role}
                        </span>
                      </td>
                      <td style={{ ...tdStyle, fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--c-text3)' }}>
                        {u.nip ?? '—'}
                      </td>
                      <td style={tdStyle}>{u.prodi ?? u.jabatan ?? '—'}</td>
                      <td style={tdStyle}>
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: '5px',
                          padding: '2px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 500,
                          background: u.isActive ? '#DCFCE7' : '#F1F5F9',
                          color: u.isActive ? '#166534' : '#64748B',
                        }}>
                          <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: u.isActive ? '#22C55E' : '#94A3B8', display: 'inline-block' }} />
                          {u.isActive ? 'Aktif' : 'Nonaktif'}
                        </span>
                      </td>
                      <td style={tdStyle}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <button
                            onClick={() => setEditUser(u)}
                            style={{ padding: '5px 12px', borderRadius: '6px', border: '1px solid var(--c-border)', background: '#fff', fontSize: '12px', cursor: 'pointer', color: 'var(--c-text2)', transition: 'all 120ms', whiteSpace: 'nowrap' }}
                            onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--c-blue)'; e.currentTarget.style.color = 'var(--c-blue)' }}
                            onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--c-border)'; e.currentTarget.style.color = 'var(--c-text2)' }}
                          >
                            Edit
                          </button>
                          {u.isActive ? (
                            <button
                              onClick={() => setConfirmUser(u)}
                              style={{ padding: '5px 12px', borderRadius: '6px', border: '1px solid #FECACA', background: '#FEF2F2', fontSize: '12px', cursor: 'pointer', color: '#DC2626', transition: 'all 120ms', whiteSpace: 'nowrap' }}
                              onMouseEnter={(e) => { e.currentTarget.style.background = '#FEE2E2' }}
                              onMouseLeave={(e) => { e.currentTarget.style.background = '#FEF2F2' }}
                            >
                              Nonaktifkan
                            </button>
                          ) : (
                            <button
                              onClick={() => handleActivate(u)}
                              style={{ padding: '5px 12px', borderRadius: '6px', border: '1px solid #A7F3D0', background: '#ECFDF5', fontSize: '12px', cursor: 'pointer', color: '#059669', transition: 'all 120ms', whiteSpace: 'nowrap' }}
                              onMouseEnter={(e) => { e.currentTarget.style.background = '#D1FAE5' }}
                              onMouseLeave={(e) => { e.currentTarget.style.background = '#ECFDF5' }}
                            >
                              Aktifkan
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {filtered.length > 0 && (
            <div style={{ padding: '10px 16px', borderTop: '1px solid var(--c-border)', fontSize: '11px', color: 'var(--c-text3)', fontFamily: 'var(--font-mono)' }}>
              {filtered.length} pengguna ditampilkan{tab !== 'SEMUA' && ` · filter: ${tab}`}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
