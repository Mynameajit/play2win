'use client'

import React, { useState } from 'react'
import { useApp } from '@/context/AppContext'
import { useTournaments, useMyMatches } from '@/hooks/useTournaments'
import { TournamentCard } from './TournamentCard'
import { Filter, ShieldCheck, ArrowLeft, Trophy } from 'lucide-react'
import { useRouter } from 'next/navigation'

type TabType = 'MY MATCH' | 'UPCOMING' | 'LIVE' | 'COMPLETED' | 'CANCELED'

export const UserDashboardHome: React.FC = () => {
  const router = useRouter()
  const { setSelectedTournament, setIsJoinModalOpen } = useApp()
  const [activeTab, setActiveTab] = useState<TabType>('UPCOMING')
  
  // Use TanStack queries
  const { data: tournamentsData, isLoading: isTournamentsLoading } = useTournaments()
  const { data: myMatches = [], isLoading: isMyMatchesLoading } = useMyMatches()
  
  const allTournaments = tournamentsData?.tournaments || []

  // Derived filter logic
  const filteredTournaments = (() => {
    switch (activeTab) {
      case 'UPCOMING':
        return allTournaments.filter(t => t.status === 'UPCOMING')
      case 'LIVE':
        return allTournaments.filter(t => t.status === 'LIVE' || t.status === 'ROOM_OPEN')
      case 'MY MATCH':
        // Filter by tournaments I've joined
        const joinedIds = myMatches.map((m: any) => m.tournamentId)
        return allTournaments.filter(t => joinedIds.includes(t.id))
      case 'COMPLETED':
        return allTournaments.filter(t => t.status === 'COMPLETED')
      case 'CANCELED':
        return allTournaments.filter(t => t.status === 'CANCELLED' || t.status === 'CANCELED')
      default:
        return allTournaments
    }
  })()

  const tabs: TabType[] = ['MY MATCH', 'UPCOMING', 'LIVE', 'COMPLETED', 'CANCELED']

  return (
    <div className="text-white max-w-lg mx-auto pb-14 sm:pb-6">
      
      {/* Header */}
      <div className="px-2 py-2 flex items-center justify-between mb-2">
        <div className="flex items-center gap-2.5">
            <button
            onClick={() => router.push('/')}
            className="p-1.5 rounded-xl bg-slate-900 border border-white/5 text-slate-300 hover:text-white"
            >
            <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="w-8 h-8 rounded-full bg-indigo-900 flex items-center justify-center shadow-lg shadow-indigo-900/30">
            <Trophy className="w-4 h-4 text-indigo-400" />
            </div>
            <div>
            <h2 className="text-sm font-black text-white italic drop-shadow-md leading-tight">MATCHES</h2>
            <p className="text-[8px] text-slate-400">Join and view your tournaments</p>
            </div>
        </div>
        <button className="p-1.5 rounded-xl bg-slate-900 border border-white/5 text-slate-400 hover:text-white transition-colors">
          <Filter className="w-4 h-4" />
        </button>
      </div>

      {/* Tabs */}
      <div className="px-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-hide no-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-shrink-0 px-3 py-1 rounded-full text-[9px] font-bold uppercase transition-all flex items-center gap-1.5 ${
                activeTab === tab 
                  ? 'bg-purple-600 text-white shadow-[0_0_10px_rgba(147,51,234,0.4)]' 
                  : 'bg-slate-900 text-slate-400 border border-white/5 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {tab === 'LIVE' && (
                <span className={`w-1.5 h-1.5 rounded-full bg-red-500 ${activeTab === 'LIVE' ? 'animate-pulse shadow-[0_0_5px_red]' : ''}`} />
              )}
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Matches List */}
      <div className="px-3 space-y-3">
        {isTournamentsLoading || (activeTab === 'MY MATCH' && isMyMatchesLoading) ? (
          <div className="space-y-4">
            {[1, 2, 3].map((skel) => (
              <div key={skel} className="h-64 rounded-3xl border border-white/5 bg-slate-900/50 animate-pulse" />
            ))}
          </div>
        ) : filteredTournaments.length > 0 ? (
          filteredTournaments.map(t => (
            <TournamentCard
              key={t.id}
              tournament={t}
              onJoinClick={(tourney) => {
                setSelectedTournament(tourney)
                setIsJoinModalOpen(true)
              }}
            />
          ))
        ) : (
          <div className="text-center py-12 bg-slate-900/40 rounded-3xl border border-white/5">
            <p className="text-slate-400 text-xs font-bold uppercase drop-shadow-md">No matches found</p>
            <p className="text-[10px] text-slate-500 mt-1">There are no tournaments in this category.</p>
          </div>
        )}
      </div>

      <div className="mx-3 bg-gradient-to-r from-indigo-950/80 to-purple-950/80 p-3 rounded-2xl flex items-center gap-3 border border-purple-500/20 shadow-lg">
        <div className="w-8 h-8 rounded-full bg-indigo-900 flex items-center justify-center shrink-0">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
        </div>
        <div>
          <p className="text-xs font-bold text-indigo-100">Anti-Cheat Protected</p>
          <p className="text-[9px] text-indigo-300">Fair play strictly enforced in all matches</p>
        </div>
      </div>
    </div>
  )
}
