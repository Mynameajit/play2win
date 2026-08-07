import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import apiClient from '@/lib/apiClient'

export interface Game {
  id: string
  name: string
  thumbnail: string
  isEnabled: boolean
  createdAt: string
  updatedAt: string
}

export interface GameListResponse {
  games: Game[]
  total: number
  pages: number
  currentPage: number
}

// Ensure axios is configured correctly (e.g. with interceptors for token) in a real app,
// assuming an auth token is handled globally or via cookies.

export function useGames(params?: { search?: string, isEnabled?: boolean, page?: number, limit?: number }) {
  return useQuery<GameListResponse, Error>({
    queryKey: ['games', params],
    queryFn: async () => {
      const response = await apiClient.get('/games', { params })
      return response.data
    },
  })
}

export function useCreateGame() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: { name: string, thumbnail?: string }) => {
      const response = await apiClient.post('/games', data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['games'] })
    }
  })
}

export function useUpdateGame() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: { id: string, name: string, thumbnail?: string }) => {
      const response = await apiClient.put(`/games/${data.id}`, { name: data.name, thumbnail: data.thumbnail })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['games'] })
    }
  })
}

export function useToggleGameStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.post(`/games/${id}/toggle`)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['games'] })
    }
  })
}

export function useDeleteGame() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.delete(`/games/${id}`)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['games'] })
    }
  })
}
