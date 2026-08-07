'use client'

import * as React from 'react'
import Link from 'next/link'
import {
  LayoutDashboard,
  Swords,
  Users,
  Settings,
  Bell,
  LifeBuoy,
  UserCircle,
  FileUp,
  KeyRound
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
        { title: 'Dashboard', url: '/admin', icon: LayoutDashboard },
        { title: 'Notifications', url: '/admin/notifications', icon: Bell },
      ],
    },
    {
      title: 'Operations',
      items: [
        { title: 'Assigned Matches', url: '/admin/matches', icon: Swords },
        { title: 'Room Management', url: '/admin/rooms', icon: KeyRound },
        { title: 'Result Upload', url: '/admin/results', icon: FileUp },
        { title: 'Participants', url: '/admin/participants', icon: Users },
      ],
    },
    {
      title: 'System',
      items: [
        { title: 'Support', url: '/admin/support', icon: LifeBuoy },
        { title: 'Settings', url: '/admin/settings', icon: Settings },
        { title: 'Profile', url: '/admin/profile', icon: UserCircle },
      ],
    },
  ],
}

export function AdminSidebar() {
  return (
    <Sidebar variant="inset" className="hidden md:flex">
      <SidebarHeader className="h-16 flex items-center justify-center border-b px-4">
        <h2 className="text-lg font-bold tracking-tight text-primary">ADMIN PANEL</h2>
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
