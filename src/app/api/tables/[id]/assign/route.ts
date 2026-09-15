import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: tableId } = await params
  const { personId } = await request.json()

  const table = await prisma.weddingTable.findUnique({
    where: { id: tableId },
    include: { assignments: true },
  })

  if (!table) return NextResponse.json({ error: 'Mesa no encontrada' }, { status: 404 })
  if (table.assignments.length >= 10) {
    return NextResponse.json({ error: 'Mesa llena (máx. 10 personas)' }, { status: 400 })
  }

  const person = await prisma.invitedPerson.findUnique({ where: { id: personId } })
  if (!person) return NextResponse.json({ error: 'Persona no encontrada' }, { status: 404 })
  if (person.status !== 'CONFIRMED') {
    return NextResponse.json({ error: 'Solo personas confirmadas pueden ser asignadas' }, { status: 400 })
  }

  // Remove existing assignment if any
  await prisma.tableAssignment.deleteMany({ where: { personId } })

  const seatNumber = table.assignments.length + 1

  const assignment = await prisma.tableAssignment.create({
    data: {
      tableId,
      personId,
      invitationId: person.invitationId,
      seatNumber,
    },
    include: { table: true, person: true },
  })

  return NextResponse.json(assignment, { status: 201 })
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: tableId } = await params
  const { personId } = await request.json()

  await prisma.tableAssignment.deleteMany({
    where: { tableId, personId },
  })

  return NextResponse.json({ ok: true })
}
