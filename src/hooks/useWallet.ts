import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import apiClient from '@/lib/apiClient'

export interface WalletTx {
  id: string
  userId: string
  amount: string
  type: string
  status: string
  details?: string
  paymentMethod?: string
  createdAt: string
  user: {
    username: string
    phone: string
  }
}

export interface WalletTxListResponse {
  transactions: WalletTx[]
  total: number
  pages: number
  currentPage: number
}


export function useWalletTransactions(params?: { search?: string, type?: string, page?: number, limit?: number }) {
  return useQuery<WalletTxListResponse, Error>({
    queryKey: ['wallet-transactions', params],
    queryFn: async () => {
      const response = await apiClient.get('/transactions', { params })
      return response.data
    },
  })
}

export function useAdjustWallet() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: { userId: string, type: 'CREDIT' | 'DEBIT', walletType: 'DEPOSIT' | 'WINNING' | 'BONUS', amount: number, reason: string }) => {
      const response = await apiClient.post('/superadmin/wallet/adjust', data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallet-transactions'] })
      queryClient.invalidateQueries({ queryKey: ['users'] })
    }
  })
}
