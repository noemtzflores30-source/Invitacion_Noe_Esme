'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface TableAssignment {
  table: { tableNumber: number; name?: string | null }
}

interface Person {
  id: string
  name: string
  isChild: boolean
  status: string
  rejectionReason?: string | null
  tableAssignment?: TableAssignment | null
}

interface Invitation {
  id: string
  titularName: string
  invitedBy: string
  status: string
  deadlineType: string
  notes?: string | null
  guestMessage?: string | null
  persons: Person[]
}

const STATUS_FILTER_LABEL: Record<string, string> = {
  CONFIRMED: 'aceptaron',
  PENDING: 'están pendientes',
  REJECTED: 'rechazaron',
}

export default function GuestDetailClient({
  invitation,
  availableSlots,
  statusFilter,
}: {
  invitation: Invitation
  availableSlots: number
  statusFilter?: string
}) {
  const router = useRouter()
  const [titularName, setTitularName] = useState(invitation.titularName)
  const [invitedBy, setInvitedBy] = useState(invitation.invitedBy)
  const [deadlineType, setDeadlineType] = useState(invitation.deadlineType)
  const [notes, setNotes] = useState(invitation.notes || '')
  const [invStatus, setInvStatus] = useState(invitation.status)
  const [initialStatus] = useState(invitation.status)
  const [persons, setPersons] = useState(invitation.persons.map(p => ({ ...p })))
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [deleting, setDeleting] = useState(false)

  function updatePersonStatus(id: string, status: string) {
    setPersons(prev => prev.map(p => p.id === id ? { ...p, status } : p))
  }

  async function handleSave() {
    setLoading(true)
    setError('')
    setSuccess('')

    const res = await fetch(`/api/guests/${invitation.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        titularName,
        invitedBy,
        deadlineType,
        notes,
        // Only send an explicit status override when the admin actually
        // touched the "Estado general" select. Otherwise the server
        // recomputes it from the person statuses below — sending the
        // untouched (stale) value here would clobber that recomputation.
        status: invStatus !== initialStatus ? invStatus : undefined,
        persons: persons.map(p => ({
          id: p.id,
          status: p.status,
          name: p.name,
          isChild: p.isChild,
        })),
      }),
    })

    if (res.ok) {
      const data = await res.json()
      setInvStatus(data.status)
      setSuccess('Guardado correctamente')
      router.refresh()
    } else {
      const data = await res.json()
      setError(data.error || 'Error al guardar')
    }
    setLoading(false)
  }

  async function handleDelete() {
    if (!confirm('¿Eliminar esta invitación permanentemente?')) return
    setDeleting(true)
    await fetch(`/api/guests/${invitation.id}`, { method: 'DELETE' })
    router.push('/admin/guests')
  }

  const confirmed = persons.filter(p => p.status === 'CONFIRMED').length
  const total = persons.length

  const isValidFilter = statusFilter === 'CONFIRMED' || statusFilter === 'PENDING' || statusFilter === 'REJECTED'
  const displayedPersons = isValidFilter ? persons.filter(p => p.status === statusFilter) : persons

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <button
            onClick={() => router.back()}
            className="text-sm hover:opacity-70 transition-opacity"
            style={{ color: 'var(--gold-dark)', background: 'transparent', border: 'none', padding: 0, cursor: 'pointer' }}
          >
            ← Volver
          </button>
          <h1 className="font-serif text-3xl mt-2" style={{ color: 'var(--brown-dark)' }}>
            {invitation.titularName}
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--brown-mid)' }}>
            {isValidFilter
              ? `${displayedPersons.length}/${total} personas ${STATUS_FILTER_LABEL[statusFilter!]}`
              : `${confirmed}/${total} personas confirmadas`}
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/invite/${invitation.id}`}
            target="_blank"
            className="px-4 py-2 rounded-lg text-sm font-medium hover:opacity-80 transition-all"
            style={{ background: 'var(--gold-light)', color: 'var(--brown-dark)' }}
          >
            Ver invitación ↗
          </Link>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white rounded-2xl p-6 space-y-5" style={{ border: '1px solid var(--border)' }}>
        <h2 className="font-semibold" style={{ color: 'var(--brown-dark)' }}>Datos generales</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--brown-mid)' }}>Titular</label>
            <input
              value={titularName}
              onChange={e => setTitularName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg text-sm outline-none"
              style={{ background: 'var(--cream)', border: '1px solid var(--gold-light)', color: 'var(--brown-dark)' }}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--brown-mid)' }}>Estado general</label>
            <select
              value={invStatus}
              onChange={e => setInvStatus(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg text-sm outline-none"
              style={{ background: 'var(--cream)', border: '1px solid var(--gold-light)', color: 'var(--brown-dark)' }}
            >
              <option value="PENDING">Pendiente</option>
              <option value="ACCEPTED">Aceptado</option>
              <option value="REJECTED">Rechazado</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--brown-mid)' }}>Invitado por</label>
            <select
              value={invitedBy}
              onChange={e => setInvitedBy(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg text-sm outline-none"
              style={{ background: 'var(--cream)', border: '1px solid var(--gold-light)', color: 'var(--brown-dark)' }}
            >
              <option value="NOE">Noe</option>
              <option value="ESME">Esme</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--brown-mid)' }}>Tipo de fecha límite</label>
            <select
              value={deadlineType}
              onChange={e => setDeadlineType(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg text-sm outline-none"
              style={{ background: 'var(--cream)', border: '1px solid var(--gold-light)', color: 'var(--brown-dark)' }}
            >
              <option value="PRIMARY">Fecha principal</option>
              <option value="SECONDARY">Fecha secundaria</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--brown-mid)' }}>Notas</label>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            rows={2}
            className="w-full px-4 py-2.5 rounded-lg text-sm outline-none resize-none"
            style={{ background: 'var(--cream)', border: '1px solid var(--gold-light)', color: 'var(--brown-dark)' }}
          />
        </div>
      </div>

      {invitation.guestMessage && (
        <div className="bg-white rounded-2xl p-6" style={{ border: '1px solid var(--border)' }}>
          <h2 className="font-semibold mb-2" style={{ color: 'var(--brown-dark)' }}>Mensaje del invitado</h2>
          <p className="text-sm italic" style={{ color: 'var(--brown-mid)' }}>&ldquo;{invitation.guestMessage}&rdquo;</p>
        </div>
      )}

      {/* Persons */}
      <div className="bg-white rounded-2xl p-6 space-y-4" style={{ border: '1px solid var(--border)' }}>
        <div className="flex items-center justify-between">
          <h2 className="font-semibold" style={{ color: 'var(--brown-dark)' }}>Personas invitadas</h2>
          {isValidFilter && (
            <Link
              href={`/admin/guests/${invitation.id}`}
              className="text-xs hover:opacity-70 transition-opacity"
              style={{ color: 'var(--gold-dark)' }}
            >
              Ver todos ({total})
            </Link>
          )}
        </div>
        {isValidFilter && (
          <p className="text-xs -mt-2" style={{ color: 'var(--brown-mid)' }}>
            Mostrando solo quienes {STATUS_FILTER_LABEL[statusFilter!]}.
          </p>
        )}
        <div className="space-y-3">
          {displayedPersons.length === 0 && (
            <p className="text-sm text-center py-4" style={{ color: 'var(--brown-mid)' }}>
              Nadie en esta categoría.
            </p>
          )}
          {displayedPersons.map(p => (
            <div
              key={p.id}
              className="flex items-center justify-between p-4 rounded-xl"
              style={{ background: 'var(--cream)', border: '1px solid var(--gold-light)' }}
            >
              <div>
                <p className="font-medium text-sm" style={{ color: 'var(--brown-dark)' }}>
                  {p.name}
                  {p.isChild && (
                    <span className="ml-2 text-xs px-2 py-0.5 rounded-full" style={{ background: '#fef3c7', color: '#92400e' }}>
                      Menor
                    </span>
                  )}
                </p>
                {p.tableAssignment && (
                  <p className="text-xs mt-0.5" style={{ color: 'var(--brown-mid)' }}>
                    Mesa {p.tableAssignment.table.tableNumber}
                  </p>
                )}
              </div>
              <select
                value={p.status}
                onChange={e => updatePersonStatus(p.id, e.target.value)}
                className="px-3 py-1.5 rounded-lg text-xs outline-none"
                style={{ background: 'white', border: '1px solid var(--gold-light)', color: 'var(--brown-dark)' }}
              >
                <option value="PENDING">Pendiente</option>
                <option value="CONFIRMED">Confirmado</option>
                <option value="REJECTED">Rechazado</option>
              </select>
            </div>
          ))}
        </div>
      </div>

      {error && <div className="p-4 rounded-lg text-sm" style={{ background: '#fef2f2', color: '#dc2626' }}>{error}</div>}
      {success && <div className="p-4 rounded-lg text-sm" style={{ background: '#f0fdf4', color: '#16a34a' }}>{success}</div>}

      <div className="flex gap-3">
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="px-5 py-3 rounded-lg text-sm font-semibold transition-all hover:opacity-80 disabled:opacity-60"
          style={{ background: '#fef2f2', color: '#dc2626' }}
        >
          {deleting ? 'Eliminando...' : 'Eliminar'}
        </button>
        <div className="flex-1" />
        <button
          onClick={handleSave}
          disabled={loading}
          className="px-8 py-3 rounded-lg text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-60"
          style={{ background: 'var(--gold-dark)' }}
        >
          {loading ? 'Guardando...' : 'Guardar cambios'}
        </button>
      </div>
    </div>
  )
}
