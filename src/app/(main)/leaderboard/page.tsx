'use client'

import React, { useState, useEffect } from 'react'
import { PageHeader } from '@/components/common/PageHeader'
import { useApp } from '@/context/AppContext'
import { apiClient } from '@/lib/apiClient'
import { Trophy, Award, Target, Activity } from 'lucide-react'

export default function LeaderboardPage() {
  const { userRole } = useApp()

  const [leaderboardData, setLeaderboardData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  
  // Filter states
  const [timeFilter, setTimeFilter] = useState<'GLOBAL' | 'WEEKLY' | 'MONTHLY'>('GLOBAL')
  const [gameFilter, setGameFilter] = useState<'ALL' | 'BGMI' | 'Free Fire'>('ALL')

  const fetchLeaderboard = async () => {
    try {
      setLoading(true)
      const res = await apiClient.get(`/leaderboard?type=${timeFilter}&game=${gameFilter}`)
      if (res.data) {
        setLeaderboardData(res.data)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLeaderboard()
  }, [timeFilter, gameFilter])

  return (
    <div className="space-y-6 sm:space-y-8 pb-20 md:pb-8 max-w-4xl mx-auto text-white px-4">
      <PageHeader />

      {/* Filter Selector Header */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between border-b border-white/5 pb-4">
        {/* Time filters */}
        <div className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-white/10 text-xs">
          {(['GLOBAL', 'WEEKLY', 'MONTHLY'] as const).map(f => (
            <button
              key={f}
              onClick={() => setTimeFilter(f)}
              className={`px-3.5 py-1.5 rounded-lg font-extrabold ${
                timeFilter === f ? 'bg-purple-600 text-white' : 'text-slate-400'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Game Filters */}
        <select
          value={gameFilter}
          onChange={e => setGameFilter(e.target.value as any)}
          className="bg-slate-900 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-slate-300 font-bold"
        >
          <option value="ALL">All Active Games</option>
          <option value="BGMI">BGMI</option>
          <option value="Free Fire">Free Fire</option>
        </select>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[300px]">
          <span className="w-8 h-8 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
          <p className="text-xs text-slate-400 mt-2 font-medium">Aggregating leaderboard rankings...</p>
        </div>
      ) : (
        <div className="space-y-4">
          
            {/* Top 3 podium layout */}
          {leaderboardData.length >= 3 && (
            <div className="grid grid-cols-3 items-end gap-3 sm:gap-6 max-w-lg mx-auto py-4">
              
              {/* Rank 2 */}
              <div className="flex flex-col items-center space-y-2">
                <div className="relative">
                  <div className="w-12 h-12 rounded-full border-2 border-slate-400 bg-slate-900 flex items-center justify-center text-sm font-black text-slate-300">
                    2
                  </div>
                  <span className="absolute -bottom-1 -right-1 text-xs">🥈</span>
                </div>
                <div className="text-center">
                  <span className="block text-xs font-bold text-white truncate max-w-[80px]">{leaderboardData[1].name}</span>
                  <span className="block text-[9px] text-slate-400">{leaderboardData[1].wins} Wins</span>
                </div>
              </div>

              {/* Rank 1 */}
              <div className="flex flex-col items-center space-y-2">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full border-4 border-amber-500 bg-slate-900 flex items-center justify-center text-lg font-black text-amber-400 shadow-lg shadow-amber-500/20">
                    1
                  </div>
                  <span className="absolute -bottom-1 -right-1 text-lg">🏆</span>
                </div>
                <div className="text-center">
                  <span className="block text-sm font-extrabold text-white truncate max-w-[100px]">{leaderboardData[0].name}</span>
                  <span className="block text-[10px] text-amber-400 font-bold">{leaderboardData[0].wins} Wins</span>
                </div>
              </div>

              {/* Rank 3 */}
              <div className="flex flex-col items-center space-y-2">
                <div className="relative">
                  <div className="w-12 h-12 rounded-full border-2 border-amber-700 bg-slate-900 flex items-center justify-center text-sm font-black text-amber-800">
                    3
                  </div>
                  <span className="absolute -bottom-1 -right-1 text-xs">🥉</span>
                </div>
                <div className="text-center">
                  <span className="block text-xs font-bold text-white truncate max-w-[80px]">{leaderboardData[2].name}</span>
                  <span className="block text-[9px] text-slate-400">{leaderboardData[2].wins} Wins</span>
                </div>
              </div>

            </div>
          )}

          {/* Ranks Table Grid */}
          <div className="glass-panel rounded-3xl overflow-hidden border border-white/10">
            <table className="w-full text-xs text-left border-collapse">
              <thead className="bg-slate-950/80 text-slate-400 border-b border-white/10">
                <tr>
                  <th className="p-3 font-semibold w-12 text-center">Rank</th>
                  <th className="p-3 font-semibold">Player</th>
                  <th className="p-3 font-semibold">Game UID</th>
                  <th className="p-3 font-semibold text-center">Matches</th>
                  <th className="p-3 font-semibold text-center">Wins</th>
                  <th className="p-3 font-semibold text-center">Kills</th>
                  <th className="p-3 font-semibold text-center">Win Rate</th>
                  <th className="p-3 font-semibold text-right">Earnings</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-medium">
                {leaderboardData.map((user) => (
                  <tr key={user.rank} className="hover:bg-white/5">
                    <td className="p-3 text-center font-bold text-slate-300">
                      {user.rank === 1 ? '🥇' : user.rank === 2 ? '🥈' : user.rank === 3 ? '🥉' : `#${user.rank}`}
                    </td>
                    <td className="p-3 text-white font-extrabold flex flex-col gap-0.5">
                      <span className="line-clamp-1">{user.name}</span>
                      <span className="text-[9px] text-slate-500">@{user.username}</span>
                    </td>
                    <td className="p-3 text-slate-300 font-mono text-[10px]">{user.uid}</td>
                    <td className="p-3 text-center text-slate-300 font-mono">{user.matches}</td>
                    <td className="p-3 text-center text-amber-400 font-mono font-bold">{user.wins}</td>
                    <td className="p-3 text-center text-slate-300 font-mono">{user.kills}</td>
                    <td className="p-3 text-center text-cyan-400 font-mono">{user.winRate}</td>
                    <td className="p-3 text-right text-emerald-400 font-black">₹{user.totalWinnings || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      )}

    </div>
  )
}
