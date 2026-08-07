'use client'

import React, { useState } from 'react'
import { useApp } from '@/context/AppContext'
import { TournamentCard } from './TournamentCard'
import { Megaphone, Swords } from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { AnnouncementCard } from './AnnouncementCard'

export const UserDashboardHome: React.FC = () => {
  const { 
    tournaments, 
    isTournamentsLoading,
    setSelectedTournament, 
    setIsJoinModalOpen
  } = useApp()

  const [gameFilter, setGameFilter] = useState<'ALL' | 'BGMI' | 'Free Fire'>('ALL')
  const [tabFilter, setTabFilter] = useState<'ALL' | 'LIVE' | 'TODAY' | 'UPCOMING' | 'COMPLETED'>('ALL')

  const filteredTournaments = tournaments.filter(t => {
    if (gameFilter !== 'ALL' && t.game !== gameFilter) return false
    
    // If "ALL" is selected, hide finished/cancelled matches
    if (tabFilter === 'ALL' && !['UPCOMING', 'ROOM_READY', 'ROOM_OPEN', 'LIVE'].includes(t.status)) return false

    if (tabFilter === 'LIVE' && t.status !== 'LIVE') return false
    if (tabFilter === 'TODAY' && !t.startTime.includes('Today') && t.status !== 'LIVE') return false
    if (tabFilter === 'UPCOMING' && !['UPCOMING', 'ROOM_READY', 'ROOM_OPEN'].includes(t.status)) return false
    if (tabFilter === 'COMPLETED' && !['COMPLETED', 'RESULT_PENDING'].includes(t.status)) return false
    return true
  })

  return (
    <div className="space-y-4 pb-20 md:pb-8">
      <PageHeader />

      <AnnouncementCard />

      {/* ANNOUNCEMENT NOTICE BANNER */}
      <div className="glass-panel p-2.5 rounded-xl border border-cyan-500/30 flex items-center gap-2 bg-gradient-to-r from-cyan-950/40 via-slate-950 to-purple-950/40 text-xs">
        <Megaphone className="w-4 h-4 text-cyan-400 shrink-0" />
        <p className="text-[11px] sm:text-xs text-slate-200 line-clamp-1 font-medium">
          🔥 <strong className="text-cyan-300 font-bold font-sans">Notice:</strong> Room ID & Password will be dispatched by Room Admin 15 mins before match start time.
        </p>
      </div>

      {/* MATCHES SECTION */}
      <div>
        {/* Filter Controls: Game Selector & Status Tabs */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 mb-3">
          {/* Game Selector Chips */}
          <div className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-white/10">
            <button
              onClick={() => setGameFilter('ALL')}
              className={`px-3 py-1 rounded-lg text-xs font-bold ${
                gameFilter === 'ALL' ? 'bg-purple-600 text-white' : 'text-slate-400'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setGameFilter('BGMI')}
              className={`px-3 py-1 rounded-lg text-xs font-bold ${
                gameFilter === 'BGMI' ? 'bg-purple-600 text-white' : 'text-slate-400'
              }`}
            >
              BGMI
            </button>
            <button
              onClick={() => setGameFilter('Free Fire')}
              className={`px-3 py-1 rounded-lg text-xs font-bold ${
                gameFilter === 'Free Fire' ? 'bg-cyan-600 text-white' : 'text-slate-400'
              }`}
            >
              Free Fire
            </button>
          </div>

          {/* Status Filter Tabs */}
          <div className="flex items-center gap-1 bg-slate-900/60 p-1 rounded-xl border border-white/10 text-[11px] overflow-x-auto w-full sm:w-auto">
            <button
              onClick={() => setTabFilter('ALL')}
              className={`px-2.5 py-1 rounded-lg whitespace-nowrap ${tabFilter === 'ALL' ? 'bg-white/10 text-white font-bold' : 'text-slate-400'}`}
            >
              All Matches
            </button>
            <button
              onClick={() => setTabFilter('LIVE')}
              className={`px-2.5 py-1 rounded-lg whitespace-nowrap flex items-center gap-1 ${tabFilter === 'LIVE' ? 'bg-red-600 text-white font-bold' : 'text-slate-400'}`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-ping" />
              Live
            </button>
            <button
              onClick={() => setTabFilter('UPCOMING')}
              className={`px-2.5 py-1 rounded-lg whitespace-nowrap ${tabFilter === 'UPCOMING' ? 'bg-white/10 text-white font-bold' : 'text-slate-400'}`}
            >
              Upcoming
            </button>
            <button
              onClick={() => setTabFilter('COMPLETED')}
              className={`px-2.5 py-1 rounded-lg whitespace-nowrap ${tabFilter === 'COMPLETED' ? 'bg-white/10 text-white font-bold' : 'text-slate-400'}`}
            >
              Completed
            </button>
          </div>
        </div>

        {/* 2 CARD PER ROW GRID LAYOUT */}
        {isTournamentsLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5 sm:gap-6">
            {[1, 2, 3, 4, 5, 6].map((skel) => (
              <div key={skel} className="rounded-3xl border border-white/5 bg-slate-900/50 overflow-hidden animate-pulse">
                {/* Header Skeleton */}
                <div className="h-40 bg-slate-800/80 w-full relative" />
                {/* Body Skeleton */}
                <div className="p-4 space-y-3">
                  <div className="h-5 bg-slate-800 rounded w-3/4" />
                  <div className="h-3 bg-slate-800 rounded w-1/2" />
                  <div className="flex justify-between mt-4">
                    <div className="h-10 bg-slate-800 rounded w-[45%]" />
                    <div className="h-10 bg-slate-800 rounded w-[45%]" />
                  </div>
                  <div className="h-2 bg-slate-800 rounded w-full mt-4" />
                  <div className="h-10 bg-slate-800 rounded-full w-full mt-4" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredTournaments.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5 sm:gap-6">
            {filteredTournaments.map(t => (
              <TournamentCard
                key={t.id}
                tournament={t}
                onJoinClick={tourney => {
                  setSelectedTournament(tourney)
                  setIsJoinModalOpen(true)
                }}
              />
            ))}
          </div>
        ) : (
          <div className="glass-panel p-8 rounded-2xl text-center border border-white/10">
            <Swords className="w-10 h-10 text-slate-500 mx-auto mb-2" />
            <h4 className="text-sm font-bold text-slate-200 font-sans">Match not found</h4>
            <p className="text-xs text-slate-400 mt-0.5">Please check other categories or try again later.</p>
          </div>
        )}
      </div>
    </div>
  )
}
