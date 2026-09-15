import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ uuid: string }> }
) {
  const { uuid } = await params

  const invitation = await prisma.invitation.findUnique({
    where: { id: uuid },
    include: { persons: true },
  })

  if (!invitation) return NextResponse.json({ error: 'Invitación no encontrada' }, { status: 404 })

  const config = await prisma.eventConfig.findUnique({ where: { id: 'main' } })

  const deadline = invitation.deadlineType === 'SECONDARY'
    ? config?.secondaryDeadline
    : config?.primaryDeadline

  return NextResponse.json({
    invitation,
    deadline,
    config: config ? {
      eventDate: config.eventDate,
      venueName: config.venueName,
      venueAddress: config.venueAddress,
      venueMapUrl: config.venueMapUrl,
      ceremonyTime: config.ceremonyTime,
      receptionTime: config.receptionTime,
      itinerary: JSON.parse(config.itinerary),
      coverImageUrl: config.coverImageUrl,
      galleryImages: JSON.parse(config.galleryImages),
      dressCode: config.dressCode,
      additionalInfo: config.additionalInfo,
    } : null,
  })
}
