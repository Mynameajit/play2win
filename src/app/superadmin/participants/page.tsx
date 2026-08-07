'use client'

import React, { useState } from 'react'
import { ColumnDef } from '@tanstack/react-table'
import { MoreHorizontal, ShieldCheck, ShieldBan, Download, Search } from 'lucide-react'
import { DataTable } from '@/components/ui/data-table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useParticipants, useVerifyParticipant, Participant } from '@/hooks/useParticipants'
import { useToast } from '@/hooks/use-toast'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useTournaments } from '@/hooks/useTournaments'

export default function ParticipantsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [tournamentId, setTournamentId] = useState<string>('all')
  const { data: tournamentsData } = useTournaments({ limit: 100 })
  const { data, isLoading } = useParticipants({ search: searchTerm, tournamentId: tournamentId === 'all' ? undefined : tournamentId })
  
  const verifyMutation = useVerifyParticipant()
  const { toast } = useToast()

  const handleVerify = async (tournamentId: string, userId: string, isVerified: boolean) => {
    try {
      const statusStr = !isVerified ? 'JOINED' : 'PENDING'
      await verifyMutation.mutateAsync({ tournamentId, userId, status: statusStr })
      toast({ title: `Player ${!isVerified ? 'verified' : 'unverified'} successfully.` })
    } catch (err: any) {
      toast({ title: 'Action failed', description: err.response?.data?.message || err.message, variant: 'destructive' })
    }
  }

  const exportCSV = () => {
    if (!data?.participants) return
    const headers = 'Tournament,Player Name,In-Game Name,In-Game UID,Status,Joined At\n'
    const csv = data.participants.map(p => 
      `"${p.tournament.title}","${p.user.username}","${p.ign}","${p.gameUid}","${p.isVerified ? 'Verified' : 'Pending'}","${new Date(p.joinedAt).toLocaleString()}"`
    ).join('\n')

    const blob = new Blob([headers + csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `participants_export_${new Date().getTime()}.csv`
    a.click()
  }

  const columns: ColumnDef<Participant>[] = [
    {
      accessorKey: 'tournament',
      header: 'Tournament Match',
      cell: ({ row }) => (
        <div>
          <div className="font-bold">{row.original.tournament.title}</div>
          <div className="text-xs text-muted-foreground">{row.original.tournament.game}</div>
        </div>
      ),
    },
    {
      accessorKey: 'user',
      header: 'Player',
      cell: ({ row }) => (
        <div>
          <div className="font-bold text-sm">{row.original.user.username}</div>
          <div className="text-xs text-muted-foreground">{row.original.user.phone}</div>
        </div>
      ),
    },
    {
      accessorKey: 'ign',
      header: 'In-Game Details',
      cell: ({ row }) => (
        <div>
          <div className="text-sm font-medium">IGN: {row.original.ign}</div>
          <div className="text-xs text-muted-foreground">UID: {row.original.gameUid}</div>
        </div>
      ),
    },
    {
      accessorKey: 'joinedAt',
      header: 'Joined At',
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {new Date(row.original.joinedAt).toLocaleString()}
        </span>
      ),
    },
    {
      accessorKey: 'isVerified',
      header: 'Verification',
      cell: ({ row }) => {
        const isVerified = row.getValue('isVerified') as boolean
        return (
          <Badge variant={isVerified ? 'default' : 'secondary'} className={isVerified ? 'bg-green-500 hover:bg-green-600' : 'bg-yellow-500 hover:bg-yellow-600'}>
            {isVerified ? 'Verified' : 'Pending'}
          </Badge>
        )
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const p = row.original
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleVerify(p.tournamentId, p.userId, p.isVerified)} className={p.isVerified ? 'text-destructive' : 'text-green-500'}>
                {p.isVerified ? <><ShieldBan className="mr-2 h-4 w-4" /> Unverify Player</> : <><ShieldCheck className="mr-2 h-4 w-4" /> Verify Player</>}
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
          <h1 className="text-2xl font-bold tracking-tight">Participants Roster</h1>
          <p className="text-muted-foreground">Review registered players, verify IGNs, and manage match slots.</p>
        </div>
        <Button onClick={exportCSV} variant="outline">
          <Download className="w-4 h-4 mr-2" /> Export CSV
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search Player or IGN..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        
        <Select value={tournamentId} onValueChange={setTournamentId}>
          <SelectTrigger className="w-full sm:w-[300px]">
            <SelectValue placeholder="Filter by Match" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Matches</SelectItem>
            {tournamentsData?.tournaments?.map((t) => (
              <SelectItem key={t.id} value={t.id}>{t.title} ({t.game})</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <DataTable columns={columns} data={data?.participants || []} isLoading={isLoading} searchKey="ign" />
    </div>
  )
}