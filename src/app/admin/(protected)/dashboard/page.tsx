import { prisma } from '@/lib/prisma'
import { MAX_GUESTS, countPersonSlots, countConfirmedSlots } from '@/lib/utils'
import DashboardClient from '@/components/admin/DashboardClient'

// Always fetch fresh data — this page reads live DB state, must never be
// statically prerendered at build time (would freeze admin edits / RSVPs).
export const dynamic = 'force-dynamic'

async function getStats() {
  const invitations = await prisma.invitation.findMany({
    include: { persons: true },
    orderBy: { createdAt: 'desc' },
  })

  let confirmedSlots = 0
  let pendingSlots = 0

  for (const inv of invitations) {
    confirmedSlots += countConfirmedSlots(inv.persons)
    const pending = inv.persons.filter(p => p.status === 'PENDING')
    pendingSlots += countPersonSlots(pending)
  }

  const usedSlots = confirmedSlots + pendingSlots
  const available = Math.max(0, MAX_GUESTS - usedSlots)

  // Count invitations that have at least one person in each status, not the
  // invitation's aggregate status — a 3-person invite with 2 confirmed and
  // 1 rejected belongs in both the "Aceptaron" and "Rechazaron" buckets.
  const accepted = invitations.filter(i => i.persons.some(p => p.status === 'CONFIRMED')).length
  const pending = invitations.filter(i => i.persons.some(p => p.status === 'PENDING')).length
  const rejected = invitations.filter(i => i.persons.some(p => p.status === 'REJECTED')).length

  return {
    stats: { confirmedSlots, pendingSlots, available, usedSlots, accepted, pending, rejected },
    invitations,
  }
}

export default async function DashboardPage() {
  const { stats, invitations } = await getStats()
  return <DashboardClient stats={stats} invitations={invitations} />
}
