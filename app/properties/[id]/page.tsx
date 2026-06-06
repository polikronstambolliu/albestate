'use client'
import { useEffect, useState, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase, Property } from '@/lib/supabase'
import { ArrowLeft, MapPin, Maximize2, Trash2, Upload, X } from 'lucide-react'
import Link from 'next/link'

const STATUS_OPTIONS = [
  { value: 'available', label: 'E lirë', color: '#16a34a', bg: '#f0fdf4' },
  { value: 'rented', label: 'Me qira', color: '#ca8a04', bg: '#fef9c3' },
  { value: 'sold', label: 'E shitur', color: '#dc2626', bg: '#fef2f2' },
]

export default function PropertyDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [property, setProperty] = useState<Property | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [activeImg, setActiveImg] = useState(0)

  useEffect(() => {
    supabase.from('properties').select('*').eq('id', id).single()
      .then(({ data }) => { setProperty(data); setLoading(false) })
  }, [id])

  const updateStatus = async (status: string) => {
    if (!property) return
    setSaving(true)
    await supabase.from('properties').update({ status }).eq('id', id)
    setProperty({ ...property, status: status as Property['status'] })
    setSaving(false)
  }

  const handleDelete = async () => {
    if (!confirm('Jeni të sigurt që dëshironi të fshini këtë pronë?')) return
    await supabase.from('properties').delete().eq('id', id)
    router.push('/properties')
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!property) return
    const files = Array.from(e.target.files || [])
    if (!files.length) return
    setUploading(true)
    const urls: string[] = [...(property.images || [])]
    for (const file of files) {
      const ext = file.name.split('.').pop()
      const path = `properties/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
      const { error } = await supabase.storage.from('property-images').upload(path, file)
      if (!error) {
        const { data } = supabase.storage.from('property-images').getPublicUrl(path)
        urls.push(data.publicUrl)
      }
    }
    await supabase.from('properties').update({ images: urls }).eq('id', id)
    setProperty({ ...property, images: urls })
    setUploading(false)
  }

  const removeImage = async (url: string) => {
    if (!property) return
    const updated = (property.images || []).filter(i => i !== url)
    await supabase.from('properties').update({ images: updated }).eq('id', id)
    setProperty({ ...property, images: updated })
    setActiveImg(0)
  }

  if (loading) return <div className="text-center py-20 text-sm" style={{ color: 'var(--text-muted)' }}>Duke ngarkuar...</div>
  if (!property) return <div className="text-center py-20 text-sm" style={{ color: 'var(--text-muted)' }}>Prona nuk u gjet.</div>

  const imgs = property.images || []
  const statusStyle = STATUS_OPTIONS.find(s => s.value === property.status)!
  const formatPrice = () => {
    if (property.monthly_rent_eur) return `€${property.monthly_rent_eur.toLocaleString()}/muaj`
    if (property.price_eur) return `€${property.price_eur.toLocaleString()}`
    if (property.price_lek_m2) return `${property.price_lek_m2.toLocaleString()} L/m²`
    return '—'
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link href="/properties" className="p-2 rounded-xl" style={{ background: 'white' }}>
            <ArrowLeft size={18} style={{ color: 'var(--maroon)' }} />
          </Link>
          <h1 className="font-display text-2xl font-bold" style={{ color: 'var(--maroon)' }}>{property.title}</h1>
        </div>
        <button onClick={handleDelete} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm transition-all"
          style={{ background: '#fef2f2', color: '#dc2626' }}>
          <Trash2 size={15} /> Fshi
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left: Images + Details */}
        <div className="lg:col-span-2 space-y-4">
          {/* Image gallery */}
          <div className="rounded-2xl overflow-hidden" style={{ background: 'white', boxShadow: '0 1px 3px rgba(92,26,46,0.08)' }}>
            <div className="h-64 relative" style={{ background: 'var(--cream-dark)' }}>
              {imgs.length > 0 ? (
                <img src={imgs[activeImg]} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center gap-3">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                    <path d="M3 12L12 3L21 12V21H15V15H9V21H3V12Z" fill="var(--mauve)" opacity="0.25" />
                  </svg>
                  <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Nuk ka foto</p>
                </div>
              )}
            </div>
            {imgs.length > 0 && (
              <div className="flex gap-2 p-3">
                {imgs.map((url, i) => (
                  <div key={i} className="relative group">
                    <img src={url} alt="" onClick={() => setActiveImg(i)}
                      className={`w-16 h-16 object-cover rounded-lg cursor-pointer border-2 transition-all ${i === activeImg ? 'border-burgundy' : 'border-transparent'}`}
                      style={{ borderColor: i === activeImg ? 'var(--burgundy)' : 'transparent' }} />
                    <button onClick={() => removeImage(url)}
                      className="absolute -top-1 -right-1 w-5 h-5 rounded-full items-center justify-center hidden group-hover:flex"
                      style={{ background: '#dc2626' }}>
                      <X size={10} color="white" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <div className="px-4 pb-4">
              <button onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm transition-all w-full justify-center border-2 border-dashed"
                style={{ borderColor: 'var(--mauve)', color: 'var(--mauve)', background: 'rgba(160,80,112,0.04)' }}>
                <Upload size={15} />
                {uploading ? 'Duke ngarkuar...' : 'Shto Foto'}
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} />
            </div>
          </div>

          {/* Description */}
          {property.description && (
            <div className="rounded-2xl p-5" style={{ background: 'white', boxShadow: '0 1px 3px rgba(92,26,46,0.08)' }}>
              <h3 className="font-display font-semibold mb-2" style={{ color: 'var(--maroon)' }}>Përshkrim</h3>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>{property.description}</p>
            </div>
          )}
        </div>

        {/* Right: Info card */}
        <div className="space-y-4">
          <div className="rounded-2xl p-5" style={{ background: 'white', boxShadow: '0 1px 3px rgba(92,26,46,0.08)' }}>
            <div className="flex items-center gap-2 mb-4">
              <MapPin size={14} style={{ color: 'var(--text-muted)' }} />
              <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
                {property.city}{property.neighborhood ? `, ${property.neighborhood}` : ''}
              </span>
            </div>
            <p className="font-display text-2xl font-bold mb-4" style={{ color: 'var(--burgundy)' }}>{formatPrice()}</p>
            <div className="grid grid-cols-2 gap-3 text-sm">
              {property.size_m2 && (
                <div className="rounded-xl p-3 text-center" style={{ background: 'var(--cream)' }}>
                  <p className="font-semibold" style={{ color: 'var(--maroon)' }}>{property.size_m2} m²</p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Sipërfaqe</p>
                </div>
              )}
              {property.rooms && (
                <div className="rounded-xl p-3 text-center" style={{ background: 'var(--cream)' }}>
                  <p className="font-semibold" style={{ color: 'var(--maroon)' }}>{property.rooms}</p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Dhoma</p>
                </div>
              )}
              {property.floor && (
                <div className="rounded-xl p-3 text-center" style={{ background: 'var(--cream)' }}>
                  <p className="font-semibold" style={{ color: 'var(--maroon)' }}>Kati {property.floor}</p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Kat</p>
                </div>
              )}
              {property.bathrooms && (
                <div className="rounded-xl p-3 text-center" style={{ background: 'var(--cream)' }}>
                  <p className="font-semibold" style={{ color: 'var(--maroon)' }}>{property.bathrooms}</p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Banja</p>
                </div>
              )}
            </div>
            {property.has_certificate && (
              <div className="mt-3 px-3 py-2 rounded-xl text-xs font-medium text-center" style={{ background: '#f0fdf4', color: '#16a34a' }}>
                ✓ Ka certifikatë pronësie
              </div>
            )}
          </div>

          {/* Status control */}
          <div className="rounded-2xl p-5" style={{ background: 'white', boxShadow: '0 1px 3px rgba(92,26,46,0.08)' }}>
            <h3 className="font-display font-semibold mb-3" style={{ color: 'var(--maroon)' }}>Statusi</h3>
            <div className="space-y-2">
              {STATUS_OPTIONS.map(s => (
                <button key={s.value} onClick={() => updateStatus(s.value)} disabled={saving}
                  className="w-full px-4 py-2.5 rounded-xl text-sm font-medium text-left transition-all border-2"
                  style={{
                    background: property.status === s.value ? s.bg : 'transparent',
                    color: s.color,
                    borderColor: property.status === s.value ? s.color : 'var(--cream-dark)',
                    opacity: saving ? 0.6 : 1
                  }}>
                  {property.status === s.value ? '● ' : '○ '}{s.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
