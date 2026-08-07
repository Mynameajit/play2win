import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import apiClient from '@/lib/apiClient'

export interface DepositTx {
  id: string
  userId: string
  amount: string
  type: string
  status: string
  utr?: string
  paymentMethod?: string
  details?: string
  createdAt: string
  user: {
    username: string
    phone: string
  }
}

export interface DepositListResponse {
  transactions: DepositTx[]
  total: number
  pages: number
  currentPage: number
}


export function useDeposits(params?: { status?: string, page?: number, limit?: number }) {
  return useQuery<DepositListResponse, Error>({
    queryKey: ['deposits', params],
    queryFn: async () => {
      // type=DEPOSIT is passed to filter transactions
      const response = await apiClient.get('/transactions', { params: { ...params, type: 'DEPOSIT' } })
      return response.data
    },
  })
}

export function useApproveDeposit() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.post(`/transactions/deposit/${id}/approve`)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deposits'] })
    }
  })
}

export function useRejectDeposit() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, reason }: { id: string, reason: string }) => {
      const response = await apiClient.post(`/transactions/deposit/${id}/reject`, { reason })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deposits'] })
    }
  })
}
