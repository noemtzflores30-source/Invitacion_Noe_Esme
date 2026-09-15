import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const config = await prisma.eventConfig.findUnique({ where: { id: 'main' } })
  if (!config) return NextResponse.json({ error: 'No configurado' }, { status: 404 })
  return NextResponse.json({
    ...config,
    itinerary: JSON.parse(config.itinerary),
    galleryImages: JSON.parse(config.galleryImages),
    prohibitedColors: JSON.parse(config.prohibitedColors),
  })
}

export async function PUT(request: NextRequest) {
  const body = await request.json()
  const { itinerary, galleryImages, prohibitedColors, ...rest } = body

  const updated = await prisma.eventConfig.upsert({
    where: { id: 'main' },
    update: {
      ...rest,
      itinerary: itinerary ? JSON.stringify(itinerary) : undefined,
      galleryImages: galleryImages ? JSON.stringify(galleryImages) : undefined,
      prohibitedColors: prohibitedColors ? JSON.stringify(prohibitedColors) : undefined,
    },
    create: {
      id: 'main',
      ...rest,
      itinerary: itinerary ? JSON.stringify(itinerary) : '[]',
      galleryImages: galleryImages ? JSON.stringify(galleryImages) : '[]',
      prohibitedColors: prohibitedColors ? JSON.stringify(prohibitedColors) : '[]',
    },
  })

  return NextResponse.json({
    ...updated,
    itinerary: JSON.parse(updated.itinerary),
    galleryImages: JSON.parse(updated.galleryImages),
    prohibitedColors: JSON.parse(updated.prohibitedColors),
  })
}
