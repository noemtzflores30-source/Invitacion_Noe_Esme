export const MAX_GUESTS = 190

export function countPersonSlots(persons: { isChild: boolean; status?: string }[]): number {
  const active = persons.filter(p => p.status !== 'REJECTED')
  const adults = active.filter(p => !p.isChild).length
  const children = active.filter(p => p.isChild).length
  return adults + Math.ceil(children / 2)
}

export function countConfirmedSlots(persons: { isChild: boolean; status: string }[]): number {
  const confirmed = persons.filter(p => p.status === 'CONFIRMED')
  const adults = confirmed.filter(p => !p.isChild).length
  const children = confirmed.filter(p => p.isChild).length
  return adults + Math.ceil(children / 2)
}

export function countPendingSlots(persons: { isChild: boolean; status: string }[]): number {
  const pending = persons.filter(p => p.status === 'PENDING')
  const adults = pending.filter(p => !p.isChild).length
  const children = pending.filter(p => p.isChild).length
  return adults + Math.ceil(children / 2)
}

export function formatDate(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number)
  const months = [
    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
  ]
  return `${d} de ${months[m - 1]} de ${y}`
}

export function formatShortDate(dateStr: string): string {
  const [y, m, d] = dateStr.split('-')
  return `${d} · ${m} · ${y}`
}

export function isDeadlinePassed(deadlineStr: string | null | undefined): boolean {
  if (!deadlineStr) return false
  const deadline = new Date(deadlineStr + 'T23:59:59')
  return new Date() > deadline
}

export function cn(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(' ')
}
