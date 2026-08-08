'use client'

import React from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { ArrowLeft, Home, Trophy, Wallet, Bell, User, ShieldCheck, Crown } from 'lucide-react'

interface PageHeaderProps {
  title?: string
  subtitle?: string
  description?: string
  icon?: React.ReactNode
}

export const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle, description, icon }) => {
  const pathname = usePathname()
  const router = useRouter()

  if (pathname === '/') return null

  const getPageDetails = () => {
    if (pathname === '/dashboard') {
      return {
        title: 'Tournaments Arena',
        subtitle: 'BGMI & Free Fire Lobbies',
        icon: <Trophy className="w-4 h-4 text-emerald-400" />,
        fallbackBack: '/'
      }
    }
    if (pathname === '/wallet') {
      return {
        title: 'Wallet & Payouts',
        subtitle: 'Deposit & Instant Withdrawals',
        icon: <Wallet className="w-4 h-4 text-amber-400" />,
        fallbackBack: '/dashboard'
      }
    }
    if (pathname === '/notifications') {
      return {
        title: 'System Alerts',
        subtitle: 'Room Creds & Payout Updates',
        icon: <Bell className="w-4 h-4 text-cyan-400" />,
        fallbackBack: '/dashboard'
      }
    }
    if (pathname === '/profile') {
      return {
        title: 'Gamer Profile',
        subtitle: 'Account & Game Credentials',
        icon: <User className="w-4 h-4 text-purple-400" />,
        fallbackBack: '/dashboard'
      }
    }
    if (pathname === '/admin') {
      return {
        title: 'Room Admin Panel',
        subtitle: 'Match Management & Creds Broadcast',
        icon: <ShieldCheck className="w-4 h-4 text-red-400" />,
        fallbackBack: '/dashboard'
      }
    }
    if (pathname === '/superadmin') {
      return {
        title: 'Super Admin Enterprise',
        subtitle: 'Platform Revenue & Governance',
        icon: <Crown className="w-4 h-4 text-amber-300" />,
        fallbackBack: '/dashboard'
      }
    }
    if (pathname === '/login') {
      return {
        title: 'Authentication',
        subtitle: 'Sign In / Register',
        icon: <User className="w-4 h-4 text-cyan-400" />,
        fallbackBack: '/'
      }
    }
    if (pathname.startsWith('/matches/')) {
      return {
        title: 'Match Details & Rules',
        subtitle: 'BGMI & Free Fire Tournament Details',
        icon: <Trophy className="w-4 h-4 text-purple-400" />,
        fallbackBack: '/dashboard'
      }
    }
    if (pathname.startsWith('/support')) {
      return {
        title: 'Customer Support',
        subtitle: '24/7 Priority Assistance',
        icon: <ShieldCheck className="w-4 h-4 text-cyan-400" />,
        fallbackBack: '/dashboard'
      }
    }

    // Default Fallback
    return {
      title: 'Esports Arena',
      subtitle: 'Play2Earn Gaming',
      icon: <Home className="w-4 h-4 text-cyan-400" />,
      fallbackBack: '/dashboard'
    }
  }

  const currentInfo = getPageDetails()
  const displayTitle = title || currentInfo.title
  const displaySubtitle = description || subtitle || currentInfo.subtitle
  const displayIcon = icon || currentInfo.icon

  const handleBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back()
    } else {
      router.push(currentInfo.fallbackBack)
    }
  }

  return (
    <div className="mb-4 flex items-center justify-between glass-panel p-2.5 sm:p-3 rounded-2xl border border-white/10">
      <div className="flex items-center gap-2.5">
        <button
          onClick={handleBack}
          className="p-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-white/10 text-slate-300 hover:text-white transition-colors flex items-center gap-1 font-bold text-xs"
          title="Go Back"
        >
          <ArrowLeft className="w-4 h-4 text-cyan-400" />
          <span className="hidden sm:inline">Back</span>
        </button>

        <div className="flex items-center gap-2 border-l border-white/10 pl-2.5">
          <div className="p-1.5 rounded-lg bg-slate-900 border border-white/10">
            {displayIcon}
          </div>
          <div>
            <h2 className="text-xs sm:text-sm font-extrabold text-white leading-none">{displayTitle}</h2>
            <p className="text-[10px] text-slate-400 font-medium leading-none mt-0.5">{displaySubtitle}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
