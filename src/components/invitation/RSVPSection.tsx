'use client'

import { useState } from 'react'
import { formatShortDate, sortAdultsFirst } from '@/lib/utils'

const TIMES = "'Times New Roman', Times, serif"

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

const c = {
  bgAlt: '#f5ede4',
  text: '#5b4a44',
  heading: '#6e5249',
  accent: '#7d5a4f',
  accentHover: '#6e4b3f',
  gold: '#bd9a5f',
  goldLabel: '#bfa06a',
  mutedFaint: '#a8917f',
  mutedSoft: '#b09a8c',
  border: '#ecdccb',
  borderSoft: '#f0e4d9',
  footerText: '#f8efe7',
}

export default function RSVPSection({
  invitation,
  deadline,
  deadlineInvalidationMessage,
}: {
  invitation: InvitationData
  deadline: string | null
  deadlineInvalidationMessage?: string
}) {
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [allChecked, setAllChecked] = useState(false)
  const [message, setMessage] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const persons = sortAdultsFirst(invitation.persons)
  const multiPerson = persons.length > 1

  function togglePerson(id: string) {
    setAllChecked(false)
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleAll() {
    const next = !allChecked
    setAllChecked(next)
    setSelected(next ? new Set(persons.map(p => p.id)) : new Set())
  }

  async function handleSubmit() {
    setLoading(true)
    setError('')

    const res = await fetch(`/api/invitations/${invitation.id}/rsvp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ confirmedPersonIds: Array.from(selected), message }),
    })

    if (res.ok) {
      setSubmitted(true)
    } else {
      const data = await res.json()
      setError(data.error || 'Error al enviar respuesta')
    }
    setLoading(false)
  }

  if (submitted) {
    return (
      <section style={{ background: c.bgAlt, padding: 'clamp(64px,12vw,100px) clamp(20px,5vw,28px)' }}>
        <div style={{ maxWidth: 600, margin: '0 auto', background: c.accent, color: c.footerText, padding: '54px 32px', textAlign: 'center' }}>
          <div style={{ fontSize: 'clamp(28px,5vw,38px)', fontStyle: 'italic', fontWeight: 300 }}>
            {selected.size > 0 ? '¡Gracias por confirmar!' : 'Gracias por responder'}
          </div>
          <p style={{ fontSize: 19, color: '#ecd9cb', fontWeight: 300, margin: '18px 0 0', lineHeight: 1.6 }}>
            {selected.size > 0
              ? 'Nos llena de alegría saber que nos acompañarán. ¡Nos vemos pronto!'
              : 'Agradecemos profundamente su respuesta. Les extrañaremos en este día tan importante para nosotros.'}
          </p>
        </div>
      </section>
    )
  }

  return (
    <section style={{ background: c.bgAlt, padding: 'clamp(70px,13vw,110px) clamp(20px,5vw,28px)' }}>
      <div style={{ maxWidth: 620, margin: '0 auto' }}>
        {/* Predominant heading — this is the single most important action in
            the whole invitation, so it gets the strongest visual treatment
            in the page: the biggest heading size, immediately followed by
            the deadline reminder (moved here from its own section) so the
            "when" sits right next to the "what" instead of being repeated
            further down the page. */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 18 }}>
            <span style={{ width: 30, height: 1, background: c.gold }} />
            <span style={{ width: 7, height: 7, background: c.gold, transform: 'rotate(45deg)' }} />
            <span style={{ width: 30, height: 1, background: c.gold }} />
          </div>
          <h2 style={{ margin: 0, fontWeight: 600, fontSize: 'clamp(38px,7.5vw,62px)', color: c.accent, letterSpacing: '0.01em' }}>
            Confirmar asistencia
          </h2>

          {deadline && (
            <div style={{ marginTop: 30, textAlign: 'center' }}>
              <div className="font-label" style={{ fontSize: 13, color: c.goldLabel, fontWeight: 700 }}>
                Confirmar asistencia antes de la siguiente fecha
              </div>
              <p style={{ fontFamily: TIMES, fontSize: 'clamp(30px,5.5vw,42px)', fontStyle: 'italic', color: c.accent, margin: '14px 0 0' }}>
                {formatShortDate(deadline)}
              </p>
              <p style={{ fontSize: 18, lineHeight: 1.6, color: c.mutedFaint, margin: '16px 0 0' }}>
                Le solicitamos amablemente confirmar su asistencia antes de la fecha indicada.
              </p>
              {deadlineInvalidationMessage && (
                <p style={{ fontSize: 17, fontWeight: 700, lineHeight: 1.6, color: c.accent, margin: '18px auto 0', maxWidth: 480 }}>
                  ⚠ {deadlineInvalidationMessage}
                </p>
              )}
            </div>
          )}
        </div>

        <div style={{ background: '#fffdfb', border: `1px solid ${c.gold}`, borderTop: `5px solid ${c.accent}`, padding: 'clamp(26px,5vw,44px)', boxShadow: '0 18px 40px rgba(125,90,79,0.1)' }}>
          <div className="font-label" style={{ fontSize: 20, color: c.mutedFaint, marginBottom: 6, fontWeight: 600 }}>
            {multiPerson ? '¿Quién nos acompañará?' : `¿${invitation.titularName} asistirá?`}
          </div>
          {multiPerson && (
            <>
              <p style={{ fontSize: 16, fontStyle: 'italic', color: c.mutedSoft, margin: '0 0 18px' }}>
                Seleccione a cada integrante que asistirá.
              </p>
              <button
                onClick={toggleAll}
                className="font-label"
                style={{ background: 'transparent', border: 'none', padding: '0 0 18px', fontSize: 11, color: c.accent, cursor: 'pointer', letterSpacing: '0.2em' }}
              >
                {allChecked ? '✓ Todos asistirán' : 'Marcar que todos asistirán'}
              </button>
            </>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 14 }}>
            {persons.map(p => {
              const isSelected = selected.has(p.id)
              return (
                <button
                  key={p.id}
                  onClick={() => togglePerson(p.id)}
                  aria-pressed={isSelected}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 16,
                    width: '100%',
                    textAlign: 'left',
                    background: isSelected ? 'rgba(125,90,79,0.05)' : 'transparent',
                    border: 'none',
                    borderBottom: `1px solid ${c.borderSoft}`,
                    padding: '16px 12px',
                    cursor: 'pointer',
                    transition: 'background 0.2s ease',
                  }}
                >
                  {isSelected ? (
                    <span style={{ flex: '0 0 26px', width: 26, height: 26, borderRadius: '50%', border: `1px solid ${c.accent}`, background: c.accent, color: c.footerText, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>✓</span>
                  ) : (
                    <span style={{ flex: '0 0 26px', width: 26, height: 26, borderRadius: '50%', border: '1px solid #d4c0b0', background: '#fff' }} />
                  )}
                  <span
                    style={{
                      flex: 1,
                      fontSize: 23,
                      color: c.text,
                      opacity: isSelected ? 1 : 0.4,
                      filter: isSelected ? 'none' : 'grayscale(0.5)',
                      transition: 'opacity 0.2s ease, filter 0.2s ease',
                    }}
                  >
                    {p.name}
                  </span>
                </button>
              )
            })}
          </div>

          <p style={{ fontSize: 15, fontStyle: 'italic', color: c.mutedSoft, margin: '0 0 30px', lineHeight: 1.5 }}>
            Si no selecciona a ningún integrante, entenderemos con cariño que no podrán acompañarnos.
          </p>

          <label className="font-label" style={{ display: 'block', fontSize: 11, color: c.mutedFaint, marginBottom: 10 }}>
            Mensaje para los novios (opcional)
          </label>
          <textarea
            value={message}
            onChange={e => setMessage(e.target.value)}
            rows={3}
            placeholder="Escriba unas líneas..."
            style={{ width: '100%', fontFamily: "'Cormorant Garamond', serif", fontSize: 19, color: c.text, border: `1px solid ${c.border}`, background: '#fffdfb', padding: 12, outline: 'none', resize: 'vertical', marginBottom: 34, boxSizing: 'border-box' }}
          />

          {error && (
            <div style={{ padding: 12, marginBottom: 20, fontSize: 14, background: '#fdf2f0', color: '#b3543f' }}>{error}</div>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="font-label"
            style={{ width: '100%', background: c.accent, color: c.footerText, border: 'none', fontSize: 15, fontWeight: 700, padding: 22, cursor: loading ? 'default' : 'pointer', opacity: loading ? 0.7 : 1, letterSpacing: '0.18em' }}
            onMouseEnter={e => { if (!loading) e.currentTarget.style.background = c.accentHover }}
            onMouseLeave={e => { e.currentTarget.style.background = c.accent }}
          >
            {loading ? 'Enviando...' : 'Confirmar asistencia'}
          </button>
        </div>
      </div>
    </section>
  )
}
