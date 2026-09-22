'use client'

import { useState } from 'react'
import ImageUploader from './ImageUploader'

interface ItineraryItem {
  time: string
  event: string
  note?: string
}

interface ProhibitedColor {
  name: string
  hex: string
}

interface Config {
  eventDate: string
  venueName: string
  venueAddress: string
  venueMapUrl: string
  venueLat: string
  venueLng: string
  ceremonyTime: string
  receptionTime: string
  itinerary: ItineraryItem[]
  primaryDeadline?: string | null
  secondaryDeadline?: string | null
  coverImageUrl: string
  galleryImages: string[]
  dressCode: string
  additionalInfo: string
  blessingText: string
  monogramImageUrl: string
  brideFatherName: string
  brideMotherName: string
  groomFatherName: string
  groomMotherName: string
  dressCodeDetail: string
  prohibitedColors: ProhibitedColor[]
  giftMessage: string
  noticeTitle: string
  noticeText: string
  deadlineInvalidationMessage: string
}

export default function SettingsClient({ initialConfig }: { initialConfig: Config | null }) {
  const [config, setConfig] = useState<Config>(initialConfig || {
    eventDate: '2027-01-30',
    venueName: '',
    venueAddress: '',
    venueMapUrl: '',
    venueLat: '',
    venueLng: '',
    ceremonyTime: '16:00',
    receptionTime: '19:00',
    itinerary: [],
    primaryDeadline: '',
    secondaryDeadline: '',
    coverImageUrl: '',
    galleryImages: [],
    dressCode: 'Formal',
    additionalInfo: '',
    blessingText: '',
    monogramImageUrl: '',
    brideFatherName: '',
    brideMotherName: '',
    groomFatherName: '',
    groomMotherName: '',
    dressCodeDetail: '',
    prohibitedColors: [],
    giftMessage: '',
    noticeTitle: '',
    noticeText: '',
    deadlineInvalidationMessage: '',
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [newGalleryUrl, setNewGalleryUrl] = useState('')

  function updateField<K extends keyof Config>(key: K, value: Config[K]) {
    setConfig(prev => ({ ...prev, [key]: value }))
  }

  function updateItinerary(i: number, field: keyof ItineraryItem, value: string) {
    setConfig(prev => ({
      ...prev,
      itinerary: prev.itinerary.map((item, idx) => idx === i ? { ...item, [field]: value } : item),
    }))
  }

  function addItineraryItem() {
    setConfig(prev => ({ ...prev, itinerary: [...prev.itinerary, { time: '', event: '', note: '' }] }))
  }

  function removeItineraryItem(i: number) {
    setConfig(prev => ({ ...prev, itinerary: prev.itinerary.filter((_, idx) => idx !== i) }))
  }

  function addGalleryImage() {
    if (!newGalleryUrl.trim()) return
    setConfig(prev => ({ ...prev, galleryImages: [...prev.galleryImages, newGalleryUrl.trim()] }))
    setNewGalleryUrl('')
  }

  function removeGalleryImage(i: number) {
    setConfig(prev => ({ ...prev, galleryImages: prev.galleryImages.filter((_, idx) => idx !== i) }))
  }

  function updateProhibitedColor(i: number, field: keyof ProhibitedColor, value: string) {
    setConfig(prev => ({
      ...prev,
      prohibitedColors: prev.prohibitedColors.map((c, idx) => idx === i ? { ...c, [field]: value } : c),
    }))
  }

  function addProhibitedColor() {
    setConfig(prev => ({ ...prev, prohibitedColors: [...prev.prohibitedColors, { name: '', hex: '#ffffff' }] }))
  }

  function removeProhibitedColor(i: number) {
    setConfig(prev => ({ ...prev, prohibitedColors: prev.prohibitedColors.filter((_, idx) => idx !== i) }))
  }

  async function handleSave() {
    setLoading(true)
    setSuccess(false)
    setError('')

    const res = await fetch('/api/config', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config),
    })

    if (res.ok) {
      setSuccess(true)
    } else {
      setError('Error al guardar la configuración')
    }
    setLoading(false)
  }

  const inputClass = "w-full px-4 py-2.5 rounded-lg text-sm outline-none"
  const inputStyle = { background: 'var(--cream)', border: '1px solid var(--gold-light)', color: 'var(--brown-dark)' }
  const labelStyle = { color: 'var(--brown-mid)' }

  return (
    <div className="space-y-6">
      {/* Event info */}
      <section className="bg-white rounded-2xl p-6 space-y-5" style={{ border: '1px solid var(--border)' }}>
        <h2 className="font-semibold" style={{ color: 'var(--brown-dark)' }}>Información del evento</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1.5" style={labelStyle}>Fecha del evento</label>
            <input type="date" value={config.eventDate} onChange={e => updateField('eventDate', e.target.value)} className={inputClass} style={inputStyle} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5" style={labelStyle}>Código de vestimenta (título)</label>
            <input type="text" value={config.dressCode} onChange={e => updateField('dressCode', e.target.value)} className={inputClass} style={inputStyle} placeholder="Etiqueta rigurosa" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5" style={labelStyle}>Hora de ceremonia</label>
            <input type="time" value={config.ceremonyTime} onChange={e => updateField('ceremonyTime', e.target.value)} className={inputClass} style={inputStyle} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5" style={labelStyle}>Hora de recepción</label>
            <input type="time" value={config.receptionTime} onChange={e => updateField('receptionTime', e.target.value)} className={inputClass} style={inputStyle} />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5" style={labelStyle}>Nombre del lugar</label>
          <input type="text" value={config.venueName} onChange={e => updateField('venueName', e.target.value)} className={inputClass} style={inputStyle} placeholder="Jardines del Bosque" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5" style={labelStyle}>Dirección</label>
          <input type="text" value={config.venueAddress} onChange={e => updateField('venueAddress', e.target.value)} className={inputClass} style={inputStyle} placeholder="Av. del Bosque 1234..." />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5" style={labelStyle}>Link de Google Maps (botón &quot;Cómo llegar&quot;)</label>
          <input type="url" value={config.venueMapUrl} onChange={e => updateField('venueMapUrl', e.target.value)} className={inputClass} style={inputStyle} placeholder="https://maps.google.com/..." />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5" style={labelStyle}>Coordenadas del lugar (para el pin del mapa)</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input type="text" value={config.venueLat} onChange={e => updateField('venueLat', e.target.value)} className={inputClass} style={inputStyle} placeholder="Latitud, ej. 18.8994602" />
            <input type="text" value={config.venueLng} onChange={e => updateField('venueLng', e.target.value)} className={inputClass} style={inputStyle} placeholder="Longitud, ej. -99.2137462" />
          </div>
          <p className="text-xs mt-1.5" style={{ color: 'var(--brown-mid)', opacity: 0.7 }}>
            En Google Maps, haz click derecho exacto sobre el lugar y copia las coordenadas que aparecen arriba del menú. Así el mapa de la invitación marca el punto exacto en vez de una búsqueda aproximada.
          </p>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5" style={labelStyle}>Información adicional</label>
          <textarea value={config.additionalInfo} onChange={e => updateField('additionalInfo', e.target.value)} rows={3} className={inputClass + ' resize-none'} style={inputStyle} placeholder="Estacionamiento, notas, etc." />
        </div>
      </section>

      {/* Blessing / story */}
      <section className="bg-white rounded-2xl p-6 space-y-5" style={{ border: '1px solid var(--border)' }}>
        <h2 className="font-semibold" style={{ color: 'var(--brown-dark)' }}>Nuestra historia</h2>
        <div>
          <label className="block text-sm font-medium mb-1.5" style={labelStyle}>Frase de bendición</label>
          <textarea value={config.blessingText} onChange={e => updateField('blessingText', e.target.value)} rows={3} className={inputClass + ' resize-none'} style={inputStyle} placeholder="Con la bendición de Dios y de nuestras familias..." />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5" style={labelStyle}>Logo / sello (opcional)</label>
          <div className="flex flex-wrap items-center gap-3 mb-2">
            <ImageUploader
              label="Subir sello"
              transform="f_auto,q_auto,w_600,c_limit"
              onUploaded={url => updateField('monogramImageUrl', url)}
            />
            {config.monogramImageUrl && (
              <img src={config.monogramImageUrl} alt="Sello" className="rounded-lg h-16 object-contain" onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
            )}
          </div>
          <input type="url" value={config.monogramImageUrl} onChange={e => updateField('monogramImageUrl', e.target.value)} className={inputClass} style={inputStyle} placeholder="o pega una URL directamente..." />
        </div>
      </section>

      {/* Parents */}
      <section className="bg-white rounded-2xl p-6 space-y-5" style={{ border: '1px solid var(--border)' }}>
        <h2 className="font-semibold" style={{ color: 'var(--brown-dark)' }}>Padres de los novios</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1.5" style={labelStyle}>Padre de la novia</label>
            <input type="text" value={config.brideFatherName} onChange={e => updateField('brideFatherName', e.target.value)} className={inputClass} style={inputStyle} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5" style={labelStyle}>Madre de la novia</label>
            <input type="text" value={config.brideMotherName} onChange={e => updateField('brideMotherName', e.target.value)} className={inputClass} style={inputStyle} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5" style={labelStyle}>Padre del novio</label>
            <input type="text" value={config.groomFatherName} onChange={e => updateField('groomFatherName', e.target.value)} className={inputClass} style={inputStyle} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5" style={labelStyle}>Madre del novio</label>
            <input type="text" value={config.groomMotherName} onChange={e => updateField('groomMotherName', e.target.value)} className={inputClass} style={inputStyle} />
          </div>
        </div>
      </section>

      {/* Deadlines */}
      <section className="bg-white rounded-2xl p-6 space-y-5" style={{ border: '1px solid var(--border)' }}>
        <h2 className="font-semibold" style={{ color: 'var(--brown-dark)' }}>Fechas límite de respuesta</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1.5" style={labelStyle}>Fecha límite principal</label>
            <input
              type="date"
              value={config.primaryDeadline || ''}
              onChange={e => updateField('primaryDeadline', e.target.value)}
              className={inputClass}
              style={inputStyle}
            />
            <p className="text-xs mt-1" style={{ color: 'var(--brown-mid)', opacity: 0.7 }}>Para la mayoría de los invitados</p>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5" style={labelStyle}>Fecha límite secundaria</label>
            <input
              type="date"
              value={config.secondaryDeadline || ''}
              onChange={e => updateField('secondaryDeadline', e.target.value)}
              className={inputClass}
              style={inputStyle}
            />
            <p className="text-xs mt-1" style={{ color: 'var(--brown-mid)', opacity: 0.7 }}>Para segunda ronda o fecha más cercana</p>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5" style={labelStyle}>Mensaje de invalidación por falta de respuesta</label>
          <textarea
            value={config.deadlineInvalidationMessage}
            onChange={e => updateField('deadlineInvalidationMessage', e.target.value)}
            rows={3}
            className={inputClass + ' resize-none'}
            style={inputStyle}
            placeholder="Si no recibimos su confirmación antes de esta fecha..."
          />
          <p className="text-xs mt-1.5" style={{ color: 'var(--brown-mid)', opacity: 0.7 }}>
            Se muestra en la invitación junto a la fecha límite, para dejar claro que no responder a tiempo invalida el lugar reservado.
          </p>
        </div>
      </section>

      {/* Itinerary */}
      <section className="bg-white rounded-2xl p-6 space-y-4" style={{ border: '1px solid var(--border)' }}>
        <div className="flex items-center justify-between">
          <h2 className="font-semibold" style={{ color: 'var(--brown-dark)' }}>Itinerario</h2>
          <button onClick={addItineraryItem} className="text-sm font-medium hover:opacity-80 transition-opacity" style={{ color: 'var(--gold-dark)' }}>
            + Agregar
          </button>
        </div>
        {config.itinerary.length === 0 && (
          <p className="text-sm text-center py-4" style={{ color: 'var(--brown-mid)' }}>Sin itinerario</p>
        )}
        {config.itinerary.map((item, i) => (
          <div key={i} className="flex flex-col sm:flex-row gap-2 sm:gap-3 sm:items-center p-3 sm:p-0 rounded-lg sm:rounded-none" style={{ background: 'var(--cream)' }}>
            <div className="flex gap-2 sm:contents">
              <input
                type="time"
                value={item.time}
                onChange={e => updateItinerary(i, 'time', e.target.value)}
                className="w-28 px-3 py-2 rounded-lg text-sm outline-none shrink-0"
                style={inputStyle}
              />
              <button
                onClick={() => removeItineraryItem(i)}
                className="sm:hidden ml-auto w-9 h-9 shrink-0 flex items-center justify-center rounded-lg text-sm hover:opacity-70 transition-opacity"
                style={{ color: '#dc2626' }}
              >
                ✕
              </button>
            </div>
            <input
              type="text"
              value={item.event}
              onChange={e => updateItinerary(i, 'event', e.target.value)}
              placeholder="Descripción del evento"
              className="flex-1 px-4 py-2 rounded-lg text-sm outline-none"
              style={inputStyle}
            />
            <input
              type="text"
              value={item.note || ''}
              onChange={e => updateItinerary(i, 'note', e.target.value)}
              placeholder="Nota (opcional)"
              className="flex-1 px-4 py-2 rounded-lg text-sm outline-none"
              style={inputStyle}
            />
            <button onClick={() => removeItineraryItem(i)} className="hidden sm:block text-sm hover:opacity-70 transition-opacity shrink-0" style={{ color: '#dc2626' }}>✕</button>
          </div>
        ))}
      </section>

      {/* Cover image */}
      <section className="bg-white rounded-2xl p-6 space-y-5" style={{ border: '1px solid var(--border)' }}>
        <h2 className="font-semibold" style={{ color: 'var(--brown-dark)' }}>Imágenes</h2>
        <div>
          <label className="block text-sm font-medium mb-1.5" style={labelStyle}>Imagen de portada (URL)</label>
          <input type="url" value={config.coverImageUrl} onChange={e => updateField('coverImageUrl', e.target.value)} className={inputClass} style={inputStyle} placeholder="https://..." />
          {config.coverImageUrl && (
            <img src={config.coverImageUrl} alt="Portada" className="mt-2 rounded-lg h-32 object-cover" onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5" style={labelStyle}>Galería de imágenes</label>
          <div className="mb-3">
            <ImageUploader
              label="Subir foto a la galería"
              transform="f_auto,q_auto,w_1200,c_limit"
              onUploaded={url => setConfig(prev => ({ ...prev, galleryImages: [...prev.galleryImages, url] }))}
            />
          </div>
          <div className="flex flex-wrap gap-2 mb-3">
            <input
              type="url"
              value={newGalleryUrl}
              onChange={e => setNewGalleryUrl(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addGalleryImage()}
              placeholder="o pega una URL directamente..."
              className="flex-1 min-w-[160px] px-4 py-2 rounded-lg text-sm outline-none"
              style={inputStyle}
            />
            <button onClick={addGalleryImage} className="px-4 py-2 rounded-lg text-sm font-medium text-white hover:opacity-90 transition-all shrink-0" style={{ background: 'var(--gold-dark)' }}>
              Agregar
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {config.galleryImages.map((url, i) => (
              <div key={i} className="relative group">
                <img src={url} alt="" className="w-full h-20 object-cover rounded-lg" onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
                <button
                  onClick={() => removeGalleryImage(i)}
                  className="absolute top-1 right-1 w-6 h-6 rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ background: '#dc2626', color: 'white' }}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Dress code detail */}
      <section className="bg-white rounded-2xl p-6 space-y-5" style={{ border: '1px solid var(--border)' }}>
        <h2 className="font-semibold" style={{ color: 'var(--brown-dark)' }}>Detalle de vestimenta</h2>
        <div>
          <label className="block text-sm font-medium mb-1.5" style={labelStyle}>Descripción</label>
          <textarea value={config.dressCodeDetail} onChange={e => updateField('dressCodeDetail', e.target.value)} rows={2} className={inputClass + ' resize-none'} style={inputStyle} placeholder="Vestido largo para ellas, traje formal para ellos..." />
        </div>
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium" style={labelStyle}>Colores reservados / a evitar</label>
            <button onClick={addProhibitedColor} className="text-sm font-medium hover:opacity-80 transition-opacity" style={{ color: 'var(--gold-dark)' }}>
              + Agregar
            </button>
          </div>
          {config.prohibitedColors.length === 0 && (
            <p className="text-sm text-center py-3" style={{ color: 'var(--brown-mid)' }}>Sin colores restringidos</p>
          )}
          <div className="space-y-2">
            {config.prohibitedColors.map((c, i) => (
              <div key={i} className="flex flex-wrap gap-3 items-center">
                <input
                  type="color"
                  value={c.hex}
                  onChange={e => updateProhibitedColor(i, 'hex', e.target.value)}
                  className="w-10 h-10 rounded-lg shrink-0 cursor-pointer"
                  style={{ border: '1px solid var(--gold-light)' }}
                />
                <input
                  type="text"
                  value={c.hex}
                  onChange={e => updateProhibitedColor(i, 'hex', e.target.value)}
                  className="w-24 px-3 py-2 rounded-lg text-sm outline-none shrink-0"
                  style={inputStyle}
                />
                <input
                  type="text"
                  value={c.name}
                  onChange={e => updateProhibitedColor(i, 'name', e.target.value)}
                  placeholder="Nombre del color"
                  className="flex-1 min-w-[120px] px-4 py-2 rounded-lg text-sm outline-none"
                  style={inputStyle}
                />
                <button onClick={() => removeProhibitedColor(i)} className="text-sm hover:opacity-70 transition-opacity shrink-0" style={{ color: '#dc2626' }}>✕</button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Gift table */}
      <section className="bg-white rounded-2xl p-6 space-y-5" style={{ border: '1px solid var(--border)' }}>
        <h2 className="font-semibold" style={{ color: 'var(--brown-dark)' }}>Mesa de regalos</h2>
        <div>
          <label className="block text-sm font-medium mb-1.5" style={labelStyle}>Mensaje (déjalo vacío para ocultar la sección)</label>
          <textarea value={config.giftMessage} onChange={e => updateField('giftMessage', e.target.value)} rows={3} className={inputClass + ' resize-none'} style={inputStyle} placeholder="Si deseas contribuir de alguna manera..." />
        </div>
      </section>

      {/* Formal notice */}
      <section className="bg-white rounded-2xl p-6 space-y-5" style={{ border: '1px solid var(--border)' }}>
        <h2 className="font-semibold" style={{ color: 'var(--brown-dark)' }}>Aviso importante</h2>
        <div>
          <label className="block text-sm font-medium mb-1.5" style={labelStyle}>Título</label>
          <input type="text" value={config.noticeTitle} onChange={e => updateField('noticeTitle', e.target.value)} className={inputClass} style={inputStyle} placeholder="Cuidado del recinto" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5" style={labelStyle}>Texto</label>
          <textarea value={config.noticeText} onChange={e => updateField('noticeText', e.target.value)} rows={3} className={inputClass + ' resize-none'} style={inputStyle} placeholder="Con el fin de preservar este hermoso espacio..." />
        </div>
      </section>

      {error && <div className="p-4 rounded-lg text-sm" style={{ background: '#fef2f2', color: '#dc2626' }}>{error}</div>}
      {success && <div className="p-4 rounded-lg text-sm" style={{ background: '#f0fdf4', color: '#16a34a' }}>Configuración guardada correctamente</div>}

      <button
        onClick={handleSave}
        disabled={loading}
        className="w-full py-3 rounded-lg font-semibold text-white transition-all hover:opacity-90 disabled:opacity-60"
        style={{ background: 'var(--gold-dark)' }}
      >
        {loading ? 'Guardando...' : 'Guardar configuración'}
      </button>
    </div>
  )
}
