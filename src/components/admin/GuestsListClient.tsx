'use client'

import { useState } from 'react'
import Link from 'next/link'

interface Person {
  id: string
  name: string
  isChild: boolean
  status: string
}

interface Invitation {
  id: string
  titularName: string
  invitedBy: string
  status: string
  persons: Person[]
}

// Filter codes map to the person-level status they represent — an
// invitation matches a status filter if ANY of its people are in that
// status, not based on the invitation's own aggregate status.
const PERSON_STATUS_BY_FILTER: Record<string, string> = {
  ACCEPTED: 'CONFIRMED',
  PENDING: 'PENDING',
  REJECTED: 'REJECTED',
}

export default function GuestsListClient({ invitations }: { invitations: Invitation[] }) {
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('ALL')
  const [filterInvitedBy, setFilterInvitedBy] = useState('ALL')

  const personStatus = PERSON_STATUS_BY_FILTER[filterStatus] || null

  const filtered = invitations.filter(inv => {
    const matchSearch = !search ||
      inv.titularName.toLowerCase().includes(search.toLowerCase()) ||
      inv.persons.some(p => p.name.toLowerCase().includes(search.toLowerCase()))
    const matchStatus = personStatus === null || inv.persons.some(p => p.status === personStatus)
    const matchInvitedBy = filterInvitedBy === 'ALL' || inv.invitedBy === filterInvitedBy
    return matchSearch && matchStatus && matchInvitedBy
  })

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-serif text-3xl" style={{ color: 'var(--brown-dark)' }}>Invitados</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--brown-mid)' }}>
            {invitations.length} invitaciones registradas
          </p>
        </div>
        <Link
          href="/admin/guests/new"
          className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white hover:opacity-90 transition-all"
          style={{ background: 'var(--gold-dark)' }}
        >
          + Nuevo invitado
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-4 flex flex-wrap gap-4" style={{ border: '1px solid var(--border)' }}>
        <input
          type="text"
          placeholder="Buscar por titular o persona..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 min-w-40 px-4 py-2 rounded-lg text-sm outline-none"
          style={{ background: 'var(--cream)', border: '1px solid var(--gold-light)', color: 'var(--brown-dark)' }}
        />
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          className="px-4 py-2 rounded-lg text-sm outline-none"
          style={{ background: 'var(--cream)', border: '1px solid var(--gold-light)', color: 'var(--brown-dark)' }}
        >
          <option value="ALL">Todos los estados</option>
          <option value="ACCEPTED">Aceptaron</option>
          <option value="PENDING">Pendientes</option>
          <option value="REJECTED">Rechazaron</option>
        </select>
        <select
          value={filterInvitedBy}
          onChange={e => setFilterInvitedBy(e.target.value)}
          className="px-4 py-2 rounded-lg text-sm outline-none"
          style={{ background: 'var(--cream)', border: '1px solid var(--gold-light)', color: 'var(--brown-dark)' }}
        >
          <option value="ALL">Todos los novios</option>
          <option value="NOE">Invitados de Noe</option>
          <option value="ESME">Invitados de Esme</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden" style={{ border: '1px solid var(--border)' }}>
        {filtered.length === 0 ? (
          <div className="py-12 text-center text-sm" style={{ color: 'var(--brown-mid)' }}>
            No se encontraron invitados
          </div>
        ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--cream)' }}>
                {['Titular', 'Personas', personStatus === null ? 'Confirmados' : 'Coinciden', 'Invitado por', 'Estado', 'Acciones'].map(h => (
                  <th key={h} className="text-left text-xs font-semibold uppercase tracking-wider px-6 py-3" style={{ color: 'var(--brown-mid)' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: 'var(--border)' }}>
              {filtered.map(inv => {
                  const total = inv.persons.length
                  const matchCount = personStatus === null
                    ? inv.persons.filter(p => p.status === 'CONFIRMED').length
                    : inv.persons.filter(p => p.status === personStatus).length
                  const editHref = personStatus === null
                    ? `/admin/guests/${inv.id}`
                    : `/admin/guests/${inv.id}?status=${personStatus}`
                  return (
                    <tr key={inv.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-medium text-sm whitespace-nowrap" style={{ color: 'var(--brown-dark)' }}>{inv.titularName}</p>
                      </td>
                      <td className="px-6 py-4 text-sm whitespace-nowrap" style={{ color: 'var(--brown-mid)' }}>{total}</td>
                      <td className="px-6 py-4 text-sm font-medium whitespace-nowrap" style={{ color: 'var(--brown-dark)' }}>
                        {matchCount}/{total}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className="text-xs px-2 py-0.5 rounded-full whitespace-nowrap"
                          style={{
                            background: inv.invitedBy === 'NOE' ? '#eff6ff' : '#fdf4ff',
                            color: inv.invitedBy === 'NOE' ? '#1d4ed8' : '#7e22ce',
                          }}
                        >
                          {inv.invitedBy === 'NOE' ? 'Noe' : 'Esme'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={personStatus === null ? inv.status : filterStatus} />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2 whitespace-nowrap">
                          <Link
                            href={editHref}
                            className="text-xs px-3 py-1.5 rounded-lg transition-all hover:opacity-80"
                            style={{ background: 'var(--cream-dark)', color: 'var(--brown-mid)' }}
                          >
                            Editar
                          </Link>
                          <Link
                            href={`/invite/${inv.id}`}
                            target="_blank"
                            className="text-xs px-3 py-1.5 rounded-lg transition-all hover:opacity-80"
                            style={{ background: 'var(--gold-light)', color: 'var(--brown-dark)' }}
                          >
                            Invitación ↗
                          </Link>
                        </div>
                      </td>
                    </tr>
                  )
              })}
            </tbody>
          </table>
        </div>
        )}
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; bg: string; color: string }> = {
    ACCEPTED: { label: 'Aceptó', bg: '#f0fdf4', color: '#16a34a' },
    PENDING: { label: 'Pendiente', bg: '#fffbeb', color: '#d97706' },
    REJECTED: { label: 'Rechazó', bg: '#fef2f2', color: '#dc2626' },
  }
  const s = map[status] || map.PENDING
  return (
    <span className="text-xs px-2.5 py-1 rounded-full font-medium" style={{ background: s.bg, color: s.color }}>
      {s.label}
    </span>
  )
}
