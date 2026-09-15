import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const table = await prisma.weddingTable.findUnique({
    where: { id },
    include: {
      assignments: {
        include: { person: true, invitation: true },
      },
    },
  })
  if (!table) return NextResponse.json({ error: 'No encontrada' }, { status: 404 })
  return NextResponse.json(table)
}
