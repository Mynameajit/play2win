'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Trophy, ShieldCheck, Gamepad2, Coins, HelpCircle } from 'lucide-react'
import { useUserProfile } from '@/hooks/useProfileQuery'
import { useTournaments } from '@/hooks/useTournaments'
import { TournamentCard } from './TournamentCard'
import { apiClient } from '@/lib/apiClient'
import { useAnnouncements } from '@/hooks/useNotifications'

export const HomeDashboard: React.FC = () => {
  const { data: user, isLoading: isUserLoading } = useUserProfile()
  const { data: liveData } = useTournaments({ limit: 10 }) 
  const { data: announcements } = useAnnouncements()
  
  const [activeTab, setActiveTab] = useState<'ALL' | 'BGMI' | 'FREE FIRE'>('ALL')
  const [topPlayers, setTopPlayers] = useState<any[]>([])

  useEffect(() => {
    const fetchTopPlayers = async () => {
      try {
        const res = await apiClient.get('/leaderboard?type=GLOBAL&game=ALL')
        if (res.data) {
          setTopPlayers(res.data.slice(0, 3)) // Get top 3
        }
      } catch (err) {
        console.error('Failed to fetch top players', err)
      }
    }
    fetchTopPlayers()
  }, [])

  const totalBalance = (user?.depositBalance || 0) + (user?.winningBalance || 0) + (user?.bonusBalance || 0)
  const liveMatches = (liveData?.tournaments || []).filter(t => 
    ['UPCOMING', 'ROOM_READY', 'ROOM_OPEN', 'LIVE'].includes(t.status)
  )

  const filteredMatches = liveMatches.filter(t => {
    if (activeTab === 'ALL') return true
    if (activeTab === 'BGMI') return t.game === 'BGMI' || t.game?.toLowerCase().includes('bgmi')
    if (activeTab === 'FREE FIRE') return t.game === 'Free Fire' || t.game === 'FREE FIRE' || t.game?.toLowerCase().includes('free fire')
    return true
  }).slice(0, 4) // Show only 4 at a time to save space on home page

  return (
    <div className="text-slate-100 max-w-5xl mx-auto pb-12">
      {/* Welcome Banner */}
      <div className="relative rounded-b-2xl overflow-hidden shadow-xl border-b border-white/5 sm:rounded-3xl sm:border sm:mt-2 sm:mx-0 p-4 min-h-[160px]">
        <div className="absolute inset-0 z-0">
          <img 
            src="/images/beenar.png" 
            alt="Welcome Banner" 
            className="w-full h-full object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0b0a15] via-[#0b0a15]/40 to-transparent" />
        </div>
        
        <div className="relative z-10 flex flex-col justify-end h-full pt-12 sm:pt-20">
          <h1 className="text-2xl sm:text-4xl font-black text-white italic drop-shadow-lg tracking-tight uppercase">
            WELCOME BACK,<br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.4)]">
              {isUserLoading ? 'CHAMPION' : user?.name || 'CHAMPION'}
            </span>
          </h1>
          <div className="mt-3">
            <Link
              href="/matches"
              className="px-4 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-[9px] sm:text-xs shadow-[0_0_15px_rgba(147,51,234,0.4)] inline-flex items-center gap-1.5 transition-all uppercase"
            >
              <Trophy className="w-3 h-3" />
              PLAY NOW
            </Link>
          </div>
        </div>
      </div>

      <div className="px-3 sm:px-0 mt-3 space-y-5">
        
        {/* Badges Section */}
        <div className="bg-[#0f0b18] rounded-xl border border-white/5 p-3 flex items-center justify-between shadow-inner">
          <div className="flex flex-col items-center justify-center text-center">
            <div className="w-7 h-7 mb-1 rounded-full border border-purple-500/30 flex items-center justify-center bg-purple-500/10">
              <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
            </div>
            <span className="text-[7px] font-black uppercase text-slate-200">ANTI-CHEAT</span>
            <span className="text-[6px] text-slate-400 font-bold uppercase">PROTECTED</span>
          </div>
          <div className="w-[1px] h-8 bg-white/5" />
          <div className="flex flex-col items-center justify-center text-center">
            <div className="w-7 h-7 mb-1 rounded-full border border-blue-500/30 flex items-center justify-center bg-blue-500/10">
              <Trophy className="w-3.5 h-3.5 text-blue-400" />
            </div>
            <span className="text-[7px] font-black uppercase text-slate-200">VERIFIED</span>
            <span className="text-[6px] text-slate-400 font-bold uppercase">TOURNAMENTS</span>
          </div>
          <div className="w-[1px] h-8 bg-white/5" />
          <div className="flex flex-col items-center justify-center text-center">
            <div className="w-7 h-7 mb-1 rounded-full border border-emerald-500/30 flex items-center justify-center bg-emerald-500/10">
              <Coins className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <span className="text-[7px] font-black uppercase text-slate-200">INSTANT</span>
            <span className="text-[6px] text-slate-400 font-bold uppercase">PAYOUTS</span>
          </div>
          <div className="w-[1px] h-8 bg-white/5" />
          <div className="flex flex-col items-center justify-center text-center">
            <div className="w-7 h-7 mb-1 rounded-full border border-yellow-500/30 flex items-center justify-center bg-yellow-500/10">
              <HelpCircle className="w-3.5 h-3.5 text-yellow-400" />
            </div>
            <span className="text-[7px] font-black uppercase text-slate-200">24/7</span>
            <span className="text-[6px] text-slate-400 font-bold uppercase">SUPPORT</span>
          </div>
        </div>

        {/* Notice Bar */}
        <div className={`bg-slate-900/60 rounded-xl border border-white/5 p-2.5 flex items-center justify-between shadow-lg ${announcements?.[0]?.priority === 'HIGH' ? 'animate-pulse ring-1 ring-red-500/50' : ''}`}>
          <div className="flex items-center gap-2">
            <div className={`p-1 rounded-md ${announcements?.[0]?.priority === 'HIGH' ? 'bg-red-500/20 text-red-400' : 'bg-purple-500/20 text-purple-400'}`}>
              <Gamepad2 className="w-3.5 h-3.5" />
            </div>
            <p className="text-[9px] sm:text-xs text-slate-300 font-medium">
              <span className={`${announcements?.[0]?.priority === 'HIGH' ? 'text-red-400' : 'text-purple-400'} font-bold mr-1`}>Notice:</span>
              {announcements && announcements.length > 0 ? announcements[0].message : 'Welcome to Play2Earn! Tournaments are live.'}
            </p>
          </div>
          <div className="text-slate-500 text-xs">&gt;</div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-slate-900/80 p-3 rounded-xl border border-white/5 flex items-center gap-2.5 shadow-lg">
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
              <Coins className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <p className="text-[8px] text-slate-400 font-bold uppercase">Wallet Balance</p>
              <p className="text-sm font-black text-white leading-none mt-0.5">₹{totalBalance}</p>
            </div>
          </div>
          <div className="bg-slate-900/80 p-3 rounded-xl border border-white/5 flex items-center gap-2.5 shadow-lg">
            <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center shrink-0">
              <Trophy className="w-4 h-4 text-purple-400" />
            </div>
            <div>
              <p className="text-[8px] text-slate-400 font-bold uppercase">Matches Played</p>
              <p className="text-sm font-black text-white leading-none mt-0.5">{user?.matchesPlayed || 0}</p>
            </div>
          </div>
        </div>

        {/* All Matches Preview */}
        {liveMatches.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-[11px] font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                MATCHES
              </h2>
            </div>
            
            {/* Tabs */}
            <div className="flex bg-slate-900/80 p-1 rounded-full border border-white/5 w-full max-w-[280px]">
              <button 
                onClick={() => setActiveTab('ALL')}
                className={`flex-1 py-1 text-[8px] font-bold rounded-full transition-all tracking-wide ${activeTab === 'ALL' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
              >
                ALL
              </button>
              <button 
                onClick={() => setActiveTab('BGMI')}
                className={`flex-1 py-1 text-[8px] font-bold rounded-full transition-all tracking-wide ${activeTab === 'BGMI' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
              >
                BGMI
              </button>
              <button 
                onClick={() => setActiveTab('FREE FIRE')}
                className={`flex-1 py-1 text-[8px] font-bold rounded-full transition-all tracking-wide ${activeTab === 'FREE FIRE' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
              >
                FREE FIRE
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredMatches.length > 0 ? (
                filteredMatches.map(t => (
                  <TournamentCard key={t.id} tournament={t} />
                ))
              ) : (
                <div className="col-span-full py-6 text-center text-slate-500 text-[10px] font-bold uppercase bg-slate-900/40 rounded-xl border border-white/5">
                  No matches available
                </div>
              )}
            </div>
          </div>
        )}

        {/* How To Use */}
        <div className="space-y-3">
          <h2 className="text-[11px] font-black text-white uppercase tracking-wider flex items-center gap-1.5">
            <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
            HOW TO PLAY
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div className="bg-slate-900/60 p-3 rounded-xl border border-white/5 flex items-start gap-2.5 hover:bg-slate-900 transition-colors">
              <div className="w-5 h-5 rounded-full bg-purple-600 flex items-center justify-center text-[10px] font-black text-white shrink-0">1</div>
              <div>
                <h3 className="text-[10px] font-bold text-slate-200">Select a Match</h3>
                <p className="text-[8px] text-slate-400 leading-relaxed mt-0.5">Go to the Matches tab and find a tournament.</p>
              </div>
            </div>
            <div className="bg-slate-900/60 p-3 rounded-xl border border-white/5 flex items-start gap-2.5 hover:bg-slate-900 transition-colors">
              <div className="w-5 h-5 rounded-full bg-cyan-600 flex items-center justify-center text-[10px] font-black text-white shrink-0">2</div>
              <div>
                <h3 className="text-[10px] font-bold text-slate-200">Join & Get Room ID</h3>
                <p className="text-[8px] text-slate-400 leading-relaxed mt-0.5">Room ID & Password provided 15 mins before start.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Top Players Preview */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h2 className="text-[11px] font-black text-white uppercase tracking-wider flex items-center gap-1.5">
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              TOP PLAYERS
            </h2>
            <Link href="/leaderboard" className="text-[9px] text-purple-400 font-bold uppercase hover:text-purple-300">View All</Link>
          </div>
          
          <div className="bg-slate-900/60 p-3 rounded-xl border border-white/5 space-y-3">
            {topPlayers.map((player, index) => {
              const rank = index + 1
              return (
                <div key={player.id || rank} className="flex items-center justify-between pb-2 border-b border-white/5 last:border-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 ${
                      rank === 1 ? 'bg-amber-500/20 text-amber-400' :
                      rank === 2 ? 'bg-slate-400/20 text-slate-300' :
                      'bg-orange-500/20 text-orange-400'
                    }`}>
                      #{rank}
                    </div>
                    <div>
                      <h4 className="text-[10px] font-bold text-slate-200 line-clamp-1">{player.name}</h4>
                      <p className="text-[8px] text-slate-400 font-mono mt-[1px]">UID: {player.uid}</p>
                    </div>
                  </div>
                  <div className="text-right flex flex-col justify-end shrink-0">
                    <span className="text-[10px] font-black text-emerald-400">₹{player.totalWinnings || 0}</span>
                    <span className="text-[8px] text-slate-400 font-bold">{player.wins || 0} Wins</span>
                  </div>
                </div>
              )
            })}
            
            {topPlayers.length === 0 && (
              <div className="text-center text-[10px] text-slate-500 font-bold uppercase py-2">
                No leaderboard data yet
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
