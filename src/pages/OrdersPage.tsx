import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, ShoppingCart, Play, X, DollarSign, Package, User } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { orderService } from '@/services/order.service'
import { userService } from '@/services/user.service'
import { productService } from '@/services/product.service'
import { QUERY_KEYS } from '@/constants'
import { createOrderSchema, type CreateOrderFormData } from '@/lib/schemas'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { Order } from '@/types'
import { Button } from '@/components/ui/Button'
import { Input, Select } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/Dialog'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { SearchBar } from '@/components/shared/SearchBar'
import { EmptyState } from '@/components/shared/EmptyState'
import { TableSkeleton } from '@/components/shared/Skeleton'
import { useToast } from '@/components/ui/Toaster'
import { cn } from '@/lib/utils'

type StatusFilter = 'all' | 'pending' | 'executed' | 'canceled'

export default function OrdersPage() {
  const queryClient = useQueryClient()
  const toast = useToast()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [formOpen, setFormOpen] = useState(false)
  const [executeTarget, setExecuteTarget] = useState<Order | null>(null)
  const [cancelTarget, setCancelTarget] = useState<Order | null>(null)

  const { data: orders = [], isLoading } = useQuery({
    queryKey: QUERY_KEYS.ORDERS,
    queryFn: orderService.getAll,
  })

  const { data: users = [] } = useQuery({
    queryKey: QUERY_KEYS.USERS,
    queryFn: userService.getAll,
  })

  const { data: products = [] } = useQuery({
    queryKey: QUERY_KEYS.PRODUCTS,
    queryFn: productService.getAll,
  })

  const createMutation = useMutation({
    mutationFn: orderService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ORDERS })
      toast.success('Order created', 'New order is pending execution.')
      setFormOpen(false)
      reset()
    },
    onError: (e: any) => toast.error('Failed to create order', e.message),
  })

  const executeMutation = useMutation({
    mutationFn: orderService.execute,
    onSuccess: (order) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ORDERS })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PRODUCTS })
      toast.success('Order executed', `Stock ${order.type === 'buy' ? 'decremented' : 'incremented'} successfully.`)
      setExecuteTarget(null)
    },
    onError: (e: any) => toast.error('Failed to execute order', e.message),
  })

  const cancelMutation = useMutation({
    mutationFn: orderService.cancel,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ORDERS })
      toast.success('Order canceled')
      setCancelTarget(null)
    },
    onError: (e: any) => toast.error('Failed to cancel order', e.message),
  })

  const { register, handleSubmit, reset, formState: { errors } } = useForm<CreateOrderFormData>({
    resolver: zodResolver(createOrderSchema),
  })

  const onSubmit = (data: CreateOrderFormData) => {
    // Backend was fixed to use standard integer IDs instead of UUIDs.
    createMutation.mutate(data)
  }

  const getUserName = (id: string | number) => {
    const numericId = Number(id)
    return users.find((u) => u.id === numericId)?.name || String(id).slice(0, 8) + '...'
  }
  
  const getProductName = (id: string | number) => {
    const numericId = Number(id)
    return products.find((p) => p.id === numericId)?.name || String(id).slice(0, 8) + '...'
  }

  const filtered = orders
    .filter((o) => statusFilter === 'all' || o.status === statusFilter)
    .filter((o) => {
      const numericUserId = Number(o.user_id)
      const numericProductId = Number(o.product_id)
      const user = users.find(u => u.id === numericUserId)
      const product = products.find(p => p.id === numericProductId)
      
      return o.id.toLowerCase().includes(search.toLowerCase()) ||
             (user && user.name.toLowerCase().includes(search.toLowerCase())) ||
             (product && product.name.toLowerCase().includes(search.toLowerCase()))
    })

  const counts = {
    all: orders.length,
    pending: orders.filter((o) => o.status === 'pending').length,
    executed: orders.filter((o) => o.status === 'executed').length,
    canceled: orders.filter((o) => o.status === 'canceled').length,
  }

  const filterButtons: { label: string; value: StatusFilter; variant: string }[] = [
    { label: `All (${counts.all})`, value: 'all', variant: 'default' },
    { label: `Pending (${counts.pending})`, value: 'pending', variant: 'warning' },
    { label: `Executed (${counts.executed})`, value: 'executed', variant: 'success' },
    { label: `Canceled (${counts.canceled})`, value: 'canceled', variant: 'error' },
  ]

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <SearchBar value={search} onChange={setSearch} placeholder="Search by order ID, user, or product..." className="sm:w-80" />
        <Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => { reset(); setFormOpen(true) }} id="create-order-btn">
          New Order
        </Button>
      </div>

      {/* Status filter chips */}
      <div className="flex flex-wrap gap-2">
        {filterButtons.map(({ label, value }) => (
          <button
            key={value}
            onClick={() => setStatusFilter(value)}
            className={cn(
              'px-3 py-1.5 rounded-lg text-xs font-medium border transition-all duration-150',
              statusFilter === value
                ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
                : 'bg-slate-900/40 text-slate-500 border-slate-800 hover:text-slate-300 hover:border-slate-700',
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/40 overflow-hidden">
        {isLoading ? (
          <div className="p-4"><TableSkeleton rows={6} cols={6} /></div>
        ) : filtered.length === 0 ? (
          <EmptyState
            title="No orders found"
            description={search ? `No orders match "${search}"` : 'Create a new stock movement order.'}
            icon={<ShoppingCart className="h-7 w-7 text-slate-500" />}
            action={<Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => setFormOpen(true)}>New Order</Button>}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm" aria-label="Orders table">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/50">
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">Details</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">Type</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wide">Qty</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wide">Price</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">Created</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filtered.map((order) => (
                  <tr key={order.id} className="table-row-hover group">
                    <td className="px-4 py-3">
                      <p className="font-mono text-xs text-slate-300" title={`Order ID: ${order.id}`}>{order.id.slice(0, 8)}...</p>
                      <div className="flex flex-col mt-1 space-y-0.5">
                        <div className="flex items-center gap-1.5 text-xs text-slate-500" title={`User: ${getUserName(order.user_id)}`}>
                          <User className="h-3 w-3" />
                          <span className="truncate max-w-[120px]">{getUserName(order.user_id)}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-slate-500" title={`Product: ${getProductName(order.product_id)}`}>
                          <Package className="h-3 w-3" />
                          <span className="truncate max-w-[120px]">{getProductName(order.product_id)}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={order.type === 'buy' ? 'secondary' : 'purple'} dot>
                        {order.type === 'buy' ? 'Purchase' : 'Sale'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-slate-200">{order.quantity}</td>
                    <td className="px-4 py-3 text-right font-mono text-slate-200">{formatCurrency(order.price)}</td>
                    <td className="px-4 py-3">
                      <Badge
                        variant={
                          order.status === 'executed' ? 'success' :
                          order.status === 'canceled' ? 'error' : 'warning'
                        }
                        dot
                      >
                        {order.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500">{formatDate(order.created_at)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {order.status === 'pending' && (
                          <>
                            <Button
                              variant="success"
                              size="icon-sm"
                              onClick={() => setExecuteTarget(order)}
                              aria-label="Execute order"
                              title="Execute order"
                            >
                              <Play className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="danger"
                              size="icon-sm"
                              onClick={() => setCancelTarget(order)}
                              aria-label="Cancel order"
                              title="Cancel order"
                            >
                              <X className="h-3.5 w-3.5" />
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Order Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Order</DialogTitle>
            <DialogDescription>
              Create a new stock movement. <strong className="text-slate-300">Buy</strong> = stock in (decrements after execute). <strong className="text-slate-300">Sell</strong> = stock out (increments after execute).
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Select
              label="User"
              error={errors.user_id?.message}
              required
              {...register('user_id')}
            >
              <option value="">Select a user…</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
              ))}
            </Select>

            <Select
              label="Product"
              error={errors.product_id?.message}
              required
              {...register('product_id')}
            >
              <option value="">Select a product…</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>{p.name} (Stock: {p.quantity})</option>
              ))}
            </Select>

            <div className="grid grid-cols-3 gap-3">
              <Input
                label="Quantity"
                type="number"
                min="1"
                placeholder="1"
                error={errors.quantity?.message}
                required
                {...register('quantity', { valueAsNumber: true })}
              />
              <Input
                label="Price"
                type="number"
                step="0.01"
                placeholder="0.00"
                error={errors.price?.message}
                required
                leftAddon={<DollarSign className="h-3.5 w-3.5" />}
                {...register('price', { valueAsNumber: true })}
              />
              <Select
                label="Type"
                error={errors.type?.message}
                required
                {...register('type')}
              >
                <option value="">Type…</option>
                <option value="buy">Buy (Purchase)</option>
                <option value="sell">Sell (Sale)</option>
              </Select>
            </div>
            <DialogFooter>
              <Button type="button" variant="secondary" size="sm" onClick={() => setFormOpen(false)}>Cancel</Button>
              <Button type="submit" size="sm" loading={createMutation.isPending}>Create Order</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Execute confirm */}
      <ConfirmDialog
        open={!!executeTarget}
        onOpenChange={(o) => !o && setExecuteTarget(null)}
        title="Execute Order"
        description={`Execute order ${executeTarget?.id.slice(0, 8)}...? This will ${executeTarget?.type === 'buy' ? 'decrement' : 'increment'} the product stock by ${executeTarget?.quantity} units.`}
        confirmLabel="Execute"
        variant="warning"
        onConfirm={() => executeTarget && executeMutation.mutate(executeTarget.id)}
        loading={executeMutation.isPending}
      />

      {/* Cancel confirm */}
      <ConfirmDialog
        open={!!cancelTarget}
        onOpenChange={(o) => !o && setCancelTarget(null)}
        title="Cancel Order"
        description={`Cancel order ${cancelTarget?.id.slice(0, 8)}...? No stock changes will be made.`}
        confirmLabel="Cancel Order"
        onConfirm={() => cancelTarget && cancelMutation.mutate(cancelTarget.id)}
        loading={cancelMutation.isPending}
      />
    </div>
  )
}
