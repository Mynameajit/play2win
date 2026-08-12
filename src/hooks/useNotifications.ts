import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/apiClient'
import { useSocket } from '@/context/SocketContext'
import { useEffect } from 'react'
import { toast } from './use-toast'

export interface Notification {
  id: string
  title: string
  message: string
  type: string
  priority: string
  actionUrl?: string
  relatedId?: string
  isRead: boolean
  createdAt: string
}

export function useNotifications() {
  const queryClient = useQueryClient()
  const { socket } = useSocket()

  // 1. Fetch
  const query = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const res = await apiClient.get('/api/notifications')
      return (res.data.notifications || res.data) as Notification[]
    }
  })

  // 2. Realtime Listener
  useEffect(() => {
    if (!socket) return

    const handleNewNotification = (notification: Notification) => {
      // Optimistic update
      queryClient.setQueryData(['notifications'], (old: Notification[] | undefined) => {
        return [notification, ...(old || [])]
      })

      // Show toast
      toast({
        title: notification.title,
        description: notification.message,
        variant: notification.priority === 'HIGH' ? 'destructive' : 'default',
      })
    }

    const handleRead = ({ id }: { id: string }) => {
      queryClient.setQueryData(['notifications'], (old: Notification[] | undefined) => {
        if (!old) return old
        return old.map(n => n.id === id ? { ...n, isRead: true } : n)
      })
    }

    const handleReadAll = () => {
      queryClient.setQueryData(['notifications'], (old: Notification[] | undefined) => {
        if (!old) return old
        return old.map(n => ({ ...n, isRead: true }))
      })
    }

    const handleDelete = ({ id }: { id: string }) => {
      queryClient.setQueryData(['notifications'], (old: Notification[] | undefined) => {
        if (!old) return old
        return old.filter(n => n.id !== id)
      })
    }

    const handleDeleteAll = () => {
      queryClient.setQueryData(['notifications'], () => [])
    }

    socket.on('notification:new', handleNewNotification)
    socket.on('notification:read', handleRead)
    socket.on('notification:read_all', handleReadAll)
    socket.on('notification:delete', handleDelete)
    socket.on('notification:delete_all', handleDeleteAll)

    return () => {
      socket.off('notification:new', handleNewNotification)
      socket.off('notification:read', handleRead)
      socket.off('notification:read_all', handleReadAll)
      socket.off('notification:delete', handleDelete)
      socket.off('notification:delete_all', handleDeleteAll)
    }
  }, [socket, queryClient])

  // 3. Mutations
  const markAsRead = useMutation({
    mutationFn: async (id: string) => {
      await apiClient.patch(`/api/notifications/${id}/read`)
    }
  })

  const markAllAsRead = useMutation({
    mutationFn: async () => {
      await apiClient.post(`/api/notifications/read-all`)
    }
  })

  const deleteNotification = useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/api/notifications/${id}`)
    }
  })

  const deleteAll = useMutation({
    mutationFn: async () => {
      await apiClient.post(`/api/notifications/delete-all`)
    }
  })

  return {
    data: query.data,
    isLoading: query.isLoading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAll
  }
}

export interface Announcement {
  id: string
  title: string
  message: string
  type: string
  priority: string
  targetRole?: string | null
  targetTournamentId?: string | null
  isPinned: boolean
  expiresAt?: string | null
  createdAt: string
}

export function useAnnouncements() {
  const query = useQuery({
    queryKey: ['announcements', 'active'],
    queryFn: async () => {
      const res = await apiClient.get('/api/notifications/announcements/active')
      return res.data as Announcement[]
    },
    refetchInterval: 30000 // Refetch every 30 seconds to get fresh announcements
  })

  return query
}
