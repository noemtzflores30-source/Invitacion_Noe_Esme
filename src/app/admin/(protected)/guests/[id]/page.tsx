import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { MAX_GUESTS, countPersonSlots } from '@/lib/utils'
import GuestDetailClient from '@/components/admin/GuestDetailClient'

// Always fetch fresh data — this page reads live DB state, must never be
// statically prerendered at build time (would freeze admin edits / RSVPs).
export const dynamic = 'force-dynamic'

async function getData(id: string) {
  const invitation = await prisma.invitation.findUnique({
    where: { id },
    include: {
      persons: {
        include: { tableAssignment: { include: { table: true } } },
      },
    },
  })
  if (!invitation) return null

  // Available slots: current used - this invitation's own slots + base available
  const allPersons = await prisma.invitedPerson.findMany()
  const nonRejected = allPersons.filter(p => p.status !== 'REJECTED')
  const adults = nonRejected.filter(p => !p.isChild).length
  const children = nonRejected.filter(p => p.isChild).length
  const used = adults + Math.ceil(children / 2)

  // Own slots (don't count against limit when editing)
  const ownNonRejected = invitation.persons.filter(p => p.status !== 'REJECTED')
  const ownAdults = ownNonRejected.filter(p => !p.isChild).length
  const ownChildren = ownNonRejected.filter(p => p.isChild).length
  const ownSlots = ownAdults + Math.ceil(ownChildren / 2)

  const available = Math.max(0, MAX_GUESTS - used + ownSlots)

  return { invitation, available }
}

export default async function GuestDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ status?: string }>
}) {
  const { id } = await params
  const { status } = await searchParams
  const data = await getData(id)
  if (!data) notFound()

  return <GuestDetailClient invitation={data.invitation} availableSlots={data.available} statusFilter={status} />
}
