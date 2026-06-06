'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase, Property } from '@/lib/supabase'
import { Building2, TrendingUp, Home, Plus } from 'lucide-react'

const TYPE_LABELS: Record<string, string> = {
  apartament: 'Apartament', vila: 'Vilë', dyqan: 'Dyqan',
  are: 'Arë', troje: 'Troje', njesi_biznesi: 'Njësi Biznesi'
}
const STATUS_STYLES: Record<string, { bg: string, color: string, label: string }> = {
  available: { bg: '#f0fdf4', color: '#16a34a', label: 'E lirë' },
  rented: { bg: '#fef9c3', color: '#ca8a04', label: 'Me qira' },
  sold: { bg: '#fef2f2', color: '#dc2626', label: 'E shitur' },
}

export default function DashboardPage() {
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('properties').select('*').order('created_at', { ascending: false })
      .then(({ data }) => { setProperties(data || []); setLoading(false) })
  }, [])

  const stats = {
    total: properties.length,
    available: properties.filter(p => p.status === 'available').length,
    rented: properties.filter(p => p.status === 'rented').length,
    sold: properties.filter(p => p.status === 'sold').length,
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold" style={{ color: 'var(--maroon)' }}>Dashboard</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Pasqyrë e pronave të AlbEstate</p>
        </div>
        <Link href="/properties/new"
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 hover:opacity-90"
          style={{ background: 'var(--burgundy)', color: 'var(--cream)' }}>
          <Plus size={16} /> Shto Pronë
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Prona', value: stats.total, icon: Building2, color: 'var(--burgundy)' },
          { label: 'Të Lira', value: stats.available, icon: Home, color: '#16a34a' },
          { label: 'Me Qira', value: stats.rented, icon: TrendingUp, color: '#ca8a04' },
          { label: 'Të Shitura', value: stats.sold, icon: TrendingUp, color: '#dc2626' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="rounded-2xl p-5" style={{ background: 'white', boxShadow: '0 1px 3px rgba(92,26,46,0.08)' }}>
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>{label}</p>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: color + '15' }}>
                <Icon size={16} style={{ color }} />
              </div>
            </div>
            <p className="font-display text-3xl font-bold" style={{ color: 'var(--maroon)' }}>{loading ? '—' : value}</p>
          </div>
        ))}
      </div>

      {/* Recent properties */}
      <div className="rounded-2xl overflow-hidden" style={{ background: 'white', boxShadow: '0 1px 3px rgba(92,26,46,0.08)' }}>
        <div className="px-6 py-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--cream-dark)' }}>
          <h2 className="font-display text-lg font-semibold" style={{ color: 'var(--maroon)' }}>Pronat e Fundit</h2>
          <Link href="/properties" className="text-sm font-medium" style={{ color: 'var(--mauve)' }}>Shiko të gjitha →</Link>
        </div>
        <div className="divide-y" style={{ borderColor: 'var(--cream-dark)' }}>
          {loading ? (
            <div className="p-8 text-center text-sm" style={{ color: 'var(--text-muted)' }}>Duke ngarkuar...</div>
          ) : properties.slice(0, 5).map(p => {
            const s = STATUS_STYLES[p.status]
            return (
              <Link key={p.id} href={`/properties/${p.id}`}
                className="flex items-center justify-between px-6 py-4 hover:bg-opacity-50 transition-colors"
                style={{ background: 'transparent' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--cream)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <div>
                  <p className="font-medium text-sm" style={{ color: 'var(--maroon)' }}>{p.title}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                    {TYPE_LABELS[p.type]} · {p.city}{p.neighborhood ? `, ${p.neighborhood}` : ''}
                  </p>
                </div>
                <span className="text-xs px-3 py-1 rounded-full font-medium" style={{ background: s.bg, color: s.color }}>
                  {s.label}
                </span>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
