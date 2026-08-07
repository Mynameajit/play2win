'use client'

import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/apiClient'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Download, Search, ChevronLeft, ChevronRight, CheckCircle, ArrowLeft } from 'lucide-react'
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
  tournament: { title: string, game: string }
  admin: { username: string }
  winner: { username: string, fullName: string }
  participant: { gameUid: string, ign: string }
  rank: number
  kills: number
  prizeAmount: string
  screenshotUrl: string
  remarks: string
  status: string
  createdAt: string
  editHistory?: any[]
}

export default function ResultHistoryPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const limit = 20

  const { data, isLoading } = useQuery({
    queryKey: ['superAdminResultHistory', page, search, statusFilter],
    queryFn: async () => {
      let url = `/superadmin/match-results?page=${page}&limit=${limit}`
      if (statusFilter !== 'ALL') url += `&status=${statusFilter}`
      if (search) url += `&search=${search}` // Assuming backend supports search, if not it just ignores
      const res = await apiClient.get(url)
      return res.data
    }
  })

  const handleExport = () => {
    if (!data?.results) return
    const csvContent = [
      ['Tournament', 'Game', 'Winner UID', 'Winner IGN', 'Rank', 'Kills', 'Prize', 'Status', 'Declared By', 'Date'].join(','),
      ...data.results.map((r: MatchResult) => [
        `"${r.tournament.title}"`,
        r.tournament.game,
        r.participant.gameUid,
        r.participant.ign,
        r.rank,
        r.kills,
        r.prizeAmount,
        r.status,
        r.admin.username,
        new Date(r.createdAt).toLocaleDateString()
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `result_history_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }

  const results: MatchResult[] = data?.results || []
  const pagination = data?.pagination || { totalPages: 1 }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link href="/superadmin/results" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-2">
            <ArrowLeft className="w-4 h-4 mr-1" /> Back to Pending Reviews
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">Result History</h1>
          <p className="text-muted-foreground mt-1">Audit log of all approved, rejected, and edited match results.</p>
        </div>
        <Button onClick={handleExport} variant="outline" className="shrink-0">
          <Download className="w-4 h-4 mr-2" /> Export CSV
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
            <div>
              <CardTitle>All Uploaded Results</CardTitle>
              <CardDescription>View detailed history and audit logs.</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search..." 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Status</SelectItem>
                  <SelectItem value="APPROVED">Approved</SelectItem>
                  <SelectItem value="REJECTED">Rejected</SelectItem>
                  <SelectItem value="PENDING_APPROVAL">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tournament</TableHead>
                  <TableHead>Winner Profile</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Prize</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Admin</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow><TableCell colSpan={8} className="text-center py-8">Loading history...</TableCell></TableRow>
                ) : results.length === 0 ? (
                  <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">No results found.</TableCell></TableRow>
                ) : (
                  results.map((res) => (
                    <TableRow key={res.id}>
                      <TableCell>
                        <div className="font-medium line-clamp-1 max-w-[150px]" title={res.tournament.title}>{res.tournament.title}</div>
                        <div className="text-[10px] text-muted-foreground">{res.tournament.game}</div>
                      </TableCell>
                      <TableCell>
                        <div className="font-bold text-sm flex items-center gap-1">
                          <CheckCircle className="w-3 h-3 text-green-500" />
                          {res.winner.fullName || res.winner.username}
                        </div>
                        <div className="text-[10px] text-muted-foreground font-mono">UID: {res.participant.gameUid}</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">R: #{res.rank} | K: {res.kills}</div>
                      </TableCell>
                      <TableCell>
                        <span className="font-bold text-yellow-500 text-sm">₹{res.prizeAmount}</span>
                      </TableCell>
                      <TableCell>
                        <Badge variant={res.status === 'APPROVED' ? 'default' : res.status === 'REJECTED' ? 'destructive' : 'secondary'} className="text-[10px]">
                          {res.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{res.admin.username}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs">{new Date(res.createdAt).toLocaleDateString()}</span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 text-xs underline">Audit</Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-xl">
                            <DialogHeader><DialogTitle>Result Audit Details</DialogTitle></DialogHeader>
                            <div className="space-y-4 mt-2">
                              <div className="grid grid-cols-2 gap-4 border p-4 rounded-md bg-muted/20">
                                <div>
                                  <p className="text-xs text-muted-foreground uppercase">Tournament</p>
                                  <p className="font-medium text-sm">{res.tournament.title}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-muted-foreground uppercase">Uploaded By</p>
                                  <p className="font-medium text-sm">{res.admin.username}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-muted-foreground uppercase">Winner UID</p>
                                  <p className="font-mono text-sm text-primary">{res.participant.gameUid}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-muted-foreground uppercase">Prize</p>
                                  <p className="font-bold text-sm text-yellow-500">₹{res.prizeAmount}</p>
                                </div>
                              </div>
                              <div>
                                <p className="text-sm font-semibold mb-2">Screenshot Evidence</p>
                                {res.screenshotUrl ? (
                                  <img src={res.screenshotUrl} alt="Evidence" className="w-full max-h-[300px] object-cover rounded-md border" />
                                ) : (
                                  <div className="p-4 border rounded bg-muted">No screenshot provided.</div>
                                )}
                              </div>
                              {res.remarks && (
                                <div className="p-3 border rounded text-sm bg-muted/50">
                                  <span className="font-bold">Remarks: </span>{res.remarks}
                                </div>
                              )}
                              
                              {res.editHistory && Array.isArray(res.editHistory) && res.editHistory.length > 0 && (
                                <div className="mt-4 border-t pt-4">
                                  <h4 className="font-bold text-red-500 mb-2 flex items-center gap-2">⚠️ Edit History</h4>
                                  <div className="space-y-2">
                                    {res.editHistory.map((edit: any, i: number) => (
                                      <div key={i} className="p-3 bg-red-500/10 border border-red-500/20 rounded-md text-xs">
                                        <p><span className="font-semibold">Edited At:</span> {new Date(edit.editedAt).toLocaleString()}</p>
                                        <p><span className="font-semibold">Reason:</span> {edit.reason}</p>
                                        <div className="mt-2 text-[10px] text-muted-foreground break-all bg-background p-2 rounded">
                                          Old Values: {JSON.stringify(edit.oldValues)}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          
          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-muted-foreground">
              Showing page {pagination.page} of {pagination.totalPages}
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => setPage(p => p + 1)} disabled={page >= pagination.totalPages}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
