'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase, Property } from '@/lib/supabase'
import { Search, MapPin, Maximize2 } from 'lucide-react'

const TYPE_LABELS: Record<string, string> = {
  apartament: 'Apartament', vila: 'Vilë', dyqan: 'Dyqan',
  are: 'Arë', troje: 'Troje', njesi_biznesi: 'Njësi Biznesi'
}
const STATUS: Record<string, { bg: string; color: string; label: string }> = {
  available: { bg: '#f0fdf4', color: '#15803d', label: 'E lirë' },
  rented:    { bg: '#fefce8', color: '#a16207', label: 'Me qira' },
  sold:      { bg: '#fef2f2', color: '#b91c1c', label: 'E shitur' },
}
const TYPE_FILTERS = [
  { label: 'Të gjitha', value: 'all' },
  { label: 'Apartamente', value: 'apartamente' },
  { label: 'Toka/Arë', value: 'toka' },
  { label: 'Dyqane', value: 'dyqane' },
  { label: 'Njësi biznesi', value: 'njesi' },
]
const STATUS_FILTERS = [
  { label: 'Të gjitha', value: 'all' },
  { label: 'Të lira', value: 'available' },
  { label: 'Me qira', value: 'rented' },
  { label: 'Të shitura', value: 'sold' },
]

export default function PropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([])
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('properties').select('*').order('created_at', { ascending: false })
      .then(({ data }) => { setProperties(data || []); setLoading(false) })
  }, [])

  const filtered = properties.filter(p => {
    const q = search.toLowerCase()
    const matchSearch = p.title.toLowerCase().includes(q) || p.city.toLowerCase().includes(q) || (p.neighborhood||'').toLowerCase().includes(q)
    const matchType = typeFilter === 'all'
      || (typeFilter === 'apartamente' && ['apartament','vila'].includes(p.type))
      || (typeFilter === 'toka' && ['are','troje'].includes(p.type))
      || (typeFilter === 'dyqane' && p.type === 'dyqan')
      || (typeFilter === 'njesi' && p.type === 'njesi_biznesi')
    const matchStatus = statusFilter === 'all' || p.status === statusFilter
    return matchSearch && matchType && matchStatus
  })

  const price = (p: Property) => {
    if (p.monthly_rent_eur) return `€${p.monthly_rent_eur.toLocaleString()}/muaj`
    if (p.price_eur) return `€${p.price_eur.toLocaleString()}`
    if (p.price_lek_m2) return `${p.price_lek_m2.toLocaleString()} L/m²`
    return '—'
  }

  return (
    <div className="flex gap-10">
      {/* Sidebar filters */}
      <aside className="hidden lg:block w-52 flex-shrink-0">
        <div className="sticky top-24 space-y-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--outline)' }}>Lloji</p>
            <div className="space-y-0.5">
              {TYPE_FILTERS.map(f => (
                <button key={f.value} onClick={() => setTypeFilter(f.value)}
                  className="w-full text-left px-3 py-2.5 rounded-lg text-sm transition-all"
                  style={{
                    background: typeFilter === f.value ? 'var(--surface-container)' : 'transparent',
                    color: typeFilter === f.value ? 'var(--primary)' : 'var(--on-surface-variant)',
                    fontWeight: typeFilter === f.value ? '600' : '400',
                  }}>
                  {f.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--outline)' }}>Statusi</p>
            <div className="space-y-0.5">
              {STATUS_FILTERS.map(f => (
                <button key={f.value} onClick={() => setStatusFilter(f.value)}
                  className="w-full text-left px-3 py-2.5 rounded-lg text-sm transition-all"
                  style={{
                    background: statusFilter === f.value ? 'var(--surface-container)' : 'transparent',
                    color: statusFilter === f.value ? 'var(--primary)' : 'var(--on-surface-variant)',
                    fontWeight: statusFilter === f.value ? '600' : '400',
                  }}>
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 min-w-0">
        {/* Header row */}
        <div className="flex items-start justify-between mb-6 gap-4 flex-wrap">
          <div>
            <h1 className="font-display text-3xl font-bold" style={{ color: 'var(--on-surface)' }}>Pronat</h1>
            <p className="text-sm mt-1" style={{ color: 'var(--on-surface-variant)' }}>{filtered.length} prona</p>
          </div>
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--outline)' }} />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Kërko pronë..."
              className="pl-9 pr-4 py-2.5 rounded-xl text-sm outline-none w-60"
              style={{ background: 'var(--surface-lowest)', border: '1px solid var(--outline-variant)' }}
              onFocus={e => e.target.style.border = '1px solid var(--primary)'}
              onBlur={e => e.target.style.border = '1px solid var(--outline-variant)'} />
          </div>
        </div>

        {/* Mobile filters */}
        <div className="lg:hidden flex gap-2 overflow-x-auto pb-3 mb-4">
          {TYPE_FILTERS.map(f => (
            <button key={f.value} onClick={() => setTypeFilter(f.value)}
              className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-all"
              style={{
                background: typeFilter === f.value ? 'var(--primary)' : 'var(--surface-lowest)',
                color: typeFilter === f.value ? 'white' : 'var(--on-surface-variant)',
                borderColor: typeFilter === f.value ? 'var(--primary)' : 'var(--outline-variant)',
              }}>
              {f.label}
            </button>
          ))}
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="rounded-xl overflow-hidden animate-pulse" style={{ background: 'var(--surface-lowest)' }}>
                <div className="aspect-video" style={{ background: 'var(--surface-container)' }} />
                <div className="p-6 space-y-2">
                  <div className="h-5 rounded" style={{ background: 'var(--surface-container)', width: '60%' }} />
                  <div className="h-3 rounded" style={{ background: 'var(--surface-container)', width: '40%' }} />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-lg font-semibold mb-1" style={{ color: 'var(--on-surface)' }}>Nuk u gjetën prona</p>
            <p className="text-sm" style={{ color: 'var(--on-surface-variant)' }}>Ndryshoni filtrat ose shtoni pronë të re</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {filtered.map(p => {
              const s = STATUS[p.status]
              const img = p.images?.[0]
              return (
                <Link key={p.id} href={`/properties/${p.id}`}
                  className="property-shadow rounded-xl overflow-hidden block group cursor-pointer border border-transparent hover:border-outline-variant transition-all duration-200"
                  style={{ background: 'var(--surface-lowest)' }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--outline-variant)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'transparent'}>
                  {/* Image 16:9 */}
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
                    <span className="absolute top-3 left-3 text-xs px-2 py-1 rounded font-semibold"
                      style={{ background: 'rgba(255,255,255,0.92)', color: 'var(--on-surface-variant)' }}>
                      {TYPE_LABELS[p.type]}
                    </span>
                    <span className="absolute top-3 right-3 text-xs px-2 py-1 rounded font-semibold"
                      style={{ background: s.bg, color: s.color }}>
                      {s.label}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <p className="font-bold text-base mb-1 truncate" style={{ color: 'var(--on-surface)' }}>{price(p)}</p>
                    <p className="text-sm mb-4 truncate" style={{ color: 'var(--on-surface-variant)' }}>
                      {p.title}
                    </p>
                    <div className="flex items-center gap-1 text-xs mb-4" style={{ color: 'var(--on-surface-variant)' }}>
                      <MapPin size={12} />{p.city}{p.neighborhood ? `, ${p.neighborhood}` : ''}
                    </div>
                    {/* Feature row */}
                    <div className="flex justify-between border-t pt-4 text-xs" style={{ borderColor: 'var(--outline-variant)', color: 'var(--on-surface-variant)' }}>
                      {p.rooms && <span className="flex items-center gap-1">🛏 {p.rooms}</span>}
                      {p.bathrooms && <span className="flex items-center gap-1">🚿 {p.bathrooms}</span>}
                      {p.size_m2 && <span className="flex items-center gap-1"><Maximize2 size={11} /> {p.size_m2} m²</span>}
                      {!p.rooms && !p.bathrooms && !p.size_m2 && <span style={{ color: 'var(--outline)' }}>—</span>}
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
