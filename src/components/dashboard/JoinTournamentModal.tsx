'use client'

import React, { useState } from 'react'
import { useApp } from '@/context/AppContext'
import { Modal } from '@/components/ui/Modal'
import { Trophy, Gamepad2, Search, CheckCircle2, AlertCircle, Phone, User as UserIcon } from 'lucide-react'
import confetti from 'canvas-confetti'

export const JoinTournamentModal: React.FC = () => {
  const { 
    isJoinModalOpen, 
    setIsJoinModalOpen, 
    selectedTournament, 
    user, 
    verifyGameUid,
    handleJoinTournament,
    setIsDepositModalOpen,
    showToast
  } = useApp()

  const isBgmi = selectedTournament?.game === 'BGMI'
  const defaultUid = isBgmi ? user.bgmiUid : user.freefireUid
  const defaultIgn = isBgmi ? user.bgmiIgn : user.freefireIgn

  // Determine if fields are missing
  const isFullNameMissing = !user.name || user.name.trim() === ''
  const isPhoneMissing = !user.phone || user.phone.trim() === ''
  const isUidMissing = !defaultUid || defaultUid.trim() === ''
  const isIgnMissing = !defaultIgn || defaultIgn.trim() === ''

  const [gameUid, setGameUid] = useState(defaultUid || '')
  const [nickname, setNickname] = useState(defaultIgn || '')
  const [phone, setPhone] = useState(user.phone || '')
  const [fullName, setFullName] = useState(user.name || '')
  const [isUidVerified, setIsUidVerified] = useState(!isUidMissing)
  const [agreedRules, setAgreedRules] = useState(true)
  const [isLoading, setIsLoading] = useState(false)

  if (!selectedTournament) return null

  const totalBalance = user.depositBalance + user.winningBalance
  const isBalanceEnough = totalBalance >= selectedTournament.entryFee

  const hasMissingFields = isFullNameMissing || isPhoneMissing || isUidMissing || isIgnMissing

  const handleVerify = () => {
    if (!gameUid) return
    const res = verifyGameUid(gameUid, selectedTournament.game as 'BGMI' | 'Free Fire')
    if (res.valid && res.ign) {
      setNickname(res.ign)
      setIsUidVerified(true)
      showToast(`${selectedTournament.game} Server Verified! Player IGN: ${res.ign}`, 'success')
    } else {
      setIsUidVerified(false)
      showToast(res.message, 'error')
    }
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!String(gameUid).trim()) {
      showToast('Please enter your BGMI/Free Fire UID.', 'error')
      return
    }

    setIsLoading(true)
    const success = await handleJoinTournament(selectedTournament.id, gameUid, user.name, user.name, phone)
    setIsLoading(false)
    if (success) {
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#a855f7', '#06b6d4', '#eab308']
      })
      setIsJoinModalOpen(false)
    }
  }

  return (
    <Modal
      isOpen={isJoinModalOpen}
      onClose={() => setIsJoinModalOpen(false)}
      title={`Join Match Entry`}
    >
      <form onSubmit={onSubmit} className="space-y-3.5">
        {/* Match Title & Fee Banner */}
        <div className="p-3.5 rounded-2xl bg-slate-900 border border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-xl ${isBgmi ? 'bg-purple-600/30 text-purple-400' : 'bg-cyan-600/30 text-cyan-400'}`}>
              <Gamepad2 className="w-5 h-5" />
            </div>
            <div>
              <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${isBgmi ? 'bg-purple-500/20 text-purple-300' : 'bg-cyan-500/20 text-cyan-300'}`}>
                {selectedTournament.game} • {selectedTournament.mode}
              </span>
              <h4 className="text-xs font-bold text-slate-100 line-clamp-1 mt-0.5">{selectedTournament.title}</h4>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[9px] text-slate-400 uppercase font-semibold">Entry Fee</span>
            <p className="text-sm font-black text-emerald-400">
              {selectedTournament.entryFee === 0 ? 'FREE' : `₹${selectedTournament.entryFee}`}
            </p>
          </div>
        </div>

        {hasMissingFields && (
          <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-500/30 text-amber-300 text-[11px] mb-2">
            <strong>Action Required:</strong> Before joining this tournament, please complete your missing gaming profile fields.
          </div>
        )}

        {/* Dynamic Fields rendering */}
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-bold text-slate-200 mb-1">WhatsApp / Contact Mobile Number</label>
            <div className="relative">
              <input
                type="text"
                readOnly={!isPhoneMissing}
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className={`w-full bg-slate-900 border border-white/15 rounded-xl pl-8 pr-3 py-2 text-xs text-slate-100 font-mono focus:outline-none ${!isPhoneMissing ? 'opacity-70 cursor-not-allowed' : 'focus:border-purple-500'}`}
              />
              <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-slate-200">
                {isBgmi ? 'BGMI UID' : 'Free Fire Player UID'}
              </label>
            </div>
            <div className="flex gap-1.5">
              <input
                type="text"
                required
                value={gameUid}
                onChange={e => setGameUid(e.target.value)}
                placeholder={isBgmi ? 'Enter BGMI Character ID' : 'Enter Free Fire UID'}
                className="flex-1 bg-slate-900 border border-white/15 rounded-xl px-3 py-2 text-xs text-slate-100 font-mono focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>


          
          {/* Removed the static Joining as text since fields are now editable above */}
        </div>

        {/* Insufficient Balance Warning */}
        {!isBalanceEnough && (
          <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/40 flex flex-col gap-2">
            <h5 className="text-[13px] font-bold text-red-400">Insufficient Wallet Balance</h5>
            <p className="text-[11px] text-red-300/80">You don't have enough balance to join this tournament. Please add money to your wallet and try again.</p>
            <div className="flex items-center justify-between mt-1 text-[11px] font-medium text-red-200">
               <div>Current: ₹{totalBalance}</div>
               <div>Required: ₹{selectedTournament.entryFee}</div>
               <div className="text-red-400 font-bold">Short: ₹{selectedTournament.entryFee - totalBalance}</div>
            </div>
            
            <div className="flex gap-2 mt-2">
              <button
                type="button"
                onClick={() => setIsJoinModalOpen(false)}
                className="flex-1 px-3 py-2 rounded-lg bg-red-950/50 hover:bg-red-900 border border-red-500/30 text-white font-bold text-[11px] transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsJoinModalOpen(false)
                  setIsDepositModalOpen(true)
                }}
                className="flex-1 px-3 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-[11px] shadow-lg shadow-red-500/20 transition-colors"
              >
                Add Money
              </button>
            </div>
          </div>
        )}

        {/* Checkbox Rules */}
        <div className="flex items-center gap-2 pt-1">
          <input
            type="checkbox"
            id="agree-rules"
            checked={agreedRules}
            onChange={e => setAgreedRules(e.target.checked)}
            className="rounded bg-slate-900 border-white/20 text-purple-600 focus:ring-purple-500"
          />
          <label htmlFor="agree-rules" className="text-[10px] text-slate-300 cursor-pointer">
            Mobile device play only (No emulators).
          </label>
        </div>

        {/* Confirm Entry Button */}
        {isBalanceEnough && (
          <button
            type="submit"
            disabled={!agreedRules || isLoading}
            className={`w-full py-3 rounded-2xl font-black text-xs shadow-xl flex items-center justify-center gap-2 transition-all ${
              !agreedRules || isLoading
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 text-white shadow-purple-600/30 hover:scale-[1.01]'
            }`}
          >
            <Trophy className="w-4 h-4" />
            <span>{isLoading ? 'JOINING...' : `CONFIRM JOIN (₹${selectedTournament.entryFee})`}</span>
          </button>
        )}
      </form>
    </Modal>
  )
}

