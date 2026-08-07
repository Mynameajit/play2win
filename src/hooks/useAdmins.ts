import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import apiClient from '@/lib/apiClient'

export interface AdminUser {
  id: string
  username: string
  email: string
  phone: string
  isBlocked: boolean
  createdAt: string
  permissions: string[]
}


export function useAdmins() {
  return useQuery<AdminUser[], Error>({
    queryKey: ['admins'],
    queryFn: async () => {
      const response = await apiClient.get('/admins')
      return response.data
    },
  })
}

export interface AssignableAdmin {
  id: string
  username: string
  email: string
  phone: string
  isOnline: boolean
  adminGames: string[]
  _count: {
    assignedMatches: number
  }
}

export function useAssignableAdmins() {
  return useQuery<AssignableAdmin[], Error>({
    queryKey: ['assignableAdmins'],
    queryFn: async () => {
      const response = await apiClient.get('/superadmin/admins')
      return response.data
    }
  })
}

export function useCreateAdmin() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: Partial<AdminUser> & { password?: string }) => {
      const response = await apiClient.post('/admins', data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admins'] })
    }
  })
}

  export function useUpdateAdmin() {
    const queryClient = useQueryClient()
    return useMutation({
      mutationFn: async (data: { id: string } & Partial<AdminUser>) => {
        const response = await apiClient.put(`/admins/${data.id}`, data)
        return response.data
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['admins'] })
      }
    })
  }
  
  export function useToggleAdminStatus() {
    const queryClient = useQueryClient()
    return useMutation({
      mutationFn: async (id: string) => {
        const response = await apiClient.post(`/admins/${id}/toggle`)
        return response.data
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['admins'] })
      }
    })
  }

export function useDeleteAdmin() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.delete(`/admins/${id}`)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admins'] })
    }
  })
}
