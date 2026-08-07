'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useApp } from '@/context/AppContext'
import { PageHeader } from '@/components/common/PageHeader'
import { apiClient } from '@/lib/apiClient'
import { 
  Lock, 
  Copy, 
  Clock, 
  Phone, 
  MessageCircle, 
  ShieldAlert, 
  ArrowLeft,
  Calendar,
  Gamepad2
} from 'lucide-react'

export default function MatchRoomPage() {
  const params = useParams()
  const router = useRouter()
  const matchId = params?.id as string

  const { userRole, showToast } = useApp()
  const [match, setMatch] = useState<any | null>(null)
  const [timeLeft, setTimeLeft] = useState('')

  const fetchMatchDetails = async () => {
    try {
      const res = await apiClient.get(`/tournaments/${matchId}`)
      if (res.data) {
        setMatch(res.data)
      }
    } catch (err) {}
  }

  useEffect(() => {
    if (userRole === 'guest') {
      showToast('Please sign in to access the match lobby.', 'info')
      router.replace('/login')
      return
    }
    fetchMatchDetails()
  }, [matchId, userRole])

  // Countdown timer calculations
  useEffect(() => {
    if (!match || !match.startTime) return

    const timer = setInterval(() => {
      const start = new Date(match.startTime).getTime()
      const now = new Date().getTime()
      const diff = start - now

      if (diff <= 0) {
        setTimeLeft('Match Starting Now! 🎮')
        clearInterval(timer)
      } else {
        const hours = Math.floor(diff / (1000 * 60 * 60))
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
        const seconds = Math.floor((diff % (1000 * 60)) / 1000)
        setTimeLeft(`${hours}h ${minutes}m ${seconds}s`)
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [match])

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    showToast(`${label} copied to clipboard!`, 'success')
  }

  if (!match) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-white">
        <span className="w-8 h-8 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
        <p className="text-xs text-slate-400 mt-2 font-medium">Connecting to match room...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-20 md:pb-8 max-w-2xl mx-auto text-white px-4">
      
      {/* Header back */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-xl bg-slate-900 border border-white/10 text-slate-300 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest">Active Match Room credentials</span>
          <h2 className="text-xl font-extrabold text-white">{match.title}</h2>
        </div>
      </div>

      {/* Countdown timer */}
      <div className="glass-panel p-4 rounded-3xl border border-red-500/20 bg-gradient-to-r from-red-950/20 via-slate-950 to-red-950/20 text-center space-y-1">
        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center justify-center gap-1">
          <Clock className="w-3.5 h-3.5 text-red-500" />
          <span>Match start countdown</span>
        </span>
        <h3 className="text-2xl sm:text-3xl font-black text-red-400 font-mono">{timeLeft || 'Loading...'}</h3>
      </div>

      {/* Room credentials box */}
      <div className="glass-panel p-5 rounded-3xl border border-purple-500/30 bg-gradient-to-br from-slate-950 via-purple-950/15 to-slate-950 space-y-4">
        <h4 className="text-xs font-black uppercase tracking-wider text-purple-300 flex items-center gap-1.5 border-b border-white/5 pb-2.5">
          <Lock className="w-4 h-4 text-purple-400" />
          <span>ROOM CREDENTIALS KEYS</span>
        </h4>

        {match.roomId && match.roomPassword ? (
          <div className="space-y-3 font-semibold">
            {/* Room ID */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-900 border border-white/10 text-xs">
              <div>
                <span className="block text-[9px] text-slate-400 font-bold uppercase">Room Lobby ID</span>
                <strong className="text-slate-100 font-mono text-sm">{match.roomId}</strong>
              </div>
              <button
                onClick={() => copyToClipboard(match.roomId, 'Room ID')}
                className="p-2 rounded-xl bg-purple-600 text-white font-extrabold text-[10px] inline-flex items-center gap-1 shadow"
              >
                <Copy className="w-3 h-3" />
                <span>Copy</span>
              </button>
            </div>

            {/* Room Password */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-900 border border-white/10 text-xs">
              <div>
                <span className="block text-[9px] text-slate-400 font-bold uppercase">Room Password</span>
                <strong className="text-slate-100 font-mono text-sm">{match.roomPassword}</strong>
              </div>
              <button
                onClick={() => copyToClipboard(match.roomPassword, 'Password')}
                className="p-2 rounded-xl bg-purple-600 text-white font-extrabold text-[10px] inline-flex items-center gap-1 shadow"
              >
                <Copy className="w-3 h-3" />
                <span>Copy</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/5 text-center text-xs text-slate-400 font-medium">
            🔒 Admin has not uploaded Room credentials yet. Check back 15 mins before match start time.
          </div>
        )}
      </div>

      {/* Admin support phone/Whatsapp contacts */}
      {match.assignedAdmin && (
        <div className="glass-panel p-4 rounded-3xl border border-white/10 flex items-center justify-between gap-3">
          <div className="space-y-0.5">
            <span className="block text-[11px] font-bold text-slate-200">Match Admin Support</span>
            <span className="block text-[9px] text-slate-400">Reach out to match coordinator @{match.assignedAdmin.username}</span>
          </div>

          <div className="flex items-center gap-2">
            {match.assignedAdmin.phone && (
              <>
                <a
                  href={`tel:${match.assignedAdmin.phone}`}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-400 inline-flex items-center"
                >
                  <Phone className="w-4 h-4" />
                </a>
                <a
                  href={`https://wa.me/${match.assignedAdmin.phone.replace(/[^0-9]/g, '')}`}
                  target="_blank" rel="noopener noreferrer"
                  className="p-2 rounded-xl bg-emerald-950 text-emerald-400 hover:bg-emerald-900 inline-flex items-center"
                >
                  <MessageCircle className="w-4 h-4" />
                </a>
              </>
            )}
          </div>
        </div>
      )}

      {/* Rules */}
      <div className="glass-panel p-4 rounded-3xl border border-white/10 space-y-2">
        <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
          <ShieldAlert className="w-4 h-4 text-amber-500" />
          <span>Important Instructions</span>
        </h4>
        <ul className="space-y-1 text-xs text-slate-400 list-disc list-inside leading-normal font-sans">
          <li>Do not share Room ID or Password with non-registered players. Sharing leads to direct disqualification.</li>
          <li>Ensure your In-Game Character Name matches the registered IGN exactly.</li>
          <li>Enter the lobby 5 minutes before start time. Match will start automatically.</li>
        </ul>
      </div>

    </div>
  )
}
