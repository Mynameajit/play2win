'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { 
  Trophy, 
  HelpCircle, 
  ArrowRight,
  ShieldCheck,
  Smartphone,
  Coins,
  FileText,
  UserCheck
} from 'lucide-react'

export const LandingPage: React.FC = () => {
  const [activeFaq, setActiveFaq] = useState<number | null>(0)

  const faqs = [
    {
      q: 'How do I join BGMI or Free Fire tournaments on Play2Earn?',
      a: 'First, register and sign in to your account. Then go to Matches, select a tournament, input your verified Character UID/IGN, and register. The Room ID & Password will be sent to your panel before the match starts.'
    },
    {
      q: 'Are emulators or iPad players allowed?',
      a: 'No, only Mobile Devices are allowed. iPad and Emulator players are strictly prohibited to ensure a fair match environment.'
    },
    {
      q: 'How are rewards processed?',
      a: 'Once the match is completed, the Room Admin declares the winners. After Super Admin verification, the winning amount is credited directly to your wallet, and you can withdraw it instantly via UPI.'
    },
    {
      q: 'What should I do if my payment fails?',
      a: 'For any transaction-related issues, please contact our support team with your UPI transaction ID/UTR number. We will resolve it within 24 hours.'
    }
  ]

  return (
    <div className="relative min-h-screen pb-20 text-slate-100 overflow-hidden ">
      
      <div className="relative space-y-16 max-w-5xl mx-auto px-4 z-10 pt-16">
        
        {/* 1. HERO SECTION */}
        <section className="text-center pb-6 space-y-6">
          <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md text-cyan-400 text-[10px] font-black tracking-widest uppercase shadow-lg shadow-cyan-900/20">
            <span>Official Esports Tournament Platform</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white leading-tight drop-shadow-lg">
            Play Esports Tournaments.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
              Win Real Cash Rewards.
            </span>
          </h1>

          <p className="text-slate-300 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
            Welcome to Play2Earn. We host verified, anti-cheat protected BGMI and Free Fire esports lobbies with instant UPI payouts.
          </p>

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/login"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-purple-900/50 hover:scale-105"
            >
              <Trophy className="w-4 h-4" />
              <span>SIGN IN TO PLAY</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/register"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 backdrop-blur-md text-white font-black text-xs flex items-center justify-center gap-2 transition-all hover:scale-105"
            >
              <span>CREATE AN ACCOUNT</span>
            </Link>
          </div>
        </section>

        {/* 2. HOW IT WORKS (KAISE KHELE) */}
        <section className="space-y-8 relative">
          <div className="text-center">
            <span className="text-[10px] font-black tracking-widest text-purple-400 uppercase drop-shadow-md">STEP-BY-STEP</span>
            <h2 className="text-2xl sm:text-3xl font-black text-white mt-1">How It Works (Kaise Khele)</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 sm:gap-6">
            <div className="bg-white/5 backdrop-blur-xl p-6 rounded-3xl border border-white/10 shadow-xl space-y-3 text-center transition-transform hover:-translate-y-1">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center mx-auto text-sm font-black text-white shadow-lg">
                1
              </div>
              <h3 className="font-extrabold text-sm text-white">Register Account</h3>
              <p className="text-xs text-slate-400 leading-relaxed">Create your account with email, mobile, and username.</p>
            </div>

            <div className="bg-white/5 backdrop-blur-xl p-6 rounded-3xl border border-white/10 shadow-xl space-y-3 text-center transition-transform hover:-translate-y-1">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center mx-auto text-sm font-black text-white shadow-lg">
                2
              </div>
              <h3 className="font-extrabold text-sm text-white">Join Match Lobby</h3>
              <p className="text-xs text-slate-400 leading-relaxed">Select active BGMI/Free Fire matches and enter your verified UID.</p>
            </div>

            <div className="bg-white/5 backdrop-blur-xl p-6 rounded-3xl border border-white/10 shadow-xl space-y-3 text-center transition-transform hover:-translate-y-1">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-teal-500 flex items-center justify-center mx-auto text-sm font-black text-white shadow-lg">
                3
              </div>
              <h3 className="font-extrabold text-sm text-white">Get Room Details</h3>
              <p className="text-xs text-slate-400 leading-relaxed">Admin dispatches Room ID & Password directly to your tournament roster.</p>
            </div>

            <div className="bg-white/5 backdrop-blur-xl p-6 rounded-3xl border border-white/10 shadow-xl space-y-3 text-center transition-transform hover:-translate-y-1">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center mx-auto text-sm font-black text-white shadow-lg">
                4
              </div>
              <h3 className="font-extrabold text-sm text-white">Withdraw Winnings</h3>
              <p className="text-xs text-slate-400 leading-relaxed">Claim your rank prize and request instant withdrawal to your UPI ID.</p>
            </div>
          </div>
        </section>

        {/* 3. PLATFORM SERVICES & DETAILS */}
        <section className="space-y-4">
          <div className="bg-gradient-to-r from-purple-900/40 to-indigo-900/40 backdrop-blur-xl p-8 rounded-3xl border border-purple-500/20 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <ShieldCheck className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-lg sm:text-xl font-black text-white">Platform Features & Services</h3>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed">
              Play2Earn is a premium tournament organization platform. We bridge the gap between amateur gamers and professional esports by organizing regular high-quality lobbies for BGMI (Battlegrounds Mobile India) and Free Fire MAX. We handle credentials verification, anti-hack supervision, dynamic scoring, and prompt prize settlement.
            </p>
          </div>
        </section>

        {/* 4. TERMS & CONDITIONS */}
        <section className="space-y-6">
          <div className="bg-white/5 backdrop-blur-xl p-8 rounded-3xl border border-white/10 shadow-xl space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-800 rounded-lg border border-slate-700">
                <FileText className="w-6 h-6 text-slate-300" />
              </div>
              <h3 className="text-lg sm:text-xl font-black text-white">Terms & Conditions & Fair Play Rules</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-5 rounded-2xl bg-black/20 border border-white/5 space-y-3">
                <span className="font-black text-white flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-cyan-400" />
                  Mobile Device Only
                </span>
                <p className="text-xs text-slate-400 leading-relaxed">PC, Emulators, iPads, or Triggers are strictly forbidden. Matches are mobile touch-only. Violations lead to ban without refunds.</p>
              </div>

              <div className="p-5 rounded-2xl bg-black/20 border border-white/5 space-y-3">
                <span className="font-black text-white flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-purple-400" />
                  UID Match
                </span>
                <p className="text-xs text-slate-400 leading-relaxed">You must play using the exact Character ID and IGN registered during join. Other players inside the room will be kicked.</p>
              </div>

              <div className="p-5 rounded-2xl bg-black/20 border border-white/5 space-y-3">
                <span className="font-black text-white flex items-center gap-2">
                  <Coins className="w-4 h-4 text-yellow-400" />
                  Wallet & Payouts
                </span>
                <p className="text-xs text-slate-400 leading-relaxed">All prizes are credited to your winnings balance. Withdrawals can be requested to any valid UPI ID and take up to 24 hours.</p>
              </div>
            </div>
          </div>
        </section>

        {/* 5. FAQ SECTION */}
        <section className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl sm:text-3xl font-black text-white">Frequently Asked Questions</h2>
          </div>

          <div className="space-y-3 max-w-3xl mx-auto">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                className="bg-white/5 backdrop-blur-md rounded-2xl p-5 border border-white/10 cursor-pointer hover:bg-white/10 transition-colors"
              >
                <div className="flex items-center justify-between font-black text-slate-200 text-sm">
                  <span>{faq.q}</span>
                  <HelpCircle className={`w-5 h-5 text-indigo-400 shrink-0 transition-transform ${activeFaq === idx ? 'rotate-180 text-white' : ''}`} />
                </div>
                {activeFaq === idx && (
                  <div className="mt-4 text-xs text-slate-300 leading-relaxed pt-4 border-t border-white/10">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* FOOTER */}
        <footer className="pt-10 pb-4 mt-10 border-t border-white/10 text-center text-xs text-slate-500 font-medium">
          <p>© 2026 Play2Earn Esports. All rights reserved. BGMI & Free Fire Tournament Platforms.</p>
        </footer>

      </div>
    </div>
  )
}

