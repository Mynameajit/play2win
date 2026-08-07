import { useMutation } from '@tanstack/react-query'
import apiClient from '@/lib/apiClient'


export function useSendNotification() {
  return useMutation({
    mutationFn: async (data: { userId: string, title: string, description?: string, type?: string, priority?: string }) => {
      const response = await apiClient.post('/superadmin/notifications/send', data)
      return response.data
    }
  })
}

export function useBroadcastNotification() {
  return useMutation({
    mutationFn: async (data: { title: string, description?: string, type?: string, priority?: string }) => {
      const response = await apiClient.post('/superadmin/notifications/broadcast', data)
      return response.data
    }
  })
}
