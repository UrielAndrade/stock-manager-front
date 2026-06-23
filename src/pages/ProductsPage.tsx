import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Pencil, Trash2, Package, DollarSign } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { productService } from '@/services/product.service'
import { brandService } from '@/services/brand.service'
import { QUERY_KEYS, LOW_STOCK_THRESHOLD } from '@/constants'
import { createProductSchema, updateProductSchema, type CreateProductFormData, type UpdateProductFormData } from '@/lib/schemas'
import { formatCurrency, getStockStatus } from '@/lib/utils'
import type { Product } from '@/types'
import { Button } from '@/components/ui/Button'
import { Input, Select } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/Dialog'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { SearchBar } from '@/components/shared/SearchBar'
import { EmptyState } from '@/components/shared/EmptyState'
import { TableSkeleton } from '@/components/shared/Skeleton'
import { useToast } from '@/components/ui/Toaster'

type FormMode = 'create' | 'edit'

export default function ProductsPage() {
  const queryClient = useQueryClient()
  const toast = useToast()
  const [search, setSearch] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [formMode, setFormMode] = useState<FormMode>('create')
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null)

  const { data: products = [], isLoading } = useQuery({
    queryKey: QUERY_KEYS.PRODUCTS,
    queryFn: productService.getAll,
  })

  const { data: brands = [] } = useQuery({
    queryKey: QUERY_KEYS.BRANDS,
    queryFn: brandService.getAll,
  })

  const createMutation = useMutation({
    mutationFn: productService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PRODUCTS })
      toast.success('Product created', 'The product has been added to the catalog.')
      setFormOpen(false)
      reset()
    },
    onError: (e: any) => toast.error('Failed to create product', e.message),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateProductFormData }) =>
      productService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PRODUCTS })
      toast.success('Product updated', 'Changes saved successfully.')
      setFormOpen(false)
    },
    onError: (e: any) => toast.error('Failed to update product', e.message),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => productService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PRODUCTS })
      toast.success('Product deleted')
      setDeleteTarget(null)
    },
    onError: (e: any) => toast.error('Failed to delete product', e.message),
  })

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<CreateProductFormData>({
    resolver: zodResolver(createProductSchema),
  })

  const openCreate = () => {
    setFormMode('create')
    setSelectedProduct(null)
    reset()
    setFormOpen(true)
  }

  const openEdit = (product: Product) => {
    setFormMode('edit')
    setSelectedProduct(product)
    setValue('name', product.name)
    setValue('price', product.price)
    setValue('brand_id', product.brand_id)
    setValue('quantity', product.quantity)
    setFormOpen(true)
  }

  const onSubmit = (data: CreateProductFormData) => {
    if (formMode === 'create') {
      createMutation.mutate(data)
    } else if (selectedProduct) {
      updateMutation.mutate({ id: selectedProduct.id, data })
    }
  }

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()),
  )

  const getBrandName = (brandId: number) =>
    brands.find((b) => b.id === brandId)?.name ?? `Brand #${brandId}`

  const isMutating = createMutation.isPending || updateMutation.isPending

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search products..."
          className="sm:w-72"
        />
        <Button leftIcon={<Plus className="h-4 w-4" />} onClick={openCreate} id="create-product-btn">
          New Product
        </Button>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Products', value: products.length, color: 'text-indigo-400' },
          { label: 'Total Value', value: formatCurrency(products.reduce((s, p) => s + p.price * p.quantity, 0)), color: 'text-emerald-400' },
          { label: 'Low Stock', value: products.filter((p) => p.quantity > 0 && p.quantity < LOW_STOCK_THRESHOLD).length, color: 'text-amber-400' },
          { label: 'Out of Stock', value: products.filter((p) => p.quantity === 0).length, color: 'text-red-400' },
        ].map((s) => (
          <div key={s.label} className="rounded-lg border border-slate-800 bg-slate-900/40 px-4 py-3">
            <p className="text-xs text-slate-500">{s.label}</p>
            <p className={`text-lg font-bold mt-0.5 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/40 overflow-hidden">
        {isLoading ? (
          <div className="p-4">
            <TableSkeleton rows={6} cols={5} />
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            title="No products found"
            description={search ? `No products match "${search}"` : 'Create your first product to get started.'}
            icon={<Package className="h-7 w-7 text-slate-500" />}
            action={<Button leftIcon={<Plus className="h-4 w-4" />} onClick={openCreate}>New Product</Button>}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm" role="table" aria-label="Products table">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/50">
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">Product</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">Brand</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wide">Price</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wide">Stock</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wide">Value</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wide">Status</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filtered.map((product) => {
                  const stockStatus = getStockStatus(product.quantity)
                  return (
                    <tr key={product.id} className="table-row-hover group">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10 border border-indigo-500/20">
                            <Package className="h-3.5 w-3.5 text-indigo-400" />
                          </div>
                          <div>
                            <p className="font-medium text-slate-100">{product.name}</p>
                            <p className="text-xs text-slate-600">ID #{product.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-400">{getBrandName(product.brand_id)}</td>
                      <td className="px-4 py-3 text-right font-mono text-slate-200">{formatCurrency(product.price)}</td>
                      <td className="px-4 py-3 text-right font-mono text-slate-200">{product.quantity.toLocaleString()}</td>
                      <td className="px-4 py-3 text-right font-mono text-slate-200">{formatCurrency(product.price * product.quantity)}</td>
                      <td className="px-4 py-3 text-right">
                        <span className={`text-xs font-medium ${stockStatus.color}`}>{stockStatus.label}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => openEdit(product)}
                            aria-label={`Edit ${product.name}`}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="danger"
                            size="icon-sm"
                            onClick={() => setDeleteTarget(product)}
                            aria-label={`Delete ${product.name}`}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{formMode === 'create' ? 'New Product' : 'Edit Product'}</DialogTitle>
            <DialogDescription>
              {formMode === 'create' ? 'Add a new product to the catalog.' : `Editing: ${selectedProduct?.name}`}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Product Name"
              placeholder="e.g. Air Max 90"
              error={errors.name?.message}
              required
              {...register('name')}
            />
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Price (USD)"
                type="number"
                step="0.01"
                placeholder="0.00"
                error={errors.price?.message}
                leftAddon={<DollarSign className="h-3.5 w-3.5" />}
                required
                {...register('price', { valueAsNumber: true })}
              />
              <Input
                label="Quantity"
                type="number"
                min="0"
                placeholder="0"
                error={errors.quantity?.message}
                required
                {...register('quantity', { valueAsNumber: true })}
              />
            </div>
            <Select
              label="Brand"
              error={errors.brand_id?.message}
              required
              {...register('brand_id', { valueAsNumber: true })}
            >
              <option value="">Select a brand…</option>
              {brands.map((b) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </Select>

            <DialogFooter>
              <Button type="button" variant="secondary" size="sm" onClick={() => setFormOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" loading={isMutating}>
                {formMode === 'create' ? 'Create Product' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title="Delete Product"
        description={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
        loading={deleteMutation.isPending}
      />
    </div>
  )
}
