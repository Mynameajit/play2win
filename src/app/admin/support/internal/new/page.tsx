'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useApp } from '@/context/AppContext'
import { apiClient } from '@/lib/apiClient'
import { Headset, ArrowLeft, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function NewInternalTicketPage() {
  const router = useRouter()
  const { userRole, showToast } = useApp()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')

  React.useEffect(() => {
    if (userRole !== 'admin') {
      router.replace('/login')
    }
  }, [userRole, router])

  if (userRole !== 'admin') {
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (subject.length < 5) {
      showToast('Subject must be at least 5 characters', 'error')
      return
    }
    if (message.length < 10) {
      showToast('Message must be at least 10 characters', 'error')
      return
    }

    setIsSubmitting(true)
    try {
      const res = await apiClient.post('/support/admin/internal', {
        subject,
        message,
        category: 'INTERNAL'
      })

      showToast('Internal ticket created!', 'success')
      router.push(`/admin/support/${res.data.id}`)
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Failed to create internal ticket', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex items-center gap-3">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => router.back()}
          className="h-8 w-8 bg-slate-800 rounded-full text-slate-400 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Headset className="w-5 h-5 text-amber-400" />
            Ask Super Admin
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">Escalate issues or request internal assistance</p>
        </div>
      </div>

      <div className="glass-panel p-6 rounded-2xl border border-amber-500/20 max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-5">
          
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 block">Subject / Issue Summary</label>
            <input 
              type="text" 
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. Need permission to refund player"
              className="w-full bg-slate-900/80 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-500/50"
              required
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 block">Details</label>
            <textarea 
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Provide context for the Super Admin..."
              rows={6}
              className="w-full bg-slate-900/80 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-500/50 resize-none"
              required
            />
          </div>

          <Button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full bg-amber-600 hover:bg-amber-500 text-white font-bold h-12 rounded-xl"
          >
            {isSubmitting ? 'Sending...' : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Submit to Super Admin
              </>
            )}
          </Button>

        </form>
      </div>
    </div>
  )
}
