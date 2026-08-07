'use client'

import React, { useState } from 'react'
import { Bell, Check, Trash2, Settings, UserPlus, Trophy, DollarSign, AlertCircle, Info, Ticket, X } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useNotifications, Notification } from '@/hooks/useNotifications'
import { Skeleton } from '@/components/ui/skeleton'

export default function NotificationsView() {
  const { data: notifications, isLoading, markAsRead, markAllAsRead, deleteNotification, deleteAll } = useNotifications()
  const [filter, setFilter] = useState<'all' | 'unread'>('all')

  const getIcon = (type: string) => {
    switch (type) {
      case 'MATCH':
      case 'TOURNAMENT':
        return <Trophy className="h-5 w-5 text-purple-500" />
      case 'WALLET':
      case 'PAYMENT':
        return <DollarSign className="h-5 w-5 text-green-500" />
      case 'SYSTEM':
      case 'SECURITY':
        return <AlertCircle className="h-5 w-5 text-red-500" />
      case 'SUPPORT':
        return <Ticket className="h-5 w-5 text-blue-500" />
      case 'OFFER':
      case 'ANNOUNCEMENT':
        return <Info className="h-5 w-5 text-yellow-500" />
      default:
        return <Bell className="h-5 w-5 text-gray-500" />
    }
  }

  const filtered = notifications?.filter(n => filter === 'all' || !n.isRead) || []
  const unreadCount = notifications?.filter(n => !n.isRead).length || 0

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Notification Center</h2>
          <p className="text-muted-foreground">Stay updated with your latest alerts and messages.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => markAllAsRead.mutate()} disabled={unreadCount === 0 || markAllAsRead.isPending}>
            <Check className="mr-2 h-4 w-4" />
            Mark all as read
          </Button>
          <Button variant="outline" size="sm" onClick={() => deleteAll.mutate()} disabled={filtered.length === 0 || deleteAll.isPending}>
            <Trash2 className="mr-2 h-4 w-4" />
            Clear all
          </Button>
        </div>
      </div>

      <Card className="border-purple-500/20 bg-black/40 backdrop-blur-xl">
        <CardHeader className="border-b border-white/5 pb-4">
          <div className="flex items-center gap-4">
            <Button
              variant={filter === 'all' ? 'default' : 'ghost'}
              className={filter === 'all' ? 'bg-purple-600 hover:bg-purple-700' : ''}
              onClick={() => setFilter('all')}
            >
              All
            </Button>
            <Button
              variant={filter === 'unread' ? 'default' : 'ghost'}
              className={filter === 'unread' ? 'bg-purple-600 hover:bg-purple-700' : ''}
              onClick={() => setFilter('unread')}
            >
              Unread
              {unreadCount > 0 && (
                <Badge variant="secondary" className="ml-2 bg-white/20">
                  {unreadCount}
                </Badge>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[600px]">
            {isLoading ? (
              <div className="p-4 space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-1/4" />
                      <Skeleton className="h-4 w-full" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filtered.length > 0 ? (
              <div className="divide-y divide-white/5 group-parent">
                {filtered.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 transition-colors hover:bg-white/5 flex gap-4 group ${
                      !notification.isRead ? 'bg-purple-500/5' : ''
                    }`}
                  >
                    <div className="flex-shrink-0 mt-1 p-2 bg-white/5 rounded-full h-fit">
                      {getIcon(notification.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={`text-sm font-medium ${!notification.isRead ? 'text-white' : 'text-gray-300'}`}>
                          {notification.title}
                        </p>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {new Date(notification.createdAt).toLocaleString()}
                        </span>
                      </div>
                      
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {notification.message}
                      </p>
                      
                      {notification.actionUrl && (
                        <div className="mt-3">
                          <Button variant="outline" size="sm" className="h-8" asChild>
                            <a href={notification.actionUrl}>View Details</a>
                          </Button>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex flex-col items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {!notification.isRead && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-white"
                          onClick={() => markAsRead.mutate(notification.id)}
                          title="Mark as read"
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-red-400"
                        onClick={() => deleteNotification.mutate(notification.id)}
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    {!notification.isRead && (
                      <div className="w-2 h-2 bg-purple-500 rounded-full mt-2" />
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <Bell className="h-12 w-12 text-muted-foreground mb-4 opacity-20" />
                <p className="text-lg font-medium">All caught up!</p>
                <p className="text-sm text-muted-foreground mt-1">
                  You don't have any {filter === 'unread' ? 'unread ' : ''}notifications.
                </p>
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}
