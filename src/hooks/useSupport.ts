import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import apiClient from '@/lib/apiClient'

export interface SupportMessage {
  id: string
  ticketId: string
  senderId: string
  role: string
  message: string
  attachments: string[]
  createdAt: string
  sender: {
    username: string
  }
}

export interface SupportTicket {
  id: string
  userId: string
  adminId?: string
  subject: string
  status: string
  priority: string
  createdAt: string
  updatedAt: string
  user: {
    username: string
    phone: string
  }
  admin?: {
    username: string
  }
  messages?: SupportMessage[]
}

export interface TicketListResponse {
  tickets: SupportTicket[]
  total: number
  pages: number
  currentPage: number
}


export function useSupportTickets(params?: { status?: string, page?: number, limit?: number }) {
  return useQuery<TicketListResponse, Error>({
    queryKey: ['support-tickets', params],
    queryFn: async () => {
      const response = await apiClient.get('/support/tickets', { params })
      return response.data
    },
  })
}

export function useSupportTicketDetails(ticketId: string) {
  return useQuery<SupportTicket, Error>({
    queryKey: ['support-ticket', ticketId],
    queryFn: async () => {
      const response = await apiClient.get(`/support/tickets/${ticketId}`)
      return response.data
    },
    enabled: !!ticketId
  })
}

export function usePostTicketMessage() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ ticketId, message }: { ticketId: string, message: string }) => {
      const response = await apiClient.post(`/support/tickets/${ticketId}/messages`, { message })
      return response.data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['support-ticket', variables.ticketId] })
      queryClient.invalidateQueries({ queryKey: ['support-tickets'] })
    }
  })
}

export function useCloseTicket() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (ticketId: string) => {
      const response = await apiClient.post(`/support/tickets/${ticketId}/close`)
      return response.data
    },
    onSuccess: (_, ticketId) => {
      queryClient.invalidateQueries({ queryKey: ['support-ticket', ticketId] })
      queryClient.invalidateQueries({ queryKey: ['support-tickets'] })
    }
  })
}

export function useClaimTicket() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (ticketId: string) => {
      const response = await apiClient.post(`/support/tickets/${ticketId}/claim`)
      return response.data
    },
    onSuccess: (_, ticketId) => {
      queryClient.invalidateQueries({ queryKey: ['support-ticket', ticketId] })
      queryClient.invalidateQueries({ queryKey: ['support-tickets'] })
    }
  })
}
