'use client'

import React, { useState } from 'react'
import { ColumnDef } from '@tanstack/react-table'
import { Plus, MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import { DataTable } from '@/components/ui/data-table'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useGames, useCreateGame, useUpdateGame, useDeleteGame, useToggleGameStatus, Game } from '@/hooks/useGames'
import { useToast } from '@/hooks/use-toast'
import { apiClient } from '@/lib/apiClient'

export default function GamesPage() {
  const { data, isLoading, isError } = useGames()
  const createMutation = useCreateGame()
  const updateMutation = useUpdateGame()
  const deleteMutation = useDeleteGame()
  const toggleMutation = useToggleGameStatus()
  const { toast } = useToast()

  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [formData, setFormData] = useState({ id: '', name: '', thumbnail: '' })
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  const uploadImage = async (file: File, folder: string) => {
    const fd = new FormData()
    fd.append('image', file)
    fd.append('folder', folder)
    const res = await apiClient.post('/superadmin/upload/image', fd, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return res.data.url
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setIsUploading(true)
      let thumbnailUrl = formData.thumbnail
      if (selectedFile) {
        thumbnailUrl = await uploadImage(selectedFile, 'games')
      }
      await createMutation.mutateAsync({ name: formData.name, thumbnail: thumbnailUrl })
      setIsCreateOpen(false)
      setFormData({ id: '', name: '', thumbnail: '' })
      setSelectedFile(null)
      toast({ title: 'Game created successfully.' })
    } catch (err: any) {
      toast({ title: 'Failed to create game', description: err.response?.data?.message || err.message, variant: 'destructive' })
    } finally {
      setIsUploading(false)
    }
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setIsUploading(true)
      let thumbnailUrl = formData.thumbnail
      if (selectedFile) {
        thumbnailUrl = await uploadImage(selectedFile, 'games')
      }
      await updateMutation.mutateAsync({ ...formData, thumbnail: thumbnailUrl })
      setIsEditOpen(false)
      setFormData({ id: '', name: '', thumbnail: '' })
      setSelectedFile(null)
      toast({ title: 'Game updated successfully.' })
    } catch (err: any) {
      toast({ title: 'Failed to update game', description: err.response?.data?.message || err.message, variant: 'destructive' })
    } finally {
      setIsUploading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this game?')) return
    try {
      await deleteMutation.mutateAsync(id)
      toast({ title: 'Game deleted.' })
    } catch (err: any) {
      toast({ title: 'Failed to delete game', variant: 'destructive' })
    }
  }

  const handleToggle = async (id: string) => {
    try {
      await toggleMutation.mutateAsync(id)
      toast({ title: 'Status toggled.' })
    } catch (err: any) {
      toast({ title: 'Failed to toggle status', variant: 'destructive' })
    }
  }

  const columns: ColumnDef<Game>[] = [
    {
      accessorKey: 'thumbnail',
      header: 'Image',
      cell: ({ row }) => (
        <div className="h-10 w-10 rounded-md overflow-hidden bg-muted">
          {row.getValue('thumbnail') ? (
            <img src={row.getValue('thumbnail')} alt={row.getValue('name')} className="object-cover h-full w-full" />
          ) : (
            <div className="h-full w-full flex items-center justify-center text-muted-foreground text-xs font-bold">IMG</div>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }) => <div className="font-bold">{row.getValue('name')}</div>,
    },
    {
      accessorKey: 'isEnabled',
      header: 'Status',
      cell: ({ row }) => {
        const isEnabled = row.getValue('isEnabled') as boolean
        const id = row.original.id
        return (
          <div className="flex items-center gap-2">
            <Switch
              checked={isEnabled}
              onCheckedChange={() => handleToggle(id)}
              disabled={toggleMutation.isPending}
            />
            <span className={`text-xs font-medium ${isEnabled ? 'text-green-500' : 'text-muted-foreground'}`}>
              {isEnabled ? 'Active' : 'Disabled'}
            </span>
          </div>
        )
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const game = row.original
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
                setFormData({ id: game.id, name: game.name, thumbnail: game.thumbnail })
                setIsEditOpen(true)
              }}>
                <Pencil className="mr-2 h-4 w-4" /> Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleDelete(game.id)} className="text-destructive focus:bg-destructive/10 focus:text-destructive">
                <Trash2 className="mr-2 h-4 w-4" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  if (isError) {
    return (
      <div className="flex h-[400px] items-center justify-center rounded-xl border border-dashed bg-muted/50">
        <p className="text-muted-foreground">Failed to load games. Check API connection.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Game Management</h1>
          <p className="text-muted-foreground">Add, edit, and configure games for tournaments.</p>
        </div>
        <Button onClick={() => {
          setFormData({ id: '', name: '', thumbnail: '' })
          setSelectedFile(null)
          setIsCreateOpen(true)
        }}>
          <Plus className="w-4 h-4 mr-2" /> Add Game
        </Button>
      </div>

      <DataTable 
        columns={columns} 
        data={data?.games || []} 
        isLoading={isLoading} 
        searchKey="name"
      />

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Game</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>Game Name</Label>
              <Input 
                required 
                value={formData.name} 
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. BGMI, Free Fire"
              />
            </div>
            <div className="space-y-2">
              <Label>Thumbnail Image (Optional)</Label>
              <Input 
                type="file" 
                accept="image/*"
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              />
            </div>
            <div className="flex justify-end pt-4">
              <Button type="submit" disabled={createMutation.isPending || isUploading}>
                {createMutation.isPending || isUploading ? 'Saving...' : 'Save Game'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Game</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdate} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>Game Name</Label>
              <Input 
                required 
                value={formData.name} 
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Thumbnail Image</Label>
              {formData.thumbnail && !selectedFile && (
                <div className="mb-2 h-16 w-16 overflow-hidden rounded-md border">
                  <img src={formData.thumbnail} alt="Current" className="h-full w-full object-cover" />
                </div>
              )}
              <Input 
                type="file"
                accept="image/*"
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              />
              <p className="text-xs text-muted-foreground">Select a new image to replace the current one.</p>
            </div>
            <div className="flex justify-end pt-4">
              <Button type="submit" disabled={updateMutation.isPending || isUploading}>
                {updateMutation.isPending || isUploading ? 'Updating...' : 'Update Game'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}