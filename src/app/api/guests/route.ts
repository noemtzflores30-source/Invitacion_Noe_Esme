import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { MAX_GUESTS, countPersonSlots } from '@/lib/utils'

async function getUsedSlots() {
  const all = await prisma.invitedPerson.findMany()
  const nonRejected = all.filter(p => p.status !== 'REJECTED')
  const adults = nonRejected.filter(p => !p.isChild).length
  const children = nonRejected.filter(p => p.isChild).length
  const confirmed = all.filter(p => p.status === 'CONFIRMED')
  const confirmedAdults = confirmed.filter(p => !p.isChild).length
  const confirmedChildren = confirmed.filter(p => p.isChild).length
  const confirmedSlots = confirmedAdults + Math.ceil(confirmedChildren / 2)
  const totalSlots = adults + Math.ceil(children / 2)
  return { totalSlots, confirmedSlots }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status')
  const invitedBy = searchParams.get('invitedBy')

  const where: Record<string, unknown> = {}
  if (status) where.status = status
  if (invitedBy) where.invitedBy = invitedBy

  const invitations = await prisma.invitation.findMany({
    where,
    include: { persons: true },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(invitations)
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { titularName, invitedBy, deadlineType, notes, persons } = body

  if (!titularName || !invitedBy || !persons?.length) {
    return NextResponse.json({ error: 'Datos incompletos' }, { status: 400 })
  }

  // Calculate slots this invitation would use
  const newAdults = persons.filter((p: { isChild: boolean }) => !p.isChild).length
  const newChildren = persons.filter((p: { isChild: boolean }) => p.isChild).length
  const newSlots = newAdults + Math.ceil(newChildren / 2)

  const { totalSlots, confirmedSlots } = await getUsedSlots()
  const available = MAX_GUESTS - totalSlots

  if (newSlots > available) {
    return NextResponse.json({
      error: `No hay suficientes lugares. Disponibles: ${available}, requeridos: ${newSlots}`,
      available,
      required: newSlots,
    }, { status: 400 })
  }

  const invitation = await prisma.invitation.create({
    data: {
      titularName,
      invitedBy,
      deadlineType: deadlineType || 'PRIMARY',
      notes,
      persons: {
        create: persons.map((p: { name: string; isChild: boolean }) => ({
          name: p.name,
          isChild: p.isChild || false,
        })),
      },
    },
    include: { persons: true },
  })

  return NextResponse.json(invitation, { status: 201 })
}
