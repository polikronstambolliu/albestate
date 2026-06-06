import { createBrowserClient } from '@supabase/ssr'

export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export type PropertyType = 'apartament' | 'vila' | 'dyqan' | 'are' | 'troje' | 'njesi_biznesi'
export type ListingType = 'shitje' | 'qira'
export type PropertyStatus = 'available' | 'rented' | 'sold'

export interface Property {
  id: string
  agent_id: string | null
  title: string
  type: PropertyType
  listing: ListingType
  status: PropertyStatus
  address: string | null
  city: string
  neighborhood: string | null
  size_m2: number | null
  rooms: string | null
  bathrooms: number | null
  floor: number | null
  price_eur: number | null
  price_lek_m2: number | null
  monthly_rent_eur: number | null
  has_certificate: boolean
  description: string | null
  features: string[] | null
  images: string[] | null
  lat: number | null
  lng: number | null
  created_at: string
  updated_at: string
}
