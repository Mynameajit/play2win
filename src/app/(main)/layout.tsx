import React from 'react'
import { GamingBackground } from '@/components/common/GamingBackground'
import { Navbar } from '@/components/common/Navbar'
import { MobileNav } from '@/components/common/MobileNav'
import { GlobalModals } from '@/components/common/GlobalModals'

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      {/* Animated Gaming Canvas Background */}
      <GamingBackground />

      {/* Fixed Header Navigation Bar */}
      <Navbar />

      {/* Main Content Area */}
      <main className="relative z-10 max-w-7xl mx-auto px-0 sm:px-2 pt-2">
        {children}
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <MobileNav />

      {/* Global Modals (Join Tournament, Tournament Details) */}
      <GlobalModals />
    </>
  )
}
