import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import bcrypt from 'bcryptjs'
import 'dotenv/config'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

async function main() {
  const hash = await bcrypt.hash('boda2027', 12)
  await prisma.adminUser.upsert({
    where: { username: 'admin' },
    update: {},
    create: { username: 'admin', passwordHash: hash },
  })

  await prisma.eventConfig.upsert({
    where: { id: 'main' },
    update: {},
    create: {
      id: 'main',
      eventDate: '2027-01-30',
      venueName: 'Los Tabachines',
      venueAddress: 'Cuernavaca, Morelos',
      venueMapUrl: 'https://www.google.com/maps/dir/?api=1&destination=18.8994602%2C-99.2137462&destination_place_id=ChIJLWShWA3fzYURV4X8yKAv7eM',
      venueLat: '18.8994602',
      venueLng: '-99.2137462',
      ceremonyTime: '16:30',
      receptionTime: '16:00',
      itinerary: JSON.stringify([
        { time: '16:00', event: 'Recepción de invitados', note: 'Bienvenida con música en vivo' },
        { time: '16:30', event: 'Ceremonia religiosa', note: 'Capilla de la hacienda' },
        { time: '17:30', event: 'Cóctel de bienvenida', note: 'Jardín principal' },
        { time: '19:00', event: 'Banquete', note: 'Salón Los Tabachines' },
        { time: '21:00', event: 'Baile y celebración', note: 'Hasta el amanecer' },
        { time: '00:00', event: 'Despedida de los novios', note: 'Tornaboda' },
      ]),
      primaryDeadline: '2026-12-30',
      coverImageUrl: '',
      galleryImages: JSON.stringify([]),
      dressCode: 'Etiqueta rigurosa',
      dressCodeDetail: 'Vestido largo para ellas, traje formal para ellos. Les pedimos amablemente reservar para la novia los tonos que se muestran a continuación.',
      prohibitedColors: JSON.stringify([
        { name: 'Blanco', hex: '#ffffff' },
        { name: 'Vino', hex: '#61081b' },
      ]),
      additionalInfo: '',
      blessingText: 'Con la bendición de Dios y de nuestras familias, hemos decidido unir nuestras vidas. Será un honor contar con su presencia en este día tan especial.',
      monogramImageUrl: '',
      brideFatherName: 'Rodolfo De los Santos Gilbón',
      brideMotherName: 'Belem Sedano Ortega',
      groomFatherName: 'Héctor Leonardo Martínez Solís',
      groomMotherName: 'Rafaela Flores De los Santos',
      giftMessage: 'Si deseas contribuir de alguna manera, estamos ahorrando para algo especial. Si gustas, tu aporte en efectivo sería genial. No te preocupes, el sobre estará en la mesa.',
      noticeTitle: 'Cuidado del recinto',
      noticeText: 'Con el fin de preservar este hermoso espacio donde compartiremos un día tan especial, agradecemos a los padres y tutores su apoyo supervisando a los menores en todo momento. Les recordamos que cualquier daño ocasionado a las instalaciones, mobiliario u objetos del recinto deberá ser cubierto por la persona responsable.',
    },
  })

  for (let i = 1; i <= 19; i++) {
    await prisma.weddingTable.upsert({
      where: { tableNumber: i },
      update: {},
      create: { tableNumber: i, name: `Mesa ${i}` },
    })
  }

  console.log('Seed completado.')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
