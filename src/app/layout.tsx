import type { Metadata } from 'next'
import './globals.css'
import { AppProvider } from '@/context/AppContext'
import { Toaster } from '@/components/ui/toaster'

import { QueryProvider } from '@/providers/QueryProvider'

export const metadata: Metadata = {
  title: 'BattleX - Premium Esports Tournament Platform',
  description: 'Compete in BGMI, PUBG & Free Fire esports tournaments. Instant cash rewards, anti-cheat protection, and live match updates.',
}

import { GlobalRealtimeProvider } from '@/components/providers/GlobalRealtimeProvider'
import { SocketProvider } from '@/context/SocketContext'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-background text-foreground antialiased min-h-screen relative selection:bg-purple-600 selection:text-white overflow-x-hidden">
        <QueryProvider>
          <AppProvider>
            <SocketProvider>
              <GlobalRealtimeProvider>
                {children}
              </GlobalRealtimeProvider>
            </SocketProvider>

            {/* Global Toast Notification */}
            <Toaster  />
          </AppProvider>
        </QueryProvider>
      </body>
    </html>
  )
}
