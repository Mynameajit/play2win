'use client'

import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Trophy } from 'lucide-react'

export default function ParticipantList({ participants, winnerUid }: { participants: any[], winnerUid?: string }) {
  if (!participants || participants.length === 0) {
    return <div className="text-center p-4 border rounded bg-muted/50 text-muted-foreground">No participants found.</div>
  }

  // Sort so winner is at the top
  const sortedParticipants = [...participants].sort((a, b) => {
    if (a.gameUid === winnerUid) return -1
    if (b.gameUid === winnerUid) return 1
    return 0
  })

  return (
    <div className="space-y-3">
      {sortedParticipants.map((p: any) => {
        const isWinner = p.gameUid === winnerUid
        return (
          <Card key={p.id} className={isWinner ? 'border-yellow-500 bg-yellow-500/5 dark:bg-yellow-500/10' : ''}>
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                  {p.user?.fullName?.charAt(0) || p.ign?.charAt(0) || '?'}
                </div>
                <div>
                  <div className="font-bold flex items-center gap-2">
                    {p.user?.fullName || 'Unknown User'} 
                    {isWinner && <Badge className="bg-yellow-500 hover:bg-yellow-600 text-xs py-0 h-5"><Trophy className="w-3 h-3 mr-1" /> Winner</Badge>}
                  </div>
                  <div className="text-xs text-muted-foreground flex gap-3 mt-1">
                    <span>IGN: {p.ign}</span>
                    <span className="font-mono">UID: {p.gameUid}</span>
                    <span>Phone: {p.user?.phone || 'N/A'}</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <Badge variant="outline" className={`
                  ${p.status === 'VERIFIED' || p.status === 'JOINED' ? 'text-green-500 border-green-500' : ''}
                  ${p.status === 'PENDING' ? 'text-yellow-500 border-yellow-500' : ''}
                  ${p.status === 'REJECTED' || p.status === 'WRONG_UID' ? 'text-red-500 border-red-500' : ''}
                `}>
                  {p.status}
                </Badge>
                <div className="text-[10px] text-muted-foreground mt-1">
                  {new Date(p.joinedAt).toLocaleDateString()}
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
