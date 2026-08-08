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
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Participants</h2>
        <p className="text-muted-foreground">View and manage players for your assigned matches.</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="sm:w-64">
          {isLoadingMatches ? (
            <SkeletonLoader className="h-10" />
          ) : (
            <Select value={selectedMatch} onValueChange={setSelectedMatch}>
              <SelectTrigger>
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
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search IGN, UID or Phone..."
              className="pl-8"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        )}
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
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredParticipants.map((p: any) => (
              <Card key={p.id}>
                <CardHeader className="p-4 pb-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-base font-bold">{p.ign}</CardTitle>
                      <CardDescription className="text-xs">UID: {p.gameUid}</CardDescription>
                    </div>
                    <Badge variant={p.status === 'JOINED' ? 'default' : p.status === 'REJECTED' ? 'destructive' : 'secondary'}>
                      {p.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-2">
                  <div className="text-xs text-muted-foreground space-y-1">
                    <p>Player: {p.user?.username || 'Unknown'}</p>
                    <p>Phone: {p.user?.phone || 'N/A'}</p>
                  </div>
                  
                  {p.status === 'PENDING' && (
                    <div className="flex gap-2 mt-4">
                      <Button 
                        size="sm" 
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                        onClick={() => handleVerify(p.id, 'JOINED')}
                        disabled={isPending}
                      >
                        <Check className="h-4 w-4 mr-1" /> Approve
                      </Button>
                      <Button 
                        size="sm" 
                        variant="destructive"
                        className="flex-1"
                        onClick={() => handleVerify(p.id, 'REJECTED')}
                        disabled={isPending}
                      >
                        <X className="h-4 w-4 mr-1" /> Reject
                      </Button>
                    </div>
                  )}
                </CardContent>
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
