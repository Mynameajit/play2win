'use client'

import React, { useState } from 'react'
import { useAdminMatches } from '@/hooks/useAdminOps'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, Calendar, Users, Clock, Trophy } from 'lucide-react'
import { SkeletonLoader } from '@/components/ui/SkeletonLoader'
import { ErrorState } from '@/components/ui/ErrorState'
import { EmptyState } from '@/components/ui/EmptyState'
import { format } from 'date-fns'
import Link from 'next/link'
import { Tournament } from '@/hooks/useTournaments'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

export default function AdminMatchesPage() {
  const [search, setSearch] = useState('')
  const { data, isLoading, isError, refetch } = useAdminMatches({ search })

  const allMatches = data?.matches || []
  const matches = allMatches.filter((m: any) => !['RESULT_PENDING', 'COMPLETED', 'PRIZE_DISTRIBUTED'].includes(m.status))

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Assigned Matches</h2>
          <p className="text-muted-foreground">
            Manage the tournaments and matches assigned to you.
          </p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search matches..."
              className="pl-8 bg-background"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array(4).fill(0).map((_, i) => (
            <SkeletonLoader key={i} className="h-48" />
          ))}
        </div>
      ) : isError ? (
        <ErrorState message="Failed to load matches" onRetry={() => refetch()} />
      ) : matches.length === 0 ? (
        <EmptyState 
          title="No Matches Found" 
          message="You don't have any matches assigned to you matching the criteria."
          icon={Trophy}
        />
      ) : (
        <div className="space-y-4">
          <div className="hidden md:block rounded-md border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Match Info</TableHead>
                  <TableHead>Game Details</TableHead>
                  <TableHead>Schedule</TableHead>
                  <TableHead>Participants</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {matches.map((match: Tournament) => (
                  <TableRow key={match.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        {match.thumbnail ? (
                          <img src={match.thumbnail} alt={match.title} className="w-12 h-12 rounded object-cover" />
                        ) : (
                          <div className="w-12 h-12 rounded bg-muted flex items-center justify-center">
                            <Trophy className="h-6 w-6 text-muted-foreground opacity-50" />
                          </div>
                        )}
                        <span className="line-clamp-1 max-w-[180px]">{match.title}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Badge variant="outline" className="text-xs">{match.game}</Badge>
                        <Badge variant="outline" className="text-xs">{match.mode}</Badge>
                      </div>
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                      {format(new Date(match.startTime), 'PPP p')}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {match.joinedSlots} / {match.totalSlots}
                    </TableCell>
                    <TableCell>
                      <Badge variant={match.status === 'LIVE' ? 'destructive' : match.status === 'UPCOMING' ? 'default' : 'secondary'}>
                        {match.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right whitespace-nowrap">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/admin/participants?matchId=${match.id}`}>
                            Participants
                          </Link>
                        </Button>
                        <Button size="sm" asChild>
                          <Link href={`/admin/rooms?matchId=${match.id}`}>
                            Room
                          </Link>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          <div className="md:hidden grid gap-4 grid-cols-1 sm:grid-cols-2">
            {matches.map((match: Tournament) => (
              <Card key={match.id} className="overflow-hidden">
                <CardContent className="p-4 flex gap-4">
                  <div className="flex-shrink-0">
                    {match.thumbnail ? (
                      <img src={match.thumbnail} alt={match.title} className="w-16 h-16 rounded-md object-cover" />
                    ) : (
                      <div className="w-16 h-16 rounded-md bg-muted flex items-center justify-center">
                        <Trophy className="h-8 w-8 text-muted-foreground opacity-50" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col justify-between space-y-1">
                    <div className="flex justify-between items-start gap-2">
                      <h3 className="font-semibold text-sm line-clamp-1">{match.title}</h3>
                      <Badge variant={match.status === 'LIVE' ? 'destructive' : match.status === 'UPCOMING' ? 'default' : 'secondary'} className="text-[10px] px-1 py-0 h-4">
                        {match.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{match.game} - {match.mode}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span className="truncate">{format(new Date(match.startTime), 'MMM d, p')}</span>
                      <span>{match.joinedSlots}/{match.totalSlots} P</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="p-3 pt-0 flex gap-2">
                  <Button variant="outline" size="sm" className="w-full text-xs h-8" asChild>
                    <Link href={`/admin/participants?matchId=${match.id}`}>
                      Participants
                    </Link>
                  </Button>
                  <Button size="sm" className="w-full text-xs h-8" asChild>
                    <Link href={`/admin/rooms?matchId=${match.id}`}>
                      Manage Room
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
