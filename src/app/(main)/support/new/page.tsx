'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useApp } from '@/context/AppContext'
import { apiClient } from '@/lib/apiClient'
import { PageHeader } from '@/components/common/PageHeader'
import { Headset, Upload, X, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { uploadToCloudinary } from '@/lib/cloudinary'

const CATEGORIES = [
  'PAYMENT', 'WALLET', 'TOURNAMENT', 'MATCH', 'ROOM', 'RESULT', 'WITHDRAWAL', 'ACCOUNT', 'OTHER'
]

export default function NewSupportTicketPage() {
  const router = useRouter()
  const { userRole, showToast } = useApp()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [subject, setSubject] = useState('')
  const [category, setCategory] = useState('OTHER')
  const [message, setMessage] = useState('')
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([])

  React.useEffect(() => {
    if (userRole === 'guest') {
      router.replace('/login')
    }
  }, [userRole, router])

  if (userRole === 'guest') {
    return null
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files)
      // Limit to 3 images max
      if (imageFiles.length + newFiles.length > 3) {
        showToast('Maximum 3 images allowed', 'error')
        return
      }
      
      setImageFiles(prev => [...prev, ...newFiles])
      
      const newPreviewUrls = newFiles.map(file => URL.createObjectURL(file))
      setImagePreviewUrls(prev => [...prev, ...newPreviewUrls])
    }
  }

  const removeImage = (index: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index))
    setImagePreviewUrls(prev => {
      const newUrls = [...prev]
      URL.revokeObjectURL(newUrls[index])
      newUrls.splice(index, 1)
      return newUrls
    })
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
      let attachmentUrls: string[] = []
      
      if (imageFiles.length > 0) {
        try {
          const uploadPromises = imageFiles.map(file => uploadToCloudinary(file, 'support_attachments'))
          attachmentUrls = await Promise.all(uploadPromises)
        } catch (uploadError) {
          console.error('Image upload failed, proceeding without images:', uploadError)
          showToast('Image upload failed, creating ticket without images...', 'info')
        }
      }

      const res = await apiClient.post('/support/tickets', {
        subject,
        category,
        message,
        attachments: attachmentUrls
      })

      showToast('Support ticket created successfully!', 'success')
      router.push(`/support/${res.data.id}`)
    } catch (error: any) {
      console.error(error)
      showToast(error.response?.data?.message || 'Failed to create ticket', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-4 pb-20 md:pb-8 animate-in fade-in duration-300">
      <PageHeader />

      <div className="flex items-center gap-3 mt-2">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => router.back()}
          className="h-8 w-8 rounded-full bg-slate-800 text-slate-400 hover:text-white"
        >
          <X className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            New Ticket
          </h1>
        </div>
      </div>

      <div className="glass-panel p-4 rounded-2xl border border-white/10 mt-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 block">Category</label>
            <select 
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-slate-900/80 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-500/50"
            >
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat.replace(/_/g, ' ')}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 block">Subject</label>
            <input 
              type="text" 
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Brief summary of your issue"
              className="w-full bg-slate-900/80 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-500/50"
              required
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 block">Message</label>
            <textarea 
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Please describe your issue in detail..."
              rows={5}
              className="w-full bg-slate-900/80 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-500/50 resize-none"
              required
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 block">Attachments (Optional)</label>
            <div className="flex flex-wrap gap-3">
              {imagePreviewUrls.map((url, i) => (
                <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden border border-white/20">
                  <img src={url} alt="Preview" className="w-full h-full object-cover" />
                  <button 
                    type="button"
                    onClick={() => removeImage(i)}
                    className="absolute top-1 right-1 bg-black/60 rounded-full p-1 text-white hover:bg-red-500 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              
              {imageFiles.length < 3 && (
                <label className="w-20 h-20 rounded-xl border border-dashed border-white/20 bg-slate-900/50 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-800 transition-colors text-slate-400 hover:text-cyan-400">
                  <Upload className="w-6 h-6 mb-1" />
                  <span className="text-[10px] font-medium">Upload</span>
                  <input 
                    type="file" 
                    accept="image/*" 
                    multiple
                    className="hidden" 
                    onChange={handleImageChange}
                  />
                </label>
              )}
            </div>
            <p className="text-[10px] text-slate-500 mt-2">Maximum 3 images allowed. (JPG, PNG)</p>
          </div>

          <Button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold h-12 rounded-xl mt-4"
          >
            {isSubmitting ? (
              <span className="animate-pulse">Submitting...</span>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Submit Ticket
              </>
            )}
          </Button>

        </form>
      </div>
    </div>
  )
}
