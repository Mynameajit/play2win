'use client'

import React, { useState, useEffect } from 'react'
import { PageHeader } from '@/components/common/PageHeader'
import { useApp } from '@/context/AppContext'
import { apiClient } from '@/lib/apiClient'
import { Copy, Gift, Users, Share2, HelpCircle } from 'lucide-react'

export default function ReferralsPage() {
  const { userRole, showToast } = useApp()
  const [stats, setStats] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchStats = async () => {
    try {
      setLoading(true)
      const res = await apiClient.get('/referrals')
      if (res.data) {
        setStats(res.data)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (userRole !== 'guest') {
      fetchStats()
    }
  }, [userRole])

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    showToast(`${label} copied to clipboard!`, 'success')
  }

  if (loading || !stats) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-white">
        <span className="w-8 h-8 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
        <p className="text-xs text-slate-400 mt-2 font-medium">Loading Referrals ledger...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 sm:space-y-8 pb-20 md:pb-8 max-w-3xl mx-auto text-white px-4">
      <PageHeader />

      {/* Referral Invite card */}
      <div className="glass-panel p-6 rounded-3xl border border-purple-500/30 bg-gradient-to-br from-slate-950 via-purple-950/20 to-slate-950 flex flex-col sm:flex-row items-center gap-6">
        <div className="shrink-0 p-3 bg-purple-600/20 border border-purple-500/40 rounded-full">
          <Gift className="w-12 h-12 text-purple-400" />
        </div>
        
        <div className="space-y-2 text-center sm:text-left flex-1">
          <h3 className="text-lg sm:text-xl font-black text-white">Refer Friends & Earn Cash Rewards!</h3>
          <p className="text-xs text-slate-300 leading-normal">
            Invite your gamer friends to join BattleX. You get <strong className="text-emerald-400">₹25 cash</strong> credited to your wallet for each friend who registers and joins their first match lobby!
          </p>
        </div>
      </div>

      {/* Code links */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        
        {/* Referral code */}
        <div className="p-4 rounded-3xl bg-slate-900 border border-white/10 flex items-center justify-between gap-3 text-xs">
          <div>
            <span className="block text-[9px] text-slate-400 font-bold uppercase">Your Unique Referral Code</span>
            <strong className="text-amber-300 font-mono text-sm uppercase">{stats.referralCode}</strong>
          </div>
          <button
            onClick={() => copyToClipboard(stats.referralCode, 'Referral Code')}
            className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-[10px] flex items-center gap-1 shadow"
          >
            <Copy className="w-3 h-3" />
            <span>Copy Code</span>
          </button>
        </div>

        {/* Invite link */}
        <div className="p-4 rounded-3xl bg-slate-900 border border-white/10 flex items-center justify-between gap-3 text-xs">
          <div>
            <span className="block text-[9px] text-slate-400 font-bold uppercase">Invite Share Link</span>
            <strong className="text-slate-100 font-sans text-xs truncate max-w-[150px] block">{stats.referralLink}</strong>
          </div>
          <button
            onClick={() => copyToClipboard(stats.referralLink, 'Referral Link')}
            className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-[10px] flex items-center gap-1 shadow"
          >
            <Share2 className="w-3 h-3" />
            <span>Copy Link</span>
          </button>
        </div>

      </div>

      {/* KPI summaries */}
      <div className="grid grid-cols-2 gap-4">
        <div className="glass-panel p-4 rounded-3xl border border-white/10 text-center space-y-1 bg-slate-950/40">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center justify-center gap-1">
            <Users className="w-3.5 h-3.5 text-cyan-400" />
            <span>Friends Joined</span>
          </span>
          <h3 className="text-2xl font-black text-white">{stats.inviteCount} Friends</h3>
        </div>

        <div className="glass-panel p-4 rounded-3xl border border-white/10 text-center space-y-1 bg-slate-950/40">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center justify-center gap-1">
            <Gift className="w-3.5 h-3.5 text-emerald-400" />
            <span>Total Earnings</span>
          </span>
          <h3 className="text-2xl font-black text-emerald-400">₹{stats.earnings}</h3>
        </div>
      </div>

      {/* Earnings history list */}
      <div className="glass-panel p-5 rounded-3xl border border-white/10">
        <h4 className="text-xs font-black uppercase tracking-wider text-slate-200 mb-3.5">Invite Roster & Rewards History</h4>
        
        {stats.history && stats.history.length > 0 ? (
          <div className="space-y-2">
            {stats.history.map((h: any) => (
              <div key={h.id} className="p-3 rounded-2xl bg-slate-900 border border-white/5 flex items-center justify-between text-xs font-medium">
                <div className="space-y-0.5">
                  <span className="block text-slate-200">{h.title}</span>
                  <span className="block text-[10px] text-slate-400">{new Date(h.createdAt).toLocaleDateString()}</span>
                </div>
                <strong className="text-emerald-400 font-bold text-sm">+₹{h.amount}</strong>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-400 text-center py-6 font-medium">No referral rewards credited yet. Share your code to start earning!</p>
        )}
      </div>

      {/* Bonus rules */}
      <div className="glass-panel p-4 rounded-3xl border border-white/10 space-y-2.5">
        <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1">
          <HelpCircle className="w-4 h-4 text-purple-400" />
          <span>Invite Bonus Rules</span>
        </h4>
        <ul className="space-y-1 text-xs text-slate-400 list-disc list-inside leading-normal font-sans">
          <li>Your friend must register using your share link or input your referral code on signup.</li>
          <li>Bonus of ₹25 is credited to your wallet once they join their first tournament match.</li>
          <li>Multi-accounting or duplicate UID referrals are blocked by the anti-cheat system.</li>
        </ul>
      </div>

    </div>
  )
}
