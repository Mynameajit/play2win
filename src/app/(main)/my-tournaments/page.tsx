'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useApp } from '@/context/AppContext'
import { PageHeader } from '@/components/common/PageHeader'
import { Trophy, Swords, Calendar, Lock, Play, Award, CheckCircle } from 'lucide-react'
import Link from 'next/link'

export default function MyTournamentsPage() {
  const router = useRouter()
  const { tournaments, joinedTournamentIds, userRole, showToast, user } = useApp()

  const [activeTab, setActiveTab] = useState<'UPCOMING' | 'LIVE' | 'COMPLETED' | 'CANCELLED'>('UPCOMING')

  useEffect(() => {
    if (userRole === 'guest') {
      showToast('Please sign in to view your registered tournaments.', 'info')
      router.replace('/login')
    }
  }, [userRole, router, showToast])

  if (userRole === 'guest') return null

  // Filter tournaments joined by the user and match the active tab status
  const joinedTournaments = tournaments.filter(t => 
    joinedTournamentIds.includes(t.id) && t.status === activeTab
  )

  return (
    <div className="space-y-6 sm:space-y-8 pb-20 md:pb-8 max-w-4xl mx-auto text-white px-2">
      <PageHeader />

      {/* Tabs Switcher */}
      <div className="flex items-center gap-1 bg-slate-900/80 p-1.5 rounded-2xl border border-white/10 text-xs overflow-x-auto w-full">
        {(['UPCOMING', 'LIVE', 'COMPLETED', 'CANCELLED'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 rounded-xl whitespace-nowrap font-extrabold text-[11px] sm:text-xs transition-colors flex-1 text-center ${
              activeTab === tab 
                ? 'bg-purple-600 text-white shadow-md' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Roster Cards List */}
      {joinedTournaments.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {joinedTournaments.map(t => (
            <div key={t.id} className="glass-panel p-4 rounded-3xl border border-white/10 flex flex-col justify-between gap-3 bg-gradient-to-br from-slate-950 via-slate-900/60 to-slate-950">
              
              {/* Match Header */}
              <div className="space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="px-2 py-0.5 rounded-lg bg-purple-950/80 text-purple-300 border border-purple-500/30 text-[9px] font-black uppercase">
                    {t.game}
                  </span>
                  <span className={`w-2 h-2 rounded-full ${
                    t.status === 'LIVE' ? 'bg-red-500 animate-pulse' :
                    t.status === 'ROOM_READY' ? 'bg-cyan-400' : 'bg-slate-500'
                  }`} />
                </div>
                <h4 className="text-sm font-extrabold text-white line-clamp-1">{t.title}</h4>
                <p className="text-[10px] text-slate-400 font-medium">Map: {t.map} • Mode: {t.mode}</p>
              </div>

              {/* Match values */}
              <div className="grid grid-cols-3 gap-1.5 p-2 rounded-2xl bg-slate-950/60 text-center text-[10px] font-semibold border border-white/5">
                <div>
                  <span className="block text-slate-400 text-[8px] uppercase">Entry Fee</span>
                  <strong className="text-white text-xs">₹{t.entryFee}</strong>
                </div>
                <div>
                  <span className="block text-slate-400 text-[8px] uppercase">Prize Pool</span>
                  <strong className="text-emerald-400 text-xs">₹{t.prizePool}</strong>
                </div>
                <div>
                  <span className="block text-slate-400 text-[8px] uppercase">Roster slots</span>
                  <strong className="text-purple-300 text-xs">{t.joinedSlots}/{t.totalSlots}</strong>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 mt-1">
                
                {/* VIEW ROOM CREDENTIALS */}
                {(t.status === 'ROOM_READY' || t.status === 'ROOM_OPEN' || t.status === 'LIVE') ? (
                  <Link
                    href={`/matches/${t.id}/room`}
                    className="flex-1 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-extrabold text-xs text-center flex items-center justify-center gap-1.5 shadow"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>View Room</span>
                  </Link>
                ) : t.status === 'COMPLETED' || t.status === 'PRIZE_DISTRIBUTED' || t.status === 'RESULT_PENDING' ? (
                  user.matchResultsWon?.some(mr => mr.tournamentId === t.id) ? (
                    <div className="flex-1 py-2 rounded-xl bg-yellow-500/20 text-yellow-400 border border-yellow-500/50 text-xs font-black text-center flex items-center justify-center gap-1 animate-pulse">
                      <Trophy className="w-4 h-4" />
                      <span>YOU WON! 🏆 (₹{user.matchResultsWon.find(mr => mr.tournamentId === t.id)?.prizeAmount})</span>
                    </div>
                  ) : (
                    <div className="flex-1 py-2 rounded-xl bg-emerald-950/40 text-emerald-400 border border-emerald-500/20 text-xs font-black text-center flex items-center justify-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Winnings Declared</span>
                    </div>
                  )
                ) : (
                  <div className="flex-1 py-2 rounded-xl bg-slate-900 border border-white/5 text-slate-400 text-[10px] font-bold text-center">
                    Room status: Pending Admin Set
                  </div>
                )}

                <Link
                  href={`/matches/${t.id}`}
                  className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs"
                >
                  Details
                </Link>

              </div>

            </div>
          ))}
        </div>
      ) : (
        <div className="glass-panel p-8 rounded-3xl text-center border border-white/10">
          <Swords className="w-10 h-10 text-slate-500 mx-auto mb-2" />
          <h4 className="text-sm font-bold text-slate-200">No registered tournaments found</h4>
          <p className="text-xs text-slate-400 mt-1">You haven't joined any match matching this tab. Visit matches list on Dashboard to register!</p>
        </div>
      )}

    </div>
  )
}
