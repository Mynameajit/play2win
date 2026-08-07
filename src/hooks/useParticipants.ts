import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import apiClient from '@/lib/apiClient'

export interface Participant {
  id: string
  tournamentId: string
  userId: string
  gameUid: string
  ign: string
  isVerified: boolean
  verificationImage?: string
  joinedAt: string
  user: {
    id: string
    username: string
    phone: string
  }
  tournament: {
    id: string
    title: string
    game: string
  }
}

export interface ParticipantListResponse {
  participants: Participant[]
  total: number
  pages: number
  currentPage: number
}


export function useParticipants(params?: { search?: string, tournamentId?: string, page?: number, limit?: number }) {
  return useQuery<ParticipantListResponse, Error>({
    queryKey: ['participants', params],
    queryFn: async () => {
      const response = await apiClient.get('/superadmin/participants', { params })
      return response.data
    },
  })
}

export function useVerifyParticipant() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: { tournamentId: string, userId: string, status: string }) => {
      const response = await apiClient.post(`/tournaments/${data.tournamentId}/verify-player`, {
        userId: data.userId,
        status: data.status
      })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['participants'] })
    }
  })
}
