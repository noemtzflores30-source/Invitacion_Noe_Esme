import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { MAX_GUESTS, countPersonSlots, countConfirmedSlots } from '@/lib/utils'

export async function GET() {
  const invitations = await prisma.invitation.findMany({
    include: { persons: true },
  })

  let confirmedSlots = 0
  let pendingSlots = 0
  let rejectedCount = 0
  let acceptedCount = 0
  let pendingCount = 0

  for (const inv of invitations) {
    const nonRejected = inv.persons.filter(p => p.status !== 'REJECTED')
    const confirmed = inv.persons.filter(p => p.status === 'CONFIRMED')
    const pending = inv.persons.filter(p => p.status === 'PENDING')

    if (inv.status === 'ACCEPTED') acceptedCount++
    else if (inv.status === 'REJECTED') rejectedCount++
    else pendingCount++

    confirmedSlots += countConfirmedSlots(inv.persons)
    pendingSlots += countPersonSlots(pending.map(p => ({ ...p, status: undefined })))
  }

  const usedSlots = confirmedSlots + pendingSlots
  const available = MAX_GUESTS - usedSlots

  return NextResponse.json({
    total: MAX_GUESTS,
    confirmed: confirmedSlots,
    pending: pendingSlots,
    available: Math.max(0, available),
    invitations: {
      accepted: acceptedCount,
      pending: pendingCount,
      rejected: rejectedCount,
      total: invitations.length,
    },
  })
}
