import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import apiClient from '@/lib/apiClient'

export interface Tournament {
  id: string
  title: string
  game: string
  mode: string
  map: string
  startTime: string
  prizePool: string
  entryFee: string
  totalSlots: number
  joinedSlots: number
  status: 'LIVE' | 'UPCOMING' | 'FILLED' | 'COMPLETED' | 'RESULT_PENDING' | 'PRIZE_DISTRIBUTED' | 'ROOM_OPEN' | 'ROOM_READY' | 'CANCELLED' | string
  assignedAdminId?: string
  roomId?: string
  roomPassword?: string
  banner?: string
  thumbnail?: string
  winnersDeclared?: boolean
  matchResults?: any[]
  resultsScreenshot?: string
  resultsRemarks?: string
  assignedAdmin?: any
  createdAt: string
  updatedAt: string
}

export interface TournamentListResponse {
  tournaments: Tournament[]
  total: number
  pages: number
  currentPage: number
}


export function useTournaments(params?: { search?: string, game?: string, status?: string, page?: number, limit?: number }) {
  return useQuery<TournamentListResponse, Error>({
    queryKey: ['tournaments', params],
    queryFn: async () => {
      const response = await apiClient.get('/tournaments', { params })
      return response.data
    },
  })
}

export function useTournamentDetails(id: string) {
  return useQuery<Tournament & { matchResults?: any[], participants?: any[] }, Error>({
    queryKey: ['tournament', id],
    queryFn: async () => {
      const response = await apiClient.get(`/tournaments/${id}`)
      return response.data
    },
    enabled: !!id
  })
}

export function useCreateTournament() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: Partial<Tournament>) => {
      const response = await apiClient.post('/tournaments', data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tournaments'] })
    }
  })
}

export function useUpdateTournament() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: { id: string } & Partial<Tournament>) => {
      const response = await apiClient.put(`/tournaments/${data.id}`, data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tournaments'] })
    }
  })
}

export function useDeleteTournament() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.post(`/tournaments/${id}/cancel`) // Cancelling rather than hard deleting
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tournaments'] })
    }
  })
}
