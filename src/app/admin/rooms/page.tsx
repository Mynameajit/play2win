'use client'

import React, { useState } from 'react'
import { useAdminMatches, useAdminUpdateRoom, useAdminOpenRoom, useAdminMatchDetails, uploadImage } from '@/hooks/useAdminOps'
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { SkeletonLoader } from '@/components/ui/SkeletonLoader'
import { ErrorState } from '@/components/ui/ErrorState'
import { toast } from '@/hooks/use-toast'
import { KeyRound, ShieldAlert, Send } from 'lucide-react'
import { useSearchParams } from 'next/navigation'

function AdminRoomsContent() {
  const searchParams = useSearchParams()
  const initialMatchId = searchParams?.get('matchId') || ''
  
  const [selectedMatch, setSelectedMatch] = useState<string>(initialMatchId)
  
  React.useEffect(() => {
    if (initialMatchId) setSelectedMatch(initialMatchId)
  }, [initialMatchId])
  
  const { data: matchesData, isLoading: isLoadingMatches } = useAdminMatches({ limit: 100 })
  const matches = matchesData?.matches || []
  
  const { data: matchDetails, isLoading: isLoadingDetails, refetch } = useAdminMatchDetails(selectedMatch)
  
  const [roomId, setRoomId] = useState('')
  const [roomPassword, setRoomPassword] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  
  // Set initial form values when match details load
  React.useEffect(() => {
    if (matchDetails) {
      setRoomId(matchDetails.roomId || '')
      setRoomPassword(matchDetails.roomPassword || '')
    }
  }, [matchDetails])

  const { mutate: updateRoom, isPending: isUpdating } = useAdminUpdateRoom()
  const { mutate: openRoom, isPending: isOpenning } = useAdminOpenRoom()

  const handleUpdate = async () => {
    if (!selectedMatch) return
    setIsUploading(true)
    let roomScreenshot = matchDetails?.roomScreenshot || ''
    
    try {
      if (file) {
        roomScreenshot = await uploadImage(file)
      }
      
      updateRoom({ id: selectedMatch, roomId, roomPassword, roomScreenshot }, {
        onSuccess: () => {
          toast({ title: 'Room updated successfully' })
          setFile(null)
          refetch()
        },
        onError: (err: any) => {
          toast({ title: 'Error updating room', description: err.message, variant: 'destructive' })
        }
      })
    } catch (err: any) {
      toast({ title: 'Image upload failed', description: err.message, variant: 'destructive' })
    } finally {
      setIsUploading(false)
    }
  }

  const handleOpen = () => {
    if (!selectedMatch) return
    openRoom(selectedMatch, {
      onSuccess: () => {
        toast({ title: 'Room opened', description: 'Players have been notified' })
        refetch()
      },
      onError: (err: any) => {
        toast({ title: 'Error opening room', description: err.message, variant: 'destructive' })
      }
    })
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Room Management</h2>
        <p className="text-muted-foreground">
          Manage Room ID and Password for your assigned matches.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Select Match</CardTitle>
          <CardDescription>Choose an assigned match to manage its room details.</CardDescription>
        </CardHeader>
        <CardContent>
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
                    {m.title} - {m.status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </CardContent>
      </Card>

      {selectedMatch && (
        isLoadingDetails ? (
          <SkeletonLoader className="h-64" />
        ) : matchDetails ? (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Room Details</CardTitle>
                  <CardDescription>Update credentials and notify players.</CardDescription>
                </div>
                <Badge variant={matchDetails.status === 'ROOM_OPEN' ? 'destructive' : 'default'}>
                  {matchDetails.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="roomId">Room ID</Label>
                  <Input 
                    id="roomId" 
                    placeholder="Enter Room ID" 
                    value={roomId}
                    onChange={(e) => setRoomId(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="roomPassword">Room Password</Label>
                  <Input 
                    id="roomPassword" 
                    placeholder="Enter Room Password" 
                    value={roomPassword}
                    onChange={(e) => setRoomPassword(e.target.value)}
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="roomScreenshot">Room Screenshot (Evidence)</Label>
                  <Input 
                    id="roomScreenshot" 
                    type="file" 
                    accept="image/*"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                  />
                  {matchDetails.roomScreenshot && !file && (
                    <p className="text-sm text-muted-foreground mt-2">
                      <a href={matchDetails.roomScreenshot} target="_blank" rel="noreferrer" className="text-primary hover:underline">View current screenshot</a>
                    </p>
                  )}
                </div>
              </div>
              
              {matchDetails.status === 'ROOM_OPEN' && (
                <div className="bg-destructive/10 text-destructive border border-destructive/20 p-4 rounded-lg flex gap-3 items-start mt-4">
                  <ShieldAlert className="h-5 w-5 mt-0.5 shrink-0" />
                  <div className="text-sm">
                    <p className="font-semibold">Room is currently OPEN.</p>
                    <p>Players can see the credentials. Any updates will not automatically notify them again unless you manually communicate it.</p>
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex gap-2 justify-end bg-muted/50 p-4 border-t">
              <Button 
                variant="outline" 
                onClick={handleUpdate} 
                disabled={isUpdating || isUploading || !roomId}
              >
                {isUpdating || isUploading ? 'Saving...' : 'Save Details'}
              </Button>
              <Button 
                onClick={handleOpen}
                disabled={isOpenning || !roomId || matchDetails.status === 'ROOM_OPEN'}
                className="gap-2"
              >
                <Send className="h-4 w-4" />
                {isOpenning ? 'Opening...' : 'Open Room & Notify'}
              </Button>
            </CardFooter>
          </Card>
        ) : (
          <ErrorState message="Could not load match details" />
        )
      )}
    </div>
  )
}

export default function AdminRoomsPage() {
  return (
    <React.Suspense fallback={<SkeletonLoader className="h-64" />}>
      <AdminRoomsContent />
    </React.Suspense>
  )
}
