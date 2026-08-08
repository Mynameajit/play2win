'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useApp } from '@/context/AppContext'
import { Home, Trophy, Wallet, User, ShieldCheck, Crown, LogOut } from 'lucide-react'

export const MobileNav: React.FC = () => {
  const pathname = usePathname()
  const router = useRouter()
  const { userRole, handleLogout } = useApp()

  if (userRole === 'guest') {
    return null
  }

  if (userRole === 'admin') {
    return null
  }

  if (userRole === 'superadmin') {
    return (
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-xl border-t border-white/5 px-2 py-1 shadow-2xl">
        <div className="flex items-center justify-around max-w-sm mx-auto">
          <Link
            href="/superadmin"
            className={`flex flex-col items-center justify-center gap-0.5 px-3 py-1 rounded-xl transition-all ${
              pathname === '/superadmin' ? 'text-amber-300 bg-amber-500/20 border border-amber-500/40 font-bold' : 'text-slate-400'
            }`}
          >
            <Crown className="w-4 h-4" />
            <span className="text-[9px] font-medium leading-none">Governance</span>
          </Link>

          <Link
            href="/admin"
            className={`flex flex-col items-center justify-center gap-0.5 px-3 py-1 rounded-xl transition-all ${
              pathname === '/admin' ? 'text-red-300 bg-red-500/20 border border-red-500/40 font-bold' : 'text-slate-400'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span className="text-[9px] font-medium leading-none">Room Panel</span>
          </Link>

          <button
            onClick={() => {
              handleLogout()
              router.push('/login')
            }}
            className="flex flex-col items-center justify-center gap-0.5 px-3 py-1 rounded-xl text-red-400 hover:text-red-300"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-[9px] font-medium leading-none">Logout</span>
          </button>
        </div>
      </div>
    )
  }

  // Gamer Nav Items
  const items = [
    { href: '/', label: 'Home', icon: <Home className="w-4 h-4" /> },
    { href: '/dashboard', label: 'Matches', icon: <Trophy className="w-4 h-4" /> },
    { href: '/wallet', label: 'Wallet', icon: <Wallet className="w-4 h-4" /> },
    { href: '/support', label: 'Support', icon: <ShieldCheck className="w-4 h-4" /> },
    { href: '/profile', label: 'Profile', icon: <User className="w-4 h-4" /> },
  ]

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-xl border-t border-white/5 px-2 py-1 shadow-2xl">
      <div className="flex items-center justify-around max-w-sm mx-auto">
        {items.map(item => {
          const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-0.5 px-3 py-1 rounded-xl transition-all ${
                isActive
                  ? 'text-purple-300 bg-purple-500/20 border border-purple-500/40 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {item.icon}
              <span className="text-[9px] font-medium leading-none">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
