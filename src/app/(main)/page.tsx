'use client'

import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useApp } from '@/context/AppContext'
import { LandingPage } from '@/components/landing/LandingPage'

export default function Home() {
  const router = useRouter()
  const { userRole } = useApp()

  useEffect(() => {
    if (userRole === 'user') {
      router.push('/dashboard')
    } else if (userRole === 'admin') {
      router.push('/admin')
    } else if (userRole === 'superadmin') {
      router.push('/superadmin')
    }
  }, [userRole, router])

  if (userRole !== 'guest') return null

  return <LandingPage />
}
