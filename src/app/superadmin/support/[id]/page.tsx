'use client'

import React, { useEffect, useState, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useApp } from '@/context/AppContext'
import { apiClient } from '@/lib/apiClient'
import { useSocket } from '@/context/SocketContext'
import { ArrowLeft, Send, Image as ImageIcon, Shield, User, Crown, CheckCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { uploadToCloudinary } from '@/lib/cloudinary'
import { Skeleton } from '@/components/ui/skeleton'

export default function SuperAdminSupportChatPage() {
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
      const res = await apiClient.get(`/support/tickets/${params.id}`)
      setTicket(res.data)
      setMessages(res.data.messages || [])
    } catch (error) {
      showToast('Ticket not found', 'error')
      router.back()
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (userRole !== 'superadmin') {
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

      await apiClient.post(`/support/tickets/${ticket.id}/messages`, {
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

  const handleStatusUpdate = async (status: string) => {
    try {
      await apiClient.put(`/api/support/admin/tickets/${ticket.id}/status`, { status })
      showToast('Status updated', 'success')
      fetchTicket()
    } catch (error) {
      showToast('Failed to update status', 'error')
    }
  }

  if (isLoading) {
    return <div className="p-4"><Skeleton className="h-20 w-full rounded-2xl bg-slate-800" /></div>
  }

  if (!ticket) return null

  return (
    <div className="flex flex-col h-[calc(100vh-20px)] animate-in fade-in">
      
      <div className="bg-slate-900 border border-white/10 rounded-2xl p-4 mb-4 flex flex-wrap gap-2 items-center justify-between shadow-xl">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="h-8 w-8 bg-slate-800 rounded-full">
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-sm font-bold text-white flex items-center gap-2">
              {ticket.isInternal && <Crown className="w-4 h-4 text-amber-400" />}
              {ticket.subject}
            </h1>
            <div className="text-[10px] text-slate-400 mt-0.5">
              Creator: <span className="text-amber-400">{ticket.user?.username}</span> | 
              Status: <span className="font-bold ml-1">{ticket.status.replace(/_/g, ' ')}</span>
            </div>
          </div>
        </div>

        {ticket.status !== 'RESOLVED' && ticket.status !== 'CLOSED' && (
          <div className="flex gap-2">
            <Button onClick={() => handleStatusUpdate('RESOLVED')} className="bg-blue-600 hover:bg-blue-500 text-xs h-8">
              <CheckCircle className="w-3 h-3 mr-1" /> Mark Resolved
            </Button>
            <Button onClick={() => handleStatusUpdate('CLOSED')} className="bg-slate-700 hover:bg-slate-600 text-xs h-8">
              Close
            </Button>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto mb-4 space-y-4 px-2 hide-scrollbar">
        {messages.map((msg, i) => {
          const isMe = msg.senderId === user?.id
          const role = msg.sender?.role
          const isSuper = role === 'SUPERADMIN'
          const isAdmin = role === 'ADMIN'
          
          let bubbleColor = isSuper ? 'bg-amber-600' : isAdmin ? 'bg-red-600' : 'bg-slate-700'
          
          return (
            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] flex gap-2 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                
                <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-auto ${bubbleColor}`}>
                  {isSuper ? <Crown className="w-3 h-3 text-white" /> : isAdmin ? <Shield className="w-3 h-3 text-white" /> : <User className="w-3 h-3 text-slate-300" />}
                </div>

                <div className={`p-3 rounded-2xl text-sm ${
                  isMe 
                    ? 'bg-amber-600 text-white rounded-br-sm' 
                    : 'bg-slate-800 text-slate-200 border border-white/5 rounded-bl-sm'
                }`}>
                  <div className="text-[9px] font-bold opacity-50 mb-1">{msg.sender?.fullName}</div>
                  {msg.attachments && msg.attachments.length > 0 && (
                    <div className="mb-2 grid gap-1">
                      {msg.attachments.map((att: any) => (
                        <img key={att.id} src={att.fileUrl} alt="Attachment" className="rounded-lg max-h-48 object-cover" />
                      ))}
                    </div>
                  )}
                  <p className="whitespace-pre-wrap break-words">{msg.message}</p>
                  <div className={`flex items-center gap-1 mt-1 text-[9px] ${isMe ? 'text-amber-200 justify-end' : 'text-slate-500'}`}>
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
        <div ref={messagesEndRef} />
      </div>

      <div className="shrink-0 bg-slate-900 p-3 rounded-2xl border border-white/10 shadow-xl">
        {(ticket.status === 'CLOSED' || ticket.status === 'RESOLVED') ? (
          <div className="text-center py-2 text-xs text-slate-400">
            This ticket is {ticket.status.toLowerCase()}.
          </div>
        ) : (
          <form onSubmit={handleSendMessage} className="flex items-end gap-2">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-10 w-10 shrink-0 text-slate-400 hover:text-amber-400"
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
              placeholder="Type your response..."
              className="flex-1 h-10 bg-black/40 border border-white/5 rounded-xl px-3 text-sm text-white focus:outline-none focus:border-amber-500/30 placeholder:text-slate-600"
            />

            <Button 
              type="submit"
              disabled={isSending || (!newMessage.trim() && !imageFile)}
              className="h-10 w-10 shrink-0 rounded-xl bg-amber-600 hover:bg-amber-500 text-white"
            >
              {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </Button>
          </form>
        )}
      </div>
    </div>
  )
}
