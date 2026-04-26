'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function NavLogoutButton() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleLogout() {
    setLoading(true)
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className="text-slate-400 hover:text-white text-sm px-3 py-1.5 rounded-md hover:bg-[#1E293B] transition-colors disabled:opacity-50"
    >
      {loading ? '...' : 'Keluar'}
    </button>
  )
}
