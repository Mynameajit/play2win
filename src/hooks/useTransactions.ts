import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/apiClient'
import { Transaction } from '@/lib/mockData' // Replace with actual types if available

export function useTransactions() {
  return useQuery<Transaction[]>({
    queryKey: ['transactions'],
    queryFn: async () => {
      const { data } = await apiClient.get('/transactions')
      return data.transactions || []
    }
  })
}

export function useDeposit() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ amount, method, utrRef }: { amount: number; method: string; utrRef: string }) => {
      const { data } = await apiClient.post('/transactions/deposit', { amount, paymentMethod: method, transactionRef: utrRef })
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      queryClient.invalidateQueries({ queryKey: ['profile'] })
    }
  })
}

export function useWithdraw() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ amount, upiId }: { amount: number; upiId: string }) => {
      const { data } = await apiClient.post('/transactions/withdraw', { amount, upiId })
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      queryClient.invalidateQueries({ queryKey: ['profile'] })
    }
  })
}
