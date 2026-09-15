import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const invitation = await prisma.invitation.findUnique({
    where: { id },
    include: { persons: { include: { tableAssignment: { include: { table: true } } } } },
  })
  if (!invitation) return NextResponse.json({ error: 'No encontrado' }, { status: 404 })
  return NextResponse.json(invitation)
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await request.json()
  const { titularName, invitedBy, deadlineType, notes, status, persons } = body

  await prisma.invitation.update({
    where: { id },
    data: {
      ...(titularName && { titularName }),
      ...(invitedBy && { invitedBy }),
      ...(deadlineType && { deadlineType }),
      ...(notes !== undefined && { notes }),
      ...(status && { status }),
    },
  })

  // Update person statuses if provided
  if (persons) {
    for (const p of persons) {
      if (p.id) {
        await prisma.invitedPerson.update({
          where: { id: p.id },
          data: {
            ...(p.status && { status: p.status }),
            ...(p.rejectionReason !== undefined && { rejectionReason: p.rejectionReason }),
            ...(p.name && { name: p.name }),
            ...(p.isChild !== undefined && { isChild: p.isChild }),
          },
        })
      }
    }
  }

  // Recompute invitation status
  const freshPersons = await prisma.invitedPerson.findMany({ where: { invitationId: id } })
  const allConfirmed = freshPersons.every(p => p.status === 'CONFIRMED')
  const allRejected = freshPersons.every(p => p.status === 'REJECTED')
  const anyConfirmed = freshPersons.some(p => p.status === 'CONFIRMED')
  const anyPending = freshPersons.some(p => p.status === 'PENDING')

  let newStatus = 'PENDING'
  if (allRejected) newStatus = 'REJECTED'
  else if (allConfirmed || (anyConfirmed && !anyPending)) newStatus = 'ACCEPTED'
  else if (anyConfirmed) newStatus = 'ACCEPTED'

  if (status) newStatus = status

  const updated = await prisma.invitation.update({
    where: { id },
    data: { status: newStatus },
    include: { persons: true },
  })

  return NextResponse.json(updated)
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  await prisma.invitation.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
