import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { useUIStore } from '@/store'
import { cn } from '@/lib/utils'
import { Toaster } from '@/components/ui/Toaster'

export function AppShell() {
  const { sidebarOpen } = useUIStore()

  return (
    <div className="min-h-screen bg-[#020617] flex">
      <Sidebar />

      {/* Main content area */}
      <div
        className={cn(
          'flex-1 flex flex-col min-w-0 transition-all duration-300',
          sidebarOpen ? 'lg:ml-64' : 'lg:ml-16',
        )}
      >
        <Header />

        <main className="flex-1 overflow-auto p-4 lg:p-6 animate-fade-in">
          <Outlet />
        </main>
      </div>

      <Toaster />
    </div>
  )
}
