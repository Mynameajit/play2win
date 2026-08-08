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
import { ArrowLeft, Users, Send, Upload, Trophy, Clock } from 'lucide-react'
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
  const participants = participantsData?.participants || []

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

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.push('/admin/matches')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Match Details</h2>
          <p className="text-muted-foreground">{match.title}</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Match Info Card */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-muted-foreground">Game</span>
              <span className="font-medium">{match.game} - {match.mode}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-muted-foreground">Schedule</span>
              <span className="font-medium">{format(new Date(match.startTime), 'PPP p')}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-muted-foreground">Status</span>
              <Badge variant={match.status === 'LIVE' ? 'destructive' : 'default'}>{match.status}</Badge>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-muted-foreground">Participants</span>
              <span className="font-medium">{match.joinedSlots} / {match.totalSlots}</span>
            </div>
          </CardContent>
        </Card>

        {/* Room Management */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Room Management</CardTitle>
            <CardDescription>Send room ID and password to all participants.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleRoomSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Room ID</Label>
                  <Input 
                    value={roomId} 
                    onChange={e => setRoomId(e.target.value)} 
                    placeholder="Enter Room ID" 
                    disabled={isCompleted}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Password</Label>
                  <Input 
                    value={roomPassword} 
                    onChange={e => setRoomPassword(e.target.value)} 
                    placeholder="Enter Room Password" 
                    disabled={isCompleted}
                  />
                </div>
              </div>
              <Button type="submit" disabled={isUpdatingRoom || isCompleted || !roomId} className="gap-2">
                <Send className="h-4 w-4" />
                {isUpdatingRoom ? 'Sending...' : 'Notify Participants'}
              </Button>
              {isCompleted && <p className="text-xs text-muted-foreground mt-2">Cannot update room for completed matches.</p>}
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Participants List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" /> Participants ({participants.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingParticipants ? (
            <SkeletonLoader className="h-32" />
          ) : participants.length === 0 ? (
            <p className="text-sm text-muted-foreground">No participants have joined yet.</p>
          ) : (
            <div className="rounded-md border max-h-[300px] overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Game UID</TableHead>
                    <TableHead>In-Game Name</TableHead>
                    <TableHead>User Name</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {participants.map((p: any) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium">{p.gameUid}</TableCell>
                      <TableCell>{p.ign}</TableCell>
                      <TableCell>{p.user?.fullName || 'N/A'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Result Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" /> Upload Results
          </CardTitle>
          <CardDescription>
            {isCompleted 
              ? 'Results for this match have already been uploaded.' 
              : 'Submit winner details for review once the match is over.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isCompleted ? (
            <div className="p-4 bg-green-500/10 text-green-500 border border-green-500/20 rounded-lg flex items-center gap-3">
              <Trophy className="h-5 w-5" />
              <div>
                <p className="font-medium">Completed / Uploaded Result</p>
                <p className="text-sm opacity-80">This match's results are locked and pending super admin review or already processed.</p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleResultSubmit} className="space-y-6">
              {winners.length > 0 && (
                <div className="space-y-4 p-4 border rounded-lg bg-accent/20">
                  <h3 className="font-medium text-sm text-muted-foreground">Enter Winners</h3>
                  <div className="grid gap-4">
                    {winners.map((winner) => (
                      <div key={winner.rank} className="flex flex-col sm:flex-row sm:items-center gap-3">
                        <div className="sm:w-24 shrink-0 font-medium text-sm">
                          {winner.rank}{winner.rank === 1 ? 'st' : winner.rank === 2 ? 'nd' : winner.rank === 3 ? 'rd' : 'th'} Winner
                        </div>
                        <div className="flex-1">
                          <Input 
                            placeholder="Enter Participant Game UID..."
                            value={winner.winnerUid}
                            onChange={(e) => handleWinnerChange(winner.rank, e.target.value)}
                          />
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
