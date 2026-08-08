'use client'

import React, { useState } from 'react'
import { useAdminMatches, useAdminUploadedResults } from '@/hooks/useAdminOps'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { SkeletonLoader } from '@/components/ui/SkeletonLoader'
import { CheckCircle2, XCircle, Clock, Trophy, Upload } from 'lucide-react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import Link from 'next/link'

export default function AdminResultsPage() {
  const { data: matchesData, isLoading: isLoadingMatches } = useAdminMatches({ limit: 100 })
  // Show matches that are LIVE, ROOM_OPEN, COMPLETED, RESULT_PENDING, PRIZE_DISTRIBUTED
  const matches = matchesData?.matches || []
  const relevantMatches = matches.filter((m: any) => 
    ['LIVE', 'ROOM_OPEN', 'RESULT_PENDING', 'COMPLETED', 'PRIZE_DISTRIBUTED'].includes(m.status)
  )
  
  const { data: resultsData, isLoading: isLoadingResults } = useAdminUploadedResults()
  const history = resultsData?.data || []

  const getStatusIcon = (status: string) => {
    if (status === 'APPROVED') return <CheckCircle2 className="h-4 w-4 text-green-500" />
    if (status === 'REJECTED') return <XCircle className="h-4 w-4 text-red-500" />
    return <Clock className="h-4 w-4 text-yellow-500" />
  }

  const isMatchCompleted = (matchStatus: string) => {
    return ['COMPLETED', 'PRIZE_DISTRIBUTED', 'RESULT_PENDING'].includes(matchStatus)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Result Management</h2>
        <p className="text-muted-foreground">Track and upload match results.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Matches</CardTitle>
            <CardDescription>Select a match to view details or upload results.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingMatches ? (
              <div className="space-y-4">
                {Array(4).fill(0).map((_, i) => (
                  <SkeletonLoader key={i} className="h-16 mb-2" />
                ))}
              </div>
            ) : relevantMatches.length > 0 ? (
              <div className="rounded-md border bg-card overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Match</TableHead>
                      <TableHead>Schedule</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {relevantMatches.map((match: any) => {
                      const completed = isMatchCompleted(match.status)
                      return (
                        <TableRow key={match.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-3">
                              {match.thumbnail ? (
                                <img src={match.thumbnail} alt={match.title} className="w-10 h-10 rounded object-cover" />
                              ) : (
                                <div className="w-10 h-10 rounded bg-muted flex items-center justify-center">
                                  <Trophy className="h-5 w-5 text-muted-foreground opacity-50" />
                                </div>
                              )}
                              <div>
                                <p className="line-clamp-1 max-w-[150px]">{match.title}</p>
                                <p className="text-xs text-muted-foreground">{match.game}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                            {format(new Date(match.startTime), 'MMM d, p')}
                          </TableCell>
                          <TableCell>
                            {completed ? (
                              <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                                Completed / Uploaded
                              </Badge>
                            ) : (
                              <Badge variant="secondary">Pending Result</Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right whitespace-nowrap">
                            <Button size="sm" variant={completed ? "outline" : "default"} asChild>
                              <Link href={`/admin/matches/${match.id}`}>
                                {completed ? 'View Details' : 'Upload Result'}
                              </Link>
                            </Button>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8 border rounded-md border-dashed">No matches require results.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Submissions</CardTitle>
            <CardDescription>Status of your uploaded results.</CardDescription>
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
                {history.slice(0, 10).map((result: any) => (
                  <div key={result.id} className="flex items-center gap-3 p-3 rounded-lg border bg-card">
                    <div className="h-10 w-10 shrink-0 bg-muted rounded flex items-center justify-center">
                      <Trophy className="h-5 w-5 text-muted-foreground" />
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
