import { useQuery } from '@tanstack/react-query'
import apiClient from '@/lib/apiClient'

export interface User {
  id: string;
  username: string;
  email: string;
  phone: string;
  isOnline: boolean;
  depositBalance: number;
  winningBalance: number;
  bonusBalance: number;
  isBlocked: boolean;
  createdAt: string;
}

export function useSuperAdminUsers() {
  return useQuery<User[], Error>({
    queryKey: ['superAdminUsers'],
    queryFn: async () => {
      const response = await apiClient.get('/superadmin/users')
      return response.data
    },
    staleTime: 60 * 1000,
  })
}
