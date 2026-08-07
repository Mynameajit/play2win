'use client'

import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useApp } from '@/context/AppContext'
import { ForgotPasswordPage } from '@/components/auth/ForgotPasswordPage'

export default function ForgotPasswordRoutePage() {
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

  return <ForgotPasswordPage />
}
