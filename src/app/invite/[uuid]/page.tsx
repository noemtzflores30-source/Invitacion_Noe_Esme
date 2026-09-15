import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import InvitationView from '@/components/invitation/InvitationView'

export default async function PersonalizedInvitePage({
  params,
}: {
  params: Promise<{ uuid: string }>
}) {
  const { uuid } = await params

  const invitation = await prisma.invitation.findUnique({
    where: { id: uuid },
    include: { persons: true },
  })

  if (!invitation) notFound()

  const config = await prisma.eventConfig.findUnique({ where: { id: 'main' } })
  const deadline = invitation.deadlineType === 'SECONDARY'
    ? config?.secondaryDeadline
    : config?.primaryDeadline

  const configData = config ? {
    eventDate: config.eventDate,
    venueName: config.venueName,
    venueAddress: config.venueAddress,
    venueMapUrl: config.venueMapUrl,
    venueLat: config.venueLat,
    venueLng: config.venueLng,
    ceremonyTime: config.ceremonyTime,
    receptionTime: config.receptionTime,
    itinerary: JSON.parse(config.itinerary) as { time: string; event: string; note?: string }[],
    coverImageUrl: config.coverImageUrl,
    galleryImages: JSON.parse(config.galleryImages) as string[],
    dressCode: config.dressCode,
    additionalInfo: config.additionalInfo,
    deadline: deadline || null,
    blessingText: config.blessingText,
    monogramImageUrl: config.monogramImageUrl,
    brideFatherName: config.brideFatherName,
    brideMotherName: config.brideMotherName,
    groomFatherName: config.groomFatherName,
    groomMotherName: config.groomMotherName,
    dressCodeDetail: config.dressCodeDetail,
    prohibitedColors: JSON.parse(config.prohibitedColors) as { name: string; hex: string }[],
    giftMessage: config.giftMessage,
    noticeTitle: config.noticeTitle,
    noticeText: config.noticeText,
  } : null

  return (
    <InvitationView
      invitation={{
        id: invitation.id,
        titularName: invitation.titularName,
        status: invitation.status,
        persons: invitation.persons.map(p => ({
          id: p.id,
          name: p.name,
          isChild: p.isChild,
          status: p.status,
        })),
      }}
      config={configData}
    />
  )
}
