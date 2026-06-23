import { useQuery } from '@tanstack/react-query'
import { Package, DollarSign, TrendingUp, Clock, AlertTriangle } from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell, ResponsiveContainer, Legend,
} from 'recharts'
import { productService } from '@/services/product.service'
import { brandService } from '@/services/brand.service'
import { userService } from '@/services/user.service'
import { orderService } from '@/services/order.service'
import { QUERY_KEYS, LOW_STOCK_THRESHOLD } from '@/constants'
import { formatCurrency, formatDate } from '@/lib/utils'
import { KpiCard } from '@/components/dashboard/KpiCard'
import { KpiCardSkeleton, TableSkeleton } from '@/components/shared/Skeleton'
import { Badge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/shared/EmptyState'

const ORDER_STATUS_COLORS: Record<string, string> = {
  pending: '#f59e0b',
  executed: '#10b981',
  canceled: '#ef4444',
}

export default function DashboardPage() {
  const { data: products = [], isLoading: loadingProducts } = useQuery({
    queryKey: QUERY_KEYS.PRODUCTS,
    queryFn: productService.getAll,
  })

  const { data: brands = [], isLoading: loadingBrands } = useQuery({
    queryKey: QUERY_KEYS.BRANDS,
    queryFn: brandService.getAll,
  })

  const { data: users = [], isLoading: loadingUsers } = useQuery({
    queryKey: QUERY_KEYS.USERS,
    queryFn: userService.getAll,
  })

  const { data: orders = [], isLoading: loadingOrders } = useQuery({
    queryKey: QUERY_KEYS.ORDERS,
    queryFn: orderService.getAll,
  })

  const isLoading = loadingProducts || loadingBrands || loadingUsers || loadingOrders

  const totalStockValue = products.reduce((s, p) => s + p.price * p.quantity, 0)
  const lowStockProducts = products.filter((p) => p.quantity > 0 && p.quantity < LOW_STOCK_THRESHOLD)
  const outOfStock = products.filter((p) => p.quantity === 0)
  const pendingOrders = orders.filter((o) => o.status === 'pending')
  const executedOrders = orders.filter((o) => o.status === 'executed')
  const canceledOrders = orders.filter((o) => o.status === 'canceled')

  const pieData = [
    { name: 'Pending', value: pendingOrders.length },
    { name: 'Executed', value: executedOrders.length },
    { name: 'Canceled', value: canceledOrders.length },
  ].filter((d) => d.value > 0)

  const stockChartData = [...products]
    .sort((a, b) => b.price * b.quantity - a.price * a.quantity)
    .slice(0, 8)
    .map((p) => ({
      name: p.name.length > 12 ? p.name.slice(0, 12) + '…' : p.name,
      value: p.price * p.quantity,
      qty: p.quantity,
    }))

  const recentOrders = [...orders]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5)

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <KpiCardSkeleton key={i} />)}
        </div>
        <TableSkeleton rows={5} cols={4} />
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard
          title="Total Products"
          value={products.length}
          subtitle={`${outOfStock.length} out of stock`}
          icon={Package}
          iconColor="text-indigo-400"
          iconBg="bg-indigo-500/10 border-indigo-500/20"
        />
        <KpiCard
          title="Stock Value"
          value={formatCurrency(totalStockValue)}
          subtitle="Total inventory value"
          icon={DollarSign}
          iconColor="text-emerald-400"
          iconBg="bg-emerald-500/10 border-emerald-500/20"
        />
        <KpiCard
          title="Pending Orders"
          value={pendingOrders.length}
          subtitle={`of ${orders.length} total orders`}
          icon={Clock}
          iconColor="text-amber-400"
          iconBg="bg-amber-500/10 border-amber-500/20"
        />
        <KpiCard
          title="Brands & Users"
          value={`${brands.length} / ${users.length}`}
          subtitle="Brands / Users registered"
          icon={TrendingUp}
          iconColor="text-sky-400"
          iconBg="bg-sky-500/10 border-sky-500/20"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2 rounded-xl border border-slate-800 bg-slate-900/50 p-5">
          <div className="mb-4">
            <h2 className="text-sm font-semibold text-slate-100">Stock Value by Product</h2>
            <p className="text-xs text-slate-500">Top 8 products by inventory value</p>
          </div>
          {stockChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={stockChartData} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="stockGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 8, fontSize: 12 }}
                  labelStyle={{ color: '#94a3b8' }}
                />
                <Area type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={2} fill="url(#stockGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState title="No product data" description="Add products to see the chart." />
          )}
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5">
          <div className="mb-4">
            <h2 className="text-sm font-semibold text-slate-100">Orders by Status</h2>
            <p className="text-xs text-slate-500">{orders.length} total orders</p>
          </div>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
                  {pieData.map((entry) => (
                    <Cell key={entry.name} fill={ORDER_STATUS_COLORS[entry.name.toLowerCase()] ?? '#6366f1'} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 8, fontSize: 12 }} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, color: '#94a3b8' }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState title="No orders yet" description="Create orders to see status breakdown." />
          )}
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Recent orders */}
        <div className="xl:col-span-2 rounded-xl border border-slate-800 bg-slate-900/50 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-slate-100">Recent Orders</h2>
              <p className="text-xs text-slate-500">Latest 5 stock movements</p>
            </div>
          </div>
          {recentOrders.length > 0 ? (
            <div className="divide-y divide-slate-800">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center gap-3 px-5 py-3 table-row-hover">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-mono text-slate-400 truncate">{order.id.slice(0, 16)}...</p>
                    <p className="text-xs text-slate-600">{formatDate(order.created_at)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={order.type === 'buy' ? 'secondary' : 'purple'} className="text-xs">
                      {order.type === 'buy' ? 'Purchase' : 'Sale'}
                    </Badge>
                    <Badge
                      variant={
                        order.status === 'executed' ? 'success' :
                        order.status === 'canceled' ? 'error' : 'warning'
                      }
                      dot
                    >
                      {order.status}
                    </Badge>
                  </div>
                  <p className="text-sm font-semibold text-slate-100 tabular-nums">{formatCurrency(order.price)}</p>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState title="No orders yet" description="Create your first order to get started." />
          )}
        </div>

        {/* Alerts */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-slate-100">Stock Alerts</h2>
              <p className="text-xs text-slate-500">{lowStockProducts.length + outOfStock.length} items need attention</p>
            </div>
            <AlertTriangle className="h-4 w-4 text-amber-400" />
          </div>
          <div className="divide-y divide-slate-800 max-h-[280px] overflow-y-auto">
            {outOfStock.map((p) => (
              <div key={p.id} className="flex items-center gap-3 px-5 py-3">
                <div className="h-1.5 w-1.5 rounded-full bg-red-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-slate-200 truncate">{p.name}</p>
                  <p className="text-xs text-red-400">Out of stock</p>
                </div>
                <Badge variant="error">0</Badge>
              </div>
            ))}
            {lowStockProducts.map((p) => (
              <div key={p.id} className="flex items-center gap-3 px-5 py-3">
                <div className="h-1.5 w-1.5 rounded-full bg-amber-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-slate-200 truncate">{p.name}</p>
                  <p className="text-xs text-amber-400">Low stock</p>
                </div>
                <Badge variant="warning">{p.quantity}</Badge>
              </div>
            ))}
            {lowStockProducts.length === 0 && outOfStock.length === 0 && (
              <div className="px-5 py-8 text-center">
                <p className="text-xs text-slate-500">All products are well stocked 🎉</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
