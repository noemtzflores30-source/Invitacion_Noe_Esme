'use client'

import { useEffect, useState } from 'react'
import { formatShortDate, isDeadlinePassed } from '@/lib/utils'
import RSVPSection from './RSVPSection'

interface Person {
  id: string
  name: string
  isChild: boolean
  status: string
}

interface InvitationData {
  id: string
  titularName: string
  status: string
  persons: Person[]
}

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
  coverImageUrl: string
  galleryImages: string[]
  dressCode: string
  additionalInfo: string
  deadline: string | null
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
}

// Dedicated typeface for standalone date displays and the countdown —
// distinct from the Cormorant Garamond / Jost pairing used everywhere else.
const TIMES = "'Times New Roman', Times, serif"

const c = {
  bgAlt: '#f5ede4',
  text: '#5b4a44',
  textBody: '#6d5a51',
  heading: '#6e5249',
  accent: '#7d5a4f',
  accentHover: '#6e4b3f',
  gold: '#bd9a5f',
  goldLabel: '#bfa06a',
  goldSoft: '#cdb588',
  labelDim: '#a98e6a',
  muted: '#8a7060',
  mutedSoft: '#9a8175',
  mutedFaint: '#a8917f',
  border: '#ecdccb',
  borderSoft: '#e7dac6',
  borderFaint: '#ddccc4',
  footerText: '#f8efe7',
  footerGold: '#e7c98f',
}

export default function InvitationView({
  invitation,
  config,
}: {
  invitation: InvitationData | null
  config: Config | null
}) {
  const eventDate = config?.eventDate || '2027-01-30'
  const ceremonyTime = config?.ceremonyTime || '16:30'
  const deadlinePassed = isDeadlinePassed(config?.deadline)
  const isPersonalized = !!invitation
  const isResponded = invitation?.status === 'ACCEPTED' || invitation?.status === 'REJECTED'
  const hasChild = !!invitation?.persons.some(p => p.isChild)

  return (
    <div className="min-h-screen invitation-bg">
      <Portada eventDate={eventDate} config={config} />

      <section style={{ maxWidth: 680, margin: '0 auto', padding: 'clamp(72px,14vw,104px) clamp(20px,5vw,28px) 0', textAlign: 'center' }}>
        <Divider />
        <p style={{ fontSize: 'clamp(22px,3.6vw,30px)', lineHeight: 1.6, fontWeight: 300, fontStyle: 'italic', color: c.textBody, margin: 0 }}>
          {config?.blessingText || 'Con la bendición de Dios y de nuestras familias, hemos decidido unir nuestras vidas. Será un honor contar con su presencia en este día tan especial.'}
        </p>
      </section>

      <Countdown eventDate={eventDate} ceremonyTime={ceremonyTime} />

      {config && (config.brideFatherName || config.groomFatherName) && (
        <Padres config={config} />
      )}

      {isPersonalized && invitation && (
        <Invitados invitation={invitation} />
      )}

      {isPersonalized && config?.deadline && (
        <section style={{ maxWidth: 620, margin: '0 auto', padding: 'clamp(64px,12vw,100px) clamp(20px,5vw,28px) clamp(48px,10vw,72px)' }}>
          <div
            style={{
              textAlign: 'center',
              padding: 'clamp(24px,5vw,40px)',
              background: deadlinePassed ? '#fdf2f0' : '#fffdfb',
              border: `1px solid ${deadlinePassed ? '#e0b8ab' : c.border}`,
              borderTop: `3px solid ${deadlinePassed ? '#b3543f' : c.gold}`,
            }}
          >
            {deadlinePassed ? (
              <>
                <div className="font-label" style={{ fontSize: 12, color: '#b3543f' }}>Fecha límite vencida</div>
                <p style={{ fontSize: 19, lineHeight: 1.6, color: c.textBody, margin: '14px 0 0' }}>
                  El plazo para confirmar asistencia concluyó el <strong style={{ fontFamily: TIMES }}>{formatShortDate(config.deadline)}</strong>. Sus lugares han sido cedidos a otras personas.
                </p>
              </>
            ) : (
              <>
                <div className="font-label" style={{ fontSize: 12, color: c.goldLabel }}>Fecha límite de confirmación</div>
                <p style={{ fontFamily: TIMES, fontSize: 'clamp(26px,4vw,34px)', fontStyle: 'italic', color: c.accent, margin: '12px 0 0' }}>{formatShortDate(config.deadline)}</p>
                <p style={{ fontSize: 17, lineHeight: 1.6, color: c.mutedFaint, margin: '14px 0 0' }}>
                  Le solicitamos amablemente confirmar su asistencia antes de la fecha indicada. En caso de no recibir respuesta, sus lugares serán cedidos a otras personas.
                </p>
              </>
            )}
          </div>
        </section>
      )}

      {config?.itinerary && config.itinerary.length > 0 && (
        <Itinerario items={config.itinerary} />
      )}

      {config?.venueName && (
        <Ubicacion config={config} />
      )}

      {config?.galleryImages && config.galleryImages.length > 0 && (
        <Galeria images={config.galleryImages} />
      )}

      {config?.dressCode && (
        <Vestimenta config={config} />
      )}

      {config?.giftMessage && (
        <section style={{ maxWidth: 640, margin: '0 auto', padding: 'clamp(64px,12vw,100px) clamp(20px,5vw,28px)', textAlign: 'center' }}>
          <div className="font-label" style={{ fontSize: 12, color: c.goldLabel }}>Con todo cariño</div>
          <h2 style={{ margin: '12px 0 0', fontWeight: 400, fontSize: 'clamp(30px,5vw,44px)', color: c.heading }}>Tu compañía es nuestro regalo</h2>
          <p style={{ fontSize: 20, lineHeight: 1.7, fontWeight: 300, color: c.textBody, margin: '24px auto 0', maxWidth: 540 }}>{config.giftMessage}</p>
        </section>
      )}

      {isPersonalized && invitation && !deadlinePassed && !isResponded && (
        <RSVPSection invitation={invitation} deadline={config?.deadline || null} />
      )}

      {isPersonalized && invitation && isResponded && (
        <section style={{ background: c.bgAlt, padding: 'clamp(64px,12vw,100px) clamp(20px,5vw,28px)' }}>
          <div style={{ maxWidth: 600, margin: '0 auto', background: c.accent, color: c.footerText, padding: '54px 32px', textAlign: 'center' }}>
            {invitation.status === 'ACCEPTED' ? (
              <>
                <div style={{ fontSize: 'clamp(28px,5vw,38px)', fontStyle: 'italic', fontWeight: 300 }}>¡Gracias por confirmar!</div>
                <p style={{ fontSize: 19, color: '#ecd9cb', fontWeight: 300, margin: '18px 0 0', lineHeight: 1.6 }}>
                  Estamos muy felices de contar con su presencia. ¡Hasta pronto!
                </p>
              </>
            ) : (
              <>
                <div style={{ fontSize: 'clamp(28px,5vw,38px)', fontStyle: 'italic', fontWeight: 300 }}>Gracias por responder</div>
                <p style={{ fontSize: 19, color: '#ecd9cb', fontWeight: 300, margin: '18px 0 0', lineHeight: 1.6 }}>
                  Lamentamos que no puedan acompañarnos. Los tendremos en nuestros corazones.
                </p>
              </>
            )}
          </div>
        </section>
      )}

      {isPersonalized && hasChild && config?.noticeText && (
        <section style={{ maxWidth: 680, margin: '0 auto', padding: 'clamp(64px,12vw,96px) clamp(20px,5vw,28px)' }}>
          <div style={{ border: `1px solid ${c.border}`, borderTop: `3px solid ${c.gold}`, background: '#fffdfb', padding: 'clamp(28px,5vw,46px)', textAlign: 'center' }}>
            <div className="font-label" style={{ fontSize: 14, color: c.gold }}>Aviso importante</div>
            <h3 style={{ margin: '14px 0 22px', fontWeight: 400, fontSize: 'clamp(24px,4vw,32px)', color: c.heading }}>{config.noticeTitle || 'Cuidado del recinto'}</h3>
            <p style={{ fontSize: 19, lineHeight: 1.7, fontWeight: 300, color: c.textBody, margin: 0, textAlign: 'justify' }}>{config.noticeText}</p>
          </div>
        </section>
      )}

      <Footer eventDate={eventDate} />
    </div>
  )
}

function Portada({ eventDate, config }: { eventDate: string; config: Config | null }) {
  return (
    <section
      style={{
        position: 'relative',
        minHeight: '100vh',
        background: c.bgAlt,
        color: c.text,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: 'clamp(72px,16vw,96px) clamp(28px,7vw,56px)',
        overflow: 'hidden',
      }}
    >
      <CornerFrames color={c.gold} />

      <div style={{ position: 'relative' }}>
        <div className="font-label" style={{ fontSize: 'clamp(15px,4vw,24px)', color: '#b08d4f', marginBottom: 'clamp(24px,5vw,34px)' }}>
          Nos casamos
        </div>

        {config?.monogramImageUrl && (
          <img
            src={config.monogramImageUrl}
            alt="Sello"
            style={{ width: 'clamp(170px,46vw,239px)', height: 'auto', objectFit: 'contain', display: 'block', margin: '0 auto' }}
          />
        )}

        <h1 style={{ margin: '30px 0 0', fontWeight: 400, fontSize: 'clamp(44px,9vw,78px)', lineHeight: 1.04, letterSpacing: '0.04em', color: c.heading, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
          <span>Esmeralda</span>
          <span style={{ color: c.gold, fontSize: '0.62em', fontStyle: 'italic', lineHeight: 1, margin: '2px 0' }}>&amp;</span>
          <span>Noe</span>
        </h1>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'clamp(10px,3vw,18px)', marginTop: 28, color: c.labelDim }}>
          <span style={{ width: 'clamp(28px,8vw,46px)', height: 1, background: c.goldSoft, flex: 'none' }} />
          <span className="font-label" style={{ fontFamily: TIMES, fontSize: 'clamp(15px,4.4vw,19px)', whiteSpace: 'nowrap' }}>{formatShortDate(eventDate)}</span>
          <span style={{ width: 'clamp(28px,8vw,46px)', height: 1, background: c.goldSoft, flex: 'none' }} />
        </div>

        {config?.venueName && (
          <p style={{ margin: '18px 0 0', fontSize: 19, fontStyle: 'italic', color: c.muted, fontWeight: 300 }}>
            {config.venueName}{config.venueAddress ? ` · ${config.venueAddress}` : ''}
          </p>
        )}

        {(config?.receptionTime || config?.ceremonyTime) && (
          <p className="font-label" style={{ margin: '10px 0 0', fontSize: 11, color: '#a89683' }}>
            Recepción {config?.receptionTime} h · Ceremonia {config?.ceremonyTime} h
          </p>
        )}
      </div>

      <div style={{ position: 'absolute', bottom: 23, left: '50%', transform: 'translateX(-50%)' }}>
        <div className="invite-bob" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
          <span className="font-label" style={{ fontSize: 10, color: '#b3a08c' }}>Desliza</span>
          <span style={{ width: 1, height: 34, background: `linear-gradient(${c.gold}, transparent)` }} />
        </div>
      </div>
    </section>
  )
}

function Countdown({ eventDate, ceremonyTime }: { eventDate: string; ceremonyTime: string }) {
  // Computed eagerly (not deferred to an effect) so the real countdown shows
  // immediately with no "--" placeholder flash. Server and client render at
  // slightly different instants, so the digits can differ by a second —
  // each value carries suppressHydrationWarning to silence that harmless
  // mismatch instead of hiding real numbers behind a loading state.
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    // Browsers throttle setInterval in a backgrounded/inactive tab (down to
    // ~once/minute after a few minutes hidden) — that's what made this look
    // "stuck" on a phone with the screen locked or the tab switched away.
    // The 1s interval keeps ticking normally while visible; resyncing to the
    // real clock on visibilitychange/focus snaps it back instantly instead
    // of waiting out the throttled delay once the user looks again.
    const tick = () => setNow(Date.now())
    const t = setInterval(tick, 1000)
    document.addEventListener('visibilitychange', tick)
    window.addEventListener('focus', tick)
    return () => {
      clearInterval(t)
      document.removeEventListener('visibilitychange', tick)
      window.removeEventListener('focus', tick)
    }
  }, [])

  const target = new Date(`${eventDate}T${ceremonyTime}:00`).getTime()
  const diff = Math.max(0, target - now)
  const sec = Math.floor(diff / 1000)
  const days = Math.floor(sec / 86400)
  const hours = Math.floor((sec % 86400) / 3600)
  const mins = Math.floor((sec % 3600) / 60)
  const secs = sec % 60
  const pad = (n: number) => String(n).padStart(2, '0')

  const cells = [
    { label: 'Días', value: String(days) },
    { label: 'Horas', value: pad(hours) },
    { label: 'Minutos', value: pad(mins) },
    { label: 'Segundos', value: pad(secs) },
  ]

  return (
    <section style={{ maxWidth: 760, margin: '0 auto', padding: 'clamp(64px,12vw,96px) clamp(20px,5vw,28px)' }}>
      <div style={{ textAlign: 'center', marginBottom: 48 }}>
        <div className="font-label" style={{ fontSize: 12, color: c.goldLabel }}>Faltan</div>
        <h2 style={{ margin: '12px 0 0', fontWeight: 400, fontSize: 'clamp(30px,5vw,44px)', color: c.heading }}>para el gran día</h2>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 'clamp(12px,3vw,26px)' }}>
        {cells.map(u => (
          <div key={u.label} style={{ flex: '1 1 0', minWidth: 120, maxWidth: 160, background: '#fff', color: c.accent, padding: '30px 14px', textAlign: 'center', border: `1px solid ${c.borderSoft}`, boxShadow: '0 10px 28px rgba(150,120,80,0.08)' }}>
            <div suppressHydrationWarning style={{ fontFamily: TIMES, fontWeight: 300, fontSize: 'clamp(40px,8vw,64px)', lineHeight: 1 }}>{u.value}</div>
            <div className="font-label" style={{ fontFamily: TIMES, fontSize: 11, color: c.goldLabel, marginTop: 14 }}>{u.label}</div>
          </div>
        ))}
      </div>
    </section>
  )
}

function Padres({ config }: { config: Config }) {
  return (
    <section style={{ maxWidth: 760, margin: '0 auto', padding: 'clamp(64px,12vw,100px) clamp(20px,5vw,28px)' }}>
      <div style={{ textAlign: 'center', marginBottom: 54 }}>
        <div className="font-label" style={{ fontSize: 12, color: c.goldLabel }}>Con la bendición de</div>
        <h2 style={{ margin: '12px 0 0', fontWeight: 400, fontSize: 'clamp(30px,5vw,44px)', color: c.heading }}>Nuestros padres</h2>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 'clamp(36px,7vw,80px)', textAlign: 'center' }}>
        <div style={{ flex: '1 1 240px', maxWidth: 320 }}>
          <div className="font-label" style={{ fontSize: 12, color: c.labelDim }}>Padres de la novia</div>
          <div style={{ width: 36, height: 1, background: c.goldSoft, margin: '18px auto 22px' }} />
          <p style={{ margin: 0, fontSize: 23, lineHeight: 1.7, color: '#5f4a40' }}>
            {config.brideFatherName}<br />{config.brideMotherName}
          </p>
        </div>
        <div style={{ flex: '1 1 240px', maxWidth: 320 }}>
          <div className="font-label" style={{ fontSize: 12, color: c.labelDim }}>Padres del novio</div>
          <div style={{ width: 36, height: 1, background: c.goldSoft, margin: '18px auto 22px' }} />
          <p style={{ margin: 0, fontSize: 23, lineHeight: 1.7, color: '#5f4a40' }}>
            {config.groomFatherName}<br />{config.groomMotherName}
          </p>
        </div>
      </div>
    </section>
  )
}

function Invitados({ invitation }: { invitation: InvitationData }) {
  return (
    <section style={{ background: c.bgAlt, color: c.text, padding: 'clamp(64px,12vw,100px) clamp(20px,5vw,28px)' }}>
      <div style={{ maxWidth: 640, margin: '0 auto', textAlign: 'center' }}>
        <div className="font-label" style={{ fontSize: 12, color: c.goldLabel }}>Con especial cariño invitamos a</div>
        <h2 style={{ margin: '16px 0 6px', fontWeight: 400, fontSize: 'clamp(32px,6vw,52px)', fontStyle: 'italic', color: c.accent }}>
          {invitation.titularName}
        </h2>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14, margin: '26px 0 44px' }}>
          <span style={{ width: 50, height: 1, background: '#cdb091' }} />
          <span style={{ width: 6, height: 6, background: c.goldLabel, transform: 'rotate(45deg)' }} />
          <span style={{ width: 50, height: 1, background: '#cdb091' }} />
        </div>
        {invitation.persons.length > 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {invitation.persons.map(p => (
              <div key={p.id} style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 16, padding: '15px 0', borderBottom: `1px solid ${c.borderFaint}` }}>
                <span style={{ fontSize: 'clamp(22px,4vw,28px)', fontWeight: 400, color: c.text }}>{p.name}</span>
                {p.isChild && (
                  <span className="font-label" style={{ fontSize: 11, color: c.labelDim }}>Menor de 8 años</span>
                )}
              </div>
            ))}
          </div>
        )}
        <p style={{ margin: '34px 0 0', fontSize: 18, fontStyle: 'italic', color: c.mutedSoft, fontWeight: 300 }}>
          Esta invitación es personal e intransferible.
        </p>
      </div>
    </section>
  )
}

function Itinerario({ items }: { items: ItineraryItem[] }) {
  return (
    <section style={{ maxWidth: 620, margin: '0 auto', padding: 'clamp(64px,12vw,100px) clamp(20px,5vw,28px)' }}>
      <div style={{ textAlign: 'center', marginBottom: 54 }}>
        <div className="font-label" style={{ fontSize: 12, color: c.goldLabel }}>El día</div>
        <h2 style={{ margin: '12px 0 0', fontWeight: 400, fontSize: 'clamp(30px,5vw,44px)', color: c.heading }}>Itinerario</h2>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {items.map((it, i) => (
          <div key={i} style={{ display: 'flex', gap: 24, alignItems: 'flex-start', padding: '20px 0', borderBottom: '1px solid #ece0d7' }}>
            <div style={{ flex: '0 0 84px', textAlign: 'right', fontWeight: 500, fontSize: 21, color: c.accent, paddingTop: 2 }}>{it.time}</div>
            <div style={{ flex: '0 0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', alignSelf: 'stretch' }}>
              <span style={{ width: 9, height: 9, borderRadius: '50%', background: c.goldLabel, marginTop: 7 }} />
              {i < items.length - 1 && <span style={{ flex: 1, width: 1, background: '#e3d3c6', marginTop: 4 }} />}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 23, color: '#5f4a40' }}>{it.event}</div>
              {it.note && <div className="font-label" style={{ fontSize: 13, color: c.mutedFaint, marginTop: 3, letterSpacing: '0.02em', textTransform: 'none' }}>{it.note}</div>}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

function Ubicacion({ config }: { config: Config }) {
  // Coordinates drop an exact pin; a plain text query only does a fuzzy
  // place search that can miss the actual venue, so prefer lat/lng when set.
  const mapQuery = config.venueLat && config.venueLng
    ? `${config.venueLat},${config.venueLng}`
    : encodeURIComponent(config.venueAddress || config.venueName)
  return (
    <section style={{ background: c.bgAlt, padding: 'clamp(64px,12vw,100px) clamp(20px,5vw,28px)' }}>
      <div style={{ maxWidth: 760, margin: '0 auto', textAlign: 'center' }}>
        <div className="font-label" style={{ fontSize: 12, color: c.goldLabel }}>Ubicación</div>
        <h2 style={{ margin: '12px 0 4px', fontWeight: 400, fontSize: 'clamp(32px,6vw,50px)', color: c.heading }}>La ceremonia</h2>
        <p style={{ fontSize: 21, color: c.accent, margin: '18px 0 4px', fontStyle: 'italic' }}>{config.venueName}</p>
        {config.venueAddress && (
          <p className="font-label" style={{ fontSize: 14, color: c.mutedFaint, margin: '0 0 36px', letterSpacing: '0.04em', textTransform: 'none' }}>{config.venueAddress}</p>
        )}

        <div style={{ position: 'relative', height: 340, border: `1px solid #e3d2c2`, overflow: 'hidden' }}>
          <iframe
            title="Mapa"
            src={`https://maps.google.com/maps?q=${mapQuery}&z=16&output=embed`}
            width="100%"
            height="100%"
            style={{ border: 0, display: 'block', filter: 'saturate(0.9)' }}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>

        {config.venueMapUrl && (
          <a
            href={config.venueMapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-label"
            style={{ display: 'inline-block', marginTop: 32, fontSize: 12, color: c.accent, textDecoration: 'none', border: `1px solid ${c.gold}`, padding: '16px 38px' }}
          >
            Cómo llegar
          </a>
        )}
      </div>
    </section>
  )
}

function Galeria({ images }: { images: string[] }) {
  return (
    <section style={{ maxWidth: 920, margin: '0 auto', padding: 'clamp(64px,12vw,100px) clamp(20px,5vw,28px)' }}>
      <div style={{ textAlign: 'center', marginBottom: 50 }}>
        <div className="font-label" style={{ fontSize: 12, color: c.goldLabel }}>Recuerdos</div>
        <h2 style={{ margin: '12px 0 0', fontWeight: 400, fontSize: 'clamp(30px,5vw,44px)', color: c.heading }}>Nuestra historia</h2>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px,1fr))', gap: 14 }}>
        {images.map((url, i) => (
          <div key={i} style={{ aspectRatio: '3/4', width: '100%', marginTop: i % 2 === 1 ? 34 : 0, overflow: 'hidden' }}>
            <img src={url} alt="" loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          </div>
        ))}
      </div>
    </section>
  )
}

function Vestimenta({ config }: { config: Config }) {
  return (
    <section style={{ background: c.bgAlt, color: c.text, padding: 'clamp(64px,12vw,100px) clamp(20px,5vw,28px)' }}>
      <div style={{ maxWidth: 620, margin: '0 auto', textAlign: 'center' }}>
        <div className="font-label" style={{ fontSize: 12, color: c.goldLabel }}>Código de vestimenta</div>
        <h2 style={{ margin: '14px 0 0', fontWeight: 300, fontSize: 'clamp(38px,7vw,60px)', fontStyle: 'italic', color: c.accent }}>{config.dressCode}</h2>
        {config.dressCodeDetail && (
          <p style={{ fontSize: 21, lineHeight: 1.6, fontWeight: 300, color: c.textBody, margin: '26px 0 0' }}>{config.dressCodeDetail}</p>
        )}

        {config.prohibitedColors.length > 0 && (
          <>
            <div style={{ marginTop: 44, display: 'flex', justifyContent: 'center', gap: 'clamp(28px,8vw,48px)', flexWrap: 'wrap' }}>
              {config.prohibitedColors.map((pc, i) => {
                const isLight = isLightColor(pc.hex)
                return (
                  <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
                    <div style={{ position: 'relative', width: 92, height: 92, borderRadius: '50%', background: pc.hex, border: '1px solid #e0d3c4', overflow: 'hidden' }}>
                      <span style={{ position: 'absolute', top: '50%', left: '-6%', width: '112%', height: 2, background: isLight ? c.accent : '#f3d9d0', transform: 'rotate(-45deg)', transformOrigin: 'center' }} />
                    </div>
                    <div className="font-label" style={{ fontSize: 11, color: c.mutedSoft }}>{pc.name}</div>
                  </div>
                )
              })}
            </div>
            <p className="font-label" style={{ fontSize: 12, color: c.accent, marginTop: 26 }}>Colores reservados · por favor evitarlos</p>
          </>
        )}
      </div>
    </section>
  )
}

function Footer({ eventDate }: { eventDate: string }) {
  return (
    <footer style={{ position: 'relative', background: c.accent, color: c.footerText, textAlign: 'center', padding: 'clamp(64px,14vw,84px) clamp(36px,8vw,40px) clamp(56px,12vw,68px)' }}>
      <CornerFrames color="#d6b682" />
      <div style={{ width: 9, height: 9, background: c.footerGold, transform: 'rotate(45deg)', margin: '0 auto 30px' }} />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14 }}>
        <span style={{ width: 40, height: 1, background: c.gold }} />
        <span className="font-label" style={{ fontFamily: TIMES, fontSize: 12, color: c.footerGold }}>{formatShortDate(eventDate)}</span>
        <span style={{ width: 40, height: 1, background: c.gold }} />
      </div>
      <p style={{ margin: '20px 0 0', fontSize: 20, fontStyle: 'italic' }}>Noe &amp; Esme</p>
      <p className="font-label" style={{ margin: '18px 0 0', fontSize: 11, color: '#d9c2b3', letterSpacing: '0.1em' }}>Les esperamos con todo nuestro amor.</p>
    </footer>
  )
}

function Divider() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, marginBottom: 40 }}>
      <span style={{ width: 60, height: 1, background: '#d8c39a' }} />
      <span style={{ width: 7, height: 7, background: c.goldLabel, transform: 'rotate(45deg)', display: 'inline-block' }} />
      <span style={{ width: 60, height: 1, background: '#d8c39a' }} />
    </div>
  )
}

function CornerFrames({ color }: { color: string }) {
  const base: React.CSSProperties = { position: 'absolute', width: 'clamp(34px,7vw,54px)', height: 'clamp(34px,7vw,54px)' }
  return (
    <>
      <span style={{ ...base, top: 'clamp(14px,3.5vw,24px)', left: 'clamp(14px,3.5vw,24px)', borderTop: `1.5px solid ${color}`, borderLeft: `1.5px solid ${color}` }} />
      <span style={{ ...base, top: 'clamp(14px,3.5vw,24px)', right: 'clamp(14px,3.5vw,24px)', borderTop: `1.5px solid ${color}`, borderRight: `1.5px solid ${color}` }} />
      <span style={{ ...base, bottom: 'clamp(14px,3.5vw,24px)', left: 'clamp(14px,3.5vw,24px)', borderBottom: `1.5px solid ${color}`, borderLeft: `1.5px solid ${color}` }} />
      <span style={{ ...base, bottom: 'clamp(14px,3.5vw,24px)', right: 'clamp(14px,3.5vw,24px)', borderBottom: `1.5px solid ${color}`, borderRight: `1.5px solid ${color}` }} />
    </>
  )
}

function isLightColor(hex: string): boolean {
  const h = hex.replace('#', '')
  if (h.length !== 6) return true
  const r = parseInt(h.slice(0, 2), 16)
  const g = parseInt(h.slice(2, 4), 16)
  const b = parseInt(h.slice(4, 6), 16)
  return (r * 299 + g * 587 + b * 114) / 1000 > 150
}
