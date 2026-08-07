import { useEffect, useRef } from 'react'
import { io, Socket } from 'socket.io-client'
import { useToast } from '@/hooks/use-toast'
import { useQueryClient } from '@tanstack/react-query'

let socketInstance: Socket | null = null

export function useAdminSocket(token?: string) {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const isMounted = useRef(true)

  useEffect(() => {
    isMounted.current = true

    if (!socketInstance && token) {
      socketInstance = io(process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000', {
        query: { token },
        transports: ['websocket'],
      })

      socketInstance.on('connect', () => {
        console.log('Admin socket connected')
      })

      socketInstance.on('matchUpdate', (data: { matchId: string, status: string }) => {
        toast({ title: 'Match Status Updated', description: `Match ${data.matchId} status is now ${data.status}` })
        queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] })
        queryClient.invalidateQueries({ queryKey: ['admin-matches'] })
        queryClient.invalidateQueries({ queryKey: ['admin-match', data.matchId] })
      })

      socketInstance.on('roomOpen', (data: { matchId: string, roomId: string }) => {
        toast({ title: 'Room Opened', description: `Room credentials sent to players.` })
      })
      
      socketInstance.on('new_message', (msg: any) => {
        // Handle new support message
        queryClient.invalidateQueries({ queryKey: ['admin-support', msg.ticketId] })
      })

      socketInstance.on('financial_update', () => {
        queryClient.invalidateQueries({ queryKey: ['superAdmin', 'financialAnalytics'] })
      })

      socketInstance.on('disconnect', () => {
        console.log('Admin socket disconnected')
      })
    }

    return () => {
      isMounted.current = false
      if (socketInstance) {
        socketInstance.disconnect()
        socketInstance = null
      }
    }
  }, [token, toast, queryClient])

  return socketInstance
}
