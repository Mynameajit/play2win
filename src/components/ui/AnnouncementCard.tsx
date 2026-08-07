'use client'

import React, { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Megaphone, X } from 'lucide-react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import apiClient from '@/lib/apiClient'
import { useSocket } from '@/context/SocketContext'

export function AnnouncementCard() {
  const queryClient = useQueryClient()
  const { socket } = useSocket()
  const [isVisible, setIsVisible] = React.useState(true)

  const { data: announcements } = useQuery({
    queryKey: ['active-announcements'],
    queryFn: async () => {
      const res = await apiClient.get('/notifications/announcements/active')
      return res.data
    },
    refetchInterval: 300000 // 5 mins fallback
  })

  useEffect(() => {
    if (!socket) return
    const handleNewAnnouncement = () => {
      queryClient.invalidateQueries({ queryKey: ['active-announcements'] })
      setIsVisible(true) // Re-show if they dismissed a previous one
    }

    if (socket) {
      socket.on('announcement:new', handleNewAnnouncement)
      return () => {
        socket.off('announcement:new', handleNewAnnouncement)
      }
    }
  }, [socket, queryClient])

  const latestAnnouncement = announcements && announcements.length > 0 ? announcements[0] : null

  if (!latestAnnouncement) return null

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary-900/40 via-purple-900/40 to-primary-900/40 border border-primary-500/20 p-4 mb-6"
        >
          {/* Animated background glow */}
          <div className="absolute top-0 left-0 w-full h-full bg-[url('/assets/noise.png')] opacity-10 mix-blend-overlay pointer-events-none" />
          <div className="absolute -top-24 -left-24 w-48 h-48 bg-primary-500/20 rounded-full blur-3xl" />
          
          <div className="relative flex items-start gap-4">
            <div className="p-3 bg-primary-500/20 rounded-xl text-primary-400 shrink-0 shadow-lg shadow-primary-500/10">
              <Megaphone className="w-6 h-6 animate-pulse" />
            </div>
            
            <div className="flex-1 min-w-0 pt-0.5">
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 bg-primary-500/20 text-primary-400 text-[10px] font-bold uppercase tracking-wider rounded border border-primary-500/20">
                  {latestAnnouncement.type}
                </span>
                {latestAnnouncement.isPinned && (
                  <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 text-[10px] font-bold uppercase tracking-wider rounded border border-amber-500/20">
                    Important
                  </span>
                )}
              </div>
              <h3 className="text-white font-bold text-base md:text-lg">{latestAnnouncement.title}</h3>
              <p className="text-slate-300 text-sm mt-1 max-w-3xl leading-relaxed">
                {latestAnnouncement.message}
              </p>
            </div>
            
            <button 
              onClick={() => setIsVisible(false)}
              className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

