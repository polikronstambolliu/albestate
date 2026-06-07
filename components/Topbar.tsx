'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Plus, LogOut, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'

const nav = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/properties', label: 'Pronat' },
  { href: '/analytics', label: 'Analitikë' },
]

export default function Topbar() {
  const pathname = usePathname()
  const router = useRouter()
  const [open, setOpen] = useState(false)

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <header style={{ background: 'var(--surface-lowest)', borderBottom: '1px solid var(--outline-variant)' }}
      className="w-full h-16 sticky top-0 z-50">
      <div className="flex justify-between items-center px-10 max-w-7xl mx-auto h-full">
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--primary)' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M3 12L12 3L21 12V21H15V15H9V21H3V12Z" fill="white"/>
            </svg>
          </div>
          <span className="font-display font-bold text-xl" style={{ color: 'var(--primary)' }}>AlbEstate</span>
        </Link>

        {/* Nav */}
        <nav className="hidden md:flex gap-8 items-center">
          {nav.map(({ href, label }) => {
            const active = pathname.startsWith(href)
            return (
              <Link key={href} href={href}
                className="text-sm font-medium transition-colors duration-200 pb-1"
                style={{
                  color: active ? 'var(--primary)' : 'var(--on-surface-variant)',
                  borderBottom: active ? '2px solid var(--primary)' : '2px solid transparent',
                }}>
                {label}
              </Link>
            )
          })}
        </nav>

        {/* Actions */}
        <div className="hidden md:flex items-center gap-3">
          <Link href="/properties/new"
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all hover:opacity-90"
            style={{ background: 'var(--primary)', color: 'white' }}>
            <Plus size={15} /> Shto Pronë
          </Link>
          <button onClick={handleLogout} className="p-2 rounded-lg transition-colors"
            style={{ color: 'var(--on-surface-variant)' }} title="Dilni">
            <LogOut size={18} />
          </button>
        </div>

        {/* Mobile */}
        <button className="md:hidden p-2" onClick={() => setOpen(!open)} style={{ color: 'var(--primary)' }}>
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t px-6 py-4 space-y-1"
          style={{ borderColor: 'var(--outline-variant)', background: 'var(--surface-lowest)' }}>
          {nav.map(({ href, label }) => (
            <Link key={href} href={href} onClick={() => setOpen(false)}
              className="block px-4 py-3 rounded-xl text-sm font-medium"
              style={{ color: pathname.startsWith(href) ? 'var(--primary)' : 'var(--on-surface-variant)', background: pathname.startsWith(href) ? 'var(--surface-low)' : 'transparent' }}>
              {label}
            </Link>
          ))}
          <Link href="/properties/new" onClick={() => setOpen(false)}
            className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold mt-2"
            style={{ background: 'var(--primary)', color: 'white' }}>
            <Plus size={15} /> Shto Pronë
          </Link>
          <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-3 text-sm w-full"
            style={{ color: 'var(--on-surface-variant)' }}>
            <LogOut size={15} /> Dilni
          </button>
        </div>
      )}
    </header>
  )
}
