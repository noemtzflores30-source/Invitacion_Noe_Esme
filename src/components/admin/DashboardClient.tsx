'use client'

import { useState } from 'react'
import Link from 'next/link'
import { MAX_GUESTS } from '@/lib/utils'

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
  createdAt: string | Date
}

interface Stats {
  confirmedSlots: number
  pendingSlots: number
  available: number
  usedSlots: number
  accepted: number
  pending: number
  rejected: number
}

// Dashboard filter codes map to the person-level status they represent —
// an invitation belongs in a section if ANY of its people are in that
// status, not based on the invitation's own aggregate status.
const PERSON_STATUS_BY_FILTER: Record<'ACCEPTED' | 'PENDING' | 'REJECTED', string> = {
  ACCEPTED: 'CONFIRMED',
  PENDING: 'PENDING',
  REJECTED: 'REJECTED',
}

export default function DashboardClient({
  stats,
  invitations,
}: {
  stats: Stats
  invitations: Invitation[]
}) {
  const [filter, setFilter] = useState<'ALL' | 'ACCEPTED' | 'PENDING' | 'REJECTED'>('ALL')

  const personStatus = filter === 'ALL' ? null : PERSON_STATUS_BY_FILTER[filter]
  const filtered = personStatus === null
    ? invitations
    : invitations.filter(i => i.persons.some(p => p.status === personStatus))

  const pct = Math.min(100, (stats.usedSlots / MAX_GUESTS) * 100)

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-serif text-3xl" style={{ color: 'var(--brown-dark)' }}>Dashboard</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--brown-mid)' }}>
          Gestión de invitados — Boda Esmeralda &amp; Noe
        </p>
      </div>

      {/* Capacity bar */}
      <div className="bg-white rounded-2xl p-6 shadow-sm" style={{ border: '1px solid var(--border)' }}>
        <div className="flex justify-between items-end mb-3">
          <span className="text-sm font-medium" style={{ color: 'var(--brown-mid)' }}>
            Capacidad total ({MAX_GUESTS} lugares)
          </span>
          <span className="text-sm font-bold" style={{ color: 'var(--gold-dark)' }}>
            {stats.usedSlots} / {MAX_GUESTS} usados
          </span>
        </div>
        <div className="h-3 rounded-full overflow-hidden" style={{ background: 'var(--cream-dark)' }}>
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${pct}%`,
              background: pct > 90 ? '#dc2626' : pct > 75 ? '#d97706' : 'var(--gold)',
            }}
          />
        </div>
        <div className="flex flex-wrap gap-x-6 gap-y-1 mt-3 text-xs" style={{ color: 'var(--brown-mid)' }}>
          <span>✓ Confirmados: <strong>{stats.confirmedSlots}</strong></span>
          <span>⏳ Pendientes: <strong>{stats.pendingSlots}</strong></span>
          <span>○ Disponibles: <strong>{stats.available}</strong></span>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Aceptaron', value: stats.accepted, color: '#16a34a', bg: '#f0fdf4', status: 'ACCEPTED', icon: '✓' },
          { label: 'Pendientes', value: stats.pending, color: '#d97706', bg: '#fffbeb', status: 'PENDING', icon: '⏳' },
          { label: 'Rechazaron', value: stats.rejected, color: '#dc2626', bg: '#fef2f2', status: 'REJECTED', icon: '✗' },
        ].map(card => (
          <button
            key={card.status}
            onClick={() => setFilter(filter === card.status as typeof filter ? 'ALL' : card.status as typeof filter)}
            className="bg-white rounded-2xl p-6 text-left transition-all hover:shadow-md"
            style={{
              border: `1px solid ${filter === card.status ? card.color : 'var(--border)'}`,
              boxShadow: filter === card.status ? `0 0 0 2px ${card.color}20` : undefined,
            }}
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium mb-1" style={{ color: 'var(--brown-mid)' }}>{card.label}</p>
                <p className="text-4xl font-bold" style={{ color: card.color, fontFamily: "'Times New Roman', Times, serif" }}>{card.value}</p>
                <p className="text-xs mt-1" style={{ color: 'rgba(92,74,42,0.5)' }}>invitaciones</p>
              </div>
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-lg"
                style={{ background: card.bg, color: card.color }}
              >
                {card.icon}
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* List */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden" style={{ border: '1px solid var(--border)' }}>
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 sm:px-6 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
          <h2 className="font-semibold" style={{ color: 'var(--brown-dark)' }}>
            {filter === 'ALL' ? 'Todos los invitados' : filter === 'ACCEPTED' ? 'Aceptaron' : filter === 'PENDING' ? 'Pendientes' : 'Rechazaron'}
            <span className="ml-2 text-sm font-normal" style={{ color: 'var(--gold-dark)' }}>({filtered.length})</span>
          </h2>
          <Link
            href="/admin/guests/new"
            className="px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all hover:opacity-90"
            style={{ background: 'var(--gold-dark)' }}
          >
            + Nuevo invitado
          </Link>
        </div>

        <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-sm" style={{ color: 'var(--brown-mid)' }}>
              No hay invitados en esta categoría
            </div>
          ) : (
            filtered.map(inv => {
              const total = inv.persons.length
              // In a specific category, count and badge reflect only the
              // people who belong to it (e.g. under "Rechazaron", a 3-person
              // invite with 1 rejection shows "1/3 rechazaron", not the
              // invitation's overall status or its confirmed count).
              const matchCount = personStatus === null
                ? inv.persons.filter(p => p.status === 'CONFIRMED').length
                : inv.persons.filter(p => p.status === personStatus).length
              const label = filter === 'ACCEPTED' ? 'aceptaron'
                : filter === 'PENDING' ? 'pendientes'
                : filter === 'REJECTED' ? 'rechazaron'
                : 'personas'
              const detailsHref = personStatus === null
                ? `/admin/guests/${inv.id}`
                : `/admin/guests/${inv.id}?status=${personStatus}`
              return (
                <div key={inv.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 sm:px-6 py-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-4 min-w-0">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center font-serif text-lg shrink-0"
                      style={{ background: 'var(--cream-dark)', color: 'var(--gold-dark)' }}
                    >
                      {inv.titularName.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium truncate" style={{ color: 'var(--brown-dark)' }}>{inv.titularName}</p>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-0.5">
                        <span className="text-xs whitespace-nowrap" style={{ color: 'var(--brown-mid)' }}>
                          {matchCount}/{total} {label}
                        </span>
                        <span
                          className="text-xs px-2 py-0.5 rounded-full whitespace-nowrap"
                          style={{
                            background: inv.invitedBy === 'NOE' ? '#eff6ff' : '#fdf4ff',
                            color: inv.invitedBy === 'NOE' ? '#1d4ed8' : '#7e22ce',
                          }}
                        >
                          {inv.invitedBy === 'NOE' ? 'Noe' : 'Esme'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 pl-14 sm:pl-0">
                    <StatusBadge status={filter === 'ALL' ? inv.status : filter} />
                    <Link
                      href={detailsHref}
                      className="text-xs px-3 py-1.5 rounded-lg transition-all hover:opacity-80 whitespace-nowrap"
                      style={{ background: 'var(--cream-dark)', color: 'var(--brown-mid)' }}
                    >
                      Detalles
                    </Link>
                    <Link
                      href={`/invite/${inv.id}`}
                      target="_blank"
                      className="text-xs px-3 py-1.5 rounded-lg transition-all hover:opacity-80 whitespace-nowrap"
                      style={{ background: 'var(--gold-light)', color: 'var(--brown-dark)' }}
                    >
                      Ver invitación ↗
                    </Link>
                  </div>
                </div>
              )
            })
          )}
        </div>
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
    <span
      className="text-xs px-2.5 py-1 rounded-full font-medium"
      style={{ background: s.bg, color: s.color }}
    >
      {s.label}
    </span>
  )
}
