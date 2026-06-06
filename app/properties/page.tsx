'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase, Property } from '@/lib/supabase'
import { Plus, Search, MapPin, Maximize2 } from 'lucide-react'

const TYPE_LABELS: Record<string, string> = {
  apartament: 'Apartament', vila: 'Vilë', dyqan: 'Dyqan',
  are: 'Arë', troje: 'Troje', njesi_biznesi: 'Njësi Biznesi'
}
const STATUS_STYLES: Record<string, { bg: string; color: string; label: string }> = {
  available: { bg: '#f0fdf4', color: '#16a34a', label: 'E lirë' },
  rented: { bg: '#fef9c3', color: '#ca8a04', label: 'Me qira' },
  sold: { bg: '#fef2f2', color: '#dc2626', label: 'E shitur' },
}
const FILTERS = ['Të gjitha', 'Apartamente', 'Toka/Arë', 'Dyqane', 'Njësi biznesi']

export default function PropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([])
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('Të gjitha')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('properties').select('*').order('created_at', { ascending: false })
      .then(({ data }) => { setProperties(data || []); setLoading(false) })
  }, [])

  const filtered = properties.filter(p => {
    const matchSearch = p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.city.toLowerCase().includes(search.toLowerCase()) ||
      (p.neighborhood || '').toLowerCase().includes(search.toLowerCase())
    const matchFilter = filter === 'Të gjitha' ||
      (filter === 'Apartamente' && ['apartament', 'vila'].includes(p.type)) ||
      (filter === 'Toka/Arë' && ['are', 'troje'].includes(p.type)) ||
      (filter === 'Dyqane' && p.type === 'dyqan') ||
      (filter === 'Njësi biznesi' && p.type === 'njesi_biznesi')
    return matchSearch && matchFilter
  })

  const formatPrice = (p: Property) => {
    if (p.monthly_rent_eur) return `€${p.monthly_rent_eur.toLocaleString()}/muaj`
    if (p.price_eur) return `€${p.price_eur.toLocaleString()}`
    if (p.price_lek_m2) return `${p.price_lek_m2.toLocaleString()} L/m²`
    return '—'
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold" style={{ color: 'var(--maroon)' }}>Pronat</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>{properties.length} prona gjithsej</p>
        </div>
        <Link href="/properties/new"
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold"
          style={{ background: 'var(--burgundy)', color: 'var(--cream)' }}>
          <Plus size={16} /> Shto Pronë
        </Link>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Kërko sipas titullit, qytetit..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm outline-none"
            style={{ borderColor: 'var(--cream-dark)', background: 'white' }}
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {FILTERS.map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className="px-4 py-2 rounded-xl text-sm font-medium transition-all"
              style={{
                background: filter === f ? 'var(--burgundy)' : 'white',
                color: filter === f ? 'var(--cream)' : 'var(--text-muted)',
                border: `1px solid ${filter === f ? 'var(--burgundy)' : 'var(--cream-dark)'}`
              }}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="text-center py-16 text-sm" style={{ color: 'var(--text-muted)' }}>Duke ngarkuar...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-sm" style={{ color: 'var(--text-muted)' }}>Nuk u gjetën prona.</div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(p => {
            const s = STATUS_STYLES[p.status]
            const img = p.images && p.images.length > 0 ? p.images[0] : null
            return (
              <Link key={p.id} href={`/properties/${p.id}`}
                className="rounded-2xl overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:shadow-lg block"
                style={{ background: 'white', boxShadow: '0 1px 3px rgba(92,26,46,0.08)' }}>
                {/* Image */}
                <div className="h-44 relative overflow-hidden" style={{ background: 'var(--cream-dark)' }}>
                  {img ? (
                    <img src={img} alt={p.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                        <path d="M3 12L12 3L21 12V21H15V15H9V21H3V12Z" fill="var(--mauve)" opacity="0.3" />
                      </svg>
                    </div>
                  )}
                  <span className="absolute top-3 right-3 text-xs px-2.5 py-1 rounded-full font-medium"
                    style={{ background: s.bg, color: s.color }}>{s.label}</span>
                </div>
                <div className="p-4">
                  <p className="font-semibold text-sm mb-1" style={{ color: 'var(--maroon)' }}>{p.title}</p>
                  <div className="flex items-center gap-1 text-xs mb-3" style={{ color: 'var(--text-muted)' }}>
                    <MapPin size={12} />
                    {p.city}{p.neighborhood ? `, ${p.neighborhood}` : ''}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-display font-bold text-base" style={{ color: 'var(--burgundy)' }}>
                      {formatPrice(p)}
                    </span>
                    {p.size_m2 && (
                      <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-muted)' }}>
                        <Maximize2 size={12} />{p.size_m2} m²
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
