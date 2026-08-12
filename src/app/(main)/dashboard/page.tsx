'use client'

import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useApp } from '@/context/AppContext'
import { HomeDashboard } from '@/components/dashboard/HomeDashboard'

export default function DashboardPage() {
  return <HomeDashboard />
}
