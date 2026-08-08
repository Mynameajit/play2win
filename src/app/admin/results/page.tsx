'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useAdminMatches, useAdminUploadResults, useAdminUploadedResults, useAdminParticipants, uploadImage } from '@/hooks/useAdminOps'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { SkeletonLoader } from '@/components/ui/SkeletonLoader'
import { toast } from '@/hooks/use-toast'
import { Upload, FileText, CheckCircle2, XCircle, Clock, ChevronDown } from 'lucide-react'

// Custom Searchable Dropdown for Participants
function SearchableParticipantSelect({ 
  participants, 
  value, 
  onChange, 
  disabled, 
  placeholder 
}: { 
  participants: any[]; 
  value: string; 
  onChange: (uid: string) => void; 
  disabled: boolean; 
  placeholder: string 
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const selectedParticipant = participants.find(p => p.gameUid === value)
  const filteredParticipants = participants.filter(p => {
    const term = search.toLowerCase()
    return p.gameUid.toLowerCase().includes(term) || 
           p.ign.toLowerCase().includes(term) || 
           (p.user?.fullName && p.user.fullName.toLowerCase().includes(term))
  })

  return (
    <div className="relative" ref={wrapperRef}>
      <div 
        className={`flex items-center justify-between min-h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm cursor-pointer ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-accent/50'}`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <span className="truncate">
          {selectedParticipant ? `${selectedParticipant.ign} (${selectedParticipant.gameUid})` : placeholder}
        </span>
        <ChevronDown className="h-4 w-4 opacity-50" />
      </div>

      {isOpen && !disabled && (
        <div className="absolute z-50 w-full mt-1 bg-popover text-popover-foreground border rounded-md shadow-md max-h-60 flex flex-col">
          <div className="p-2 border-b">
            <Input 
              autoFocus
              placeholder="Search UID, IGN, Name..." 
              value={search} 
              onChange={e => setSearch(e.target.value)}
              className="h-8"
            />
          </div>
          <div className="overflow-y-auto p-1">
            {filteredParticipants.length === 0 ? (
              <div className="p-2 text-sm text-center text-muted-foreground">No participants found.</div>
            ) : (
              filteredParticipants.map(p => (
                <div 
                  key={p.id} 
                  className={`px-2 py-1.5 text-sm rounded-sm cursor-pointer hover:bg-accent hover:text-accent-foreground ${value === p.gameUid ? 'bg-accent text-accent-foreground' : ''}`}
                  onClick={() => {
                    onChange(p.gameUid)
                    setIsOpen(false)
                    setSearch('')
                  }}
                >
                  <div className="font-medium">{p.ign}</div>
                  <div className="text-xs text-muted-foreground">UID: {p.gameUid} {p.user?.fullName ? `| ${p.user.fullName}` : ''}</div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default function AdminResultsPage() {
  const { data: matchesData, isLoading: isLoadingMatches } = useAdminMatches({ limit: 100 })
  const matches = matchesData?.data?.filter((m: any) => m.status === 'LIVE' || m.status === 'ROOM_OPEN' || m.status === 'COMPLETED') || []
  
  const { data: resultsData, isLoading: isLoadingResults } = useAdminUploadedResults()
  const history = resultsData?.data || []
  
  const [selectedMatch, setSelectedMatch] = useState('')
  const [winners, setWinners] = useState<{ rank: number, winnerUid: string }[]>([])
  
  const [remarks, setRemarks] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  
  const { data: participantsData, isLoading: isLoadingParticipants } = useAdminParticipants(selectedMatch)
  const participants = participantsData?.participants || []

  const { mutate: uploadResult, isPending } = useAdminUploadResults()

  // Reset and auto-configure winner fields when match changes
  useEffect(() => {
    setWinners([])
    if (selectedMatch) {
      const match = matches.find((m: any) => m.id === selectedMatch)
      if (match?.prizeDistribution) {
        const ranksCount = Object.keys(match.prizeDistribution).length
        const initialWinners = Array.from({ length: ranksCount }, (_, i) => ({ rank: i + 1, winnerUid: '' }))
        setWinners(initialWinners)
      } else {
        setWinners([{ rank: 1, winnerUid: '' }])
      }
    }
  }, [selectedMatch, matchesData])

  const handleWinnerChange = (rank: number, uid: string) => {
    // Check for duplicates
    if (uid !== '') {
      const isDuplicate = winners.some(w => w.rank !== rank && w.winnerUid === uid)
      if (isDuplicate) {
        toast({ title: 'Duplicate Participant', description: 'This participant is already selected for another rank.', variant: 'destructive' })
        return
      }
    }

    setWinners(prev => prev.map(w => w.rank === rank ? { ...w, winnerUid: uid } : w))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedMatch) {
      toast({ title: 'Missing required fields', description: 'Please select a match.', variant: 'destructive' })
      return
    }

    // Validate winners
    const incompleteWinners = winners.some(w => !w.winnerUid)
    if (incompleteWinners) {
      toast({ title: 'Incomplete Winners', description: 'Please select all required winners based on the prize distribution.', variant: 'destructive' })
      return
    }

    if (!file) {
      toast({ title: 'Missing required fields', description: 'Please upload a screenshot.', variant: 'destructive' })
      return
    }

    setIsUploading(true)
    try {
      const resultsScreenshot = await uploadImage(file)
      
      uploadResult({
        id: selectedMatch,
        winners,
        resultsScreenshot,
        resultsRemarks: remarks
      }, {
        onSuccess: () => {
          toast({ title: 'Result uploaded successfully', description: 'Pending Super Admin review.' })
          setSelectedMatch('')
          setWinners([])
          setRemarks('')
          setFile(null)
          // Reset file input visually
          const fileInput = document.getElementById('screenshot-upload') as HTMLInputElement
          if (fileInput) fileInput.value = ''
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

  const getStatusIcon = (status: string) => {
    if (status === 'APPROVED') return <CheckCircle2 className="h-4 w-4 text-green-500" />
    if (status === 'REJECTED') return <XCircle className="h-4 w-4 text-red-500" />
    return <Clock className="h-4 w-4 text-yellow-500" />
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Result Management</h2>
        <p className="text-muted-foreground">Upload match results and view your submission history.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Upload Result</CardTitle>
            <CardDescription>Submit winner details for review.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label>Select Match</Label>
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
              
              {winners.length > 0 && (
                <div className="space-y-4 p-4 border rounded-lg bg-accent/20">
                  <h3 className="font-medium text-sm text-muted-foreground">Select Winners</h3>
                  <div className="grid gap-4">
                    {winners.map((winner) => (
                      <div key={winner.rank} className="flex flex-col sm:flex-row sm:items-center gap-3">
                        <div className="sm:w-24 shrink-0 font-medium text-sm">
                          {winner.rank}{winner.rank === 1 ? 'st' : winner.rank === 2 ? 'nd' : winner.rank === 3 ? 'rd' : 'th'} Winner
                        </div>
                        <div className="flex-1">
                          <SearchableParticipantSelect 
                            participants={participants} 
                            value={winner.winnerUid} 
                            onChange={(uid) => handleWinnerChange(winner.rank, uid)} 
                            disabled={!selectedMatch || isLoadingParticipants} 
                            placeholder="Search Participant..." 
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Screenshot Evidence</Label>
                  <Input id="screenshot-upload" type="file" accept="image/*" onChange={e => setFile(e.target.files?.[0] || null)} />
                </div>
                
                <div className="space-y-2">
                  <Label>Remarks (Optional)</Label>
                  <Input value={remarks} onChange={e => setRemarks(e.target.value)} placeholder="Any issues or comments" />
                </div>
              </div>

              <Button type="submit" disabled={isPending || isUploading} className="w-full sm:w-auto gap-2">
                <Upload className="h-4 w-4" />
                {isPending || isUploading ? 'Uploading...' : 'Submit Result'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Uploads</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingResults ? (
              <div className="space-y-4">
                {Array(3).fill(0).map((_, i) => (
                  <SkeletonLoader key={i} className="h-16 mb-2" />
                ))}
              </div>
            ) : history.length > 0 ? (
              <div className="space-y-4">
                {history.slice(0, 5).map((result: any) => (
                  <div key={result.id} className="flex items-center gap-3 p-3 rounded-lg border bg-card">
                    <div className="h-10 w-10 shrink-0 bg-muted rounded flex items-center justify-center">
                      <FileText className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{result.tournament?.title}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        Rank {result.rank} - Winner: {result.participant?.ign}
                      </p>
                    </div>
                    <div className="flex shrink-0 gap-1 items-center">
                      {getStatusIcon(result.status)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">No results uploaded yet.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
