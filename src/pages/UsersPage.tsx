import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Pencil, Trash2, Users, Mail, MapPin, CreditCard, Calendar } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { userService } from '@/services/user.service'
import { QUERY_KEYS } from '@/constants'
import { createUserSchema, type CreateUserFormData } from '@/lib/schemas'
import { formatShortDate } from '@/lib/utils'
import type { User } from '@/types'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/Dialog'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { SearchBar } from '@/components/shared/SearchBar'
import { EmptyState } from '@/components/shared/EmptyState'
import { TableSkeleton } from '@/components/shared/Skeleton'
import { useToast } from '@/components/ui/Toaster'

type FormMode = 'create' | 'edit'

export default function UsersPage() {
  const queryClient = useQueryClient()
  const toast = useToast()
  const [search, setSearch] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [formMode, setFormMode] = useState<FormMode>('create')
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null)

  const { data: users = [], isLoading } = useQuery({
    queryKey: QUERY_KEYS.USERS,
    queryFn: userService.getAll,
  })

  const createMutation = useMutation({
    mutationFn: userService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USERS })
      toast.success('User created', 'New user registered successfully.')
      setFormOpen(false)
      reset()
    },
    onError: (e: any) => toast.error('Failed to create user', e.message),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<CreateUserFormData> }) =>
      userService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USERS })
      toast.success('User updated')
      setFormOpen(false)
    },
    onError: (e: any) => toast.error('Failed to update user', e.message),
  })

  const deleteMutation = useMutation({
    mutationFn: userService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USERS })
      toast.success('User deleted')
      setDeleteTarget(null)
    },
    onError: (e: any) => toast.error('Failed to delete user', e.message),
  })

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<CreateUserFormData>({
    resolver: zodResolver(createUserSchema),
  })

  const openCreate = () => {
    setFormMode('create')
    setSelectedUser(null)
    reset()
    setFormOpen(true)
  }

  const openEdit = (user: User) => {
    setFormMode('edit')
    setSelectedUser(user)
    setValue('name', user.name)
    setValue('email', user.email)
    setValue('birthday', user.birthday)
    setValue('address', user.address)
    setValue('cpf', user.cpf)
    setValue('password', '')
    setFormOpen(true)
  }

  const onSubmit = (data: CreateUserFormData) => {
    if (formMode === 'create') createMutation.mutate(data)
    else if (selectedUser) {
      const payload = { ...data }
      if (!payload.password) delete (payload as any).password
      updateMutation.mutate({ id: selectedUser.id, data: payload })
    }
  }

  const filtered = users.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase()),
  )

  const isMutating = createMutation.isPending || updateMutation.isPending

  function getInitials(name: string) {
    return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <SearchBar value={search} onChange={setSearch} placeholder="Search users..." className="sm:w-72" />
        <Button leftIcon={<Plus className="h-4 w-4" />} onClick={openCreate} id="create-user-btn">
          New User
        </Button>
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-900/40 overflow-hidden">
        {isLoading ? (
          <div className="p-4"><TableSkeleton rows={5} cols={4} /></div>
        ) : filtered.length === 0 ? (
          <EmptyState
            title="No users found"
            description={search ? `No users match "${search}"` : 'Register your first user.'}
            icon={<Users className="h-7 w-7 text-slate-500" />}
            action={<Button leftIcon={<Plus className="h-4 w-4" />} onClick={openCreate}>New User</Button>}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm" aria-label="Users table">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/50">
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">User</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">CPF</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">Birthday</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">Address</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filtered.map((user) => (
                  <tr key={user.id} className="table-row-hover group">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-500/20 border border-violet-500/30 text-xs font-medium text-violet-400 select-none">
                          {getInitials(user.name)}
                        </div>
                        <div>
                          <p className="font-medium text-slate-100">{user.name}</p>
                          <p className="text-xs text-slate-500 flex items-center gap-1">
                            <Mail className="h-3 w-3" />{user.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 text-slate-400 font-mono text-xs">
                        <CreditCard className="h-3.5 w-3.5 text-slate-600" />
                        {user.cpf}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 text-slate-400">
                        <Calendar className="h-3.5 w-3.5 text-slate-600" />
                        {user.birthday}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 text-slate-400 max-w-[200px] truncate">
                        <MapPin className="h-3.5 w-3.5 text-slate-600 flex-shrink-0" />
                        <span className="truncate">{user.address}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon-sm" onClick={() => openEdit(user)} aria-label={`Edit ${user.name}`}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="danger" size="icon-sm" onClick={() => setDeleteTarget(user)} aria-label={`Delete ${user.name}`}>
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
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{formMode === 'create' ? 'New User' : 'Edit User'}</DialogTitle>
            <DialogDescription>
              {formMode === 'create' ? 'Register a new user in the system.' : `Editing: ${selectedUser?.name}`}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input label="Full Name" placeholder="John Doe" error={errors.name?.message} required {...register('name')} />
            <div className="grid grid-cols-2 gap-3">
              <Input label="Email" type="email" placeholder="user@example.com" error={errors.email?.message} required leftAddon={<Mail className="h-3.5 w-3.5" />} {...register('email')} />
              <Input
                label={formMode === 'edit' ? 'New Password (optional)' : 'Password'}
                type="password"
                placeholder="min. 6 chars"
                error={errors.password?.message}
                required={formMode === 'create'}
                {...register('password')}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input label="CPF" placeholder="000.000.000-00" error={errors.cpf?.message} required leftAddon={<CreditCard className="h-3.5 w-3.5" />} {...register('cpf')} />
              <Input label="Birthday" type="date" error={errors.birthday?.message} required leftAddon={<Calendar className="h-3.5 w-3.5" />} {...register('birthday')} />
            </div>
            <Input label="Address" placeholder="123 Main St, City, Country" error={errors.address?.message} required leftAddon={<MapPin className="h-3.5 w-3.5" />} {...register('address')} />
            <DialogFooter>
              <Button type="button" variant="secondary" size="sm" onClick={() => setFormOpen(false)}>Cancel</Button>
              <Button type="submit" size="sm" loading={isMutating}>
                {formMode === 'create' ? 'Create User' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title="Delete User"
        description={`Delete "${deleteTarget?.name}"? All their orders will remain in the system.`}
        confirmLabel="Delete"
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
        loading={deleteMutation.isPending}
      />
    </div>
  )
}
