'use client'

import React, { useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useApp } from '@/context/AppContext'
import { PageHeader } from '@/components/common/PageHeader'
import { Trophy, Users, Clock, ShieldCheck, CheckCircle2, ArrowLeft } from 'lucide-react'

export default function MatchDetailPage() {
  const params = useParams()
  const router = useRouter()
  const matchId = params?.id as string
  const { tournaments, joinedTournamentIds, setSelectedTournament, setIsJoinModalOpen, userRole, showToast, user } = useApp()

  useEffect(() => {
    if (userRole === 'guest') {
      showToast('Please sign in to view match details.', 'info')
      router.replace('/login')
    }
  }, [userRole, router, showToast])

  if (userRole === 'guest') return null

  const match = tournaments.find(t => t.id === matchId) || tournaments[0]
  const isJoined = joinedTournamentIds.includes(match.id)

  return (
    <div className="space-y-6 pb-20 md:pb-8 max-w-3xl mx-auto">
      <div className="flex items-center gap-2">
        <button
          onClick={() => router.push('/dashboard')}
          className="p-2 rounded-xl bg-slate-900 border border-white/10 text-slate-300 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <span className="text-[10px] font-bold text-purple-400 uppercase tracking-widest">MATCH ROUTE ({match.id})</span>
          <h2 className="text-xl font-extrabold text-white">{match.title}</h2>
        </div>
      </div>

      {/* Banner */}
      <div className="relative h-44 sm:h-56 rounded-3xl overflow-hidden bg-slate-900 border border-white/10">
        <img src={match.banner} alt={match.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

        <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
          <span className="px-3 py-1 rounded-xl bg-purple-600 font-extrabold text-xs text-white uppercase">
            {match.game} • {match.mode}
          </span>
          <span className="px-3 py-1 rounded-xl bg-emerald-600 font-extrabold text-xs text-white">
            Prize Pool: ₹{match.prizePool}
          </span>
        </div>
      </div>

      {/* Rules Card */}
      <div className="glass-panel p-4 rounded-3xl border border-white/10 space-y-2">
        <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-cyan-400" />
          <span>Match Rules & Fair Play</span>
        </h3>
        <ul className="space-y-1 text-xs text-slate-300 list-disc list-inside">
          {match.rules?.map((rule: any, idx: any) => (
            <li key={idx}>{rule}</li>
          ))}
        </ul>
      </div>

      {/* Prize Table */}
      <div className="glass-panel p-4 rounded-3xl border border-white/10 space-y-2">
        <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
          <Trophy className="w-4 h-4 text-amber-400" />
          <span>Prize Distribution</span>
        </h3>
        <div className="divide-y divide-white/5">
          {match.prizeDistribution?.map((item: any, idx: any) => (
            <div key={idx} className="py-2 flex items-center justify-between text-xs">
              <span className="font-bold text-slate-200">{item.rank}</span>
              <span className="font-black text-emerald-400">{item.reward}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Join Action */}
      {isJoined ? (
        (match.status === 'COMPLETED' || match.status === 'PRIZE_DISTRIBUTED' || match.status === 'RESULT_PENDING') && user.matchResultsWon?.some(mr => mr.tournamentId === match.id) ? (
          <div className="p-4 rounded-2xl bg-yellow-500/20 border border-yellow-500/50 text-yellow-400 font-black text-sm flex items-center justify-center gap-2 animate-pulse shadow-[0_0_15px_rgba(234,179,8,0.2)]">
            <Trophy className="w-5 h-5" />
            <span>🏆 YOU WON THIS MATCH! (₹{user.matchResultsWon.find(mr => mr.tournamentId === match.id)?.prizeAmount}) 🏆</span>
          </div>
        ) : (match.status === 'COMPLETED' || match.status === 'PRIZE_DISTRIBUTED' || match.status === 'RESULT_PENDING') ? (
          <div className="p-4 rounded-2xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 font-bold text-xs flex items-center justify-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>RESULTS DECLARED. BETTER LUCK NEXT TIME!</span>
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 font-bold text-xs flex items-center justify-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>REGISTERED! ADMIN WILL DISPATCH ROOM ID & PASS BEFORE START TIME</span>
          </div>
        )
      ) : (
        <button
          onClick={() => {
            setSelectedTournament(match)
            setIsJoinModalOpen(true)
          }}
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 text-white font-extrabold text-xs shadow-xl flex items-center justify-center gap-2"
        >
          <Trophy className="w-4 h-4" />
          <span>JOIN MATCH (₹{match.entryFee})</span>
        </button>
      )}
    </div>
  )
}
