'use client'

import React, { useState } from 'react'
import { useAdminMatches, useAdminParticipants, useAdminVerifyParticipant } from '@/hooks/useAdminOps'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { SkeletonLoader } from '@/components/ui/SkeletonLoader'
import { ErrorState } from '@/components/ui/ErrorState'
import { EmptyState } from '@/components/ui/EmptyState'
import { toast } from '@/hooks/use-toast'
import { Search, Users, Check, X } from 'lucide-react'
import { useSearchParams } from 'next/navigation'

import { Suspense } from 'react'

function AdminParticipantsPageContent() {
  const searchParams = useSearchParams()
  const initialMatchId = searchParams?.get('matchId') || ''
  
  const [selectedMatch, setSelectedMatch] = useState<string>(initialMatchId)
  
  React.useEffect(() => {
    if (initialMatchId) setSelectedMatch(initialMatchId)
  }, [initialMatchId])
  
  const [search, setSearch] = useState('')
  
  const { data: matchesData, isLoading: isLoadingMatches } = useAdminMatches({ limit: 100 })
  const matches = matchesData?.matches || []
  
  const { data: participantsData, isLoading: isLoadingParticipants, refetch } = useAdminParticipants(selectedMatch)
  const participants = Array.isArray(participantsData) ? participantsData : []
  
  const { mutate: verifyParticipant, isPending } = useAdminVerifyParticipant()

  const handleVerify = (participantId: string, status: string) => {
    verifyParticipant({ matchId: selectedMatch, participantId, status }, {
      onSuccess: () => {
        toast({ title: `Participant status updated to ${status}` })
      },
      onError: (err: any) => {
        toast({ title: 'Update failed', description: err.message, variant: 'destructive' })
      }
    })
  }

  const filteredParticipants = participants.filter((p: any) => 
    p.ign.toLowerCase().includes(search.toLowerCase()) || 
    p.gameUid.includes(search) ||
    p.user?.phone?.includes(search)
  )

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold tracking-tight">Participants</h1>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="sm:w-64">
            {isLoadingMatches ? (
              <SkeletonLoader className="h-8" />
            ) : (
              <Select value={selectedMatch} onValueChange={setSelectedMatch}>
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue placeholder="Select a match..." />
                </SelectTrigger>
                <SelectContent>
                  {matches.map((m: any) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
          
          {selectedMatch && (
            <div className="relative flex-1 sm:max-w-xs">
              <Search className="absolute left-2.5 top-2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search IGN, UID..."
                className="pl-8 h-8 text-sm"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          )}
        </div>
      </div>

      {selectedMatch ? (
        isLoadingParticipants ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array(4).fill(0).map((_, i) => (
              <SkeletonLoader key={i} className="h-24" />
            ))}
          </div>
        ) : participants.length === 0 ? (
          <EmptyState title="No Participants" message="No players have joined this match yet." icon={Users} />
        ) : filteredParticipants.length === 0 ? (
          <div className="text-center py-10 border rounded-lg bg-muted/20">
            <p className="text-muted-foreground">No participants found matching your search.</p>
          </div>
        ) : (
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {filteredParticipants.map((p: any) => (
              <Card key={p.id} className="overflow-hidden">
                <div className="p-2.5 flex flex-col h-full justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <div className="text-[14px] font-bold text-orange-400 truncate pr-2">{p.ign}</div>
                      <Badge variant={p.status === 'JOINED' ? 'default' : p.status === 'REJECTED' ? 'destructive' : 'secondary'} className="text-[10px] px-1.5 py-0">
                        {p.status}
                      </Badge>
                    </div>
                    <div className="text-xs font-mono text-white mb-1.5">UID: {p.gameUid}</div>
                    <div className="text-[10px] text-muted-foreground flex justify-between">
                      <span className="truncate pr-1">{p.user?.username || 'Unknown'}</span>
                      <span>{p.user?.phone || 'N/A'}</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-1.5 mt-2.5">
                    <Button 
                      variant={p.status === 'JOINED' ? 'default' : 'outline'}
                      className={`h-7 px-2 text-[10px] flex-1 ${p.status === 'JOINED' ? 'bg-green-600 hover:bg-green-700 text-white' : ''}`}
                      onClick={() => handleVerify(p.id, 'JOINED')}
                      disabled={isPending || p.status === 'JOINED'}
                    >
                      {p.status === 'JOINED' ? '✓ Accepted' : 'Accept'}
                    </Button>
                    <Button 
                      variant={p.status === 'REJECTED' ? 'destructive' : 'outline'}
                      className="h-7 px-2 text-[10px] flex-1"
                      onClick={() => handleVerify(p.id, 'REJECTED')}
                      disabled={isPending || p.status === 'REJECTED'}
                    >
                      {p.status === 'REJECTED' ? '✕ Rejected' : 'Reject'}
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )
      ) : (
        <Card className="flex flex-col items-center justify-center p-12 text-center border-dashed">
          <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
            <Users className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold">Select a Match</h3>
          <p className="text-sm text-muted-foreground max-w-sm">
            Please select an assigned match from the dropdown above to view and manage its participants.
          </p>
        </Card>
      )}
    </div>
  )
}

export default function AdminParticipantsPage() {
  return (
    <Suspense fallback={<SkeletonLoader className="h-24 w-full" />}>
      <AdminParticipantsPageContent />
    </Suspense>
  )
}
