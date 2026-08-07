import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/apiClient'
import { useSocket } from '@/context/SocketContext'
import { useEffect } from 'react'

export interface Announcement {
  id: string
  title: string
  message: string
  type: string
  priority: string
  targetRole: string | null
  targetTournamentId: string | null
  isPinned: boolean
  isActive: boolean
  createdAt: string
  admin?: { username: string }
}

export function useActiveAnnouncement() {
  const queryClient = useQueryClient()
  const { socket } = useSocket()

  const query = useQuery({
    queryKey: ['activeAnnouncement'],
    queryFn: async () => {
      const res = await apiClient.get('/api/notifications/announcements/active')
      return (res.data as Announcement) || null
    }
  })

  useEffect(() => {
    if (!socket) return

    const handleAnnouncementUpdate = (updatedAnnouncement: Announcement) => {
      // Re-fetch to ensure permissions/roles match before displaying
      // or optionally optimistic update if we know it targets this user
      queryClient.invalidateQueries({ queryKey: ['activeAnnouncement'] })
    }

    socket.on('announcement:update', handleAnnouncementUpdate)

    return () => {
      socket.off('announcement:update', handleAnnouncementUpdate)
    }
  }, [socket, queryClient])

  return query
}

export function useAdminAnnouncements() {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: ['adminAnnouncements'],
    queryFn: async () => {
      const res = await apiClient.get('/api/notifications/announcements')
      return res.data as Announcement[]
    }
  })

  const create = useMutation({
    mutationFn: async (data: Partial<Announcement>) => {
      const res = await apiClient.post('/api/notifications/announcements', data)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminAnnouncements'] })
    }
  })

  const update = useMutation({
    mutationFn: async ({ id, data }: { id: string, data: Partial<Announcement> }) => {
      const res = await apiClient.put(`/api/notifications/announcements/${id}`, data)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminAnnouncements'] })
    }
  })

  const remove = useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/api/notifications/announcements/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminAnnouncements'] })
    }
  })

  return { ...query, create, update, remove }
}
