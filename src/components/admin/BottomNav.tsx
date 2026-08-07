'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Swords, Bell, LifeBuoy, UserCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Matches', href: '/admin/matches', icon: Swords },
  { name: 'Alerts', href: '/admin/notifications', icon: Bell },
  { name: 'Support', href: '/admin/support', icon: LifeBuoy },
  { name: 'Profile', href: '/admin/profile', icon: UserCircle },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 h-16 bg-background/80 backdrop-blur-xl border-t md:hidden pb-safe">
      <div className="flex h-full items-center justify-around px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href))
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center w-full h-full space-y-1 touch-manipulation transition-colors",
                isActive ? "text-orange-500" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <item.icon className={cn("w-6 h-6", isActive && "fill-orange-500/20")} />
              <span className="text-[10px] font-medium leading-none">{item.name}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
