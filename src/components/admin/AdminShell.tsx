'use client'

import { useEffect, useState } from 'react'
import AdminSidebar from './Sidebar'

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false)

  // Close the drawer on Escape, and whenever the viewport grows back into
  // the desktop breakpoint (rotating a phone/opening on a tablet).
  useEffect(() => {
    if (!mobileOpen) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setMobileOpen(false) }
    const mq = window.matchMedia('(min-width: 768px)')
    const onResize = () => { if (mq.matches) setMobileOpen(false) }
    document.addEventListener('keydown', onKey)
    mq.addEventListener('change', onResize)
    return () => {
      document.removeEventListener('keydown', onKey)
      mq.removeEventListener('change', onResize)
    }
  }, [mobileOpen])

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--cream)' }}>
      {/* Desktop sidebar — persistent, collapsible */}
      <div className="hidden md:flex h-full">
        <AdminSidebar />
      </div>

      {/* Mobile top bar */}
      <header
        className="md:hidden fixed top-0 inset-x-0 z-30 flex items-center gap-3 px-4 h-14"
        style={{ background: 'var(--sidebar-bg)', borderBottom: '1px solid rgba(201,169,110,0.2)' }}
      >
        <button
          onClick={() => setMobileOpen(true)}
          aria-label="Abrir menú"
          className="w-9 h-9 -ml-1 flex items-center justify-center rounded-lg shrink-0"
          style={{ color: 'var(--gold-light)' }}
        >
          <span style={{ fontSize: '1.35rem', lineHeight: 1 }}>☰</span>
        </button>
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
          style={{ background: 'var(--gold)', color: 'var(--sidebar-bg)', fontFamily: 'serif', fontSize: '0.9rem' }}
        >
          N
        </div>
        <span className="font-serif text-base truncate" style={{ color: 'var(--gold-light)' }}>Esmeralda &amp; Noe</span>
      </header>

      {/* Mobile drawer + backdrop */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-40">
          <div
            className="absolute inset-0"
            style={{ background: 'rgba(0,0,0,0.5)' }}
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 w-64 max-w-[80vw] shadow-xl">
            <AdminSidebar variant="mobile" onNavigate={() => setMobileOpen(false)} />
          </div>
        </div>
      )}

      <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6 lg:p-8">
        {/* Spacer to clear the fixed mobile top bar */}
        <div className="h-14 md:hidden" />
        {children}
      </main>
    </div>
  )
}
