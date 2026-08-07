'use client'

import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useApp } from '@/context/AppContext'
import NotificationsView from '@/components/notifications/NotificationsView'

export default function NotificationsPage() {
  const router = useRouter()
  const { userRole, showToast } = useApp()

  useEffect(() => {
    if (userRole === 'guest') {
      showToast('Please sign in to view notifications.', 'info')
      router.replace('/login')
    }
  }, [userRole, router, showToast])

  if (userRole === 'guest') return null

  return <NotificationsView />
}
