import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'AlbEstate Agency',
  description: 'Agjenci Imobiliare — Lushnjë, Albania',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="sq">
      <body>{children}</body>
    </html>
  )
}
