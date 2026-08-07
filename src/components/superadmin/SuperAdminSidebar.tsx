'use client'

import Link from 'next/link'
import * as React from 'react'
import {
  LayoutDashboard,
  Users,
  UserCog,
  Gamepad2,
  Trophy,
  UserPlus,
  Wallet,
  ArrowDownToLine,
  ArrowUpFromLine,
  Bell,
  FileText,
  Settings,
  UserCircle,
  Database
} from 'lucide-react'

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'

const data = {
  navMain: [
    {
      title: 'Overview',
      items: [
        { title: 'Dashboard', url: '/superadmin', icon: LayoutDashboard },
        { title: 'Announcements', url: '/superadmin/announcements', icon: Bell },
      ],
    },
    {
      title: 'Management',
      items: [
        { title: 'Users', url: '/superadmin/users', icon: Users },
        { title: 'Admins', url: '/superadmin/admins', icon: UserCog },
        { title: 'Participants', url: '/superadmin/participants', icon: UserPlus },
        { title: 'Duplicate UIDs', url: '/superadmin/duplicate-uids', icon: FileText },
      ],
    },
    {
      title: 'Gaming',
      items: [
        { title: 'Games', url: '/superadmin/games', icon: Gamepad2 },
        { title: 'Tournaments', url: '/superadmin/tournaments', icon: Trophy },
        { title: 'Match Results', url: '/superadmin/results', icon: Trophy },
      ],
    },
    {
      title: 'Finance',
      items: [
        { title: 'Wallet', url: '/superadmin/wallet', icon: Wallet },
        { title: 'Deposits', url: '/superadmin/deposits', icon: ArrowDownToLine },
        { title: 'Withdrawals', url: '/superadmin/withdrawals', icon: ArrowUpFromLine },
      ],
    },
    {
      title: 'System',
      items: [
        { title: 'Reports', url: '/superadmin/reports', icon: FileText },
        { title: 'Settings', url: '/superadmin/settings', icon: Settings },
        { title: 'Payment Settings', url: '/superadmin/payment-settings', icon: Wallet },
        { title: 'Profile', url: '/superadmin/profile', icon: UserCircle },
        { title: 'Maintenance', url: '/superadmin/maintenance', icon: Database },
      ],
    },
  ],
}

export function SuperAdminSidebar() {
  return (
    <Sidebar variant="inset">
      <SidebarHeader className="h-16 flex items-center justify-center border-b px-4">
        <div className="flex items-center gap-2 w-full px-2">
          <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-indigo-600 text-white">
            <Gamepad2 className="size-5" />
          </div>
          <div className="flex flex-col gap-0.5 leading-none">
            <span className="font-bold text-sm tracking-tight text-white">PLAY2EARN</span>
            <span className="text-[10px] font-semibold text-yellow-500 tracking-wider">SUPER ADMIN</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        {data.navMain.map((group) => (
          <SidebarGroup key={group.title}>
            <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild tooltip={item.title}>
                      <Link href={item.url}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
    </Sidebar>
  )
}
