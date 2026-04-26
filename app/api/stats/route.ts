import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'
import { NextResponse } from 'next/server'

export async function GET() {
  const session = await getSession()
  if (!session || session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const startOfWeek = new Date()
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay())
  startOfWeek.setHours(0, 0, 0, 0)

  const [total, pending, wd2Acc, approved, rejected, approvedThisWeek] = await Promise.all([
    prisma.booking.count(),
    prisma.booking.count({ where: { status: 'PENDING' } }),
    prisma.booking.count({ where: { status: 'WD2_ACC' } }),
    prisma.booking.count({ where: { status: 'APPROVED' } }),
    prisma.booking.count({ where: { status: 'REJECTED' } }),
    prisma.booking.count({ where: { status: 'APPROVED', createdAt: { gte: startOfWeek } } }),
  ])

  return NextResponse.json({ total, pending, wd2Acc, approved, rejected, approvedThisWeek })
}
