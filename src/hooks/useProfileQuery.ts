import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import apiClient from '@/lib/apiClient'
import { UserProfile } from '@/context/AppContext'

export function useUserProfile() {
  return useQuery<UserProfile, Error>({
    queryKey: ['profile'],
    queryFn: async () => {
      const response = await apiClient.get('/users/profile')
      const profileData = response.data
      
      return {
        ...profileData,
        depositBalance: Number(profileData.depositBalance || 0),
        winningBalance: Number(profileData.winningBalance || 0),
        bonusBalance: Number(profileData.bonusBalance || 0),
        lockedBalance: Number(profileData.lockedBalance || 0),
        matchesPlayed: Number(profileData.matchesPlayed || 0),
        totalKills: Number(profileData.totalKills || 0),
      }
    }
  })
}

export function useWalletDeposit() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: { amount: number; method: string; utr: string }) => {
      const response = await apiClient.post('/transactions/deposit', data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallet-transactions'] })
      queryClient.invalidateQueries({ queryKey: ['profile'] })
    }
  })
}

export function useWalletWithdraw() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: { amount: number; upiId: string }) => {
      const response = await apiClient.post('/transactions/withdraw', data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallet-transactions'] })
      queryClient.invalidateQueries({ queryKey: ['profile'] })
    }
  })
}