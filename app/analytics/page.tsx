'use client'
import { useEffect, useState } from 'react'
import { supabase, Property } from '@/lib/supabase'

const TYPE_LABELS: Record<string, string> = {
  apartament: 'Apartament', vila: 'Vilë', dyqan: 'Dyqan',
  are: 'Arë', troje: 'Troje', njesi_biznesi: 'Njësi Biznesi'
}

export default function AnalyticsPage() {
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('properties').select('*')
      .then(({ data }) => { setProperties(data || []); setLoading(false) })
  }, [])

  const byType = Object.entries(
    properties.reduce((acc, p) => ({ ...acc, [p.type]: (acc[p.type] || 0) + 1 }), {} as Record<string, number>)
  ).sort((a, b) => b[1] - a[1])

  const byCity = Object.entries(
    properties.reduce((acc, p) => ({ ...acc, [p.city]: (acc[p.city] || 0) + 1 }), {} as Record<string, number>)
  ).sort((a, b) => b[1] - a[1])

  const byStatus = {
    available: properties.filter(p => p.status === 'available').length,
    rented: properties.filter(p => p.status === 'rented').length,
    sold: properties.filter(p => p.status === 'sold').length,
  }

  const max = Math.max(...byType.map(([, v]) => v), 1)

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold" style={{ color: 'var(--maroon)' }}>Analitikë</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Statistika të pronave</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* By type */}
        <div className="rounded-2xl p-6" style={{ background: 'white', boxShadow: '0 1px 3px rgba(92,26,46,0.08)' }}>
          <h2 className="font-display font-semibold mb-4" style={{ color: 'var(--maroon)' }}>Sipas Llojit</h2>
          {loading ? <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Duke ngarkuar...</p> : (
            <div className="space-y-3">
              {byType.map(([type, count]) => (
                <div key={type}>
                  <div className="flex justify-between text-sm mb-1">
                    <span style={{ color: 'var(--maroon)' }}>{TYPE_LABELS[type] || type}</span>
                    <span className="font-semibold" style={{ color: 'var(--burgundy)' }}>{count}</span>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--cream-dark)' }}>
                    <div className="h-full rounded-full transition-all" style={{ width: `${(count / max) * 100}%`, background: 'var(--burgundy)' }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* By status */}
        <div className="rounded-2xl p-6" style={{ background: 'white', boxShadow: '0 1px 3px rgba(92,26,46,0.08)' }}>
          <h2 className="font-display font-semibold mb-4" style={{ color: 'var(--maroon)' }}>Sipas Statusit</h2>
          <div className="space-y-4">
            {[
              { label: 'Të Lira', value: byStatus.available, color: '#16a34a', bg: '#f0fdf4' },
              { label: 'Me Qira', value: byStatus.rented, color: '#ca8a04', bg: '#fef9c3' },
              { label: 'Të Shitura', value: byStatus.sold, color: '#dc2626', bg: '#fef2f2' },
            ].map(({ label, value, color, bg }) => (
              <div key={label} className="flex items-center justify-between px-4 py-3 rounded-xl"
                style={{ background: bg }}>
                <span className="text-sm font-medium" style={{ color }}>{label}</span>
                <span className="font-display text-2xl font-bold" style={{ color }}>{loading ? '—' : value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* By city */}
        <div className="rounded-2xl p-6 md:col-span-2" style={{ background: 'white', boxShadow: '0 1px 3px rgba(92,26,46,0.08)' }}>
          <h2 className="font-display font-semibold mb-4" style={{ color: 'var(--maroon)' }}>Sipas Qytetit</h2>
          <div className="flex flex-wrap gap-3">
            {byCity.map(([city, count]) => (
              <div key={city} className="px-4 py-2 rounded-xl flex items-center gap-2" style={{ background: 'var(--cream)' }}>
                <span className="text-sm font-medium" style={{ color: 'var(--maroon)' }}>{city}</span>
                <span className="w-6 h-6 rounded-full text-xs flex items-center justify-center font-bold"
                  style={{ background: 'var(--burgundy)', color: 'var(--cream)' }}>{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
