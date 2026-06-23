import { Menu, Bell, RefreshCw } from 'lucide-react'
import { useLocation } from 'react-router-dom'
import { useUIStore } from '@/store'
import { Button } from '@/components/ui/Button'
import { useQueryClient } from '@tanstack/react-query'

const pageTitles: Record<string, { title: string; description: string }> = {
  '/': { title: 'Dashboard', description: 'Overview of your inventory' },
  '/products': { title: 'Products', description: 'Manage your product catalog' },
  '/brands': { title: 'Brands', description: 'Manage brand information' },
  '/orders': { title: 'Orders', description: 'Stock movements and transactions' },
  '/users': { title: 'Users', description: 'Manage users and customers' },
  '/settings': { title: 'Settings', description: 'Application configuration' },
}

export function Header() {
  const { toggleSidebar, sidebarOpen } = useUIStore()
  const location = useLocation()
  const queryClient = useQueryClient()

  const basePath = '/' + location.pathname.split('/')[1]
  const pageInfo = pageTitles[basePath] || pageTitles['/']

  const handleRefresh = () => {
    queryClient.invalidateQueries()
  }

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-4 border-b border-slate-800 bg-slate-950/90 backdrop-blur-md px-4 lg:px-6">
      {/* Mobile menu + toggle */}
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleSidebar}
        aria-label="Toggle sidebar"
        className="text-slate-400"
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Page title */}
      <div className="flex-1 min-w-0">
        <h1 className="text-base font-semibold text-slate-100 truncate">{pageInfo.title}</h1>
        <p className="text-xs text-slate-500 hidden sm:block truncate">{pageInfo.description}</p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleRefresh}
          aria-label="Refresh data"
          className="text-slate-400 hover:text-slate-100"
          title="Refresh all data"
        >
          <RefreshCw className="h-4 w-4" />
        </Button>

        {/* Notification bell */}
        <Button
          variant="ghost"
          size="icon"
          className="text-slate-400 hover:text-slate-100 relative"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-indigo-500" aria-hidden="true" />
        </Button>

        {/* Avatar */}
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-500/20 border border-indigo-500/30 text-xs font-medium text-indigo-400 select-none">
          SM
        </div>
      </div>
    </header>
  )
}
