'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'

interface TableAssignment {
  id: string
  personId: string
  tableId: string
  seatNumber?: number | null
  person: { id: string; name: string; isChild: boolean }
  invitation: { id: string; titularName: string; invitedBy: string }
}

interface WeddingTable {
  id: string
  tableNumber: number
  name?: string | null
  assignments: TableAssignment[]
}

interface Person {
  id: string
  name: string
  isChild: boolean
  status: string
  invitationId: string
  invitation: { id: string; titularName: string; invitedBy: string }
  tableAssignment?: { table: { tableNumber: number } } | null
}

export default function TablesClient({
  tables,
  confirmedPersons,
}: {
  tables: WeddingTable[]
  confirmedPersons: Person[]
}) {
  const router = useRouter()
  const [, startTransition] = useTransition()
  const [selectedTable, setSelectedTable] = useState<WeddingTable | null>(null)
  const [searchPerson, setSearchPerson] = useState('')
  const [filterInvitedBy, setFilterInvitedBy] = useState('ALL')
  const [filterTableBy, setFilterTableBy] = useState('ALL')
  const [assigning, setAssigning] = useState(false)
  const [error, setError] = useState('')

  const unassigned = confirmedPersons.filter(p => !p.tableAssignment)

  const filteredUnassigned = unassigned.filter(p => {
    const matchSearch = !searchPerson ||
      p.name.toLowerCase().includes(searchPerson.toLowerCase()) ||
      p.invitation.titularName.toLowerCase().includes(searchPerson.toLowerCase())
    const matchBy = filterInvitedBy === 'ALL' || p.invitation.invitedBy === filterInvitedBy
    return matchSearch && matchBy
  })

  const filteredTables = filterTableBy === 'ALL'
    ? tables
    : tables.filter(t =>
        t.assignments.some(a => a.invitation.invitedBy === filterTableBy)
      )

  async function assignPerson(personId: string) {
    if (!selectedTable) return
    setAssigning(true)
    setError('')
    const res = await fetch(`/api/tables/${selectedTable.id}/assign`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ personId }),
    })
    if (res.ok) {
      startTransition(() => router.refresh())
    } else {
      const data = await res.json()
      setError(data.error || 'Error al asignar')
    }
    setAssigning(false)
  }

  async function removeAssignment(personId: string, tableId: string) {
    await fetch(`/api/tables/${tableId}/assign`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ personId }),
    })
    startTransition(() => router.refresh())
  }

  // Search across all tables
  const [searchAll, setSearchAll] = useState('')
  const searchResult = searchAll
    ? confirmedPersons.filter(p =>
        p.name.toLowerCase().includes(searchAll.toLowerCase()) ||
        p.invitation.titularName.toLowerCase().includes(searchAll.toLowerCase())
      )
    : []

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-serif text-3xl" style={{ color: 'var(--brown-dark)' }}>Distribución de Mesas</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--brown-mid)' }}>
          19 mesas · 10 lugares cada una · Solo invitados confirmados
        </p>
      </div>

      {/* Global search */}
      <div className="bg-white rounded-2xl p-4 space-y-3" style={{ border: '1px solid var(--border)' }}>
        <input
          type="text"
          placeholder="Buscar persona o titular por nombre..."
          value={searchAll}
          onChange={e => setSearchAll(e.target.value)}
          className="w-full px-4 py-2.5 rounded-lg text-sm outline-none"
          style={{ background: 'var(--cream)', border: '1px solid var(--gold-light)', color: 'var(--brown-dark)' }}
        />
        {searchResult.length > 0 && (
          <div className="space-y-2">
            {searchResult.map(p => (
              <div key={p.id} className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-lg" style={{ background: 'var(--cream)' }}>
                <div className="min-w-0 break-words">
                  <span className="text-sm font-medium" style={{ color: 'var(--brown-dark)' }}>{p.name}</span>
                  <span className="text-xs ml-2" style={{ color: 'var(--brown-mid)' }}>({p.invitation.titularName})</span>
                </div>
                <span className="text-sm whitespace-nowrap" style={{ color: 'var(--gold-dark)' }}>
                  {p.tableAssignment ? `Mesa ${p.tableAssignment.table.tableNumber}` : 'Sin mesa'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tables grid */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-semibold" style={{ color: 'var(--brown-dark)' }}>Mesas</h2>
            <select
              value={filterTableBy}
              onChange={e => setFilterTableBy(e.target.value)}
              className="px-3 py-1.5 rounded-lg text-sm outline-none"
              style={{ background: 'var(--cream)', border: '1px solid var(--gold-light)', color: 'var(--brown-dark)' }}
            >
              <option value="ALL">Todos</option>
              <option value="NOE">Invitados de Noe</option>
              <option value="ESME">Invitados de Esme</option>
            </select>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
            {filteredTables.map(table => {
              const count = table.assignments.length
              const full = count >= 10
              const selected = selectedTable?.id === table.id
              return (
                <button
                  key={table.id}
                  onClick={() => setSelectedTable(selected ? null : table)}
                  className="p-3 rounded-xl text-left transition-all hover:shadow-md"
                  style={{
                    background: selected ? 'var(--brown-dark)' : full ? '#fef2f2' : 'white',
                    border: `1px solid ${selected ? 'var(--brown-dark)' : full ? '#fca5a5' : 'var(--border)'}`,
                    color: selected ? 'white' : 'var(--brown-dark)',
                  }}
                >
                  <p className="text-xs font-medium mb-1" style={{ color: selected ? 'var(--gold-light)' : 'var(--brown-mid)' }}>
                    Mesa
                  </p>
                  <p className="text-2xl" style={{ fontFamily: "'Times New Roman', Times, serif" }}>{table.tableNumber}</p>
                  <div className="mt-2 flex items-center gap-1">
                    {Array.from({ length: 10 }).map((_, i) => (
                      <div
                        key={i}
                        className="w-2 h-2 rounded-full"
                        style={{
                          background: i < count
                            ? (selected ? 'var(--gold)' : 'var(--gold-dark)')
                            : (selected ? 'rgba(255,255,255,0.2)' : 'var(--cream-dark)'),
                        }}
                      />
                    ))}
                  </div>
                  <p className="text-xs mt-1.5" style={{ color: selected ? 'rgba(255,255,255,0.7)' : 'var(--brown-mid)' }}>
                    {count}/10
                  </p>
                </button>
              )
            })}
          </div>
        </div>

        {/* Side panel */}
        <div className="space-y-4">
          {selectedTable ? (
            <>
              <div className="bg-white rounded-2xl p-5 space-y-4" style={{ border: '1px solid var(--border)' }}>
                <h2 className="font-semibold" style={{ color: 'var(--brown-dark)' }}>
                  Mesa {selectedTable.tableNumber}
                  <span className="ml-2 text-sm font-normal" style={{ color: 'var(--brown-mid)' }}>
                    ({selectedTable.assignments.length}/10)
                  </span>
                </h2>
                {selectedTable.assignments.length === 0 ? (
                  <p className="text-sm text-center py-4" style={{ color: 'var(--brown-mid)' }}>Mesa vacía</p>
                ) : (
                  <div className="space-y-2">
                    {selectedTable.assignments.map(a => (
                      <div key={a.id} className="flex items-center justify-between gap-2 p-2.5 rounded-lg" style={{ background: 'var(--cream)' }}>
                        <div className="min-w-0 break-words">
                          <p className="text-sm font-medium" style={{ color: 'var(--brown-dark)' }}>{a.person.name}</p>
                          <p className="text-xs" style={{ color: 'var(--brown-mid)' }}>
                            {a.invitation.titularName} · {a.invitation.invitedBy === 'NOE' ? 'Noe' : 'Esme'}
                          </p>
                        </div>
                        <button
                          onClick={() => removeAssignment(a.personId, a.tableId)}
                          className="text-xs px-2 py-1 rounded hover:opacity-70 transition-opacity shrink-0"
                          style={{ color: '#dc2626' }}
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {selectedTable.assignments.length < 10 && (
                <div className="bg-white rounded-2xl p-5 space-y-3" style={{ border: '1px solid var(--border)' }}>
                  <h3 className="text-sm font-semibold" style={{ color: 'var(--brown-dark)' }}>Asignar persona</h3>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Buscar..."
                      value={searchPerson}
                      onChange={e => setSearchPerson(e.target.value)}
                      className="flex-1 px-3 py-2 rounded-lg text-sm outline-none"
                      style={{ background: 'var(--cream)', border: '1px solid var(--gold-light)', color: 'var(--brown-dark)' }}
                    />
                    <select
                      value={filterInvitedBy}
                      onChange={e => setFilterInvitedBy(e.target.value)}
                      className="px-2 py-2 rounded-lg text-sm outline-none"
                      style={{ background: 'var(--cream)', border: '1px solid var(--gold-light)', color: 'var(--brown-dark)' }}
                    >
                      <option value="ALL">Todos</option>
                      <option value="NOE">Noe</option>
                      <option value="ESME">Esme</option>
                    </select>
                  </div>
                  {error && <p className="text-xs" style={{ color: '#dc2626' }}>{error}</p>}
                  <div className="max-h-48 overflow-y-auto space-y-1.5">
                    {filteredUnassigned.length === 0 ? (
                      <p className="text-xs text-center py-3" style={{ color: 'var(--brown-mid)' }}>
                        No hay personas disponibles
                      </p>
                    ) : (
                      filteredUnassigned.map(p => (
                        <button
                          key={p.id}
                          onClick={() => assignPerson(p.id)}
                          disabled={assigning}
                          className="w-full flex items-center justify-between p-2.5 rounded-lg text-left hover:opacity-80 transition-all disabled:opacity-60"
                          style={{ background: 'var(--cream)', border: '1px solid var(--gold-light)' }}
                        >
                          <div>
                            <p className="text-xs font-medium" style={{ color: 'var(--brown-dark)' }}>{p.name}</p>
                            <p className="text-xs" style={{ color: 'var(--brown-mid)' }}>{p.invitation.titularName}</p>
                          </div>
                          <span className="text-xs" style={{ color: 'var(--gold-dark)' }}>
                            {p.invitation.invitedBy === 'NOE' ? 'Noe' : 'Esme'}
                          </span>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="bg-white rounded-2xl p-5 text-center" style={{ border: '1px solid var(--border)' }}>
              <p className="text-sm" style={{ color: 'var(--brown-mid)' }}>Selecciona una mesa para ver detalles y asignar personas</p>
            </div>
          )}

          <div className="bg-white rounded-2xl p-5" style={{ border: '1px solid var(--border)' }}>
            <p className="text-sm font-medium mb-2" style={{ color: 'var(--brown-dark)' }}>Sin mesa asignada</p>
            <p className="font-serif text-3xl" style={{ color: 'var(--gold-dark)' }}>{unassigned.length}</p>
            <p className="text-xs mt-1" style={{ color: 'var(--brown-mid)' }}>personas confirmadas</p>
          </div>
        </div>
      </div>
    </div>
  )
}
