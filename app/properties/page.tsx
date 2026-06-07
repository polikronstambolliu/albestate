'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase, Property } from '@/lib/supabase'
import { Search, MapPin, Maximize2, BedDouble, Bath } from 'lucide-react'

const TYPE_LABELS: Record<string, string> = {
  apartament: 'Apartament', vila: 'Vilë', dyqan: 'Dyqan',
  are: 'Arë', troje: 'Troje', njesi_biznesi: 'Njësi Biznesi'
}
const STATUS_STYLES: Record<string, { bg: string; color: string; label: string }> = {
  available: { bg: '#f0fdf4', color: '#16a34a', label: 'E lirë' },
  rented: { bg: '#fef9c3', color: '#ca8a04', label: 'Me qira' },
  sold: { bg: '#fef2f2', color: '#dc2626', label: 'E shitur' },
}

const FILTERS = [
  { label: 'Të gjitha', value: 'all' },
  { label: 'Apartamente', value: 'apartamente' },
  { label: 'Toka/Arë', value: 'toka' },
  { label: 'Dyqane', value: 'dyqane' },
  { label: 'Njësi biznesi', value: 'njesi' },
]

export default function PropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([])
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('properties').select('*').order('created_at', { ascending: false })
      .then(({ data }) => { setProperties(data || []); setLoading(false) })
  }, [])

  const filtered = properties.filter(p => {
    const matchSearch = p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.city.toLowerCase().includes(search.toLowerCase()) ||
      (p.neighborhood || '').toLowerCase().includes(search.toLowerCase())
    const matchType = filter === 'all' ||
      (filter === 'apartamente' && ['apartament', 'vila'].includes(p.type)) ||
      (filter === 'toka' && ['are', 'troje'].includes(p.type)) ||
      (filter === 'dyqane' && p.type === 'dyqan') ||
      (filter === 'njesi' && p.type === 'njesi_biznesi')
    const matchStatus = statusFilter === 'all' || p.status === statusFilter
    return matchSearch && matchType && matchStatus
  })

  const formatPrice = (p: Property) => {
    if (p.monthly_rent_eur) return `€${p.monthly_rent_eur.toLocaleString()}/muaj`
    if (p.price_eur) return `€${p.price_eur.toLocaleString()}`
    if (p.price_lek_m2) return `${p.price_lek_m2.toLocaleString()} L/m²`
    return '—'
  }

  return (
    <div className="flex gap-8">
      {/* Sidebar filters */}
      <aside className="hidden lg:block w-56 flex-shrink-0">
        <div className="sticky top-24 space-y-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-light)' }}>Lloji</p>
            <div className="space-y-1">
              {FILTERS.map(f => (
                <button key={f.value} onClick={() => setFilter(f.value)}
                  className="w-full text-left px-3 py-2 rounded-lg text-sm transition-all"
                  style={{
                    background: filter === f.value ? 'var(--cream-dark)' : 'transparent',
                    color: filter === f.value ? 'var(--burgundy)' : 'var(--text-muted)',
                    fontWeight: filter === f.value ? '600' : '400',
                  }}>
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-light)' }}>Statusi</p>
            <div className="space-y-1">
              {[
                { label: 'Të gjitha', value: 'all' },
                { label: 'Të lira', value: 'available' },
                { label: 'Me qira', value: 'rented' },
                { label: 'Të shitura', value: 'sold' },
              ].map(s => (
                <button key={s.value} onClick={() => setStatusFilter(s.value)}
                  className="w-full text-left px-3 py-2 rounded-lg text-sm transition-all"
                  style={{
                    background: statusFilter === s.value ? 'var(--cream-dark)' : 'transparent',
                    color: statusFilter === s.value ? 'var(--burgundy)' : 'var(--text-muted)',
                    fontWeight: statusFilter === s.value ? '600' : '400',
                  }}>
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 min-w-0">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display text-2xl font-bold" style={{ color: 'var(--maroon)' }}>Pronat</h1>
            <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>{filtered.length} prona</p>
          </div>
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-light)' }} />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Kërko..."
              className="pl-9 pr-4 py-2 rounded-xl border text-sm outline-none w-56"
              style={{ borderColor: 'var(--cream-dark)', background: 'white' }}
              onFocus={e => e.target.style.borderColor = 'var(--mauve)'}
              onBlur={e => e.target.style.borderColor = 'var(--cream-dark)'} />
          </div>
        </div>

        {/* Mobile filters */}
        <div className="lg:hidden flex gap-2 overflow-x-auto pb-2 mb-4">
          {FILTERS.map(f => (
            <button key={f.value} onClick={() => setFilter(f.value)}
              className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-all"
              style={{
                background: filter === f.value ? 'var(--burgundy)' : 'white',
                color: filter === f.value ? 'white' : 'var(--text-muted)',
                borderColor: filter === f.value ? 'var(--burgundy)' : 'var(--cream-dark)',
              }}>
              {f.label}
            </button>
          ))}
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="rounded-2xl overflow-hidden border animate-pulse" style={{ background: 'white', borderColor: 'var(--cream-dark)' }}>
                <div className="h-48" style={{ background: 'var(--cream-dark)' }} />
                <div className="p-4 space-y-2">
                  <div className="h-4 rounded" style={{ background: 'var(--cream-dark)', width: '70%' }} />
                  <div className="h-3 rounded" style={{ background: 'var(--cream-dark)', width: '50%' }} />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="font-display text-xl mb-2" style={{ color: 'var(--maroon)' }}>Nuk u gjetën prona</p>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Ndryshoni filtrat ose shtoni një pronë të re</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map(p => {
              const s = STATUS_STYLES[p.status]
              const img = p.images?.[0]
              return (
                <Link key={p.id} href={`/properties/${p.id}`}
                  className="rounded-2xl overflow-hidden border block transition-all duration-200 group"
                  style={{ background: 'white', borderColor: 'var(--cream-dark)', boxShadow: '0 2px 12px var(--shadow)' }}
                  onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 8px 30px var(--shadow-hover)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
                  onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 2px 12px var(--shadow)'; e.currentTarget.style.transform = 'translateY(0)' }}>
                  {/* Image */}
                  <div className="relative overflow-hidden" style={{ height: '190px', background: 'var(--cream-dark)' }}>
                    {img ? (
                      <img src={img} alt={p.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                          <path d="M3 12L12 3L21 12V21H15V15H9V21H3V12Z" fill="var(--mauve)" opacity="0.2" />
                        </svg>
                      </div>
                    )}
                    <span className="absolute top-3 left-3 text-xs px-2.5 py-1 rounded-full font-semibold"
                      style={{ background: s.bg, color: s.color }}>{s.label}</span>
                    <span className="absolute top-3 right-3 text-xs px-2.5 py-1 rounded-full font-semibold"
                      style={{ background: 'rgba(0,0,0,0.55)', color: 'white' }}>{TYPE_LABELS[p.type]}</span>
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <p className="font-semibold text-sm mb-1 truncate" style={{ color: 'var(--maroon)' }}>{p.title}</p>
                    <div className="flex items-center gap-1 mb-3">
                      <MapPin size={11} style={{ color: 'var(--text-light)' }} />
                      <span className="text-xs truncate" style={{ color: 'var(--text-light)' }}>
                        {p.city}{p.neighborhood ? `, ${p.neighborhood}` : ''}
                      </span>
                    </div>

                    {/* Features row */}
                    {(p.rooms || p.bathrooms || p.size_m2) && (
                      <div className="flex items-center gap-3 mb-3 text-xs" style={{ color: 'var(--text-muted)' }}>
                        {p.rooms && <span className="flex items-center gap-1"><BedDouble size={12} />{p.rooms}</span>}
                        {p.bathrooms && <span className="flex items-center gap-1"><Bath size={12} />{p.bathrooms}</span>}
                        {p.size_m2 && <span className="flex items-center gap-1"><Maximize2 size={12} />{p.size_m2} m²</span>}
                      </div>
                    )}

                    <div className="pt-3 border-t" style={{ borderColor: 'var(--cream-dark)' }}>
                      <span className="font-display font-bold text-lg" style={{ color: 'var(--burgundy)' }}>{formatPrice(p)}</span>
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
