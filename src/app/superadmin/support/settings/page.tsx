'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useApp } from '@/context/AppContext'
import { apiClient } from '@/lib/apiClient'
import { Settings, Save, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function SupportSettingsPage() {
  const router = useRouter()
  const { userRole, showToast } = useApp()
  const [isSaving, setIsSaving] = useState(false)
  const [settings, setSettings] = useState({
    supportPhone: '',
    supportEmail: '',
    supportAvailability: '24/7',
    welcomeMessage: '',
    autoReplyMessage: ''
  })

  useEffect(() => {
    if (userRole !== 'superadmin') {
      router.replace('/login')
      return
    }

    const fetchSettings = async () => {
      try {
        const res = await apiClient.get('/support/settings')
        if (res.data) {
          setSettings(res.data)
        }
      } catch (error) {
        showToast('Failed to load settings', 'error')
      }
    }

    fetchSettings()
  }, [userRole, router, showToast])

  if (userRole !== 'superadmin') return null

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    try {
      await apiClient.put('/support/superadmin/settings', settings)
      showToast('Settings saved successfully', 'success')
    } catch (error) {
      showToast('Failed to save settings', 'error')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6">
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
            <Settings className="w-5 h-5 text-amber-400" />
            Support Settings
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">Configure global support desk parameters</p>
        </div>
      </div>

      <div className="glass-panel p-6 rounded-2xl border border-white/10 max-w-2xl">
        <form onSubmit={handleSave} className="space-y-5">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 block">Support Phone</label>
              <input 
                type="text" 
                value={settings.supportPhone}
                onChange={(e) => setSettings({ ...settings, supportPhone: e.target.value })}
                placeholder="+1 234 567 890"
                className="w-full bg-slate-900/80 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-500/50"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 block">Support Email</label>
              <input 
                type="email" 
                value={settings.supportEmail}
                onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
                placeholder="support@play2earn.com"
                className="w-full bg-slate-900/80 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-500/50"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 block">Availability Hours</label>
            <input 
              type="text" 
              value={settings.supportAvailability}
              onChange={(e) => setSettings({ ...settings, supportAvailability: e.target.value })}
              placeholder="e.g. 24/7 or Mon-Fri 9AM-5PM"
              className="w-full bg-slate-900/80 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-500/50"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 block">Welcome Message</label>
            <textarea 
              value={settings.welcomeMessage}
              onChange={(e) => setSettings({ ...settings, welcomeMessage: e.target.value })}
              placeholder="Message shown at the top of the support page..."
              rows={3}
              className="w-full bg-slate-900/80 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-500/50 resize-none"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 block">Auto-Reply Message</label>
            <textarea 
              value={settings.autoReplyMessage}
              onChange={(e) => setSettings({ ...settings, autoReplyMessage: e.target.value })}
              placeholder="Automatic response when a new ticket is created..."
              rows={3}
              className="w-full bg-slate-900/80 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-500/50 resize-none"
            />
          </div>

          <Button 
            type="submit" 
            disabled={isSaving}
            className="w-full bg-amber-600 hover:bg-amber-500 text-white font-bold h-12 rounded-xl"
          >
            {isSaving ? 'Saving...' : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Settings
              </>
            )}
          </Button>

        </form>
      </div>
    </div>
  )
}
