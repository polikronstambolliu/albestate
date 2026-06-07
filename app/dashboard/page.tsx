'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase, Property } from '@/lib/supabase'
import { Building2, TrendingUp, Home, ArrowRight, MapPin, Maximize2 } from 'lucide-react'

const TYPE_LABELS: Record<string, string> = {
  apartament: 'Apartament', vila: 'Vilë', dyqan: 'Dyqan',
  are: 'Arë', troje: 'Troje', njesi_biznesi: 'Njësi Biznesi'
}
const STATUS_STYLES: Record<string, { bg: string; color: string; label: string }> = {
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

  const formatPrice = (p: Property) => {
    if (p.monthly_rent_eur) return `€${p.monthly_rent_eur.toLocaleString()}/muaj`
    if (p.price_eur) return `€${p.price_eur.toLocaleString()}`
    if (p.price_lek_m2) return `${p.price_lek_m2.toLocaleString()} L/m²`
    return '—'
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold mb-1" style={{ color: 'var(--maroon)' }}>Dashboard</h1>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Pasqyrë e pronave të AlbEstate Agency</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Prona', value: stats.total, icon: Building2, accent: 'var(--burgundy)' },
          { label: 'Të Lira', value: stats.available, icon: Home, accent: '#16a34a' },
          { label: 'Me Qira', value: stats.rented, icon: TrendingUp, accent: '#ca8a04' },
          { label: 'Të Shitura', value: stats.sold, icon: TrendingUp, accent: '#dc2626' },
        ].map(({ label, value, icon: Icon, accent }) => (
          <div key={label} className="rounded-2xl p-5 border" style={{ background: 'white', borderColor: 'var(--cream-dark)', boxShadow: `0 2px 12px var(--shadow)` }}>
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-light)' }}>{label}</p>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: accent + '15' }}>
                <Icon size={16} style={{ color: accent }} />
              </div>
            </div>
            <p className="font-display text-4xl font-bold" style={{ color: 'var(--maroon)' }}>{loading ? '—' : value}</p>
          </div>
        ))}
      </div>

      {/* Recent listings */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-xl font-semibold" style={{ color: 'var(--maroon)' }}>Pronat e Fundit</h2>
          <Link href="/properties" className="flex items-center gap-1 text-sm font-medium" style={{ color: 'var(--burgundy)' }}>
            Shiko të gjitha <ArrowRight size={14} />
          </Link>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading ? (
            [1,2,3].map(i => (
              <div key={i} className="rounded-2xl overflow-hidden border animate-pulse" style={{ background: 'white', borderColor: 'var(--cream-dark)' }}>
                <div className="h-44" style={{ background: 'var(--cream-dark)' }} />
                <div className="p-4 space-y-2">
                  <div className="h-4 rounded" style={{ background: 'var(--cream-dark)', width: '70%' }} />
                  <div className="h-3 rounded" style={{ background: 'var(--cream-dark)', width: '50%' }} />
                </div>
              </div>
            ))
          ) : properties.slice(0, 6).map(p => {
            const s = STATUS_STYLES[p.status]
            const img = p.images?.[0]
            return (
              <Link key={p.id} href={`/properties/${p.id}`}
                className="rounded-2xl overflow-hidden border block transition-all duration-200 hover:-translate-y-1"
                style={{ background: 'white', borderColor: 'var(--cream-dark)', boxShadow: '0 2px 12px var(--shadow)' }}
                onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 8px 30px var(--shadow-hover)')}
                onMouseLeave={e => (e.currentTarget.style.boxShadow = '0 2px 12px var(--shadow)')}>
                <div className="relative overflow-hidden" style={{ height: '180px', background: 'var(--cream-dark)' }}>
                  {img ? <img src={img} alt={p.title} className="w-full h-full object-cover" /> : (
                    <div className="w-full h-full flex items-center justify-center">
                      <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
                        <path d="M3 12L12 3L21 12V21H15V15H9V21H3V12Z" fill="var(--mauve)" opacity="0.25" />
                      </svg>
                    </div>
                  )}
                  <span className="absolute top-3 left-3 text-xs px-2.5 py-1 rounded-full font-semibold"
                    style={{ background: s.bg, color: s.color }}>{s.label}</span>
                </div>
                <div className="p-4">
                  <p className="font-semibold text-sm mb-1 truncate" style={{ color: 'var(--maroon)' }}>{p.title}</p>
                  <div className="flex items-center gap-1 mb-3">
                    <MapPin size={11} style={{ color: 'var(--text-light)' }} />
                    <span className="text-xs" style={{ color: 'var(--text-light)' }}>{p.city}{p.neighborhood ? `, ${p.neighborhood}` : ''}</span>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t" style={{ borderColor: 'var(--cream-dark)' }}>
                    <span className="font-display font-bold text-base" style={{ color: 'var(--burgundy)' }}>{formatPrice(p)}</span>
                    {p.size_m2 && (
                      <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-light)' }}>
                        <Maximize2 size={11} />{p.size_m2} m²
                      </span>
                    )}
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
