'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface PersonInput {
  name: string
  isChild: boolean
}

interface GuestFormProps {
  availableSlots: number
  initialData?: {
    id: string
    titularName: string
    invitedBy: string
    deadlineType: string
    notes?: string | null
    persons: Array<{ id: string; name: string; isChild: boolean; status: string }>
  }
}

function calcSlots(persons: PersonInput[]): number {
  const adults = persons.filter(p => !p.isChild).length
  const children = persons.filter(p => p.isChild).length
  return adults + Math.ceil(children / 2)
}

export default function GuestForm({ availableSlots, initialData }: GuestFormProps) {
  const router = useRouter()
  const isEdit = !!initialData

  const [titularName, setTitularName] = useState(initialData?.titularName || '')
  const [invitedBy, setInvitedBy] = useState(initialData?.invitedBy || 'NOE')
  const [deadlineType, setDeadlineType] = useState(initialData?.deadlineType || 'PRIMARY')
  const [notes, setNotes] = useState(initialData?.notes || '')
  const [persons, setPersons] = useState<PersonInput[]>(
    initialData?.persons.map(p => ({ name: p.name, isChild: p.isChild })) || [{ name: '', isChild: false }]
  )
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const slotsNeeded = calcSlots(persons.filter(p => p.name.trim()))
  const slotsOk = slotsNeeded <= availableSlots

  function addPerson() {
    const newSlots = calcSlots([...persons.filter(p => p.name.trim()), { name: 'x', isChild: false }])
    if (newSlots > availableSlots && !isEdit) {
      setError(`No puedes agregar más personas. Límite de ${availableSlots} lugares alcanzado.`)
      return
    }
    setError('')
    setPersons(prev => [...prev, { name: '', isChild: false }])
  }

  function removePerson(i: number) {
    setPersons(prev => prev.filter((_, idx) => idx !== i))
    setError('')
  }

  function updatePerson(i: number, field: keyof PersonInput, value: string | boolean) {
    setPersons(prev => prev.map((p, idx) => idx === i ? { ...p, [field]: value } : p))
    setError('')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const validPersons = persons.filter(p => p.name.trim())
    if (!validPersons.length) {
      setError('Agrega al menos una persona')
      return
    }
    if (!slotsOk && !isEdit) {
      setError(`Superas el límite de lugares disponibles (${availableSlots})`)
      return
    }

    setLoading(true)
    setError('')

    const url = isEdit ? `/api/guests/${initialData!.id}` : '/api/guests'
    const method = isEdit ? 'PUT' : 'POST'

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ titularName, invitedBy, deadlineType, notes, persons: validPersons }),
    })

    if (res.ok) {
      router.push('/admin/guests')
      router.refresh()
    } else {
      const data = await res.json()
      setError(data.error || 'Error al guardar')
    }
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white rounded-2xl p-6 space-y-5" style={{ border: '1px solid var(--border)' }}>
        <h2 className="font-semibold" style={{ color: 'var(--brown-dark)' }}>Información del titular</h2>

        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--brown-mid)' }}>
            Nombre del titular *
          </label>
          <input
            type="text"
            value={titularName}
            onChange={e => setTitularName(e.target.value)}
            required
            placeholder="Ej: Familia Martínez o Noe Martínez Flores"
            className="w-full px-4 py-3 rounded-lg text-sm outline-none"
            style={{ background: 'var(--cream)', border: '1px solid var(--gold-light)', color: 'var(--brown-dark)' }}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--brown-mid)' }}>
              Invitado por *
            </label>
            <select
              value={invitedBy}
              onChange={e => setInvitedBy(e.target.value)}
              className="w-full px-4 py-3 rounded-lg text-sm outline-none"
              style={{ background: 'var(--cream)', border: '1px solid var(--gold-light)', color: 'var(--brown-dark)' }}
            >
              <option value="NOE">Noe</option>
              <option value="ESME">Esme</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--brown-mid)' }}>
              Tipo de fecha límite
            </label>
            <select
              value={deadlineType}
              onChange={e => setDeadlineType(e.target.value)}
              className="w-full px-4 py-3 rounded-lg text-sm outline-none"
              style={{ background: 'var(--cream)', border: '1px solid var(--gold-light)', color: 'var(--brown-dark)' }}
            >
              <option value="PRIMARY">Fecha principal</option>
              <option value="SECONDARY">Fecha secundaria</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--brown-mid)' }}>
            Notas (opcional)
          </label>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            rows={2}
            className="w-full px-4 py-3 rounded-lg text-sm outline-none resize-none"
            style={{ background: 'var(--cream)', border: '1px solid var(--gold-light)', color: 'var(--brown-dark)' }}
          />
        </div>
      </div>

      {/* Persons */}
      <div className="bg-white rounded-2xl p-6 space-y-4" style={{ border: '1px solid var(--border)' }}>
        <div className="flex items-center justify-between">
          <h2 className="font-semibold" style={{ color: 'var(--brown-dark)' }}>
            Personas invitadas
          </h2>
          <div className="flex items-center gap-3">
            <span className="text-xs" style={{ color: slotsOk ? 'var(--gold-dark)' : '#dc2626' }}>
              {slotsNeeded} / {availableSlots} lugares
            </span>
          </div>
        </div>

        {!slotsOk && (
          <div className="p-3 rounded-lg text-xs" style={{ background: '#fef2f2', color: '#dc2626' }}>
            ⚠ Superas los {availableSlots} lugares disponibles. Recuerda: 2 niños = 1 lugar.
          </div>
        )}

        <div className="space-y-3">
          {persons.map((p, i) => (
            <div key={i} className="flex gap-3 items-center">
              <input
                type="text"
                value={p.name}
                onChange={e => updatePerson(i, 'name', e.target.value)}
                placeholder={`Nombre ${i + 1}`}
                className="flex-1 px-4 py-2.5 rounded-lg text-sm outline-none"
                style={{ background: 'var(--cream)', border: '1px solid var(--gold-light)', color: 'var(--brown-dark)' }}
              />
              <label className="flex items-center gap-2 text-sm cursor-pointer whitespace-nowrap" style={{ color: 'var(--brown-mid)' }}>
                <input
                  type="checkbox"
                  checked={p.isChild}
                  onChange={e => updatePerson(i, 'isChild', e.target.checked)}
                  className="w-4 h-4 rounded"
                  style={{ accentColor: 'var(--gold)' }}
                />
                Menor 8 años
              </label>
              {persons.length > 1 && (
                <button
                  type="button"
                  onClick={() => removePerson(i)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-sm hover:opacity-80 transition-opacity"
                  style={{ background: '#fef2f2', color: '#dc2626' }}
                >
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={addPerson}
          className="flex items-center gap-2 text-sm font-medium transition-all hover:opacity-80"
          style={{ color: 'var(--gold-dark)' }}
        >
          + Agregar persona
        </button>

        <div className="text-xs p-3 rounded-lg" style={{ background: 'var(--cream)', color: 'var(--brown-mid)' }}>
          💡 <strong>Regla de niños:</strong> 2 menores de 8 años cuentan como 1 lugar. 1 niño solo cuenta como 1 adulto.
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-lg text-sm" style={{ background: '#fef2f2', color: '#dc2626' }}>
          {error}
        </div>
      )}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex-1 py-3 rounded-lg text-sm font-semibold transition-all hover:opacity-80"
          style={{ background: 'var(--cream-dark)', color: 'var(--brown-mid)' }}
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading || (!isEdit && !slotsOk)}
          className="flex-1 py-3 rounded-lg text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-60"
          style={{ background: 'var(--gold-dark)' }}
        >
          {loading ? 'Guardando...' : isEdit ? 'Actualizar' : 'Crear invitación'}
        </button>
      </div>
    </form>
  )
}
