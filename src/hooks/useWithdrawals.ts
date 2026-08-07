import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import apiClient from '@/lib/apiClient'

export interface WithdrawalTx {
  id: string
  userId: string
  amount: string
  type: string
  status: string
  details?: string
  createdAt: string
  user: {
    username: string
    phone: string
  }
}

export interface WithdrawalListResponse {
  transactions: WithdrawalTx[]
  total: number
  pages: number
  currentPage: number
}


export function useWithdrawals(params?: { status?: string, page?: number, limit?: number }) {
  return useQuery<WithdrawalListResponse, Error>({
    queryKey: ['withdrawals', params],
    queryFn: async () => {
      // type=WITHDRAWAL is passed to filter transactions
      const response = await apiClient.get('/transactions', { params: { ...params, type: 'WITHDRAWAL' } })
      return response.data
    },
  })
}

export function useApproveWithdrawal() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.post(`/transactions/withdraw/${id}/approve`)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['withdrawals'] })
    }
  })
}

export function useRejectWithdrawal() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, reason }: { id: string, reason: string }) => {
      const response = await apiClient.post(`/transactions/withdraw/${id}/reject`, { reason })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['withdrawals'] })
    }
  })
}
