'use client'

import React, { useState, useEffect } from 'react'
import { Bell, CheckCircle, Trash2, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import apiClient from '@/lib/apiClient'
import { useSocket } from '@/context/SocketContext'

export function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false)
  const queryClient = useQueryClient()
  const { socket } = useSocket()

  const { data: notificationsData, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const res = await apiClient.get('/notifications')
      return res.data
    }
  })

  const { mutate: markAsRead } = useMutation({
    mutationFn: async (id: string) => await apiClient.patch(`/notifications/${id}/read`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] })
  })

  const { mutate: markAllAsRead } = useMutation({
    mutationFn: async () => await apiClient.post('/notifications/read-all'),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] })
  })

  const { mutate: deleteNotification } = useMutation({
    mutationFn: async (id: string) => await apiClient.delete(`/notifications/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] })
  })

  const { mutate: deleteAll } = useMutation({
    mutationFn: async () => await apiClient.post('/notifications/delete-all'),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] })
  })

  // Listen for realtime events
  useEffect(() => {
    if (!socket) return

    const handleNewNotification = () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      // A toast could also be shown here, but usually a global provider handles it
    }

    socket.on('notification:new', handleNewNotification)
    socket.on('notification:read', handleNewNotification)
    socket.on('notification:delete', handleNewNotification)

    return () => {
      socket.off('notification:new', handleNewNotification)
      socket.off('notification:read', handleNewNotification)
      socket.off('notification:delete', handleNewNotification)
    }
  }, [socket, queryClient])

  const notifications = notificationsData?.notifications || []
  const unreadCount = notifications.filter((n: any) => !n.isRead).length

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="p-2.5 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors relative"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-slate-800 animate-pulse" />
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute right-0 top-full mt-2 w-80 sm:w-96 glass-panel border border-white/10 rounded-3xl shadow-2xl z-50 overflow-hidden flex flex-col max-h-[80vh]"
            >
              {/* Header */}
              <div className="p-4 border-b border-white/5 flex items-center justify-between bg-slate-900/50">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  Notifications
                  {unreadCount > 0 && <span className="px-2 py-0.5 bg-primary-500/20 text-primary-400 text-xs rounded-full">{unreadCount}</span>}
                </h3>
                <div className="flex gap-2">
                  <button onClick={() => markAllAsRead()} title="Mark all as read" className="p-1.5 text-slate-400 hover:text-emerald-400 rounded-lg hover:bg-white/5 transition-colors">
                    <CheckCircle className="w-4 h-4" />
                  </button>
                  <button onClick={() => deleteAll()} title="Clear all" className="p-1.5 text-slate-400 hover:text-red-400 rounded-lg hover:bg-white/5 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* List */}
              <div className="flex-1 overflow-y-auto divide-y divide-white/5 p-2 space-y-1">
                {isLoading ? (
                  <div className="p-4 text-center text-slate-400 text-sm">Loading...</div>
                ) : notifications.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 flex flex-col items-center">
                    <Bell className="w-8 h-8 mb-3 opacity-20" />
                    <p className="text-sm font-medium">You're all caught up!</p>
                  </div>
                ) : (
                  notifications.map((notif: any) => (
                    <div 
                      key={notif.id}
                      className={`p-3 rounded-2xl flex items-start gap-3 transition-colors group relative ${notif.isRead ? 'hover:bg-white/[0.02]' : 'bg-primary-500/5 hover:bg-primary-500/10'}`}
                    >
                      {!notif.isRead && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary-500 rounded-r-full" />}
                      <div className="flex-1 min-w-0 pr-6">
                        <h4 className={`text-sm font-bold truncate ${notif.isRead ? 'text-slate-300' : 'text-white'}`}>{notif.title}</h4>
                        <p className="text-xs text-slate-400 mt-1 line-clamp-2">{notif.message}</p>
                        <p className="text-[10px] text-slate-500 mt-2 font-medium uppercase tracking-wider">{new Date(notif.createdAt).toLocaleString()}</p>
                      </div>
                      <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 flex flex-col gap-1 transition-opacity">
                        {!notif.isRead && (
                          <button onClick={(e) => { e.stopPropagation(); markAsRead(notif.id); }} className="p-1.5 bg-slate-800 text-emerald-400 hover:bg-emerald-500/20 rounded-lg shadow">
                            <CheckCircle className="w-3 h-3" />
                          </button>
                        )}
                        <button onClick={(e) => { e.stopPropagation(); deleteNotification(notif.id); }} className="p-1.5 bg-slate-800 text-red-400 hover:bg-red-500/20 rounded-lg shadow">
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

