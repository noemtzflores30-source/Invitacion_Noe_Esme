'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    })

    if (res.ok) {
      router.push('/admin/dashboard')
    } else {
      const data = await res.json()
      setError(data.error || 'Error al iniciar sesión')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--cream)' }}>
      <div className="w-full max-w-md mx-4">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="h-px w-12" style={{ background: 'var(--gold)' }} />
            <span style={{ color: 'var(--gold)', fontSize: '1.5rem' }}>♦</span>
            <div className="h-px w-12" style={{ background: 'var(--gold)' }} />
          </div>
          <h1 className="font-serif text-4xl mb-2" style={{ color: 'var(--brown-dark)' }}>
            Noe &amp; Esme
          </h1>
          <p className="text-sm tracking-widest uppercase" style={{ color: 'var(--gold-dark)' }}>
            Panel de Administración
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8" style={{ border: '1px solid var(--gold-light)' }}>
          <h2 className="text-xl font-semibold mb-6 text-center" style={{ color: 'var(--brown-dark)' }}>
            Iniciar Sesión
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--brown-mid)' }}>
                Usuario
              </label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-lg outline-none transition-all"
                style={{
                  background: 'var(--cream)',
                  border: '1px solid var(--gold-light)',
                  color: 'var(--brown-dark)',
                }}
                placeholder="admin"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--brown-mid)' }}>
                Contraseña
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-lg outline-none transition-all"
                style={{
                  background: 'var(--cream)',
                  border: '1px solid var(--gold-light)',
                  color: 'var(--brown-dark)',
                }}
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="p-3 rounded-lg text-sm text-center" style={{ background: '#fef2f2', color: '#dc2626' }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg font-semibold text-white transition-all hover:opacity-90 disabled:opacity-60"
              style={{ background: 'var(--gold-dark)' }}
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
        </div>

        <p className="text-center text-xs mt-6" style={{ color: 'var(--brown-mid)', opacity: 0.6 }}>
          30 de enero de 2027
        </p>
      </div>
    </div>
  )
}
