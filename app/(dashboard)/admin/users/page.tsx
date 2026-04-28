import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'
import { redirect } from 'next/navigation'
import UserList from './UserList'

export default async function AdminUsersPage() {
  const session = await getSession()
  if (!session || session.role !== 'ADMIN') redirect('/admin')

  const [users, pendingUsers] = await Promise.all([
    prisma.user.findMany({
      where: { isApproved: true },
      select: {
        id: true, name: true, email: true, role: true,
        nip: true, prodi: true, jabatan: true, noHp: true,
        isActive: true, createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.user.findMany({
      where: { isApproved: false, isActive: true },
      select: {
        id: true, name: true, email: true,
        nip: true, prodi: true, registeredAt: true,
      },
      orderBy: { registeredAt: 'desc' },
    }),
  ])

  return <UserList initialUsers={users} pendingUsers={pendingUsers} />
}
