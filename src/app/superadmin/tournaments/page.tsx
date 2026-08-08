'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ColumnDef } from '@tanstack/react-table'
import { Plus, MoreHorizontal, Pencil, Trash2, CalendarIcon, Coins, Gamepad2, Users, Eye } from 'lucide-react'
import { DataTable } from '@/components/ui/data-table'
import { Button } from '@/components/ui/button'
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
import { useTournaments, useCreateTournament, useUpdateTournament, useDeleteTournament, Tournament } from '@/hooks/useTournaments'
import { useGames } from '@/hooks/useGames'
import { useToast } from '@/hooks/use-toast'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAssignableAdmins } from '@/hooks/useAdmins'
import { apiClient } from '@/lib/apiClient'

export default function TournamentsPage() {
  const router = useRouter()
  const { data, isLoading, isError } = useTournaments()
  const { data: gamesData } = useGames({ limit: 100 })
  const { data: adminsData } = useAssignableAdmins()
  const createMutation = useCreateTournament()
  const updateMutation = useUpdateTournament()
  const deleteMutation = useDeleteTournament()
  const { toast } = useToast()

  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
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

  const getGameThumbnail = (gameName: string) => {
    const game = gamesData?.games?.find(g => g.name === gameName)
    return game?.thumbnail || ''
  }
  
  const [formData, setFormData] = useState<Partial<Tournament>>({
    title: '',
    game: '',
    mode: 'Squad',
    map: 'Erangel',
    startTime: new Date().toISOString().slice(0, 16),
    prizePool: 0,
    entryFee: 0,
    totalSlots: 100,
    assignedAdminId: '',
  })

  // Filter admins based on the selected game
  const availableAdmins = adminsData?.filter(a => {
    if (!formData.game) return true // Show all if no game selected
    // If admin has adminGames array, they must have this game. If empty, maybe they have access to all? (fallback to true for empty)
    if (!a.adminGames || a.adminGames.length === 0) return true
    return a.adminGames.includes(formData.game)
  }) || []

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setIsUploading(true)
      let finalBanner = formData.banner
      if (selectedFile) {
        finalBanner = await uploadImage(selectedFile, 'tournaments')
      } else if (!finalBanner && formData.game) {
        finalBanner = getGameThumbnail(formData.game)
      }

      await createMutation.mutateAsync({ 
        ...formData, 
        banner: finalBanner,
        startTime: new Date(formData.startTime!).toISOString(),
        prizePool: Number(formData.prizePool),
        entryFee: Number(formData.entryFee),
        totalSlots: Number(formData.totalSlots),
        prizeDistribution: {} 
      } as any)
      setIsCreateOpen(false)
      setSelectedFile(null)
      toast({ title: 'Tournament created successfully.' })
    } catch (err: any) {
      toast({ title: 'Failed to create tournament', description: err.response?.data?.message || err.message, variant: 'destructive' })
    } finally {
      setIsUploading(false)
    }
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setIsUploading(true)
      let finalBanner = formData.banner
      if (selectedFile) {
        finalBanner = await uploadImage(selectedFile, 'tournaments')
      } else if (!finalBanner && formData.game) {
        finalBanner = getGameThumbnail(formData.game)
      }

      await updateMutation.mutateAsync({ 
        id: formData.id!, 
        ...formData, 
        banner: finalBanner,
        startTime: new Date(formData.startTime!).toISOString(),
        prizePool: Number(formData.prizePool),
        entryFee: Number(formData.entryFee),
        totalSlots: Number(formData.totalSlots),
        prizeDistribution: {} 
      } as any)
      setIsEditOpen(false)
      setSelectedFile(null)
      toast({ title: 'Tournament updated successfully.' })
    } catch (err: any) {
      toast({ title: 'Failed to update tournament', description: err.response?.data?.message || err.message, variant: 'destructive' })
    } finally {
      setIsUploading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to cancel this tournament?')) return
    try {
      await deleteMutation.mutateAsync(id)
      toast({ title: 'Tournament cancelled.' })
    } catch (err: any) {
      toast({ title: 'Failed to cancel tournament', variant: 'destructive' })
    }
  }

  const columns: ColumnDef<Tournament>[] = [
    {
      accessorKey: 'title',
      header: 'Title & Game',
      cell: ({ row }) => (
        <div>
          <div className="font-bold">{row.getValue('title')}</div>
          <div className="text-xs flex items-center text-muted-foreground gap-1 mt-1">
            <Gamepad2 className="w-3 h-3" /> {row.original.game} ({row.original.mode}) - {row.original.map}
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'startTime',
      header: 'Schedule',
      cell: ({ row }) => (
        <div className="flex items-center gap-2 text-sm">
          <CalendarIcon className="w-4 h-4 text-muted-foreground" />
          {new Date(row.getValue('startTime')).toLocaleString()}
        </div>
      ),
    },
    {
      accessorKey: 'slots',
      header: 'Slots',
      cell: ({ row }) => (
        <div className="flex items-center gap-2 text-sm">
          <Users className="w-4 h-4 text-muted-foreground" />
          {row.original.joinedSlots} / {row.original.totalSlots}
        </div>
      ),
    },
    {
      accessorKey: 'entryFee',
      header: 'Entry Fee',
      cell: ({ row }) => (
        <div className="font-medium text-orange-400">
          ₹{row.getValue('entryFee')}
        </div>
      ),
    },
    {
      accessorKey: 'prizePool',
      header: 'Prize Pool',
      cell: ({ row }) => (
        <div className="font-bold text-green-500">
          ₹{row.getValue('prizePool')}
        </div>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.getValue('status') as string
        return (
          <span className={`px-2 py-1 text-[10px] font-bold uppercase rounded-md ${
            status === 'UPCOMING' ? 'bg-blue-500/10 text-blue-500' : 
            status === 'CANCELLED' ? 'bg-red-500/10 text-red-500' : 
            'bg-green-500/10 text-green-500'
          }`}>
            {status}
          </span>
        )
      }
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const match = row.original
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => router.push(`/superadmin/tournaments/${match.id}`)}>
                <Eye className="mr-2 h-4 w-4" /> View Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => {
                setFormData({ 
                  ...match, 
                  startTime: new Date(match.startTime).toISOString().slice(0, 16) 
                })
                setIsEditOpen(true)
              }}>
                <Pencil className="mr-2 h-4 w-4" /> Edit Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleDelete(match.id)} className="text-destructive focus:bg-destructive/10 focus:text-destructive">
                <Trash2 className="mr-2 h-4 w-4" /> Cancel Match
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
        <p className="text-muted-foreground">Failed to load tournaments. Check API connection.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 ">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Tournaments</h1>
          <p className="text-muted-foreground">Create matches, assign admins, and manage lobbies.</p>
        </div>
        <Button onClick={() => {
          setFormData({
            title: '', game: '', mode: 'Squad', map: 'Erangel',
            startTime: new Date().toISOString().slice(0, 16),
            prizePool: 0, entryFee: 0, totalSlots: 100, assignedAdminId: '', banner: ''
          })
          setSelectedFile(null)
          setIsCreateOpen(true)
        }}>
          <Plus className="w-4 h-4 mr-2" /> Create Match
        </Button>
      </div>

      <DataTable 
        columns={columns} 
        data={data?.tournaments || []} 
        isLoading={isLoading} 
        searchKey="title"
      />

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Create New Tournament Match</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4 pt-4 max-h-[70vh] overflow-y-auto px-1">
            <div className="space-y-2">
              <Label>Tournament Title</Label>
              <Input required value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="e.g. Daily Erangel Scrims" />
            </div>
            <div className="space-y-2">
              <Label>Banner Image (Optional)</Label>
              <Input 
                type="file" 
                accept="image/*"
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              />
              <p className="text-[10px] text-muted-foreground mt-1">If left empty, the default Game banner will be used automatically.</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Game</Label>
                <Select value={formData.game} onValueChange={(val) => setFormData({ ...formData, game: val })}>
                  <SelectTrigger><SelectValue placeholder="Select Game" /></SelectTrigger>
                  <SelectContent>
                    {gamesData?.games?.map(g => (
                      <SelectItem key={g.id} value={g.name}>{g.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Mode</Label>
                <Select value={formData.mode} onValueChange={(val) => setFormData({ ...formData, mode: val })}>
                  <SelectTrigger><SelectValue placeholder="Select Mode" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Solo">Solo</SelectItem>
                    <SelectItem value="Duo">Duo</SelectItem>
                    <SelectItem value="Squad">Squad</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Map</Label>
                <Select value={formData.map} onValueChange={(val) => setFormData({ ...formData, map: val })}>
                  <SelectTrigger><SelectValue placeholder="Select Map" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Erangel">Erangel</SelectItem>
                    <SelectItem value="Miramar">Miramar</SelectItem>
                    <SelectItem value="Sanhok">Sanhok</SelectItem>
                    <SelectItem value="Livik">Livik</SelectItem>
                    <SelectItem value="Bermuda">Bermuda</SelectItem>
                    <SelectItem value="Purgatory">Purgatory</SelectItem>
                    <SelectItem value="Kalahari">Kalahari</SelectItem>
                    <SelectItem value="Custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Start Time</Label>
                <Input required type="datetime-local" value={formData.startTime} onChange={(e) => setFormData({ ...formData, startTime: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Total Slots</Label>
                <Input required type="number" min="2" value={formData.totalSlots} onChange={(e) => setFormData({ ...formData, totalSlots: Number(e.target.value) })} />
              </div>
              <div className="space-y-2">
                <Label>Entry Fee (₹)</Label>
                <Input required type="number" min="0" value={formData.entryFee} onChange={(e) => setFormData({ ...formData, entryFee: Number(e.target.value) })} />
              </div>
              <div className="space-y-2">
                <Label>Prize Pool (₹)</Label>
                <Input required type="number" min="0" value={formData.prizePool} onChange={(e) => setFormData({ ...formData, prizePool: Number(e.target.value) })} />
              </div>
            </div>
            
            <div className="space-y-2 pt-2 border-t border-white/10">
              <Label>Assign Room Admin (Filtered by Game)</Label>
              <Select 
                value={formData.assignedAdminId || "none"} 
                onValueChange={(val) => setFormData({ ...formData, assignedAdminId: val === "none" ? "" : val })}
              >
                <SelectTrigger><SelectValue placeholder="Select an Admin (Optional)" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Admin (Unassigned)</SelectItem>
                  {availableAdmins.map(admin => (
                    <SelectItem key={admin.id} value={admin.id}>
                      {admin.username} {admin.isOnline ? '🟢' : '⚫'} 
                      {admin.adminGames && admin.adminGames.length > 0 ? ` [${admin.adminGames.join(', ')}]` : ' [All Games]'} 
                      ({admin._count.assignedMatches} active)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-[10px] text-muted-foreground mt-1">If game is selected, only admins who handle that game are listed.</p>
            </div>

            <div className="flex justify-end pt-4">
              <Button type="submit" disabled={createMutation.isPending || isUploading}>
                {createMutation.isPending || isUploading ? 'Saving...' : 'Create Match'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Match Details</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdate} className="space-y-4 pt-4 max-h-[70vh] overflow-y-auto px-1">
            <div className="space-y-2">
              <Label>Tournament Title</Label>
              <Input required value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="e.g. Daily Erangel Scrims" />
            </div>
            <div className="space-y-2">
              <Label>Banner Image</Label>
              {formData.banner && !selectedFile && (
                <div className="mb-2 h-20 w-40 overflow-hidden rounded-md border">
                  <img src={formData.banner} alt="Current" className="h-full w-full object-cover" />
                </div>
              )}
              <Input 
                type="file" 
                accept="image/*"
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              />
              <p className="text-[10px] text-muted-foreground mt-1">Select a new image to replace the current banner. If left empty, current banner is kept.</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Game</Label>
                <Select value={formData.game} onValueChange={(val) => setFormData({ ...formData, game: val })}>
                  <SelectTrigger><SelectValue placeholder="Select Game" /></SelectTrigger>
                  <SelectContent>
                    {gamesData?.games?.map(g => (
                      <SelectItem key={g.id} value={g.name}>{g.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Mode</Label>
                <Select value={formData.mode} onValueChange={(val) => setFormData({ ...formData, mode: val })}>
                  <SelectTrigger><SelectValue placeholder="Select Mode" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Solo">Solo</SelectItem>
                    <SelectItem value="Duo">Duo</SelectItem>
                    <SelectItem value="Squad">Squad</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Map</Label>
                <Select value={formData.map} onValueChange={(val) => setFormData({ ...formData, map: val })}>
                  <SelectTrigger><SelectValue placeholder="Select Map" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Erangel">Erangel</SelectItem>
                    <SelectItem value="Miramar">Miramar</SelectItem>
                    <SelectItem value="Sanhok">Sanhok</SelectItem>
                    <SelectItem value="Livik">Livik</SelectItem>
                    <SelectItem value="Bermuda">Bermuda</SelectItem>
                    <SelectItem value="Purgatory">Purgatory</SelectItem>
                    <SelectItem value="Kalahari">Kalahari</SelectItem>
                    <SelectItem value="Custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Start Time</Label>
                <Input required type="datetime-local" value={formData.startTime} onChange={(e) => setFormData({ ...formData, startTime: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Total Slots</Label>
                <Input required type="number" min="2" value={formData.totalSlots} onChange={(e) => setFormData({ ...formData, totalSlots: Number(e.target.value) })} />
              </div>
              <div className="space-y-2">
                <Label>Entry Fee (₹)</Label>
                <Input required type="number" min="0" value={formData.entryFee} onChange={(e) => setFormData({ ...formData, entryFee: Number(e.target.value) })} />
              </div>
              <div className="space-y-2">
                <Label>Prize Pool (₹)</Label>
                <Input required type="number" min="0" value={formData.prizePool} onChange={(e) => setFormData({ ...formData, prizePool: Number(e.target.value) })} />
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-white/10">
              <Label>Assign Room Admin (Filtered by Game)</Label>
              <Select 
                value={formData.assignedAdminId || "none"} 
                onValueChange={(val) => setFormData({ ...formData, assignedAdminId: val === "none" ? "" : val })}
              >
                <SelectTrigger><SelectValue placeholder="Select an Admin (Optional)" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Admin (Unassigned)</SelectItem>
                  {availableAdmins.map(admin => (
                    <SelectItem key={admin.id} value={admin.id}>
                      {admin.username} {admin.isOnline ? '🟢' : '⚫'} 
                      {admin.adminGames && admin.adminGames.length > 0 ? ` [${admin.adminGames.join(', ')}]` : ' [All Games]'} 
                      ({admin._count.assignedMatches} active)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-[10px] text-muted-foreground mt-1">If game is selected, only admins who handle that game are listed.</p>
            </div>

            <div className="flex justify-end pt-4">
              <Button type="submit" disabled={updateMutation.isPending || isUploading}>
                {updateMutation.isPending || isUploading ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}