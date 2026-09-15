import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const tables = await prisma.weddingTable.findMany({
    include: {
      assignments: {
        include: {
          person: true,
          invitation: true,
        },
      },
    },
    orderBy: { tableNumber: 'asc' },
  })
  return NextResponse.json(tables)
}
