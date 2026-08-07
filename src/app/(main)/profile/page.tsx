'use client'

import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useApp } from '@/context/AppContext'
import { ProfileView } from '@/components/profile/ProfileView'

export default function ProfilePage() {
  const router = useRouter()
  const { userRole, showToast } = useApp()

  useEffect(() => {
    if (userRole === 'guest') {
      showToast('Please sign in to access your gamer profile.', 'info')
      router.replace('/login')
    }
  }, [userRole, router, showToast])

  if (userRole === 'guest') return null

  return <ProfileView />
}
