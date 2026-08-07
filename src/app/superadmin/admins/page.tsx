'use client'

import React, { useState } from 'react'
import { ColumnDef } from '@tanstack/react-table'
import { MoreHorizontal, Plus, ShieldBan, ShieldCheck, Pencil, Trash2 } from 'lucide-react'
import { DataTable } from '@/components/ui/data-table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useAdmins, useCreateAdmin, useUpdateAdmin, useToggleAdminStatus, useDeleteAdmin, AdminUser } from '@/hooks/useAdmins'
import { useToast } from '@/hooks/use-toast'

export default function AdminsPage() {
  const { data, isLoading } = useAdmins()
  const createMutation = useCreateAdmin()
  const updateMutation = useUpdateAdmin()
  const toggleMutation = useToggleAdminStatus()
  const deleteMutation = useDeleteAdmin()
  const { toast } = useToast()

  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  
  const [formData, setFormData] = useState<Partial<AdminUser> & { password?: string }>({
    username: '', email: '', phone: '', password: '', permissions: []
  })

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await createMutation.mutateAsync(formData)
      setIsCreateOpen(false)
      toast({ title: 'Admin created successfully.' })
    } catch (err: any) {
      toast({ title: 'Creation failed', description: err.response?.data?.message || err.message, variant: 'destructive' })
    }
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await updateMutation.mutateAsync({ id: formData.id!, ...formData })
      setIsEditOpen(false)
      toast({ title: 'Admin updated successfully.' })
    } catch (err: any) {
      toast({ title: 'Update failed', description: err.response?.data?.message || err.message, variant: 'destructive' })
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to permanently delete this Admin?')) return
    try {
      await deleteMutation.mutateAsync(id)
      toast({ title: 'Admin deleted.' })
    } catch (err: any) {
      toast({ title: 'Action failed', variant: 'destructive' })
    }
  }

  const handleToggle = async (id: string) => {
    try {
      await toggleMutation.mutateAsync(id)
      toast({ title: 'Admin status toggled.' })
    } catch (err: any) {
      toast({ title: 'Action failed', variant: 'destructive' })
    }
  }

  const columns: ColumnDef<AdminUser>[] = [
    {
      accessorKey: 'username',
      header: 'Admin Details',
      cell: ({ row }) => (
        <div>
          <div className="font-bold">{row.getValue('username')}</div>
          <div className="text-xs text-muted-foreground">{row.original.email} • {row.original.phone}</div>
        </div>
      ),
    },
    {
      accessorKey: 'permissions',
      header: 'Permissions',
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-1 max-w-[200px]">
          {row.original.permissions?.length > 0 ? (
            row.original.permissions.map(p => <Badge key={p} variant="secondary" className="text-[10px] px-1 py-0">{p}</Badge>)
          ) : (
            <span className="text-xs text-muted-foreground">None</span>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'isBlocked',
      header: 'Status',
      cell: ({ row }) => {
        const isBlocked = row.getValue('isBlocked') as boolean
        return (
          <Badge variant={isBlocked ? 'destructive' : 'outline'} className={!isBlocked ? 'bg-green-500/10 text-green-500' : ''}>
            {isBlocked ? 'Disabled' : 'Active'}
          </Badge>
        )
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const admin = row.original
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => {
                setFormData({ ...admin, password: '' })
                setIsEditOpen(true)
              }}>
                <Pencil className="mr-2 h-4 w-4" /> Edit Admin
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleToggle(admin.id)}>
                {admin.isBlocked ? <><ShieldCheck className="mr-2 h-4 w-4" /> Enable Admin</> : <><ShieldBan className="mr-2 h-4 w-4" /> Disable Admin</>}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleDelete(admin.id)} className="text-destructive focus:bg-destructive/10 focus:text-destructive">
                <Trash2 className="mr-2 h-4 w-4" /> Delete Admin
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Admin Management</h1>
          <p className="text-muted-foreground">Manage sub-admins and their system permissions.</p>
        </div>
        <Button onClick={() => {
          setFormData({ username: '', email: '', phone: '', password: '', permissions: [] })
          setIsCreateOpen(true)
        }}>
          <Plus className="w-4 h-4 mr-2" /> Add Admin
        </Button>
      </div>

      <DataTable columns={columns} data={data || []} isLoading={isLoading} searchKey="username" />

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Create New Admin</DialogTitle></DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4 pt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Username</Label>
                <Input required value={formData.username} onChange={(e) => setFormData({ ...formData, username: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input required type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input required value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Password</Label>
                <Input required type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Permissions (Comma separated)</Label>
              <Input 
                placeholder="e.g. Tournaments, Users, Support" 
                value={formData.permissions?.join(', ')} 
                onChange={(e) => setFormData({ ...formData, permissions: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })} 
              />
            </div>
            <div className="flex justify-end pt-4">
              <Button type="submit" disabled={createMutation.isPending}>{createMutation.isPending ? 'Saving...' : 'Create Admin'}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Admin</DialogTitle></DialogHeader>
          <form onSubmit={handleUpdate} className="space-y-4 pt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Username</Label>
                <Input required value={formData.username} onChange={(e) => setFormData({ ...formData, username: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input required type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input required value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Permissions (Comma separated)</Label>
              <Input 
                placeholder="e.g. Tournaments, Users, Support" 
                value={formData.permissions?.join(', ')} 
                onChange={(e) => setFormData({ ...formData, permissions: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })} 
              />
            </div>
            <div className="flex justify-end pt-4">
              <Button type="submit" disabled={updateMutation.isPending}>{updateMutation.isPending ? 'Saving...' : 'Save Changes'}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}