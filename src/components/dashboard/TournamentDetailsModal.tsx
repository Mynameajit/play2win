'use client'

import React, { useState } from 'react'
import { useApp } from '@/context/AppContext'
import { Modal } from '@/components/ui/Modal'
import { ShieldCheck, Key, Eye, EyeOff, Award, Copy, Clock, AlertCircle, CheckCircle2 } from 'lucide-react'

export const TournamentDetailsModal: React.FC = () => {
  const { 
    isDetailsModalOpen, 
    setIsDetailsModalOpen, 
    selectedTournament, 
    joinedTournamentIds,
    setIsJoinModalOpen,
    showToast
  } = useApp()

  const [showCreds, setShowCreds] = useState(false)

  if (!selectedTournament) return null

  const isJoined = joinedTournamentIds.includes(selectedTournament.id)
  const isBgmi = selectedTournament.game === 'BGMI'
  const isSingleWinner = selectedTournament.contestType === 'SINGLE_WINNER'

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    showToast(`${label} copied!`, 'info')
  }

  return (
    <Modal
      isOpen={isDetailsModalOpen}
      onClose={() => setIsDetailsModalOpen(false)}
      title={`${selectedTournament.title}`}
      maxWidth="max-w-xl"
    >
      <div className="space-y-5">
        {/* Banner Preview */}
        <div className="relative h-40 rounded-2xl overflow-hidden border border-white/10">
          <img
            src={selectedTournament.banner}
            alt={selectedTournament.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
          <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
            <div>
              <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${isBgmi ? 'bg-purple-600 text-white' : 'bg-cyan-600 text-white'}`}>
                {selectedTournament.game} • {selectedTournament.mode}
              </span>
              <h3 className="text-lg font-black text-white mt-1">{selectedTournament.title}</h3>
            </div>
          </div>
        </div>

        {/* Room Credentials Section (For Joined Players) */}
        {isJoined && (
          <div className="p-4 rounded-2xl bg-slate-900 border border-purple-500/40 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-purple-300 font-bold text-xs">
                <Key className="w-4 h-4 text-cyan-400" />
                <span>ROOM CREDENTIALS DISPATCH STATUS</span>
              </div>
              {selectedTournament.roomCredsSent && (
                <button
                  onClick={() => setShowCreds(!showCreds)}
                  className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-semibold"
                >
                  {showCreds ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  <span>{showCreds ? 'Hide' : 'Reveal'}</span>
                </button>
              )}
            </div>

            {selectedTournament.roomCredsSent ? (
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-purple-500/20">
                <div className="p-2.5 rounded-xl bg-slate-950 border border-white/10 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-slate-400 font-medium">Room ID</p>
                    <p className="text-xs font-extrabold font-mono text-cyan-300">
                      {showCreds ? selectedTournament.roomId : '••••••••'}
                    </p>
                  </div>
                  {showCreds && (
                    <button
                      onClick={() => copyToClipboard(selectedTournament.roomId || '', 'Room ID')}
                      className="p-1 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                  )}
                </div>

                <div className="p-2.5 rounded-xl bg-slate-950 border border-white/10 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-slate-400 font-medium">Password</p>
                    <p className="text-xs font-extrabold font-mono text-purple-300">
                      {showCreds ? selectedTournament.roomPassword : '••••••••'}
                    </p>
                  </div>
                  {showCreds && (
                    <button
                      onClick={() => copyToClipboard(selectedTournament.roomPassword || '', 'Room Password')}
                      className="p-1 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-slate-950 border border-white/10 text-xs text-amber-300 flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400 shrink-0 animate-spin" />
                <span>
                  Admin is reviewing participant UIDs. Room ID & Password will be dispatched 15 mins before match.
                </span>
              </div>
            )}
          </div>
        )}

        {/* Contest Rules & Prize Breakdown */}
        <div>
          <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Award className="w-4 h-4 text-amber-400" />
            <span>
              {isSingleWinner 
                ? 'Small Contest Rule: Single Winner (1st Rank Takes All)' 
                : `Mega Contest Prize Breakdown (₹${selectedTournament.prizePool.toLocaleString()})`}
            </span>
          </h4>

          <div className="glass-panel rounded-2xl overflow-hidden border border-white/10">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-900/80 text-slate-400 border-b border-white/10">
                <tr>
                  <th className="p-3 font-semibold">Rank / Placement</th>
                  <th className="p-3 font-semibold text-right">Cash Reward</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {(Array.isArray(selectedTournament.prizeDistribution) 
                  ? selectedTournament.prizeDistribution 
                  : typeof selectedTournament.prizeDistribution === 'string' 
                    ? JSON.parse(selectedTournament.prizeDistribution || '[]') 
                    : []
                ).map((item: any, idx: number) => (
                  <tr key={idx} className="hover:bg-white/5">
                    <td className="p-3 font-semibold text-slate-200">{item.rank}</td>
                    <td className="p-3 font-extrabold text-emerald-400 text-right">{item.reward}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Rules */}
        <div>
          <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-purple-400" />
            <span>Tournament Rules</span>
          </h4>
          <ul className="space-y-1 text-xs text-slate-300 glass-panel p-3.5 rounded-2xl border border-white/10">
            {selectedTournament.rules.map((r, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-1.5 shrink-0" />
                <span>{r}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Bottom CTA */}
        {!isJoined && (
          <button
            onClick={() => {
              setIsDetailsModalOpen(false)
              setIsJoinModalOpen(true)
            }}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white font-extrabold text-xs shadow-xl"
          >
            JOIN TOURNAMENT NOW (₹{selectedTournament.entryFee})
          </button>
        )}
      </div>
    </Modal>
  )
}
