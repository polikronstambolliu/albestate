'use client'
import { useEffect, useState, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase, Property } from '@/lib/supabase'
import { ArrowLeft, MapPin, Maximize2, BedDouble, Bath, Trash2, Upload, X, ChevronLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'

const STATUS_OPTIONS = [
  { value: 'available', label: 'E lirë', color: '#16a34a', bg: '#f0fdf4' },
  { value: 'rented', label: 'Me qira', color: '#ca8a04', bg: '#fef9c3' },
  { value: 'sold', label: 'E shitur', color: '#dc2626', bg: '#fef2f2' },
]

const TYPE_LABELS: Record<string, string> = {
  apartament: 'Apartament', vila: 'Vilë', dyqan: 'Dyqan',
  are: 'Arë', troje: 'Troje', njesi_biznesi: 'Njësi Biznesi'
}

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
    if (activeImg >= updated.length) setActiveImg(Math.max(0, updated.length - 1))
  }

  if (loading) return (
    <div className="flex items-center justify-center py-32">
      <div className="w-10 h-10 rounded-full border-4 border-t-transparent animate-spin" style={{ borderColor: 'var(--mauve)', borderTopColor: 'transparent' }} />
    </div>
  )
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
    <div>
      {/* Back */}
      <div className="flex items-center gap-3 mb-6">
        <Link href="/properties" className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-muted)' }}>
          <ArrowLeft size={16} /> Pronat
        </Link>
        <span style={{ color: 'var(--cream-dark)' }}>/</span>
        <span className="text-sm truncate" style={{ color: 'var(--maroon)' }}>{property.title}</span>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left: Gallery + Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Main gallery */}
          <div className="rounded-2xl overflow-hidden border" style={{ background: 'white', borderColor: 'var(--cream-dark)' }}>
            <div className="relative" style={{ height: '320px', background: 'var(--cream-dark)' }}>
              {imgs.length > 0 ? (
                <>
                  <img src={imgs[activeImg]} alt="" className="w-full h-full object-cover" />
                  {imgs.length > 1 && (
                    <>
                      <button onClick={() => setActiveImg(i => Math.max(0, i - 1))}
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full flex items-center justify-center transition-all"
                        style={{ background: 'rgba(0,0,0,0.5)', color: 'white' }}>
                        <ChevronLeft size={18} />
                      </button>
                      <button onClick={() => setActiveImg(i => Math.min(imgs.length - 1, i + 1))}
                        className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full flex items-center justify-center transition-all"
                        style={{ background: 'rgba(0,0,0,0.5)', color: 'white' }}>
                        <ChevronRight size={18} />
                      </button>
                      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                        {imgs.map((_, i) => (
                          <button key={i} onClick={() => setActiveImg(i)}
                            className="w-2 h-2 rounded-full transition-all"
                            style={{ background: i === activeImg ? 'white' : 'rgba(255,255,255,0.5)' }} />
                        ))}
                      </div>
                    </>
                  )}
                </>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                    <path d="M3 12L12 3L21 12V21H15V15H9V21H3V12Z" fill="var(--mauve)" opacity="0.2" />
                  </svg>
                  <p className="text-sm" style={{ color: 'var(--text-light)' }}>Nuk ka foto</p>
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {imgs.length > 0 && (
              <div className="flex gap-2 p-3 border-t overflow-x-auto" style={{ borderColor: 'var(--cream-dark)' }}>
                {imgs.map((url, i) => (
                  <div key={i} className="relative flex-shrink-0 group">
                    <img src={url} alt="" onClick={() => setActiveImg(i)}
                      className="w-16 h-16 object-cover rounded-xl cursor-pointer border-2 transition-all"
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

            {/* Upload btn */}
            <div className="p-3 border-t" style={{ borderColor: 'var(--cream-dark)' }}>
              <button onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 w-full justify-center px-4 py-2.5 rounded-xl text-sm border-2 border-dashed transition-all"
                style={{ borderColor: 'var(--mauve)', color: 'var(--mauve)', background: 'rgba(160,80,112,0.04)' }}>
                <Upload size={15} />
                {uploading ? 'Duke ngarkuar...' : 'Shto Foto'}
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} />
            </div>
          </div>

          {/* Description */}
          {property.description && (
            <div className="rounded-2xl p-6 border" style={{ background: 'white', borderColor: 'var(--cream-dark)' }}>
              <h3 className="font-display font-semibold mb-3" style={{ color: 'var(--maroon)' }}>Përshkrim</h3>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>{property.description}</p>
            </div>
          )}
        </div>

        {/* Right: Info */}
        <div className="space-y-4">
          {/* Main info card */}
          <div className="rounded-2xl p-6 border" style={{ background: 'white', borderColor: 'var(--cream-dark)' }}>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs px-2.5 py-1 rounded-full font-semibold" style={{ background: statusStyle.bg, color: statusStyle.color }}>
                {statusStyle.label}
              </span>
              <span className="text-xs px-2.5 py-1 rounded-full font-semibold" style={{ background: 'var(--cream)', color: 'var(--text-muted)' }}>
                {TYPE_LABELS[property.type]}
              </span>
            </div>
            <h1 className="font-display text-xl font-bold mb-2" style={{ color: 'var(--maroon)' }}>{property.title}</h1>
            <div className="flex items-center gap-1 mb-4">
              <MapPin size={13} style={{ color: 'var(--text-light)' }} />
              <span className="text-sm" style={{ color: 'var(--text-light)' }}>
                {property.city}{property.neighborhood ? `, ${property.neighborhood}` : ''}
              </span>
            </div>
            <p className="font-display text-3xl font-bold mb-4" style={{ color: 'var(--burgundy)' }}>{formatPrice()}</p>

            {/* Features */}
            <div className="grid grid-cols-2 gap-2">
              {property.size_m2 && (
                <div className="flex items-center gap-2 p-3 rounded-xl" style={{ background: 'var(--cream)' }}>
                  <Maximize2 size={14} style={{ color: 'var(--mauve)' }} />
                  <div>
                    <p className="text-xs font-semibold" style={{ color: 'var(--maroon)' }}>{property.size_m2} m²</p>
                    <p className="text-xs" style={{ color: 'var(--text-light)' }}>Sipërfaqe</p>
                  </div>
                </div>
              )}
              {property.rooms && (
                <div className="flex items-center gap-2 p-3 rounded-xl" style={{ background: 'var(--cream)' }}>
                  <BedDouble size={14} style={{ color: 'var(--mauve)' }} />
                  <div>
                    <p className="text-xs font-semibold" style={{ color: 'var(--maroon)' }}>{property.rooms}</p>
                    <p className="text-xs" style={{ color: 'var(--text-light)' }}>Dhoma</p>
                  </div>
                </div>
              )}
              {property.floor && (
                <div className="flex items-center gap-2 p-3 rounded-xl" style={{ background: 'var(--cream)' }}>
                  <span style={{ color: 'var(--mauve)', fontSize: 14 }}>🏢</span>
                  <div>
                    <p className="text-xs font-semibold" style={{ color: 'var(--maroon)' }}>Kati {property.floor}</p>
                    <p className="text-xs" style={{ color: 'var(--text-light)' }}>Kat</p>
                  </div>
                </div>
              )}
              {property.bathrooms && (
                <div className="flex items-center gap-2 p-3 rounded-xl" style={{ background: 'var(--cream)' }}>
                  <Bath size={14} style={{ color: 'var(--mauve)' }} />
                  <div>
                    <p className="text-xs font-semibold" style={{ color: 'var(--maroon)' }}>{property.bathrooms}</p>
                    <p className="text-xs" style={{ color: 'var(--text-light)' }}>Banja</p>
                  </div>
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
          <div className="rounded-2xl p-5 border" style={{ background: 'white', borderColor: 'var(--cream-dark)' }}>
            <h3 className="font-display font-semibold mb-3 text-sm" style={{ color: 'var(--maroon)' }}>Ndrysho Statusin</h3>
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

          {/* Delete */}
          <button onClick={handleDelete}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition-all"
            style={{ borderColor: '#fecaca', color: '#dc2626', background: '#fef2f2' }}>
            <Trash2 size={15} /> Fshi Pronën
          </button>
        </div>
      </div>
    </div>
  )
}
