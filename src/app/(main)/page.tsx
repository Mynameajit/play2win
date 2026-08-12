'use client'

import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useApp } from '@/context/AppContext'
import { LandingPage } from '@/components/landing/LandingPage'

export default function Home() {
  const { userRole } = useApp()
  const router = useRouter()

  useEffect(() => {
    if (userRole === 'user') {
      router.push('/dashboard')
    }
  }, [userRole, router])

  if (userRole === 'user') {
    return null // Return null while redirecting
  }

  return <LandingPage />
}
