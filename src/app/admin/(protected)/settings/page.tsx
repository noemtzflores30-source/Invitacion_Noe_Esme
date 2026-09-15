import { prisma } from '@/lib/prisma'
import SettingsClient from '@/components/admin/SettingsClient'

// Always fetch fresh data — this page reads live DB state, must never be
// statically prerendered at build time (would freeze admin edits / RSVPs).
export const dynamic = 'force-dynamic'

export default async function SettingsPage() {
  const config = await prisma.eventConfig.findUnique({ where: { id: 'main' } })
  const parsed = config ? {
    ...config,
    itinerary: JSON.parse(config.itinerary) as { time: string; event: string; note?: string }[],
    galleryImages: JSON.parse(config.galleryImages) as string[],
    prohibitedColors: JSON.parse(config.prohibitedColors) as { name: string; hex: string }[],
  } : null

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="font-serif text-3xl" style={{ color: 'var(--brown-dark)' }}>Configuración</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--brown-mid)' }}>
          Información del evento e itinerario
        </p>
      </div>
      <SettingsClient initialConfig={parsed} />
    </div>
  )
}
