'use client'

import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useApp } from '@/context/AppContext'
import { UserDashboardHome } from '@/components/dashboard/UserDashboardHome'

export default function DashboardPage() {
  const router = useRouter()
  const { userRole, showToast } = useApp()

  useEffect(() => {
    if (userRole === 'guest') {
      showToast('Please sign in to view your match arena.', 'info')
      router.replace('/login')
    }
  }, [userRole, router, showToast])

  if (userRole === 'guest') return null

  return <UserDashboardHome />
}
