import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import apiClient from '@/lib/apiClient'

export interface MaintenanceCounts {
  users: number
  admins: number
  games: number
  tournaments: number
  matches: number
  participants: number
  walletTransactions: number
  notifications: number
  supportTickets: number
  activityLogs: number
  systemLogs: number
  leaderboards: number
  results: number
  coupons: number
  referralData: number
  reports: number
}

export function useMaintenanceCounts() {
  return useQuery<MaintenanceCounts, Error>({
    queryKey: ['maintenanceCounts'],
    queryFn: async () => {
      const response = await apiClient.get('/superadmin/maintenance/counts')
      return response.data
    },
    refetchInterval: 10000 // Refetch every 10 seconds to keep counts relatively fresh
  })
}

export function useResetModule() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: { module: string, password: string }) => {
      const response = await apiClient.post('/superadmin/maintenance/reset-module', data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenanceCounts'] })
    }
  })
}

export function useFactoryReset() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: { password: string }) => {
      const response = await apiClient.post('/superadmin/maintenance/factory-reset', data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenanceCounts'] })
    }
  })
}
