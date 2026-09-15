import GuestForm from '@/components/admin/GuestForm'
import { prisma } from '@/lib/prisma'
import { MAX_GUESTS, countPersonSlots } from '@/lib/utils'

// Always fetch fresh data — this page reads live DB state, must never be
// statically prerendered at build time (would freeze admin edits / RSVPs).
export const dynamic = 'force-dynamic'

async function getAvailableSlots() {
  const persons = await prisma.invitedPerson.findMany()
  const nonRejected = persons.filter(p => p.status !== 'REJECTED')
  const adults = nonRejected.filter(p => !p.isChild).length
  const children = nonRejected.filter(p => p.isChild).length
  const used = adults + Math.ceil(children / 2)
  return Math.max(0, MAX_GUESTS - used)
}

export default async function NewGuestPage() {
  const available = await getAvailableSlots()
  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="font-serif text-3xl" style={{ color: 'var(--brown-dark)' }}>Nueva Invitación</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--brown-mid)' }}>
          Lugares disponibles: <strong style={{ color: available > 10 ? 'var(--gold-dark)' : '#dc2626' }}>{available}</strong>
        </p>
      </div>
      <GuestForm availableSlots={available} />
    </div>
  )
}
