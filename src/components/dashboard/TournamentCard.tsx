'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Tournament, useMyMatches } from '@/hooks/useTournaments'
import { useUserProfile } from '@/hooks/useProfileQuery'
import { useApp } from '@/context/AppContext'
import { Trophy, Users, Clock, Calendar, Sword } from 'lucide-react'

interface TournamentCardProps {
  tournament: Tournament
  onJoinClick?: (tournament: Tournament) => void
}

export const TournamentCard: React.FC<TournamentCardProps> = ({ tournament, onJoinClick }) => {
  const router = useRouter()
  const { setSelectedTournament, setIsJoinModalOpen } = useApp()
  const { data: user, isLoading: isUserLoading, isError: isUserError } = useUserProfile()
  const { data: myMatches = [] } = useMyMatches()
  
  const userRole = isUserError || !user ? 'guest' : 'user'
  const isJoined = myMatches.some((m: any) => m.tournamentId === tournament.id)
  
  const isBgmi = tournament.game === 'BGMI' || tournament.game?.toLowerCase().includes('bgmi')
  const isFreeFire = tournament.game === 'Free Fire' || tournament.game === 'FREE FIRE' || tournament.game?.toLowerCase().includes('free fire')

  const handleCardJoinClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (userRole === 'guest') {
      router.push(`/login?redirect=/matches/${tournament.id}`)
    } else {
      setSelectedTournament(tournament)
      setIsJoinModalOpen(true)
    }
  }

  // Countdown timer logic
  const [timeLeft, setTimeLeft] = useState<{ hrs: string, mins: string, secs: string } | null>(null)
  
  useEffect(() => {
    const calculateTimeLeft = () => {
      try {
        if (!tournament.startTime) {
          setTimeLeft(null)
          return
        }
        const start = new Date(tournament.startTime).getTime()
        const now = new Date().getTime()
        const diff = start - now
        if (diff <= 0 || tournament.status === 'COMPLETED') {
          setTimeLeft(null)
        } else {
          const hrs = Math.floor(diff / (1000 * 60 * 60))
          const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
          const secs = Math.floor((diff % (1000 * 60)) / 1000)
          setTimeLeft({
            hrs: hrs.toString().padStart(2, '0'),
            mins: mins.toString().padStart(2, '0'),
            secs: secs.toString().padStart(2, '0')
          })
        }
      } catch (err) {
        setTimeLeft(null)
      }
    }
    
    calculateTimeLeft()
    const timer = setInterval(calculateTimeLeft, 1000)
    return () => clearInterval(timer)
  }, [tournament.startTime, tournament.status])

  const isWinner = user?.matchResultsWon?.some((won: any) => won.tournamentId === tournament.id)

  let btnText = 'JOIN'
  let isBtnDisabled = false
  let btnClass = 'bg-purple-600 hover:bg-purple-500 text-white shadow-[0_0_10px_rgba(147,51,234,0.3)]'

  if (userRole === 'guest') {
    btnText = 'SIGN IN'
  } else if (tournament.status === 'COMPLETED' || tournament.status === 'CANCELED' || tournament.status === 'RESULT_PENDING' || tournament.status === 'PRIZE_DISTRIBUTED') {
    btnText = tournament.status === 'CANCELED' ? 'CANCELED' : 'COMPLETED'
    isBtnDisabled = true
    btnClass = 'bg-[#1a1525] border border-white/5 text-slate-500 cursor-not-allowed'
  } else if (isJoined) {
    btnText = 'JOINED'
    btnClass = 'bg-slate-900 border border-purple-500 text-purple-400 opacity-70 cursor-not-allowed'
    isBtnDisabled = true
  } else if (tournament.joinedSlots >= tournament.totalSlots) {
    btnText = 'FULL'
    isBtnDisabled = true
    btnClass = 'bg-[#1a1525] border border-white/5 text-slate-500 cursor-not-allowed'
  }

  // Properly format date and time from ISO string
  let formattedDate = 'TBA'
  let formattedTime = 'TBA'
  if (tournament.startTime) {
    try {
      const dateObj = new Date(tournament.startTime)
      if (!isNaN(dateObj.getTime())) {
        formattedDate = dateObj.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
        formattedTime = dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
      } else {
        const parts = tournament.startTime.split(' ')
        formattedDate = parts[0] || 'TBA'
        formattedTime = parts.slice(1).join(' ') || 'TBA'
      }
    } catch {
      // fallback
    }
  }

  const bannerImage = (tournament.banner && tournament.banner.trim() !== '') 
    ? tournament.banner 
    : (isBgmi ? 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80' : 'https://images.unsplash.com/photo-1605806616949-1e87b487cb2a?auto=format&fit=crop&q=80')

  return (
    <Link href={`/matches/${tournament.id}`} className="block">
      <div className={`flex bg-[#0b0812] rounded-xl overflow-hidden border ${isWinner ? 'border-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.2)]' : 'border-white/5'} relative group hover:border-purple-500/30 transition-all shadow-lg p-1.5 gap-2 min-h-[110px] w-full max-w-full`}>
        
        {/* Left Side: Image (Full height) */}
        <div className="relative w-[100px] shrink-0 h-auto rounded-md overflow-hidden border border-white/5">
          <img
            src={bannerImage}
            alt={tournament.title}
            className="absolute inset-0 w-full h-full object-cover bg-slate-900 group-hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80'
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0b0812] via-transparent to-transparent opacity-90" />
          
          {/* Top Status Badge */}
          <div className="absolute top-1 left-1">
            <span
              className={`px-1.5 py-0.5 rounded-[3px] text-[6px] font-black tracking-wider uppercase shadow-md border backdrop-blur-md ${
                tournament.status === 'LIVE' ? 'bg-red-500/90 text-white border-red-500' : 
                tournament.status === 'COMPLETED' || tournament.status === 'PRIZE_DISTRIBUTED' || tournament.status === 'RESULT_PENDING' ? 'bg-slate-600/90 text-white border-slate-500' : 
                tournament.status === 'ROOM_OPEN' ? 'bg-cyan-500/90 text-white border-cyan-500' : 
                'bg-emerald-500/90 text-white border-emerald-500'
              }`}
            >
              {tournament.status === 'ROOM_OPEN' ? 'ROOM OPEN' : 
               (tournament.status === 'COMPLETED' || tournament.status === 'PRIZE_DISTRIBUTED' || tournament.status === 'RESULT_PENDING') ? 'COMPLETED' : 
               tournament.status}
            </span>
          </div>

          {/* Winner Indicator Badge (if user won) */}
          {isWinner && (
            <div className="absolute bottom-1 left-1 right-1 flex justify-center">
              <span className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white text-[8px] font-black tracking-widest px-2 py-0.5 rounded-sm shadow-[0_0_10px_rgba(234,179,8,0.5)] border border-yellow-400/50 uppercase w-full text-center flex items-center justify-center gap-0.5">
                <Trophy className="w-2.5 h-2.5" /> YOU WON!
              </span>
            </div>
          )}
        </div>

        {/* Right Side: Content */}
        <div className="flex flex-col flex-1 py-0.5 min-w-0">
          
          {/* Header Row */}
          <div className="mb-1 flex items-start gap-1.5">
            <span
              className={`px-1.5 py-0.5 rounded-[3px] text-[6px] font-black tracking-wider uppercase shadow-md shrink-0 mt-0.5 ${
                isBgmi ? 'bg-blue-600 text-white' : 
                isFreeFire ? 'bg-orange-600 text-white' : 
                'bg-purple-600 text-white'
              }`}
            >
              {tournament.game}
            </span>
            <h3 className="font-bold text-[12px] text-white leading-tight pr-1 line-clamp-1 w-full">
              {tournament.title}
            </h3>
          </div>

          {/* Date & Inline Timer */}
          <div className="flex items-center gap-1 text-[8px] text-slate-300 font-medium mb-1.5 bg-slate-900/40 w-max px-1.5 py-0.5 rounded-[4px] border border-white/5">
            <Calendar className="w-2.5 h-2.5 text-purple-400" />
            <span>{formattedDate} {formattedTime}</span>
            {timeLeft && (
              <>
                <span className="text-slate-600 mx-0.5">|</span>
                <Clock className="w-2.5 h-2.5 text-cyan-400 animate-pulse" />
                <span className="text-cyan-400 font-bold font-mono tracking-wide">
                  {timeLeft.hrs}:{timeLeft.mins}:{timeLeft.secs}
                </span>
              </>
            )}
          </div>

          {/* Prize & Entry Block */}
          <div className="flex items-center bg-[#15111c] rounded-md border border-white/5 py-1 px-1.5 mb-1.5 w-full shadow-inner">
            <div className="flex-1">
              <span className="block text-[6px] text-slate-500 font-bold uppercase tracking-widest mb-[1px]">WINNINGS</span>
              <span className="block text-[11px] font-black text-emerald-400 leading-none tracking-tight">₹{tournament.prizePool}</span>
            </div>
            <div className="w-[1px] h-4 bg-white/10 mx-1.5" />
            <div className="flex-1">
              <span className="block text-[6px] text-slate-500 font-bold uppercase tracking-widest mb-[1px]">ENTRY FEE</span>
              <span className="block text-[11px] font-black text-white leading-none tracking-tight">
                {tournament.entryFee === 0 ? 'FREE' : `₹${tournament.entryFee}`}
              </span>
            </div>
          </div>

          {/* Bottom Row: Mode/Slots & Button */}
          <div className="flex items-center justify-between mt-auto pt-0.5">
            <div className="flex flex-col gap-[1px]">
              <span className="flex items-center gap-1 text-[8px] text-slate-400 font-medium">
                <Sword className="w-2.5 h-2.5 text-purple-500" />
                <span className="text-white font-bold">{tournament.mode}</span>
              </span>
              <span className="flex items-center gap-1 text-[8px] text-slate-400 font-medium">
                <Users className="w-2.5 h-2.5 text-purple-500" />
                <span>{tournament.joinedSlots}/{tournament.totalSlots}</span>
              </span>
            </div>
            
            <button
              onClick={handleCardJoinClick}
              disabled={isBtnDisabled}
              className={`px-3 py-1.5 rounded-md font-black text-[9px] transition-all tracking-wider uppercase whitespace-nowrap ${btnClass}`}
            >
              {btnText}
            </button>
          </div>
          
        </div>
      </div>
    </Link>
  )
}
