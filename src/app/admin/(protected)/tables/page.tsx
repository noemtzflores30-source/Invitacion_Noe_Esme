import { prisma } from '@/lib/prisma'
import TablesClient from '@/components/admin/TablesClient'

// Always fetch fresh data — this page reads live DB state, must never be
// statically prerendered at build time (would freeze admin edits / RSVPs).
export const dynamic = 'force-dynamic'

export default async function TablesPage() {
  const tables = await prisma.weddingTable.findMany({
    include: {
      assignments: {
        include: { person: true, invitation: true },
      },
    },
    orderBy: { tableNumber: 'asc' },
  })

  const confirmedPersons = await prisma.invitedPerson.findMany({
    where: { status: 'CONFIRMED' },
    include: {
      invitation: true,
      tableAssignment: { include: { table: true } },
    },
  })

  return <TablesClient tables={tables} confirmedPersons={confirmedPersons} />
}
