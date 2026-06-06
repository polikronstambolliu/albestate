'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError('Email ose fjalëkalimi i gabuar.')
      setLoading(false)
    } else {
      router.push('/dashboard')
    }
  }

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--cream)' }}>
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12"
        style={{ background: 'var(--maroon)' }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'var(--burgundy)' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M3 12L12 3L21 12V21H15V15H9V21H3V12Z" fill="var(--rose)" />
            </svg>
          </div>
          <div>
            <p className="font-display font-semibold" style={{ color: 'var(--cream)' }}>AlbEstate Agency</p>
            <p className="text-xs" style={{ color: 'var(--rose)' }}>Agjenci Imobiliare</p>
          </div>
        </div>
        <div>
          <h1 className="font-display text-5xl font-bold leading-tight mb-4" style={{ color: 'var(--cream)' }}>
            Menaxhoni<br />Pronën Tuaj<br />me Stil
          </h1>
          <p style={{ color: 'var(--rose)' }}>Lushnjë, Albania — Platforma e menaxhimit të pronave</p>
        </div>
        <div className="flex gap-8">
          {[['4+', 'Prona aktive'], ['10+', 'Vjet eksperiencë'], ['100%', 'Besueshmëri']].map(([n, l]) => (
            <div key={l}>
              <p className="font-display text-2xl font-bold" style={{ color: 'var(--gold)' }}>{n}</p>
              <p className="text-xs" style={{ color: 'var(--rose)' }}>{l}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'var(--maroon)' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path d="M3 12L12 3L21 12V21H15V15H9V21H3V12Z" fill="var(--rose)" />
              </svg>
            </div>
            <p className="font-display font-semibold text-lg" style={{ color: 'var(--maroon)' }}>AlbEstate Agency</p>
          </div>

          <h2 className="font-display text-3xl font-bold mb-2" style={{ color: 'var(--maroon)' }}>Mirësevini</h2>
          <p className="text-sm mb-8" style={{ color: 'var(--text-muted)' }}>Kyçuni në llogarinë tuaj</p>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--maroon)' }}>Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl border-2 outline-none transition-all text-sm"
                style={{ borderColor: 'var(--cream-dark)', background: 'white' }}
                onFocus={e => e.target.style.borderColor = 'var(--mauve)'}
                onBlur={e => e.target.style.borderColor = 'var(--cream-dark)'}
                placeholder="eris@albestate.al"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--maroon)' }}>Fjalëkalimi</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl border-2 outline-none transition-all text-sm"
                style={{ borderColor: 'var(--cream-dark)', background: 'white' }}
                onFocus={e => e.target.style.borderColor = 'var(--mauve)'}
                onBlur={e => e.target.style.borderColor = 'var(--cream-dark)'}
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="px-4 py-3 rounded-xl text-sm" style={{ background: '#fef2f2', color: '#dc2626' }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-semibold text-sm transition-all duration-200 disabled:opacity-60"
              style={{ background: 'var(--burgundy)', color: 'var(--cream)' }}
            >
              {loading ? 'Duke u kyçur...' : 'Kyçu'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
