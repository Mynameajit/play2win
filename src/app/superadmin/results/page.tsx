'use client'

import React, { useState } from 'react'
import { uploadImage } from '@/hooks/useAdminOps'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/apiClient'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Trophy, CheckCircle, Image as ImageIcon, Eye, XCircle, Edit, Users, Gamepad2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import Link from 'next/link'

interface MatchResult {
  id: string
  tournament: { title: string, game: string, banner: string, participants: any[] }
  admin: { username: string, fullName: string }
  winner: { username: string, fullName: string }
  participant: { gameUid: string, ign: string, joinedAt: string }
  winnerId: string
  rank: number
  kills: number
  prizeAmount: string
  screenshotUrl: string
  remarks: string
  status: string
  createdAt: string
}

function ParticipantsModal({ participants, winnerUid }: { participants: any[], winnerUid: string }) {
  return (
    <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
      <DialogHeader>
        <DialogTitle>Tournament Participants History</DialogTitle>
      </DialogHeader>
      <div className="flex-1 mt-4 rounded-md border p-4 overflow-y-auto custom-scrollbar max-h-[60vh]">
        <div className="space-y-4">
          {participants.map((p) => {
            const isWinner = p.gameUid === winnerUid
            return (
              <div key={p.id} className={`p-4 rounded-lg border flex justify-between items-center ${isWinner ? 'bg-green-500/10 border-green-500/50' : 'bg-card'}`}>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center font-bold">
                    {p.user?.fullName?.charAt(0) || p.user?.username?.charAt(0) || '?'}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold">{p.user?.fullName || p.user?.username}</span>
                      {isWinner && <Badge className="bg-green-500 text-white border-0 py-0 h-5">Winner</Badge>}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      IGN: <span className="font-mono text-primary">{p.ign}</span> | UID: <span className="font-mono text-primary">{p.gameUid}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">Mobile: {p.user?.phone}</div>
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant={p.status === 'JOINED' ? 'default' : 'secondary'}>{p.status}</Badge>
                  <div className="text-[10px] text-muted-foreground mt-2">
                    Joined: {new Date(p.joinedAt).toLocaleString()}
                  </div>
                </div>
              </div>
            )
          })}
          {participants.length === 0 && (
            <p className="text-center text-muted-foreground">No participants found.</p>
          )}
        </div>
      </div>
    </DialogContent>
  )
}

function EditResultModal({ result, onClose }: { result: MatchResult, onClose: () => void }) {
  const queryClient = useQueryClient()
  const { toast } = useToast()
  
  const [winnerUid, setWinnerUid] = useState(result.participant.gameUid)
  const [rank, setRank] = useState(result.rank.toString())
  const [kills, setKills] = useState(result.kills.toString())
  const [prize, setPrize] = useState(result.prizeAmount.toString())
  const [remarks, setRemarks] = useState(result.remarks || '')
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  const editMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiClient.put(`/superadmin/match-results/${result.id}/edit`, data)
      return res.data
    },
    onSuccess: () => {
      toast({ title: 'Result Edited', description: 'The match result was updated successfully.' })
      queryClient.invalidateQueries({ queryKey: ['superAdminPendingResults'] })
      onClose()
    },
    onError: (err: any) => {
      toast({ title: 'Failed to edit', description: err.response?.data?.message || err.message, variant: 'destructive' })
    }
  })

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsUploading(true)
    let finalScreenshotUrl = result.screenshotUrl
    try {
      if (file) {
        finalScreenshotUrl = await uploadImage(file)
      }
      editMutation.mutate({ winnerUid, rank, kills, prizeAmount: prize, remarks, screenshotUrl: finalScreenshotUrl })
    } catch (err: any) {
      toast({ title: 'Image upload failed', description: err.message, variant: 'destructive' })
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Edit Match Result</DialogTitle>
      </DialogHeader>
      <form onSubmit={handleEdit} className="space-y-4 mt-4">
        <div className="space-y-2">
          <Label>Winner Game UID</Label>
          <Input value={winnerUid} onChange={(e) => setWinnerUid(e.target.value)} required />
          <p className="text-xs text-muted-foreground">Must exactly match a joined participant's UID.</p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Rank</Label>
            <Input type="number" min="1" value={rank} onChange={(e) => setRank(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label>Kills</Label>
            <Input type="number" min="0" value={kills} onChange={(e) => setKills(e.target.value)} required />
          </div>
        </div>
        <div className="space-y-2">
          <Label>Prize Amount (₹)</Label>
          <Input type="number" step="0.01" min="0" value={prize} onChange={(e) => setPrize(e.target.value)} required />
        </div>
        <div className="space-y-2">
          <Label>Remarks (Audit Reason)</Label>
          <Textarea value={remarks} onChange={(e) => setRemarks(e.target.value)} required placeholder="Reason for editing..." />
        </div>
        <div className="space-y-2">
          <Label>Replace Screenshot (Optional)</Label>
          <Input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} />
        </div>
        <Button type="submit" disabled={editMutation.isPending || isUploading} className="w-full">
          {editMutation.isPending || isUploading ? 'Saving...' : 'Save Changes'}
        </Button>
      </form>
    </DialogContent>
  )
}

export default function PendingResultsPage() {
  const queryClient = useQueryClient()
  const { toast } = useToast()
  
  const [editingResult, setEditingResult] = useState<MatchResult | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['superAdminPendingResults'],
    queryFn: async () => {
      const res = await apiClient.get('/superadmin/match-results?status=PENDING_APPROVAL&limit=50')
      return res.data
    }
  })

  const approveMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiClient.post(`/superadmin/match-results/${id}/approve`)
      return res.data
    },
    onSuccess: () => {
      toast({ title: 'Result Approved', description: 'Wallet credited & tournament completed.' })
      queryClient.invalidateQueries({ queryKey: ['superAdminPendingResults'] })
    },
    onError: (err: any) => {
      toast({ title: 'Failed to approve', description: err.response?.data?.message || err.message, variant: 'destructive' })
    }
  })

  const rejectMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiClient.post(`/superadmin/match-results/${id}/reject`)
      return res.data
    },
    onSuccess: () => {
      toast({ title: 'Result Rejected', description: 'Admin has been notified to re-upload.' })
      queryClient.invalidateQueries({ queryKey: ['superAdminPendingResults'] })
    },
    onError: (err: any) => {
      toast({ title: 'Failed to reject', description: err.response?.data?.message || err.message, variant: 'destructive' })
    }
  })

  const handleApprove = (id: string) => {
    if (confirm('Are you sure you want to approve this result? This will credit the winning amount to the user\'s wallet instantly.')) {
      approveMutation.mutate(id)
    }
  }

  const handleReject = (id: string) => {
    if (confirm('Are you sure you want to reject this result? The admin will have to submit it again.')) {
      rejectMutation.mutate(id)
    }
  }

  if (isLoading) {
    return <div className="p-8 text-center animate-pulse">Loading Pending Results...</div>
  }

  const results: MatchResult[] = data?.results || []

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pending Result Reviews</h1>
          <p className="text-muted-foreground mt-1">Review results submitted by Room Admins before prize money is distributed.</p>
        </div>
        <Link href="/superadmin/results/history">
          <Button variant="outline">View Result History</Button>
        </Link>
      </div>

      {results.length === 0 ? (
        <div className="flex h-48 items-center justify-center rounded-xl border border-dashed bg-muted/50">
          <p className="text-muted-foreground font-medium text-lg">No pending results to review! 🎉</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {results.map((res) => (
            <Card key={res.id} className="overflow-hidden flex flex-col md:flex-row">
              <div className="w-full md:w-48 bg-slate-900 relative min-h-[120px]">
                {res.tournament.banner ? (
                  <img src={res.tournament.banner} alt="Tournament" className="w-full h-full object-cover opacity-60" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-500">
                    <Gamepad2 className="w-8 h-8 mb-2 opacity-50" />
                    <span className="text-xs">{res.tournament.game}</span>
                  </div>
                )}
                <div className="absolute top-2 left-2">
                  <Badge variant="secondary" className="bg-orange-500 text-white border-0">Pending</Badge>
                </div>
              </div>
              
              <CardContent className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-lg leading-tight mb-1">{res.tournament.title}</h3>
                  <div className="text-xs text-muted-foreground mb-4">
                    Submitted by: <span className="font-semibold text-primary">{res.admin.username}</span> at {new Date(res.createdAt).toLocaleString()}
                  </div>

                  <div className="bg-muted/50 rounded-lg p-3 grid grid-cols-2 gap-y-3 mb-4 border">
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase font-semibold">Winner</p>
                      <p className="font-bold text-green-500 text-sm leading-tight flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" /> {res.winner.fullName || res.winner.username}
                      </p>
                      <p className="text-[10px] text-muted-foreground font-mono mt-0.5">UID: {res.participant.gameUid}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase font-semibold">Rank / Kills</p>
                      <p className="font-bold text-sm">#{res.rank} / {res.kills}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase font-semibold">Prize</p>
                      <p className="font-bold text-yellow-500 text-sm">₹{res.prizeAmount}</p>
                    </div>
                    <div>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="link" className="p-0 h-auto text-xs text-primary flex items-center gap-1">
                            <Eye className="w-3 h-3" /> View Screenshot
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-2xl">
                          <DialogHeader><DialogTitle>Result Screenshot</DialogTitle></DialogHeader>
                          <img src={res.screenshotUrl} alt="Evidence" className="w-full rounded-md mt-4" />
                          {res.remarks && (
                            <div className="p-3 bg-muted rounded-md mt-4 text-sm border">
                              <span className="font-semibold block mb-1">Remarks:</span>
                              {res.remarks}
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 pt-2 border-t">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="flex-1 text-xs">
                        <Users className="w-3 h-3 mr-1" /> Participants
                      </Button>
                    </DialogTrigger>
                    <ParticipantsModal participants={res.tournament.participants} winnerUid={res.participant.gameUid} />
                  </Dialog>
                  
                  <Dialog open={editingResult?.id === res.id} onOpenChange={(open) => !open && setEditingResult(null)}>
                    <DialogTrigger asChild>
                      <Button variant="secondary" size="sm" className="flex-1 text-xs" onClick={() => setEditingResult(res)}>
                        <Edit className="w-3 h-3 mr-1" /> Edit
                      </Button>
                    </DialogTrigger>
                    {editingResult?.id === res.id && <EditResultModal result={res} onClose={() => setEditingResult(null)} />}
                  </Dialog>
                  
                  <Button variant="destructive" size="sm" className="flex-1 text-xs" onClick={() => handleReject(res.id)} disabled={rejectMutation.isPending}>
                    <XCircle className="w-3 h-3 mr-1" /> Reject
                  </Button>
                  
                  <Button variant="default" size="sm" className="flex-1 text-xs bg-green-600 hover:bg-green-700" onClick={() => handleApprove(res.id)} disabled={approveMutation.isPending}>
                    <Trophy className="w-3 h-3 mr-1" /> Approve & Pay
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
