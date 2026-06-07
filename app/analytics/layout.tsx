import AuthGuard from '@/components/AuthGuard'
import Topbar from '@/components/Topbar'

export default function AnalyticsLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <Topbar />
      <main className="max-w-7xl mx-auto px-6 py-8">{children}</main>
    </AuthGuard>
  )
}
