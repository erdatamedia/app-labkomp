import { getSession } from '@/lib/session'
import { redirect } from 'next/navigation'
import Navbar from '@/app/components/Navbar'

export default async function WD2Layout({ children }: { children: React.ReactNode }) {
  const session = await getSession()
  if (!session || session.role !== 'WD2') redirect('/login')

  return (
    <div style={{ minHeight: '100vh', background: 'var(--c-surface)' }}>
      <Navbar user={{ name: session.name, role: session.role }} />
      <main>{children}</main>
    </div>
  )
}
