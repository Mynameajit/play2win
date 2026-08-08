'use client'

import React, { useEffect, useState, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useApp } from '@/context/AppContext'
import { apiClient } from '@/lib/apiClient'
import { useSocket } from '@/context/SocketContext'
import { PageHeader } from '@/components/common/PageHeader'
import { ArrowLeft, Send, Image as ImageIcon, Check, CheckCheck, Loader2, User, Shield, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { uploadToCloudinary } from '@/lib/cloudinary'
import { Skeleton } from '@/components/ui/skeleton'

export default function SupportChatPage() {
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
  const [isTyping, setIsTyping] = useState(false)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (userRole === 'guest') {
      router.replace('/login')
      return
    }

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

    fetchTicket()
  }, [params.id, userRole, router])

  useEffect(() => {
    if (!socket || !ticket) return

    socket.emit('join_ticket', ticket.id)

    const handleNewMessage = (msg: any) => {
      setMessages(prev => [...prev, msg])
      if (msg.senderId !== user?.id) {
        socket.emit('support:read', { ticketId: ticket.id })
      }
    }

    const handleTyping = (data: { isTyping: boolean, username: string }) => {
      setIsTyping(data.isTyping)
    }

    socket.on('support:message:new', handleNewMessage)
    socket.on('support:typing', handleTyping)

    return () => {
      socket.emit('leave_ticket', ticket.id)
      socket.off('support:message:new', handleNewMessage)
      socket.off('support:typing', handleTyping)
    }
  }, [socket, ticket, user])

  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  const handleTypingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value)
    
    if (socket && ticket) {
      socket.emit('support:typing', { ticketId: ticket.id, isTyping: true })
      
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
      
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit('support:typing', { ticketId: ticket.id, isTyping: false })
      }, 2000)
    }
  }

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

      const res = await apiClient.post(`/api/support/tickets/${ticket.id}/messages`, {
        message: newMessage,
        attachments: attachmentUrls
      })

      // Update local state is handled by socket
      setNewMessage('')
      setImageFile(null)
      if (socket) socket.emit('support:typing', { ticketId: ticket.id, isTyping: false })
    } catch (error) {
      showToast('Failed to send message', 'error')
    } finally {
      setIsSending(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col h-[calc(100vh-80px)] space-y-4">
        <PageHeader />
        <Skeleton className="h-16 w-full rounded-2xl bg-slate-800" />
        <div className="flex-1 space-y-4">
          <Skeleton className="h-20 w-3/4 bg-slate-800 rounded-2xl rounded-tl-sm" />
          <Skeleton className="h-16 w-2/3 bg-slate-800 rounded-2xl rounded-tr-sm ml-auto" />
        </div>
      </div>
    )
  }

  if (!ticket) return null

  const isClosed = ticket.status === 'CLOSED' || ticket.status === 'RESOLVED'

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] pb-safe animate-in fade-in">
      <PageHeader />

      {/* Ticket Header */}
      <div className="glass-panel p-3 rounded-2xl border border-white/10 mt-2 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="icon"
            className="h-8 w-8 rounded-full bg-slate-800 text-slate-400 hover:text-white"
            onClick={() => router.back()}
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-sm font-bold text-white line-clamp-1">{ticket.subject}</h1>
            <div className="flex items-center gap-2 text-[10px] mt-0.5">
              <span className="text-cyan-400 font-medium">{ticket.displayId}</span>
              <span className="text-slate-500">•</span>
              <span className="text-slate-400">{ticket.category}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto mt-4 mb-4 space-y-4 px-1 hide-scrollbar">
        {messages.map((msg, i) => {
          const isMe = msg.senderId === user?.id
          const isAdmin = msg.sender?.role === 'ADMIN' || msg.sender?.role === 'SUPERADMIN'
          
          return (
            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2`}>
              <div className={`max-w-[85%] flex gap-2 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                
                {/* Avatar */}
                <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-auto ${isAdmin ? 'bg-cyan-600' : 'bg-slate-700'}`}>
                  {isAdmin ? <Shield className="w-3 h-3 text-white" /> : <User className="w-3 h-3 text-slate-300" />}
                </div>

                {/* Bubble */}
                <div className={`p-3 rounded-2xl text-sm ${
                  isMe 
                    ? 'bg-purple-600 text-white rounded-br-sm' 
                    : 'bg-slate-800 text-slate-200 border border-white/5 rounded-bl-sm'
                }`}>
                  {/* Attachments */}
                  {msg.attachments && msg.attachments.length > 0 && (
                    <div className="mb-2 grid gap-1">
                      {msg.attachments.map((att: any) => (
                        <img key={att.id} src={att.fileUrl} alt="Attachment" className="rounded-lg max-h-48 object-cover" />
                      ))}
                    </div>
                  )}
                  
                  <p className="whitespace-pre-wrap break-words">{msg.message}</p>
                  
                  {/* Meta info */}
                  <div className={`flex items-center gap-1 mt-1 text-[9px] ${isMe ? 'text-purple-300 justify-end' : 'text-slate-500'}`}>
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    {isMe && (
                      msg.isRead ? <CheckCheck className="w-3 h-3 text-cyan-300" /> : <Check className="w-3 h-3 text-purple-400" />
                    )}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
        
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-slate-800 rounded-2xl rounded-bl-sm p-3 border border-white/5 flex gap-1 items-center h-8">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="shrink-0 glass-panel p-2 rounded-2xl border border-white/10 mb-2 sm:mb-0 relative">
        {isClosed ? (
          <div className="text-center py-2 text-xs text-slate-400 font-medium">
            This ticket has been marked as {ticket.status.toLowerCase()}.
          </div>
        ) : (
          <form onSubmit={handleSendMessage} className="flex items-end gap-2">
            
            {imageFile && (
              <div className="absolute bottom-full left-0 mb-2 p-1 glass-panel rounded-lg border border-white/10">
                <div className="relative">
                  <img src={URL.createObjectURL(imageFile)} alt="Preview" className="h-16 w-16 object-cover rounded" />
                  <button type="button" onClick={() => setImageFile(null)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              </div>
            )}

            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-10 w-10 shrink-0 text-slate-400 hover:text-cyan-400"
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
              onChange={handleTypingChange}
              placeholder="Type your message..."
              className="flex-1 h-10 bg-black/20 border border-white/5 rounded-xl px-3 text-sm text-white focus:outline-none focus:border-cyan-500/30 placeholder:text-slate-600"
            />

            <Button 
              type="submit"
              disabled={isSending || (!newMessage.trim() && !imageFile)}
              className="h-10 w-10 shrink-0 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white"
            >
              {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </Button>
          </form>
        )}
      </div>
    </div>
  )
}
