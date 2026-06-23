import { Package, LayoutDashboard, Tag, ShoppingCart, Users, Settings, ChevronLeft, Menu, X, TrendingUp } from 'lucide-react'
import { NavLink, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { useUIStore } from '@/store'
import { ROUTES } from '@/constants'
import { Button } from '@/components/ui/Button'

const navItems = [
  { path: ROUTES.DASHBOARD, label: 'Dashboard', icon: LayoutDashboard },
  { path: ROUTES.PRODUCTS, label: 'Products', icon: Package },
  { path: ROUTES.BRANDS, label: 'Brands', icon: Tag },
  { path: ROUTES.ORDERS, label: 'Orders', icon: ShoppingCart },
  { path: ROUTES.USERS, label: 'Users', icon: Users },
]

const bottomItems = [
  { path: ROUTES.SETTINGS, label: 'Settings', icon: Settings },
]

export function Sidebar() {
  const { sidebarOpen, setSidebarOpen, toggleSidebar } = useUIStore()
  const location = useLocation()

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-slate-950/80 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-40 h-full flex flex-col border-r border-slate-800 bg-slate-950 sidebar-transition',
          sidebarOpen ? 'w-64' : 'w-16',
          'lg:translate-x-0',
          !sidebarOpen && '-translate-x-full lg:translate-x-0',
        )}
        aria-label="Main navigation"
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-slate-800">
          {sidebarOpen ? (
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/20 border border-indigo-500/30">
                <TrendingUp className="h-4 w-4 text-indigo-400" />
              </div>
              <span className="text-sm font-bold text-slate-100 tracking-tight">StockManager</span>
            </div>
          ) : (
            <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/20 border border-indigo-500/30">
              <TrendingUp className="h-4 w-4 text-indigo-400" />
            </div>
          )}
          {sidebarOpen && (
            <button
              onClick={toggleSidebar}
              className="rounded-lg p-1.5 text-slate-500 hover:text-slate-100 hover:bg-slate-800 transition-colors lg:flex hidden"
              aria-label="Collapse sidebar"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Nav items */}
        <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
          {navItems.map(({ path, label, icon: Icon }) => {
            const isActive = path === ROUTES.DASHBOARD
              ? location.pathname === path
              : location.pathname.startsWith(path)
            return (
              <NavLink
                key={path}
                to={path}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all duration-150',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500',
                  isActive
                    ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                    : 'text-slate-500 hover:text-slate-100 hover:bg-slate-800/60',
                  !sidebarOpen && 'justify-center px-2',
                )}
                title={!sidebarOpen ? label : undefined}
              >
                <Icon className={cn('flex-shrink-0', isActive ? 'h-4 w-4' : 'h-4 w-4')} />
                {sidebarOpen && <span className="truncate">{label}</span>}
                {sidebarOpen && isActive && (
                  <span className="ml-auto h-1.5 w-1.5 rounded-full bg-indigo-400" />
                )}
              </NavLink>
            )
          })}
        </nav>

        {/* Bottom items */}
        <div className="border-t border-slate-800 py-4 px-2 space-y-1">
          {bottomItems.map(({ path, label, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all duration-150',
                  isActive
                    ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                    : 'text-slate-500 hover:text-slate-100 hover:bg-slate-800/60',
                  !sidebarOpen && 'justify-center px-2',
                )
              }
              title={!sidebarOpen ? label : undefined}
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
              {sidebarOpen && <span>{label}</span>}
            </NavLink>
          ))}

          {/* Expand button when collapsed */}
          {!sidebarOpen && (
            <button
              onClick={toggleSidebar}
              className="flex w-full items-center justify-center rounded-lg p-2.5 text-slate-500 hover:text-slate-100 hover:bg-slate-800 transition-colors"
              aria-label="Expand sidebar"
            >
              <Menu className="h-4 w-4" />
            </button>
          )}
        </div>
      </aside>
    </>
  )
}
