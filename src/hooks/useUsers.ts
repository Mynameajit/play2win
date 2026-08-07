import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import apiClient from '@/lib/apiClient'

export interface User {
  id: string
  username: string
  email: string
  phone: string
  isOnline: boolean
  depositBalance: string
  winningBalance: string
  bonusBalance: string
  isBlocked: boolean
  createdAt: string
  bgmiIgn?: string
  freefireIgn?: string
}

export interface UserListResponse {
  users: User[]
  total: number
  pages: number
  currentPage: number
}


export function useUsers(params?: { search?: string, isBlocked?: boolean, page?: number, limit?: number }) {
  return useQuery<UserListResponse, Error>({
    queryKey: ['users', params],
    queryFn: async () => {
      const response = await apiClient.get('/superadmin/users', { params })
      return response.data
    },
  })
}

export function useUserDetails(id: string) {
  return useQuery({
    queryKey: ['users', id],
    queryFn: async () => {
      const response = await apiClient.get(`/superadmin/users/${id}`)
      return response.data
    },
    enabled: !!id,
  })
}

export function useToggleBlockUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.post(`/superadmin/users/${id}/toggle-block`)
      return response.data
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      queryClient.invalidateQueries({ queryKey: ['users', id] })
    }
  })
}

export function useUpdateUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: { id: string } & Partial<User>) => {
      const response = await apiClient.put(`/superadmin/users/${data.id}`, data)
      return response.data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      queryClient.invalidateQueries({ queryKey: ['users', variables.id] })
    }
  })
}
