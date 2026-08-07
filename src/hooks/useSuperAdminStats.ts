import { useQuery } from '@tanstack/react-query'
import apiClient from '@/lib/apiClient'

export interface SuperAdminStats {
  totalUsers: number;
  onlineUsers: number;
  totalAdmins: number;
  totalGames: number;
  totalTournaments: number;
  liveMatches: number;
  upcomingMatches: number;
  completedMatches: number;
  cancelledMatches: number;
  pendingDeposits: number;
  pendingWithdrawals: number;
  totalRevenue: number;
  totalWalletBalance: number;
  supportTickets: number;
}

export function useSuperAdminStats() {
  return useQuery<SuperAdminStats, Error>({
    queryKey: ['superAdminStats'],
    queryFn: async () => {
      const response = await apiClient.get('/superadmin/stats')
      return response.data
    },
    staleTime: 60 * 1000, // Refetch every 60s
  })
}
