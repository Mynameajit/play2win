'use client'

import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useApp } from '@/context/AppContext'
import { WalletView } from '@/components/wallet/WalletView'

export default function WalletPage() {
  const router = useRouter()
  const { userRole, showToast } = useApp()

  useEffect(() => {
    if (userRole === 'guest') {
      showToast('Please sign in to view your wallet passbook.', 'info')
      router.replace('/login')
    }
  }, [userRole, router, showToast])

  if (userRole === 'guest') return null

  return <WalletView />
}
