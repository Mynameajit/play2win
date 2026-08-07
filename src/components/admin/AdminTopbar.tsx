'use client'

import React from 'react'
import { Menu, Search, Bell, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet'
import { AdminSidebar } from './AdminSidebar'
import Link from 'next/link'

export function AdminTopbar() {
  return (
    <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center gap-4">
        {/* Mobile Hamburger */}
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-72">
              <SheetTitle className="sr-only">Menu</SheetTitle>
              <div className="h-full flex flex-col pt-16">
                <div className="flex-1 overflow-y-auto px-4 space-y-4">
                  <div className="space-y-1">
                    <h4 className="text-sm font-semibold tracking-tight uppercase text-muted-foreground mb-2">Overview</h4>
                    <Link href="/admin" className="flex items-center gap-3 rounded-lg px-3 py-2 text-foreground hover:bg-muted transition-all"><span className="text-sm font-medium">Dashboard</span></Link>
                    <Link href="/admin/notifications" className="flex items-center gap-3 rounded-lg px-3 py-2 text-foreground hover:bg-muted transition-all"><span className="text-sm font-medium">Notifications</span></Link>
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-semibold tracking-tight uppercase text-muted-foreground mb-2 mt-6">Operations</h4>
                    <Link href="/admin/matches" className="flex items-center gap-3 rounded-lg px-3 py-2 text-foreground hover:bg-muted transition-all"><span className="text-sm font-medium">Assigned Matches</span></Link>
                    <Link href="/admin/rooms" className="flex items-center gap-3 rounded-lg px-3 py-2 text-foreground hover:bg-muted transition-all"><span className="text-sm font-medium">Room Management</span></Link>
                    <Link href="/admin/results" className="flex items-center gap-3 rounded-lg px-3 py-2 text-foreground hover:bg-muted transition-all"><span className="text-sm font-medium">Result Upload</span></Link>
                    <Link href="/admin/participants" className="flex items-center gap-3 rounded-lg px-3 py-2 text-foreground hover:bg-muted transition-all"><span className="text-sm font-medium">Participants</span></Link>
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-bold text-lg text-primary md:hidden">ADMIN</span>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon">
          <Search className="h-5 w-5 text-muted-foreground" />
        </Button>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5 text-muted-foreground" />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-orange-500" />
        </Button>
        <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center ml-2 border">
          <User className="h-4 w-4 text-muted-foreground" />
        </div>
      </div>
    </header>
  )
}
