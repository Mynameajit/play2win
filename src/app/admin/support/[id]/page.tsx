'use client'

import React, { useEffect, useState, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useApp } from '@/context/AppContext'
import { apiClient } from '@/lib/apiClient'
import { useSocket } from '@/context/SocketContext'
import { ArrowLeft, Send, Image as ImageIcon, Check, CheckCheck, Loader2, User, Shield, AlertTriangle, UserPlus, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { uploadToCloudinary } from '@/lib/cloudinary'
import { Skeleton } from '@/components/ui/skeleton'

export default function AdminSupportChatPage() {
  const params = useParams()
  const router = useRouter()
  const { userRole, showToast, user } = useApp()
  const { socket } = useSocket()
  
  const [ticket, setTicket] = useState<any>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [newMessage, setNewMessage] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const fetchTicket = async () => {
    try {
      const res = await apiClient.get(`/api/support/tickets/${params.id}`)
      setTicket(res.data)
      setMessages(res.data.messages || [])
    } catch (error) {
      showToast('Ticket not found or unauthorized', 'error')
      router.back()
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (userRole !== 'admin') {
      router.replace('/login')
      return
    }
    fetchTicket()
  }, [params.id, userRole, router])

  useEffect(() => {
    if (!socket || !ticket) return

    socket.emit('join_ticket', ticket.id)

    const handleNewMessage = (msg: any) => {
      setMessages(prev => [...prev, msg])
    }

    socket.on('support:message:new', handleNewMessage)

    return () => {
      socket.emit('leave_ticket', ticket.id)
      socket.off('support:message:new', handleNewMessage)
    }
  }, [socket, ticket])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() && !imageFile) return
    
    setIsSending(true)
    try {
      let attachmentUrls: string[] = []
      if (imageFile) {
        const url = await uploadToCloudinary(imageFile, 'support_attachments')
        attachmentUrls.push(url)
      }

      await apiClient.post(`/api/support/tickets/${ticket.id}/messages`, {
        message: newMessage,
        attachments: attachmentUrls
      })

      setNewMessage('')
      setImageFile(null)
    } catch (error) {
      showToast('Failed to send message', 'error')
    } finally {
      setIsSending(false)
    }
  }

  const handleAssign = async () => {
    try {
      await apiClient.put(`/api/support/admin/tickets/${ticket.id}/assign`)
      showToast('Ticket assigned to you', 'success')
      fetchTicket()
    } catch (error) {
      showToast('Failed to assign ticket', 'error')
    }
  }

  const handleStatusUpdate = async (status: string) => {
    try {
      await apiClient.put(`/api/support/admin/tickets/${ticket.id}/status`, { status })
      showToast('Status updated', 'success')
      fetchTicket()
    } catch (error) {
      showToast('Failed to update status', 'error')
    }
  }

  const handleEscalate = async () => {
    try {
      await apiClient.put(`/api/support/admin/tickets/${ticket.id}/escalate`)
      showToast('Ticket escalated to Super Admin', 'success')
      fetchTicket()
    } catch (error) {
      showToast('Failed to escalate', 'error')
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col h-[calc(100vh-80px)] space-y-4">
        <Skeleton className="h-20 w-full rounded-2xl bg-slate-800" />
      </div>
    )
  }

  if (!ticket) return null

  const isAssignedToMe = ticket.adminId === user?.id
  const isUnassigned = !ticket.adminId
  
  return (
    <div className="flex flex-col h-[calc(100vh-20px)] animate-in fade-in">
      
      {/* Admin Action Bar */}
      <div className="bg-slate-900 border border-white/10 rounded-2xl p-4 mb-4 flex flex-wrap gap-2 items-center justify-between shadow-xl">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="h-8 w-8 bg-slate-800 rounded-full">
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-sm font-bold text-white">{ticket.subject}</h1>
            <div className="text-[10px] text-slate-400">
              User: <span className="text-cyan-400">{ticket.user?.username}</span> | Status: <span className="font-bold">{ticket.status.replace(/_/g, ' ')}</span>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          {isUnassigned && (
            <Button onClick={handleAssign} className="bg-emerald-600 hover:bg-emerald-500 text-xs h-8">
              <UserPlus className="w-3 h-3 mr-1" /> Take Over
            </Button>
          )}
          {isAssignedToMe && ticket.status !== 'RESOLVED' && ticket.status !== 'CLOSED' && (
            <>
              <Button onClick={() => handleStatusUpdate('RESOLVED')} className="bg-blue-600 hover:bg-blue-500 text-xs h-8">
                <CheckCircle className="w-3 h-3 mr-1" /> Mark Resolved
              </Button>
              <Button onClick={() => handleStatusUpdate('CLOSED')} className="bg-slate-700 hover:bg-slate-600 text-xs h-8">
                Close
              </Button>
              {!ticket.escalatedToSuperAdmin && (
                <Button onClick={handleEscalate} className="bg-red-600 hover:bg-red-500 text-xs h-8">
                  <AlertTriangle className="w-3 h-3 mr-1" /> Escalate
                </Button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto mb-4 space-y-4 px-2 hide-scrollbar">
        {messages.map((msg, i) => {
          const isMe = msg.senderId === user?.id
          const isGamer = msg.sender?.role === 'USER'
          
          return (
            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] flex gap-2 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                
                <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-auto ${isGamer ? 'bg-slate-700' : 'bg-red-600'}`}>
                  {isGamer ? <User className="w-3 h-3 text-slate-300" /> : <Shield className="w-3 h-3 text-white" />}
                </div>

                <div className={`p-3 rounded-2xl text-sm ${
                  isMe 
                    ? 'bg-red-600 text-white rounded-br-sm' 
                    : 'bg-slate-800 text-slate-200 border border-white/5 rounded-bl-sm'
                }`}>
                  {msg.attachments && msg.attachments.length > 0 && (
                    <div className="mb-2 grid gap-1">
                      {msg.attachments.map((att: any) => (
                        <img key={att.id} src={att.fileUrl} alt="Attachment" className="rounded-lg max-h-48 object-cover" />
                      ))}
                    </div>
                  )}
                  <p className="whitespace-pre-wrap break-words">{msg.message}</p>
                  <div className={`flex items-center gap-1 mt-1 text-[9px] ${isMe ? 'text-red-200 justify-end' : 'text-slate-500'}`}>
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="shrink-0 bg-slate-900 p-3 rounded-2xl border border-white/10 shadow-xl">
        {!isAssignedToMe && !isUnassigned ? (
          <div className="text-center py-2 text-xs text-slate-400">
            This ticket is assigned to {ticket.admin?.username || 'another admin'}.
          </div>
        ) : (ticket.status === 'CLOSED' || ticket.status === 'RESOLVED') ? (
          <div className="text-center py-2 text-xs text-slate-400">
            This ticket is {ticket.status.toLowerCase()}.
          </div>
        ) : (
          <form onSubmit={handleSendMessage} className="flex items-end gap-2">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-10 w-10 shrink-0 text-slate-400 hover:text-red-400"
              onClick={() => fileInputRef.current?.click()}
            >
              <ImageIcon className="w-5 h-5" />
            </Button>
            
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              ref={fileInputRef}
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) setImageFile(e.target.files[0])
              }}
            />

            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your response to the gamer..."
              className="flex-1 h-10 bg-black/40 border border-white/5 rounded-xl px-3 text-sm text-white focus:outline-none focus:border-red-500/30 placeholder:text-slate-600"
            />

            <Button 
              type="submit"
              disabled={isSending || (!newMessage.trim() && !imageFile) || (!isAssignedToMe && !isUnassigned)}
              className="h-10 w-10 shrink-0 rounded-xl bg-red-600 hover:bg-red-500 text-white"
            >
              {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </Button>
          </form>
        )}
      </div>
    </div>
  )
}
