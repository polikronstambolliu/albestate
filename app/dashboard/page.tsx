'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase, Property } from '@/lib/supabase'
import { MapPin, Maximize2, ArrowRight } from 'lucide-react'

const STATUS: Record<string, { bg: string; color: string; label: string }> = {
  available: { bg: '#f0fdf4', color: '#15803d', label: 'E lirë' },
  rented:    { bg: '#fefce8', color: '#a16207', label: 'Me qira' },
  sold:      { bg: '#fef2f2', color: '#b91c1c', label: 'E shitur' },
}

export default function DashboardPage() {
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('properties').select('*').order('created_at', { ascending: false })
      .then(({ data }) => { setProperties(data || []); setLoading(false) })
  }, [])

  const stats = [
    { label: 'Total Prona', value: properties.length, color: 'var(--primary)' },
    { label: 'Të Lira', value: properties.filter(p => p.status === 'available').length, color: '#15803d' },
    { label: 'Me Qira', value: properties.filter(p => p.status === 'rented').length, color: '#a16207' },
    { label: 'Të Shitura', value: properties.filter(p => p.status === 'sold').length, color: '#b91c1c' },
  ]

  const price = (p: Property) => {
    if (p.monthly_rent_eur) return `€${p.monthly_rent_eur.toLocaleString()}/muaj`
    if (p.price_eur) return `€${p.price_eur.toLocaleString()}`
    if (p.price_lek_m2) return `${p.price_lek_m2.toLocaleString()} L/m²`
    return '—'
  }

  return (
    <div>
      {/* Page header */}
      <div className="mb-10">
        <h1 className="font-display text-4xl font-bold mb-2" style={{ color: 'var(--on-surface)' }}>Dashboard</h1>
        <p className="text-base" style={{ color: 'var(--on-surface-variant)' }}>Pasqyrë e pronave të AlbEstate Agency — Lushnjë</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
        {stats.map(({ label, value, color }) => (
          <div key={label} className="rounded-xl p-6 border" style={{ background: 'var(--surface-lowest)', borderColor: 'var(--outline-variant)' }}>
            <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--outline)' }}>{label}</p>
            <p className="font-display text-5xl font-bold" style={{ color }}>{loading ? '—' : value}</p>
          </div>
        ))}
      </div>

      {/* Recent listings */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-2xl font-bold" style={{ color: 'var(--on-surface)' }}>Pronat e Fundit</h2>
          <Link href="/properties" className="flex items-center gap-1 text-sm font-medium" style={{ color: 'var(--primary)' }}>
            Shiko të gjitha <ArrowRight size={14} />
          </Link>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            [1,2,3].map(i => (
              <div key={i} className="rounded-xl overflow-hidden animate-pulse" style={{ background: 'var(--surface-lowest)' }}>
                <div className="aspect-video" style={{ background: 'var(--surface-container)' }} />
                <div className="p-6 space-y-2">
                  <div className="h-5 rounded" style={{ background: 'var(--surface-container)', width: '60%' }} />
                  <div className="h-3 rounded" style={{ background: 'var(--surface-container)', width: '40%' }} />
                </div>
              </div>
            ))
          ) : properties.slice(0, 6).map(p => {
            const s = STATUS[p.status]
            const img = p.images?.[0]
            return (
              <Link key={p.id} href={`/properties/${p.id}`}
                className="property-shadow rounded-xl overflow-hidden block group cursor-pointer border border-transparent hover:border-outline-variant transition-all duration-200"
                style={{ background: 'var(--surface-lowest)' }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--outline-variant)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'transparent'}>
                <div className="aspect-video overflow-hidden relative" style={{ background: 'var(--surface-container)' }}>
                  {img ? (
                    <img src={img} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                        <path d="M3 12L12 3L21 12V21H15V15H9V21H3V12Z" fill="var(--outline-variant)" />
                      </svg>
                    </div>
                  )}
                  <span className="absolute top-3 right-3 text-xs px-2 py-1 rounded font-semibold"
                    style={{ background: s.bg, color: s.color }}>{s.label}</span>
                </div>
                <div className="p-6">
                  <p className="font-bold text-base mb-1" style={{ color: 'var(--on-surface)' }}>{price(p)}</p>
                  <p className="text-sm mb-3 truncate" style={{ color: 'var(--on-surface-variant)' }}>{p.title}</p>
                  <div className="flex items-center gap-1 text-xs mb-4" style={{ color: 'var(--on-surface-variant)' }}>
                    <MapPin size={11} />{p.city}{p.neighborhood ? `, ${p.neighborhood}` : ''}
                  </div>
                  <div className="flex justify-between border-t pt-4 text-xs" style={{ borderColor: 'var(--outline-variant)', color: 'var(--on-surface-variant)' }}>
                    {p.rooms && <span>🛏 {p.rooms}</span>}
                    {p.bathrooms && <span>🚿 {p.bathrooms}</span>}
                    {p.size_m2 && <span className="flex items-center gap-1"><Maximize2 size={11} /> {p.size_m2} m²</span>}
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
