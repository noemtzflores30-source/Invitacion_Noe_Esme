import { prisma } from '@/lib/prisma'
import TablesClient from '@/components/admin/TablesClient'

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
