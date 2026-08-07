'use client'

import React from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useTournamentDetails } from '@/hooks/useTournaments'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, MapIcon, CalendarIcon, Gamepad2, Users, Trophy } from 'lucide-react'
import Image from 'next/image'
import ParticipantList from '@/components/ParticipantList'

export default function SuperAdminTournamentDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const matchId = params.id as string

  const { data: match, isLoading, isError } = useTournamentDetails(matchId)

  if (isLoading) return <div className="p-8 text-center animate-pulse">Loading match details...</div>
  if (isError || !match) return <div className="p-8 text-center text-destructive">Failed to load match details.</div>

  const winnerResult = match.matchResults?.find((r: any) => r.rank === 1)

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.push('/superadmin/tournaments')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{match.title}</h1>
            <p className="text-sm text-muted-foreground">Tournament Overview & Details</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground font-semibold">STATUS:</span>
          <select 
            value={match.status}
            onChange={async (e) => {
              try {
                const apiClient = (await import('@/lib/apiClient')).default
                await apiClient.patch(`/admin-ops/matches/${match.id}/status`, { status: e.target.value })
                window.location.reload()
              } catch(err) {
                console.error('Failed to change status', err)
              }
            }}
            className={`text-sm py-1.5 px-3 rounded-md font-bold uppercase border ${
              match.status === 'COMPLETED' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 
              match.status === 'LIVE' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
              'bg-slate-800 text-slate-200 border-slate-700'
            }`}
          >
            <option value="UPCOMING">UPCOMING</option>
            <option value="REGISTRATION_CLOSED">REGISTRATION CLOSED</option>
            <option value="ROOM_READY">ROOM READY</option>
            <option value="ROOM_OPEN">ROOM OPEN</option>
            <option value="LIVE">LIVE</option>
            <option value="RESULT_PENDING">RESULT PENDING</option>
            <option value="COMPLETED">COMPLETED</option>
            <option value="CANCELLED">CANCELLED</option>
          </select>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          {/* Match Info */}
          <Card>
            {match.banner && (
              <div className="w-full h-48 relative rounded-t-lg overflow-hidden">
                <Image src={match.banner} alt={match.title} fill className="object-cover" />
              </div>
            )}
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <span className="text-muted-foreground text-xs flex items-center gap-1"><Gamepad2 className="w-3 h-3"/> Game</span>
                  <p className="font-semibold">{match.game}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-muted-foreground text-xs flex items-center gap-1"><Gamepad2 className="w-3 h-3"/> Mode</span>
                  <p className="font-semibold">{match.mode}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-muted-foreground text-xs flex items-center gap-1"><MapIcon className="w-3 h-3"/> Map</span>
                  <p className="font-semibold">{match.map}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-muted-foreground text-xs flex items-center gap-1"><CalendarIcon className="w-3 h-3"/> Schedule</span>
                  <p className="font-semibold text-sm">{new Date(match.startTime).toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Winner Info */}
          {match.status === 'COMPLETED' && (
            <Card className="border-yellow-500 bg-yellow-50/50 dark:bg-yellow-500/10">
              <CardHeader>
                <CardTitle className="text-yellow-600 flex items-center gap-2">
                  <Trophy className="w-5 h-5" /> Winner Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                {winnerResult ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between border-b pb-1">
                        <span className="text-muted-foreground">Winner Name:</span>
                        <span className="font-medium">{winnerResult.winner?.fullName || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between border-b pb-1">
                        <span className="text-muted-foreground">User ID:</span>
                        <span className="font-mono text-xs">{winnerResult.winnerId}</span>
                      </div>
                      <div className="flex justify-between border-b pb-1">
                        <span className="text-muted-foreground">Game UID:</span>
                        <span className="font-mono text-xs">{winnerResult.participant?.gameUid || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between border-b pb-1">
                        <span className="text-muted-foreground">In-Game Name:</span>
                        <span className="font-medium">{winnerResult.participant?.ign || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between border-b pb-1">
                        <span className="text-muted-foreground">Prize Distributed:</span>
                        <span className="font-bold text-green-500">₹{winnerResult.prizeAmount}</span>
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground block mb-2 text-sm">Result Screenshot:</span>
                      {winnerResult.screenshotUrl ? (
                        <a href={winnerResult.screenshotUrl} target="_blank" rel="noreferrer">
                          <div className="relative h-32 w-full rounded-md overflow-hidden border">
                            <Image src={winnerResult.screenshotUrl} alt="Result Proof" fill className="object-cover" />
                          </div>
                        </a>
                      ) : (
                        <div className="h-32 bg-muted flex items-center justify-center rounded-md border text-sm text-muted-foreground">No screenshot</div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground">Results uploaded but no winner specified. (Screenshot: {match.resultsScreenshot ? 'Yes' : 'No'})</div>
                )}
                
                <div className="mt-4 pt-4 border-t text-xs text-muted-foreground flex justify-between">
                  <span>Declared By: Admin {winnerResult?.admin?.username || 'N/A'}</span>
                  {winnerResult?.createdAt && <span>Declared At: {new Date(winnerResult.createdAt).toLocaleString()}</span>}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Participants */}
          <div className="mt-6">
            <h3 className="text-lg font-bold mb-4">Participants List</h3>
            <ParticipantList 
              participants={match.participants || []} 
              winnerUid={winnerResult?.participant?.gameUid} 
            />
          </div>
        </div>

        <div className="space-y-6">
          {/* Admin Details */}
          <Card>
            <CardHeader>
              <CardTitle>Management</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <span className="text-muted-foreground text-xs">Assigned Admin</span>
                <p className="font-semibold">{match.assignedAdmin?.username || 'Not Assigned'}</p>
              </div>
              <div className="space-y-1">
                <span className="text-muted-foreground text-xs">Room ID</span>
                <p className="font-mono bg-muted px-2 py-1 rounded text-sm mt-1">{match.roomId || 'Not set'}</p>
              </div>
              <div className="space-y-1">
                <span className="text-muted-foreground text-xs">Room Password</span>
                <p className="font-mono bg-muted px-2 py-1 rounded text-sm mt-1">{match.roomPassword || 'Not set'}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
