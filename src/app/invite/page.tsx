import { prisma } from '@/lib/prisma'
import InvitationView from '@/components/invitation/InvitationView'

export default async function GenericInvitePage() {
  const config = await prisma.eventConfig.findUnique({ where: { id: 'main' } })
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
    deadline: null,
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
      invitation={null}
      config={configData}
    />
  )
}
