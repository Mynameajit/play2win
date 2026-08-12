'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { 
  useAdminMatchDetails, 
  useAdminParticipants, 
  useAdminUpdateRoom, 
  useAdminUploadResults, 
  uploadImage 
} from '@/hooks/useAdminOps'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { SkeletonLoader } from '@/components/ui/SkeletonLoader'
import { ErrorState } from '@/components/ui/ErrorState'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ArrowLeft, Users, Send, Upload, Trophy, Clock, ShieldAlert } from 'lucide-react'
import { format } from 'date-fns'
import { toast } from '@/hooks/use-toast'
import Link from 'next/link'

export default function MatchDetailsPage() {
  const { id } = useParams()
  const router = useRouter()
  const matchId = id as string

  // Fetch Match Details
  const { data: matchResponse, isLoading, isError, refetch } = useAdminMatchDetails(matchId)
  const match = matchResponse as any
  
  // Fetch Participants
  const { data: participantsData, isLoading: isLoadingParticipants } = useAdminParticipants(matchId)
  const participants = Array.isArray(participantsData) ? participantsData : (participantsData?.participants || [])

  // Room Management State
  const [roomId, setRoomId] = useState('')
  const [roomPassword, setRoomPassword] = useState('')
  const { mutate: updateRoom, isPending: isUpdatingRoom } = useAdminUpdateRoom()

  // Result Upload State
  const [winners, setWinners] = useState<{ rank: number, winnerUid: string }[]>([])
  const [remarks, setRemarks] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const { mutate: uploadResult, isPending: isSubmittingResult } = useAdminUploadResults()
  
  const [activeDropdown, setActiveDropdown] = useState<number | null>(null)

  // Initialize data when match loads
  useEffect(() => {
    if (match) {
      if (match.roomId) setRoomId(match.roomId)
      if (match.roomPassword) setRoomPassword(match.roomPassword)
      
      // Auto-configure winner ranks based on prize distribution
      if (match.prizeDistribution && Object.keys(match.prizeDistribution).length > 0) {
        const ranksCount = Object.keys(match.prizeDistribution).length
        const initialWinners = Array.from({ length: ranksCount }, (_, i) => ({ rank: i + 1, winnerUid: '' }))
        setWinners(initialWinners)
      } else {
        setWinners([{ rank: 1, winnerUid: '' }])
      }
    }
  }, [match])

  const [currentTime, setCurrentTime] = useState(Date.now())
  
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(Date.now()), 10000)
    return () => clearInterval(timer)
  }, [])

  // Handlers
  const handleRoomSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!roomId || !roomPassword) {
      toast({ title: 'Missing fields', description: 'Room ID and Password are required.', variant: 'destructive' })
      return
    }
    updateRoom({ id: matchId, roomId, roomPassword }, {
      onSuccess: () => {
        toast({ title: 'Room Details Sent!', description: 'Participants will be notified.' })
      },
      onError: (err: any) => {
        toast({ title: 'Failed', description: err.message || 'Could not update room details.', variant: 'destructive' })
      }
    })
  }

  const handleWinnerChange = (rank: number, uid: string) => {
    setWinners(prev => prev.map(w => w.rank === rank ? { ...w, winnerUid: uid } : w))
  }

  const handleResultSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const incompleteWinners = winners.some(w => !w.winnerUid)
    if (incompleteWinners) {
      toast({ title: 'Incomplete Winners', description: 'Please enter Game UIDs for all ranks.', variant: 'destructive' })
      return
    }

    if (!file) {
      toast({ title: 'Missing Screenshot', description: 'Please upload a screenshot evidence.', variant: 'destructive' })
      return
    }

    setIsUploading(true)
    try {
      const resultsScreenshot = await uploadImage(file)
      uploadResult({
        id: matchId,
        winners,
        resultsScreenshot,
        resultsRemarks: remarks
      }, {
        onSuccess: () => {
          toast({ title: 'Result uploaded successfully', description: 'Pending Super Admin review.' })
          refetch()
        },
        onError: (err: any) => {
          toast({ title: 'Upload failed', description: err.message || 'An error occurred.', variant: 'destructive' })
        }
      })
    } catch (err: any) {
      toast({ title: 'Image upload failed', description: err.message || 'An error occurred.', variant: 'destructive' })
    } finally {
      setIsUploading(false)
    }
  }

  if (isLoading) return <div className="p-6"><SkeletonLoader className="h-64" /></div>
  if (isError || !match) return <div className="p-6"><ErrorState message="Match not found" onRetry={() => router.push('/admin/matches')} /></div>

  const isCompleted = ['COMPLETED', 'PRIZE_DISTRIBUTED', 'RESULT_PENDING'].includes(match.status)

  const matchStartTime = new Date(match.startTime).getTime()
  const isRoomAllowed = currentTime >= matchStartTime - 5 * 60 * 1000
  const isResultAllowed = currentTime >= matchStartTime + 5 * 60 * 1000

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" className="h-8 w-8 shrink-0" onClick={() => router.push('/admin/matches')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="min-w-0">
            <h2 className="text-lg font-bold tracking-tight leading-tight">Match Details</h2>
            <p className="text-xs text-muted-foreground truncate">{match.title}</p>
          </div>
        </div>
        <Button size="sm" onClick={() => router.push(`/admin/participants?matchId=${matchId}`)} className="bg-purple-600 hover:bg-purple-700 text-white gap-2 h-8 w-full sm:w-auto">
          <Users className="w-3 h-3" /> View Participants
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Match Info Card */}
        <Card className="lg:col-span-1 overflow-hidden">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground">OVERVIEW</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 space-y-1">
            <div className="flex justify-between items-center py-1.5 border-b border-white/5 text-sm">
              <span className="text-muted-foreground">Game</span>
              <span className="font-medium">{match.game} - {match.mode}</span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-white/5 text-sm">
              <span className="text-muted-foreground">Schedule</span>
              <span className="font-medium text-xs">{format(new Date(match.startTime), 'PPP p')}</span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-white/5 text-sm">
              <span className="text-muted-foreground">Status</span>
              <Badge variant={match.status === 'LIVE' ? 'destructive' : 'default'} className="text-[10px] h-5">{match.status}</Badge>
            </div>
            <div className="flex justify-between items-center py-1.5 text-sm">
              <span className="text-muted-foreground">Participants</span>
              <span className="font-medium">{match.joinedSlots} / {match.totalSlots}</span>
            </div>
          </CardContent>
        </Card>

        {/* Room Management */}
        <Card className="lg:col-span-2 overflow-hidden">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-[15px]">Room Management</CardTitle>
            <CardDescription className="text-xs mt-0.5">Send room ID and password to all participants.</CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-2">
            <form onSubmit={handleRoomSubmit} className="space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label className="text-xs">Room ID</Label>
                  <Input 
                    value={roomId} 
                    onChange={e => setRoomId(e.target.value)} 
                    placeholder="Enter Room ID" 
                    disabled={isCompleted || !isRoomAllowed}
                    className="h-8 text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Password</Label>
                  <Input 
                    value={roomPassword} 
                    onChange={e => setRoomPassword(e.target.value)} 
                    placeholder="Enter Room Password" 
                    disabled={isCompleted || !isRoomAllowed}
                    className="h-8 text-sm"
                  />
                </div>
              </div>
              <Button type="submit" disabled={isUpdatingRoom || isCompleted || !roomId || !isRoomAllowed} className="gap-1 h-8 text-xs w-full sm:w-auto">
                <Send className="h-3 w-3" />
                {isUpdatingRoom ? 'Sending...' : 'Notify Participants'}
              </Button>
              {isCompleted && <p className="text-[10px] text-muted-foreground mt-1">Cannot update room for completed matches.</p>}
              {!isCompleted && !isRoomAllowed && <p className="text-[10px] text-destructive mt-1 font-medium">Room management unlocks 5 minutes before match starts.</p>}
            </form>
          </CardContent>
        </Card>
      </div>



      {/* Result Upload Section */}
      <Card className="overflow-hidden">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-[15px] flex items-center gap-1.5">
            <Upload className="h-4 w-4" /> Upload Results
          </CardTitle>
          <CardDescription className="text-xs mt-0.5">
            {isCompleted 
              ? 'Results for this match have already been uploaded.' 
              : 'Submit winner details for review once the match is over.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 pt-2">
          {isCompleted ? (
            <div className="p-3 bg-green-500/10 text-green-500 border border-green-500/20 rounded-lg flex items-center gap-2">
              <Trophy className="h-4 w-4" />
              <div>
                <p className="font-medium text-sm">Completed / Uploaded Result</p>
                <p className="text-[11px] opacity-80">This match's results are locked and pending super admin review or already processed.</p>
              </div>
            </div>
          ) : !isResultAllowed ? (
            <div className="p-3 bg-red-500/10 text-red-500 border border-red-500/20 rounded-lg flex items-center gap-2">
              <ShieldAlert className="h-4 w-4" />
              <div>
                <p className="font-medium text-sm">Action Locked</p>
                <p className="text-[11px] opacity-80">Result upload unlocks 5 minutes after the match starts to prevent early manipulation.</p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleResultSubmit} className="space-y-4">
              {winners.length > 0 && (
                <div className="space-y-3 p-3 border rounded-lg bg-accent/20">
                  <h3 className="font-medium text-xs text-muted-foreground">ENTER WINNERS</h3>
                  <div className="grid gap-3">
                    {winners.map((winner, idx) => (
                      <div key={idx} className="space-y-2">
                        <Label>Rank {winner.rank} Winner (UID / IGN)</Label>
                        <div className="relative">
                          <Input 
                            value={winner.winnerUid}
                            onChange={e => handleWinnerChange(winner.rank, e.target.value)}
                            onFocus={() => setActiveDropdown(winner.rank)}
                            onBlur={() => setTimeout(() => setActiveDropdown(null), 200)}
                            placeholder="Type UID or IGN to search..."
                            disabled={isCompleted || isLoadingParticipants}
                            required
                            autoComplete="off"
                          />
                          {activeDropdown === winner.rank && (
                            <div className="absolute z-50 mt-1 w-full max-h-60 overflow-auto rounded-md border bg-popover text-popover-foreground shadow-md p-1">
                              {participants
                                .filter((p: any) => {
                                  // Don't show participants who are already selected for OTHER ranks
                                  const isSelectedByOther = winners.some(w => w.rank !== winner.rank && w.winnerUid === p.gameUid);
                                  if (isSelectedByOther) return false;
                                  
                                  // Search filter
                                  return p.ign.toLowerCase().includes(winner.winnerUid.toLowerCase()) || p.gameUid.includes(winner.winnerUid);
                                })
                                .map((p: any) => (
                                  <div 
                                    key={p.id} 
                                    className="relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 px-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground border-b border-white/5 last:border-0"
                                    onClick={() => {
                                      handleWinnerChange(winner.rank, p.gameUid)
                                      setActiveDropdown(null)
                                    }}
                                  >
                                    <div className="flex flex-col">
                                      <span className="font-bold text-orange-400">{p.ign}</span>
                                      <span className="text-xs text-muted-foreground">{p.gameUid}</span>
                                    </div>
                                  </div>
                                ))}
                              {participants.filter((p: any) => {
                                const isSelectedByOther = winners.some(w => w.rank !== winner.rank && w.winnerUid === p.gameUid);
                                if (isSelectedByOther) return false;
                                return p.ign.toLowerCase().includes(winner.winnerUid.toLowerCase()) || p.gameUid.includes(winner.winnerUid);
                              }).length === 0 && (
                                <div className="py-6 px-2 text-sm text-muted-foreground text-center">No participants found.</div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Screenshot Evidence</Label>
                  <Input id="screenshot-upload" type="file" accept="image/*" onChange={e => setFile(e.target.files?.[0] || null)} />
                </div>
                <div className="space-y-2">
                  <Label>Remarks (Optional)</Label>
                  <Input value={remarks} onChange={e => setRemarks(e.target.value)} placeholder="Any issues or comments" />
                </div>
              </div>

              <Button type="submit" disabled={isSubmittingResult || isUploading} className="w-full sm:w-auto gap-2">
                <Upload className="h-4 w-4" />
                {isSubmittingResult || isUploading ? 'Uploading...' : 'Submit Result'}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
