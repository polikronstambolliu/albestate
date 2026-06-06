'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Home, Building2, BarChart3, LogOut, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'

const nav = [
  { href: '/dashboard', label: 'Dashboard', icon: Home },
  { href: '/properties', label: 'Pronë', icon: Building2 },
  { href: '/analytics', label: 'Analitikë', icon: BarChart3 },
]

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [open, setOpen] = useState(false)

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed top-4 left-4 z-50 md:hidden p-2 rounded-lg"
        style={{ background: 'var(--burgundy)', color: 'var(--cream)' }}
      >
        {open ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Overlay */}
      {open && (
        <div className="fixed inset-0 z-30 bg-black/40 md:hidden" onClick={() => setOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full z-40 w-64 flex flex-col transition-transform duration-300
          ${open ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}
        style={{ background: 'var(--maroon)' }}
      >
        {/* Logo */}
        <div className="p-6 border-b" style={{ borderColor: 'rgba(196,130,154,0.2)' }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'var(--burgundy)' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path d="M3 12L12 3L21 12V21H15V15H9V21H3V12Z" fill="var(--rose)" />
              </svg>
            </div>
            <div>
              <p className="font-display text-sm font-semibold" style={{ color: 'var(--cream)' }}>AlbEstate</p>
              <p className="text-xs" style={{ color: 'var(--rose)' }}>Agency</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1">
          {nav.map(({ href, label, icon: Icon }) => {
            const active = pathname.startsWith(href)
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-sm font-medium"
                style={{
                  background: active ? 'var(--burgundy)' : 'transparent',
                  color: active ? 'var(--cream)' : 'var(--rose)',
                }}
              >
                <Icon size={18} />
                {label}
              </Link>
            )
          })}
        </nav>

        {/* Broker info + logout */}
        <div className="p-4 border-t" style={{ borderColor: 'rgba(196,130,154,0.2)' }}>
          <div className="px-4 py-3 rounded-xl mb-2" style={{ background: 'rgba(92,26,46,0.5)' }}>
            <p className="text-xs font-medium" style={{ color: 'var(--cream)' }}>Eris STAMBOLLIU</p>
            <p className="text-xs" style={{ color: 'var(--rose)' }}>Broker</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-2 rounded-xl text-sm transition-all duration-200"
            style={{ color: 'var(--rose)' }}
          >
            <LogOut size={16} />
            Dilni
          </button>
        </div>
      </aside>
    </>
  )
}
