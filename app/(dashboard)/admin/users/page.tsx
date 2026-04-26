import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'
import { redirect } from 'next/navigation'
import UserList from './UserList'

export default async function AdminUsersPage() {
  const session = await getSession()
  if (!session || session.role !== 'ADMIN') redirect('/admin')

  const users = await prisma.user.findMany({
    select: {
      id: true, name: true, email: true, role: true,
      nip: true, prodi: true, jabatan: true, noHp: true,
      isActive: true, createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
  })

  return <UserList initialUsers={users} />
}
