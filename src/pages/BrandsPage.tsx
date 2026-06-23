import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Pencil, Trash2, Tag, Globe, Mail, Calendar } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { brandService } from '@/services/brand.service'
import { QUERY_KEYS } from '@/constants'
import { createBrandSchema, type CreateBrandFormData } from '@/lib/schemas'
import type { Brand } from '@/types'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/Dialog'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { SearchBar } from '@/components/shared/SearchBar'
import { EmptyState } from '@/components/shared/EmptyState'
import { TableSkeleton } from '@/components/shared/Skeleton'
import { useToast } from '@/components/ui/Toaster'

type FormMode = 'create' | 'edit'

export default function BrandsPage() {
  const queryClient = useQueryClient()
  const toast = useToast()
  const [search, setSearch] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [formMode, setFormMode] = useState<FormMode>('create')
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Brand | null>(null)

  const { data: brands = [], isLoading } = useQuery({
    queryKey: QUERY_KEYS.BRANDS,
    queryFn: brandService.getAll,
  })

  const createMutation = useMutation({
    mutationFn: brandService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.BRANDS })
      toast.success('Brand created', 'New brand added successfully.')
      setFormOpen(false)
      reset()
    },
    onError: (e: any) => toast.error('Failed to create brand', e.message),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: CreateBrandFormData }) =>
      brandService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.BRANDS })
      toast.success('Brand updated')
      setFormOpen(false)
    },
    onError: (e: any) => toast.error('Failed to update brand', e.message),
  })

  const deleteMutation = useMutation({
    mutationFn: brandService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.BRANDS })
      toast.success('Brand deleted')
      setDeleteTarget(null)
    },
    onError: (e: any) => toast.error('Failed to delete brand', e.message),
  })

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<CreateBrandFormData>({
    resolver: zodResolver(createBrandSchema),
  })

  const openCreate = () => {
    setFormMode('create')
    setSelectedBrand(null)
    reset()
    setFormOpen(true)
  }

  const openEdit = (brand: Brand) => {
    setFormMode('edit')
    setSelectedBrand(brand)
    setValue('name', brand.name)
    setValue('country', brand.country)
    setValue('email', brand.email)
    setValue('foundation_year', brand.foundation_year)
    setFormOpen(true)
  }

  const onSubmit = (data: CreateBrandFormData) => {
    if (formMode === 'create') createMutation.mutate(data)
    else if (selectedBrand) updateMutation.mutate({ id: selectedBrand.id, data })
  }

  const filtered = brands.filter((b) =>
    b.name.toLowerCase().includes(search.toLowerCase()) ||
    b.country.toLowerCase().includes(search.toLowerCase()),
  )

  const isMutating = createMutation.isPending || updateMutation.isPending

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <SearchBar value={search} onChange={setSearch} placeholder="Search brands..." className="sm:w-72" />
        <Button leftIcon={<Plus className="h-4 w-4" />} onClick={openCreate} id="create-brand-btn">
          New Brand
        </Button>
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-900/40 overflow-hidden">
        {isLoading ? (
          <div className="p-4"><TableSkeleton rows={5} cols={4} /></div>
        ) : filtered.length === 0 ? (
          <EmptyState
            title="No brands found"
            description={search ? `No brands match "${search}"` : 'Add your first brand to begin.'}
            icon={<Tag className="h-7 w-7 text-slate-500" />}
            action={<Button leftIcon={<Plus className="h-4 w-4" />} onClick={openCreate}>New Brand</Button>}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm" aria-label="Brands table">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/50">
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">Brand</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">Country</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">Email</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">Founded</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filtered.map((brand) => (
                  <tr key={brand.id} className="table-row-hover group">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-500/10 border border-sky-500/20">
                          <Tag className="h-3.5 w-3.5 text-sky-400" />
                        </div>
                        <div>
                          <p className="font-medium text-slate-100">{brand.name}</p>
                          <p className="text-xs text-slate-600">ID #{brand.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 text-slate-400">
                        <Globe className="h-3.5 w-3.5 text-slate-600" />
                        {brand.country}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 text-slate-400">
                        <Mail className="h-3.5 w-3.5 text-slate-600" />
                        {brand.email}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 text-slate-400">
                        <Calendar className="h-3.5 w-3.5 text-slate-600" />
                        {brand.foundation_year}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon-sm" onClick={() => openEdit(brand)} aria-label={`Edit ${brand.name}`}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="danger" size="icon-sm" onClick={() => setDeleteTarget(brand)} aria-label={`Delete ${brand.name}`}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{formMode === 'create' ? 'New Brand' : 'Edit Brand'}</DialogTitle>
            <DialogDescription>
              {formMode === 'create' ? 'Add a new brand to the system.' : `Editing: ${selectedBrand?.name}`}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input label="Brand Name" placeholder="e.g. Nike" error={errors.name?.message} required {...register('name')} />
            <div className="grid grid-cols-2 gap-3">
              <Input label="Country" placeholder="e.g. USA" error={errors.country?.message} required {...register('country')} />
              <Input
                label="Founded Year"
                type="number"
                placeholder="e.g. 1972"
                error={errors.foundation_year?.message}
                required
                {...register('foundation_year', { valueAsNumber: true })}
              />
            </div>
            <Input label="Contact Email" type="email" placeholder="contact@brand.com" error={errors.email?.message} required leftAddon={<Mail className="h-3.5 w-3.5" />} {...register('email')} />
            <DialogFooter>
              <Button type="button" variant="secondary" size="sm" onClick={() => setFormOpen(false)}>Cancel</Button>
              <Button type="submit" size="sm" loading={isMutating}>
                {formMode === 'create' ? 'Create Brand' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title="Delete Brand"
        description={`Delete "${deleteTarget?.name}"? Products assigned to this brand may be affected.`}
        confirmLabel="Delete"
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
        loading={deleteMutation.isPending}
      />
    </div>
  )
}
