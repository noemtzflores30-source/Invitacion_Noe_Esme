import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ uuid: string }> }
) {
  const { uuid } = await params
  const { confirmedPersonIds, message } = await request.json()

  const invitation = await prisma.invitation.findUnique({
    where: { id: uuid },
    include: { persons: true },
  })

  if (!invitation) return NextResponse.json({ error: 'No encontrada' }, { status: 404 })
  if (invitation.status !== 'PENDING') {
    return NextResponse.json({ error: 'La invitación ya fue respondida' }, { status: 400 })
  }

  const config = await prisma.eventConfig.findUnique({ where: { id: 'main' } })
  const deadline = invitation.deadlineType === 'SECONDARY'
    ? config?.secondaryDeadline
    : config?.primaryDeadline

  if (deadline) {
    const dl = new Date(deadline + 'T23:59:59')
    if (new Date() > dl) {
      return NextResponse.json({ error: 'El plazo de respuesta ha vencido' }, { status: 400 })
    }
  }

  const confirmedSet = new Set(confirmedPersonIds as string[])

  await Promise.all(
    invitation.persons.map(p =>
      prisma.invitedPerson.update({
        where: { id: p.id },
        data: {
          status: confirmedSet.has(p.id) ? 'CONFIRMED' : 'REJECTED',
          rejectionReason: confirmedSet.has(p.id) ? null : 'Declinó asistir',
        },
      })
    )
  )

  const anyConfirmed = confirmedPersonIds.length > 0
  await prisma.invitation.update({
    where: { id: uuid },
    data: {
      status: anyConfirmed ? 'ACCEPTED' : 'REJECTED',
      guestMessage: typeof message === 'string' && message.trim() ? message.trim() : null,
    },
  })

  return NextResponse.json({ ok: true })
}
