'use client'
import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Upload, X, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function NewPropertyPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [images, setImages] = useState<string[]>([])
  const [form, setForm] = useState({
    title: '', type: 'apartament', listing: 'shitje', status: 'available',
    city: 'Lushnjë', neighborhood: '', address: '', size_m2: '',
    rooms: '', bathrooms: '', floor: '', price_eur: '', price_lek_m2: '',
    monthly_rent_eur: '', has_certificate: false, description: ''
  })

  const set = (k: string, v: string | boolean) => setForm(f => ({ ...f, [k]: v }))
  const isRent = form.listing === 'qira'
  const isLand = ['are', 'troje'].includes(form.type)

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (!files.length) return
    setUploading(true)
    const urls: string[] = []
    for (const file of files) {
      const ext = file.name.split('.').pop()
      const path = `properties/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
      const { error } = await supabase.storage.from('property-images').upload(path, file)
      if (!error) {
        const { data } = supabase.storage.from('property-images').getPublicUrl(path)
        urls.push(data.publicUrl)
      }
    }
    setImages(prev => [...prev, ...urls])
    setUploading(false)
  }

  const removeImage = (url: string) => setImages(prev => prev.filter(i => i !== url))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.from('properties').insert({
      title: form.title,
      type: form.type,
      listing: form.listing,
      status: form.status,
      city: form.city,
      neighborhood: form.neighborhood || null,
      address: form.address || null,
      size_m2: form.size_m2 ? parseFloat(form.size_m2) : null,
      rooms: form.rooms || null,
      bathrooms: form.bathrooms ? parseInt(form.bathrooms) : null,
      floor: form.floor ? parseInt(form.floor) : null,
      price_eur: form.price_eur ? parseFloat(form.price_eur) : null,
      price_lek_m2: form.price_lek_m2 ? parseFloat(form.price_lek_m2) : null,
      monthly_rent_eur: form.monthly_rent_eur ? parseFloat(form.monthly_rent_eur) : null,
      has_certificate: form.has_certificate,
      description: form.description || null,
      images: images.length > 0 ? images : null,
    })
    if (!error) router.push('/properties')
    else { alert('Gabim: ' + error.message); setLoading(false) }
  }

  const inp = "w-full px-4 py-2.5 rounded-xl border text-sm outline-none"
  const inpStyle = { borderColor: 'var(--cream-dark)', background: 'white' }
  const label = "block text-sm font-medium mb-1.5"

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/properties" className="p-2 rounded-xl transition-colors"
          style={{ background: 'white' }}>
          <ArrowLeft size={18} style={{ color: 'var(--maroon)' }} />
        </Link>
        <div>
          <h1 className="font-display text-2xl font-bold" style={{ color: 'var(--maroon)' }}>Shto Pronë</h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Regjistro pronë të re</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic info */}
        <div className="rounded-2xl p-6 space-y-4" style={{ background: 'white', boxShadow: '0 1px 3px rgba(92,26,46,0.08)' }}>
          <h2 className="font-display font-semibold" style={{ color: 'var(--maroon)' }}>Informacion Bazë</h2>
          <div>
            <label className={label} style={{ color: 'var(--maroon)' }}>Titulli *</label>
            <input className={inp} style={inpStyle} value={form.title} onChange={e => set('title', e.target.value)} required placeholder="p.sh. Apartament 2+1 në qendër" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={label} style={{ color: 'var(--maroon)' }}>Lloji</label>
              <select className={inp} style={inpStyle} value={form.type} onChange={e => set('type', e.target.value)}>
                <option value="apartament">Apartament</option>
                <option value="vila">Vilë</option>
                <option value="dyqan">Dyqan</option>
                <option value="are">Arë</option>
                <option value="troje">Troje</option>
                <option value="njesi_biznesi">Njësi Biznesi</option>
              </select>
            </div>
            <div>
              <label className={label} style={{ color: 'var(--maroon)' }}>Lloji i Listimit</label>
              <select className={inp} style={inpStyle} value={form.listing} onChange={e => set('listing', e.target.value)}>
                <option value="shitje">Shitje</option>
                <option value="qira">Qira</option>
              </select>
            </div>
          </div>
          <div>
            <label className={label} style={{ color: 'var(--maroon)' }}>Statusi</label>
            <select className={inp} style={inpStyle} value={form.status} onChange={e => set('status', e.target.value)}>
              <option value="available">E lirë</option>
              <option value="rented">Me qira</option>
              <option value="sold">E shitur</option>
            </select>
          </div>
        </div>

        {/* Location */}
        <div className="rounded-2xl p-6 space-y-4" style={{ background: 'white', boxShadow: '0 1px 3px rgba(92,26,46,0.08)' }}>
          <h2 className="font-display font-semibold" style={{ color: 'var(--maroon)' }}>Vendndodhja</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={label} style={{ color: 'var(--maroon)' }}>Qyteti *</label>
              <input className={inp} style={inpStyle} value={form.city} onChange={e => set('city', e.target.value)} required />
            </div>
            <div>
              <label className={label} style={{ color: 'var(--maroon)' }}>Lagja</label>
              <input className={inp} style={inpStyle} value={form.neighborhood} onChange={e => set('neighborhood', e.target.value)} placeholder="Opsionale" />
            </div>
          </div>
          <div>
            <label className={label} style={{ color: 'var(--maroon)' }}>Adresa</label>
            <input className={inp} style={inpStyle} value={form.address} onChange={e => set('address', e.target.value)} placeholder="Opsionale" />
          </div>
        </div>

        {/* Details */}
        <div className="rounded-2xl p-6 space-y-4" style={{ background: 'white', boxShadow: '0 1px 3px rgba(92,26,46,0.08)' }}>
          <h2 className="font-display font-semibold" style={{ color: 'var(--maroon)' }}>Detaje</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={label} style={{ color: 'var(--maroon)' }}>Sipërfaqja (m²)</label>
              <input type="number" className={inp} style={inpStyle} value={form.size_m2} onChange={e => set('size_m2', e.target.value)} />
            </div>
            {!isLand && (
              <div>
                <label className={label} style={{ color: 'var(--maroon)' }}>Dhomat</label>
                <input className={inp} style={inpStyle} value={form.rooms} onChange={e => set('rooms', e.target.value)} placeholder="p.sh. 2+1" />
              </div>
            )}
            {!isLand && (
              <div>
                <label className={label} style={{ color: 'var(--maroon)' }}>Banjot</label>
                <input type="number" className={inp} style={inpStyle} value={form.bathrooms} onChange={e => set('bathrooms', e.target.value)} />
              </div>
            )}
            {!isLand && (
              <div>
                <label className={label} style={{ color: 'var(--maroon)' }}>Kati</label>
                <input type="number" className={inp} style={inpStyle} value={form.floor} onChange={e => set('floor', e.target.value)} />
              </div>
            )}
          </div>
        </div>

        {/* Price */}
        <div className="rounded-2xl p-6 space-y-4" style={{ background: 'white', boxShadow: '0 1px 3px rgba(92,26,46,0.08)' }}>
          <h2 className="font-display font-semibold" style={{ color: 'var(--maroon)' }}>Çmimi</h2>
          {isRent ? (
            <div>
              <label className={label} style={{ color: 'var(--maroon)' }}>Qira mujore (€)</label>
              <input type="number" className={inp} style={inpStyle} value={form.monthly_rent_eur} onChange={e => set('monthly_rent_eur', e.target.value)} />
            </div>
          ) : isLand ? (
            <div>
              <label className={label} style={{ color: 'var(--maroon)' }}>Çmimi (Lekë/m²)</label>
              <input type="number" className={inp} style={inpStyle} value={form.price_lek_m2} onChange={e => set('price_lek_m2', e.target.value)} />
            </div>
          ) : (
            <div>
              <label className={label} style={{ color: 'var(--maroon)' }}>Çmimi (€)</label>
              <input type="number" className={inp} style={inpStyle} value={form.price_eur} onChange={e => set('price_eur', e.target.value)} />
            </div>
          )}
          {isLand && (
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={form.has_certificate} onChange={e => set('has_certificate', e.target.checked)} className="w-4 h-4 rounded" />
              <span className="text-sm" style={{ color: 'var(--maroon)' }}>Ka certifikatë pronësie</span>
            </label>
          )}
        </div>

        {/* Images */}
        <div className="rounded-2xl p-6 space-y-4" style={{ background: 'white', boxShadow: '0 1px 3px rgba(92,26,46,0.08)' }}>
          <h2 className="font-display font-semibold" style={{ color: 'var(--maroon)' }}>Foto</h2>
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors"
            style={{ borderColor: 'var(--mauve)', background: 'rgba(160,80,112,0.04)' }}
          >
            <Upload size={24} className="mx-auto mb-2" style={{ color: 'var(--mauve)' }} />
            <p className="text-sm font-medium" style={{ color: 'var(--mauve)' }}>
              {uploading ? 'Duke ngarkuar...' : 'Kliko për të ngarkuar foto'}
            </p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>JPG, PNG, WEBP deri në 5MB</p>
            <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} />
          </div>
          {images.length > 0 && (
            <div className="grid grid-cols-3 gap-3">
              {images.map((url, i) => (
                <div key={i} className="relative rounded-xl overflow-hidden" style={{ height: '100px' }}>
                  <img src={url} alt="" className="w-full h-full object-cover" />
                  <button type="button" onClick={() => removeImage(url)}
                    className="absolute top-1 right-1 w-6 h-6 rounded-full flex items-center justify-center"
                    style={{ background: 'rgba(0,0,0,0.6)' }}>
                    <X size={12} color="white" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Description */}
        <div className="rounded-2xl p-6" style={{ background: 'white', boxShadow: '0 1px 3px rgba(92,26,46,0.08)' }}>
          <label className={label} style={{ color: 'var(--maroon)' }}>Përshkrim</label>
          <textarea rows={4} className={inp} style={inpStyle} value={form.description} onChange={e => set('description', e.target.value)} placeholder="Përshkruani pronën..." />
        </div>

        <button type="submit" disabled={loading}
          className="w-full py-3.5 rounded-xl font-semibold text-sm transition-all disabled:opacity-60"
          style={{ background: 'var(--burgundy)', color: 'var(--cream)' }}>
          {loading ? 'Duke ruajtur...' : 'Ruaj Pronën'}
        </button>
      </form>
    </div>
  )
}
