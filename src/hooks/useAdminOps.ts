import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import apiClient from '@/lib/apiClient'
import { Tournament } from './useTournaments'

export function useAdminDashboardStats() {
  return useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: async () => {
      const response = await apiClient.get('/admin-ops/dashboard')
      return response.data
    },
  })
}

export function useAdminMatches(params?: { search?: string, page?: number, limit?: number }) {
  return useQuery({
    queryKey: ['admin-matches', params],
    queryFn: async () => {
      const response = await apiClient.get('/admin-ops/matches', { params })
      return response.data
    },
  })
}

export function useAdminMatchDetails(id: string) {
  return useQuery<Tournament, Error>({
    queryKey: ['admin-match', id],
    queryFn: async () => {
      const response = await apiClient.get(`/admin-ops/matches/${id}`)
      return response.data
    },
    enabled: !!id,
  })
}

export function useAdminUpdateRoom() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, roomId, roomPassword, roomScreenshot }: { id: string, roomId: string, roomPassword: string, roomScreenshot?: string }) => {
      const response = await apiClient.put(`/admin-ops/matches/${id}/room`, { roomId, roomPassword, roomScreenshot })
      return response.data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin-match', variables.id] })
    }
  })
}

export async function uploadImage(file: File): Promise<string> {
  const formData = new FormData()
  formData.append('image', file)
  const response = await apiClient.post('/admin-ops/upload/image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
  return response.data.url || response.data.imageUrl
}

export function useAdminOpenRoom() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.post(`/admin-ops/matches/${id}/open-room`)
      return response.data
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['admin-match', id] })
    }
  })
}

export function useAdminUpdateMatchStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, status }: { id: string, status: string }) => {
      const response = await apiClient.patch(`/admin-ops/matches/${id}/status`, { status })
      return response.data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin-match', variables.id] })
    }
  })
}

export function useAdminUploadResults() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, resultsScreenshot, resultsRemarks, winners }: { id: string, resultsScreenshot?: string, resultsRemarks?: string, winners: { winnerUid: string, rank: number }[] }) => {
      const response = await apiClient.post(`/admin-ops/matches/${id}/results`, { resultsScreenshot, resultsRemarks, winners })
      return response.data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin-match', variables.id] })
      queryClient.invalidateQueries({ queryKey: ['admin-uploaded-results'] })
    }
  })
}

export function useAdminUploadedResults() {
  return useQuery({
    queryKey: ['admin-uploaded-results'],
    queryFn: async () => {
      const response = await apiClient.get('/admin-ops/results/uploaded')
      return response.data
    },
  })
}

export function useAdminParticipants(matchId: string) {
  return useQuery({
    queryKey: ['admin-participants', matchId],
    queryFn: async () => {
      const response = await apiClient.get(`/admin-ops/matches/${matchId}/participants`)
      return response.data
    },
    enabled: !!matchId,
  })
}

export function useAdminVerifyParticipant() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ matchId, participantId, status }: { matchId: string, participantId: string, status: string }) => {
      const response = await apiClient.patch(`/admin-ops/matches/${matchId}/participants/${participantId}`, { status })
      return response.data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin-participants', variables.matchId] })
    }
  })
}

export function useAdminSupportTickets() {
  return useQuery({
    queryKey: ['admin-support-tickets'],
    queryFn: async () => {
      const response = await apiClient.get('/admin-ops/support')
      return response.data
    },
  })
}
