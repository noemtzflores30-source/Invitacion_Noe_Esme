import { prisma } from '@/lib/prisma'
import GuestsListClient from '@/components/admin/GuestsListClient'

// Always fetch fresh data — this page reads live DB state, must never be
// statically prerendered at build time (would freeze admin edits / RSVPs).
export const dynamic = 'force-dynamic'

export default async function GuestsPage() {
  const invitations = await prisma.invitation.findMany({
    include: { persons: true },
    orderBy: { createdAt: 'desc' },
  })
  return <GuestsListClient invitations={invitations} />
}
