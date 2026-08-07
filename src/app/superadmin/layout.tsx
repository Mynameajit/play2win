'use client'

import React from 'react'
import { SidebarProvider, SidebarTrigger, SidebarInset } from '@/components/ui/sidebar'
import { SuperAdminSidebar } from '@/components/superadmin/SuperAdminSidebar'

export default function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <SuperAdminSidebar />
      <SidebarInset>
        <header className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <div className="w-full flex items-center justify-between">
            <h1 className="text-sm font-medium">Enterprise Control Panel</h1>
            <div className="flex items-center gap-4">
              <div className="h-8 w-8 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold text-xs">
                SA
              </div>
            </div>
          </div>
        </header>
        <main className="p-4 sm:p-6 lg:p-8 w-full max-w-full">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
