import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import apiClient from '@/lib/apiClient'


export function useSettings() {
  return useQuery<Record<string, string>, Error>({
    queryKey: ['settings'],
    queryFn: async () => {
      const response = await apiClient.get('/superadmin/settings')
      return response.data
    },
  })
}

export function useUpdateSettings() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: Record<string, string>) => {
      const response = await apiClient.post('/superadmin/settings', data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] })
    }
  })
}
