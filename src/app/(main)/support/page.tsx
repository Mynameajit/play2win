'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useApp } from '@/context/AppContext'
import { apiClient } from '@/lib/apiClient'
import { PageHeader } from '@/components/common/PageHeader'
import { Headset, MessageSquare, Plus, Clock, Search, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

export default function SupportPage() {
  const router = useRouter()
  const { userRole, showToast } = useApp()
  const [tickets, setTickets] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (userRole === 'guest') {
      showToast('Please sign in to access support.', 'info')
      router.replace('/login')
      return
    }

    const fetchTickets = async () => {
      try {
        const res = await apiClient.get('/support/tickets/mine')
        setTickets(res.data)
      } catch (error) {
        // Silently fail so the user doesn't see a red toast error if they have no tickets or API is missing
        console.error('Support tickets fetch failed:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchTickets()
  }, [userRole, router, showToast])

  if (userRole === 'guest') return null

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'NEW':
      case 'OPEN': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
      case 'IN_PROGRESS': return 'text-amber-400 bg-amber-500/10 border-amber-500/20'
      case 'WAITING_FOR_USER': return 'text-purple-400 bg-purple-500/10 border-purple-500/20'
      case 'RESOLVED': return 'text-blue-400 bg-blue-500/10 border-blue-500/20'
      case 'CLOSED': return 'text-slate-400 bg-slate-500/10 border-slate-500/20'
      default: return 'text-gray-400 bg-gray-500/10 border-gray-500/20'
    }
  }

  return (
    <div className="space-y-4 pb-20 md:pb-8 animate-in fade-in duration-300">
      <PageHeader />

      <div className="flex items-center justify-between mt-2 px-3 sm:px-0">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white italic drop-shadow-md flex items-center gap-2 uppercase tracking-tight">
            <Headset className="w-5 h-5 text-purple-400" />
            SUPPORT
          </h1>
          <p className="text-[10px] sm:text-xs text-slate-400 mt-1 font-bold">24/7 HELPDESK & TICKETS</p>
        </div>
        <Button 
          onClick={() => router.push('/support/new')}
          className="bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white shadow-[0_0_15px_rgba(147,51,234,0.4)] rounded-lg font-bold text-[10px] uppercase tracking-wider py-1.5 h-auto"
        >
          <Plus className="w-3.5 h-3.5 mr-1" />
          NEW TICKET
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3 mt-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="glass-panel rounded-2xl p-4 border border-white/5 space-y-3 animate-pulse">
              <div className="flex justify-between">
                <Skeleton className="h-5 w-3/4 bg-slate-800" />
                <Skeleton className="h-5 w-16 bg-slate-800 rounded-full" />
              </div>
              <Skeleton className="h-3 w-1/2 bg-slate-800" />
            </div>
          ))}
        </div>
      ) : tickets.length > 0 ? (
        <div className="space-y-3 mt-6">
          {tickets.map(ticket => (
            <div 
              key={ticket.id}
              onClick={() => router.push(`/support/${ticket.id}`)}
              className="glass-panel p-4 rounded-2xl border border-white/10 hover:border-cyan-500/30 transition-all cursor-pointer group"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded border border-white/10 bg-black/20 text-slate-400">
                      {ticket.displayId}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getStatusColor(ticket.status)}`}>
                      {ticket.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-white group-hover:text-cyan-400 transition-colors line-clamp-1">
                    {ticket.subject}
                  </h3>
                  <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-400 font-medium">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(ticket.updatedAt).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageSquare className="w-3 h-3" />
                      {ticket.category}
                    </span>
                  </div>
                </div>
                <div className="h-8 w-8 rounded-full bg-slate-800 flex items-center justify-center flex-shrink-0 group-hover:bg-cyan-900 group-hover:text-cyan-400 transition-colors">
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="glass-panel mt-6 p-8 rounded-2xl text-center border border-white/10 flex flex-col items-center justify-center min-h-[300px]">
          <div className="w-16 h-16 rounded-full bg-cyan-500/10 flex items-center justify-center mb-4">
            <MessageSquare className="w-8 h-8 text-cyan-400" />
          </div>
          <h4 className="text-base font-bold text-white">No Tickets Found</h4>
          <p className="text-sm text-slate-400 mt-2 max-w-[250px] mx-auto">
            You haven't opened any support tickets yet. Click the button above to create one.
          </p>
        </div>
      )}
    </div>
  )
}
