'use client'

import React, { useEffect } from 'react'
import { useSocket } from '@/context/SocketContext'
import { useQueryClient } from '@tanstack/react-query'

export const GlobalRealtimeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { socket } = useSocket()
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!socket) return

    const handleTournamentUpdate = (data: { matchId: string; status: string }) => {
      // Invalidate tournaments list
      queryClient.invalidateQueries({ queryKey: ['tournaments'] })
      // Invalidate specific tournament details
      queryClient.invalidateQueries({ queryKey: ['tournament', data.matchId] })
      // Invalidate admin op lists etc.
      queryClient.invalidateQueries({ queryKey: ['adminDashboardStats'] })
      queryClient.invalidateQueries({ queryKey: ['superAdminStats'] })
    }

    const handleMatchStatusUpdate = (data: { matchId: string; status: string }) => {
      queryClient.invalidateQueries({ queryKey: ['tournament', data.matchId] })
      queryClient.invalidateQueries({ queryKey: ['tournaments'] })
    }

    const handleWalletUpdate = () => {
      queryClient.invalidateQueries({ queryKey: ['wallet'] })
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
    }

    // Bind real-time global events
    socket.on('tournament:update', handleTournamentUpdate)
    socket.on('match:status:update', handleMatchStatusUpdate)
    socket.on('wallet:update', handleWalletUpdate)

    // Legacy events (clean up later if fully migrated)
    socket.on('matchUpdate', handleMatchStatusUpdate)
    socket.on('roomOpen', handleMatchStatusUpdate)

    return () => {
      socket.off('tournament:update', handleTournamentUpdate)
      socket.off('match:status:update', handleMatchStatusUpdate)
      socket.off('wallet:update', handleWalletUpdate)
      
      socket.off('matchUpdate', handleMatchStatusUpdate)
      socket.off('roomOpen', handleMatchStatusUpdate)
    }
  }, [socket, queryClient])

  return <>{children}</>
}
