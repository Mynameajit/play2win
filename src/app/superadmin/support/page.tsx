'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useApp } from '@/context/AppContext'
import { apiClient } from '@/lib/apiClient'
import { Headset, MessageSquare, Clock, Filter, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

export default function SuperAdminSupportPage() {
  const router = useRouter()
  const { userRole, showToast } = useApp()
  const [tickets, setTickets] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'escalated' | 'internal'>('all')

  useEffect(() => {
    if (userRole !== 'superadmin') {
      router.replace('/login')
      return
    }

    const fetchTickets = async () => {
      try {
        setIsLoading(true)
        // Re-using the same endpoint but passing superadmin filters if needed
        // The backend `getAdminTickets` returns all non-internal tickets.
        // We will just fetch everything directly from a new superadmin specific endpoint or use existing.
        // Actually, Superadmin should see EVERYTHING. We'll use the existing one but we might need a dedicated SuperAdmin controller for this.
        // For now, let's use the admin endpoint with 'all' and a special 'internal' filter.
        
        let url = `/api/support/admin/tickets?filter=all`
        if (filter === 'escalated') url += '&status=ESCALATED'
        
        const res = await apiClient.get(url)
        setTickets(res.data)
      } catch (error) {
        showToast('Failed to load support tickets', 'error')
      } finally {
        setIsLoading(false)
      }
    }

    fetchTickets()
  }, [userRole, router, filter, showToast])

  if (userRole !== 'superadmin') return null

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'NEW': return 'bg-emerald-500'
      case 'IN_PROGRESS': return 'bg-amber-500'
      case 'WAITING_FOR_USER': return 'bg-purple-500'
      case 'ESCALATED': return 'bg-red-500 animate-pulse'
      case 'RESOLVED': return 'bg-blue-500'
      case 'CLOSED': return 'bg-slate-500'
      default: return 'bg-gray-500'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Headset className="w-6 h-6 text-amber-300" />
            Support Dashboard
          </h1>
          <p className="text-sm text-slate-400 mt-1">Global view of all support operations</p>
        </div>
        <Button 
          onClick={() => router.push('/superadmin/support/settings')}
          variant="outline"
          className="border-amber-500/50 text-amber-400 hover:bg-amber-500/10 rounded-xl"
        >
          <Settings className="w-4 h-4 mr-1" />
          Settings
        </Button>
      </div>

      <div className="flex gap-2 bg-slate-900/50 p-1.5 rounded-xl border border-white/5 w-max">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-colors ${filter === 'all' ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-slate-300'}`}
        >
          All Tickets
        </button>
        <button
          onClick={() => setFilter('escalated')}
          className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-colors ${filter === 'escalated' ? 'bg-red-500/20 text-red-400' : 'text-slate-400 hover:text-slate-300'}`}
        >
          Escalated to Me
        </button>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="glass-panel rounded-2xl p-4 border border-white/5 space-y-3 animate-pulse">
              <Skeleton className="h-5 w-3/4 bg-slate-800" />
              <Skeleton className="h-4 w-1/2 bg-slate-800" />
            </div>
          ))}
        </div>
      ) : tickets.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {tickets.map(ticket => (
            <div 
              key={ticket.id}
              onClick={() => router.push(`/admin/support/${ticket.id}`)}
              className="glass-panel p-5 rounded-2xl border border-white/10 hover:border-amber-500/30 transition-all cursor-pointer relative overflow-hidden group"
            >
              <div className={`absolute left-0 top-0 bottom-0 w-1 ${getStatusColor(ticket.status)}`} />
              
              <div className="flex justify-between items-start mb-3">
                <span className="text-xs font-bold text-slate-400 bg-black/30 px-2 py-0.5 rounded">
                  {ticket.displayId}
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${getStatusColor(ticket.status)} text-white`}>
                  {ticket.status.replace(/_/g, ' ')}
                </span>
              </div>
              
              <h3 className="text-base font-bold text-white group-hover:text-amber-400 transition-colors mb-1">
                {ticket.subject}
              </h3>
              
              <div className="text-xs text-slate-400 mb-4 line-clamp-2">
                {ticket.messages?.[0]?.message || 'No messages yet'}
              </div>
              
              <div className="flex items-center justify-between text-xs font-medium text-slate-500 pt-3 border-t border-white/5">
                <span className="flex items-center gap-1">
                  <MessageSquare className="w-3 h-3" />
                  {ticket.category}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {new Date(ticket.updatedAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="glass-panel p-10 rounded-2xl text-center border border-white/10 flex flex-col items-center justify-center">
          <Filter className="w-10 h-10 text-slate-600 mb-3" />
          <h4 className="text-lg font-bold text-white">No tickets found</h4>
          <p className="text-sm text-slate-400 mt-1">Try changing your filters or check back later.</p>
        </div>
      )}
    </div>
  )
}
