'use client'

import React from 'react'
import NotificationsView from '@/components/notifications/NotificationsView'

export default function AdminNotificationsPage() {
  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Notifications</h2>
        <p className="text-muted-foreground">Stay updated on your assigned matches and support tickets.</p>
      </div>
      <div className="bg-card border rounded-lg overflow-hidden min-h-[60vh]">
        <NotificationsView />
      </div>
    </div>
  )
}
