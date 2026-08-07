'use client'

import React from 'react'
import { BellRing, Pin, X } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useActiveAnnouncement } from '@/hooks/useAnnouncements'
import { Skeleton } from '@/components/ui/skeleton'

export function AnnouncementCard() {
  const { data: announcement, isLoading } = useActiveAnnouncement()
  const [dismissed, setDismissed] = React.useState(false)

  if (isLoading) {
    return (
      <Card className="bg-purple-900/20 border-purple-500/30 overflow-hidden mb-6">
        <CardContent className="p-4 flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!announcement || dismissed) return null

  return (
    <Card className="bg-gradient-to-r from-purple-900/40 to-indigo-900/40 border-purple-500/30 overflow-hidden relative mb-6 animate-in slide-in-from-top-2">
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-purple-500" />
      <CardContent className="p-4 sm:p-6">
        <div className="flex gap-4">
          <div className="flex-shrink-0 mt-1 hidden sm:block">
            <div className="h-10 w-10 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400">
              {announcement.isPinned ? <Pin className="h-5 w-5" /> : <BellRing className="h-5 w-5" />}
            </div>
          </div>
          <div className="flex-1">
            <div className="flex items-start justify-between gap-4">
              <h3 className="font-semibold text-lg text-white">
                {announcement.title}
              </h3>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-6 w-6 text-muted-foreground hover:text-white -mr-2 -mt-2"
                onClick={() => setDismissed(true)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-gray-300 mt-1 text-sm whitespace-pre-line">
              {announcement.message}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
