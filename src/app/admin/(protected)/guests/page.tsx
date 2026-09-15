import { prisma } from '@/lib/prisma'
import GuestsListClient from '@/components/admin/GuestsListClient'

export default async function GuestsPage() {
  const invitations = await prisma.invitation.findMany({
    include: { persons: true },
    orderBy: { createdAt: 'desc' },
  })
  return <GuestsListClient invitations={invitations} />
}
