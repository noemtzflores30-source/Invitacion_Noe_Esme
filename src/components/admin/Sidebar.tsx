'use client'

import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { useState } from 'react'

const navItems = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: '◈' },
  { href: '/admin/guests', label: 'Invitados', icon: '◉' },
  { href: '/admin/tables', label: 'Mesas', icon: '◎' },
  { href: '/admin/settings', label: 'Configuración', icon: '◆' },
]

export default function AdminSidebar({
  variant = 'desktop',
  onNavigate,
}: {
  variant?: 'desktop' | 'mobile'
  onNavigate?: () => void
}) {
  const pathname = usePathname()
  const router = useRouter()
  const [loggingOut, setLoggingOut] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const isMobile = variant === 'mobile'
  // The mobile drawer is always full-width/expanded — collapsing only makes
  // sense for the persistent desktop rail where it saves screen space.
  const effectiveCollapsed = !isMobile && collapsed

  async function handleLogout() {
    setLoggingOut(true)
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/admin/login')
  }

  return (
    <aside
      className={isMobile ? 'flex flex-col h-full w-full' : 'flex flex-col h-full transition-all duration-300 shrink-0'}
      style={{
        width: isMobile ? undefined : (collapsed ? '72px' : '240px'),
        background: 'var(--sidebar-bg)',
        borderRight: isMobile ? undefined : '1px solid rgba(201,169,110,0.2)',
      }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-6 border-b" style={{ borderColor: 'rgba(201,169,110,0.2)' }}>
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
          style={{ background: 'var(--gold)', color: 'var(--sidebar-bg)', fontFamily: 'serif', fontSize: '1rem' }}
        >
          N
        </div>
        {!effectiveCollapsed && (
          <div>
            <p className="font-serif text-sm leading-tight" style={{ color: 'var(--gold-light)' }}>
              Noe &amp; Esme
            </p>
            <p className="text-xs" style={{ color: 'rgba(232,213,176,0.5)' }}>Boda 2027</p>
          </div>
        )}
        {isMobile ? (
          <button
            onClick={onNavigate}
            aria-label="Cerrar menú"
            className="ml-auto w-8 h-8 flex items-center justify-center text-lg opacity-70 hover:opacity-100 transition-opacity"
            style={{ color: 'var(--gold-light)' }}
          >
            ✕
          </button>
        ) : (
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="ml-auto text-xs opacity-40 hover:opacity-80 transition-opacity"
            style={{ color: 'var(--gold-light)' }}
          >
            {collapsed ? '›' : '‹'}
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 space-y-1 px-2 overflow-y-auto">
        {navItems.map(item => {
          const active = pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm font-medium"
              style={{
                background: active ? 'rgba(201,169,110,0.15)' : 'transparent',
                color: active ? 'var(--gold)' : 'var(--sidebar-text)',
                borderLeft: active ? '2px solid var(--gold)' : '2px solid transparent',
              }}
            >
              <span className="text-base shrink-0">{item.icon}</span>
              {!effectiveCollapsed && <span>{item.label}</span>}
            </Link>
          )
        })}
      </nav>

      {/* Logout */}
      <div className="p-3 border-t" style={{ borderColor: 'rgba(201,169,110,0.2)' }}>
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm transition-all hover:bg-red-900/20"
          style={{ color: 'rgba(232,213,176,0.6)' }}
        >
          <span className="text-base shrink-0">⊗</span>
          {!effectiveCollapsed && <span>{loggingOut ? 'Saliendo...' : 'Cerrar sesión'}</span>}
        </button>
      </div>
    </aside>
  )
}
