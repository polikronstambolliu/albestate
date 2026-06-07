'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Home, Building2, BarChart3, LogOut, Plus, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'

const nav = [
  { href: '/dashboard', label: 'Dashboard', icon: Home },
  { href: '/properties', label: 'Pronat', icon: Building2 },
  { href: '/analytics', label: 'Analitikë', icon: BarChart3 },
]

export default function Topbar() {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b" style={{ background: 'white', borderColor: 'var(--cream-dark)' }}>
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--burgundy)' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M3 12L12 3L21 12V21H15V15H9V21H3V12Z" fill="white" />
              </svg>
            </div>
            <span className="font-display font-semibold text-lg" style={{ color: 'var(--maroon)' }}>AlbEstate</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {nav.map(({ href, label }) => {
              const active = pathname.startsWith(href)
              return (
                <Link key={href} href={href}
                  className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
                  style={{
                    background: active ? 'var(--cream)' : 'transparent',
                    color: active ? 'var(--burgundy)' : 'var(--text-muted)',
                    fontWeight: active ? '600' : '400',
                  }}>
                  {label}
                </Link>
              )
            })}
          </nav>

          {/* Right actions */}
          <div className="hidden md:flex items-center gap-3">
            <Link href="/properties/new"
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all hover:opacity-90"
              style={{ background: 'var(--burgundy)', color: 'white' }}>
              <Plus size={15} /> Shto Pronë
            </Link>
            <button onClick={handleLogout}
              className="p-2 rounded-lg transition-colors"
              style={{ color: 'var(--text-muted)' }}
              title="Dilni">
              <LogOut size={18} />
            </button>
          </div>

          {/* Mobile toggle */}
          <button className="md:hidden p-2" onClick={() => setMobileOpen(!mobileOpen)}
            style={{ color: 'var(--maroon)' }}>
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden border-t px-6 py-4 space-y-1" style={{ borderColor: 'var(--cream-dark)', background: 'white' }}>
            {nav.map(({ href, label, icon: Icon }) => (
              <Link key={href} href={href} onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium"
                style={{ color: pathname.startsWith(href) ? 'var(--burgundy)' : 'var(--text-muted)', background: pathname.startsWith(href) ? 'var(--cream)' : 'transparent' }}>
                <Icon size={16} />{label}
              </Link>
            ))}
            <Link href="/properties/new" onClick={() => setMobileOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold mt-2"
              style={{ background: 'var(--burgundy)', color: 'white' }}>
              <Plus size={16} /> Shto Pronë
            </Link>
            <button onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm w-full"
              style={{ color: 'var(--text-muted)' }}>
              <LogOut size={16} /> Dilni
            </button>
          </div>
        )}
      </header>
    </>
  )
}
