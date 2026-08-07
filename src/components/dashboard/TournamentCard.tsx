'use client'

import React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Tournament } from '@/lib/mockData'
import { useApp } from '@/context/AppContext'
import { Trophy, Users, Clock, CheckCircle2, LogIn } from 'lucide-react'

interface TournamentCardProps {
  tournament: Tournament
  onJoinClick: (tournament: Tournament) => void
}

export const TournamentCard: React.FC<TournamentCardProps> = ({ tournament, onJoinClick }) => {
  const router = useRouter()
  const { userRole, joinedTournamentIds, showToast } = useApp()
  const isJoined = joinedTournamentIds.includes(tournament.id)
  const slotPercentage = Math.round((tournament.joinedSlots / tournament.totalSlots) * 100)

  const isBgmi = tournament.game === 'BGMI'
  const isSingleWinner = tournament.contestType === 'SINGLE_WINNER' || tournament.contestType === '1v1_DUEL'

  const handleCardJoinClick = () => {
    if (userRole === 'guest') {
      showToast('Please sign in to join tournaments!', 'info')
      router.push('/login')
    } else {
      onJoinClick(tournament)
    }
  }

  return (
    <div className="glass-card rounded-2xl overflow-hidden border border-white/10 relative flex flex-col justify-between group">
      {/* Banner & Badges Overlay */}
      <Link href={`/matches/${tournament.id}`} className="relative h-24 sm:h-32 w-full overflow-hidden bg-slate-900 block">
        <img
          src={tournament.banner || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80'}
          alt={tournament.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

        {/* Top Badges */}
        <div className="absolute top-1.5 left-1.5 right-1.5 flex items-center justify-between">
          <span
            className={`px-2 py-0.5 rounded text-[9px] font-black tracking-wider uppercase border backdrop-blur-md ${
              isBgmi ? 'bg-purple-600/90 border-purple-400/50 text-white' : 'bg-cyan-600/90 border-cyan-400/50 text-white'
            }`}
          >
            {tournament.game}
          </span>

          {tournament.status === 'LIVE' ? (
            <span className="px-1.5 py-0.5 rounded bg-red-600 text-white font-black text-[9px] border border-red-400/50 animate-pulse">
              LIVE
            </span>
          ) : tournament.status === 'COMPLETED' ? (
            <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-bold text-[9px]">
              FINISHED
            </span>
          ) : (
            <span className="px-1.5 py-0.5 rounded bg-emerald-600/90 text-white font-bold text-[9px] backdrop-blur-md">
              UPCOMING
            </span>
          )}
        </div>

        {/* Contest Type Badge */}
        <div className="absolute bottom-1 left-1.5 right-1.5">
          <span className={`px-1.5 py-0.5 rounded text-[8px] sm:text-[9px] font-bold border backdrop-blur-md truncate block ${
            isSingleWinner ? 'bg-amber-500/25 text-amber-300 border-amber-500/40' : 'bg-purple-500/25 text-purple-300 border-purple-500/40'
          }`}>
            {isSingleWinner ? '🏆 1st Rank Takes All' : '🏆 Top 3 Winners'}
          </span>
        </div>
      </Link>

      {/* Card Content Body */}
      <div className="p-2.5 sm:p-3 flex-1 flex flex-col justify-between space-y-2">
        <div>
          <Link href={`/matches/${tournament.id}`}>
            <h3 className="font-extrabold text-xs sm:text-sm text-slate-100 line-clamp-1 group-hover:text-purple-300 transition-colors">
              {tournament.title}
            </h3>
          </Link>

          <div className="flex items-center gap-1 text-[9px] text-slate-400 mt-0.5">
            <Clock className="w-3 h-3 text-cyan-400 shrink-0" />
            <span className="truncate">{tournament.startTime}</span>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 gap-1 my-2 p-1.5 rounded-xl bg-slate-900/90 border border-white/10 text-center">
            <div>
              <p className="text-[8px] text-slate-400 uppercase font-semibold">Prize Pool</p>
              <p className="text-xs font-black text-emerald-400">₹{tournament.prizePool.toLocaleString()}</p>
            </div>
            <div className="border-l border-white/10">
              <p className="text-[8px] text-slate-400 uppercase font-semibold">Entry Fee</p>
              <p className="text-xs font-black text-slate-100">
                {tournament.entryFee === 0 ? <span className="text-emerald-400">FREE</span> : `₹${tournament.entryFee}`}
              </p>
            </div>
          </div>

          {/* Slot Progress Bar */}
          <div className="space-y-0.5 mb-2">
            <div className="flex items-center justify-between text-[9px] font-semibold text-slate-300">
              <span className="flex items-center gap-0.5">
                <Users className="w-2.5 h-2.5 text-purple-400" />
                Slots
              </span>
              <span>
                <strong className="text-purple-300">{tournament.joinedSlots}</strong>/{tournament.totalSlots}
              </span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-slate-900 border border-white/10 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  isBgmi ? 'bg-gradient-to-r from-purple-600 to-cyan-500' : 'bg-gradient-to-r from-cyan-500 to-emerald-400'
                }`}
                style={{ width: `${slotPercentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* PROMINENT GLOWING JOIN BUTTON */}
        {userRole !== 'guest' && isJoined ? (
          <Link
            href={`/matches/${tournament.id}`}
            className="w-full py-2 rounded-xl bg-emerald-950/90 border border-emerald-500/60 text-emerald-300 font-extrabold text-[11px] flex items-center justify-center gap-1 shadow-md"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span className="truncate">{tournament.roomCredsSent ? 'CREDS READY' : 'JOINED'}</span>
          </Link>
        ) : (
          <button
            onClick={handleCardJoinClick}
            disabled={tournament.joinedSlots >= tournament.totalSlots || tournament.status !== 'UPCOMING'}
            className={`w-full py-2 rounded-xl font-black text-[11px] flex items-center justify-center gap-1 shadow-lg transition-all ${
              tournament.joinedSlots >= tournament.totalSlots || tournament.status !== 'UPCOMING'
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                : userRole === 'guest'
                ? 'bg-purple-700 hover:bg-purple-600 text-white shadow-purple-600/30'
                : isBgmi
                ? 'bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white shadow-purple-600/30 hover:scale-[1.02]'
                : 'bg-gradient-to-r from-cyan-600 via-teal-600 to-emerald-500 hover:from-cyan-500 hover:to-emerald-400 text-white shadow-cyan-600/30 hover:scale-[1.02]'
            }`}
          >
            {userRole === 'guest' ? <LogIn className="w-3.5 h-3.5" /> : <Trophy className="w-3.5 h-3.5" />}
            <span>
              {userRole === 'guest'
                ? `SIGN IN TO JOIN (₹${tournament.entryFee})`
                : tournament.status === 'COMPLETED' || tournament.status === 'PRIZE_DISTRIBUTED' || tournament.status === 'RESULT_PENDING'
                ? 'FINISHED'
                : tournament.status !== 'UPCOMING'
                ? 'CLOSED'
                : tournament.joinedSlots >= tournament.totalSlots
                ? 'FULL'
                : `JOIN (₹${tournament.entryFee})`}
            </span>
          </button>
        )}
      </div>
    </div>
  )
}
